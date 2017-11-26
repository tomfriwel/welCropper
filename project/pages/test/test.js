// pages/test/test.js

const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50

Page({
    data: {
        path:'',
        isShowCropper:false
    },
    onLoad: function (options) {
    },
    selectImage:function(){
        var z = this
        wx.chooseImage({
            count:1,
            success: function(res) {
                var path = res.tempFilePaths[0]
                if(path) {
                    z.setData({
                        path:path,
                        isShowCropper:true
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
