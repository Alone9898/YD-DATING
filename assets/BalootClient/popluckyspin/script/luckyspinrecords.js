/**
 * luckyspine记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        spr_free:cc.SpriteFrame,
        spr_refer:cc.SpriteFrame,
        listView:require('List'),
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.LUCKYSPIN_RECORDS, this.LUCKYSPIN_RECORDS, this);
    },

    start () {
        this.sendReqData()
    },

    sendReqData:function(){
        cc.vv.NetManager.send({c:MsgId.LUCKYSPIN_RECORDS})
    },

    showList:function(){
        this.listView.numItems = this._listdata.length

    },

    onListRender:function(item,idx){
        let data = this._listdata[idx]
        if(data){
            item.active = true
            //时间
            Global.setLabelString("lbl_date",item,Global.getTimeStr(data.t))
            //type
            let spr_val = this.spr_free
            if(2 == data.type){
                spr_val = this.spr_refer
            }
            Global.setSpriteFrame("spr_type",item,spr_val)
            //rewards
            Global.setLabelString("rewards/val",item,"x"+data.coin)
        }
        else{
            item.active = false
        }
    },

    LUCKYSPIN_RECORDS:function(msg){
        if(msg.code == 200){
            this._listdata = msg.datalist
            this.showList()
        }
    }

    // update (dt) {},
});
