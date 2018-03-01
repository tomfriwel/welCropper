// pages/componentTest/componentTest.js

Page({
    data: {
        path: '',
        isShowCropper: false
    },
    onLoad: function (options) {
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
})
