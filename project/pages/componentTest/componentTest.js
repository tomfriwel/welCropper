// pages/componentTest/componentTest.js

const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

Page({
    data: {
        cropperOptions: {
            hidden: true,
            src: '',
            mode: '',
            sizeType: []
        }
    },
    onLoad: function (options) {
    },
    selectTap(e) {
        let z = this
        let mode = e.currentTarget.dataset.mode

        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
                const tempFilePath = res.tempFilePaths[0]
                console.log(tempFilePath)

                // 将选取图片传入cropper，并显示cropper
                // mode=rectangle 返回图片path
                // mode=quadrangle 返回4个点的坐标，并不返回图片。这个模式需要配合后台使用，用于perspective correction
                // let modes = ["rectangle", "quadrangle"]
                // let mode = modes[1]   //rectangle, quadrangle
                z.setData({
                    cropperOptions: {
                        hidden: false,
                        src: tempFilePath,
                        mode: mode,
                        sizeType: ['original', 'compressed'],   //'original'(default) | 'compressed'
                    }
                })
            }
        })
    },
    cropperComplete: function (e) {
        console.log(e)
        let res = e.detail.res
        if (this.data.cropperOptions.mode == 'rectangle') {
            console.log("crop callback:" + res)
            wx.previewImage({
                current: '',
                urls: [res]
            })
        }
        else {
            console.log('callback :' + res)
            wx.showModal({
                title: '',
                content: JSON.stringify(res),
            })

            console.log(res)
        }

        // that.hideCropper() //隐藏，我在项目里是点击完成就上传，所以如果回调是上传，那么隐藏掉就行了，不用previewImage
    }
})
