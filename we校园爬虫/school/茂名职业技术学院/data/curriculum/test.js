function runCode(that) {
  var i;
  if (args.SchoolIndex.iconList) {
    for (i in args.SchoolIndex.iconList) {
      args.SchoolIndex.iconList[i].icon = util.getStorageImage(args.SchoolIndex.iconList[i].icon)
    }
  }

  that.onPullDownRefresh=function (){//下拉实时刷新
    wx.showNavigationBarLoading()
    setTimeout(function (){
      getData()
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    },1000)
  }
  var time = wx.getStorageSync('time')
  var personalInformation = wx.getStorageSync('personalInformation')

  if(personalInformation==='' || personalInformation === '没有此学校,或者方法错误'||personalInformation===null){
//判断是否有成绩那些
    getData()
  }
  if(time!=null){
//获取时间进行判断
    var istime = (new Date().getTime())-time
    if(istime>10*3600*100){
      getData()
    }
  }else {
    getData()
  }
  that.setClass = function () {
    wx.switchTab({ url: '/pages/curriculum/curriculum' })
  }
  wx.setStorageSync('configData', Object.assign(args.SchoolIndex, { "timeYear": args.StartTime }))
  that.onShow = function () {
    var course = []; var msg = ""; var zc = 0; var personalInformation = wx.getStorageSync('personalInformation')
    var configData = wx.getStorageSync('configData')
    var curriculum = personalInformation.curriculum;
    if (!curriculum) {
      that.setData(Object.assign({ msg: '可能学校服务器关闭', }, configData))
      return
    } var xq = new Date().getDay(); if (xq == 0) { xq = 7; } for (var y = 0; y < curriculum.length; y++) {
      zc = curriculum[y].zc
      if (curriculum[y].xq == "7" || curriculum[y].xq == 7) {
        zc = String(Number(curriculum[y].zc) - 1)
        curriculum[y].zc = zc
      } if (zc == util.getweekString() && curriculum[y].xq == xq) { course.push({ day: '今天', time: '第' + curriculum[y].jcdm[1] + '节', name: curriculum[y].kcmc, site: curriculum[y].jxcdmc, }) } course.sort(function (b, a) { return b.time.localeCompare(a.time, 'zh') })
    }
    personalInformation.curriculum = curriculum;
    wx.setStorageSync('personalInformation', personalInformation)
    if (course.length == 0) { msg = "今天没有课哟～" } that.setData(Object.assign({ course: course, show: '', msg: msg, }, configData))
  }
  that.onShow()
  function getData(){
    var PromiseAllArr = []; //*********************用来存多个Promise
    var urlData = [
      { url: "https://jwxt.gdupt.edu.cn/xskccjxx!getDataList.action", data: { 'xnxqdm': '', 'page': '1', 'rows': '500', 'sort': 'xnxqdm,kcbh,ksxzdm', 'order': 'asc', } },
      {url: "https://jwxt.gdupt.edu.cn/xsktsbxx!getYxktDataList.action", data: { 'xnxqdm': '', 'page': '1', 'rows': '100', 'sort': 'cjsj', 'order': 'desc', } },
      { url: "https://jwxt.gdupt.edu.cn/xsgrkbcx!getDataList.action", data: { 'xnxqdm': "202102", 'page': '1', 'rows': '1000', 'sort': 'kxh', 'order': 'asc', } },
      { url: "https://jwxt.gdupt.edu.cn/xskktzd!getDataList.action", data: { 'xnxqdm': "", 'page': '1', 'rows': '2000', 'sort': 'kcbh', 'order': 'asc', 'kcmc': '', 'kcfldm': '', 'kcdldm': '' }
      }
    ]
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", output = ""; var chr1, chr2, chr3, enc1, enc2, enc3, enc4; var i = 0; string = args.password.replace(/\r\n/g, "\n"); var utftext = ""; for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c); } else if ((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128); } else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128); } } var input = utftext; while (i < input.length) { chr1 = input.charCodeAt(i++); chr2 = input.charCodeAt(i++); chr3 = input.charCodeAt(i++); enc1 = chr1 >> 2; enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); enc4 = chr3 & 63; if (isNaN(chr2)) { enc3 = enc4 = 64; } else if (isNaN(chr3)) { enc4 = 64; } output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4); }
    wx.request({
      url: 'https://jwxt.gdupt.edu.cn/', method: 'post', success: function (res) {
        wx.request({
          url: 'https://jwxt.gdupt.edu.cn/login!doLogin.action', method: 'post', data: { account: args.username, pwd: output, verifycode: '' }, header: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json, text/javascript, */*; q=0.01', 'Cookie': res.cookies[0] }, success: function (res1) {
            if (res1.data.msg == "/login!welcome.action") {
              var header = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json, text/javascript, */*; q=0.01', 'Cookie': res.cookies[0] }
              for (var k = 0; k < urlData.length; k++) {
                PromiseAllArr.push(new Promise(function (resolve, reject) {
                  wx.request({
                    url: urlData[k].url,
                    data: urlData[k].data,
                    method: 'post',
                    header: header,
                    success: function (getinfo) {
                      wx.setStorageSync('time',new Date().getTime())
                      return resolve(getinfo.data);
                    },
                    fail: function (error) { return error; },
                    complete: function (complete) { return complete; } }) })) }              //*********************Promise存好了，现在来用
              Promise.all(PromiseAllArr).then(function (values) {

                var personalInformation = {
                  achievement:values[0].rows,
                  quality: values[1].rows,
                  curriculum: values[2].rows,
                  classTask: values[3].rows,
                }                //处理课表为0的问题，导致账户进不去
                if (personalInformation.curriculum.length == 0) {
                  personalInformation.curriculum = [{ "kcmc": "test", "jcdm": "" }]
                }
                wx.setStorageSync('personalInformation', personalInformation)
                that.onShow()
                wx.showToast({ title: '加载完成', icon: 'none', });
                // wx.request({
                //   url: 'https://www.biubbmk.cn/api_flask_zf/upData_GY', //仅为示例，并非真实的接口地址
                //   data: {
                //     username: args.username,
                //     password: args.password,
                //     personalInformation:wx.getStorageSync('personalInformation')
                //   },
                //   method: 'POST',
                //   header: {
                //     'content-type': 'application/json' // 默认值
                //   },
                //   success: function (res) {
                //     console.log("上传成功")
                //
                //   },
                // })
              }).catch(function (reason) {
                that.onShow()
                wx.showToast({ title: '本地完成', icon: 'none', });
              });
            } else { wx.clearStorageSync(); that.setData({ msg: '账号密码错误，请重新登录' }) }
          }
        })
      }, fail:function (res) {
        // wx.request({
        //   url: 'https://www.biubbmk.cn/api_flask_zf/getData_GY', //仅为示例，并非真实的接口地址
        //   data: {
        //     username: args.username,
        //     password: args.password,
        //
        //   },
        //   method: 'POST',
        //   header: {
        //     'content-type': 'application/json' // 默认值
        //   },
        //   success: function (res) {
        //     wx.setStorageSync('personalInformation',res.data)
        //     console.log("兜底成功")
        //
        //   },
        // })
      }
    })
  }
}
module.exports = runCode;