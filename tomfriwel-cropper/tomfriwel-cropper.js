
var init = function(W, H) {
    var that = this

    that.setData({
        cropperData: {
            hidden:true,
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
    })


    that.selectImage = () => {
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
    }

    that.cropImage = () => {
        let that = this
        let cropperData = that.data.cropperData
        let scaleInfo = cropperData.scaleInfo
        let width = cropperData.width
        let height = cropperData.height

        let items = cropperData.items

        let maxX = 0, maxY = 0
        for (let key in items) {
            let item = items[key]
            maxX = item.x > maxX ? item.x : maxX
            maxY = item.y > maxY ? item.y : maxY
        }

        let minX = maxX, minY = maxY
        for (let key in items) {
            let item = items[key]
            minX = item.x < minX ? item.x : minX
            minY = item.y < minY ? item.y : minY
        }

        let w = maxX - minX, h = maxY - minY
        w *= scaleInfo.x
        h *= scaleInfo.y

        let x = minX * scaleInfo.x, y = minY * scaleInfo.y

        console.log('x=' + x + ',y=' + y + ',w=' + w + ',h=' + h)

        var ctx = wx.createCanvasContext("originalCanvas")
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
    }
    that.rotateImage = () => {
        let that = this
    }

    that.loadImage = (src, width, height) => {
        var that = this
        let cropperData = that.data.cropperData
        var size = that.adjustSize(width, height)

        var left = (W - size.width) / 2
        var top = (H - size.height) / 2

        console.log('left:' + left)
        console.log('top:' + top)
        console.log('width=' + width)
        console.log('height=' + height)

        // set data
        cropperData.imageInfo = {
            src: src,
            w: width,
            h: height
        }
        cropperData.left = left
        cropperData.top = top
        cropperData.width = size.width
        cropperData.height = size.height
        cropperData.items = {
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

        that.setData({
            cropperData
        })


        var ctx = wx.createCanvasContext("originalCanvas")
        ctx.drawImage(src, 0, 0, width, height)
        ctx.draw()

        that.drawLines(that.data.cropperData.items)
    }

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
    that.drawLines = (items, key) => {
        var that = this
        let cropperData = that.data.cropperData
        var imageInfo = cropperData.imageInfo

        if (key) {
            var x = items[key].x
            var y = items[key].y

            if (key == 'topleft') {
                items['bottomleft'].x = x
                items['topright'].y = y
            }
            else if (key == 'topright') {
                items['bottomright'].x = x
                items['topleft'].y = y
            }
            else if (key == 'bottomleft') {
                items['topleft'].x = x
                items['bottomright'].y = y
            }
            else if (key == 'bottomright') {
                items['topright'].x = x
                items['bottomleft'].y = y
            }
        }

        var dots = []
        dots.push(items['topleft'])
        dots.push(items['topright'])
        dots.push(items['bottomright'])
        dots.push(items['bottomleft'])
        dots.push(items['topleft'])

        if (imageInfo.src != '') {
            var canvas = wx.createCanvasContext("canvas")
            var src = imageInfo.src
            var size = that.adjustSize(imageInfo.w, imageInfo.h)
            canvas.drawImage(src, 0, 0, size.width, size.height)
            canvas.draw()
        }

        var ctx = wx.createCanvasContext("moveCanvas")

        ctx.beginPath()
        ctx.setStrokeStyle('white')
        ctx.setLineWidth(2)
        for (var i in dots) {
            var dot = dots[i]

            if (i == 0) {
                // console.log(i + ":" + dot.x + "," + dot.y)
                ctx.moveTo(dot.x, dot.y)
            }
            else {
                ctx.lineTo(dot.x, dot.y)
            }
        }
        ctx.stroke()
        ctx.closePath()

        ctx.setFillStyle('white')
        for (var i in dots) {
            var dot = dots[i]
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(dot.x, dot.y)

            ctx.arc(dot.x, dot.y, 10, 0, 2 * Math.PI, true)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
        }

        ctx.draw()
    }
    // move events
    that.setupMoveItem = (key, changedTouches, callback) => {
        let that = this
        let cropperData = that.data.cropperData
        let items = cropperData.items
        let left = cropperData.left
        let top = cropperData.top

        if (changedTouches.length == 1) {
            var touch = changedTouches[0]
            var x = touch.clientX
            var y = touch.clientY

            items[key].x = x - left
            items[key].y = y - top

            that.drawLines(items, key)

            if (callback) {
                callback(items)
            }
        }
    }
    that.moveEvent = (e) => {
        let that = this
        let key = e.currentTarget.dataset.key
        that.setupMoveItem(key, e.changedTouches)
    }
    that.endEvent = (e) => {
        console.log("end")
        var that = this
        let cropperData = that.data.cropperData
        var key = e.currentTarget.dataset.key

        that.setupMoveItem(key, e.changedTouches, (items) => {
            cropperData.items = items
            that.setData({
                cropperData
            })
        })

    }

    that.drawLines(that.data.cropperData.items)
}


module.exports = {
    init
}

