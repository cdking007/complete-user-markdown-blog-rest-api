const APIError = require("../utils/APIError");
const Category = require("../models/category");
const { filterObj } = require("../utils/filterObjects");
exports.createCategory = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const regex = /^[A-Za-z0-9\-]+$/;
    const validCategorynameChecker = regex.test(title);
    if (!validCategorynameChecker) {
      return next(
        new APIError("category does not contain special character!", 400)
      );
    }
    if (!title) {
      return next(new APIError("title is required!", 400));
    }
    let category = await Category.findOne({ title });
    if (category) {
      return next(
        new APIError("category with this title is already exists!", 400)
      );
    }
    category = new Category({ title, description });
    await category.save();
    return res.status(200).send({ status: "success", data: { category } });
  } catch (error) {
    console.log(error);
    next(new APIError("something is went wrong!", 500));
  }
};

exports.getAllCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    return res.status(200).send({ status: "success", data: { categories } });
  } catch (error) {
    return next(new APIError("something is went wrong!", 400));
  }
};

exports.getCategoryByTitle = async (req, res, next) => {
  const category = await Category.findOne({ title: req.params.title });
  if (!category) {
    return next(new APIError("no category found with this title"));
  }
  return res.status(200).send({ status: "success", data: { category } });
};

exports.getCategoryById = async (req, res, next) => {
  const category = await Category.findOne({ _id: req.params.id });
  if (!category) {
    return next(new APIError("no category found with this id"));
  }
  return res.status(200).send({ status: "success", data: { category } });
};

exports.updateCategoryById = async (req, res, next) => {
  const regex = /^[A-Za-z0-9\-]+$/;
  const validCategorynameChecker = regex.test(req.body.title);
  if (!validCategorynameChecker) {
    return next(
      new APIError("category does not contain special character!", 400)
    );
  }
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id },
    filterObj(req.body, "title", "description"),
    { new: true, runValidators: true }
  );
  if (!category) {
    return next(new APIError("no category found with this id"));
  }
  return res.status(200).send({ status: "success", data: { category } });
};

exports.deleteCategoryById = async (req, res, next) => {
  const category = await Category.findOneAndRemove({ _id: req.params.id });
  if (!category) {
    return next(new APIError("no category found with this id"));
  }
  return res.status(204).send({ status: "success" });
};
