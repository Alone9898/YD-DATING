/**
 * 观战列表
 */

const List = require('List');
cc.Class({
    extends: cc.Component,

    properties: {
        listview:List,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_close = cc.find("btn_close",this.node)
        Global.btnClickEvent(btn_close, this.onClickClose, this)
    },

    start () {

    },

    init:function(data){
        this._listdata = data
        this.listview.numItems = data.length
    },

    onListRender:function(item,id){
        let itemData = this._listdata[id]
        if(itemData){
            item.active = true
            //rank
            Global.setLabelString("lbl_rank",item,id+1)
            //name
            Global.setLabelString("lbl_name",item,itemData.playername)
            //coin
            Global.setLabelString("node_coin/val",item,Global.FormatNumToComma(itemData.coin) )
            
        }
        else{
            item.active = false
        }
    },

    onClickClose:function(){
        this.node.destroy()
    }



    // update (dt) {},
});
