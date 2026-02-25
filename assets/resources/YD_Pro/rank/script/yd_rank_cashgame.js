
cc.Class({
    extends: cc.Component,

    properties: {
        listView:require('List'),

        backBtn:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");

        Global.btnClickEvent(cc.find("tog_date/toggle1",this.node),this.onClickToggle1,this);
        Global.btnClickEvent(cc.find("tog_date/toggle2",this.node),this.onClickToggle2,this);
        Global.btnClickEvent(cc.find("tog_date/toggle3",this.node),this.onClickToggle3,this);

        Global.btnClickEvent(cc.find("btn_view", this.node),this.onClickViewAll,this);
        Global.btnClickEvent(cc.find("info/winners/btn_info", this.node), this.onClickInfo, this);
    },

    onEnable() {
        this.netListener.registerMsg(MsgId.EVENT_GET_RANK_INFO, this.EVENT_GET_RANK_INFO, this);  // 获取排行榜信息
        this.netListener.registerMsg(MsgId.EVENT_REGISTER_RANK_INFO, this.EVENT_REGISTER_RANK_INFO, this);  // 注册排行榜信息
    },

    onDisable() {
        this.netListener.clear();
    },

    start () {

    },

    // type 1:日榜 2:周榜 3:月榜 4:代理排行榜
    setRankInfo(type){
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_GET_RANK_INFO , rtype:type});
    },

    // type 1:日榜 2:周榜 3:月榜 4:代理排行榜
    setRegisterRank(type){
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_REGISTER_RANK_INFO , rtype:type});
    },

    EVENT_GET_RANK_INFO(msg){
        if(msg.code == 200){
            if(msg.spcode == 758) {  // 未报名
                this.updateJoinBtn(msg.spcode);
            } else {
                this.updateJoinBtn(1);
            }

            if(msg.rtype == 1 || msg.rtype == 2 || msg.rtype == 3){
                this._rtype = msg.rtype;

                cc.find("tog_date/toggle1",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 1;
                cc.find("tog_date/toggle2",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 2;
                cc.find("tog_date/toggle3",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 3;

                this.localData = msg.list;
                this.showData = msg.list.slice(0,3);
                this.selfInfo = msg.myInfo;

                this.updateView();
            }
        }
    },

    EVENT_REGISTER_RANK_INFO(msg){
        if(msg.spcode == 804){
            cc.vv.AlertView.show("You don't have enough money to join learderboard.", () => {
                if(Global.isIOSAndroidReview()){
                    cc.vv.PopupManager.addPopup("YD_Pro/Review/yd_more_coins");
                } else {
                    cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                        onShow: (node) => {
                            node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                        }
                    })
                }
            },null, true, ()=>{}, "Not Enough Funds", null, "Add Cash");
        }

        if(msg.code == 200 && msg.spcode == 0){
            cc.vv.AlertView.show("You have successfully joined the Leaderboard", () => {
                cc.find("info/btn_play", this.node).emit("click");
            },null, true, ()=>{}, "Congratulations", null, "Play Now");

            this.updateJoinBtn(1);
            this.setRankInfo(this._rtype);
        }
    },

    // 日榜
    onClickToggle1(){
        this._rtype = 1;
        this.setRankInfo(1);
    },
    // 周榜
    onClickToggle2(){
        this._rtype = 2;
        this.setRankInfo(2);
    },
    // 月榜
    onClickToggle3(){
        this._rtype = 3;
        this.setRankInfo(3);
    },

    updatePanel(coinfig, openPageType=null){
        this.coinfig = coinfig;
        this._rtype = openPageType || this._rtype || 1;

        let firstOpen = this.checkRankOpen(this._rtype)
        if(firstOpen != -1){
            this._rtype = firstOpen
        }
        
        this.setRankInfo(this._rtype);

    },

    //排行榜也有可能关闭
    checkRankOpen(initOpen){
        let firstOpen = -1
        for(let i = 0; i < 3; i++){
            let nType = i+1
            let tog = cc.find("tog_date/toggle"+nType,this.node)
            let togcfg = this.getConfigByType(nType)
            if(togcfg){
                cc.find("node_lock", tog).active = !togcfg.open;
                // tog.active = togcfg.open?true:false
                if(togcfg.open){
                    if(initOpen == nType){
                        firstOpen = nType
                    }else if(firstOpen == -1){
                        firstOpen = nType
                    }
                }
            }
            
        }
        cc.find("tog_date",this.node).getComponent(cc.Layout).updateLayout()
        return firstOpen
    },

    // 更新界面
    updateView() {
        let data = this.getConfigByType(this._rtype);
        this.updateCfgInfo();
        this.updateSelfInfo();

        this.listView.numItems = this.showData.length;

        if(this.localData.length > 0){ //
            cc.find("btn_view", this.node).active = data && data.open;
            cc.find("lbl_empty", this.node).active = false;
        } else {
            cc.find("btn_view", this.node).active = false;
            cc.find("lbl_empty", this.node).active = true;
            let str = ["Daily", "Weekly", "Monthly"][this._rtype - 1];
            str += " Leaderboard will be live soon. Keep checking this space for more updates.";
            cc.find("lbl_empty", this.node).getComponent(cc.Label).string = str;
        }
        cc.find("tit/spr", this.node).getComponent("ImgSwitchCmp").setIndex(this._rtype-1);
    },

    // 更新Item
    onUpdateItem: function (item, idx) {
        let data = this.showData[idx];

        item.getComponent("yd_rank_item").updateView(data, false);
    },

    updateSelfInfo(){
        let item = cc.find("listview/self", this.node);
        item.getComponent("yd_rank_item").updateView(this.selfInfo, true);
    },

    getConfigByType(type){
        if(this.coinfig){
            for (let i = 0; i < this.coinfig.length; i++){
                if(this.coinfig[i].rtype == type){
                    return this.coinfig[i]
                }
            }
        }
    },

    updateCfgInfo() {
        let info = cc.find("info", this.node);

        let data = this.getConfigByType(this._rtype);
        if(data){
            cc.find("win/Label2", info).getComponent(cc.Label).string = ["Daily", "Weekly", "Monthly"][this._rtype - 1];
            cc.find("win/lbl", info).getComponent(cc.Label).string = Global.FormatNumToComma(data.prize);
            cc.find("prize/lbl", info).getComponent(cc.Label).string = Global.FormatNumToComma(data.prize);
            cc.find("criteria/lbl", info).getComponent(cc.Label).string = Global.FormatNumToComma(data.limit);
            cc.find("winners/lbl", info).getComponent(cc.Label).string = data.winners;

            let t_str;
            if(this._rtype == 1){
                t_str = Global.getDateStrNoYear(data.start_time);
            } else {
                t_str = Global.getDateStrNoYear(data.start_time) + " - " + Global.getDateStrNoYear(data.stop_time)
            }
            cc.find("duration/lbl", info).getComponent(cc.Label).string = t_str;
        }
        cc.find("node_lock", this.node).active = data && !data.open;
    },

    updateJoinBtn(type){
        let btn_join = cc.find("info/btn_join", this.node);
        let btn_play = cc.find("info/btn_play", this.node);
        let lbl_tips = cc.find("info/lbl_tips", this.node).getComponent(cc.Label);

        btn_join.active = type == 758;
        btn_play.active = type == 1;

        if(type == 758){
            let data = this.getConfigByType(this._rtype);
            if(data){
                lbl_tips.string = "*Opt in Mandatory to join leaderboard";

                let register = Number(data.register);
                let limit = Number(data.limit);

                let btnStr = "Join Now";
                let alertTip = "";
                let self = this;
                if(register == 0){
                    alertTip = "Click \"Yes\" button to join the Leaderboard";
                } else if(register > 0){
                    btnStr = "Join for ₹"+Global.FormatNumToComma(register);
                    alertTip = `You will pay ${Global.FormatNumToComma(register)} to join ${["Daily", "Weekly", "Monthly"][this._rtype - 1]} Leaderboard`;
                }

                cc.find("label", btn_join).getComponent(cc.Label).string = btnStr;
                btn_join.off("click");
                btn_join.on("click", ()=> {
                    cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
                    if (cc.vv.UserManager.coin < limit) {
                        cc.vv.FloatTip.show(`You need deposit at least ${limit} to join learderboard.`);
                    } else {
                        cc.vv.AlertView.show(alertTip, () => {
                            self.setRegisterRank(self._rtype);
                        }, () => {
                        }, false, null, "Leaderboard Registration", "No", "Yes");
                    }
                });
            }
        }
        else if(type == 1){
            lbl_tips.string = "You have already Opted in for the leaderboard";

            btn_play.off("click");
            btn_play.on("click", ()=>{
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
                if(this.backBtn && this.backBtn.getComponent(cc.Button)){
                    this.backBtn.emit("click")
                }
            })
        }
    },

    onClickViewAll(){
        if(this.localData){
            cc.vv.PopupManager.addPopup("YD_Pro/rank/yd_rank_detail", {
                onShow: (node) => {
                    node.getComponent("yd_rank_detail").updateView(this.localData,  this.selfInfo, this._rtype);
                }
            })
        }
    },

    onClickInfo() {
        cc.vv.PopupManager.addPopup("YD_Pro/rank/yd_rule_rewards", {
            onShow: (node) => {
                node.getComponent("yd_rank_rule_rewards").setRankInfo(this._rtype);
            }
        })
    }

    // update

    // update (dt) {},
});
