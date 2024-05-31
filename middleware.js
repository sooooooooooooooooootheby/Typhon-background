//
// 中间件
//

const fs = require("fs");
const jwt = require("jsonwebtoken");
const jsYaml = require("js-yaml");
const multer = require("multer");
const path = require("path");

// 读取配置文件
const fileContents = fs.readFileSync("./config.yaml", "utf8");
const config = jsYaml.load(fileContents);

// token验证中间件
const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        req.user = null;
        next();
        return;
    }

    const tokenParts = req.headers.authorization.split(" ");

    if (tokenParts.length !== 2) {
        return res.status(403).send("Invalid token format.");
    }

    const token = tokenParts[1];

    jwt.verify(token, config.token.accessTokenKey, (err, decoded) => {
        if (err) return res.status(401).send("Invalid token.");
        req.user = decoded;
        next();
    });
};

// 表单上传中间件
let filename = null;
const storage = multer.diskStorage({
    // 保存路径
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "./cache/"));
    },
    // 文件名
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        filename = file.originalname;
    },
});
const upload = multer({ storage: storage });

module.exports = {
    verifyToken,
    upload,
};
