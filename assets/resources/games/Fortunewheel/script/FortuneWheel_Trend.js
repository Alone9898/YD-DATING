/**
 * Fortune Wheel 趋势
 */

cc.Class({
    extends: cc.Component,

    properties: {
        atlas: cc.SpriteAtlas,
    },

    onLoad () {
        let btn_close = cc.find("btn_close",this.node)
        Global.btnClickEvent(btn_close, this.onClickClose, this)
        this.showRecord()
    },

    onClickClose() {
        this.node.destroy()
    },

    //显示记录
    showRecord:function(bNewAni){
        let cfg = cc.vv.gameData.getGameCfg()
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let resultsNode = cc.find("table/results", this.node)
        let dotsNode = cc.find("table/dots", this.node)
        let linesNode = cc.find("table/lines", this.node)
        let itemTmp = cc.find("table/item", this.node)
        let dotTmp = cc.find("table/dot", this.node)
        let lineTmp = cc.find("table/line", this.node)
        let lastPos = null
        //显示结果
        let idx = 0
        for (let i=nTotal-1; i>=0; i--) {
            //结果
            let result = cfg.ResultMap[records[i].res]
            let item = cc.instantiate(itemTmp)
            item.getChildByName("symbol").getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("symbol_"+result.symbol)
            item.getChildByName("mult").getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("x"+result.mult)
            item.active = true
            item.parent = resultsNode
            item.position = cc.v2(0, 59+idx*118)

            //红点
            let dot = cc.instantiate(dotTmp)
            dot.active = true
            dot.parent = dotsNode
            let pos =  cc.v2(70+140*(result.symbol-1), 59+idx*118)
            dot.position = pos
            //连线
            if (lastPos) {
                let line = cc.instantiate(lineTmp)
                line.active = true
                line.parent = linesNode
                line.position = cc.v2((pos.x+lastPos.x)/2, (pos.y+lastPos.y)/2)
                let delta = lastPos.sub(pos)
                let len = delta.mag()
                line.scaleY = len/line.height
                let angle = cc.v2(0, 1).signAngle(delta);
                line.rotation = -angle * cc.macro.DEG;
            }
            lastPos = pos
            idx += 1
            if (idx>=10) {
                break
            }
        }
    },
});
