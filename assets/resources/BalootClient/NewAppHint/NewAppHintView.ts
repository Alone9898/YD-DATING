const { ccclass, property } = cc._decorator;

@ccclass
export default class NewAppHint extends cc.Component {

    @property(cc.Label)
    contentLabel: cc.Label = null;
    @property(cc.Label)
    buttonLabel: cc.Label = null;

    @property(cc.Button)
    okButton: cc.Button = null;
    private data: any;

    // get isBind() {
    //     return cc.vv.UserManager.isbindfb > 0 || cc.vv.UserManager.isbindapple > 0;
    // }

    onLoad() {
        // let eventListener = this.node.addComponent("EventListenerCmp");
        // eventListener.registerEvent(EventId.FB_BIND_SUCCESS, this.FB_BIND_SUCCESS, this);
        // isbindfb
        this.okButton.node.on('click', this.onOkButtonClick, this);
    }

    //data：下载地址
    onInit(data) {
        this.data = data;
        this.contentLabel.string = ___("For a better experience, the game has prepared the latest version!");
        // this.contentLabel.string = ___("检测到游戏已有最新版本,前往下载游戏领取{1}!为了您的账号安全,建议您绑定Facebook!", data.coin);
        this.buttonLabel.string =  ___("下载") ;
    }

    // 点击确定
    onOkButtonClick(event) {
        let url = this.data
        cc.vv.PlatformApiMgr.openURL(url);
        cc.vv.PopupManager.removePopup(this.node);

        // 检测是否绑定
        // if (this.isBind) {
        //     // 跳转网址
        //     cc.vv.PlatformApiMgr.openURL(this.data.url);
        //     cc.vv.PopupManager.removePopup(this.node);
        // } else {
        //     if (Global.isNative()) {
        //         StatisticsMgr.reqReport(ReportConfig.SETTING_BIND_FB);
        //         cc.vv.PlatformApiMgr.fbLogin((cbData) => {
        //             AppLog.log("=======LMSlots--FbAuth=========:  " + JSON.stringify(cbData));
        //             let result = parseInt(cbData.result);
        //             if (result == 1) {
        //                 let req = {
        //                     c: MsgId.REQ_BIND_FACEBOOK,
        //                     accesstoken: cbData.token,
        //                     token: cbData.token,
        //                     user: cbData.uid,
        //                     type: Global.LoginType.FB,
        //                 };
        //                 cc.vv.NetManager.send(req);
        //             } else {
        //                 cc.vv.FloatTip.show(___("FB账号绑定失败!"));
        //             }
        //         });
        //     } else if (CC_DEBUG) {
        //         let req = {
        //             c: 246,
        //             type: Global.LoginType.FB,
        //         };
        //         cc.vv.NetManager.send(req);
        //     }
        // }
    }

    // // 绑定FB成功
    // FB_BIND_SUCCESS(event) {
    //     cc.vv.PlatformApiMgr.openURL(this.data.url);
    //     cc.vv.PopupManager.removePopup(this.node);
    // }
}