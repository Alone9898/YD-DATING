/**
 * 奖励详情
 */
 const List = require('List');
cc.Class({
    extends: cc.Component,

    properties: {
        listview:List,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_REFFERS_REWARDS_DETAILS, this.onRecvDetaillist, this)
    },

    start () {
        let req = {c:MsgId.REQ_REFFERS_REWARDS_DETAILS}
        // req.time = this._timeval
        cc.vv.NetManager.sendAndCache(req)
    },

    showToday(){
        this._bShowDay = true
    },

    showListview(){
        let num = 0
        if(this._servdata){
            num = this._servdata.length
        }
        this.listview.numItems = num
    },

    onListRender(item,idx){
        let data = this._servdata[idx]
        if(data){
            item.active = true
            item.getComponent("ReferRewardDetailItem").setInfo(data)
        }
        else{
            item.active = false
        }
    },

    onRecvDetaillist:function(msg){
        if(msg.code == 200){
            if(this._bShowDay){
                this._servdata = []
                for(let i = 0; i < msg.data.length; i++){
                    if(Global.sameDay(msg.data[i].create_time)){
                        this._servdata.push(msg.data[i])
                    }
                }
            }
            else{
                this._servdata = msg.data
            }
            

            this.showListview()
        }
    }

    // update (dt) {},
});
