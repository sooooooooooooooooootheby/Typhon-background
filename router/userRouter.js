const express = require("express");
const router = express.Router();
// 控制器
const userConnection = require("../connection/userConnection.js");
// 中间件
const { verifyToken } = require("../middleware.js");

// 注册
router.post("/register", userConnection.register);
// 登录
router.post("/login", userConnection.login);
// 登出
router.post("/logout", verifyToken, userConnection.logout);
// 更新AccessToken
router.post("/updateAccessToken", userConnection.updateAccessToken);
// 更新用户信息
router.post("/updateUserInfo", verifyToken, userConnection.updateUserInfo);

// 获取用户信息
router.get("/getUserInfo", verifyToken, userConnection.getUserInfo);
// 获取新注册的用户
router.get("/getNewUser", userConnection.getNewUser);

module.exports = router;
