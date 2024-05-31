const db = require("../database/database.js");
const fs = require("fs");
const COS = require("cos-nodejs-sdk-v5");
const jsYaml = require("js-yaml");

// 读取配置文件
const fileContents = fs.readFileSync("./config.yaml", "utf8");
const config = jsYaml.load(fileContents);
// 配置cos
const cos = new COS({
    SecretId: config.cos.SecretId,
    SecretKey: config.cos.SecretKey,
});

// 首页获取文章
exports.getPost = (req, res) => {
    // 没有登陆
    if (!req.user) {
        const sqlStr = `
                SELECT
	                post.pid,
	                post.post_cover,
	                post.post_content,
	                post.create_time,
	                USER.name,
	                USER.head,
	                USER.username,
                    (SELECT COUNT(*) FROM likes WHERE pid = post.pid) AS like_count,
                    ( SELECT COUNT(*) FROM comment WHERE pid = post.pid ) AS comment_count
                FROM
	                post
	                INNER JOIN USER ON post.uid = USER.uid
                ORDER BY
	                post.create_time DESC
	                LIMIT 1,5;
                `;
        db.query(sqlStr, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            res.status(200).json({ results });
        });

        return;
    }

    // 非空检测
    if (!page || !pageSize) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 登录
    const { uid } = req.user;
    // 计算页数和返回贴子数(页面尺寸)
    let { page, pageSize } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const start = (page - 1) * pageSize;
    const end = pageSize;

    const sqlStr = `
                SELECT
                    post.pid,
                    post.post_cover,
                    post.post_content,
                    post.create_time,
                    user.name,
                    user.head,
                    user.username,
                    (SELECT COUNT(*) FROM likes WHERE pid = post.pid) AS like_count,
                    IFNULL(like_status, 0) AS user_like_status,
                    ( SELECT COUNT(*) FROM comment WHERE pid = post.pid ) AS comment_count
                FROM
                    post
                    INNER JOIN user ON post.uid = user.uid
                    LEFT JOIN (SELECT pid, COUNT(*) AS like_status FROM likes WHERE uid = ? GROUP BY pid) AS user_likes ON post.pid = user_likes.pid
                ORDER BY
                    post.create_time DESC
                    LIMIT ?, ?;
                `;
    db.query(sqlStr, [uid, start, end], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        res.status(200).json({ results });
    });
};
// 用户页获取用户文章
exports.getUserPost = (req, res) => {
    const { uid } = req.user;
    let { page, pageSize } = req.query;

    // 非空检测
    if (!page || !pageSize) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 计算页数和返回贴子数(页面尺寸)
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const start = (page - 1) * pageSize;
    const end = pageSize;

    const sqlStr = `
                SELECT
                	post.pid,
                	post.cover,
                	post.content,
                	post.create_time,
                	user.name,
                	user.username,
                	user.head,
                	( SELECT COUNT(*) FROM comment WHERE pid = post.pid ) AS comment_count,
                	( SELECT COUNT(*) FROM likes WHERE pid = post.pid ) AS like_count,
                	( SELECT COUNT(*) FROM likes WHERE uid = ? AND pid = post.pid ) AS user_like_status
                FROM
                	post
                	INNER JOIN user ON post.uid = user.uid
                WHERE
                	user.uid = ?
                ORDER BY
                	post.create_time DESC
                	LIMIT ?,?;
                `;
    db.query(sqlStr, [uid, uid, start, end], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        res.status(200).json({ results });
    });
};
// 用户页获取用户喜欢
exports.getUserLike = (req, res) => {
    const { uid } = req.user;
    let { page, pageSize } = req.query;

    // 非空检测
    if (!page || !pageSize) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 计算页数和返回贴子数(页面尺寸)
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sqlStr = `
                SELECT
                    post.pid,
                    post.cover,
                    post.content,
                    post.create_time,
                    user.name,
                    user.head,
                    user.username,
                    ( SELECT COUNT(*) FROM comment WHERE pid = post.pid ) AS comment_count,
                    ( SELECT COUNT(*) FROM likes WHERE pid = post.pid ) AS like_count,
                    ( SELECT COUNT(*) FROM likes WHERE uid = ? AND pid = post.pid ) AS user_like_status
                FROM
                    post
                    INNER JOIN likes ON post.pid = likes.pid
                    INNER JOIN user ON post.uid = user.uid
                WHERE
                    likes.uid = ?
                GROUP BY
                    post.pid
                ORDER BY
                    post.create_time DESC
                    LIMIT ?, ?;
                `;
    db.query(sqlStr, [uid, uid, start, end], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        res.status(200).json({ results });
    });
};
// 获取文章详细
exports.getPostDetail = (req, res) => {
    const { uid } = req.user;
    const { pid } = req.query;

    // 非空检测
    if (!pid) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    const sqlPost = `
    SELECT
	post.pid,
	post.cover,
	post.content,
	post.create_time,
	USER.name,
	USER.head,
	USER.username,
    USER.introduction,
	IFNULL( like_status, 0 ) AS user_like_status,
	( SELECT COUNT(*) FROM likes WHERE pid = post.pid ) AS like_count,
    ( SELECT COUNT(*) FROM comment WHERE pid = post.pid ) AS comment_count
FROM
	post
	INNER JOIN USER ON post.uid = USER.uid
	LEFT JOIN ( SELECT pid, COUNT(*) AS like_status FROM likes WHERE uid = ? GROUP BY pid ) AS user_likes ON post.pid = user_likes.pid
WHERE
	post.pid = ?
    `;
    db.query(sqlPost, [uid, pid], (err, results) => {
        if (err) return console.log(err.message);

        if (results.length === 0) {
            return res.status(404).json({ code: 0, message: "文章查询失败" });
        }

        res.status(200).json({ code: 1, results });
    });
};
// 获取文章评论
exports.getPostComment = (req, res) => {
    let { pid, page, pageSize } = req.query;

    // 非空检测
    if (!pid || !page || !pageSize) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 计算页数和返回贴子数(页面尺寸)
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const start = (page - 1) * pageSize;
    const end = pageSize;

    const sqlStr = `
    SELECT
        comment.cid,
	    comment.content,
	    comment.create_time,
	    user.head,
	    user.name,
	    user.username
    FROM
    comment
    INNER JOIN USER ON comment.uid = user.uid
    WHERE
    	pid = ?
    ORDER BY create_time DESC
        LIMIT ?, ?;
    `;
    db.query(sqlStr, [pid, start, end], async (err, results) => {
        if (err) return console.log(err.message);

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "当前帖子还没有回复，快来发布你的回复" });
        }

        res.status(200).json({ code: 1, results });
    });
};

