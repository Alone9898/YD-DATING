
cc.Class({
    extends: cc.Component,

    properties: {
        broadLbl:cc.RichText,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REFER_BROADCAST_INFO, this.REFER_BROADCAST_INFO, this)
    },

    start () {
        this.sendReferBroadInfo()
    },

    sendReferBroadInfo(){
        cc.vv.NetManager.send({ c: MsgId.REFER_BROADCAST_INFO })
    },

    REFER_BROADCAST_INFO(msg){
        if (msg.code != 200) return
        this.showData = msg.data;
        this.unschedule(this.updateBroadcast)
        if(this.showData.length > 0){
            this.updateBroadcast();
        }
    },

    updateBroadcast(){
        if(this.showData.length > 0){
            let data = this.showData.splice(0,1)[0];
            this.broadLbl.string = `player <color=#00ff00>${data.name}</color> earn <color=#F0FF00>${data.coin}</color> by referral ${data.type==2 ? "deposit" : "bet"}`
            this.broadLbl.node.x = 325
            let endx = -325 - this.broadLbl.node.width
            cc.tween(this.broadLbl.node)
            .to(7.8,{x:endx})
            .start()

            this.scheduleOnce(() => {
                this.updateBroadcast()
            }, 8)
        } else {
            this.sendReferBroadInfo();
        }
    }

    // update (dt) {},
});
