/**
 * 
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
        Global.onClick("btn_detail", this.node, this.onClickDetail, this)
    },

    start () {

    },

    setInfo:function(info){
        this._itemdata = info
        //date
        let str = Global.getFullDateStr(info.create_time)
        Global.setLabelString("lbl_date",this.node,str)
        //bet amount
        Global.setLabelString("lbl_bet",this.node,Global.FormatNumToComma(info.bet))
        //charge
        Global.setLabelString("lbl_charge",this.node,Global.FormatNumToComma(info.recharge))
        //income
        Global.setLabelString("lbl_income",this.node,Global.FormatNumToComma(info.coin))

    },

    onClickDetail:function(){
        cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferRewardDetail", {
            onShow: (node) => {
                node.getComponent("ReferRewardDetail").setInfo(this._itemdata.create_time)
            }
        })
    }

    // update (dt) {},
});
