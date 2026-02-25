/**
 * 押注记录详情
 */

const LIST = require("List")
cc.Class({
    extends: cc.Component,

    properties: {
        listview:LIST,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.FixDesignScale_V(this.node);

        this.list_bg = cc.find("list_bg",this.node)
        // this.list_bg.x = 963
        // this.list_bg.active = false
        Global.btnClickEvent(this.node,this.onClickClose,this)

        cc.vv.NetManager.registerMsg(MsgId.GAME_BET_RECORDS, this.OnRcvRecords, this); 

        
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_BET_RECORDS, this.OnRcvRecords,false, this); 
    },

    start () {
        this.sendReq()

        
    },

    sendReq:function(){
        let req = {c:MsgId.GAME_BET_RECORDS}
        req.gameid = cc.vv.gameData.getGameId()
        req.limit = 100
        cc.vv.NetManager.send(req)
    },

    onClickClose:function(){
        this.node.destroy()
    },

    //获取可以显示的记录数据
    //如果当前还在展示结果，那就不展示当前的记录数据
    _getCanShowData:function(val){
        if(!cc.vv.gameData.getShowReulstFinish){ //如果没有实现次函数
            return val
        }
        let bFinish = cc.vv.gameData.getShowReulstFinish()
        if(bFinish){
            return val
        }
        else{
            let delkey = -1
            let curIssue = cc.vv.gameData.getCurRoundIssue()
            for(let i = 0; i < val.length ; i++){
                let item = val[i]
                if(item.i == curIssue){
                    delkey = i
                    break
                }
            }

            if(delkey != -1){
                val.splice(delkey,1)
            }

            return val

        }
    },

    OnRcvRecords:function(msg){
        if(msg.code == 200){
            let curgameId = cc.vv.gameData.getGameId()
            if(curgameId == msg.gameid){
                this._serverdata = this._getCanShowData(msg.records)

                this._showRecordsList()

                // this._showMoveIn()
            }
            
        }
    },

    // _showMoveIn:function(){
    //     if(this.list_bg.getNumberOfRunningActions() == 0){
    //         this.list_bg.x = 963
    //         this.list_bg.active = true
    //         cc.tween(this.list_bg)
    //         .to(0.3,{x:163},{easing:"quadOut"})
    //         .start()
    //     }
    //
    // },

    _showRecordsList:function(){
        this.listview.numItems = this._serverdata.length
    },

    onRenderList:function(item, idx){
        let itemdata = this._serverdata[idx]
        if(itemdata){
            item.active = true
            item.getComponent("Table_Record_Bet_Item").init(itemdata)
        }
        else{
            item.active = false
        }
    }

    

    // update (dt) {},
});
