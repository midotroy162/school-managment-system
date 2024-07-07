module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = ['createUser'];
        this.httpExposed         = ['post=createUser','get=getUser','put=updateUser','delete=deleteUserById','post=login'];
        // this.httpExposed         = ['post=createUser','get=getUser','delete=deleteUserByEmail','put=updateUserByEmail','loginUser'];
    }
    
    async createUser({ username, email, password,school="Null" }) {
        try {
            const user = { username, email, password,school };
            
            if (await this.mongomodels.User.findOne({ email: user.email })) {
                return {
                    error: "email is aleardy exist"
                }
            }
            // Data validation
            let result = await this.validators.User.createUser(user);
            if (result) return result;
        
            // Creation Logic
            let createdUser = await this.mongomodels.User.create(user);
            let token = await this.tokenManager.genLongToken({ userId: createdUser._id, userKey: createdUser.key });
            console.log(user.email);
            // Response
            return {
                user: createdUser,
                token
            };
        } catch (error) {
            return {error:'faild to create user'}
        }
    }
    
    async getUserById(userId) {
        return await this.mongomodels.User.findById(userId);
    }
    async getUser({ __longToken }) {
        let userId = __longToken.userId;
        try {
            let user = await this.getUserById(userId);
            if(!user){error:'User Not found'}
            return {user};
        } catch (error) {
            return {error:"faild to get user"}
        }
    }
    async login({ email, password }) {
        try {
            let user = await this.mongomodels.User.findOne({ email: email });
            if (!user || (password != user.password)) return { error: "Incorrect E-mail or Password" };
            let token       =await this.tokenManager.genLongToken({userId: user._id, userKey: user.key });
        
        // Response
        return {
            token
        };
        }catch (error) {
            return {error:"faild to Login"}
        }
    }
    async updateUser({ __longToken, username, password }) {
        try{
            let userId = __longToken.userId;
            let user = await this.getUserById(userId);
            if (!user) return { error: 'User Not found' };
            let newUser = await this.mongomodels.User.findByIdAndUpdate(userId,{
                username: username,
                password: password
            },{new: true});
            return { newUser };
        }catch (error) {
            return {error:"faild to update user"}
        }
    }
    async deleteUserById({ __longToken,id }) {
        try {
            let userId = __longToken.userId;
            let user = await this.getUserById(userId);
            if (!user.isAdmin) { return { error: 'not allowed to you to delete' }; }
            return  await this.mongomodels.User.findByIdAndDelete(id);
        }catch(error) {
            return {error:"faild to delete user"}
        }
    }

}
