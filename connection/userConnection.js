const db = require("../database/database.js");
const fs = require("fs");
const jsYaml = require("js-yaml");
const Base64 = require("crypto-js/enc-base64");
const sha256 = require("crypto-js/sha256");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// 公共方法
const publicFunction = require("../function.js");
const { log } = require("console");

// 读取配置文件
const fileContents = fs.readFileSync("./config.yaml", "utf8");
const config = jsYaml.load(fileContents);

// 注册
exports.register = (req, res) => {
    const { email, code, username, password } = req.body;

    // 非空、格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !code || !username || !password || !emailRegex.test(email)) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 邮箱验证
    const verifyEmail = `SELECT email FROM user WHERE email = ?`;
    db.query(verifyEmail, [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length > 0) {
            return res.status(200).json({ code: 0, message: "邮箱已被注册" });
        }

        // 验证码验证
        // 判断验证码是否为纯数字
        let numCode = null;
        let mixCode = null;
        if (/^\d+$/.test(code)) {
            numCode = code;
        } else {
            mixCode = code;
        }
        const verifyCodeStr = `SELECT * FROM code WHERE email = ?`;
        db.query(verifyCodeStr, [email], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if ((numCode && numCode !== results[0].numCode) || (mixCode && mixCode !== results[0].mixCode)) {
                return res.status(200).json({ code: 0, message: "验证码错误" });
            }

            // 用户名密码格式验证
            const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
            if (!usernameRegex.test(username)) {
                return res.status(200).json({ code: 0, message: "用户名必须由3到16个字符组成，允许使用字母、数字、下划线和破折号。" });
            }

            // 检查用户名冲突
            const verifyUsernameStr = `SELECT username FROM user WHERE username = ?`;
            db.query(verifyUsernameStr, [username], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ code: 0, message: "服务器错误" });
                }

                if (results.length > 0) {
                    return res.status(200).json({ code: 0, message: "用户名已被注册" });
                }

                // 生成随机名字和头像，对密码进行加盐哈希加密
                const name = "用户" + publicFunction.generateRandomString(10);
                const head = publicFunction.generateRandomHead();
                let saltPassword = username + password + "typhon";
                saltPassword = Base64.stringify(sha256(saltPassword));

                // 用户信息写入数据库
                const registerStr = `INSERT INTO user (username, password, email, name, head) VALUES (?, ?, ?, ?, ?)`;
                db.query(registerStr, [username, saltPassword, email, name, head], (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ code: 0, message: "服务器错误" });
                    }

                    if (results.length === 0) {
                        return res.status(200).json({ code: 0, message: "注册失败，请联系管理员" });
                    }

                    res.status(200).json({ code: 1, message: "注册成功" });
                });
            });
        });
    });
};
// 登录
exports.login = (req, res) => {
    const { username, password } = req.body;

    // 非空、格式验证
    const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
    if (!username || !password || !usernameRegex.test(username)) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 对密码进行加盐哈希加密
    let saltPassword = username + password + "typhon";
    saltPassword = Base64.stringify(sha256(saltPassword));

    // 检查用户名密码是否正确
    const loginStr = `SELECT uid, username, password FROM user WHERE username = ? AND password = ?`;
    db.query(loginStr, [username, saltPassword], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "账号或密码错误" });
        }

        // 生成令牌并保存
        const accessToken = jwt.sign({ username: username, uid: results[0].uid }, config.token.accessTokenKey, { expiresIn: config.token.accessTokenOutTime });
        const refreshToken = jwt.sign({}, config.token.refreshTokenKey, { expiresIn: config.token.refreshTokenOutTime });

        const saveRefreshToken = `INSERT INTO refresh_token VALUES (?, ?, ?)`;
        db.query(saveRefreshToken, [refreshToken, results[0].uid, username], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(200).json({ code: 0, message: "登录失败，请联系管理员" });
            }

            res.status(200).json({ code: 1, message: "登录成功", accessToken, refreshToken });
        });
    });
};
// 登出
exports.logout = (req, res) => {
    const { uid } = req.user;
    const sqlStr = `DELETE FROM refresh_token WHERE uid = ?`;
    db.query(sqlStr, uid, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "登出失败，请联系管理员" });
        }

        res.status(200).json({ code: 1, message: "登出成功" });
    });
};
// 更新accessToken
exports.updateAccessToken = (req, res) => {
    const { refreshToken } = req.body;

    // 查询refreshToken状态
    const selectRefreshToken = `SELECT * FROM refresh_token WHERE refresh_token = ?`;
    db.query(selectRefreshToken, [refreshToken], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "refreshToken已过期" });
        }

        // 生成令牌并保存
        const accessToken = jwt.sign({ username: results[0].username, uid: results[0].uid }, config.token.accessTokenKey, { expiresIn: config.token.accessTokenOutTime });
        const newRefreshToken = jwt.sign({}, config.token.refreshTokenKey, { expiresIn: config.token.refreshTokenOutTime });

        const updateRefreshToken = `UPDATE refresh_token SET refresh_token = ? WHERE refresh_token = ?`;
        db.query(updateRefreshToken, [newRefreshToken, refreshToken], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(200).json({ code: 0, message: "更新失败，请联系管理员" });
            }

            res.status(200).json({ code: 1, message: "更新成功", accessToken, newRefreshToken });
        });
    });
};
// 升级状态
exports.updateStatus = (req, res) => {
    const { uid } = req.user;
    const { status } = req.body;

    // 检查状态
    if (!["Pro Lite", "Pro Max", "Pro Ultra"].includes(status)) {
        return res.status(200).json({ code: 0, message: "状态不合法" });
    }

    // 检查用户状态
    const verifyStatus = `SELECT status FROM user WHERE uid = ?`;
    db.query(verifyStatus, [uid], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "用户错误" });
        }

        if (results[0].status === status) {
            return res.status(200).json({ code: 0, message: "您已是" + status + "身份了" });
        }

        const updateStatus = `UPDATE user SET status = ? WHERE uid = ?`;
        db.query(updateStatus, [status, uid], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(200).json({ code: 0, message: "升级失败，请联系管理员" });
            }

            res.status(200).json({ code: 1, message: "升级成功" });
        });
    });
};
// 更新用户信息
exports.updateUserInfo = (req, res) => {
    const { uid } = req.user;
    const { background_image, head, name, introduction, place, website } = req.body;

    // 非空检测
    if (!name) {
        return res.status(200).json({ code: 0, message: "客户端数据错误" });
    }

    let sqlStr = `UPDATE user SET name = ?, introduction = ?, place = ?, website = ? WHERE uid = ?`;
    let params = [name, introduction, place, website, uid];

    function uploadDate(sqlStr, params) {
        db.query(sqlStr, params, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            res.status(200).json({ code: 1, message: "更新成功" });
        });
    }

    if (background_image) {
        // 只有背景的情况
        sqlStr = `UPDATE user SET background_image = ?, name = ?, introduction = ?, place = ?, website = ? WHERE uid = ?`;
        params = [background_image, ...params];
        uploadDate(sqlStr, params);
        return;
    }

    if (head) {
        // 只有头像的情况
        sqlStr = `UPDATE user SET head = ?, name = ?, introduction = ?, place = ?, website = ? WHERE uid = ?`;
        params = [head, ...params];
        uploadDate(sqlStr, params);
        return;
    }

    if (background_image && head) {
        // 背景和头像都有的情况
        sqlStr = `UPDATE user SET background_image = ?, head = ?, name = ?, introduction = ?, place = ?, website = ? WHERE uid = ?`;
        params = [background_image, head, ...params];
        uploadDate(sqlStr, params);
        return;
    }
};
// 找回密码
exports.setPassword = (req, res) => {
    const { retrieve, code, password } = req.body;

    let type = "email";
    const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
    if (usernameRegex.test(this.retrieve)) {
        type = "username";
    }
    let selectUserStr;
    let setPasswordStr;
    if (type === "username") {
        selectUserStr = `SELECT username, email FROM user WHERE username = ?`;
        setPasswordStr = `UPDATE user SET password = ? WHERE username = ?`;
    } else if (type === "email") {
        selectUserStr = `SELECT username, email FROM user WHERE email = ?`;
        setPasswordStr = `UPDATE user SET password = ? WHERE email = ?`;
    }

    // 查询用户
    db.query(selectUserStr, [retrieve], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "找不到用户" });
        }

        // 对密码进行加盐哈希加密
        let saltPassword = results[0].username + password + "typhon";
        saltPassword = Base64.stringify(sha256(saltPassword));

        // 验证码验证
        // 判断验证码是否为纯数字
        let numCode = null;
        let mixCode = null;
        if (/^\d+$/.test(code)) {
            numCode = code;
        } else {
            mixCode = code;
        }
        const verifyCodeStr = `SELECT * FROM code WHERE email = ?`;
        db.query(verifyCodeStr, [results[0].email], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if ((numCode && numCode !== results[0].numCode) || (mixCode && mixCode !== results[0].mixCode)) {
                return res.status(200).json({ code: 0, message: "验证码错误" });
            }

            // 设置密码
            db.query(setPasswordStr, [saltPassword, retrieve], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ code: 0, message: "服务器错误" });
                }

                if (results.length === 0) {
                    return res.status(200).json({ code: 0, message: "设置失败，请联系管理员" });
                }

                res.status(200).json({ code: 1, message: "设置成功" });
            });
        });
    });
};
// 更新邮箱
exports.updateEmail = (req, res) => {
    const { uid } = req.user;
    const { email, code } = req.body;

    // 非空、格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 邮箱验证
    const verifyEmail = `SELECT email FROM user WHERE email = ?`;
    db.query(verifyEmail, [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length > 0) {
            return res.status(200).json({ code: 0, message: "邮箱已存在" });
        }

        // 验证码验证
        // 判断验证码是否为纯数字
        let numCode = null;
        let mixCode = null;
        if (/^\d+$/.test(code)) {
            numCode = code;
        } else {
            mixCode = code;
        }
        const verifyEmail = `SELECT numCode, mixCode FROM code WHERE email = ?`;
        db.query(verifyEmail, [email], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(200).json({ code: 0, message: "邮箱错误，请重新输入邮箱" });
            }

            if ((numCode && numCode !== results[0].numCode) || (mixCode && mixCode !== results[0].mixCode)) {
                return res.status(200).json({ code: 0, message: "验证码错误" });
            }

            const updateEmail = `UPDATE user SET email = ? WHERE uid = ?`;
            db.query(updateEmail, [email, uid], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ code: 0, message: "服务器错误" });
                }

                return res.status(200).json({ code: 1, message: "更新成功" });
            });
        });
    });
};
// 更新密码
exports.updatePassword = (req, res) => {
    const { username } = req.user;
    const { oldPassword, newPassword } = req.body;

    // 非空验证
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 对密码进行加盐哈希加密
    let saltOldPassword = username + oldPassword + "typhon";
    saltOldPassword = Base64.stringify(sha256(saltOldPassword));
    let saltNewPassword = username + newPassword + "typhon";
    saltNewPassword = Base64.stringify(sha256(saltNewPassword));

    // 旧密码验证
    const selectOldPassword = `SELECT password FROM user WHERE username = ?`;
    db.query(selectOldPassword, [username], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "用户不存在，请重新登录" });
        }

        if (results[0].password != saltOldPassword) {
            return res.status(200).json({ code: 0, message: "旧密码错误" });
        }

        // 设置密码
        const setPasswordStr = `UPDATE user SET password = ? WHERE username = ?`;
        db.query(setPasswordStr, [saltNewPassword, username], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(200).json({ code: 0, message: "修改失败，请联系管理员" });
            }

            res.status(200).json({ code: 1, message: "修改成功" });
        });
    });
};
// 注销账户
exports.deleteUser = (req, res) => {
    const { username, uid } = req.user;
    const { email, password } = req.body;

    // 非空、格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || !password) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 对密码进行加盐哈希加密
    let saltPassword = username + password + "typhon";
    saltPassword = Base64.stringify(sha256(saltPassword));

    // 检查邮箱密码是否正确
    const loginStr = `SELECT uid FROM user WHERE email = ? AND password = ?`;
    db.query(loginStr, [email, saltPassword], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "账号或密码错误" });
        }

        // 删除用户的文章
        const deletePost = `DELETE FROM post WHERE uid = ?`;
        db.query(deletePost, [uid], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            // 删除用户的评论
            const deletePost = `DELETE FROM comment WHERE uid = ?`;
            db.query(deletePost, [uid], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ code: 0, message: "服务器错误" });
                }

                // 删除用户的token
                const deletePost = `DELETE FROM refresh_token WHERE uid = ?`;
                db.query(deletePost, [uid], (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ code: 0, message: "服务器错误" });
                    }

                    // 删除用户的数据
                    const deleteUser = `DELETE FROM user WHERE uid = ?`;
                    db.query(deleteUser, [uid], (err, results) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ code: 0, message: "服务器错误" });
                        }

                        return res.status(200).json({ code: 1, message: "注销成功" });
                    });
                });
            });
        });
    });
};

