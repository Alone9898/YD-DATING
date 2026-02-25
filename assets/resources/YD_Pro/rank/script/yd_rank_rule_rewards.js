const { type } = require("os");

cc.Class({
    extends: cc.Component,

    properties: {
        sprTableBottom: cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.netListener.registerMsg(MsgId.EVENT_GET_RANK_REWARDS_CFG, this.EVENT_GET_RANK_REWARDS_CFG, this);  // 获取排行榜信息
        this.inited = false
    },

    // type 1:日榜 2:周榜 3:月榜 4:代理排行榜
    setRankInfo(type){
        // 发送请求
        this._rtype == type
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_GET_RANK_REWARDS_CFG , rtype:type});
    },

    EVENT_GET_RANK_REWARDS_CFG(msg){
        if(msg.code == 200){
            this.updateView(msg.rtype, msg.rewards)
        }
    },


    // 更新界面
    updateView(rtype, rewards) {
        if (this.inited) return
        this.inited = true
        let types = ["", "Daily", "Weekly", "Monthly", "Referrals"]
        Global.setLabelString("rules/item/lbl_name", this.node, types[rtype])

        let content = cc.find("rules/ScrollView/view/content", this.node)
        let itemTmp = cc.find("rules/ScrollView/view/item", this.node)
        for (let i=0; i<rewards.length; i++) {
            let reward = rewards[i]
            let item = cc.instantiate(itemTmp)
            if (reward.l_ord == reward.r_ord) {
                Global.setLabelString("lbl_name", item, ""+reward.l_ord)
            } else {
                Global.setLabelString("lbl_name", item, reward.l_ord+"-"+reward.r_ord)
            }
            
            Global.setLabelString("lbl_val", item, reward.coin)
            if (i==rewards.length-1) {
                item.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.sprTableBottom
            }
            item.parent = content
            item.active = true
        }
    },

});
