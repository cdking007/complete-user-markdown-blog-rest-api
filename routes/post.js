const express = require("express");
const { isAuth, restrictTo } = require("../middlewares/auth");
const {
  createPost,
  getAllPosts,
  getSinglePostBySlug,
  updateSinglePostBySlug,
  deletePostBySlug,
} = require("../controllers/post");

const router = express.Router();
router
  .route("/")
  .post(isAuth, restrictTo("user", "admin", "root"), createPost)
  .get(getAllPosts);

router
  .route("/:slug")
  .get(getSinglePostBySlug)
  .patch(isAuth, updateSinglePostBySlug)
  .delete(isAuth, deletePostBySlug);

module.exports = router;
