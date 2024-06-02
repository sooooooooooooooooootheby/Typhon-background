const express = require("express");
const router = express.Router();
// 控制器
const uploadConnection = require("../connection/uploadConnection.js");
// 中间件
const { verifyToken, upload } = require("../middleware.js");

// 上传图片
router.post("/uploadImage", verifyToken, upload.array('image'), uploadConnection.uploadImage);
// 上传用户资料图片
router.post("/uploadUserInfo_image", verifyToken, uploadConnection.uploadUserInfo_image);

module.exports = router;
