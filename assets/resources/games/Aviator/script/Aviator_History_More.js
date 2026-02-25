/**
 * 更多记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node, this.onClickClose, this)
    },

    start () {

    },

    showMore(bShowHint){
        let res = cc.vv.gameData.getGameRecords()
        let nTotal = res.length
        let nShowNum = 18
        for(let i = 0; i < nShowNum; i++){
            let data = res[nTotal-1-i]
            let item = cc.find("bg/lay/item"+(i+1),this.node)
            if(data){
                item.active = true
                let lbl = cc.find("val",item)
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.color().fromHEX("#8C3EF7"):cc.color().fromHEX("#04A1E6")

                let newFlag = cc.find("new",item)
                if(newFlag){
                    
                    if(bShowHint){
                        newFlag.active = true
                        let endCall = function(){
                            if(cc.isValid(newFlag)) newFlag.active = false
                        }
                        Global.blinkAction(newFlag,0.2,0.2,3,endCall)
                    }
                }
            }else{
                item.active = false
            }
            

        }
    },

    onClickClose(){
        this.node.destroy()
    }

    // update (dt) {},
});
