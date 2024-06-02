# 上传接口

## post

### 图片上传

说明：

-   此接口用于图片上传至腾讯云对象存储，上传成功会返回对象 url 地址。
-   需要 token。
-   图片类型会决定你上传到储存桶的目录，举例图片类型为`head`，文件名为`adminHead.png`，上传的目录为`储存桶/head/adminHead.png`。
-   图片的 key(name)必须是`image`

必要参数

-   `imageType`：图片类型

接口地址: `uploadImage`

举例：`127.0.0.1/uplaodImage`

## 用户资料图片上传

说明：

-   此接口用于更新用户资料的图片上传，上传成功会返回对象 url 地址。
-   需要 token。
-   请在前端将图片转换为 base64 格式放入图片信息对象中，键为`dataURL`。
-   图片类型会决定你上传到储存桶的目录，举例图片类型为`head`，文件名为`adminHead.png`，上传的目录为`储存桶/head/adminHead.png`。

必要参数

-   `imageInfo`：图片信息
    -   `fileName`: 图片名
    -   `dataURL`：base64 格式图片
-   `imageType`：图片类型

接口地址: `uploadUserInfo_image`

举例：`127.0.0.1/uploadUserInfo_image`
