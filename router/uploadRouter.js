const express = require("express");
const router = express.Router();
// 控制器
const uploadConnection = require("../connection/uploadConnection.js");
// 中间件
const { verifyToken, upload } = require("../middleware.js");

router.post("/uploadImage", verifyToken, upload.array('image'), uploadConnection.uploadImage);

module.exports = router;
