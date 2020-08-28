const User = require("../models/user");
const APIError = require("../utils/APIError");
const jwt = require("jsonwebtoken");
exports.isAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(new APIError("Auth token is required", 400));
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return next(new APIError("Auth token is not valid", 400));
    }

    if (user.status === "pending" || user.status === "suspended") {
      return next(new APIError("Auth token is not valid", 400));
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    return next(new APIError("something is went wrong!", 500));
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  const role = req.user.role;
  if (!roles.includes(role)) {
    return next(new APIError("You dont have permission for this route", 400));
  }
  next();
};
