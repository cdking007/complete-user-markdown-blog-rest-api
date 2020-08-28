const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    twitter: {
      type: String,
    },
    github: {
      type: String,
    },
    facebook: {
      type: String,
    },
    youtube: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
