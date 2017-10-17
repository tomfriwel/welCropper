![封面](http://upload-images.jianshu.io/upload_images/2158535-2c383e1129188a2a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/400)


最近做项目的时候，需要做一个截图功能。用了一个别人写的截图工具，发现截出的**图质量下降了**，但是我们图片要用来做识别, 需要保证截出的图质量不下降。而且也不支持通过拖动来调整截图框的大小。所以这个截图工具无法满足需求。因为所以，就自己动手写了一个截图组件。

下面介绍一下实现原理和使用方法。

### 实现原理
组件`wxml`的层次结构图如下：

![hierarchy.png](http://upload-images.jianshu.io/upload_images/2158535-e8bad56fc67e707d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700)

* `original canvas` 用来绘制原图大小的图片，这样能保证截图后的质量不会下降，这个canvas是隐藏的。
* `movable-area`是`movable-view`的容器，是官方提供的拖拽移动组件，用来移动截取框的四个角。这个组件支持多个点同时移动。
* `scale canvas`用来绘制适应屏幕比例大小的图片（aspectFit），因为通常原图大小是超过屏幕长宽的。（一开始白线框和图片都在这一层，但后来发现每次移动都要绘制一次图片，这样会造成卡顿、性能下降。所以就想到通过增加一个`move canvas`来专门绘制白线框来降低绘制图片带来的资源消耗，因为图片是静止的，不需要重复绘制。）
* `move canvas`是根据四个`movable-view`的位置绘制出截图框。

最后截图，通过四个点的位置计算出截图框的位置，然后放大对应原图大小的位置，得到在原图中的`(x, y, width, height)`，最后通过官方提供的`canvas`接口截图。
```
wx.canvasToTempFilePath({
  x: x,
  y: y,
  width: w,
  height: h,
  destWidth: w,
  destHeight: h,
  canvasId: 'originalCanvas',
  success: function (res) {
  }
)}
```

### 特点
* 保证截图质量不会被压缩（也可以选择压缩图）
* 截图框能够通过拖拽四个角来调整选区大小

### 使用
假设我们的应用文件结构如下：
```
./
├── app.js
├── app.json
├── app.wxss
├── pages
│   └── index
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
└── welCropper
    ├── welCropper.js
    ├── welCropper.wxml
    └── welCropper.wxss
```

调用组件时，需要传入`cropperData`和`cropperMovableItems`，因为数据和事件都是绑定在`Page`上的，所以要避免使用组件里面已经被占用的命名。
_**/pages/index/index.wxml**_
```
<!-- 引入组件 -->
<import src="/welCropper/welCropper.wxml" />

<!-- 调用组件 -->
<template is="welCropper" data="{{data:cropperData, cropperMovableItems:cropperMovableItems}}"></template>

<!-- 用于选择图片，传入cropper中 -->
<button bindtap='selectTap'>select image</button>
```

_**/pages/index/index.js**_
```
// 获取显示区域长宽
const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

let cropper = require('../../welCropper/welCropper.js');

console.log(device)

Page({
    data: {
    },
    onLoad: function () {
        var that = this
        // 初始化组件数据和绑定事件
        cropper.init.apply(that, [W, H]);
    },
    selectTap() {
        var that = this

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
                const tempFilePath = res.tempFilePaths[0]
                console.log(tempFilePath)
                
                // 将选取图片传入cropper，并显示cropper
                // mode=rectangle 返回图片path
                // mode=quadrangle 返回4个点的坐标，并不返回图片。这个模式需要配合后台使用，用于perspective correction
                let modes = ["rectangle", "quadrangle"]
                let mode = modes[0]   //rectangle, quadrangle
                that.showCropper({
                    src: tempFilePath,
                    mode: mode,
                    sizeType: ['original', 'compressed'],   //'original'(default) | 'compressed'
                    callback: (res) => {
                        if (mode == 'rectangle') {
                            console.log("crop callback:" + res)
                            wx.previewImage({
                                current: '',
                                urls: [res]
                            })
                        }
                        else {
                            wx.showModal({
                                title: '',
                                content: JSON.stringify(res),
                            })

                            console.log(res)
                        }

                        // that.hideCropper() //隐藏，我在项目里是点击完成就上传，所以如果回调是上传，那么隐藏掉就行了，不用previewImage
                    }
                })
            }
        })
    }
})

```
最后引入组件的样式
_**/pages/index/index.wxss**_
```
@import "/welCropper/welCropper.wxss";
```

### 效果图
![效果动图](http://upload-images.jianshu.io/upload_images/2158535-bedf30dc0d9ca735.gif?imageMogr2/auto-orient/strip)


![效果图](http://upload-images.jianshu.io/upload_images/2158535-160c32c03e14a938.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/300)

#### 如果将`movable-view`显示出来是这样的：

![显示movable-view后](http://upload-images.jianshu.io/upload_images/2158535-06e62d35b74b0f04.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/300)

![mode=quadrangle](http://upload-images.jianshu.io/upload_images/2158535-7a45c633faa6e908.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/300)


### 注意
* 因为`wx.canvasToTempFilePath`输出的是`.png`图片，截出来的图有可能远远大于原图（比如3通道图变成4通道的图）


### 源代码：
[Github:tomfriwel/welCropper](https://github.com/tomfriwel/welCropper)，将`welCropper`文件夹复制到自己项目，引入调用就行了。

#### 如果出现什么bug、问题或者建议可以告诉我，我会尽量改进。