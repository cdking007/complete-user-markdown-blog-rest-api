const APIError = require("../utils/APIError");
const APIFeature = require("../utils/APIFeatures");

exports.getAllDataFromModule = (Model) => async (req, res, next) => {
  try {
    const query = new APIFeature(Model.find(), req.query)
      .filter()
      .paginate()
      .limitFields()
      .sort();
    const docs = await query.query;
    return res.status(200).send({
      status: "success",
      results: docs.length,
      data: {
        docs,
      },
    });
  } catch (error) {
    next(new APIError("SOmething is went wrong!", 500));
  }
};
