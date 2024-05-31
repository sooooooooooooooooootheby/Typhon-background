# 文章接口

## Get

### 首页获取文章

说明：此接口用于获取文章流，自动判断请求头是否含有 token，分为登录和未登录两种情况。

必须参数:

-   `page`：页数
-   `pageSize`：贴子数

接口地址： `/getPost`

举例：`127.0.0.1/getPost?page=1&pageSize=5`

### 用户页获取用户文章

说明：此接口用于在用户详细页获取用户发布的文章，需要 token 获取访问用户的点赞状态。

必须参数:

-   `page`：页数
-   `pageSize`：贴子数

接口地址： `/getUserPost`

举例：`127.0.0.1/getUserPost?page=1&pageSize=5`

### 用户页获取用户喜欢

说明：此接口用于在用户详细页获取用户点赞的文章，需要 token 获取访问用户的点赞状态。

必须参数:

-   `page`：页数
-   `pageSize`：贴子数

接口地址： `/getUserLike`

举例：`127.0.0.1/getUserLike?page=1&pageSize=5`

### 获取文章详细

说明：此接口用于文章详细页，获取文章和作者信息，需要 token 获取访问用户的点赞状态。

必须参数：

-   `pid`：帖子的 id

接口地址： `/getPostDetail`

举例：`127.0.0.1/getPostDetail?pid=0001`

### 获取文章评论

说明：此接口用于获取文章评论，获取评论内容和评论者信息。

必要参数：

-   `pid`： 帖子的 id
-   `page`：页数
-   `pageSize`：贴子数

接口地址： `/getPostComment`

举例：`127.0.0.1/getPostComment?pid=0001&page=1&pageSize=5`

## Post

### 发布文章

说明：此接口用于发布文章，可以传入一张图片作为封面，前端表单`<input type="file" accept="image/*" name="cover" />`。自动判断是否有传入图片，如果没有图片直接写入。需要 token。

可选参数：

-   `cover`: 封面

必要参数：

-   `content`: 文章内容

接口地址： `/publishPost`

举例：`127.0.0.1/publishPost`

### 点赞

说明：此接口用于用户给文章点赞。需要 token。

必要参数：

-   `pid`: 帖子的 id

接口地址： `/like`

举例：`127.0.0.1/like`

### 取消点赞

说明：此接口用于用户给文章取消点赞。需要 token。

必要参数：

-   `pid`: 帖子的 id

接口地址： `/unlike`

举例：`127.0.0.1/unlike`

### 用户评论

说明：此接口用于用户发布评论。需要 token。

必要参数：

-   `pid`: 帖子的 id
-   `content`: 评论内容

接口地址： `/comment`

举例：`127.0.0.1/comment`