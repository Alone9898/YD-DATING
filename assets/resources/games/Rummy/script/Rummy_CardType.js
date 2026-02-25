/**
 * 牌型
 */
let Rummy_Tools = require("Rummy_Tools")
cc.Class({
    extends: cc.Component,

    properties: {
       type_red:cc.SpriteFrame,
       type_yellow:cc.SpriteFrame,
       type_green:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    showCardType:function(orgcards){
        let cards = Global.copy(orgcards)
        let wild = cc.vv.gameData.getRoundWild()
        let nType = Rummy_Tools.getCardType(cards,wild)
        let type_bg = this.type_red
        let type_name ="Invalid"
        let pt = 0
        // let color = new cc.Color().fromHEX("ffcfd9")
        let bPokerStye = false
        if(nType == Rummy_Tools.CardType.PureSeq){
            type_bg = this.type_green
            type_name = "Pure sequence"
            // color = new cc.Color().fromHEX("d9f8bc")
            bPokerStye = true
        }
        else if(nType == Rummy_Tools.CardType.Set){
            type_bg = this.type_yellow
            pt = Rummy_Tools.getCardScore(cards,wild)
            // let preNum = cc.vv.gameData.isHasPureSeq()
            // let seq = cc.vv.gameData.isHasSeq()
            if(this.isGreen()){
                type_bg = this.type_green
                pt = 0
            }
            type_name = "Set"
            
            // color = new cc.Color().fromHEX("f8efbc")
            bPokerStye = true
        }
        else if(nType == Rummy_Tools.CardType.Seq){
            type_bg = this.type_yellow
            pt = Rummy_Tools.getCardScore(cards,wild)
            // let preNum = cc.vv.gameData.isHasPureSeq()
            // let seq = cc.vv.gameData.isHasSeq()
            if(this.isGreen()){
                type_bg = this.type_green
                pt = 0
            }
            type_name = "Sequence"
            
            // color = new cc.Color().fromHEX("f8efbc")
            bPokerStye = true
        }
        else if(nType == Rummy_Tools.CardType.Pts){
            type_bg = this.type_red
            type_name = "Pts"
            pt = Rummy_Tools.getCardScore(cards,wild)
        }
        else{
            pt = Rummy_Tools.getCardScore(cards,wild)
        }

        let show_name
        if(pt){
            show_name = cc.js.formatStr("%s(%s)",type_name,pt)
        }
        else{
            show_name = type_name
        }
        // let spr_gou = cc.find("lay/spr_gou",this.node)
        // spr_gou.active = bPokerStye
        // let spr_cha = cc.find("lay/spr_cha",this.node)
        // spr_cha.active = !bPokerStye
        let lbl = cc.find("lay/val",this.node)
        lbl.getComponent(cc.Label).string = show_name
        // lbl.color = color
        cc.find("lay/icon",this.node).getComponent(cc.Sprite).spriteFrame = type_bg

        return pt
    },

    isGreen:function(){
        // let grouptypes = []
        let preSeqNum = 0
        let seqNum = 0
        let wildVal = cc.vv.gameData.getRoundWild()
        let myHands = cc.vv.gameData.getMyHand()
        for(let i = 0; i < myHands.length; i++){
            let dui = myHands[i]
            // let cardType = Rummy_Tools.CardType.Invalid
            if(Rummy_Tools.isPureSequence(dui)) {
                preSeqNum += 1
            }
            else if(Rummy_Tools.isSequence(dui,wildVal)){
                seqNum += 1
            }
        }

        return (preSeqNum>0) && (preSeqNum+seqNum>=2)
    }

    // update (dt) {},
});
