const db = require("../database/database.js");
const fs = require("fs");
const jsYaml = require("js-yaml");
const nodemailer = require("nodemailer");

// 公共方法
const publicFunction = require("../function.js");

// 读取配置文件
const fileContents = fs.readFileSync("./config.yaml", "utf8");
const config = jsYaml.load(fileContents);

// 配置邮箱
let nodeMail = nodemailer.createTransport({
    service: "qq",
    port: 465,
    secure: true,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

// 发送邮件
exports.sendEmail = (req, res) => {
    const { email } = req.body;

    // 检查请求是否含有邮箱且邮箱格式是否正确
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 检查邮箱是否注册
    const verifyMailStr = `SELECT email FROM user WHERE email = ?`;
    db.query(verifyMailStr, [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length > 0) {
            return res.status(200).json({ code: 0, message: "邮箱已注册" });
        }

        const numCode = String(Math.floor(Math.random() * 1000000)).padEnd(6, "0");
        const mixCode = publicFunction.generateRandomString(10);

        // 将验证码写入数据库
        const saveCodeStr = `INSERT INTO code (email, numCode, mixCode) VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            numCode = VALUES(numCode),
                            mixCode = VALUES(mixCode)
                            `;
        db.query(saveCodeStr, [email, numCode, mixCode], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(500).json({ code: 0, message: "数据库错误" });
            }

            // 定时五分钟删除验证码，达到验证码过期效果
            setTimeout(() => {
                const delCodeStr = `DELETE FROM code WHERE email = ?`;
                db.query(delCodeStr, [email], (err, results) => {
                    if (err) {
                        return console.log(err);
                    }
                });
            }, 300000);

            // 发送邮件
            const mail = {
                from: `"from Wonderland"${config.email.user}`,
                subject: "verification code",
                to: email,
                html: `
                    <div>
                        <p style="font-size: 18px; color: #3C3C43;">hi！</p>
                        <p style="font-size: 18px; color: #3C3C43;">your number verification code：<strong style="color: #839376; font-weight: bold;">${numCode}</strong>.</p>
                        <p style="font-size: 18px; color: #3C3C43;">your character string verification code：<strong style="color: #839376; font-weight: bold;">${mixCode}</strong>.</p>
                        <p style="font-size: 18px; color: #3C3C43;">The verification code will expire in 5 minutes</p>
                    </div>
                    `,
            };
            nodeMail.sendMail(mail, (err, info) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ code: 0, message: "验证码发送失败，请联系管理员" });
                }

                res.status(200).json({ code: 1, message: "验证码发送成功" });
            });
        });
    });
};