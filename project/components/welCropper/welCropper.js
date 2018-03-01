// components/welCropper.js

// 获取显示区域长宽
const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

var cropperUtil = require("./welCropperUtil.js")

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isShow: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                console.log(newVal)

                this.data.cropperData.hidden = !newVal
                this.setData({
                    cropperData: this.data.cropperData
                })
            }
        },
        path: {
            type: String,
            value: '',
            observer: function (path) {
                console.log(this.data)
                var mode = 'rectangle'
                this.showCropper({
                    src: path,
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
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        cropperData: {
            hidden: true,
            left: 0,
            top: 0,
            width: W,
            height: H,
            itemLength: 50,
            imageInfo: {
                path: '',
                width: 0,
                height: 0
            },
            scaleInfo: {
                x: 1,
                y: 1
            },
            cropCallback: null,
            sizeType: ['original', 'compressed'],    //'original'(default) | 'compressed'
            original: false,  // 默认压缩，压缩比例为截图的0.4
            mode: 'rectangle', //默认矩形
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
        },
        cropperChangableData: {
            canCrop: true,
            rotateDegree: 0,
            originalSize: {
                width: 0,
                height: 0
            },
            scaleSize: {
                width: 0,
                height: 0
            },
            shape: {

            }
        }
    },
    ready: function () {
        // this.setData({
        //     cropperData: {
        //         hidden: true,
        //         left: 0,
        //         top: 0,
        //         width: W,
        //         height: H,
        //         itemLength: 50,
        //         imageInfo: {
        //             path: '',
        //             width: 0,
        //             height: 0
        //         },
        //         scaleInfo: {
        //             x: 1,
        //             y: 1
        //         },
        //         cropCallback: null,
        //         sizeType: ['original', 'compressed'],    //'original'(default) | 'compressed'
        //         original: false,  // 默认压缩，压缩比例为截图的0.4
        //         mode: 'rectangle', //默认矩形
        //     },
        //     cropperMovableItems: {
        //         topleft: {
        //             x: -1,
        //             y: -1
        //         },
        //         topright: {
        //             x: -1,
        //             y: -1
        //         },
        //         bottomleft: {
        //             x: -1,
        //             y: -1
        //         },
        //         bottomright: {
        //             x: -1,
        //             y: -1
        //         }
        //     },
        //     width:220,
        //     height:220,
        //     length:50,
        //     x:-1,
        //     y:-1,
        //     cropperChangableData: {
        //         canCrop: true,
        //         rotateDegree: 0,
        //         originalSize: {
        //             width: 0,
        //             height: 0
        //         },
        //         scaleSize: {
        //             width: 110,
        //             height: 110
        //         }
        //     }
        // })

        console.log('ready')
        console.log(this.data.cropperMovableItems)

        cropper.init.apply(that, [W, H]);
    },
    methods: {    // 显示cropper，如果有图片则载入
    }
})
