/**
 * Bonus-促销
 */


cc.Class({
    extends: cc.Component,

    properties: {
        listView:require('List'),
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.BONUS_PROM_LIST, this.BONUS_PROM_LIST, this);
    },

    onEnable () {
        this.sendPromReq()
    },

    showLists(){
        this.listView.numItems = this._listdata.length

    },


    onUpdateItem (item, idx) {
        let itemdata = this._listdata[idx]
        if(itemdata){
            item.active = true
            item.getComponent("yd_bonus_pro_item").inititem(itemdata)
        }
        else{
            item.active = false
        }
    },

    //发送请求
    sendPromReq(){
        cc.vv.NetManager.sendAndCache({
            c: MsgId.BONUS_PROM_LIST,
        });
    },

    BONUS_PROM_LIST(msg){
        if(msg.code == 200){

            this._listdata = msg.data
            //排序
            this._listdata.sort((a,b)=>{
                return a.ord - b.ord
            })
            this.showLists()
        }
    }

    // update (dt) {},
});
