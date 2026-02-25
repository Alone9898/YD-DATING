/**
 * 代理界面V2
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        //注册奖励
        let registerBonus = cc.vv.UserManager.getRegisterCoin()
        //总的签到奖励
        let nTotalSign = cc.vv.UserManager.getSignTotalCoin()
        let appName = cc.vv.UserConfig.getAppName()
        if(Global.appId == Global.APPID.YonoGames){
            this.title = cc.js.formatStr("I am playing on %s India's #1 skilled gaming app. \n Join me on %s & start winning Real Cash Prizes today! \n 1️⃣ Get a Joining bonus of ₹%s free \n 2️⃣ Get a 7days login bonus of ₹%s free \n 3️⃣ 100% cashback on first deposit \n Enjoying Rummy,LUDO,Poker and 30+games with me. Click the link to download: ",appName,appName,registerBonus,nTotalSign);

        }
        else{
            registerBonus=500
            this.title = cc.js.formatStr("I am playing on %s India's #1 skilled gaming app. \n Join me on %s & start winning Real Cash Prizes today! \n 1️⃣ Get a Joining bonus of ₹%s free \n 2️⃣ 100% cashback on first day deposit \n 3️⃣ 150% cashback on next day deposit \n Enjoying Rummy,LUDO,Poker and 30+games with me. Click the link to download: ",appName,appName,registerBonus,nTotalSign);

        }
        
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REFER_INFO, this.REFER_INFO, this)

        Global.onClick("flot_menu/btn_rank",this.node,function () {
            cc.vv.PopupManager.removePopup(this.node);
            cc.vv.PopupManager.addPopup( "YD_Pro/rank/yd_rank", {opacityIn: true,
                onShow: (node) => {
                    node.getComponent("yd_rank").initPage(4);
                }
            })
        },this)

        let node_co = cc.find("scro/view/content",this.node)
        Global.onClick("node_sharelink/btn_whatapp", node_co, this.onClickWhatsapp, this)
        Global.onClick("node_sharelink/btn_sys_share", node_co, this.onClickSys, this)
        Global.onClick("node_sharelink/btn_copy", node_co, this.onClickCopy, this)
        Global.onClick("node_howto/btn_ws", node_co, this.onClickWhatsapp, this)
        Global.onClick("node_howto/btn_ytb", node_co, this.onClickYTB, this)
        Global.onClick("node_howto/btn_fb", node_co, this.onClickFB, this)
        Global.onClick("node_howto/btn_tg", node_co, this.onClickTG, this)
        Global.onClick("node_howto/btn_ot", node_co, this.onClickSys, this)


        Global.onClick("node_total_earn/btn_referlist",node_co,this.onClickReffersListDetail,this)
        Global.onClick("node_today_earn/btn_referlist",node_co,this.onClickReffersListDetailDay,this)

        Global.onClick("node_total_earn/btn_cashbalance",node_co,this.onClickReffersRewardDetail,this)
        Global.onClick("node_today_earn/btn_cashbalance",node_co,this.onClickReffersRewardDetailDay,this)

        Global.onClick("node_total_earn/btn_cashbonus",node_co,this.onClickReffersRewardDetail,this)
        Global.onClick("node_today_earn/btn_cashbonus",node_co,this.onClickReffersRewardDetailDay,this)

        let node_how = cc.find("scro/view/content/node_howto",this.node)
        let t1_str = cc.js.formatStr("Make a refer and earn unlimited money! \n3 ways to refer friends & earn money in %s",appName)
        Global.setLabelString("t1",node_how,t1_str)

        let w2_str = cc.js.formatStr('Post a video on YouTube and Talk \nabout “How you can play and win \nmoney in %s”',appName)
        Global.setLabelString("w2",node_how,w2_str)

        let w3_str = cc.js.formatStr('Post %s referral link in your Facebook wall and \nTelegram Groups or any other social media”',appName)
        Global.setLabelString("w3",node_how,w3_str)
        
    },

    start () {
        this._url = cc.vv.UserManager.sharelink
        
    },

    onEnable(){
        this.refreshReferInfo();
    },

    refreshReferInfo(){
        cc.vv.NetManager.sendAndCache({ c: MsgId.REFER_INFO })
    },

    REFER_INFO(msg) {
        if (msg.code != 200) return
        this._serInfo = msg.info
        this._url = msg.info.url
        this.updateView(msg.info)
        
    },

    updateView(info){
        //total earn
        let nRefer = info.total_refers
        let nBalance = info.cash
        let nBonus = info.total_bonus - info.cash
        this.showTotalEran(1,nRefer,nBalance,nBonus)
        
        //today eran
        let t_nRefer = info.today_refers
        let t_nBalance = info.today_cash
        let t_nBonus = info.today_total_bonus - info.today_cash
        this.showTotalEran(2,t_nRefer,t_nBalance,t_nBonus)

        //rule信息
        let node_rule = cc.find("scro/view/content/node_rule",this.node)

        let str1 = "<bord>You can get   <color=#FEE644>%s</c>   Cash Balance for every successfully registration with a deposit of your invites.</b>";
        let str2 = "<bold>You can get a   <color=#FEE644>%s</c>   Cash Balance for each deposit of your invites.</b>";
        let str3 = "<bold>You can get a   <color=#FEE644>%s</c>   Cash Bonus for each bet amount of your invites.</b>";
        if(Global.appId == Global.APPID.RummyVIP){
            str3 = "<bold>You can get a   <color=#FEE644>%s</c>   Cash Balance for each bet amount of your invites.</b>";
        }

        Global.setRichTextString("layout/db1/lbl1",node_rule,cc.js.formatStr(str1,info.invite.coin1))
        Global.setRichTextString("layout/db2/lbl2",node_rule,cc.js.formatStr(str2,(info.recharge.rate1*100).toFixed(2)+"%"))
        Global.setRichTextString("layout/db3/lbl3",node_rule,cc.js.formatStr(str3,(info.bet.rate1*100).toFixed(2)+"%"))

        //my sharelink
        cc.find("scro/view/content/node_sharelink/linkval",this.node).getComponent(cc.Label).string = info.url
    },

    //nType:1 total 2today
    showTotalEran(nType,nRefer,nBalance,nBonus){
        let node
        if(nType == 1){
            node = cc.find("scro/view/content/node_total_earn",this.node)
        }
        else{
            node = cc.find("scro/view/content/node_today_earn",this.node)
        }

        Global.setLabelString("node_refer/val",node,nRefer)
        Global.setLabelString("node_cashbalance/val",node,Global.FormatNumToComma(nBalance))
        Global.setLabelString("node_cashbonus/val",node,Global.FormatNumToComma(nBonus))
        
    },

    onClickWhatsapp(){
        StatisticsMgr.reqReport(ReportConfig.REFER_WHATSAPP);
        let shareStr = cc.js.formatStr("%s %s", this.title, this._url)
        cc.vv.FBMgr.WhatsappShare(shareStr, this.shareCallback.bind(this));
    },

    onClickSys(){
        StatisticsMgr.reqReport(ReportConfig.REFER_SYSTEM_SHARE);
        
        let data = {}
        data["title"] = cc.vv.UserConfig.getAppName();
        data["content"] = cc.js.formatStr("%s %s", this.title, this._url)
        data["imgUrl"] = ""
        cc.vv.PlatformApiMgr.systemShare(JSON.stringify(data))
    },

    onClickCopy(){
        StatisticsMgr.reqReport(ReportConfig.REFER_COPY);
        let shareStr = cc.js.formatStr("%s %s", this.title, this._url)
        cc.vv.PlatformApiMgr.Copy(shareStr)
        cc.vv.FloatTip.show(___("复制成功,快去通知您的好友吧"))
    },

    shareCallback(data) {
        if (data.result == "-2") {
            cc.vv.FloatTip.show("Share failed")
        }else if (data.result == "-10") {
            cc.vv.FloatTip.show(___("未安装Messager"))
        } else if (data.result == "-11") {
            cc.vv.FloatTip.show(___("未安装whatsapp"))
        }
    },

    onClickYTB(){
        //android
        cc.vv.PlatformApiMgr.openURL("https://www.youtube.com")
    },

    onClickFB(){
        let shareStr = cc.js.formatStr("%s %s", this.title, this._url)
        cc.vv.PlatformApiMgr.openURL(cc.js.formatStr("https://www.facebook.com/sharer/sharer.php?u={%s}",encodeURIComponent(this._url)))
    },

    onClickTG(){
        let shareStr = cc.js.formatStr("https://t.me/share/url?text=%s&url=%s",encodeURIComponent(this.title),encodeURIComponent(this._url))
        cc.vv.PlatformApiMgr.openURL(shareStr)
    },

    onClickReffersListDetail(){
        cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferListDetail")
    },

    onClickReffersListDetailDay(){
        cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferListDetail",{onShow:(node)=>{
            node.getComponent("ReferList").showToday()
        }})
    },

    onClickReffersRewardDetail(){
        cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferRewardDetail")
    },

    onClickReffersRewardDetailDay(){
        cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferRewardDetail",{onShow:(node)=>{
            node.getComponent("ReferRewardDetail").showToday()
        }})
    },




    // update (dt) {},
});
