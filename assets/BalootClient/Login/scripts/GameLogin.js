// 登录界面脚本
cc.Class({
    extends: cc.Component,

    properties: {
        _tokenList: null,       //游戏登录凭证
        noticePrefab: cc.Prefab,
    },

    onLoad() {
        this.node.parent.name = Global.SCENE_NAME.LOGIN;

        Global.autoAdaptDevices(false);
        cc.vv = cc.vv || {};
        this._screct_click_count = 0;

        // let bHuawei = Global.IsHuawei()
        // var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));

        //phone
        let btn_phone = cc.find("layout_btns/btn_phone_login", this.node);
        btn_phone.active = !Global.isIOSAndroidReview()

        let btn_traveller_login = cc.find("layout_btns/btn_traveller_login", this.node);
        Global.btnClickEvent(btn_traveller_login, this.onTraveller, this);

        // google
        let btn_google_login = cc.find("layout_btns/btn_google_login", this.node);
        btn_google_login.active = Global.isAndroid() && Global.isIOSAndroidReview()
        Global.btnClickEvent(btn_google_login, this.onBtnGoogleLogin, this);

        // let btn_apple_login = cc.find("layout_btns/btn_apple_login", this.node);
        // btn_apple_login.active = Global.isNative() && Global.isIOS();
        // Global.btnClickEvent(btn_apple_login, this.onBtnAppleLogin, this);

        // let btn_fb_login = cc.find("layout_btns/btn_fb_login", this.node);
        // if (bHuawei) {
        //     btn_fb_login.active = Global.isNative() && localAppVersion >= 120;
        // } else {
        //     btn_fb_login.active = Global.isNative();
        // }

        // Global.btnClickEvent(btn_fb_login, this.onBtnFBLogin, this);

        // // 南方华为的不显示fb登陆
        // let btn_huawei_login = cc.find("layout_btns/btn_huawei_login", this.node);
        // btn_huawei_login.active = Global.isAndroid() && bHuawei && localAppVersion >= 120;
        // Global.btnClickEvent(btn_huawei_login, this.onBtnHuaweiLogin, this);

        let btn_sec = cc.find("btn_sec", this.node);
        // Global.btnClickEvent(btn_sec, this.onOpenDevLogin, this);

        let ver = cc.find("ver", btn_sec);
        ver.active = !Global.isIOSReview()
        ver.getComponent(cc.Label).string = Global.resVersion;
        this._tokenList = Global.getLocal(Global.SAVE_PLAYER_TOKEN);
        if (this._tokenList === undefined) this._tokenList = {};
        else {
            this._tokenList = JSON.parse(this._tokenList);
        }
        Global.registerEvent(EventId.RELOGIN, this.reLogin, this);
        Global.registerEvent(EventId.ENTER_LOGIN_SUCCESS, this.loginSuccess, this);
        Global.registerEvent(EventId.ENTER_LOGIN_FAILE, this.loginFail, this);
        // 防止在游戏被剔除后，无法进入游戏
        if (cc.vv.gameData) {
            cc.vv.gameData.clear();
        }
        if (Global.isYDApp()) {
            let lang_box = cc.find("layout_btns/lang_select_box", this.node);
            if (lang_box) lang_box.active = false
        }
        //停服公告
        cc.vv.NetManager.requestHttp('', null, this.recvMailtenance.bind(this), Global.haoUrl);
    },

    recvMailtenance: function (state, data) {
        if (state && data.code === 200) {
            if (data.state === 1) {    //0-开服  1-关服
                cc.vv.PopupManager.addPopup(this.noticePrefab, {
                    // noTouchClose: true,
                    // noCloseHit: true,
                    onShow: (node) => {
                        cc.find("ScrollView/view/content/item_msg", node).getComponent(cc.Label).string = data.msg;
                    }
                })
            }
        }
    },

    loginSuccess() {
        //api不记录
        if (Global.LoginType.APILOGIN == cc.vv.UserManager.getLoginType()) {
            return
        }
        if (true) {
            let data = Global.getLocal(Global.SAVE_PLAYER_TOKEN);
            let tokenList = JSON.parse(data);
            let curr_account = tokenList["curr_account"];
            if (curr_account && tokenList[curr_account]) {
                tokenList[curr_account].psw = ""
            }
            Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(tokenList));
        }
    },

    loginFail: function (event) {
        this._isLoginning = false;
        let errCode = event.detail;
        
        if(errCode == 803){
            //停服公告
            cc.vv.NetManager.requestHttp('', null, this.recvMailtenance.bind(this), Global.haoUrl);
        }
        // else{
        //     cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(errCode), true);
        // }
        
    },


    // //判断是否选中用户协议
    onJudgeAgreement() {
        return true
    },

    // 重新登录
    reLogin() {
        let tokenList = Global.getLocal(Global.SAVE_PLAYER_TOKEN);
        if (tokenList === undefined) {
            tokenList = {};
        }
        else {
            tokenList = JSON.parse(tokenList);
        }
        Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(tokenList));
        this._tokenList = tokenList;
    },

    // onOpenDevLogin() {
    //     cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
    //     this._screct_click_count += 1;
    //     if (this._screct_click_count >= 8) {
    //         this.spr_insert_bg.active = true;
    //     }
    // },

    //游客登录
    onTraveller() {
        StatisticsMgr.httpReport(StatisticsMgr.HTTP_CLICK_GUEST_SIGN)
        //点击游客登陆
        cc.vv.PlatformApiMgr.KoSDKTrackEvent('click_traveller', JSON.stringify({ resvision: Global.resVersion }))

        cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
        if (!this.onJudgeAgreement()) return;

        cc.vv.GameManager.autoTravellerLogin()
        // var self = this;

        // if (!self._nickname) self._nickname = ""
        // if (self._nickname.length == 0) {
        //     var localNickname = Global.getLocal('nick_name', '');
        //     self._nickname = localNickname;
        //     if (self._nickname.length == 0) {
        //         self._nickname = 'Guest' + Global.random(999, 9999);
        //     }
        // }
        // Global.saveLocal('nick_name', self._nickname);

        // var guestTokenCfg = Global.getLocal(Global.SAVE_PLAYER_TOKEN, '');
        // var guestTokenMap = guestTokenCfg.length > 0 ? JSON.parse(guestTokenCfg) : {};
        // var playerData = guestTokenMap[self._nickname];
        // let token = playerData ? playerData.token : null;
        // if (!token || token.length <= 0) {
        //     token = (new Date()).getTime() + '_' + Global.random(1, 99999999);
        //     guestTokenMap[self._nickname] = { token: token };
        //     Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(guestTokenMap));
        // }
        // self.connectLoginServer(self._nickname, self._nickname, Global.LoginType.Guest, '', token);
    },


    // //华为
    // onBtnHuaweiLogin() {
    //     //点击华为登陆
    //     StatisticsMgr.httpReport(StatisticsMgr.HTTP_CLICK_HW_SIGN)
    //     cc.vv.PlatformApiMgr.KoSDKTrackEvent('click_HW', JSON.stringify({ resvision: Global.resVersion }))

    //     cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
    //     cc.vv.PlatformApiMgr.doHuaweiLogin((cbData) => {
    //         AppLog.log("=======LMSlots===doHuaweiLogin======:  " + JSON.stringify(cbData));
    //         let result = parseInt(cbData.result)
    //         if (result) {
    //             cc.vv.GameManager.reqLogin(cbData.uid, "", Global.LoginType.HUAWEI, cbData.authorId, JSON.parse(cbData.detail), cbData.authorId);
    //         }
    //         else {
    //             cc.vv.FloatTip.show(___("登录失败,请稍后再试"));

    //             let bHasHMSCore = cc.vv.PlatformApiMgr.isHuaweiServerAvailble()
    //             let ex_str = "HMSCore:0"
    //             if (bHasHMSCore) {
    //                 ex_str = "HMSCore:1"
    //             }
    //             StatisticsMgr.httpReport(StatisticsMgr.HTTP_HWSDK_LOGIN_FAIL, ex_str)
    //         }
    //     }, 0)
    // },

    //google登录
    onBtnGoogleLogin() {
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
        // if (!this.onJudgeAgreement()) return;
        cc.vv.PlatformApiMgr.startGoogleLogin((cbData) => {
            AppLog.log("=======LMSlots===onBtnGoogleLogin======:  " + JSON.stringify(cbData));
            let result = parseInt(cbData.result);
            if (result) {
                let userInfo = cbData.userInfo;
                cc.vv.GameManager.reqLogin(userInfo.email, "", Global.LoginType.GOOGLE_LOGIN, "", { nick: userInfo.name, img: userInfo.img }, userInfo.id_token);
            }
            else {
                cc.vv.FloatTip.show(___("登录失败,请稍后再试"));
            }
        });
    },

    // //apple登录
    // onBtnAppleLogin() {
    //     //点击Apple登陆
    //     StatisticsMgr.httpReport(StatisticsMgr.HTTP_CLICK_APPLE_SIGN)
    //     cc.vv.PlatformApiMgr.KoSDKTrackEvent('click_Apple', JSON.stringify({ resvision: Global.resVersion }))

    //     cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
    //     if (!this.onJudgeAgreement()) return;
    //     cc.vv.PlatformApiMgr.startAppleLogin((cbData) => {
    //         AppLog.log("=======LMSlots--AppleSignIn=========:  " + JSON.stringify(cbData));
    //         let result = parseInt(cbData.code);
    //         if (result) {
    //             cc.vv.GameManager.reqLogin(cbData.user, "", Global.LoginType.APPLE_LOGIN, cbData.authorizationCode, { nick: cbData.nickName || "", img: "" }, cbData.identityToken);
    //         }
    //         else {
    //             cc.vv.FloatTip.show(___("登录失败,请稍后再试"));
    //         }
    //     });
    // },

    // onBtnFBLogin() {
    //     //点击FB登陆
    //     StatisticsMgr.httpReport(StatisticsMgr.HTTP_CLICK_FB_SIGN)
    //     cc.vv.PlatformApiMgr.KoSDKTrackEvent('click_FB', JSON.stringify({ resvision: Global.resVersion }))

    //     cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
    //     if (!this.onJudgeAgreement()) return;
    //     cc.vv.PlatformApiMgr.fbLoginOut();
    //     cc.vv.PlatformApiMgr.fbLogin((cbData) => {
    //         AppLog.log("=======LMSlots--FbLogin=========:  " + JSON.stringify(cbData));
    //         let result = parseInt(cbData.result);
    //         if (result == 1) {
    //             cc.vv.GameManager.reqLogin(cbData.uid, "", Global.LoginType.FB, cbData.token, { nick: cbData.name, img: cbData.headUrl }, cbData.token);
    //         }
    //         else {
    //             cc.vv.FloatTip.show(___("登录失败,请稍后再试"));
    //         }
    //     });
    // },

    // // 自动登录
    // autoLogin(account, token) {
    //     this.connectLoginServer('', account, Global.LoginType.TOKEN, '', token);
    // },


    // //连接登录服务器
    // connectLoginServer: function (uid, nickname, loginType, accesstoken, token) {
    //     if (this._isLoginning) {
    //         cc.vv.FloatTip.show(___("正在登录中..."));
    //         return;
    //     }

    //     this._isLoginning = true;
    //     this.scheduleOnce(() => {
    //         this._isLoginning = false;
    //     }, 5); //5秒
    //     cc.vv.GameManager.reqLogin(nickname, uid, loginType, accesstoken, Global.LoginExData.loginAction, token)
    // },


    start() {
        // 打点
        StatisticsMgr.httpReport(StatisticsMgr.HTTP_SHOW_LOGIN)
        //到达登陆界面
        cc.vv.PlatformApiMgr.KoSDKTrackEvent('reach_login_ui', JSON.stringify({ resvision: Global.resVersion }))
        // // 播放背景音乐
        // cc.vv.AudioManager.playBgm("BalootClient/BaseRes/", "bgm", true)
    },
});
