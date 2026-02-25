/*
** 平台API
** 主要是用到android、ios的系统接口，通过这里来转化
** Android: int(I) float(F) boolean(Z) String(Ljava/lang/String;)
** IOS中参数：NSNumber(float,int) BOOL(bool) NSString(string)
*/
cc.Class({
    extends: cc.Component,
    statics: {
        _callbackDic: null,  //保存注册回调函数
        _cbDataList: null,  //回调数据缓存
        _orientation: "portrait",
        _backPressedCall: null,  //返回按钮的回调函数

        _IOS_CLASS_NAME: 'PlatformIosApi', //ios类名
        _AND_CLASS_NAME: 'org/cocos2dx/javascript/PlatformAndroidApi', //android类名

        //初始化
        init: function () {
            let self = this
            //设置默认方向
            this._orientation = Global.APP_ORIENTATION

            if (Global.isAndroid()) {
                //手势操作的返回
                let backCall = function () {
                    if (self._backPressedCall) {
                        self._backPressedCall()
                    }
                }
                this.addCallback(backCall, "BackPressedCallback")
            }

        },

        /*以下是平台接口实现*/
        /*==============================================================================*/
        //获取app版本号
        getAppVersion: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getAppVersion', '()Ljava/lang/String;');
            }
            else {
                AppLog.warn('Browser call Function [getAppVersion]');
                return '1.0.0';
            }
        },

        //获取剪切板文本
        getTxtFromClipboard: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getTxtFromClipboard', '()Ljava/lang/String;');
            }
            else {
                AppLog.warn('Browser call Function [getTxtFromClipboard]');
                return '';
            }
        },

        //设置文本到剪切板
        setTxtToClipboard: function (txtStr) {
            if (Global.isNative()) {
                this.callPlatformApi('setTxtToClipboard', '(Ljava/lang/String;)V', txtStr);
            }
            else {
                AppLog.warn('Browser call Function [setTxtToClipboard]');
            }
        },
        // firebase log
        firebaseLog: function (logStr) {
            if (Global.isNative()) {
                this.callPlatformApi('firebaseLog', '(Ljava/lang/String;)V', logStr);
            }
            else {
                AppLog.warn('Browser call Function [firebaseLog]');
            }
        },
        // firebase 自定义事件打点
        firebaseEvent: function (eventName, data) {
            if (!eventName) {
                AppLog.warn('firebaseSetUserProperty need eventName !');
                return;
            }
            // 传递只能一个字符串参数 所以需要组装
            let params = {};
            params.eventName = eventName;
            if (data) params.data = data;
            cc.log("firebaseEvent", params, JSON.stringify(params));
            if (Global.isNative()) {
                this.callPlatformApi('firebaseEvent', '(Ljava/lang/String;)V', JSON.stringify(params));
            }
        },
        // firebase 设置用户属性 data:{key:"xxx", value:"xxx"}
        firebaseSetUserProperty: function (data) {
            if (!data) {
                AppLog.warn('firebaseSetUserProperty need param !');
                return;
            }
            if (Global.isNative()) {
                this.callPlatformApi('firebaseSetUserProperty', '(Ljava/lang/String;)V', JSON.stringify(data));
            } else {
                AppLog.warn('Browser call Function [firebaseSetUserProperty]');
            }
        },

        //打开app的url数据
        getOpenAppUrlDataStr: function () {
            if (Global.isNative() && cc.sys.isMobile) {
                return this.callPlatformApi('getOpenAppUrlDataString', '()Ljava/lang/String;');
            }
            else {
                if (cc.sys.isBrowser) {
                    AppLog.warn('Browser call Function [getOpenAppUrlDataStr]');
                }
                return null;
            }
        },
        clearOpenAppUrlDataStr: function () {
            if (Global.isNative()) {
                this.callPlatformApi('clearOpenAppUrlDataString', '()V');
            }
            else {
                AppLog.warn('Browser call Function [clearOpenAppUrlDataStr]');
            }
        },

        // //打开Gps设置
        // openGPSSetting: function () {
        //     if(Global.isNative()) {
        //         this.callPlatformApi('openGPSSetting', '()V');
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [openGPSSetting]');
        //     }
        // },

        // //是否开启了Gps
        // isOpenGPS: function () {
        //     if(Global.isNative()) {
        //         return this.callPlatformApi('isOpenGPS', '()Z');
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [isOpenGPS]');
        //         return false;
        //     }
        // },

        //开启评分(返回bool参数，主要考虑IOS10.3版本以下不能app内评分)
        openRating: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('openRating', '()Z');
            }
            else {
                AppLog.warn('Browser call Function [openRating]');
                return false;
            }
        },

        //应用内评分
        loadReview: function () {
            if (Global.isAndroid()) {
                this.callPlatformApi('loadReviewComment', '()V');
            }
            else {
                this.openRating()
            }
        },

        // //开始定位
        // startLocation: function ( callback ) {
        //     if(Global.isNative()) {
        //         this.callPlatformApi('startLocation', '()V');
        //         this.addCallback(callback, 'locationCbKey');
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [startLocation]');
        //     }
        // },

        // stopLocation: function () {
        //     if(Global.isNative()) {
        //         this.callPlatformApi('stopLocation', '()V');
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [stopLocation]');
        //     }
        // },

        setIosClassName(className) {
            this._IOS_CLASS_NAME = className
        },

        setAndroidClassName(className) {
            this._AND_CLASS_NAME = className
        },

        //设置返回按钮触发函数
        //需要底包支持，相当于自定义（手势操作）返回操作，物理实体键不用底包支持，但是实体键的手机基本没有了
        setBackPressCall: function (call) {
            this._backPressedCall = call
        },

        getBatteyLevel: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getBatteyLevel', '()F');
            }
            else {
                AppLog.warn('Browser call Function [getBatteyLevel]');
            }
        },

        //网页跳转
        openURL: function (urlStr) {
            if (Global.isNative()) {
                this.callPlatformApi('openURL', '(Ljava/lang/String;)V', urlStr);
            }
            else {
                cc.sys.openURL(urlStr);
            }
        },

        //打电话
        callPhone: function (phonenum) {
            if (Global.isNative()) {
                this.callPlatformApi('callPhone', '(Ljava/lang/String;)V', phonenum);
            }
            // else {
            //     cc.sys.openURL(urlStr);
            // }
        },

        // 获取游戏包名
        getPackageName: function () {
            if (Global.isNative()) {
                return this.callPlatformApi("getAPPBundleId", "()Ljava/lang/String;")
            }
            else {
                return "";
            }
        },

        //sdk登录
        fbLogin: function (callback) {
            if (Global.isNative()) {
                this.callPlatformApi('fbSdkLogin', '()V')
                this.addCallback(callback, 'fbLoginCb');
            }
            else {
                AppLog.warn('Browser call Function [SdkLogin]');
            }
        },

        //sdk登出
        fbLoginOut: function () {
            if (Global.isNative()) {
                this.callPlatformApi('fbSdkLoginOut', '()V')
            }
            else {
                AppLog.warn('Browser call Function [SdkLoginOut]');
            }
        },

        //facebook sdk分享
        /*
        * shareType 分享类型
        * 1 link分享（linkUrl:链接 content:内容）
        * 2 图片分享 （imagePath:本地图片路径）
         */
        fbShare: function (data, callback) {
            if (Global.isNative()) {
                this.callPlatformApi('fbSdkShare', '(Ljava/lang/String;)V', data)
                this.addCallback(callback, 'shareSdkCallback');
            }
            else {
                AppLog.warn('Browser call Function [SdkShare]');
            }
        },

        //打开FB
        //data json格式的字符串，平台里面自解
        OpenFB: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('OpenFB', '(Ljava/lang/String;)Z', data)
            }
            else {
                AppLog.warn('Browser call Function [OpenFB]');
            }
        },

        //应用内好友
        FBFriendsInApp: function (callBack) {
            if (Global.isNative()) {
                this.callPlatformApi('FbFriendsInApp', '()V')
                this.addCallback(callBack, 'FbFriendsInAppCallback');
            }
            else {
                AppLog.warn('Browser call Function [SdkShare]');
            }
        },

        //是否安装FB app
        isInstallFBApp: function () {
            if (Global.isNative()) {
                8
                return this.callPlatformApi('isInstallFB', '()I')
            }
            else {
                AppLog.warn('Browser call Function [isInstallFB]');
            }
        },


        //查询所有可售物品
        SdkQueryAllSKU: function (data) {
            if (Global.isNative()) {
                this.callPlatformApi('queryAllSKU', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [SdkQueryAllSKU]');
            }
        },

        // 主动连接Google支付服务器
        startConnectBillingService: function (data) {
            if (Global.isNative()) {
                if (Global.isAndroid()) {
                    this.callPlatformApi('startConnectBillingService', '()V')
                }
            }
            else {
                // AppLog.warn('Browser call Function [startConnectBillingService]');
            }
        },

        //Sdk支付
        SdkPay: function (data, callback) {
            if (Global.isNative()) {
                let funName = "SdkPay"
                if (Global.isIOS()) {
                    funName = "IosZF"
                }
                this.callPlatformApi(funName, '(Ljava/lang/String;)V', data)
                // this.addCallback(callback, 'paySdkCallback');
            }
            else {
                AppLog.warn('Browser call Function [IosZF]');
            }
        },

        //删除订单缓存
        SdkDelOrderCache: function (data) {
            if (Global.isNative()) {
                let funName = "SdkPayResult"
                if (Global.isIOS()) {
                    funName = "IosZFResult"
                }
                this.callPlatformApi(funName, '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [SdkDelOrderCache]');
            }
        },

        //尝试补单
        SdkReplaceOrder: function (data) {
            if (Global.isNative()) {
                let funName = "SdkPayReplacement"
                if (Global.isIOS()) {
                    funName = "IosZFReplacement"
                }
                this.callPlatformApi(funName, '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [SdkReplaceOrder]');
            }
        },


        //获取firebase推送的token标志，用于服务的单独推送
        GetFMCToken: function () {
            //目前只有android
            if (Global.isAndroid()) {
                return this.callPlatformApi("getFMCToken", "()Ljava/lang/String;")
            }
            // else{
            //     AppLog.warn('Browser call Function [GetFMCToken]');
            // }
        },

        ReGetFMCToken: function () {
            if (Global.isAndroid()) {
                this.callPlatformApi('reGetFMCToken', '()V')
            }
        },

        //获取渠道信息
        GetChannelStr: function () {
            if (Global.isAndroid()) {
                return this.callPlatformApi("getChannelstr", "()Ljava/lang/String;")
            }
            else {
                AppLog.warn('Browser call Function [getChannelstr]');
            }
        },
        //获取渠道扩张信息
        GetChannelExStr: function () {
            if (Global.isAndroid()) {
                return this.callPlatformApi("getChannelExStr", "()Ljava/lang/String;")
            }
            else {
                AppLog.warn('Browser call Function [getChannelExStr]');
            }
        },


        //复制内容
        Copy: function (data) {
            this.setTxtToClipboard(data)
        },

        //从粘贴板获取内容
        Paste: function () {
            return this.getTxtFromClipboard()
        },

        //保存图片到相册
        SaveToAlumb: function (file) {
            if (Global.isNative()) {
                return this.callPlatformApi('SaveToAlumb', '(Ljava/lang/String;)I', file)
            }
            else {
                AppLog.warn('Browser call Function [SaveToAlumb]');
            }
        },

        //保存http图片到相册
        // return 1  success
        SaveUrlToAlumb: function (file) {
            if (Global.isNative()) {
                return this.callPlatformApi('SaveUrlToAlumb', '(Ljava/lang/String;)I', file)
            }
            else {
                AppLog.warn('Browser call Function [SaveUrlToAlumb]');
            }
        },

        //
        IsCloner: function () {
            if (Global.isAndroid()) {
                return this.callPlatformApi('isCloner', '()I')
            }
            else {
                AppLog.warn('Browser call Function [isCloner]');
            }
        },

        // //是否安装微信app
        // isInstallWXApp:function(){
        //     if(Global.isNative()){
        //         return this.callPlatformApi('installWXApp','()I')
        //     }
        //     else{
        //         AppLog.warn('Browser call Function [installWXApp]');
        //     }
        // },

        // //打开微信app
        // openWXApp:function(){
        //     if(Global.isNative()){
        //         return this.callPlatformApi('openWXApp','()I')
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [openWXApp]');
        //     }
        // },

        // //微信登录
        // wxLogin:function(){
        //     if(Global.isNative()){
        //         this.callPlatformApi('wxLogin','()V')
        //     }
        //     else{
        //         AppLog.warn('Browser call Function [wxLogin]');
        //     }
        // },

        // //微信分享
        // wxShare:function(data){
        //     if(Global.isNative()){
        //         this.callPlatformApi('wxShare','(Ljava/lang/String;)V',data)
        //     }
        //     else{
        //         AppLog.warn('Browser call Function [wxShare]');
        //     }
        // },

        // //获取umeng渠道序号：目前GANGA  GANGB  GANGC
        // umChannel:function(){
        //     if(Global.isNative()){
        //         return this.callPlatformApi('getUMChannelIdx','()Ljava/lang/String;')
        //     }
        //     else{
        //         return "GANGA"
        //     }
        // },

        //获取唯一的设备id
        //android 获取android id
        //ios 获取idfa
        getDeviceId: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getDeviceId', '()Ljava/lang/String;')
            }
            else {
                //网页上没有
                return '0'
            }
        },

        //获取GSF ID
        getGSFId:function(){
            if(Global.isAndroid()){
                return this.callPlatformApi('getGSFId', '()Ljava/lang/String;')
            }
        },

        //获取simcard id
        getSimcardid:function(){
            if(Global.isAndroid()){
                return this.callPlatformApi('getSimacardid', '()Ljava/lang/String;')
            }
        },

        //Returns the MCC+MNC
        getSimOperator:function(){
            if(Global.isAndroid()){
                return this.callPlatformApi('getSimOperator', '()Ljava/lang/String;')
            }
        },

        requestContracts:function(){
            if(Global.isAndroid()){
                return this.callPlatformApi('requestContracts', '()V')
            }
        },

        getContracts:function(){
            if(Global.isAndroid()){
                return this.callPlatformApi('getContracts', '()Ljava/lang/String;')
            }
        },

        //获取设备品牌：小米_xiaomi,iphone6
        getDeviceBrand: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getDeviceBrand', '()Ljava/lang/String;')
            }
            else {
                return 'web'
            }
        },

        //获取设备操作系统版本
        getDeviceOpSysVision: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getDeviceOpSysVision', '()Ljava/lang/String;')
            }
            else {
                return 'web'
            }
        },

        //关闭闪屏
        closeSplash: function () {
            if (Global.isNative()) {
                this.callPlatformApi('closeSpalsh', '()V')
            }
        },

        //手机震动一下
        //nDur:1000ms
        deviceShock: function (nDur = 500) {
            // if(Global.getShake()){
            if (Global.isNative()) {
                this.callPlatformApi('phoneShock', '(Ljava/lang/String;)V', "" + nDur)
            }
            // }
        },

        setAppIconBadgeNumber: function (num) {
            if (Global.isIOS()) {
                this.callPlatformApi('closeSpalsh', '(Ljava/lang/String;)V', JSON.stringify({ badgeNum: num }))
            }
            else {
                AppLog.warn('Only IOS can call Function [setAppIconBadgeNumber]');
            }
        },

        //ios 获取设备令牌
        getDeviceToken: function () {
            if (Global.isIOS()) {
                return this.callPlatformApi('getDeviceToken', '()Ljava/lang/String;')
            }
            else {
                //网页上没有
                return '0'
            }
        },

        //谷歌检查未消耗的订单
        GPCheckUnComsumerOrder: function () {
            if (Global.isAndroid()) {
                this.callPlatformApi('gpCheckOwned', '()V')
            }
        },

        //google登录
        startGoogleLogin: function (callBack) {
            if (Global.isNative()) {
                this.addCallback(callBack, 'googleLoginCallback');
                this.callPlatformApi('googleLogin', '()V');

            }
            else {
                AppLog.warn('Browser call Function [startGoogleLogin]');
            }
        },

        //huawei
        isHuaweiServerAvailble: function () {
            if (Global.isAndroid()) {
                return this.callPlatformApi('isHuaweiServerAvailble', '()I')
            }
            else {
                AppLog.warn('Browser call Function [isHuaweiServerAvailble]');
            }
        },

        // bSilent: 1 静默， 0反之
        doHuaweiLogin: function (callBack, bSilent) {
            if (Global.isAndroid()) {
                this.addCallback(callBack, 'HuaweiLoginCallback')
                this.callPlatformApi('doHuaweiLogin', '(I)V', bSilent)

            }
        },

        //华为内购消耗
        doHuaweiPayComsumerOrder: function (data) {
            if (Global.isAndroid() && data) {
                this.callPlatformApi('doHuaweiPayComsumerOrder', '(Ljava/lang/String;)V', data)
            }
        },

        //华为数据打点
        doHuaweiTrackEvent: function (data) {
            if (Global.IsHuawei() && data) {
                var jsonStr = JSON.stringify(data)
                this.callPlatformApi('doHuaweiTrackEvent', '(Ljava/lang/String;)V', jsonStr)
            }
        },

        //苹果登录
        startAppleLogin: function (callback) {
            if (Global.isIOS()) { //只有ios才会有苹果登录
                this.addCallback(callback, 'appleLoginCallback');
                this.callPlatformApi('appleSignIn', '()V');

            }
            else {
                AppLog.warn('Browser call Function [startAppleLogin]');
            }
        },

        //记录ko打点
        //{EventName:'你的事件名称',EventValue:'你的事件数据（自定义json字符串）'}
        KoSDKTrackEvent: function (eventName, eventData) {
            var data = {}
            data.EventName = eventName
            data.EventValue = eventData
            if (Global.isNative()) {
                if (data) {
                    var jsonStr = JSON.stringify(data)
                    this.callPlatformApi('KoTrackEvent', '(Ljava/lang/String;)V', jsonStr)
                }
            }
        },

        //获取KO打点的唯一用户标志
        GetKoUUID: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('getKoTrackUUID', '()Ljava/lang/String;')
            }
        },

        /**
         * 
         *google广告 激励广告：视频类型
         * @param {*} callback 
         */
        showAdmobReward: function (callback) {
            if (Global.isNative()) {
                this.addCallback(callback, 'ShowAdmobCallback');
                this.callPlatformApi('loadAdMobRewardAd', '()V');
            }
            else {
                AppLog.warn('Browser call Function [showAdmobReward]');
            }
        },

        /***
         * google广告 横幅广告
         * pos:{left:10,right:10,top:360,bottom:50}
         */
        showAdmobBanner: function (bShow, pos) {
            if (Global.isNative()) {
                if (bShow) {
                    let param = JSON.stringify(pos)
                    AppLog.warn("bannerad:" + param)
                    if (Global.isAndroid()) {
                        this.callPlatformApi('loadAdmobBannerAd', '(Ljava/lang/String;)V', param);
                    }
                    else {

                        this.callPlatformApi('showAdmobBannerAd', '(Ljava/lang/String;)V', param);
                    }

                }
                else {
                    this.callPlatformApi('hideAdmobBannerAd', '()V');
                }

            }
            else {
                AppLog.warn('Browser call Function [showAdmobBanner]');
            }
        },

        // //加载
        // loadTradPlusRewardedVideo: function (adUnitId) {
        //     if(Global.isNative()) {
        //         this.callPlatformApi('loadTradPlusRewardedVideo', '(Ljava/lang/String;)V', adUnitId);
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [loadTradPlusRewardedVideo]');
        //     }
        // },

        // //显示
        // showTradPlusRewardedVideo: function (adUnitId) {
        //     if(Global.isNative()) {
        //         this.callPlatformApi('showTradPlusRewardedVideo', '(Ljava/lang/String;)V', adUnitId);
        //     }
        //     else {
        //         AppLog.warn('Browser call Function [showTradPlusRewardedVideo]');
        //     }
        // },

        //屏幕旋转
        setOrientation(orientation) {
            if (orientation != 'portrait' && orientation != 'landscape') return false;
            if (orientation == this._orientation) return false;
            this._orientation = orientation;
            if (Global.isNative()) {
                this.callPlatformApi('setOrientation', '(Ljava/lang/String;)V', orientation);
            }
            let frameSize = cc.view.getFrameSize();
            if (orientation == 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
                if (frameSize.width > frameSize.height) {
                    cc.view.setFrameSize(frameSize.height, frameSize.width);
                }
            } else if (orientation == 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
                if (frameSize.height > frameSize.width) {
                    cc.view.setFrameSize(frameSize.height, frameSize.width);
                }
            }

            if (CC_JSB) {
                window.dispatchEvent(new cc.Event.EventCustom('resize', true));
            }
            return true;
        },

        /**
         * 切换APP的icon
         * @param {*} data :"Icon1", ""则是恢复默认icon
         */
        changeAppIcon: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('changeAppIconWithName', '(Ljava/lang/String;)V', data)
            }

        },

        //打开相册
        //data json格式的字符串，平台里面自解
        //data{width:裁切的宽,height:裁切的长,size:图片大小，单位b,from:1相机 0相册,crop:1裁切，0不裁切}
        //callback返回{result:1 成功，0 失败，-1 取消，data:成功的时候，带base64格式的字符串}
        OpenTakephoto: function (data, callback) {
            if (Global.isNative()) {
                this.addCallback(callback, 'TakePhotoCallback');
                return this.callPlatformApi('takePhoto', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [OpenTakephoto]');
            }
        },
        // 检测是否获取到了麦克风权限
        checkSelfPermission() {
            if (Global.isAndroid()) {
                var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
                if (localAppVersion <= 180) {
                    return true;
                } else {
                    return "true" == this.callPlatformApi('checkSelfPermission', '()Ljava/lang/String;');
                }
            } else {
                // 默认都有
                return true;
            }
        },
        //加入语言室
        //data json格式的字符串，平台里面自解
        //data{token:"服务端下发的token",cname:"频道id,房间号",uid:"用户uid",otp:"额外字段，可不需要"}
        //callback:{result,data}
        //result:0,data:对应的错误码（可用浮窗提示）
        //result:1,data:{uid,mute:1,0} 禁言状态变化
        //result:2,data:{uid,vol} 谁在说话,音量多少。
        JoinVoiceChannel: function (data, callback) {
            if (Global.isNative()) {
                this.addCallback(callback, 'JoinVoiceChannelCallback');
                return this.callPlatformApi('joinVoiceChannel', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [joinVoiceChannel]');
            }
        },

        //禁言-自己
        //data:1禁言 0取消
        SetVoiceChannelLocalMute: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('setLocalMute', '(Ljava/lang/String;)V', "" + data)
            }
            else {
                AppLog.warn('Browser call Function [SetVoiceChannelLocalMute]');
            }
        },

        //禁言-别人
        //data json格式的字符串，平台里面自解
        //data:{uid:用户uid,mute:1/0}
        SetVoiceChannelRemteBute: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('setRemoteMute', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [SetVoiceChannelRemteBute]');
            }
        },

        //离开聊天室
        LevelVoiceChannel: function () {
            if (Global.isNative()) {
                return this.callPlatformApi('levelVoiceChannel', '()V')
            }
            else {
                AppLog.warn('Browser call Function [LevelVoiceChannel]');
            }
        },

        //发送邮件
        //data json格式的字符串，平台里面自解
        //sendway值：sendto:Intent.ACTION_SENDTO ; send:Intent.ACTION_SEND
        //data{sender:"邮件发给谁",title:"邮件标题",content:"邮件内容，可以使空串",sendway:"sendto"}
        SendMail: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('sendMail', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [sendMail]');
            }
        },

        //系统分享
        //data json格式的字符串，平台里面自解
        //data{imgUrl:"预览地址",title:"分享标题",content:"分享内容"} 
        systemShare: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('systemShare', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [systemShare]');
            }
        },

        //按照packname拉起来分享
        //packname:"com.whatsapp";//"org.telegram.messenger";//"com.facebook.orca";
        //data{packname:"",msgStr:""}
        packnameAppShare: function (data) {
            if (Global.isNative()) {
                return this.callPlatformApi('packageAppShare', '(Ljava/lang/String;)V', data)
            }
            else {
                AppLog.warn('Browser call Function [systemShare]');
            }
        },

        //归因
        //callBack返回参数
        //data{result:1,refUrl:“”,clicktime:“”,installtime:“”}
        //data{result:0,code:“”}
        installRef: function (callback) {
            if (Global.isAndroid() && !Global.IsHuawei()) {
                this.addCallback(callback, 'InstallReffCallback');
                this.callPlatformApi('googleInstallReff', '()V');

            }

        },

        //1启动时调用native代码
        launchCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('launchCallNative', '()V')
            }
        },

        //2启动完成时调用native代码
        launchEndCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('launchEndCallNative', '()V')
            }
        },

        //3登录时调用native代码
        loginCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('loginCallNative', '()V')
            }
        },
        //4登录完成时调用native代码
        loginEndCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('loginCallNative', '()V')
            }
        },

        //5加载时调用native代码
        loadingCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('loadingCallNative', '()V')
            }
        },

        //6加载完成时调用native代码
        loadingEndCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('loadingCallNative', '()V')
            }
        },

        //7游戏主界面调用native代码
        hallviewCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('hallviewCallNative', '()V')
            }
        },

        //8打开购买UI调用native代码
        openShopCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('openShopCallNative', '()V')
            }
        },

        //9支付按钮调用native代码
        payActionCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('payActionCallNative', '()V')
            }
        },

        //10进入游戏调用native代码
        enterGameCallNative: function () {
            if (Global.isIOS()) {
                this.callPlatformApi('enterGameCallNative', '()V')
            }
        },



        /*以下是函数方法的封装*/
        /*==============================================================================*/

        // 回调在注册到dic中
        addCallback: function (callback, callbackkey) {
            this._callbackDic = this._callbackDic || {};
            this._callbackDic[callbackkey] = callback;
        },

        //删除回调函数
        delCallback: function (callbackkey) {
            delete this._callbackDic[callbackkey];
        },

        // 触发回调（oc，java）
        trigerCallback: function (cbDataDic) {
            //json序列化
            cc.log("CallBackData:" + JSON.stringify(cbDataDic))
            /*if (cbDataDic.cbName) {
                if (this._callbackDic[cbDataDic.cbName]) {
                    this._callbackDic[cbDataDic.cbName](cbDataDic);
                }
                else {
                    AppLog.warn('Has not add ' + cbDataDic.cbName + ' in the cbDataDic!');
                }
            }
            else {
                AppLog.err('The callback data (cbDataDic.cbName) is not exist!');
            }*/

            this.pushCallbackDataToList(cbDataDic);
        },

        //paraments 参数，当多个参数时，用json字符串传入，平台端解开（多个返回值亦是如此）
        callPlatformApi: function (methodName, methodSignature, paraments) {
            // AppLog.warn('===【Call Api function】 : ' + methodName);
            if (Global.isAndroid()) {
                if (paraments) {
                    return jsb.reflection.callStaticMethod(this._AND_CLASS_NAME, methodName, methodSignature, paraments)
                }
                else {
                    return jsb.reflection.callStaticMethod(this._AND_CLASS_NAME, methodName, methodSignature)
                }
            }
            else if (Global.isIOS()) {
                if (paraments) {
                    return jsb.reflection.callStaticMethod(this._IOS_CLASS_NAME, methodName + ':', paraments);
                }
                else {
                    return jsb.reflection.callStaticMethod(this._IOS_CLASS_NAME, methodName);
                }
            }
            else {
                // AppLog.warn('Web Api is not Exit function : ' + methodName);
                return "";
            }
        },

        pushCallbackDataToList: function (cbDataDic) {
            this._cbDataList = this._cbDataList || [];
            this._cbDataList.push(cbDataDic);
        },

        //放到刷新函数中，防止异步线程直接回调，造成UI更新问题
        update: function () {
            if (this._cbDataList != null && this._cbDataList.length > 0) {
                var cbDataDic = this._cbDataList.shift();
                if (cbDataDic.cbName) {
                    if (this._callbackDic[cbDataDic.cbName]) {
                        this._callbackDic[cbDataDic.cbName](cbDataDic);
                    }
                    else {
                        AppLog.warn('Has not add ' + cbDataDic.cbName + ' in the cbDataDic!');
                    }
                }
                else {
                    AppLog.err('The callback data (cbDataDic.cbName) is not exist!');
                }
            }
        },
    },
});
