// components/welCropper.js

// 获取显示区域长宽
const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

console.log('component')
console.log(W)
console.log(H)

let cropper = require('../../welCropper/welCropper.js');

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        cropperOptions: {
            type: Object,
            value: null,
            observer: function (newVal, oldVal) {

                console.log(2)
                console.log(newVal)

                // this.data.cropperData.hidden = newVal.hidden
                // this.setData({
                //     cropperData: this.data.cropperData
                // })
                if (this.data.ready) {
                    this.showCropper({
                        src: newVal.src,
                        mode: newVal.mode,
                        sizeType: newVal.sizeType,   //'original'(default) | 'compressed'
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
                else {
                    cropper.init.apply(this, [W, H]);

                    this.setData({
                        ready: true
                    })
                }
            }
        },
    },
    data: {
        ready:false,
    },
    ready: function () {
        console.log(1)
    },
    methods: {    // 显示cropper，如果有图片则载入
    }
})
