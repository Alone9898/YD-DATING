/**
 * RP系统
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._lbl_rp = cc.find("lbl_val",this.node)
        Global.registerEvent("EVENT_SPIN_MSG",this.onEventMsgSpine,this)

        Global.btnClickEvent(this.node, this.onBtnRpClick, this);
    },

    start () {
        this.ShowRP()
    },

    ShowRP:function(){
        if(this._lbl_rp){
            this._lbl_rp.getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.UserManager.rp)
        }
    },
    roallRP:function(add){

        if(this._lbl_rp && add){
            cc.tween(this.node)
            .delay(1)
            .call(()=>{
                Global.doRoallNumEff(this._lbl_rp,cc.vv.UserManager.rp-add,cc.vv.UserManager.rp,1.5,null,null,0,true)
            })
            .start()
        }
        
    },

    onEventMsgSpine:function(data){
        let val = data.detail
        this.onMsgSpine(val)
    },

    //通知旋转已经返回
    onMsgSpine:function(msg){
        if(msg && msg.code == 200){
            //RP 变化
            let add = 0 
            if(msg.rp){
                add=msg.rp.add
            }
            
            this.roallRP(add)
        }
    },

    onBtnRpClick:function(){
        cc.vv.gameData.PlayCommAudio("common_click")
        let url = "BalootClient/RP/PopupRPGameView"
        cc.vv.PopupManager.addPopup(url, {
            opacityIn: true,
            
        })
    }

    // update (dt) {},
});
