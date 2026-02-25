const { ccclass, property } = cc._decorator;

@ccclass
export default class CafeGameInvite extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null;
    @property(cc.Button)
    uidInviteBtn: cc.Button = null;
    @property(cc.Button)
    btnFriends: cc.Button = null;
    @property(cc.Button)
    btnWhatsApp: cc.Button = null;
    @property(cc.Button)
    btnMessage: cc.Button = null;
    @property(cc.Button)
    btnOther: cc.Button = null;
    @property(cc.Button)
    btnInviteChat: cc.Button = null;

    gameid:any = null;
    tableid:any = null;
    pwd:any = null;
    

    onLoad() {
        this.uidInviteBtn.node.on("click", this.onClickUIDInvite, this);
        // this.btnFacebook.node.on("click", this.onClickFacebook, this);
        this.btnWhatsApp.node.on("click", this.onClickWhatsApp, this);
        this.btnMessage.node.on("click", this.onClickMessage, this);
        this.btnFriends.node.on("click", this.onClickFriends, this);
        this.btnOther.node.on("click", this.onClickOther, this);
        this.btnInviteChat.node.on("click", this.onClickChatInvite, this);

        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SALON_INVITE_CHAT, this.SALON_INVITE_CHAT, this);
    }

    onClickUIDInvite() {
        cc.vv.PopupManager.addPopup(this.prefab, {
            opacityIn: true,
            onShow: (node: cc.Node) => {
                node.getComponent("CafeUIDInvite").onInit(this.getGameId(), this.getTableId());
            }
        });
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "uid");
        cc.vv.PopupManager.removePopup(this.node);
    }

    shareCallback(data) {
        if (data.result == "-10") {
            cc.vv.FloatTip.show(___("未安装Messager"))
        } else if (data.result == "-11") {
            cc.vv.FloatTip.show(___("未安装whatsapp"))
        }
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "fb");
    }

    onClickMessage() {
        let gameName = cc.vv.UserConfig.getGameName(this.getGameId());
        cc.vv.FBMgr.deskInvite(this._getInviteLink(cc.vv.UserManager.sharelink), "https://inter.yonogames.com/icon.png", 2, ___("快上线,加入我的房间{1},全民都在玩的Poker Hero!", this.getTableId()), gameName, this.getTableId(), this.getGameId(), this.getPwd(), this.shareCallback.bind(this));
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "message");
        cc.vv.PopupManager.removePopup(this.node);
    }
    onClickWhatsApp() {
        let gameName = cc.vv.UserConfig.getGameName(this.getGameId());
        cc.vv.NetManager.send({ c: MsgId.SHARE_WHATSAPP_REPORT });
        let sharelink = this._getInviteLink(cc.vv.UserManager.sharelink)
        let appName = cc.vv.UserConfig.getAppName()
        let content = cc.js.formatStr("Hey! Let's play %s together (It's Fun & Real!) \n Room ID: %s \n Open %s app > Salon>Join Salon Room > Enter Room ID \n Already installed %s app? Play directly with me at:",gameName,this.getTableId(),appName,appName)
        this.deskInvite(sharelink, "https://inter.yonogames.com/icon.png", 3, content, gameName, this.getTableId(), this.getGameId(), this.getPwd(), this.shareCallback.bind(this));
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "whatsapp");
        cc.vv.PopupManager.removePopup(this.node);
    }
    onClickOther() {
        let gameName = cc.vv.UserConfig.getGameName(this.getGameId());
        let sharelink = this._getInviteLink(cc.vv.UserManager.sharelink)
        let appName = cc.vv.UserConfig.getAppName()
        let content = cc.js.formatStr("Hey! Let's play %s together (It's Fun & Real!) \n Room ID: %s \n Open %s app > Salon>Join Salon Room > Enter Room ID \n Already installed %s app? Play directly with me at:",gameName,this.getTableId(),appName,appName)
        this.deskInvite(sharelink, "https://inter.yonogames.com/icon.png", 4,content, gameName, this.getTableId(), this.getGameId(), this.getPwd(), this.shareCallback.bind(this));
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "other");
        cc.vv.PopupManager.removePopup(this.node);
    }

    onClickFriends() {
        Global.dispatchEvent("EVENT_GAME_CHAT_SWITCH");
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "friend");
        cc.vv.PopupManager.removePopup(this.node);
    }

    onClickChatInvite() {
        cc.vv.NetManager.send({ c: MsgId.SALON_INVITE_CHAT, gameid: this.getGameId(), deskid: this.getTableId() });
        StatisticsMgr.reqReportNow(ReportConfig.SALON_SHARE, "chat");
        Global.dispatchEvent("EVENT_GAME_INVITE_SWITCH");
        // spcode = 398 已经发送邀请了
    }

    SALON_INVITE_CHAT(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
        }
        cc.vv.PopupManager.removePopup(this.node);
    }

    _getInviteLink(url){
        let arr = url.split("?")
        return arr[0]
    }

    deskInvite(sharelink, imgUrl, shareWhere, title, subtitle, roomid, gameid, pwd, shareCall){
           
        let params = "?roomid="+(roomid || 0)
        // 参数构造，whatsapp 会把&参数给截掉，也不知道什么原因。先修改参数构造方式
        // roomid = "房间号-游戏id-密码"

        if(!gameid){ //没传就补0
            gameid = "0"
        }
        params += ("-"+gameid)

        if(!pwd){ //没传就补0
            pwd = "0"
        }
        params += ("-"+pwd)
        
        let linkUrl = sharelink + params
        // let imgUrl = "https://inter.sekiengame.com/icon.png"
        if(shareWhere == 1){
            cc.vv.FBMgr.fbShareWeb(linkUrl,imgUrl,subtitle,shareCall)
        }
        else if(shareWhere == 2){
            cc.vv.FBMgr.MessagerShare(title,subtitle,"Play Game",linkUrl,imgUrl,shareCall)
        }
        else if(shareWhere == 3){
            let shareStr = cc.js.formatStr("%s %s",title,linkUrl)
            cc.vv.FBMgr.WhatsappShare(shareStr,shareCall)
        }
        else if(shareWhere == 4){
            let data = {}
            data.title = ""
            data.content = cc.js.formatStr("%s %s",title,linkUrl)
            data.imgUrl = imgUrl
            cc.vv.PlatformApiMgr.systemShare(JSON.stringify(data))
        }
    }

    //设置邀请信息
    setInviteInfo(gameid,tableid,pwd){
        this.gameid = gameid;
        this.tableid = tableid;
        this.pwd = pwd;
    }

    getGameId(){
        return this.gameid || (facade.dm && facade.dm.tableInfo && facade.dm.tableInfo.gameId)
    }
    getTableId(){
        return this.tableid || (facade.dm && facade.dm.tableInfo && facade.dm.tableInfo.tableId)
    }
    getPwd(){
        return this.pwd || (facade.dm && facade.dm.tableInfo && facade.dm.tableInfo.pwd)
    }

}
