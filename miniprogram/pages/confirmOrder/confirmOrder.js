// miniprogram/pages/confirmOrder/confirmOrder.js
import Toast from '@vant/weapp/toast/toast';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: '', //页面传过来的时间
    isShowHistory: false, //是否在查看历史订单
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    fileURL: app.globalData.fileURL,
    imgUrl: '../../../../images/test.jpg',
    userInfo: {},
    list: [], //列表
    _id: 0,
    totalNum: 0, //总数
    totalPrice: 0, //总价
    // number: '', //输入的编号------------
    tmpArr: app.globalData.tmpArr,
    // phone: '',//输入的手机号
    classes: [], //选择菜的种类
    orderList: [], //选择的菜
    totalPrice: 0, //购物车总价
    popup_show: false, //下弹框显示
    isTime: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(options)
    // //加载动画
    // Toast.loading({
    //   duration: 0,
    //   mask: true,
    //   message: '加载中...'
    // });
    if (options.detail != undefined) {
      that.setData({
        isShowHistory: true,
        detail: options.detail
      })
    }
    let _id = wx.getStorageSync('_id');
    let userInfo = wx.getStorageSync('userInfo');
    let list = wx.getStorageSync('list'); //提交的订单
    let totalPrice = wx.getStorageSync('totalPrice'); //总价
    let totalNum = wx.getStorageSync('totalNum'); //总数
    that.setData({
      _id: _id,
      list: list,
      totalPrice: totalPrice,
      totalNum: totalNum,
      userInfo: userInfo,
    })
    console.log('-------')
    console.log(userInfo)
  },
  //编号输入------------------
  // onNumberChange(e) {
  //   // console.log(e)
  //   let that = this;
  //   that.setData({
  //     // number: e.detail
  //   })
  // },
  //手机号输入
  // onPhoneChange(e) {
  //   console.log(e)
  //   let that = this;
  //   that.setData({
  //     phone: e.detail
  //   })
  // },
  //步进器变化
  onStepChange(e) {
    let that = this;
    let num = e.detail; //当前菜的数量
    let idx1 = e.currentTarget.dataset.idx1; //种类index
    let idx2 = e.currentTarget.dataset.idx2; //菜index
    let item = e.currentTarget.dataset.item; //当前菜的细节
    let orderList = []; //订单内容
    let totalNum = 0; //总数
    let totalPrice = 0; //总价钱
    let list = that.data.list; //所有菜品
    let now = new Date();
    let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);//16
    //当前时间大于当天16点
    if (now.getTime() > deadline.getTime()) {
      this.setData({
        isTime: false
      })
      Toast("抱歉，当前时间已超过16:00，您无法修改订单。")
    } else {
      this.setData({
        isTime: true
      })
    list[idx1].items[idx2].num = num;
    that.setData({
      list: list
    });
    //过滤num=0的菜品
    list.forEach(item_class => {

      let temp = item_class.items.filter(function (item) {
        return item.num != 0;
      });
      if (temp.length != 0) {
        orderList = orderList.concat(temp)
      }
    })
    if (orderList.length == 0) {
      that.setData({
        popup_show: false
      })
    }
    // 计算总共需要花费的钱
    orderList.forEach(each => {
      totalNum += each.num;
      totalPrice += (each.num * each.price * 100);
    })
    that.setData({
      orderList: orderList,
      totalPrice: totalPrice,
      totalNum: totalNum
    });
  }
  },
  //更新
  onUpdate: async function () {
    let that = this;
    let userInfo = that.data.userInfo; //用户个人信息
    let userId = userInfo.userId; //用户缓存中的编号
    // let number = that.data.number; //用户编号-----------
    // let phone = that.data.phone;//用户手机号
    let list = that.data.list; //全部列表内容
    let _id = that.data._id;
    let totalNum = that.data.totalNum; //数量
    let totalPrice = that.data.totalPrice / 100; //总价
    let orderList = []; //订单内容
    let sendData = []
    // if (userInfo.userId == number) {
      //过滤num=0的菜品
      list.forEach(item_class => {

        let temp = item_class.items.filter(function (item) {
          return item.num != 0;
        });
        console.log(temp)
        if (temp.length != 0) {
          temp.forEach(item => {
            orderList = orderList.concat(item._id + ',' + item.num)
          })
        }
      });
      if (totalNum==0){
        wx.request({
          url:'https://dingcan.meetingcn.cn/dingcan/Order/delete?_id='+(that.data._id)+'&createdTime='+(that.formatDateforSQL(new Date()))+'&completedTime='+('')+'&userId='+(userInfo.userId)+'&phone='+(0)+'&orderList='+(orderList.join(';'))+'&totalNum='+(totalNum)+'&totalPrice='+(totalPrice),
          method: 'DELETE',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res)
            if (res.statusCode == 200) {
                Toast({
                  type: 'success',
                  message: '删除订单成功',
                  onClose: () => {
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  }
                });
            } else {
              Toast.fail('系统错误');
            }
          },
          fail(err) {
            console.log(err)
            Toast.fail('系统错误');
          }
        })
      }else{
        wx.request({
          url:'https://dingcan.meetingcn.cn/dingcan/Order/update?_id='+(that.data._id),// 通过_id查询用户数据
          method: 'PUT',
          data: {
            "createdTime": that.formatDateforSQL(new Date()),
            "completedTime": '',
            "userId": userInfo.userId,
            "phone": 0,
            "orderList": orderList.join(';'),
            "totalNum": totalNum,
            "totalPrice": totalPrice
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res)
            if (res.statusCode == 200) {
                Toast({
                  type: 'success',
                  message: '修改订单成功',
                  onClose: () => {
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  }
                });
            } else {
              Toast.fail('系统错误');
            }
          },
          fail(err) {
            console.log(err)
            Toast.fail('系统错误');
          }
        })
      }
  },
  //提交
  onSubmit: async function () {
    let that = this;
    let userInfo = that.data.userInfo; //用户个人信息
    let userId = userInfo.userId; //用户缓存中的编号
    // let number = that.data.number; //用户编号-----------
    // let phone = that.data.phone;//用户手机号
    let list = that.data.list; //全部列表内容
    let totalNum = that.data.totalNum; //数量
    let totalPrice = that.data.totalPrice / 100; //总价
    let orderList = []; //订单内容
    // if (userInfo.userId == number) {
      //过滤num=0的菜品
      list.forEach(item_class => {

        let temp = item_class.items.filter(function (item) {
          return item.num != 0;
        });
        console.log(temp)
        if (temp.length != 0) {
          temp.forEach(item => {
            orderList = orderList.concat(item._id + ',' + item.num)
          })
        }
      });
      console.log(orderList)
      wx.request({
        url: app.globalData.requestURL + '/Order/insert', // 通过openid查询用户数据
        method: 'POST',
        data: {
          "createdTime": that.formatDateforSQL(new Date()),
          "completedTime": '',
          "userId": userInfo.userId,
          "phone": 0,
          "orderList": orderList.join(';'),
          "totalNum": totalNum,
          "totalPrice": totalPrice
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res)
          if (res.statusCode == 200) {
              Toast({
                type: 'success',
                message: '下单成功',
                onClose: () => {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }
              });
          } else {
            Toast.fail('系统错误');
          }
        },
        fail(err) {
          console.log(err)
          Toast.fail('系统错误');
        }
      })
  },
  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  toSend: async function () {
    let that = this;
    let list = that.data.list;
    let now = that.formatDate(new Date());
    let totalPrice = that.data.totalPrice.toString();
    let totalPriceList = totalPrice.split('');
    totalPriceList.splice(-2, 0, '.');
    totalPrice = totalPriceList.join('');
    console.log(totalPrice)
    let blank = '';
    list.forEach(classList => {
      classList.items.forEach(item => {
        if (item.num > 0) {
          blank = item.name;
        }
        if (blank.length != 0) {
          return;
        }
      });
      if (blank.length != 0) {
        return;
      }
    })
    let sendValue = {
      //订单内容，20字以内字符
      thing9: {
        value: blank + "等"
      },
      //订单金额，1个币种符号+10位以内纯数字，可带小数，结尾可带“元”
      amount8: {
        value: totalPrice + '元'
      },
      //下单时间，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
      date7: {
        value: now
      },
      //温馨提示，20个以内字符
      thing5: {
        value: '明日取餐时间：16:00~18:00'
      }
    }
    console.log(sendValue)
    wx.requestSubscribeMessage({
      //[每日食谱提醒，下单成功]
      tmplIds: that.data.tmpArr,
      success: async function (res_mes) {
        console.log(res_mes);
        if (res_mes.q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI == 'accept') {

          wx.request({
            url: app.globalData.requestURL + '/Users/wxMessageSendOrder',
            method: 'POST',
            data: {
              "touser": that.data.userInfo._openid,
              "template_id": "q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI",
              "data": sendValue
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              console.log(res)
                if (res.data.errcode == 0) {
                  Toast({
                    type: 'success',
                    message: '下单成功',
                    onClose: () => {
                      wx.reLaunch({
                        url: '../index/index',
                      })
                    }
                  });
              } else {
                Toast.fail('系统错误');
              }
            },
            fail(err) {
              console.log(err)
              Toast.fail('系统错误');
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  toDelete: async function () {
    let that = this;
    let userInfo = that.data.userInfo; //用户个人信息
    let userId = userInfo.userId; //用户缓存中的编号
    let list = that.data.list; //全部列表内容
    let _id = that.data._id;
    let totalNum = that.data.totalNum; //数量
    let totalPrice = that.data.totalPrice / 100; //总价
    let orderList = []; //订单内容
    let sendData = []
    // if (userInfo.userId == number) {
      //过滤num=0的菜品
      list.forEach(item_class => {

        let temp = item_class.items.filter(function (item) {
          return item.num != 0;
        });
        console.log(temp)
        if (temp.length != 0) {
          temp.forEach(item => {
            orderList = orderList.concat(item._id + ',' + item.num)
          })
        }
      });
    wx.request({
      // url:'https://dingcan.meetingcn.cn/dingcan/Order/update?_id='+(that.data._id),// 通过_id查询用户数据
      url:'https://dingcan.meetingcn.cn/dingcan/Order/delete?_id='+(that.data._id)+'&createdTime='+(that.formatDateforSQL(new Date()))+'&completedTime='+('')+'&userId='+(userInfo.userId)+'&phone='+(0)+'&orderList='+(orderList.join(';'))+'&totalNum='+(totalNum)+'&totalPrice='+(totalPrice),
      // url: app.globalData.requestURL + '/Order/delete',
      method: 'DELETE',
      // data: {
      //   "_id":that.data._id,
      //   "createdTime": that.formatDateforSQL(new Date()),
      //   "completedTime": '',
      //   "userId": userInfo.userId,
      //   "phone": 0,
      //   "orderList": orderList.join(';'),
      //   "totalNum": totalNum,
      //   "totalPrice": totalPrice
      // },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        if (res.statusCode == 200) {
            Toast({
              type: 'success',
              message: '删除成功',
              onClose: () => {
                wx.reLaunch({
                  url: '../index/index',
                })
              }
            });
        } else {
          Toast.fail('系统错误');
        }
      },
      fail(err) {
        console.log(err)
        Toast.fail('系统错误');
      }
    })
  },
  formatDate(date) {
    let that = this;
    date = new Date(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = that.overTen(date.getHours());
    let minute = that.overTen(date.getMinutes());
    return year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute;
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  },
  // 2020-04-04 00:00:00
  formatDateforSQL(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${this.overTen(date.getMonth() + 1)}-${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}:${this.overTen(date.getSeconds())}`;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // Toast.clear();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})