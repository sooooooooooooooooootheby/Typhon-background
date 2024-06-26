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
// 升级状态
router.post("/updateStatus", verifyToken, userConnection.updateStatus);
// 更新用户信息
router.post("/updateUserInfo", verifyToken, userConnection.updateUserInfo);
// 找回密码
router.post("/setPassword", userConnection.setPassword);
// 更新邮箱
router.post("/updateEmail", verifyToken, userConnection.updateEmail);
// 更新密码
router.post("/updatePassword", verifyToken, userConnection.updatePassword);
// 注销账户
router.post("/deleteUser", verifyToken, userConnection.deleteUser);

// 获取用户信息
router.get("/getUserInfo", verifyToken, userConnection.getUserInfo);
// 获取新注册的用户
router.get("/getNewUser", userConnection.getNewUser);
// 查询用户名和邮箱是否存在
router.get("/selectUsernameEmail", userConnection.selectUsernameEmail)

module.exports = router;
