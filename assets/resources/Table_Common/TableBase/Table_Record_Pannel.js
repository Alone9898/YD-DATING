/**
 * 押注记录详情
 */

const LIST = require("List")
cc.Class({
    extends: cc.Component,

    properties: {
        listview:LIST,
        listhistory:LIST,
        prefab_detail:cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.list_bg = cc.find("list_bg",this.node)
        // this.list_bg.x = 963
        // this.list_bg.active = false
        Global.btnClickEvent(this.node,this.onClickClose,this)

        cc.vv.NetManager.registerMsg(MsgId.GAME_BET_RECORDS, this.OnRcvRecords, this); 
        cc.vv.NetManager.registerMsg(MsgId.GAME_RESULT_HISTORY, this.OnRcvHistory, this); 
        //
        let tab1 = cc.find("tabs/tog/toggle1",this.node)
        if(tab1){
            tab1.on("toggle",this.onClickToggle1,this)
        }
        

        let tab2 = cc.find("tabs/tog/toggle2",this.node)
        if(tab2){
            tab2.on("toggle",this.onClickToggle2,this)
        }
        
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_BET_RECORDS, this.OnRcvRecords,false, this); 
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_RESULT_HISTORY, this.OnRcvHistory,false, this); 
    },

    start () {
        this._showPage(1)
        this.sendReq()

        
    },

    //下注记录
    sendReq:function(){
        let req = {c:MsgId.GAME_BET_RECORDS}
        req.gameid = cc.vv.gameData.getGameId()
        req.limit = 35
        cc.vv.NetManager.sendAndCache(req)
    },

    //历史记录
    senHistory:function(){
        let req = {c:MsgId.GAME_RESULT_HISTORY}
        req.gameid = cc.vv.gameData.getGameId()
        req.ssid = cc.vv.gameData.getTableSsid()
        req.limit = 35
        cc.vv.NetManager.sendAndCache(req)
    },

    onClickClose:function(){
        this.node.destroy()
    },

    //获取可以显示的记录数据
    //如果当前还在展示结果，那就不展示当前的记录数据
    _getCanShowData:function(val){
        if(cc.vv.gameData.getShowReulstFinish){
            let bFinish = cc.vv.gameData.getShowReulstFinish()
            if(bFinish){
                return val
            }
            else{
                let delkey = -1;
                let cnt = 0;
                let curIssue = cc.vv.gameData.getCurRoundIssue()
                for(let i = 0; i < val.length ; i++){
                    let item = val[i]
                    if(item.i == curIssue){
                        if(delkey == -1){
                            delkey = i
                        }
                        cnt += 1;
                        // break
                    } else {
                        break
                    }
                }
    
                if(delkey != -1){
                    val.splice(delkey,cnt)
                }
    
                return val
    
            }
        }
        else{
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

    OnRcvHistory:function(msg){
        if(msg.code == 200){
            let curgameId = cc.vv.gameData.getGameId()
            if(curgameId == msg.gameid){
                this._historydata = this._getCanShowData(msg.records)

                this._showHistoryList()

            }
        }
    },

    _showMoveIn:function(){
        if(this.list_bg.getNumberOfRunningActions() == 0){
            this.list_bg.x = 963
            this.list_bg.active = true
            cc.tween(this.list_bg)
            .to(0.3,{x:163},{easing:"quadOut"})
            .start()
        }
        
    },

    _showHistoryList:function(){
        this.listhistory.numItems = this._historydata.length
    },

    onRenderHistroyList:function(item, idx){
        let itemdata = this._historydata[idx]
        if(itemdata){
            item.active = true
            item.getComponent("Table_Record_Item").setDetailPrefab(this.prefab_detail)
            item.getComponent("Table_Record_Item").init(itemdata)
            
        }
        else{
            item.active = false
        }
    },

    _showRecordsList:function(){
        this.listview.numItems = this._serverdata.length
    },

    onRenderList:function(item, idx){
        let itemdata = this._serverdata[idx]
        if(itemdata){
            item.active = true
            item.getComponent("Table_Record_Item").init(itemdata)
        }
        else{
            item.active = false
        }
    },

    onClickToggle1:function(){
        Global.TableSoundMgr.playCommonEff("com_click");
        this.sendReq()
        this._showPage(1)
    },

    onClickToggle2:function(){
        Global.TableSoundMgr.playCommonEff("com_click");
        this.senHistory()
        this._showPage(2)
    },

    _showPage:function(nTab){
        let page1 = cc.find("list_bg",this.node)
        let page2 = cc.find("list_history",this.node)
        if(page1){
            page1.active = (nTab == 1)
        }
        if(page2){
            page2.active = (nTab == 2)
        }
        
    }

    

    // update (dt) {},
});
