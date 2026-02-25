
cc.Class({
    extends: cc.Component,

    properties: {
        listView:require('List'),

        backBtn:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.netListener = this.node.addComponent("NetListenerCmp");
        Global.btnClickEvent(cc.find("info/winners/btn_info", this.node), this.onClickInfo, this);
    },

    onEnable() {
        this.netListener.registerMsg(MsgId.EVENT_GET_RANK_INFO, this.EVENT_GET_RANK_INFO, this);  // 获取排行榜信息
    },

    onDisable() {
        this.netListener.clear();
    },

    // type 1:日榜 2:周榜 3:月榜 4:代理排行榜
    setRankInfo(type){
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_GET_RANK_INFO , rtype:type});
    },

    start () {

    },

    EVENT_GET_RANK_INFO(msg){
        if(msg.code == 200){

            if(msg.rtype == 4){
                this.localData = msg.list;
                this.selfInfo = msg.myInfo;

                this.updateView();
            }
        }
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
        let data = this.getConfigByType(this._rtype);
        if(data){
            let info = cc.find("info", this.node);
            cc.find("prize/lbl", info).getComponent(cc.Label).string = Global.FormatNumToComma(data.prize);
            cc.find("duration/lbl", info).getComponent(cc.Label).string = "--";
            cc.find("winners/lbl", info).getComponent(cc.Label).string = data.winners;
            let t_str;
            if(this._rtype == 1){
                t_str = Global.getDateStrNoYear(data.start_time);
            } else {
                t_str = Global.getDateStrNoYear(data.start_time) + " - " + Global.getDateStrNoYear(data.stop_time);
            }
            cc.find("duration/lbl", info).getComponent(cc.Label).string = t_str;

            let btn = cc.find("btn_join",info);
            btn.off("click");
            btn.on("click", ()=>{
                if(this.backBtn && this.backBtn.getComponent(cc.Button)){
                    this.backBtn.emit("click");
                    // cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferEarn")
                    cc.vv.GameManager.jumpTo(3);
                }
            })
        }
        cc.find("node_lock", this.node).active = data && !data.open;
    },

    updatePanel(coinfig){
        this.coinfig = coinfig;
        this._rtype = 4;
        this.setRankInfo(this._rtype);
    },

    // 更新界面
    updateView() {
        this.updateCfgInfo();
        this.updateSelfInfo();

        this.listView.numItems = this.localData.length;

        if(this.localData.length > 0){ //
            cc.find("lbl_empty", this.node).active = false;
        } else {
            cc.find("lbl_empty", this.node).active = true;
        }
    },

    // 更新Item
    onUpdateItem: function (item, idx) {
        let data = this.localData[idx];

        item.getComponent("yd_rank_item").updateView(data, false, 2);
    },

    updateSelfInfo(){
        let item = cc.find("listview/self", this.node);
        item.getComponent("yd_rank_item").updateView(this.selfInfo, true, 2);
    },

    onClickInfo() {
        cc.vv.PopupManager.addPopup("YD_Pro/rank/yd_rule_rewards", {
            onShow: (node) => {
                node.getComponent("yd_rank_rule_rewards").setRankInfo(4);
            }
        })
    }

    // update (dt) {},
});
