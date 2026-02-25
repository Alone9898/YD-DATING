
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        this._lblNum = cc.find('lbl_num',this.node).getComponent(cc.Label);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onChangeBetValue,this)
     },

     start(){
        this.initShow();
     },

    //初始化显示
    initShow(){
        let val = cc.vv.gameData.GetTotalBet();
        this._lblNum.string = Global.FormatNumToComma(val*50);
    },

    //押注额改变val
    onChangeBetValue(data){
        let val = data.detail;
        this._lblNum.string = Global.FormatNumToComma(val*50);
    }
});
