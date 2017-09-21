//index.js
//获取应用实例
const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50


let cropper = require('../../welCropper/welCropper.js');

console.log(device)

Page({
    data: {
        cropperData: {
            hidden: false,
            left: 0,
            top: 0,
            width: W,
            height: H,
            itemLength: 50,
            items: {
                topleft: {
                    x: 50,
                    y: 50
                },
                topright: {
                    x: W - 50,
                    y: 50
                },
                bottomleft: {
                    x: 50,
                    y: H - 50
                },
                bottomright: {
                    x: W - 50,
                    y: H - 50
                }
            },
            imageInfo: {
                src: '',
                w: 0,
                h: 0
            },
            scaleInfo: {
                x: 1,
                y: 1
            }
        }
    },
    onLoad: function () {
        var that = this
        // cropper.init.apply(that, [W, H]);

        that.drawLines(that.data.cropperData.items)
    },
    // showTap(){
    //     this.showCropper()
    // },
    // hideTap(){
    //     this.hideCropper()
    // }

    // 选择图片
    selectImage: function () {
        var that = this

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
                const src = res.tempFilePaths[0]
                console.log(res)

                wx.getImageInfo({
                    src: src,
                    success: function (res) {
                        console.log(res)

                        var w = res.width, h = res.height

                        that.loadImage(src, w, h)
                    }
                })
            }
        })
    },

    // 截取图片
    cropImage: function () {
        var that = this
        var cropperData = that.data.cropperData
        var scaleInfo = cropperData.scaleInfo
        var width = cropperData.width
        var height = cropperData.height

        var items = cropperData.items

        var maxX = 0, maxY = 0
        for (var key in items) {
            var item = items[key]
            maxX = item.x > maxX ? item.x : maxX
            maxY = item.y > maxY ? item.y : maxY
        }

        var minX = maxX, minY = maxY
        for (var key in items) {
            var item = items[key]
            minX = item.x < minX ? item.x : minX
            minY = item.y < minY ? item.y : minY
        }

        var w = maxX - minX, h = maxY - minY
        w *= scaleInfo.x
        h *= scaleInfo.y

        var x = minX * scaleInfo.x, y = minY * scaleInfo.y

        console.log('x=' + x + ',y=' + y + ',w=' + w + ',h=' + h)

        wx.canvasToTempFilePath({
            x: x,
            y: y,
            width: w,
            height: h,
            destWidth: w,
            destHeight: h,
            canvasId: 'originalCanvas',
            success: function (res) {
                console.log("hehe1")
                console.log(res.tempFilePath)
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success(res) {
                    }
                })
                var src = res.tempFilePath
                wx.previewImage({
                    current: '', // 当前显示图片的http链接
                    urls: [src] // 需要预览的图片http链接列表
                })
            },
            fail(res) {
                console.log("fail res:")
                console.log(res)
            }
        })
    },
    selectTap() {
        var that = this

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
                const tempFilePath = res.tempFilePaths[0]
                console.log(tempFilePath)

                that.showCropper(tempFilePath, (resPath) => {
                    console.log("crop callback:" + resPath)
                    wx.previewImage({
                        current: '',
                        urls: [resPath]
                    })

                    // that.hideCropper() //隐藏，我在项目里是点击完成就上传，所以如果回调是上传，那么隐藏掉就行了，不用previewImage
                })
            }
        })
    }
})
