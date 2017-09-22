### welCropper 微信小程序截图工具

<img src="documents/screenshot.jpeg" width=300 /><img src="documents/result.gif" width=300 />

* 保证图片质量

#### Documents

<img src="documents/hierarchy.png" width=600 />

因为`cropper`的数据和事件是直接绑定到`Page`上的，所以数据和事件命名应该避免一下名字（之后会想办法避免这种情况）及其相关解释：

data中的名字：

* cropperData
* cropperMovableItems

函数名：

* showCropper
* hideCropper
* cropImage
* getCropRect   
* loadImage
* adjustSize
* clearCanvas
* drawImage
* drawLines
* setupMoveItem
* moveEvent
* endEvent

外部只用到`showCropper`和`hideCropper`

```
/**
    inputPath:输入图片地址
    callback(resPath):点击“完成”按钮后毁掉函数，毁掉函数中会有截图地址
*/
showCropper(inputPath, callback)

```

#### 使用

将`welCropper`复制到自己的工程当中（以`/pages/index/index`为例）

##### `wxml`引入：
```
<import src="/welCropper/welCropper" />
```

##### `wxss`引入：
```
@import "/welCropper/welCropper.wxss";
```

##### `js`引入和使用：
```
let cropper = require('../../welCropper/welCropper.js');

// 选择图片后调用
var that = this

wx.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'], // original, compressed
    sourceType: ['album', 'camera'],
    success(res) {
        const tempFilePath = res.tempFilePaths[0]

        // 传入图片地址和点击“完成”按钮后的回调函数
        that.showCropper(tempFilePath, (resPath) => {
            console.log("crop callback:" + resPath)
            
            // 获取到截图地址后，doSomething

            that.hideCropper() //隐藏
        })
    }
})
```