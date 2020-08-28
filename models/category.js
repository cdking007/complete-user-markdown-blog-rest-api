const mongoose = require("mongoose");
const slugify = require("slugify");
const Schema = mongoose.Schema;
const categorySchema = new Schema(
  {
    title: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
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

categorySchema.pre("save", function (next) {
  this.title = slugify(this.title, { lower: true, strict: true });
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
