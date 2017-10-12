// 获取选中区域的(x, y, w, h)
const getCropRect = (cropperMovableItems) => {
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


// 获取适应屏幕的图片显示大小
const getAdjustSize = (W, H, width, height) => {
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

const cropperUtil = {
    getCropRect,
    getAdjustSize
}


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
            cropCallback: null,
            sizeType: ['original', 'compressed'],    //'original'(default) | 'compressed'
            original: false,  // 默认压缩，压缩比例为截图的0.4
            mode: 'rectangle' //默认矩形
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
    that.showCropper = (options) => {
        let that = this
        let src = options.src
        let callback = options.callback
        let sizeType = options.sizeType
        let mode = options.mode

        let filterType = []
        if (sizeType.indexOf('original') > -1) {
            filterType.push('original')
        }
        if (sizeType.indexOf('compressed') > -1) {
            filterType.push('compressed')
        }
        if (filterType.length == 1 && filterType.indexOf('original') > -1) {
            that.data.cropperData.original = true
        }

        if(mode){
            that.data.cropperData.mode = mode
        }
        that.data.cropperData.hidden = false
        that.data.cropperData.cropCallback = callback
        that.data.cropperData.sizeType = filterType

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
    that.hideCropper = () => {
        let that = this

        that.data.cropperData.hidden = true
        that.data.cropperData.cropCallback = null

        that.setData({
            cropperData: that.data.cropperData
        })

        that.clearCanvas()
    }

    // 原图按钮被点击
    that.originalChange = () => {
        let that = this
        let imageInfo = that.data.cropperData.imageInfo
        let width = imageInfo.w
        let height = imageInfo.h
        let original = !that.data.cropperData.original

        let compressedScale = original ? 1.0 : 0.4
        let size = cropperUtil.getAdjustSize(W, H, width, height)

        console.log("original=" + original)
        that.data.cropperData.original = original
        that.data.cropperData.scaleInfo = {
            x: width * compressedScale / size.width,
            y: height * compressedScale / size.height
        }

        // 之所以要设置cropperMovableItems，然后延时在设置一次，是因为改变cropperData后，movable-view会莫名其妙移动到左上角
        let cropperMovableItemsCopy = that.data.cropperMovableItems
        let cropperMovableItems = {
            topleft: {
                x: 0,
                y: 0
            },
            topright: {
                x: 0,
                y: 0
            },
            bottomleft: {
                x: 0,
                y: 0
            },
            bottomright: {
                x: 0,
                y: 0
            }
        }

        that.setData({
            cropperData: that.data.cropperData,
            cropperMovableItems: cropperMovableItems
        })

        setTimeout(() => {
            that.setData({
                cropperMovableItems: cropperMovableItemsCopy
            })
            console.log(123)
        }, 100)

        that.drawOriginalImage()
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

        wx.showLoading({
            title: '正在截取...',
        })
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


                wx.hideLoading()

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

    // 暂无
    // that.rotateImage = () => {
    //     let that = this
    // }

    // 根据图片大小设置canvas大小，并绘制图片
    that.loadImage = (src, width, height) => {
        let that = this
        let size = cropperUtil.getAdjustSize(W, H, width, height)

        // 适应屏幕的位置
        let left = (W - size.width) / 2
        let top = (H - size.height) / 2

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

        let compressedScale = that.data.cropperData.original ? 1.0 : 0.4

        cropperData.scaleInfo = {
            x: width * compressedScale / size.width,
            y: height * compressedScale / size.height
        }

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

        that.setData(updateData)

        that.drawImage()
        that.drawLines(that.data.cropperMovableItems)
    }

    // 清空canvas上的数据
    that.clearCanvas = () => {
        let cropperData = that.data.cropperData
        let imageInfo = cropperData.imageInfo
        let size = cropperUtil.getAdjustSize(W, H, imageInfo.w, imageInfo.h)

        if (imageInfo.src != '') {
            let src = imageInfo.src
            let compressedScale = that.data.cropperData.original ? 1.0 : 0.4

            //清空原图
            let ctx = wx.createCanvasContext("originalCanvas")
            ctx.clearRect(0, 0, imageInfo.w * compressedScale, imageInfo.h * compressedScale)
            ctx.draw()

            //清空选择区图片
            let canvas = wx.createCanvasContext("canvas")
            canvas.clearRect(0, 0, size.width, size.height)
            canvas.draw()

            // 清空白线框
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
        let size = cropperUtil.getAdjustSize(W, H, imageInfo.w, imageInfo.h)

        if (imageInfo.src != '') {
            let src = imageInfo.src
            let compressedScale = that.data.cropperData.original ? 1.0 : 0.4

            //绘制原图
            let originalCanvas = wx.createCanvasContext("originalCanvas")
            originalCanvas.drawImage(src, 0, 0, imageInfo.w * compressedScale, imageInfo.h * compressedScale)
            originalCanvas.draw()

            //绘制选择区图片
            let canvas = wx.createCanvasContext("canvas")
            canvas.drawImage(src, 0, 0, size.width, size.height)
            canvas.draw()
        }
    }

    // 单独绘制原图，当切换原图与非原图时使用
    that.drawOriginalImage = () => {
        let that = this
        let cropperData = that.data.cropperData
        let imageInfo = cropperData.imageInfo

        if (imageInfo.src != '') {
            let src = imageInfo.src
            let compressedScale = that.data.cropperData.original ? 1.0 : 0.4

            //绘制原图
            let originalCanvas = wx.createCanvasContext("originalCanvas")
            originalCanvas.drawImage(src, 0, 0, imageInfo.w * compressedScale, imageInfo.h * compressedScale)
            originalCanvas.draw()
        }
    }

    //绘制选框
    that.drawLines = (cropperMovableItems, key) => {
        let that = this
        let cropperData = that.data.cropperData
        let imageInfo = cropperData.imageInfo
        let mode = cropperData.mode
        let size = cropperUtil.getAdjustSize(W, H, imageInfo.w, imageInfo.h)

        let dotsWithoutKey = []
        if (key) {
            var x = cropperMovableItems[key].x
            var y = cropperMovableItems[key].y

            // 边界检测，使截图不超出截图区域
            x = x < 0 ? 0 : (x > size.width ? size.width : x)
            y = y < 0 ? 0 : (y > size.height ? size.height : y)
            cropperMovableItems[key].x = x
            cropperMovableItems[key].y = y

            // 如果是在矩形模式下
            if (mode == 'rectangle') {
                // 同时设置相连两个点的位置，是相邻的两个点跟随着移动点动，保证选框为矩形
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
            else{
                dotsWithoutKey.push(cropperMovableItems['topleft'])
                dotsWithoutKey.push(cropperMovableItems['topright'])
                dotsWithoutKey.push(cropperMovableItems['bottomright'])
                dotsWithoutKey.push(cropperMovableItems['bottomleft'])
                dotsWithoutKey.push(cropperMovableItems['topleft'])
            }
        }

        let ctx = wx.createCanvasContext("moveCanvas")

        //绘制高亮选中区域
        let rect = cropperUtil.getCropRect(cropperMovableItems)
        console.log(rect)

        if (mode == 'rectangle') {
            // 绘制半透明遮罩
            ctx.setFillStyle('rgba(0,0,0,0.5)')
            ctx.fillRect(0, 0, size.width, size.height)

            // 清除选中区域的半透明遮罩，使选中区域高亮
            ctx.setFillStyle('rgba(0,0,0,0)')
            ctx.clearRect(rect.x, rect.y, rect.w, rect.h)

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
        }
        else {
            //绘制选中边框
            ctx.setStrokeStyle('white')
            ctx.setLineWidth(2)
            ctx.beginPath()
            for(let i=0,len=dotsWithoutKey.length; i<len; i++){
                let dot = dotsWithoutKey[i]
                if(i==0){
                    ctx.moveTo(dot.x, dot.y)
                }
                else {
                    ctx.lineTo(dot.x, dot.y)
                }
            }

            ctx.stroke()
            ctx.closePath()
        }

        //绘制四个角
        let cornerType = mode=='rectangle' ? 'rect' : 'circle'
        ctx.setFillStyle('white')
        ctx.setStrokeStyle('white')

        // 绘制不同样式的角
        if (cornerType == 'circle') {
            for (let i = 0, len = dotsWithoutKey.length; i < len; i++) {
                let dot = dotsWithoutKey[i]
                if (i != 4) {
                    ctx.beginPath()
                    ctx.arc(dot.x, dot.y, 10, 0, 2 * Math.PI, true)
                    ctx.fill()
                    ctx.closePath()
                }
                else {
                    break
                }
            }
            // ctx.beginPath()
            // ctx.arc(rect.x, rect.y, 10, 0, 2 * Math.PI, true)
            // ctx.fill()
            // ctx.closePath()

            // ctx.beginPath()
            // ctx.arc(rect.x + rect.w, rect.y, 10, 0, 2 * Math.PI, true)
            // ctx.fill()
            // ctx.closePath()

            // ctx.beginPath()
            // ctx.arc(rect.x + rect.w, rect.y + rect.h, 10, 0, 2 * Math.PI, true)
            // ctx.fill()
            // ctx.closePath()

            // ctx.beginPath()
            // ctx.arc(rect.x, rect.y + rect.h, 10, 0, 2 * Math.PI, true)
            // ctx.fill()
            // ctx.closePath()
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

