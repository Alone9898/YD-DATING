
cc.Class({
    extends: cc.Component,

    properties: {
        panelBtn:cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.panelBtn.node, this.onClickPanelBtn, this);
    },

    start () {

    },

    onClickPanelBtn(){
        if(cc.vv.gameData.GetAutoModelTime() > 0){
            return
        }
        let state = cc.vv.gameData.GetSlotState();
        if(state == "idle"){
            this.sendSpinEvent();
        } else if(state == "moveing_2"){
            this.sendStopEvent();
        }

    },

    sendSpinEvent(){
        cc.vv.gameData.GetBottomScript().OnClickSpin();
    },

    sendStopEvent(){
        cc.vv.gameData.GetBottomScript().OnClickStop();
    },

    // update (dt) {},
});
