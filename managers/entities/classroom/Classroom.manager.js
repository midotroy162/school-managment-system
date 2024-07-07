module.exports = class Classroom { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.classroomsCollection   = "classrooms";
        // this.schoolExposed        = ['createSchool'];
        this.httpExposed = [
            'post=createClassroom',
            'get=getClassrooms',
            'put=updateClassroom',
            'delete=deleteClassroom',
        ];
    }
    
    async checkSchoolAdmin(userId) {
        try {
            let user = await this.mongomodels.User.findById(userId);
            if (!user) return false ;
            if (user.isAdmin) return false;
            // if (!user.isAdmin) return user;.
            return user;
                        

        }catch (error) {
            return {error:"faild to check user"}
        }  
    }
    async createClassroom({ __longToken, name}) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let schoolName = schoolAdmin.school;
            const classroom = { name,school:schoolName };
    
            let newClassroom = await this.mongomodels.Classroom.create(classroom);
            return {newClassroom};
        }catch (error) {
            return {error:"faild to create classroom"}
        }            
    }
    async getClassrooms({__longToken}) {
        try {
           let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" }; 
            
            let classrooms = await this.mongomodels.Classroom.find({ school: schoolAdmin.school });
            if(classrooms=[])return { error: "no classroom for your school" }; 
            return {
                classrooms
            };
        } catch (error) {
            return {error:"faild to get classrooms"}
        }  
    }
    async getClassroombyId(id) {
        try {
            let classroom = await this.mongomodels.Classroom.findById(id);
            return classroom;
        }catch (error) {
            return {error:"faild to get classroom"}
        }  
    }
    
    async updateClassroom({ __longToken, id,name }) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let classroom = await this.getClassroombyId(id);
            if (!classroom) return { error: "faild to get classroom" };
            if (classroom.school === schoolAdmin.school) {
                let newUpdatedClassroom = await this.mongomodels.Classroom.findByIdAndUpdate(id, { name: name }, { new: true });
                return { newUpdatedClassroom };
            } else {
                return {error: "you must belong to school"}
            }
        }catch (error) {
            return {error:"faild to update classroom"}
        }  
    }
     async deleteClassroom({ __longToken, id }) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin)
                return { error: "Unauthorized for super admin" };
            let classroom = await this.getClassroombyId(id);
            if (!classroom)
                return { error: "faild to get classroom" };
            if (classroom.school === schoolAdmin.school) {
                return await this.mongomodels.Classroom.findByIdAndDelete(id); 
            }else {
                return {error: "you must belong to school"}
            }
        }catch (error) {
            return {error:"faild to delete classroom"}
        }  
    }
}
