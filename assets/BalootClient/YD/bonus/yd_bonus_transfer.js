

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.BONUS_COIN_INFO, this.BONUS_COIN_INFO, this)
        netListener.registerMsg(MsgId.BONUS_COIN_TRANSFER, this.BONUS_COIN_TRANSFER, this)
        netListener.registerMsg(MsgId.BONUS_COIN_PRPPORTION, this.BONUS_COIN_PRPPORTION, this)
        cc.vv.NetManager.sendAndCache({ c: MsgId.BONUS_COIN_INFO })
        cc.vv.NetManager.sendAndCache({ c: MsgId.BONUS_COIN_PRPPORTION })

        Global.onClick("layout/bonus/btn_get", this.node, this.onClickGet, this)
        Global.onClick("layout/deposit/btn_collect", this.node, this.onClickCollect, this)

        this._collect_coin = 0
    },

    BONUS_COIN_INFO(msg) {
        if (msg.code != 200) return
        this.updateView(msg)
    },

    BONUS_COIN_TRANSFER(msg) {
        if (msg.code != 200) return
        if (msg.add_coin > 0) {
            let node = cc.find("layout/deposit/coin_bg/lbl_coin", this.node)
            let rewards = [{type: 1, count: msg.add_coin}]
            Global.RewardFly(rewards, node.convertToWorldSpaceAR(cc.v2(0, 0)));
            cc.vv.RedHitManager.setKeyVal("transbonus",0);
        }
        this.updateView(msg)
    },

    BONUS_COIN_PRPPORTION(msg) {
        if (msg.code != 200) return
        this.updateProportion(msg.data)
    },

    updateView(info) {
        this._collect_coin = info.collect_coin
        Global.setLabelString("layout/bonus/coin_bg/lbl_coin", this.node, info.bonus_coin)
        Global.setLabelString("layout/deposit/coin_bg/lbl_coin", this.node, Global.FormatNumToComma(info.collect_coin))
        cc.find("layout/deposit/btn_collect", this.node).getComponent(cc.Button).interactable = (info.collect_coin > 0)
    },

    updateProportion(data){
        let content = cc.find("layout/rules/ScrollView/view/content", this.node)
        let itemTmp = cc.find("layout/rules/ScrollView/view/item", this.node)
        for (let i=0; i<data.length; i++) {
            let item = content.children[i] || cc.instantiate(itemTmp)
            Global.setLabelString("lbl_name", item, "VIP"+data[i].level)
            Global.setLabelString("lbl_val", item, Number((data[i].rate*100).toFixed(2))+"%")
            item.parent = content
            item.active = true
        }
    },

    onClickGet(){
        cc.vv.PopupManager.removeTop()
        if(!cc.vv.PopupManager.getPopupByName("yd_bonus")){
            //跳转Bonus
            cc.vv.GameManager.jumpTo(11)
        }
    },


    onClickCollect(){
        StatisticsMgr.reqReport(ReportConfig.BONUS_TRANSFER_COLLECT);
        if (this._collect_coin <= 0) return
        cc.vv.NetManager.sendAndCache({ c: MsgId.BONUS_COIN_TRANSFER })
    },

});
