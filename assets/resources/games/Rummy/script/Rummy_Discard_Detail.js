/**
 * 弃牌堆详情
 */

 let Rummy_Tools = require("Rummy_Tools")
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.btn_empty = cc.find("btn_empty",this.node)
        Global.btnClickEvent(this.btn_empty,this.onClickEmpty,this)
        let btn_detail = cc.find("btn_detail",this.node)
        Global.btnClickEvent(btn_detail,this.onClickDetail,this)

        this.node_detail = cc.find("node_detail",this.node)
    },

    start () {

    },

    onClickEmpty:function(){
        if(this.node_detail){
            
            
            if(this.node_detail.getNumberOfRunningActions()==0){
                this.node_detail.active = true
                cc.tween(this.node_detail)
                .to(0.3,{x:722})
                .call(()=>{
                    this.btn_empty.active = false
                })
                .start()
            }
            
        }
    },

    onClickDetail:function(){
        Global.TableSoundMgr.playEffect("click")
        if(this.node_detail){
            
            if(this.node_detail.getNumberOfRunningActions()==0){
                this.node_detail.active = true
                this.btn_empty.active = true
                this.showDetail()
                cc.tween(this.node_detail)
                .to(0.3,{x:350})
                .start()
            }
            
        }
    },

    showDetail:function(){
        for(let i = 0; i < 4; i++){
            let node = cc.find("item"+(i+1),this.node_detail)
            let lays = cc.find("lay_out",node)
            lays.removeAllChildren()
        }
        let roundInfo = cc.vv.gameData.getRoundInfo()
        if(roundInfo){
            let dis_cards = roundInfo.discardCards
            for(let i = 0; i < dis_cards.length; i++){
                let item = dis_cards[i]
                let color = Rummy_Tools.getPokerColor(item)
                let val = Rummy_Tools.getPokerVal(item)
                let node_color = cc.find("item"+color,this.node_detail)
                let str_show = Rummy_Tools.getValShow(val)
                let lbl_item = cc.instantiate(cc.find("poker_num",this.node_detail))
                lbl_item.y = 0
                lbl_item.active = true
                lbl_item.getComponent(cc.Label).string = str_show
                lbl_item.parent = cc.find("lay_out",node_color)
            }
        }
        
    },

    // update (dt) {},
});
