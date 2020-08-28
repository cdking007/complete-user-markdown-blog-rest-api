const mongoose = require("mongoose");
const slugify = require("slugify");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    markdown: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    coverImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ["published", "pending", "draft", "rejected"],
      default: "pending",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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

postSchema.pre("save", function (next) {
  if (!this.isModified("title")) {
    return next();
  }
  const slug = slugify(this.title, {
    lower: true,
    strict: true,
  });
  const specialId = Math.floor(1000 + Math.random() * 9000);
  this.slug = `${slug}-${specialId}`;
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
