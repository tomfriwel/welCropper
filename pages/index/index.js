//index.js
//获取应用实例
var app = getApp()
const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 50


let cropper = require('../../tomfriwel-cropper/tomfriwel-cropper.js');

console.log(device)

Page({
    data: {
    },
    onLoad: function () {
        var that = this
        cropper.init.apply(that, [W, H]);
    },
})
