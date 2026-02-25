cc.Class({
    extends: cc.Component,

    properties: {
    },

    // //异常捕获
    // getGameJsError: function () {
    //     let handleError = function (...args) {
    //         let data = { args }
    //         // 写入firebase自定义日志 奔溃时准备上报(需要底包版本大于120)
    //         var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
    //         if (localAppVersion >= 120 && cc.vv.PlatformApiMgr && cc.vv.PlatformApiMgr.firebaseLog) {
    //             cc.vv.PlatformApiMgr.firebaseLog(JSON.stringify(data));
    //         }
    //         if (cc.vv.AlertView) {
    //             // cc.vv.AlertView.showTips(JSON.stringify(data))
    //         }
    //         if (StatisticsMgr && StatisticsMgr.errorReport) {
    //             StatisticsMgr.errorReport("JS:Error", JSON.stringify(data))
    //         }
    //     }
    //     if (cc.sys.isNative) {
    //         let __handler
    //         if (window['__errorHandler']) {
    //             __handler = window['__errorHandler']
    //         }
    //         window['__errorHandler'] = function (...args) {
    //             handleError(...args)
    //             if (__handler) {
    //                 __handler(...args)
    //             }
    //         }
    //     }
    //     if (cc.sys.isBrowser) {
    //         let __handler;
    //         if (window.onerror) {
    //             __handler = window.onerror
    //         }
    //         window.onerror = function (...args) {
    //             handleError(...args)
    //             if (__handler) {
    //                 __handler(...args)
    //             }
    //         }
    //     }
    // },

    onLoad() {
        // this.getGameJsError()
        require('AppLog');
        require('GlobalVar');
        require('MsgIdDef');
        require('EventDef');
        require('GlobalCfg');
        require('GlobalFunc');
        require('MsgIdConfig');
        require('GlobalTools');

        AppLog.ShowScreen('开始加载代码')
        // 补充判断一下
        Global.isAndroid = function () {
            if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative && jsb) {
                return true;
            }
            return false;
        }
        Global.isIOS = function () {
            if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative && jsb) {
                return true;
            }
            return false;
        }
        // 判断是否是独立版本
        Global.isSingle = function () {
            return false;
        }
        //生成一个唯一标识码
        // if (!Global.getLocal('client_uuid', false)) {
        //     Global.saveLocal('client_uuid', '' + (new Date()).getTime() + Math.random(1, 9999999));
        // }
        cc.macro.DOWNLOAD_MAX_CONCURRENT = 20
        cc.macro.ENABLE_MULTI_TOUCH = false
        cc.debug.setDisplayStats(false)
        Global.autoAdaptDevices(false);
        //launch 进度条的最大值
        this._launProMax = Math.random(0, 1)
        Global.resVersion = Global.getLocal('c_resv', '1.0.0.0')
        AppLog.ShowScreen('resvision：'+Global.resVersion)
        cc.vv = {};
        // 全局定时器
        let timer = require('TimerMgr');
        timer.init();
        cc.vv.Timer = timer
        //声音管理
        var audioMgr = require('AudioManager');
        audioMgr.init();
        cc.vv.AudioManager = audioMgr;
        //事件管理
        cc.vv.EventManager = require('EventManager');
        //网络管理
        var netMgr = require('NetManagerEx');
        netMgr.init();
        cc.vv.NetManager = netMgr;
        //原生平台Api管理
        var platformApiMgr = require('PlatformApi');
        platformApiMgr.init();
        cc.vv.PlatformApiMgr = platformApiMgr;

        //统计（打点数据上报服务端）
        require('StatisticsMgr');
        StatisticsMgr.startReport();
        StatisticsMgr.reqReport = (eventName, extData, gameid, objId) => {
            if (!eventName) return
            var req = { c: MsgId.REQ_REPORT_STATISTICS };
            req.act = eventName;
            req.ext = extData || "";
            //获取是否在游戏内
            let bInGame = cc.vv.gameData && cc.vv.gameData.getGameId()
            if (!bInGame) {
                bInGame = 0
            }
            req.gameid = gameid || bInGame //如果在游戏内，否则可能为0
            req.id = objId      //当前对象的id
            cc.vv.NetManager.send(req, true);
        }

        
        // 支付管理
        let payMgr = require('PayMgrEx');
        payMgr.init();
        cc.vv.PayMgr = payMgr;
        // FB管理器
        let fbMgr = require('FBMgr');
        fbMgr.init();
        cc.vv.FBMgr = fbMgr;
        // 弹窗管理器
        let PopupManager = require('PopupManager');
        PopupManager.init();
        cc.vv.PopupManager = PopupManager;
        // 红点管理器
        let RedHitManager = require('RedHitManager');
        RedHitManager.init();
        cc.vv.RedHitManager = RedHitManager;
        // 广播管理器
        cc.vv.BroadcastManager = require('../../../_FWExpand/Broadcast/BroadcastManager').BroadcastManager;
        cc.vv.BroadcastManager.broadcastPrefabPath = "BalootClient/BaseRes/prefabs/Broadcast"
        cc.vv.BroadcastManager.giftAnimPrefabPath = "BalootClient/UserInfo/prefabs/PopupGiftAnim"
        cc.vv.BroadcastManager.init();
        // 多语言管理器
        cc.vv.i18nManager = require('../../../_FWExpand/i18n/i18nManager').i18nManager;
        cc.vv.i18nLangEnum = require('../../../_FWExpand/i18n/i18nConst').i18nLangEnum;
        // 资源管理器
        cc.vv.ResManager = require('ResManager');
        // 用户配置
        cc.vv.UserConfig = require('UserConfig');
        // 用户配置
        cc.vv.FilterWordConfig = require('FilterWordConfig');
        // 加载新的打点配置
        require('ReportConfig');

        

        if (cc.sys.isNative) {
            
            
            let packageName = cc.vv.PlatformApiMgr.getPackageName();
            this._packName = packageName

            AppLog.log("@@@@@@@@@@@@@packageName:" + packageName);
            if (packageName) {

                packageName = packageName.toLowerCase();
                if(((Global.appId == Global.APPID.YonoGames) && (packageName == "com.yono.games.free" || packageName == "com.jrwork.game.org" || packageName == "com.yonobet.game.org"
                || packageName == "com.yooffice.pro.game" || packageName == "com.perez.joy.game"))
                || ((Global.appId == Global.APPID.RummyVIP) && (packageName == "com.game.rummyvip.free" ))
                ){
                    //right
                }
                else if(packageName == "com.yono.games.free.test"){
                    Global.testPack = true
                }
                else{
                    //inavaild boundid
                    cc.game.end()
                }

                // if (packageName == "com.sekiengame.pokerhero.huawei") {
                //     Global.appId = Global.APPID.PokerHero_HW
                //     Global.openAutoLogin = false
                //     Global.isAndroidReview = false
                // }
                // else if (packageName == "com.sekiengame.durakhero.huawei") {
                //     Global.appId = Global.APPID.PokerHero_Durak_HW
                //     Global.openAutoLogin = false
                //     Global.isAndroidReview = false
                // }
                // else if (packageName == "test.com.pokerhero") {//测试包，实际包名还是和正式版一样
                //     Global.appId = Global.APPID.TestPokerHero
                //     Global.loginServerAddress = '116.62.136.51:9610'
                //     Global.apiUrl = 'http://116.62.136.51:9618'
                //     Global.haoUrl = 'http://116.62.136.51:9618/hao.html'
                //     Global.isAndroidReview = false
                // }
                // let index = packageName.indexOf(name);
                // Global.poly99 = index>=0;
                // if(index<0){
                //     name = "test";
                //     index = packageName.indexOf(name);
                //     if(index>=0) {
                //         Global.localVersion = true;
                //         Global.poly99 = true;
                //     }
                // }
            }
        }

        

        // if (Global.isDurakApp()) {
        //     cc.vv.i18nManager.setLanguage(cc.vv.i18nLangEnum.EN)
        // }

        let gameDataCfg = require('GameDataCfg');
        cc.vv.GameDataCfg = gameDataCfg;
        cc.vv.GameDataCfg.init();

        let gameInit = require("GameInit");
        gameInit.init();

        let FloatTips = require("FloatTipEx");
        cc.vv.FloatTip = new FloatTips();

        let AlertViewMgr = require("AlertViewMgr");
        cc.vv.AlertView = new AlertViewMgr();
        cc.vv.AlertView.init("BalootClient/BaseRes/prefabs/poly99_AlterView")

        let sceneMgr = require("SceneMgr");
        cc.vv.SceneMgr = sceneMgr;

        let node = new cc.Node();
        node.addComponent('subGameMgr');
        cc.vv.SubGameUpdateNode = node;
        cc.game.addPersistRootNode(node);

        //游戏管理
        if (!cc.vv.GameManager) {
            var gameMgr = require('GameManagerEx');
            gameMgr.init();
            cc.vv.GameManager = gameMgr;
        }

        //用户数据管理
        var userMgr = require('UserManagerEx');
        userMgr.init();
        cc.vv.UserManager = userMgr;

        // Json加载管理
        let jsonMgr = require("JsonMgr")
        cc.vv.JsonMgr = new jsonMgr()
        cc.vv.JsonMgr.Init()

        //头像管理器
        let HeadManager = require('HeadManager');
        HeadManager.init();
        cc.vv.HeadManager = HeadManager;

        //全局临时数据
        cc.vv.Data = {}
        cc.vv.FloatTip.init("BalootClient/BaseRes/prefabs/poly99_FloatTip");
        this.loadLoadingTip();
        // this.loadAlterView();
        AppLog.ShowScreen('加载代码完成')

        //新增定制项目接口
        let yd_pro = require('YD_Pro')
        cc.vv.YDPRO = yd_pro
        cc.vv.YDPRO.init()

        // 读取是否具有H5的账号
        // this.readClipboardReqLogin();

        if (cc.sys.isNative && !this._isClonerAPP()) {
            StatisticsMgr.httpReport(StatisticsMgr.HTTP_LAUNCH)
        }
    },

    //生成客户端ID
    generalClientuuid() {
        //生成一个唯一标识码
        //如果没有本地的client_uuid,才取新的, 或者没有登陆过
        let preLoginStr = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
        if (!Global.getLocal('client_uuid', false) || !preLoginStr) {
            let did = Global.getDeviceId();
            if (did && did.length > 5) {
                //取到了，且数据长度大于5就算成功。且不是相同的串
                let keyNum = 0
                let obj = {}
                for (var i = 0; i < did.length; i++) {
                    var v = did.charAt(i);
                    if (obj[v] && obj[v].value == v) {
                        obj[v].count++;
                    } else {
                        obj[v] = {};
                        obj[v].count = 1;
                        obj[v].value = v;
                        keyNum++
                    }
                }
                if (keyNum > 2) {
                }
                else {
                    did = null
                }
            }
            else {
                //取不到还是用原来的随机数模式
                did = null
            }
            if (!did) {
                did = (new Date()).getTime() + Math.random(1, 9999999)
            }
            Global.saveLocal('client_uuid', '' + did);

            if (cc.sys.isNative && !this._isClonerAPP()) {
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_REGISTER)
                cc.vv.PlatformApiMgr.KoSDKTrackEvent('af_complete_registration',JSON.stringify({uid:did}))
            }
        }
    },

    // 读取剪切板是否有H5登录数据
    readClipboardReqLogin() {
        let preLoginStr = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
        if (!!preLoginStr) return;
        let h5Req = cc.vv.PlatformApiMgr.Paste();
        if (!!h5Req) {
            let req = null;
            try {
                req = JSON.parse(h5Req);
            } catch (error) {
                req = null;
            }
            if (req && req.client_uuid && req.token) {
                // 重新构造请求数据 UUID被更新
                let localReq = cc.vv.GameManager.constructLoginMsg(req.user, req.passwd, req.t, req.accessToken, req.LoginExData, req.token);
                // 设置额外的UUID
                localReq.h5_uuid = req.client_uuid
                Global.saveLocal(Global.SAVE_KEY_REQ_LOGIN, JSON.stringify(localReq));
                cc.vv.PlatformApiMgr.Copy(req.client_uuid || "Arab Hero");
            }
        }
    },

    loadLoadingTip() {
        let func = (err, prefab) => {
            if (err == null) {
                let node = cc.instantiate(prefab);
                cc.game.addPersistRootNode(node);
            }
            else {
                AppLog.err('prefab(BalootClient/BaseRes/prefabs/poly99_LoadingTip) load error')
            }
        };
        cc.loader.loadRes("BalootClient/BaseRes/prefabs/poly99_LoadingTip", cc.Prefab, (err, prefab) => {
            func(err, prefab);
        });
    },

    // loadAlterView() {
    //     let func = (err, prefab) => {
    //         if (err == null) {
    //             cc.vv.AlertView.init(prefab);
    //         }
    //     };
    //     cc.loader.loadRes("BalootClient/BaseRes/prefabs/poly99_AlterView", cc.Prefab, (err, prefab) => {
    //         func(err, prefab);
    //     });

    // },

    start() {
        AppLog.ShowScreen('launch场景启动')

        // if (cc.sys.isNative) {
            // StatisticsMgr.httpReport(StatisticsMgr.HTTP_LAUNCH)
            this.generalClientuuid();
        // }
        

        this._nIterval = 0
        this.setProgress(0.01)
        var node = cc.find('Canvas');
        Global.centerPos = cc.v2(node.width / 2, node.height / 2);
        Global.jackpotPos = cc.v2(node.width, node.height * 9 / 10);

        // if (this.isHotupdateRestart()) {
        //     //热更重启就不在请求网络和热更了。直接进入登陆
        //     AppLog.ShowScreen('刚刚热更完,直接进入游戏')

        //     this.loadNextScene()
        // }
        // else {
        this._httpStateInfo()
        // }


        //到达启动界面
        let appVer = cc.vv.PlatformApiMgr.getAppVersion()
        cc.vv.PlatformApiMgr.KoSDKTrackEvent('reach_launch_ui', JSON.stringify({ appvision: appVer }))

        this._hideNativeSplash()
    },

    _httpStateInfo() {
        this.doEnterPro()
        // //ios才需要走提审热更
        // if (Global.isIOS() && Global.isReview) {

        //     this.reqStateInfo(Global.haoUrl, "GET")
        // }
        // else if (Global.isAndroid() && this._packName == "com.masterplus.poker" && Global.androidApi) {
        //     this.reqStateInfo(Global.androidApi, "POST")
        // }
        // else {
        //     Global.isReview = false
        //     this.doEnterPro()

        //     // this.reqStateInfo(Global.androidApi,"POST")
        // }
    },

    reqStateInfo: function (url, method) {
        this._bAready = 0
        AppLog.ShowScreen('请求hao地址' + url)
        let tData = {}
        tData.appVer = Global.appVersion
        if (Global.isIOS()) {
            Global.appVersion = cc.vv.PlatformApiMgr.getAppVersion()
            tData.appVer = Global.appVersion
        }
        tData.os = cc.sys.os
        if (method == "POST") {
            //补充登陆参数
            tData.req = cc.vv.GameManager.getSaveKeyReqLoginParam()
        }

        cc.vv.NetManager.requestHttp('', tData, this.recvMailtenance.bind(this), url, method, false, 5000);
    },

    recvMailtenance: function (state, data) {

        AppLog.ShowScreen('hao地址返回')

        if (state && data.code === 200) {
            this._bAready = 1
            //记录提审状态
            let laVal = data.la
            AppLog.warn("=====la:" + data.la)
            if (Global.isIOS()) {
                Global.isReview == (laVal == "buhao") ? true : false
            }
            if (Global.isAndroid()) {
                Global.isAndroidReview = (laVal == "buhao") ? true : false
            }

            //记录热更vision.manifist信息
            Global.remoteVisionmanifistData = data.version
            if (Global.remoteVisionmanifistData) {
                this._saveInfoFromVision(Global.remoteVisionmanifistData)
            }

            //记录登录信息
            let loginInfo = data.data
            if (loginInfo) {
                Global.saveLocal('P1', JSON.stringify(loginInfo))
            }


            this.doEnterPro()
        }
    },

    async doEnterPro() {
        var self = this;

        self.loadNextScene()
        // let nextStepFunc = () => {
        //     self.loadNextScene()
        // }

        // let checkChatZc = () => {
        //     let isShowZC = Global.getLocal("IS_SHOW_ZC");
        //     if (!isShowZC) {
        //         cc.vv.PopupManager.addPopup("BalootClient/Setting/prefabs/PopupZCService", {
        //             noTouchClose: true,
        //             noCloseHit: true,
        //             scaleIn: true,
        //             onShow: (node) => {
        //                 node.getComponent("PopupZCService").setCallback(nextStepFunc)
        //             }
        //         });
        //     } else {
        //         nextStepFunc();
        //     }
        // }
        // checkChatZc();

    },

    update(dt) {
        this._nIterval += dt
        if (this._bAready == 0) {
            if (this._nIterval > 5) { //5s超时，再次确认
                this._nIterval = 0
                this._httpStateInfo()
            }
        }
        //显示一个假的进度条
        if (cc.vv.AppData) {
            if (cc.vv.AppData.getHotupdateStart) {
                if (!cc.vv.AppData.getHotupdateStart()) {//已经有热更的进度了就不显示假进度
                    this._curPro = this._curPro || 0
                    this._timeInter = this._timeInter || 0
                    this._timeInter += dt
                    if (this._timeInter > 0.06 && this._curPro < this._launProMax) {
                        this._curPro += 0.005
                        this._timeInter = 0
                        this.setProgress(this._curPro)
                    }

                }
            }
        }

    },

    _isClonerAPP:function(){
        if(Global.isAndroid()){
            var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
            if(localAppVersion > 120){
                if(cc.vv.PlatformApiMgr.IsCloner()){
                    return true
                }
            }
            
        }
    },

    loadNextScene: function () {

        if(this._isClonerAPP()){
            if(cc.vv.AlertView){
                let str = cc.js.formatStr("%s can not run at this mode!",cc.vv.UserConfig.getAppName())
                cc.vv.AlertView.showTips(str,()=>{
                    cc.game.end()
                })
            }

            return
            
        }

        if (!cc.vv.NetCacheMgr) {
            let scp = require("PH_NetCacheMgr")
            cc.vv.NetCacheMgr = new scp()
            cc.vv.NetCacheMgr.init()
        }

        if(!cc.vv.ChipPool){
            cc.vv.ChipPool = require("Table_Chips_Nodepool")
            cc.vv.ChipPool.init()
            
        }

        //淡出动画

        if (Global.isNative() && Global.openUpdate) { //android、ios需要

            if (!this.isHotupdateRestart()) {
                AppLog.ShowScreen('开始准备热更')
                //不是热更重启，正常走热更
                if (!Global.isIOSAndroidReview()) {
                    this.startHotupdate()
                    return true
                }
                else {
                    //提审
                    if (Global.isIOS()) {
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, this.onLoadLoginSceneFinish.bind(this))
                        return
                    }
                    else {
                        //直接登陆
                        AppLog.ShowScreen('android提审状态不用更新,直接登陆')
                        cc.vv.GameManager.nativeSkipHotupdate()
                    }

                }
            }
            else {
                //直接登陆
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_UPDATE_RESTART)
                AppLog.ShowScreen('刚刚热更完,直接登陆')
                cc.vv.GameManager.nativeSkipHotupdate()
            }

        }
        else { //H5不需要热更新
            AppLog.ShowScreen('H5,直接登陆')
            // 便于测试代码
            let langStr = this.getQueryVariable("lang");
            if (langStr && langStr == "close") { Global.noI18n = true; }
            let testStr = this.getQueryVariable("test");
            let auto = this.getQueryVariable("auto");
            if (testStr) {
                var localNickname = "Guest" + testStr;
                Global.saveLocal('nick_name', localNickname);
                var guestTokenCfg = Global.getLocal(Global.SAVE_PLAYER_TOKEN, '');
                var guestTokenMap = guestTokenCfg.length > 0 ? JSON.parse(guestTokenCfg) : {};
                var playerData = guestTokenMap[localNickname];
                let token = playerData ? playerData.token : null;
                if (!token || token.length <= 0) {
                    token = (new Date()).getTime() + '_' + Global.random(1, 99999999);
                    guestTokenMap[localNickname] = { token: token };
                    Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(guestTokenMap));
                }
                Global.saveLocal('client_uuid', `88888888-${testStr}`);
                cc.vv.GameManager.reqLogin(localNickname, localNickname, Global.LoginType.Guest, '', Global.LoginExData.loginAction, token)
            } else if (auto && auto == "false") {
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, this.onLoadLoginSceneFinish.bind(this));
            } else {
                // let autoLoginReq = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
                // if (autoLoginReq && Global.openAutoLogin) {
                //     //直接自动登陆
                //     cc.vv.GameManager.reqReLogin(true)
                // }
                // else {
                //     cc.vv.GameManager.autoTravellerLogin()
                // }
                cc.vv.GameManager.nativeSkipHotupdate()
            }
        }
    },
    onLoadHotupdateSceneFinish: function () {
        cc.log("onLoadHotupdateSceneFinish")
    },
    onLoadLoginSceneFinish: function () {
        cc.log("onLoadLoginSceneFinish")
    },
    // 开启热更新检测
    startHotupdate: function () {
        // 拿到当前场景内的热更新组件
        let scriptHotupdateNode = cc.find('script_hotupdate', this.node)
        if (scriptHotupdateNode) {
            scriptHotupdateNode.active = true
            let scp = scriptHotupdateNode.getComponent('hotupdate')
            if (scp) {
                AppLog.warn("=====launch:startHot")
                // 开始热更新
                scp.startUpdate()
            }
        }
    },
    setProgress: function (val) {
        let pro = cc.find('progress_update', this.node)
        pro.active = true
        pro.getComponent(cc.ProgressBar).progress = val
        let lbl = cc.find('lbl_tips', this.node)
        lbl.getComponent(cc.Label).string = Math.floor(val * 100) + '%'
        cc.vv.AppData.setLaunchProgress(val)
    },

    // 获取浏览器参数
    getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) { return pair[1]; }
        }
        return (false);
    },

    isHotupdateRestart() {
        let val = Global.getLocal('last_hotupdate', '')
        if (val) {
            let now = new Date().getTime()
            let dif = now - val
            if (dif <= 180 * 1000) { //3min
                return true
            }

        }
        return false
    },

    _saveInfoFromVision(data) {
        var remoteVersionObj = (typeof data == 'string' ? JSON.parse(data) : data);
        if (remoteVersionObj) {
            cc.vv.AppData.setSubverMd5(remoteVersionObj.subVer)
            Global.resVersion = remoteVersionObj.version;
        }

    },

    _hideNativeSplash() {
        if (CC_JSB) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                // 反射调用原生的隐藏方法
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "hideSplash",
                    "()V"
                );
            }
        }
    },


});
