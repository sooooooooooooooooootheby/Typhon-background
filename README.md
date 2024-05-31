<p align="center">
<img style="text-align:center;" src="https://raw.githubusercontent.com/sooooooooooooooooootheby/Typhon/main/logo.png" />
</p>
<h1 align="center" style="color: #1B1B1B">🐭 Typhon-back-end 🐹</h1>

## 项目介绍 🌕
这是[前端项目Typhon](https://github.com/sooooooooooooooooootheby/Typhon)的后端项目，使用`node.js v20.11.1`编写，详细见下面记事本。

## API

见`APIDocs`文件夹

## 配置
除了邮箱需要在js文件中配置，其他大部分可以在`config.yaml`文件中进行配置
- 数据库配置 `database`
  - host: 数据库地址 举例`127.0.0.1`
  - user: 用户名 举例`root`
  - password: 密码 举例`这个就不举例了`
  - database: 数据库名 举例`typhon`

- 腾讯云对象存储(cos)配置 `cos`
  - 此处`Id`和`Key`查阅[腾讯云文档](https://console.cloud.tencent.com/cam/capi)
  - SecretId:''
  - SecretKey: ''
  - Bucket: 存储桶名 举例`typhon-6315412312`
  - Region: 桶所在的地域 举例`ap-shanghai`

- 邮箱配置 `email`，邮箱使用了`nodemailer`插件，需要其他配置请自行翻阅[官方文档](https://nodemailer.com/)
  - 此处的`service`和`port`不知道什么原因需要在js文件中配置，否则会报错，邮箱类型和端口号
  - service: 邮箱类型 举例`qq`
  - port: 端口 举例`465`
  - secure: 安全连接 默认`true`，如果开启安全连接，端口需要配置为465
  - addresser: 发件人的名字
  - user: 邮箱 举例`won-der-land@foxmail.com`
  - pass: 授权码 举例`vwkggpcapdjai` 获取方法自行谷歌

- 用户默认头像`./defaultHead.json`

## 记事本 📖
- 本后端项目使用的技术栈是`node.js v20.11.1` + `mysql v5.7.44` + `cos对象储存`。
- 文件`./database/typhon.sql`，学过mysql都知道这个是mysql的配置结构文件，直接拖进图形化工具即可完成数据库的配置。
- res返回的`code`
  - 0: 失败
  - 1: 成功

## 食用指南 🍬
从Github拉取
```
git clone https://github.com/sooooooooooooooooootheby/Typhon-back-end.git
```

进入目录
```
cd Typhon-back-end
```

安装依赖
```
pnpm i
```

运行开发服务器
```
nodemon ./app.js
```
