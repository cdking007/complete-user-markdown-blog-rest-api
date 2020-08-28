const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Profile = require("../models/profile");
const APIError = require("../utils/APIError");
const APIFeatures = require("../utils/APIFeatures");
const { filterObj } = require("../utils/filterObjects");
const { getAllDataFromModule } = require("../factoryHandler/readAll");

// 🅰🅳🅼🅸🅽 🅻🅾🅶🅸🅲🆂
exports.addUser = async (req, res, next) => {
  try {
    const { email, username, password, role, status, fname, lname } = req.body;

    if (
      !email ||
      !username ||
      !password ||
      !role ||
      !status ||
      !fname ||
      !lname
    ) {
      return next(
        new APIError(
          "All fields are required [email,username,password,role,status,fname,lname]",
          400
        )
      );
    }
    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      if (user.email === email) {
        return next(new APIError("User is already exist with this email", 400));
      } else {
        return next(
          new APIError("User is already exist with this username", 400)
        );
      }
    }
    user = new User({
      email,
      username,
      password,
      role,
      status,
      fname,
      lname,
    });
    // const profile = new Profile({ user: user.id });
    // user.profile = profile.id;
    // await profile.save();
    await user.save();
    return res.status(201).send({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    next(new APIError("Something is went wrong!", 500));
  }
};

exports.getAllUsers = getAllDataFromModule(User);
exports.getUserByItsUsernameOrEmail = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    if (!username && !email) {
      return next(
        new APIError("username or email is required to find the user", 400)
      );
    }
    const user = await User.findOne({
      $or: [{ email }, { username }],
    }).populate({
      path: "profile",
    });
    if (!user) {
      return next(new APIError("No user found with this email or username"));
    }
    return res.status(200).send({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new APIError("Something is went wrong!", 500));
  }
};

exports.patchUserInfosByUsernameOrEmailOrId = async (req, res, next) => {
  try {
    // update is updated infos
    const { username, email, id, update } = req.body;
    if (!username && !email && !id) {
      return next(
        new APIError(
          "Email or username or user id is required for the update of the user",
          400
        )
      );
    }
    let user = await User.findOneAndUpdate(
      { $or: [{ email }, { username }, { id }] },
      filterObj(
        update,
        "email",
        "username",
        "status",
        "role",
        "fname",
        "lname"
      ),
      { new: true, runValidators: true }
    );
    return res.status(200).send({ status: "success", data: { user } });
  } catch (error) {
    console.log(error);
    return next(new APIError("something is went wrong!", 500));
  }
};

exports.deleteUserInfoByUsernameOrEmailOrId = async (req, res, next) => {
  try {
    const { email, username, id } = req.body;
    if (!email && !username && !id) {
      return next(
        new APIError(
          "email,username or id any one of them is required to delete the user"
        )
      );
    }
    const user = await User.findOne({
      $or: [{ email }, { username }, { _id: id }],
    });
    if (!user) {
      return next(new APIError("no user found with provided infos", 400));
    }
    const profile = await Profile.findOne({ user: user._id });
    await profile.remove();
    await user.remove();
    return res
      .status(204)
      .send({ status: "Success", message: "user deleted successfully!" });
  } catch (error) {
    return next(new APIError("Something is went wrong!", 500));
  }
};

/**
 * 🅿🆁🅾🅵🅸🅻🅴 🅻🅾🅶🅸🅲🆂
 */

exports.updateProfileById = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      filterObj(req.body, "youtube", "twitter", "facebook", "github"),
      { new: true, runValidators: true }
    );
    if (!profile) {
      return next(new APIError("no profile found!", 400));
    }
    return res.status(200).send({ status: "success", data: { profile } });
  } catch (error) {
    console.log("errors");
    console.log(error);
    return next(new APIError("something is went wrong!", 500));
  }
};

/**
 * 🆄🆂🅴🆁 🅻🅾🅶🅸🅲🆂
 */

exports.updateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return next(new APIError("old password and new password is required"));
    }
    const user = await User.findOne({ _id: req.user._id });
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return next(new APIError("your old password is not valid", 400));
    }
    user.password = await bcrypt.hash(newPassword, 8);
    await user.save();
  } catch (error) {
    return next(new APIError("something is went wrong!", 500));
  }
};

exports.getCurrentUserProfile = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id }).populate("profile");
  return res.status(200).send({ status: "success", data: { user } });
};
