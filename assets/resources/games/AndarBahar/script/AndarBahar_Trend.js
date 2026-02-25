/**
 * AndarBahar趋势
 */

const AndarColor = cc.color(108, 153, 255)
const BaharColor = cc.color(243, 50, 50)
cc.Class({
    extends: cc.Component,

    properties: {
        sprs:[cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._historyDots = []
        let historyNode = cc.find("history", this.node)
        for (let i=0; i<20; i++) {
            for (let j=0; j<5; j++) {
                let node = new cc.Node()
                node.position = cc.v2((i+0.5)*25-250, 62.5-(j+0.5)*25)
                let sprite = node.addComponent(cc.Sprite)
                node.active = false
                historyNode.addChild(node)
                this._historyDots.push(sprite)
            }
        }
    },

    start () {
        this.showRecord()
    },

    getCardStr(cardVal) {
        let val = cardVal & 0x0f
        if (val<=10) {
            return val+""
        } else if (val==11) {
            return "J"
        } else if (val==12) {
            return "Q"
        } else if (val==13) {
            return "K"
        } else if (val==14) {
            return "A"
        }
        return "Joker"
    },

    //显示记录
    showRecord:function(bNewAni){
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        //显示最近8条
        let nShowNum = 8
        let nAdd = 0
        if (nTotal < nShowNum) nAdd = nShowNum-nTotal
        let recentNode = cc.find("recent", this.node)
        for(let i = nShowNum; i > 0; i--){
            let idx = nTotal - i + nAdd
            let item = records[idx]
            let label = cc.find("res"+i, recentNode)
            if (item){
                label.getComponent(cc.Label).string = this.getCardStr(item.card)
                if (item.res == 1) {
                    label.color = AndarColor
                } else {
                    label.color = BaharColor
                }
            } else {
                label.getComponent(cc.Label).string = ""
            }
        }
        let andarCount = 0.0
        for (let i=0; i<records.length; i++) {
            if (records[i].res == 1) {
                andarCount += 1
            }
        }
        let andarPercent = 50
        if (records.length > 0) {
            andarPercent = Math.round(100.0*andarCount/records.length)
        }
        Global.setLabelString("stat/lbl_andar_his", this.node, andarPercent+"%")
        Global.setLabelString("stat/lbl_bahar_his", this.node, (100-andarPercent)+"%")

        //显示路图
        for (let i=0; i<100; i++) {
            let sprite = this._historyDots[i]
            if (i<nTotal) {
                sprite.node.active = true
                let item = records[i]
                if (item.res == 1) {
                    sprite.spriteFrame = this.sprs[1]
                } else {
                    sprite.spriteFrame = this.sprs[0]
                }
            } else {
                sprite.node.active = false
            }
        }
    },
});
