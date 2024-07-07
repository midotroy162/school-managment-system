module.exports = class Student { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config                = config;
        this.cortex                = cortex;
        this.validators            = validators; 
        this.mongomodels           = mongomodels;
        this.tokenManager          = managers.token;
        this.studentsCollection    = "students";
        // this.userExposed           = ['createUser'];
        this.httpExposed = [
            'post=createStudent',
            'get=getStudent',
            'get=getStudentsInSchool',
            'delete=deleteStudent',
            'put=updateStudent',
            'post=addStudentToClassroom',
            'post=removeStudentFromClassroom'
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
    async getStudentByEmail(email) {
        try {
            let student = await this.mongomodels.Student.findOne(email);
            if (student) return false;
            return true;            

        }catch (error) {
            return {error:"faild to check student"}
        }  
    }
    async getStudentById(id) {
        try {
            let student = await this.mongomodels.Student.findById(id);
            if (!student) return {error:"no student with this id"};
            return student;
        }catch (error) {
            return {error:"faild to get student"}
        }  
    }
    async getStudent({__longToken,id}) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let student = await this.mongomodels.Student.findById(id);
            if (!student) return {error:"no student with this id"};
            return student;
                        

        }catch (error) {
            return {error:"faild to get student"}
        }  
    }
    async createStudent({ __longToken,name,email,phone}) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let student = { studentName: name, email: email, phone: phone,school:schoolAdmin.school };
            let checkStudent=await this.getStudentByEmail({email:email})
            if (!checkStudent) return { error: "email is exist" };
            let newStudent = await this.mongomodels.Student.create(student);
            return {newStudent};
        }catch (error) {
            return { error: "faild to create student " + console.log(error) };
        }            
    }
    async getStudentsInSchool({__longToken}) {
        try {
           let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" }; 
            
            let students = await this.mongomodels.Student.find({ school: schoolAdmin.school });
            console.log(schoolAdmin.school);
            if(!students)return { error: "no students for your school" }; 
            return {
                students
            };
        } catch (error) {
            return {error:"faild to get classrooms"}
        }  
    }

    async updateStudent({ __longToken, id,name,phone }) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let student = await this.getStudentById(id);
            console.log(student);
            if (!student) return { error: "faild to get student" };
            if (student.school === schoolAdmin.school) {
                let newUpdatedStudent = await this.mongomodels.Student.findByIdAndUpdate(id,
                    {
                        studentName: name,
                        phone:phone
                    },
                    { new: true });
                return { newUpdatedStudent };
            } else {
                return { error: "you must belong to school" };
            }
        }catch (error) {
            return { error: "faild to update user" };
        }  
    }
     async deleteStudent({ __longToken, id }) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin)
                return { error: "Unauthorized for super admin" };
            let student = await this.getStudentById(id);
            if (!student)
                return { error: "faild to get classroom" };
            if (student.school === schoolAdmin.school) {
                return await this.mongomodels.Student.findByIdAndDelete(id); 
            }else {
                return {error: "you must belong to school"}
            }
        }catch (error) {
            return {error:"faild to delete student"}
        }  
    }
    async addStudentToClassroom({ __longToken, email, className }) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let classroom = await this.mongomodels.Classroom.findOne({ name: className }); 
            if (!classroom) return { error: 'no classroom with that name' }
            let student = await this.mongomodels.Student.findOne({ email: email }); 
            if (!student) return { error: 'no student with that email' };
            //check if student in classroom
            if (classroom.students.includes(student._id))
                return { error: ' student already is classroom in school' };
            classroom.students.push(student._id);
            await this.mongomodels.Student.findByIdAndUpdate(student._id,{
                school:className
            },{new: true});
            await classroom.save();
            return{message:'added student to classroom'}
        }catch (error) {
            return {error:"faild to add student to classroom"}
        }  
    }
    async removeStudentFromClassroom({ __longToken, email, className }) {
        try {
            let schoolAdmin = await this.checkSchoolAdmin(__longToken.userId);
            if (!schoolAdmin) return { error: "Unauthorized for super admin" };
            let classroom = await this.mongomodels.Classroom.findOne({ name: className });
            if (!classroom) return { error: 'no classroom with that name' }
            let student = await this.mongomodels.Student.findOne({ email: email });
            if (!student) return { error: 'no student with that email' };
            if (classroom.students && classroom.students.length > 0) {
                // Find the index of the user 
                const index = classroom.students.findIndex(admin => admin.equals(student._id));
                if (index !== -1) {
                    // Remove the user from the admins array
                    classroom.students.splice(index, 1);
                    await this.mongomodels.Student.findByIdAndUpdate(student._id,{
                school:"Null"
            },{new: true});
                    await classroom.save();
                    return { message: "student removed from classroom successfully." };
                } else {
                    throw new Error("User is not an student of this classroom.");
                }

            }
        } catch (error) {
            return {error:"faild to remove student from classroom"}
        }
    }
}
