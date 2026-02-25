/*
** Manager the global variable
*/


var GlobalVar = cc.Class({
    extends: cc.Component,

    statics: {
  		// 登录游戏服地址
        loginServerAddress:"lo.rummyvip.com",

        localVersion:!CC_BUILD,
        publishMode:CC_BUILD,  //发布的时候需要改成true,启用子包
        openUpdate:true,
        openAutoLogin:true, //是否开启自动登陆
        
        //非常用的配置
        isReview: false,
        isAndroidReview: false,
        appId: 19,           //产品id 1 BB 4 Poly
        resVersion:"1.6.0.0",
        appVersion: '1.0.0',
        designSize: cc.size(1920 ,1080),
        centerPos: cc.v2(960 ,540),

        poly99:true,
        // 语言
        language:"en",
        
        // openAPIModel:false, //api模式登陆开关
        // tAccountServer:"tlogin.poly99online.com", //测试账号的服务器
        // loginStateUrl:"https://state.poly99online.com/",//登录状态检测地址
        fackbookLink:"",     //fackbook链接  rummyslots/cashheroslots/...
        apiUrl:"https://inter.rummyvip.com",
        //提审
        haoUrl:"https://inter.rummyvip.com/hao.html",
        otpurl:"https://service.rummyvip.com/sms/dosend",
        openInstallReff:true,
        
    },
});
window.Global = GlobalVar;
