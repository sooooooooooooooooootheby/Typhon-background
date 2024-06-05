const express = require("express");
const router = express.Router();

// 控制器
const emailConnection = require("../connection/emailConnection.js");

// 发送邮件
router.post("/sendEmail", emailConnection.sendEmail);
// 发送修改密码邮件
router.post("/sendRetrieveEmail", emailConnection.sendRetrieveEmail);

module.exports = router;