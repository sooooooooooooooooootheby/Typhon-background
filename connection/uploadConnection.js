const fs = require("fs");
const COS = require("cos-nodejs-sdk-v5");
const jsYaml = require("js-yaml");

// 公共方法
const publicFunction = require("../function.js");

// 读取配置文件
const fileContents = fs.readFileSync("./config.yaml", "utf8");
const config = jsYaml.load(fileContents);
// 配置cos
const cos = new COS({
    SecretId: config.cos.SecretId,
    SecretKey: config.cos.SecretKey,
});

// 上传图片
exports.uploadImage = (req, res) => {
    const { username, uid } = req.user;
    let { imageType } = req.body;

    // 读取中间件获取的图片
    fs.readFile("./cache/" + req.files[0].filename, (err, data) => {
        if (err) {
            console.log("读取失败" + err);
            return;
        }

        // 上传cos
        const suffix = req.files[0].filename.split(".")[1];
        let cosFilename = uid + username;
        if (imageType === "postCover") {
            cosFilename = cosFilename + publicFunction.generateRandomString(10) + "." + suffix;
            imageType = imageType + "/" + uid + username;
        } else {
            cosFilename = cosFilename + "." + suffix;
        }

        cos.putObject(
            {
                Bucket: config.cos.Bucket,
                Region: config.cos.Region,
                Key: imageType + "/" + cosFilename,
                StorageClass: "STANDARD",
                Body: data,
            },
            function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ code: 0, message: "图片上传失败，请联系管理员" });
                }

                // 删除缓存文件
                fs.unlinkSync("./cache/" + req.files[0].filename);

                const url = "https://" + data.Location;
                res.status(200).json({ code: 1, message: "图片上传成功", url });
            }
        );
    });
};

// 上传用户资料图片
exports.uploadUserInfo_image = (req, res) => {
    const { username, uid } = req.user;

    // 提取解码背景
    const { imageInfo, imageType } = req.body;
    const base64 = imageInfo.dataURL.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(base64, "base64");

    const suffix = imageInfo.fileName.split(".")[1];
    const cosFilename = uid + username + "." + suffix;

    // 上传cos
    cos.putObject(
        {
            Bucket: config.cos.Bucket,
            Region: config.cos.Region,
            Key: imageType + "/" + cosFilename,
            StorageClass: "STANDARD",
            Body: dataBuffer,
        },
        function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "图片上传失败，请联系管理员" });
            }

            const url = "https://" + data.Location;
            res.status(200).json({ code: 1, message: "图片上传成功", url });
        }
    );
};
