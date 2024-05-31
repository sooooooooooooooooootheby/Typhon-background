//
// 这里存放一些使用频率较高的公共函数方法
//

const fs = require("fs");
const jsYaml = require("js-yaml");

// 读取配置文件
const fileContents = fs.readFileSync("./config.yaml", "utf8");
const config = jsYaml.load(fileContents);

// 生成指定长度的英文数字混合字符串
const generateRandomString = function (length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    mixCode = result;
    return result;
};

// 随机头像
const generateRandomHead = function () {
    const data = fs.readFileSync("./defaultHead.json");
    const jsonData = JSON.parse(data);
    const num = Math.floor(Math.random() * 18);
    const head = jsonData[num];
    return head;
};

module.exports = {
    generateRandomString,
    generateRandomHead,
};
