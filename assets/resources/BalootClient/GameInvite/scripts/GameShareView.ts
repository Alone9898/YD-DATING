const { ccclass, property } = cc._decorator;

@ccclass
export default class GameShareView extends cc.Component {

    @property(cc.Button)
    btnFacebook: cc.Button = null;
    @property(cc.Button)
    btnWhatsApp: cc.Button = null;
    @property(cc.Button)
    btnMessage: cc.Button = null;
    @property(cc.Button)
    btnOther: cc.Button = null;


    get title() {
        return ___("觉得无聊吗?快来玩Poker Hero,有史以来最好的纸牌游戏之一!");
    }
    get subTitle() {
        return ___("Poker Hero");
    }
    get imgUrl() {
        return "https://inter.sekiengame.com/share102.png";
    }

    onLoad() {
        this.btnFacebook.node.on("click", this.onClickFacebook, this);
        this.btnWhatsApp.node.on("click", this.onClickWhatsApp, this);
        this.btnMessage.node.on("click", this.onClickMessage, this);
        this.btnOther.node.on("click", this.onClickOther, this);
    }


    toBounsSharePage() {
        let gameHallCpt = cc.director.getScene().getComponentInChildren("GameHall");
        if (gameHallCpt && gameHallCpt.pageTabbar) {
            cc.vv.PopupManager.removeAll();
            gameHallCpt.pageTabbar.setPage(3);
            let tabbar = cc.find("TabbarContent/Tabbar", gameHallCpt.pageTabbar.tabs[3].pageNode).getComponent("Tabbar");
            tabbar && tabbar.setPage(4);
        }
    }

    shareCallback(data) {
        if (data.result == "-10") {
            cc.vv.FloatTip.show(___("未安装Messager"))
        } else if (data.result == "-11") {
            cc.vv.FloatTip.show(___("未安装whatsapp"))
        }
    }

    onClickFacebook() {
        cc.vv.PopupManager.removePopup(this.node);
        cc.vv.FBMgr.fbShareWeb(cc.vv.UserManager.sharelink, null, null, this.shareCallback.bind(this));
        this.toBounsSharePage();
        Global.dispatchEvent("GAME_SHARE_CLICK");
        StatisticsMgr.reqReportNow(ReportConfig.WHEEL_SHARE, "fb");
    }

    onClickMessage() {
        cc.vv.PopupManager.removePopup(this.node);
        cc.vv.FBMgr.MessagerShare(this.title, this.subTitle, this.subTitle, cc.vv.UserManager.sharelink, this.imgUrl, this.shareCallback.bind(this));
        this.toBounsSharePage();
        Global.dispatchEvent("GAME_SHARE_CLICK");
        StatisticsMgr.reqReportNow(ReportConfig.WHEEL_SHARE, "message");
    }

    onClickWhatsApp() {
        cc.vv.PopupManager.removePopup(this.node);
        let shareStr = cc.js.formatStr("%s #%s# %s", ___("觉得无聊吗?快来玩Poker Hero,有史以来最好的纸牌游戏之一!"), ___("Poker Hero"), cc.vv.UserManager.sharelink)
        cc.vv.FBMgr.WhatsappShare(shareStr, this.shareCallback.bind(this));
        this.toBounsSharePage();
        Global.dispatchEvent("GAME_SHARE_CLICK");
        StatisticsMgr.reqReportNow(ReportConfig.WHEEL_SHARE, "whatsapp");
    }

    onClickOther() {
        cc.vv.PopupManager.removePopup(this.node);
        let data = {}
        data["title"] = ___("Poker Hero");
        data["content"] = cc.vv.UserManager.sharelink
        data["imgUrl"] = this.imgUrl
        cc.vv.PlatformApiMgr.systemShare(JSON.stringify(data))
        this.toBounsSharePage();
        Global.dispatchEvent("GAME_SHARE_CLICK");
        StatisticsMgr.reqReportNow(ReportConfig.WHEEL_SHARE, "other");
    }

}
