// pages/test/test.js

const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

Page({
    data: {
        left:10,
        top:10,
        height:300,
        width:300,
        path:'',
        degree:0
    },
    onLoad: function (options) {
    },
    chooseImage() {
        let that = this
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            success: function (res) {
                const tempFilePath = res.tempFilePaths[0]
                console.log(tempFilePath)

                that.setData({
                    path: tempFilePath,
                    degree:0
                })

                that.loadImage(tempFilePath)
            },
        })
    },
    rotateImage() {
        let that = this
        let path = this.data.path
        let degree = this.data.degree
        let ctx = wx.createCanvasContext('test')

        degree = degree==360?90:degree+90

        console.log()
        
        ctx.translate(150, 150)
        ctx.rotate(degree * Math.PI / 180)
        ctx.translate(-150, -150)
        ctx.drawImage(path, 0, 0, 300, 300)
        
        ctx.draw()

        this.setData({
            degree:degree
        })
    },
    loadImage(path) {
        let ctx = wx.createCanvasContext('test')

        // ctx.translate(150, 150)
        // ctx.rotate(90 * Math.PI / 180)
        // ctx.translate(-150, -150)
        ctx.drawImage(path, 0, 0, 300, 300)
        // ctx.rotate(20 * Math.PI / 180)

        ctx.draw()
    }
})