// 发布文章
exports.publishPost = (req, res) => {
    const { uid } = req.user;
    const { content } = req.body;

    // 非空检测
    if (!content) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    // 没有封面的情况下，直接上传uid和content
    if (!req.file) {
        const post = { uid, content };
        const sqlStr = "INSERT INTO post SET ?";

        db.query(sqlStr, post, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.affectedRows === 1) {
                res.status(200).json({ code: 1, message: "发布成功" });
            }
        });

        return;
    }

    // 有封面的情况下，需要先上传封面到cos
    let filename = req.file.filename;
    fs.readFile("./cache/" + filename, (err, data) => {
        if (err) {
            console.log("读取失败" + err);
            return;
        }

        let cosFilename = uid + filename;

        // 将文件上传至cos
        cos.putObject(
            {
                Bucket: config.cos.Bucket,
                Region: config.cos.Region,
                Key: "postCover/" + cosFilename,
                StorageClass: "STANDARD",
                Body: data,
            },
            function (err, data) {
                if (err) {
                    // 处理请求出错
                    res.send({ code: 400, msg: "图片上传失败" + err });
                } else {
                    // 处理请求成功
                    let cover = "https://" + data.Location;

                    const post = { uid, cover, content };
                    const sqlStr = "INSERT INTO post SET ?";
                    db.query(sqlStr, post, (err, results) => {
                        if (err) return console.log(err.message);

                        if (results.affectedRows === 1) {
                            res.status(200).json({ message: "发布成功" });
                        }
                    });

                    // 删除文件
                    fs.unlink("./cache/" + filename, (err, data) => {
                        if (err) {
                            console.log("删除失败" + err);
                            return;
                        }
                    });
                }
            }
        );
    });
};
// 点赞
exports.like = (req, res) => {
    const { uid } = req.user;
    const { pid } = req.body;

    // 非空检测
    if (!pid) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    const sqlStr = `SELECT * FROM likes WHERE uid = ? AND pid = ?`;
    db.query(sqlStr, [uid, pid], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length >= 1) {
            res.status(200).json({ code: 0, message: "已点赞" });
            return;
        }

        const sqlStr = `INSERT INTO likes (uid, pid) VALUES (?, ?)`;
        db.query(sqlStr, [uid, pid], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ code: 0, message: "服务器错误" });
            }

            if (results.length === 0) {
                return res.status(200).json({ code: 0, message: "点赞失败" });
            }

            res.status(200).json({ code: 1, message: "点赞成功" });
        });
    });
};
// 取消点赞
exports.unlike = (req, res) => {
    const { uid } = req.user;
    const { pid } = req.body;

    // 非空检测
    if (!pid) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    const sqlStr = `DELETE FROM likes WHERE uid = ? AND pid = ?`;
    db.query(sqlStr, [uid, pid], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "取消点赞失败" });
        }

        res.status(200).json({ code: 1, message: "取消点赞成功" });
    });
};
// 用户评论
exports.comment = (req, res) => {
    const { uid } = req.user;
    const { pid, content } = req.body;

    // 非空检测
    if (!pid || !content) {
        return res.status(400).json({ code: 0, message: "客户端数据错误" });
    }

    const sqlStr = `INSERT INTO comment (pid, uid, content) VALUES (?, ?, ?)`;
    db.query(sqlStr, [pid, uid, content], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ code: 0, message: "服务器错误" });
        }

        if (results.length === 0) {
            return res.status(200).json({ code: 0, message: "回复发布失败" });
        }

        res.status(200).json({ code: 1, message: "回复发布成功" });
    });
};
