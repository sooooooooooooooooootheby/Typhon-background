# 用户接口

## Get

### 获取用户信息

说明：此接口用于获取用户信息，会根据请求头是否含有 token 来返回公开的用户数据，如果请求头没有 token 就会从请求体中获取用户名。

可选参数：

-   `username`： 用户名

接口地址：`/getUserInfo`

举例：`127.0.0.1/getUserInfo?username=admin`

### 获取新注册的用户信息

说明：此接口用于获取新注册的五个用户信息。

接口地址：`/getNewUser`

举例：`127.0.0.1/getNewUser`

## Post

### 注册

说明：此接口用于用户注册。

必要参数:

-   `email`: 邮箱
-   `code`: 邮箱验证码
-   `username`: 用户名(用户名必须由 3 到 16 个字符组成，允许使用字母、数字、下划线和破折号。)
-   `password`：密码(密码必须至少包含一个小写字母、一个大写字母和一个数字，且长度为 8-20 位。)

接口地址：`/register`

举例：`127.0.0.1/register`

### 登录

说明：此接口用于用户登录，登录成功会返回请求令牌（access token）和刷新令牌（refresh token）。

必要参数:

-   `username`: 用户名(用户名必须由 3 到 16 个字符组成，允许使用字母、数字、下划线和破折号。)
-   `password`：密码(密码必须至少包含一个小写字母、一个大写字母和一个数字，且长度为 8-20 位。)

接口地址：`/login`

举例：`127.0.0.1/login`

### 登出

说明：此接口用于用户登出操作，即删除数据库中刷新令牌的记录，需要 token。

接口地址：`/logout`

举例：`127.0.0.1/logout`

### 更新 access token

说明：此接口用于请求令牌过期时刷新请求令牌。

必要参数：

-   `refreshToken`：刷新令牌，会在登录时返回给前端

接口地址：`/updateAccessToken`

举例：`127.0.0.1/updateAccessToken`

### 升级状态

说明：此接口用于升级用户身份状态，需要 token。

必要参数:

-   `status`：状态（Pro Lite, Pro Max, Pro Ultra）

接口地址：`/updateStatus`

举例：`127.0.0.1/updateStatus`

### 更新用户信息

说明：此接口用于更新用户信息，需要 token。

可选参数:

-   `background_image`：用户背景图
-   `head`：用户头像

必要参数:

-   `name`: 用户名字（不是用户名）
-   `introduction`: 简介
-   `place`：位置
-   `website`：网站

接口地址：`/updateUserInfo`

举例：`127.0.0.1/updateUserInfo`

### 更新邮箱

说明：此接口用于更新邮箱，需要 token。

必要参数:

-   `email`: 邮箱
-   `code`: 验证码

接口地址：`/updateEmail`

举例：`127.0.0.1/updateEmail`

