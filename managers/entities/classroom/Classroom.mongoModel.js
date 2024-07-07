const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name require"],
    },
    school: {
      type: String,
    },
    students: [{ type: mongoose.Schema.ObjectId, ref: 'Student'}],
  },
  { timestamps: true }
);



module.exports = mongoose.model("Classroom", classroomSchema);