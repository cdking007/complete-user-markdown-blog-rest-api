const express = require("express");
const { isAuth, restrictTo } = require("../middlewares/auth");
const {
  createCategory,
  deleteCategoryById,
  getAllCategory,
  getCategoryById,
  getCategoryByTitle,
  updateCategoryById,
} = require("../controllers/category");

const router = express.Router();

router
  .route("/")
  .post(isAuth, restrictTo("admin", "root"), createCategory)
  .get(getAllCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .patch(isAuth, restrictTo("admin", "root"), updateCategoryById)
  .delete(isAuth, restrictTo("admin", "root"), deleteCategoryById);
router.route("/find/:title").get(getCategoryByTitle);
module.exports = router;
