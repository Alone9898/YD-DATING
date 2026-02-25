cc.Class({
    extends: cc.Component,

    properties: {
        musicToggle: cc.Toggle,
        soundToggle: cc.Toggle,
        versionLabel: cc.Label,
        currentLanLabel: cc.Label,
        // applyToggle: cc.Toggle, //加好友是否需要验证

        // refuseGiftButton: cc.Button, //是否屏蔽世界礼物动画
        // checkRefuseGiftNode: cc.Node,
        _isRefuseGift: false,

        // shareBtn: cc.Button,
        // shopBtn: cc.Button,
        // bindBtn: cc.Button,
        // feedbackBtn: cc.Button,
        // whatsAppBtn: cc.Button,
        // appleBindBtn: cc.Button,
        // googleBindBtn: cc.Button,

        phoneBindBtn: cc.Button,

        // codeNode: cc.Node,

    },

    onLoad() {
        // 初始化显示
        this.musicToggle.isChecked = cc.vv.AudioManager.getBgmVolume() > 0;
        this.soundToggle.isChecked = cc.vv.AudioManager.getEffVolume() > 0;
        // this.applyToggle.isChecked = cc.vv.UserManager.verifyfriend > 0;

        // 设置语言
        this.updateLangView();
        // this.shopBtn.node.on("click", this.onClickShop, this)
        // this.shareBtn.node.on("click", this.onFbShare, this)
        // this.feedbackBtn.node.on("click", this.onFeedback, this)
        // this.whatsAppBtn.node.on("click", this.onWhatsApp, this)

        // this.bindBtn.node.on("click", this.onFbBind, this)
        // this.appleBindBtn.node.on("click", this.onAppleBind, this)
        // this.googleBindBtn.node.on("click", this.onGoogleBind, this)
        this.updateBindBtns();

        // this.codeNode.active = cc.vv.UserManager.redem > 0;

        this._isRefuseGift = Global.getLocal("REFUSE_GIFT_ANIM", 0) == 1;
        // this.checkRefuseGiftNode.active = this._isRefuseGift;
        // this.refuseGiftButton.node.on("click", () => {
        //     // 判断VIP
        //     if (!this._isRefuseGift && cc.vv.UserManager.svip <= 0) {
        //         cc.vv.FloatTip.show(___("需要VIP才能开启"));
        //         cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 2 });
        //         return;
        //     }
        //     this._isRefuseGift = !this._isRefuseGift;
        //     // 记录是否屏蔽
        //     Global.saveLocal("REFUSE_GIFT_ANIM", this._isRefuseGift == true ? 1 : 0);
        //     this.checkRefuseGiftNode.active = this._isRefuseGift;
        // })
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent(EventId.FB_BIND_SUCCESS, this.FB_BIND_SUCCESS, this);
        eventListener.registerEvent(EventId.EVENT_BIND_PHONE, this.EVENT_BIND_PHONE, this);

        // if (Global.isDurakApp()) {
        //     this.shopBtn.node.active = false
        //     this.whatsAppBtn.node.active = false
        // }
    },

    onEnable() {
        let val = cc.js.formatStr("%s(%s)",Global.resVersion,cc.vv.PlatformApiMgr.getAppVersion())
        this.versionLabel.string = ___("版本{1}", val);
    },

    updateLangView() {
        let lang = cc.vv.i18nManager.getLanguage();
        this.currentLanLabel.string = cc.vv.i18nManager.getLanguageConfig(lang).name;
    },


    onChangeMusic(toggle) {
        cc.vv.AudioManager.setBgmVolume(toggle.isChecked ? 1 : 0)
        if (toggle.isChecked) {
            StatisticsMgr.reqReport(ReportConfig.SETTING_MUSIC_ON);
        } else {
            StatisticsMgr.reqReport(ReportConfig.SETTING_MUSIC_OFF);
        }
    },

    onChangeSounds(toggle) {
        cc.vv.AudioManager.setEffVolume(toggle.isChecked ? 1 : 0)
        if (toggle.isChecked) {
            StatisticsMgr.reqReport(ReportConfig.SETTING_SOUND_ON);
        } else {
            StatisticsMgr.reqReport(ReportConfig.SETTING_SOUND_OFF);
        }
    },

    onChangeApply(toggle) {
        let verifyfriend = toggle.isChecked ? 1 : 0;
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, verifyfriend: verifyfriend });
    },

    onClickShop() {
        StatisticsMgr.reqReport(ReportConfig.SETTING_LIKE);
        if (Global.isIOS()) {
            cc.vv.PlatformApiMgr.openURL(cc.vv.UserManager.rateios);
        } else {
            cc.vv.PlatformApiMgr.openURL(cc.vv.UserManager.rateandroid);
        }
    },

    onFbShare() {
        StatisticsMgr.reqReport(ReportConfig.SETTING_SHARE);
        // FB分享
        cc.vv.FBMgr.fbShareWeb(cc.vv.UserManager.sharelink);
    },

    onFeedback() {
        // {sender:"邮件发给谁",title:"邮件标题",content:"邮件内容，可以使空串"}
        if (cc.vv.UserManager.feedback) {
            let param = {
                sender: cc.vv.UserManager.feedback,
                title: "",
                content: "",
            }
            cc.vv.PlatformApiMgr.SendMail(JSON.stringify(param))
        }
    },
    onWhatsApp() {
        StatisticsMgr.reqReport(ReportConfig.SETTING_WHATSAPP);
        cc.vv.PlatformApiMgr.openURL(cc.vv.UserManager.whatapplink);
    },
    // 绑定FB成功
    FB_BIND_SUCCESS(event) {
        let msg = event.detail || {};
        if(this.bindBtn){
            Global.RewardFly(msg.rewards, this.bindBtn.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        }
        
        // 刷新按钮显示
        this.updateBindBtns();
    },
    // 绑定手机号码成功事件
    EVENT_BIND_PHONE(event) {
        this.updateBindBtns();
    },

    // 绑定FB
    onFbBind() {
        if (Global.isNative()) {
            StatisticsMgr.reqReport(ReportConfig.SETTING_BIND_FB);
            cc.vv.PlatformApiMgr.fbLogin((cbData) => {
                AppLog.log("=======LMSlots--FbAuth=========:  " + JSON.stringify(cbData));
                let result = parseInt(cbData.result);
                if (result == 1) {
                    let req = {
                        c: MsgId.REQ_BIND_FACEBOOK,
                        accesstoken: cbData.token,
                        token: cbData.token,
                        user: cbData.uid,
                        type: Global.LoginType.FB,
                    };
                    cc.vv.NetManager.send(req);
                } else {
                    cc.vv.FloatTip.show(___("FB账号绑定失败!"));
                }
            });
        } else if (CC_DEBUG) {
            let req = {
                c: 246,
                type: Global.LoginType.FB,
            };
            cc.vv.NetManager.send(req);
        }
    },
    // 绑定Google
    onGoogleBind() {
        if (Global.isNative()) {
            cc.vv.PlatformApiMgr.startGoogleLogin((cbData) => {
                AppLog.log("=======LMSlots===onBtnGoogleLogin======:  " + JSON.stringify(cbData));
                let result = parseInt(cbData.result);
                if (result) {
                    let userInfo = cbData.userInfo;
                    let req = {
                        c: MsgId.REQ_BIND_FACEBOOK,
                        type: Global.LoginType.GOOGLE_LOGIN,
                        token: userInfo.id_token,
                        accesstoken: userInfo.id_token,
                        user: userInfo.email,
                    };
                    cc.vv.NetManager.send(req);
                } else {
                    cc.vv.FloatTip.show(___("Google账号绑定失败!"));
                }
            });
        } else if (CC_DEBUG) {
            cc.vv.NetManager.send({ c: 246, type: Global.LoginType.GOOGLE_LOGIN });
        }
    },
    // 绑定Apple
    onAppleBind() {
        if (Global.isNative()) {
            cc.vv.PlatformApiMgr.startAppleLogin((cbData) => {
                AppLog.log("=======LMSlots--AppleSignIn=========:  " + JSON.stringify(cbData));
                let result = parseInt(cbData.code);
                if (result) {
                    let req = {
                        c: MsgId.REQ_BIND_FACEBOOK,
                        accesstoken: cbData.authorizationCode,
                        token: cbData.identityToken,
                        user: cbData.user,
                        type: Global.LoginType.APPLE_LOGIN,
                    };
                    cc.vv.NetManager.send(req);
                }
                else {
                    cc.vv.FloatTip.show(___("Apple账号绑定失败"));
                }
            });
        } else if (CC_DEBUG) {
            let req = {
                c: 246,
                type: Global.LoginType.APPLE_LOGIN,
            };
            cc.vv.NetManager.send(req);
        }
    },

    updateBindBtns() {
        var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
        let bBind = cc.vv.UserManager.isbindphone > 0
        if(cc.vv.UserManager.kyc > 0){
            bBind = true
        }
        // this.bindBtn.interactable = cc.vv.UserManager.isbindfb <= 0;
        // this.appleBindBtn.interactable = cc.vv.UserManager.isbindapple <= 0;
        // this.googleBindBtn.interactable = cc.vv.UserManager.isbindgoogle <= 0;
        this.phoneBindBtn.interactable = !bBind;

        // cc.find("isbind", this.bindBtn.node).active = cc.vv.UserManager.isbindfb > 0;
        // cc.find("isbind", this.appleBindBtn.node).active = cc.vv.UserManager.isbindapple > 0;
        // cc.find("isbind", this.googleBindBtn.node).active = cc.vv.UserManager.isbindgoogle > 0;
        
        cc.find("isbind", this.phoneBindBtn.node).active = bBind;

        // this.appleBindBtn.node.active = Global.isIOS();
        // this.googleBindBtn.node.active = localAppVersion >= 120;
        // if (Global.IsHuawei()) {
        //     this.bindBtn.node.active = localAppVersion >= 120;
        // } else {
        //     this.bindBtn.node.active = true;
        // }
        // this.bindBtn.node.active = false;
    },

});
