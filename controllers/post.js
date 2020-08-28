const APIError = require("../utils/APIError");
const APIFeatures = require("../utils/APIFeatures");
const Post = require("../models/post");
const marked = require("marked");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const domPurify = createDomPurify(new JSDOM().window);
const { filterObj } = require("../utils/filterObjects");

exports.createPost = async (req, res, next) => {
  const {
    title,
    sdescription,
    markdown,
    category,
    coverImage,
    status,
  } = req.body;
  if (!title || !sdescription || !markdown || !category) {
    return next(new APIError("title,short description,markdown,category", 400));
  }
  // this.sanHtmlBody = domPurify.sanitize(marked(this.body));
  console.log("i am executing");
  const html = await domPurify.sanitize(marked(markdown));
  console.log(html);
  const post = new Post({
    title,
    shortDescription: sdescription,
    markdown,
    html,
    creator: req.user.id,
    category,
    coverImage,
    status,
  });
  await post.save();
  //   res.send("ok");
  return res.status(201).send({ status: "success", data: { post } });
};

exports.getAllPosts = async (req, res, next) => {
  const limit = req.query.limit || 20;
  const docs = await Post.find({
    $or: [
      { status: { $ne: "rejected" } },
      { status: { $ne: "draft" } },
      { status: { $ne: "pending" } },
    ],
  }).countDocuments();
  const totalPages = Math.ceil(docs / limit);
  const query = new APIFeatures(
    Post.find({
      $or: [
        { status: { $ne: "rejected" } },
        { status: { $ne: "draft" } },
        { status: { $ne: "pending" } },
      ],
    }),
    req.query
  )
    .paginate()
    .sort()
    .filter()
    .limitFields();
  const posts = await query.query
    .populate({ path: "creator", select: "fname lname photo" })
    .populate({ path: "category", select: "title" });
  return res
    .status(200)
    .send({ status: "success", data: { posts, totalPages } });
};

exports.getSinglePostBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const post = await Post.findOne({ slug })
    .populate({ path: "creator", select: "fname lname photo" })
    .populate({ path: "category", select: "title" });
  if (!post) {
    return next(new APIError("the article you are finding is not found!", 404));
  }
  if (post.status !== "published") {
    return next(new APIError("the article you are finding is not found!", 404));
  }
  return res.status(200).send({
    status: "success",
    data: {
      post,
    },
  });
};
exports.updateSinglePostBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const post = await Post.findOne({ slug });
  const {
    title,
    sdescription,
    markdown,
    category,
    coverImage,
    status,
  } = req.body;
  if (!post) {
    return next(new APIError("the article you are finding is not found!", 404));
  }
  if (post.creator.toString() !== req.user._id.toString()) {
    return next(
      new APIError("you dont have permission to edit someone post", 404)
    );
  }
  post.title = title;
  post.shortDescription = sdescription;
  post.markdown = markdown;
  post.category = category;
  post.coverImage = coverImage;
  post.status = status;
  post.html = await domPurify.sanitize(marked(markdown));
  await post.save();
  return res.status(200).send({
    status: "success",
    message: "post updated successfully",
    data: {
      post,
    },
  });
};

exports.deletePostBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const post = await Post.findOne({ slug });
  if (!post) {
    return next(new APIError("no post found by this slug title"));
  }
  if (post.creator !== req.user.id) {
    return next(
      new APIError("you dont have permission to delete someone post!", 400)
    );
  }
  await post.remove();
  return res
    .status(204)
    .send({ status: "success", message: "post deleted successfully!" });
};
