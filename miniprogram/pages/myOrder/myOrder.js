// miniprogram/pages/myOrder/myOrder.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp();
const newDay = app.globalData.newDay;
const firstTime = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 0, 0, 0).getTime();
const finalTime = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 16, 0, 0).getTime();
const minDay = new Date(newDay.getTime() - 14 * 24 * 60 * 60 * 1000);
const maxDay = new Date(newDay.getTime() + 1 * 24 * 60 * 60 * 1000);
// console.log(newDay);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    allDishes: wx.getStorageSync('allDishes'),
    activeTab: 0, //标签页
    date: '',
    calendarShow: false,
    defaultDate: newDay.getTime(),
    minDate: new Date(minDay.getFullYear(), minDay.getMonth(), minDay.getDate()).getTime(),
    maxDate: new Date(maxDay.getFullYear(), maxDay.getMonth(), maxDay.getDate()).getTime(),
    // _id: 0,
    list: [],
    totalPrice: 0,
    isTime: true,
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //加载动画
    // Toast.loading({
    //   duration: 0,
    //   mask: true,
    //   message: '加载中...'
    // });
    let that = this;
    let start = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate());
    let end = new Date(newDay.getTime() + 1 * 24 * 60 * 60 * 1000);
    let userInfo = wx.getStorageSync('userInfo');
    // let allDishes = wx.getStorageSync('allDishes');
    if (userInfo == {} || userInfo == '' || userInfo == []) {
      Dialog.confirm({
        title: '身份验证',
        message: '为了更好的使用该小程序的其他功能，请您先进行身份验证',
        confirmButtonText: "身份验证",
        zIndex: 102,
        overlayStyle: {
          zIndex: 101
        }
      }).then(() => {
        // on confirm
        // wx.navigateTo({
        //   url: '../check/check',
        // })
        wx.reLaunch({
          url: '../check/check',
        })
      }).catch(() => {
        // on cancel
        wx.reLaunch({
          url: '../index/index',
        })
      });
    } else {
      that.setData({
        userInfo: userInfo
      });
      that.onList(userInfo, start, end);
    }

    // let date = new Date();
    that.setData({
      date: `${this.formatDate(start)} - ${this.formatDate(end)}`
    });

  },
  //标签页
  // onTabsChange(event) {
  //   console.log(event)
  //   wx.showToast({
  //     title: `切换到标签 ${event.detail.name}`,
  //     icon: 'none'
  //   });
  // },
  onCalendarShow() {
    console.log('onshow')
    this.setData({
      calendarShow: true
    });
  },
  onCalendarClose() {
    this.setData({
      calendarShow: false
    });
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  },
  // 04/04（月/日）
  formatDate(date) {
    date = new Date(date);
    return `${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())}`;
  },
  // 2020/3/26 14:23
  fullFormatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}/${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}`
  },
  onCalendarConfirm: function (date) {
    console.log(date)
    let that = this;
    const [start, end] = date.detail;
    let userInfo = that.data.userInfo;
    that.setData({
      calendarShow: false,
      date: `${this.formatDate(start)} - ${this.formatDate(end)}`
      // date: this.formatDate(event.detail)
    });
    that.onList(userInfo, start, end);
  },
  onList: async function (userInfo, start, end) {
    //加载动画
    // Toast.loading({
    //   duration: 0,
    //   mask: true,
    //   message: '加载中...'
    // });
    let that = this;

    wx.request({
      url: app.globalData.requestURL + '/Order/get', // 获取用户订单列表
      method: 'GET',
      data: {
        // createdTime: '2020-09-17 00:00:00', // 测试数据
        // createdTimeend: '2020-09-20 00:00:00',
        userId: userInfo.userId,
        createdTime: that.formatDateforSQL(start),
        createdTimeend: that.formatDateforSQL(end)
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        let result = res.data;
        // let now = new Date();
        // let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);//16
        // //当前时间大于当天16点
        // if (now.getTime() > deadline.getTime()) {
        //   this.setData({
        //     isTime: false
        //   })
        //   Toast("抱歉，当前时间已超过16:00，您无法删除订单。")
        // } else {
        //   this.setData({
        //     isTime: true
        //   })
        // }
        let totalPrice = 0;
        let list = [{}]; //整理好的内容列表
        let tempDateList = []; //日期列表
        result.forEach(item => {
          let _id = that._id;
          let today = new Date().getTime();
          // let tempDate = new Date(item.createdTime).getTime();
          let tempDate = that.dateToTimestamp(item.createdTime);
          let tempDate_format = that.formatDate(tempDate);

          if (tempDate >= firstTime && today < finalTime) {
            item.completed = 0; //已下单，可修改
          } else {
            item.completed = 1; //正在处理，不可修改
          }
          if (item.completedTime) {
            console.log(totalPrice)
            let completedDate = that.dateToTimestamp(item.completedTime);
            totalPrice += item.totalPrice;
            item.completedTime_format = that.fullFormatDate(completedDate);
            item.completed = 2; //已完成，可评价，需要在后台系统控制
          }

          item.createdTime_format = that.fullFormatDate(tempDate);
          if (tempDateList.indexOf(tempDate_format) == -1) {
            tempDateList.push(tempDate_format)
          }
        });

        for (let i = 0; i < tempDateList.length; i++) {
          list[i] = {};
          list[i].formatDate = tempDateList[i];
          list[i].items = [];
          // list[i]._id = 
          result.forEach(item => {
            let _id = that._id;
            let tempDate = that.dateToTimestamp(item.createdTime);
            let tempDate_format = that.formatDate(tempDate);
            if (tempDate_format == tempDateList[i]) {
              list[i].items.push(item)
            }
          })
        }

        that.setData({
          // _id: _id,
          list: list,
          totalPrice: totalPrice
        });
        Toast.clear();
      },
      fail(err) {
        Toast.clear()
        console.log(err)
        Toast.fail('系统错误');
      }
    })
  },
 toDelete(){


 },
  //跳转评价页面
  toRate(e) {
    console.log(e)
    wx.navigateTo({
      url: '../rate/rate',
    })
  },
  //查看订单
  toShow: function (e) {
    console.log('------0000000---------')
    console.log(e)
    let that = this;

    let idx1 = e.currentTarget.dataset.idx1;
    let detail = e.currentTarget.dataset.item;
    let orderList = detail.orderList;
    let formatDate = that.data.list[idx1].formatDate;
    let classes = [];
    let dishDetailList = [];
    console.log(orderList)
    let orderListArr = orderList.split(';')
    console.log(orderListArr)
    orderListArr.forEach(item => {
      let dish = that.getDishDetail(item)
      if (dish) {
        dishDetailList.push(dish)
      }
    })
    // let list = [{}];
    // dishDetailList.forEach(item => {
    //   let className = item.className;
    //   if (classes.indexOf(className) == -1) {
    //     classes.push(className);
    //     list.push({
    //       className: className,
    //       items:[item]
    //     })
    //   }else{

    //   }
    // })
    // 整理class列表
    for (let i = 0; i < dishDetailList.length; i++) {
      let className = dishDetailList[i].className;
      if (classes.indexOf(className) == -1) {
        classes.push(className);
      }
    }
    //list初始化
    let list = [{}];
    for (let i = 0; i < classes.length; i++) {
      let className = classes[i];
      list[i] = {};
      list[i].className = className;
      list[i].items = dishDetailList.filter(item => item.className == className);
      list[i].id = i;
    }
    wx.setStorageSync('_id', detail._id);
    wx.setStorageSync('list', list);
    wx.setStorageSync('totalNum', detail.totalNum);
    wx.setStorageSync('totalPrice', detail.totalPrice * 100);
    console.log(list)
    wx.navigateTo({
      url: '../confirmOrder/confirmOrder?detail=' + formatDate,
    })
  },
   //修改订单
//    toChange: function (e) {
//     console.log(e)
//     const that = this
//     // console.log('toTakeAway');
//     let now = new Date();
//     let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
//     //当前时间大于当天16点
//     if (now.getTime() > deadline.getTime()) {
//       Toast("抱歉，当前时间已超过16:00，您无法修改订单。")
//     } else {
//       wx.requestSubscribeMessage({
//         tmplIds: that.data.autoTmpArr,
//         success(res) {
//           console.log(res)
//         },
//         fail(err) {
//           console.log(err)
//         }
//       })
//       //当前时间小于当天16点
//       wx.navigateTo({
//         url: '../takeAway/takeAway',
//       })
//   }
// },
  // 正则表达式解析菜品和数量
  getDishDetail(string) {
    let that = this;
    let id = parseInt(/^\d+/.exec(string)[0]);
    let num = parseInt(/\d+$/.exec(string)[0]);
    let allDishes = that.data.allDishes;
    return {
      ...allDishes.filter(item => item._id == id)[0],
      num: num
    } || null
  },
  // 2020-04-04 00:00:00
  formatDateforSQL(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${this.overTen(date.getMonth() + 1)}-${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}:${this.overTen(date.getSeconds())}`;
  },
  dateToTimestamp(dateStr) {
    if (!dateStr) {
      return ''
    }
    let newDataStr = dateStr.replace(/\.|\-/g, '/')
    let date = new Date(newDataStr);
    let timestamp = date.getTime();
    return timestamp
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    Toast.clear();
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