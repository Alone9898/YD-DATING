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
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        let contactus = cc.vv.UserManager.contactus;
        if(!contactus){
            contactus = Global.getLocal('contacturl')
        }
        if(!contactus){
            if(Global.appId == Global.APPID.YonoGames){
                contactus = "https://vm.providesupport.com/04qetijpc30hp11ayhbj2xfvh4"
            }
            else if(Global.appId == Global.APPID.RummyVIP){
                contactus = "http://rummyvipkf.com"
            }
            
        }
        if(contactus){
            cc.vv.PlatformApiMgr.openURL(contactus)
        }
    },



    // update (dt) {},
});
