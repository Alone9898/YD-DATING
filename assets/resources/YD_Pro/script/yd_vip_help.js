/**
 * about vip 
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let appName = cc.vv.UserConfig.getAppName()
        let lbl_str3 = cc.js.formatStr("Here at %s, your VIP benefits and privileges are permanent!",appName)
        Global.setLabelString("ui/lbl_des3",this.node,lbl_str3)
    },

    start () {

    },

    // update (dt) {},
});
