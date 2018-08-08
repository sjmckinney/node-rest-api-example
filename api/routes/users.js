const express = require("express");
const router = express.Router();

const checkAuth = require("../authentication/check-auth");
const UserController = require("../controllers/users");

router.get("/", checkAuth, UserController.users_get_all);

router.post("/signup", UserController.users_sign_up);

router.post("/login", UserController.users_login);

router.delete("/:userId", checkAuth, UserController.users_delete_user_by_id);

module.exports = router;
