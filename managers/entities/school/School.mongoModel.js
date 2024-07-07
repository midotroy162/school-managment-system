const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name require"],
    },
    classrooms: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Classroom'
    }],
    admins: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);


module.exports = mongoose.model("School", schoolSchema);