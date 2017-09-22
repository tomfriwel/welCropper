
var init = function (W, H) {
    let that = this

    that.setData({
        cropperData: {
            hidden: true,
            left: 0,
            top: 0,
            width: W,
            height: H,
            itemLength: 50,
            imageInfo: {
                src: '',
                w: 0,
                h: 0
            },
            scaleInfo: {
                x: 1,
                y: 1
            },
            cropCallback:null
        },
        cropperMovableItems: {
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
        }
    })

    // 显示cropper，如果有图片则载入
    that.showCropper = function (src, callback) {
        let that = this
        
        that.data.cropperData.hidden = false
        that.data.cropperData.cropCallback = callback

        that.setData({
            cropperData: that.data.cropperData,
        })

        if (src) {
            wx.getImageInfo({
                src: src,
                success: function (res) {
                    console.log(res)

                    var w = res.width, h = res.height

                    that.loadImage(src, w, h)
                }
            })
        }
    }

    // 隐藏cropper
    that.hideCropper = function () {
        let that = this

        that.data.cropperData.hidden = true
        that.data.cropperData.cropCallback = null

        that.setData({
            cropperData: that.data.cropperData
        })

        that.clearCanvas()
    }

    // that.selectImage = () => {
    //     var that = this

    //     wx.chooseImage({
    //         count: 1, // 默认9
    //         sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    //         sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    //         success(res) {
    //             const src = res.tempFilePaths[0]
    //             console.log(res)

    //             wx.getImageInfo({
    //                 src: src,
    //                 success: function (res) {
    //                     console.log(res)

    //                     var w = res.width, h = res.height

    //                     that.loadImage(src, w, h)
    //                 }
    //             })
    //         }
    //     })
    // }

    // 截取选中图片，如果有回调，则调用
    that.cropImage = () => {
        let that = this
        let cropperData = that.data.cropperData
        let scaleInfo = cropperData.scaleInfo
        let width = cropperData.width
        let height = cropperData.height

        let cropperMovableItems = that.data.cropperMovableItems

        let maxX = 0, maxY = 0
        for (let key in cropperMovableItems) {
            let item = cropperMovableItems[key]
            maxX = item.x > maxX ? item.x : maxX
            maxY = item.y > maxY ? item.y : maxY
        }

        let minX = maxX, minY = maxY
        for (let key in cropperMovableItems) {
            let item = cropperMovableItems[key]
            minX = item.x < minX ? item.x : minX
            minY = item.y < minY ? item.y : minY
        }

        let w = maxX - minX, h = maxY - minY
        w *= scaleInfo.x
        h *= scaleInfo.y

        let x = minX * scaleInfo.x, y = minY * scaleInfo.y

        console.log('x=' + x + ',y=' + y + ',w=' + w + ',h=' + h)

        let ctx = wx.createCanvasContext("originalCanvas")
        wx.canvasToTempFilePath({
            x: x,
            y: y,
            width: w,
            height: h,
            destWidth: w,
            destHeight: h,
            canvasId: 'originalCanvas',
            success: function (res) {
                let tempFilePath = res.tempFilePath

                wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success(res) {
                    }
                })

                if (that.data.cropperData.cropCallback) {
                    that.data.cropperData.cropCallback(tempFilePath)
                }
            },
            fail(res) {
                console.log("fail res:")
                console.log(res)
            }
        })
    }

    // 获取选中区域的(x, y, w, h)
    that.getCropRect = () => {
        let that = this
        let cropperMovableItems = that.data.cropperMovableItems

        let maxX = 0, maxY = 0
        for (let key in cropperMovableItems) {
            let item = cropperMovableItems[key]
            maxX = item.x > maxX ? item.x : maxX
            maxY = item.y > maxY ? item.y : maxY
        }

        let minX = maxX, minY = maxY
        for (let key in cropperMovableItems) {
            let item = cropperMovableItems[key]
            minX = item.x < minX ? item.x : minX
            minY = item.y < minY ? item.y : minY
        }

        return {
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY
        }
    }

    // 暂无
    // that.rotateImage = () => {
    //     let that = this
    // }

    // 根据图片大小设置canvas大小，并绘制图片
    that.loadImage = (src, width, height) => {
        let that = this
        let size = that.adjustSize(width, height)

        let left = (W - size.width) / 2
        let top = (H - size.height) / 2

        console.log('left:' + left)
        console.log('top:' + top)
        console.log('width=' + width)
        console.log('height=' + height)

        // set data
        let updateData = {}
        let cropperData = that.data.cropperData

        cropperData.imageInfo = {
            src: src,
            w: width,
            h: height
        }
        cropperData.left = left
        cropperData.top = top
        cropperData.width = size.width
        cropperData.height = size.height

        updateData.cropperData = cropperData

        updateData.cropperMovableItems = {
            topleft: {
                x: 50,
                y: 50
            },
            topright: {
                x: size.width - 50,
                y: 50
            },
            bottomleft: {
                x: 50,
                y: size.height - 50
            },
            bottomright: {
                x: size.width - 50,
                y: size.height - 50
            }
        }

        cropperData.scaleInfo = {
            x: width / size.width,
            y: height / size.height
        }

        that.setData(updateData)

        that.drawImage()
        that.drawLines(that.data.cropperMovableItems)
    }

    // 获取适应屏幕的图片显示大小
    that.adjustSize = (width, height) => {
        if (width > W) {
            height = W / width * height
            width = W
        }

        if (height > H) {
            width = H / height * width
            height = H
        }

        return {
            width: width,
            height: height
        }
    }

    // 清空canvas上的数据
    that.clearCanvas = ()=> {
        let cropperData = that.data.cropperData
        let imageInfo = cropperData.imageInfo
        let size = that.adjustSize(imageInfo.w, imageInfo.h)

        if (imageInfo.src != '') {
            let src = imageInfo.src

            //绘制原图
            let ctx = wx.createCanvasContext("originalCanvas")
            ctx.clearRect(0, 0, imageInfo.w, imageInfo.h)
            ctx.draw()

            //绘制选择区图片
            let canvas = wx.createCanvasContext("canvas")
            canvas.clearRect(0, 0, size.width, size.height)
            canvas.draw()

            let moveCanvas = wx.createCanvasContext("moveCanvas")
            moveCanvas.clearRect(0, 0, size.width, size.height)
            moveCanvas.draw()
        }
    }

    //绘制图片
    that.drawImage = () => {
        let that = this
        let cropperData = that.data.cropperData
        let imageInfo = cropperData.imageInfo
        let size = that.adjustSize(imageInfo.w, imageInfo.h)

        if (imageInfo.src != '') {
            let src = imageInfo.src

            //绘制原图
            let originalCanvas = wx.createCanvasContext("originalCanvas")
            originalCanvas.drawImage(src, 0, 0, imageInfo.w, imageInfo.h)
            originalCanvas.draw()

            //绘制选择区图片
            let canvas = wx.createCanvasContext("canvas")
            canvas.drawImage(src, 0, 0, size.width, size.height)
            canvas.draw()
        }
    }

    //绘制选框
    that.drawLines = (cropperMovableItems, key) => {
        let that = this
        let cropperData = that.data.cropperData
        let imageInfo = cropperData.imageInfo

        if (key) {
            var x = cropperMovableItems[key].x
            var y = cropperMovableItems[key].y

            if (key == 'topleft') {
                cropperMovableItems['bottomleft'].x = x
                cropperMovableItems['topright'].y = y
            }
            else if (key == 'topright') {
                cropperMovableItems['bottomright'].x = x
                cropperMovableItems['topleft'].y = y
            }
            else if (key == 'bottomleft') {
                cropperMovableItems['topleft'].x = x
                cropperMovableItems['bottomright'].y = y
            }
            else if (key == 'bottomright') {
                cropperMovableItems['topright'].x = x
                cropperMovableItems['bottomleft'].y = y
            }
        }

        let size = that.adjustSize(imageInfo.w, imageInfo.h)
        let ctx = wx.createCanvasContext("moveCanvas")

        //绘制高亮选中区域
        let rect = that.getCropRect()
        ctx.setFillStyle('rgba(0,0,0,0.5)')
        ctx.fillRect(0, 0, size.width, size.height)
        ctx.setFillStyle('rgba(0,0,0,0)')
        ctx.clearRect(rect.x, rect.y, rect.w, rect.h)

        console.log(rect)

        //绘制选中边框
        ctx.setStrokeStyle('white')
        ctx.setLineWidth(2)
        ctx.beginPath()
        ctx.moveTo(rect.x, rect.y)
        ctx.lineTo(rect.x + rect.w, rect.y)
        ctx.lineTo(rect.x + rect.w, rect.y + rect.h)
        ctx.lineTo(rect.x, rect.y + rect.h)
        ctx.lineTo(rect.x, rect.y)

        ctx.stroke()
        ctx.closePath()

        //绘制四个角的圆点
        let cornerType = 'rect'//'circle'
        ctx.setFillStyle('white')
        ctx.setStrokeStyle('white')

        if (cornerType == 'circle') {
            ctx.beginPath()
            ctx.arc(rect.x, rect.y, 10, 0, 2 * Math.PI, true)
            ctx.fill()
            ctx.closePath()

            ctx.beginPath()
            ctx.arc(rect.x + rect.w, rect.y, 10, 0, 2 * Math.PI, true)
            ctx.fill()
            ctx.closePath()

            ctx.beginPath()
            ctx.arc(rect.x + rect.w, rect.y + rect.h, 10, 0, 2 * Math.PI, true)
            ctx.fill()
            ctx.closePath()

            ctx.beginPath()
            ctx.arc(rect.x, rect.y + rect.h, 10, 0, 2 * Math.PI, true)
            ctx.fill()
            ctx.closePath()
        }
        else if (cornerType == 'rect') {
            let len = 20, w = 3.0, offset = w / 2.0

            ctx.setLineWidth(w)
            ctx.beginPath()

            ctx.moveTo(rect.x - offset, rect.y - offset + len)
            ctx.lineTo(rect.x - offset, rect.y - offset)
            ctx.lineTo(rect.x - offset + len, rect.y - offset)

            ctx.moveTo(rect.x + offset + rect.w - len, rect.y - offset)
            ctx.lineTo(rect.x + offset + rect.w, rect.y - offset)
            ctx.lineTo(rect.x + offset + rect.w, rect.y - offset + len)

            ctx.moveTo(rect.x + offset + rect.w, rect.y + offset + rect.h - len)
            ctx.lineTo(rect.x + offset + rect.w, rect.y + offset + rect.h)
            ctx.lineTo(rect.x + offset + rect.w - len, rect.y + offset + rect.h)

            ctx.moveTo(rect.x - offset, rect.y + offset + rect.h - len)
            ctx.lineTo(rect.x - offset, rect.y + offset + rect.h)
            ctx.lineTo(rect.x - offset + len, rect.y + offset + rect.h)

            ctx.stroke()

            ctx.closePath()
        }

        ctx.draw()
    }

    // move events
    that.setupMoveItem = (key, changedTouches, callback) => {
        let that = this
        let cropperData = that.data.cropperData
        let cropperMovableItems = that.data.cropperMovableItems
        let left = cropperData.left
        let top = cropperData.top

        if (changedTouches.length == 1) {
            let touch = changedTouches[0]
            let x = touch.clientX
            let y = touch.clientY

            cropperMovableItems[key].x = x - left
            cropperMovableItems[key].y = y - top

            that.drawLines(cropperMovableItems, key)

            if (callback) {
                callback(cropperMovableItems)
            }
        }
    }

    // moveable-view touchmove
    that.moveEvent = (e) => {
        let that = this
        let key = e.currentTarget.dataset.key
        that.setupMoveItem(key, e.changedTouches)
    }

    // moveable-view touchend，end的时候设置movable-view的位置，如果在move阶段设置位置，选中会不流畅
    that.endEvent = (e) => {
        console.log("end")
        let that = this
        let cropperData = that.data.cropperData
        let key = e.currentTarget.dataset.key

        that.setupMoveItem(key, e.changedTouches, (cropperMovableItems) => {
            that.setData({
                cropperMovableItems: cropperMovableItems
            })
        })
    }
}


module.exports = {
    init
}

