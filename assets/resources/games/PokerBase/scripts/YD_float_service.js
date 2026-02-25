/**
 * 客服按钮
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node,this.init,this);
    },

    start () {

    },

    onEnable() {

    },

    init(){
        let contactus = cc.vv.UserManager.contactus;
        if(contactus){
            cc.vv.PlatformApiMgr.openURL(contactus)
        }
    },



    // update (dt) {},
});
