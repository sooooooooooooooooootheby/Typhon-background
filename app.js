// 记录启动服务器的时间
const start = Date.now();

const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');

const port = 4000;

// 修改请求体大小
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
// Cors 跨域
// cross-domain
app.use(cors());
// Body 解析中间件
// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 文章路由
const postRouter = require("./router/postRouter.js");
app.use("/api", postRouter);
// 邮箱路由
const emailRouter = require("./router/emailRouter.js");
app.use("/api", emailRouter);
// 用户路由
const userRouter = require("./router/userRouter.js");
app.use("/api", userRouter);
// 上传路由
const uploadRouter = require("./router/uploadRouter.js");
app.use("/api", uploadRouter);

// 计算完成启动服务器的时间
const timeTaken = Date.now() - start;

app.listen(port, () => {
    console.log("");
    console.log(`⏱️ready in ${timeTaken}ms⏱️  👋🏼back-end from sooooooooooooooooootheby`);
    console.log("");
    console.log(`\x1b[43;30m 🔨ServerListen🪚 \x1b[41;37m  🌈  The service is started and listening on port ${port} \x1b[0m`);
    console.log("");
});
