// pages/test/test.js

const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

let cropper = require('../../welCropper/welCropper.js');

Page({
    data: {
        hash: 0,
        path: '',
        isShowCropper: false,
        size: {
            width: 100,
            height: 100,
        },
        item: {
            x: 66,
            y: 66,
        },
        length: 50,
        left: 0,
        top: 200
    },
    onLoad: function (options) {
        // this.setData({
        //     size: {
        //         width: 300,
        //         height: 300,
        //     },
        // })
    },
    startEvent: function (e) {
        var left = this.data.left
        var top = this.data.top
    },
    moveEvent: function (e) {
        // console.log(this.data.item)

        // var changedTouches = e.changedTouches
        // if (changedTouches.length == 1) {
        //     let touch = changedTouches[0]
        //     let x = touch.clientX
        //     let y = touch.clientY

        //     let size = this.data.size

        //     this.setData({
        //         left:x-size.width/2,
        //         top: y - size.height / 2
        //     })
        // }
    },
    endEvent: function (e) {
        console.log(e)
        console.log(this.data)
        var changedTouches = e.changedTouches
        if (changedTouches.length == 1) {
            let touch = changedTouches[0]
            let x = touch.clientX
            let y = touch.clientY

            var left = this.data.left
            var top = this.data.top

            // 相对画布的点
            x = x - left
            y = y - top
            this.setData({
                x,
                y
            })
        }
    },
    openCropper: function () {
        this.setData({
            isShowCropper: !this.data.isShowCropper
        })
    },
    cropperHide: function () {
        this.setData({
            isShowCropper: false
        })
    },
    tapHandler: function () {
        var z = this

        var item = this.data.item
        this.setData({
            size: {
                width: 300 * Math.random(),
                height: 300 * Math.random(),
            },
            item: {
                x: -1,
                y: -1,
            },
            hash:!this.data.hash
        })

        // setTimeout(function () {
        //     z.setData({
        //         item: item,
        //         // hash: 1
        //     })
        // }, 100)
    },
    selectImage: function () {
        var z = this
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var path = res.tempFilePaths[0]
                if (path) {
                    z.setData({
                        path: path,
                        isShowCropper: true
                    })
                }
                else {
                    wx.showModal({
                        title: '',
                        content: 'no path',
                    })
                }
            },
        })
    }
})
