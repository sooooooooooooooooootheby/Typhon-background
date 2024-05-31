# 上传接口

## post

### 图片上传

说明：
* 此接口用于图片上传至腾讯云对象存储，上传成功会返回对象url地址。
* 腾讯云对象存储配置前往`config.yaml`。
* 需要 token。
* 图片类型会决定你上传到储存桶的目录，举例图片类型为`head`，文件名为`adminHead.png`，上传的目录为`储存桶/head/adminHead.png`。
* 图片的key(name)必须是`image`

必要参数

-   `imageType`：图片类型

接口地址: `uploadImage`

举例：`127.0.0.1/uplaodImage`
