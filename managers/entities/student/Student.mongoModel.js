const mongoose = require("mongoose");


const studentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "name require"],
    },
    email: {
      type: String,
      required: [true, "name require"],

    },
    phone: {
      type: String,
    },
    school: {
      type: String,
    },
    classroom: {
      type: String
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("Student", studentSchema);