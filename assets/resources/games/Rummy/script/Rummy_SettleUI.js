/**
 * 结算
 */
cc.Class({
    extends: cc.Component,

    properties: {
       list_item:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_close = cc.find("ui/lay/btn_confirm",this.node)
        Global.btnClickEvent(btn_close,this.onClickClose,this)

        let btn_switch = cc.find("ui/lay/btn_switch",this.node)
        let bShow = true
        if(cc.vv.gameData.isFriendRoom() || cc.vv.gameData.isMatchRoom()){
            bShow = false
        }
        btn_switch.active = bShow
        
        Global.btnClickEvent(btn_switch,this.onClickSwitch,this)

        let btn_leave = cc.find("ui/lay/btn_leave",this.node)
        Global.btnClickEvent(btn_leave,this.onClickLeave,this)
    },

    start () {

    },

    setInfo:function(datas){
        let parNode = cc.find("ui/scro/view/content",this.node)
        for(let i = 0; i < datas.length; i++){
            let item = cc.instantiate(this.list_item)
            item.active = true
            item.parent = parNode
            item.getComponent("Rummy_SettleItem").init(datas[i],i)
        }

        //倒计时
        this.showNextRoundTime()
    },

    onClickClose:function(){
        Global.TableSoundMgr.playEffect("click")
        this.node.destroy()
    },

    onClickSwitch:function(){
        cc.vv.gameData.sendSwitchReq()
        this.node.destroy()
    },

    onClickLeave:function(){
        cc.vv.gameData.ReqBackLobby()
    },

    //默认进入下一句的时间
    showNextRoundTime:function(){
        

        let timeLbl = cc.find("ui/lay/btn_confirm/Background/Label",this.node)
        if(timeLbl){
            if(cc.vv.gameData.isFriendRoom()){
                timeLbl.getComponent(cc.Label).string = "CONFIRM"
            }
            else{
                let nRimnd = cc.vv.gameData.getMatchRetime()
                let roundInfo = cc.vv.gameData.getRoundInfo()
                if(roundInfo){
                    nRimnd = roundInfo.delayTime
                }
                timeLbl.getComponent("ReTimer").setReTimer(nRimnd,1,null,"CONFIRM(%ss)")
            }
            
        }
    }

    // update (dt) {},
});
