module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.schoolsCollection   = "schools";
        // this.schoolExposed        = ['createSchool'];
        this.httpExposed = [
            'post=createSchool',
            'get=getSchools',
            'put=updateSchool',
            'delete=deleteSchool',
            'post=addAdminToSchool',
            'post=removeAdminFromSchool'];
    }
    
    async checkSuperAdmin(userId) {
        try {
            let user = await this.mongomodels.User.findById(userId);
            if (!user) return false ;
            if (!user.isAdmin) return false;
            if(user)return true;

        }catch (error) {
            return {error:"faild to check user"}
        }  
    }
    async createSchool({ __longToken,name}) {
        try {
            const school = { name };
            let checkadmin = await this.checkSuperAdmin(__longToken.userId);
            if (!checkadmin) return { error: "Unauthorized for you" };
            
            // let result = await this.validators.School.createSchool(school);
            // console.log(result);
            // if(result) return result;
            let newSchool = await this.mongomodels.School.create(school);
            return {
                school: newSchool,
                message: "New school added"
            };
        }catch (error) {
            return {error:"faild to create school"}
        }            
    }
    async getSchools({__longToken}) {
        try{
        let checkadmin = await this.checkSuperAdmin(__longToken.userId);
            if (!checkadmin) return { error: "Unauthorized for you" };
            let schools = await this.mongomodels.School.find().populate('admins');
            return {
                schools
            };
        } catch (error) {
            return {error:"faild to get schools"}
        }  
    }
    async getSchoolbyId(id) {
        try {
            let school = await this.mongomodels.School.findById(id);
            return school;
        }catch (error) {
            return {error:"faild to get school"}
        }  
    }
    async updateSchool({ __longToken, id,name }) {
        try {
        let checkadmin = await this.checkSuperAdmin(__longToken.userId);
            if (!checkadmin) return { error: "Unauthorized for you" };
            let school = await this.getSchoolbyId(id);
            if (!school) return { error: "faild to get school" };
            let newUpdatedSchool = await this.mongomodels.School.findByIdAndUpdate(id, { name: name }, { new: true });
            return {newUpdatedSchool};
        }catch (error) {
            return {error:"faild to update school"}
        }  
    }
     async deleteSchool({ __longToken, id }) {
        try {
        let checkadmin = await this.checkSuperAdmin(__longToken.userId);
            if (!checkadmin) return { error: "Unauthorized for you" };
            let school = await this.getSchoolbyId(id);
            if (!school) return { error: "faild to get school" };
            return await this.mongomodels.School.findByIdAndDelete(id); 
        }catch (error) {
            return {error:"faild to delete school"}
        }  
     }
    
    async addAdminToSchool({ __longToken, schoolName, email }) {
        try {
             let checkadmin = await this.checkSuperAdmin(__longToken.userId);
            if (!checkadmin) return { error: "Unauthorized for you" };
            let school = await this.mongomodels.School.findOne({ name: schoolName }); 
            if (!school) return { error: 'no school with that name' }
            let user = await this.mongomodels.User.findOne({ email: email }); 
            if (!user) return { error: 'no user with that email' };
            //check if admin in school
            if (school.admins.includes(user._id))
                return { error: ' user already is admin in school' };
            school.admins.push(user._id);
            await this.mongomodels.User.findByIdAndUpdate(user._id,{
                school:schoolName
            },{new: true});
            await school.save();
            return{message:'added admin to school'}
        }catch (error) {
            return {error:"faild to add admin to school"}
        }  
    }
    async removeAdminFromSchool({ __longToken, schoolName, email }) {
        try {
            let checkadmin = await this.checkSuperAdmin(__longToken.userId);
            if (!checkadmin) return { error: "Unauthorized for you" };
            let school = await this.mongomodels.School.findOne({ name: schoolName });
            if (!school) return { error: 'no school with that name' }
            let user = await this.mongomodels.User.findOne({ email: email });
            if (!user) return { error: 'no user with that email' };
            if (school.admins && school.admins.length > 0) {
                // Find the index of the user 
                const index = school.admins.findIndex(admin => admin.equals(user._id));
                if (index !== -1) {
                    // Remove the user from the admins array
                    school.admins.splice(index, 1);
                    await this.mongomodels.User.findByIdAndUpdate(user._id,{
                school:"Null"
            },{new: true});
                    await school.save();
                    return { message: "Admin removed from school successfully." };
                } else {
                    throw new Error("User is not an admin of this school.");
                }

            }
        } catch (error) {
            return {error:"faild to remove admin from school"}
        }  
    }
}
