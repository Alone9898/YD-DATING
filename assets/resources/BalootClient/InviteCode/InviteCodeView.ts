import RewardListCpt from "../../../_FWExpand/UI/RewardListCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InviteCodeView extends cc.Component {

    @property(cc.Node)
    // itemNode: cc.Node = null;
    // @property(cc.Node)
    // bandNode: cc.Node = null;
    // @property(cc.Label)
    // codeLabel: cc.Label = null;
    // @property(cc.Label)
    // friendLabel: cc.Label = null;

    // @property(cc.Button)
    // btnCopy: cc.Button = null;

    @property(cc.Button)
    btnFacebook: cc.Button = null;
    @property(cc.Button)
    btnWhatsApp: cc.Button = null;
    // @property(cc.Button)
    // btnMessage: cc.Button = null;
    @property(cc.Button)
    btnOther: cc.Button = null;

    @property(cc.Sprite)
    qrSprite: cc.Sprite = null;
    @property(cc.Button)
    btnCopyUrl: cc.Button = null;

    @property(cc.EditBox)
    inputEdit: cc.EditBox = null;
    @property(cc.Button)
    btnBand: cc.Button = null;

    clickPos: cc.Vec2;


    get title() {
        //注册奖励
        let registerBonus = cc.vv.UserManager.getRegisterCoin()
        //总的签到奖励
        let nTotalSign = cc.vv.UserManager.getSignTotalCoin()
        let appName = cc.vv.UserConfig.getAppName()
        let title
        if(Global.appId == Global.APPID.YonoGames){
            title = cc.js.formatStr("I am playing on %s India's #1 skilled gaming app. \n Join me on %s & start winning Real Cash Prizes today! \n 1️⃣ Get a Joining bonus of ₹%s free \n 2️⃣ Get a 7days login bonus of ₹%s free \n 3️⃣ 100% cashback on first deposit \n Enjoying Rummy,LUDO,Poker and 30+games with me. Click the link to download: ",appName,appName,registerBonus,nTotalSign);

        }
        else{
            registerBonus=500
            title = cc.js.formatStr("I am playing on %s India's #1 skilled gaming app. \n Join me on %s & start winning Real Cash Prizes today! \n 1️⃣ Get a Joining bonus of ₹%s free \n 2️⃣ 100% cashback on first day deposit \n 3️⃣ 150% cashback on next day deposit \n Enjoying Rummy,LUDO,Poker and 30+games with me. Click the link to download: ",appName,appName,registerBonus,nTotalSign);

        }
        return title
    }
    get subTitle() {
        return cc.vv.UserConfig.getAppName();
    }
    get imgUrl() {
        return "https://download.yonogames.com/share102.png";
    }
    get QRUrl() {
        return cc.vv.UserManager.sharelink + "&pic=1";
    }

    private itemNodeList: cc.Node[] = [];
    private localData: any;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.EVENT_FB_INVITE_CONFIG, this.EVENT_FB_INVITE_CONFIG, this);
        netListener.registerMsg(MsgId.EVENT_FB_INVITE_REWARD, this.EVENT_FB_INVITE_REWARD, this);
        // netListener.registerMsg(MsgId.EVENT_FB_INVITE_BIND_CODE, this.EVENT_FB_INVITE_BIND_CODE, this);

        // this.btnCopy.node.on("click", this.onClickCopy, this);
        this.btnCopyUrl.node.on("click", this.onClickCopyUrl, this);

        this.btnFacebook.node.on("click", this.onClickFacebook, this);
        this.btnWhatsApp.node.on("click", this.onClickWhatsApp, this);
        // this.btnMessage.node.on("click", this.onClickMessage, this);
        this.btnOther.node.on("click", this.onClickOther, this);

        // this.btnBand.node.on("click", this.onClickBand, this)
        // this.btnBand.getComponent("ButtonGrayCmp").interactable = false;

        // this.itemNodeList.push(this.itemNode);
        // for (let i = 0; i < 7; i++) {
        //     let itemNode = cc.instantiate(this.itemNode);
        //     itemNode.parent = this.itemNode.parent;
        //     this.itemNodeList.push(itemNode);
        // }
        // this.itemNodeList.push(cc.find("rewards/item_ex", this.node));

        // for (let i = 0; i < this.itemNodeList.length; i++) {
        //     const itemNode = this.itemNodeList[i];
        //     itemNode.on("click", this.onClickItem.bind(this, i), this)
        // }
        // QRUrl
        cc.vv.ResManager.loadImage(this.QRUrl, (err, res) => {
            if (res && cc.isValid(this.qrSprite)) {
                this.qrSprite.spriteFrame = new cc.SpriteFrame(res);
            }
        });
        // cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_FB_INVITE_CONFIG });
    }

    EVENT_FB_INVITE_CONFIG(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        if (!msg.info) return;
        this.localData = msg.info;
        this.updateView()
    }
    // 领取结果
    EVENT_FB_INVITE_REWARD(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        Global.RewardFly(msg.rewards, this.clickPos);
        // 请求最新的配置
        cc.vv.NetManager.send({ c: MsgId.EVENT_FB_INVITE_CONFIG });
    }


    // // 绑定邀请码返回
    // EVENT_FB_INVITE_BIND_CODE(msg) {
    //     if (msg.code != 200) return;
    //     if (msg.spcode && msg.spcode > 0) {
    //         cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
    //         return;
    //     }
    //     // 请求最新的配置
    //     cc.vv.NetManager.send({ c: MsgId.EVENT_FB_INVITE_CONFIG });
    //     // 弹出获取奖励弹窗
    //     Global.RewardFly(msg.rewards, this.btnBand.node.convertToWorldSpaceAR(cc.v2(0, 0)));
    // }

    updateView() {
        if (!this.localData) return;
        // this.codeLabel.string = this.localData.code;
        // this.friendLabel.string = this.localData.hadcnt;
        // for (let i = 0; i < this.itemNodeList.length; i++) {
        //     const itemNode = this.itemNodeList[i];
        //     let data = this.localData.list[i];
        //     itemNode.active = !!data;
        //     if (!data) continue;
        //     cc.find("num/value", itemNode).getComponent(cc.Label).string = data.num;
        //     itemNode.getComponentInChildren(RewardListCpt).updateView(data.rewards);
        //     cc.find("gou", itemNode).active = data.status > 0;
        //     cc.find("hint", itemNode).active = data.status == 0;
        //     cc.find("light", itemNode).active = data.status == 0;
        // }
        // if (this.bandNode) this.bandNode.active = this.localData.status == 1;
    }

    // onChangeText(text, editbox, customEventData) {
    //     let str = text.trim()
    //     this.btnBand.getComponent("ButtonGrayCmp").interactable = str.length > 0;
    // }

    // onClickBand() {
    //     // 发送请求
    //     cc.vv.NetManager.send({ c: MsgId.EVENT_FB_INVITE_BIND_CODE, code: this.inputEdit.string.trim() });
    // }

    // onClickItem(index) {
    //     if (!this.localData) return;
    //     let data = this.localData.list[index];
    //     if (!data) return;
    //     this.clickPos = this.itemNodeList[index].convertToWorldSpaceAR(cc.v2(0, 0));
    //     cc.vv.NetManager.send({ c: MsgId.EVENT_FB_INVITE_REWARD, ord: data.num });
    // }

    onClickCopy() {
        if (!this.localData) return;
        if (CC_DEBUG) {
            cc.log("COPY: ", this.localData.code)
        }
        cc.vv.FloatTip.show(___("复制成功"));
        cc.vv.PlatformApiMgr.Copy(this.localData.code + "");
    }

    onClickCopyUrl() {
        if (CC_DEBUG) {
            cc.log("COPY: ", this.title + "" + cc.vv.UserManager.sharelink)
        }
        cc.vv.FloatTip.show(___("复制成功,快去通知您的好友吧"));
        cc.vv.PlatformApiMgr.Copy(this.title + " " + cc.vv.UserManager.sharelink);
    }


    shareCallback(data) {
        if (data.result == "-10") {
            cc.vv.FloatTip.show(___("未安装Messager"))
        } else if (data.result == "-11") {
            cc.vv.FloatTip.show(___("未安装whatsapp"))
        }
    }

    onClickFacebook() {
        // // cc.vv.PopupManager.removePopup(this.node);
        // cc.vv.FBMgr.fbShareWeb(cc.vv.UserManager.sharelink, null, null, this.shareCallback.bind(this));
        // StatisticsMgr.reqReportNow(ReportConfig.INVITE_SHARE, "fb");
        let url = cc.vv.UserManager.sharelink
        cc.vv.PlatformApiMgr.openURL(cc.js.formatStr("https://www.facebook.com/sharer/sharer.php?u={%s}",encodeURIComponent(url)))
    }

    // onClickMessage() {
    //     // cc.vv.PopupManager.removePopup(this.node);
    //     cc.vv.FBMgr.MessagerShare(this.title, this.subTitle, this.subTitle, cc.vv.UserManager.sharelink, this.imgUrl, this.shareCallback.bind(this));
    //     StatisticsMgr.reqReportNow(ReportConfig.INVITE_SHARE, "message");
    // }

    onClickWhatsApp() {
        // cc.vv.PopupManager.removePopup(this.node);
        let shareStr = cc.js.formatStr("%s %s", this.title, cc.vv.UserManager.sharelink)
        cc.vv.FBMgr.WhatsappShare(shareStr, this.shareCallback.bind(this));
        StatisticsMgr.reqReportNow(ReportConfig.INVITE_SHARE, "whatsapp");
    }

    onClickOther() {
        // cc.vv.PopupManager.removePopup(this.node);
        let data = {}
        data["title"] = this.subTitle;
        data["content"] = cc.js.formatStr("%s %s", this.title, cc.vv.UserManager.sharelink)
        data["imgUrl"] = this.imgUrl
        cc.vv.PlatformApiMgr.systemShare(JSON.stringify(data))
        StatisticsMgr.reqReportNow(ReportConfig.INVITE_SHARE, "other");
    }


}
