const express = require("express");
const router = express.Router();
// 控制器
const postConnection = require("../connection/postConnection.js");
// 中间件
const { verifyToken, upload } = require("../middleware.js");

// 首页获取文章
router.get("/getPost", verifyToken, postConnection.getPost);
// 用户页获取用户文章
router.get("/getUserPost", verifyToken, postConnection.getUserPost);
// 用户页获取用户喜欢
router.get("/getUserLike", verifyToken, postConnection.getUserLike);
// 获取文章详细
router.get("/getPostDetail", verifyToken, postConnection.getPostDetail);
// 获取文章评论
router.get("/getPostComment", postConnection.getPostComment);

// 发布文章
router.post("/publishPost", verifyToken, upload.single("cover"), postConnection.publishPost);
// 点赞
router.post("/like", verifyToken, postConnection.like);
// 取消点赞
router.post("/unlike", verifyToken, postConnection.unlike);
// 用户评论
router.post("/comment", verifyToken, postConnection.comment)

module.exports = router;
