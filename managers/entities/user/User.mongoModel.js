const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "name require"],
    },
    email: {
      type: String,
      required: [true, "email require"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password required"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    school: {
      type: String,
      required: function () { return !this.isAdmin; },
      default:"Null"
    }
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   // hashing user password
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

module.exports = mongoose.model("User", userSchema);