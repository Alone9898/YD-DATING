/**
 * YD项目相关接口
 */
cc.Class({
    extends: cc.Component,

    statics: {
        
        init:function(){

        },

        //支付
        //ptype:1 coin 2 diamond
        doPay:function(ptype,price){
            let url = "http://pay.25599.in/#/?"
            let param = "uid=%s&token=%s&amount=%s&t=%s"
            let uid = cc.vv.UserManager.uid
            let token = cc.vv.UserManager.token
            param = cc.js.formatStr(param,uid,token,price,ptype)

            url = url + param

            cc.vv.PlatformApiMgr.openURL(url)
        }
    },

    
    // update (dt) {},
});
