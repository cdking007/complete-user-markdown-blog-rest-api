const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Profile = require("./profile");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "root"],
      default: "user",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "pending", "suspended"],
      default: "pending",
    },
    passwordChangedDate: {
      type: Date,
      default: Date.now(),
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpires: {
      type: Date,
    },
    emailConfirmToken: {
      type: String,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.passwordChangedDate;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetTokenExpires;
  delete userObject.emailConfirmToken;
  return userObject;
};

// before saving the data we creating the social links
userSchema.pre("save", async function (next) {
  if (!this.profile) {
    const profile = new Profile({ user: this._id });
    this.profile = profile._id;
    await profile.save();
    next();
  } else {
    console.log("i am calling");
    next();
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
