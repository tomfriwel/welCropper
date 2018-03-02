//app.js
App({
    onLaunch: function () {
        wx.getSystemInfo({
            success: function(res) {
                console.log(res)
            },
        })
    },
    globalData: {
    }
})
