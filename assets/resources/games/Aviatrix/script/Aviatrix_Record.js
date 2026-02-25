/**
 * 游戏记录
 */
const LIST = require("List")

cc.Class({
    extends: cc.Component,

    properties: {
        listview:LIST,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._listdata = []
    },

    start () {
        this.showRecords()
    },

    showRecords:function(){
        let res = cc.vv.gameData.getGameRecords()
        let nTotal = res.length
        let nShowNum = 64
        this._listdata = []
        for(let i = 0; i < nShowNum; i++){
            let data = res[nTotal-1-i]
            if (data) {
                this._listdata.push(data)
            }
        }
        this.listview.numItems = this._listdata.length
        this.listview.scrollTo(0)
    },

    onRenderList:function(item, idx){
        let data = this._listdata[idx]
        if(data){
            item.active = true
            let lbl = cc.find("val",item)
            lbl.getComponent(cc.Label).string = data.toFixed(2)
            lbl.color = data>1.5?cc.Color.GREEN:cc.Color.BLUE
        }
        else{
            item.active = false
        }
    },
});