// 获取用户信息
exports.getUserInfo = (req, res) => {
    const { user, query } = req;
    const { username } = user || query;

    // 查询
    const sqlStr = `
SELECT
    u.uid,
    u.username,
    u.email,
    u.name,
    u.background_image,
    u.head,
    u.introduction,
    u.place,
    u.website,
    u.status,
    u.create_time,
    COUNT(DISTINCT l.lid) AS like_count,
    COUNT(DISTINCT p.pid) AS post_count
FROM
    user u
LEFT JOIN likes l ON u.uid = l.uid
LEFT JOIN post p ON u.uid = p.uid
WHERE
    u.username = ?
GROUP BY
    u.uid;
    `;
    db.query(sqlStr, [username], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        res.status(200).json({ code: 1, results });
    });
};
// 获取新注册的用户
exports.getNewUser = (req, res) => {
    const sqlStr = `SELECT username, name, head FROM user ORDER BY create_time DESC LIMIT 5`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        res.status(200).json({ code: 1, results });
    });
};
// 查询用户名和邮箱是否存在
exports.selectUsernameEmail = (req, res) => {
    const { retrieve } = req.query;

    let type = "email";
    const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
    if (usernameRegex.test(this.retrieve)) {
        type = "username";
    }
    let sqlStr;
    if (type === "username") {
        sqlStr = `SELECT username, email FROM user WHERE username = ?`;
    } else if (type === "email") {
        sqlStr = `SELECT username, email FROM user WHERE email = ?`;
    }

    db.query(sqlStr, [retrieve], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "找不到用户" });
        }

        try {
            const response = await axios.post("http://127.0.0.1:4000/api/sendRetrieveEmail", { email: results[0].email });

            let emailNamehead = results[0].email.split("@")[0].substring(0, 2);
            let emailName = results[0].email.split("@")[0].substring(2);
            emailNameStars = "";
            for (let i = 0; i < emailName.length; i++) {
                emailNameStars += "*";
            }

            let emailSuffix1head = results[0].email.split("@")[1].split(".")[0].substring(0, 1);
            let emailSuffix1 = results[0].email.split("@")[1].split(".")[0].substring(1);
            let emailSuffix2head = results[0].email.split("@")[1].split(".")[1].substring(0, 1);
            let emailSuffix2 = results[0].email.split("@")[1].split(".")[1].substring(1);
            emailSuffixStarsStart = "";
            emailSuffixStarsEnd = "";
            for (let i = 0; i < emailSuffix1.length; i++) {
                emailSuffixStarsStart += "*";
            }
            for (let i = 0; i < emailSuffix2.length; i++) {
                emailSuffixStarsEnd += "*";
            }

            let hideEmail = emailNamehead + emailNameStars + "@" + emailSuffix1head + emailSuffixStarsStart + "." + emailSuffix2head + emailSuffixStarsEnd;

            res.status(200).json({ code: 1, message: `查询到${results.length}个用户`, hint: `验证码将发送到${hideEmail}邮箱` });
        } catch (err) {
            console.log(err);
        }
    });
};
