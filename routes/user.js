const express = require("express");
const authController = require("../controllers/auth");
const {
  addUser,
  getAllUsers,
  getUserByItsUsernameOrEmail,
  patchUserInfosByUsernameOrEmailOrId,
  deleteUserInfoByUsernameOrEmailOrId,
  updateProfileById,
  updateUserPassword,
  getCurrentUserProfile,
} = require("../controllers/user");
const { isAuth, restrictTo } = require("../middlewares/auth");

const router = express.Router();

// email signup routes
router.post("/signup", authController.postSignup);
router.get("/confirm", authController.getEmailConfirm);
// router.get("/test", isAuth, restrictTo("admin"), (req, res) => {
//   res.send(req.user);
// });

// forget password routes
router.post("/forget", authController.resetPasswordTokenGenerate);
router.get("/foget-verify", authController.verifyPasswordResetToken);
router.post("/forget-setpassword", authController.passwordResetSet);

// login routes
router.post("/login", authController.postLogin);

// admin related routes
router
  .route("/")
  .get(isAuth, restrictTo("admin", "root"), getAllUsers)
  .post(isAuth, restrictTo("admin", "root"), addUser)
  .patch(
    isAuth,
    restrictTo("admin", "root"),
    patchUserInfosByUsernameOrEmailOrId
  )
  .delete(
    isAuth,
    restrictTo("admin", "root"),
    deleteUserInfoByUsernameOrEmailOrId
  );

router.get(
  "/find",
  isAuth,
  restrictTo("admin", "root", getUserByItsUsernameOrEmail),
  getUserByItsUsernameOrEmail
);

/**
 * 🅿🆁🅾🅵🅸🅻🅴 🆁🅾🆄🆃🅴🆂
 * */
router.route("/me/profile").patch(isAuth, updateProfileById);

/**
 * 🆄🆂🅴🆁 🆁🅾🆄🆃🅴🆂
 */
router.get("/me", isAuth, getCurrentUserProfile);
router.patch("/me/password", isAuth, updateUserPassword);

module.exports = router;
