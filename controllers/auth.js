const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const APIError = require("../utils/APIError");
const gravatar = require("gravatar");
const User = require("../models/user");
const crypto = require("crypto");
const Profile = require("../models/profile");
const validator = require("validator");

exports.postSignup = async (req, res, next) => {
  try {
    const { email, username, password, fname, lname } = req.body;

    if (
      !validator.isEmail(email) ||
      !username ||
      !password ||
      !fname ||
      !lname
    ) {
      return next(
        new APIError(
          "All fields are required [email,username,password,fname,lname]",
          400
        )
      );
    }
    let user = await User.findOne({ email });
    if (user) {
      return next(new APIError("User already exist with this email", 400));
    }
    const regex = /^[A-Za-z0-9]+$/;
    const validUsernameChecker = regex.test(username);
    if (!validUsernameChecker) {
      return next(
        new APIError("username does not contain special character!", 400)
      );
    }
    user = await User.findOne({ username });
    if (user) {
      return next(new APIError("user already exist with this username", 400));
    }

    const photo = gravatar.url(email, { s: "200", r: "pg", d: "retro" });
    const emailConfirmToken = crypto.randomBytes(32).toString("hex");
    user = new User({
      email,
      username,
      password,
      photo,
      fname,
      lname,
      emailConfirmToken,
    });
    // const profile = new Profile({ user: user.id });
    // user.profile = profile.id;
    // await profile.save();
    await user.save();
    return res.status(201).send({
      status: "success",
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(new APIError("Something is went Wrong!", 500));
  }
};

exports.getEmailConfirm = async (req, res, next) => {
  try {
    const { email, token } = req.query;
    if (!email || !token) {
      return next(new APIError("Email and token is not valid", 400));
    }
    const user = await User.findOne({ email, emailConfirmToken: token });
    if (!user) {
      return next(new APIError("Email and token is not valid", 400));
    }
    if (user.status === "active") {
      return next(new APIError("Email is already verified", 400));
    }
    user.status = "active";
    user.emailConfirmToken = null;
    await user.save();
    return res
      .status(200)
      .send({ status: "success", message: "Email confirmed succefully!" });
  } catch (error) {
    next(new APIError("Something is went Wrong!", 500));
  }
};

exports.resetPasswordTokenGenerate = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return next(new APIError("Please provide valid email", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError("No Email found", 400));
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    return res.status(200).send({
      status: "success",
      message: "password reset link sended successfully!",
    });
  } catch (error) {
    return next(new APIError("Something is went Wrong!", 500));
  }
};

exports.verifyPasswordResetToken = async (req, res, next) => {
  try {
    const { email, token } = req.query;
    if (!email || !token || !validator.isEmail(email)) {
      return next(new APIError("your email or token is not valid!", 400));
    }
    const user = await User.findOne({
      email,
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new APIError("your email or token is not valid!", 400));
    }
    return res
      .status(200)
      .send({ status: "success", message: "token is valid!" });
  } catch (error) {
    return next(new APIError("something is went wrong!", 500));
  }
};

exports.passwordResetSet = async (req, res, next) => {
  const { email, token } = req.query;
  const { password } = req.body;
  if (!email || !token || !validator.isEmail(email)) {
    return next(new APIError("your email or token is not valid!", 400));
  }
  const user = await User.findOne({
    email,
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new APIError("your email or token is not valid!", 400));
  }
  user.password = password;
  await user.save();
  return res
    .status(200)
    .send({ status: "success", message: "password reset successfully!" });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return next(new APIError("Username is required for the login", 400));
    }
    if (!password) {
      return next(new APIError("password is required for the login", 400));
    }

    const user = await User.findOne({ username });
    if (!user) {
      return next(new APIError("credential details are wrong!", 400));
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return next(new APIError("credential details are wrong!", 400));
    }
    if (user.status === "pending") {
      return next(new APIError("your email confirmation is pending!", 400));
    }
    if (user.status === "suspended") {
      return next(new APIError("your account is suspended!", 400));
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    return res.status(200).send({
      status: "success",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(new APIError("Something is went wrong!", 500));
  }
};
