/**
 * 记录item
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    init: function (data) {
        this._itemdata = data
        //时间
        Global.setLabelString("lbl_time", this.node, Global.getTimeStr(data.t))
        //押注额
        Global.setLabelString("lbl_amount", this.node, Global.FormatNumToComma(data.bet))
        //win
        let lbl_win = cc.find("lbl_win",this.node)
        if(lbl_win){
            let numPre = ""
            let color = cc.Color.GREEN
            if(data.win>0){
                numPre = "+"
                color = cc.Color.ORANGE
            }
            Global.setLabelString("lbl_win",this.node,numPre+Global.FormatNumToComma(data.win))
            
            lbl_win.color = color
        }
        
        Global.setLabelString("lbl_id", this.node, data.i)
        //gameresult
        // this.showGameResult(JSON.parse(data.result))
    },

    //根据游戏显示自己的结果
    showGameResult: function (result) {

    }

    // update (dt) {},
});
