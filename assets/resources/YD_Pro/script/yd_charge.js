
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Global.FixDesignScale_V(this.node);
        Global.btnClickEvent(cc.find("top/btn_back", this.node), this.onClickBack, this);
    },

    start() {
        let webview = cc.find("webview", this.node).getComponent(cc.WebView)
        let scheme = "openurl"
        let thisnode = this.node
        function jsCallback (target, url) {
            AppLog.warn("===webview open url", url)
            let str = url.replace(scheme+"://", '')
            if (str=="close") {
                //close current page
                thisnode.destroy()
            }else if (str.indexOf("save#") == 0) {
                str = str.replace("save#", '')
                //save image
                cc.vv.PlatformApiMgr.SaveUrlToAlumb(str)
            }else if (str.indexOf("send#") == 0) {
                let sender = str.replace("send#", '')
                //send mail
                let params = {
                    sender: sender,
                    title: "MY UID:"+cc.vv.UserManager.uid,
                    content: "Please let us know how can we help!",
                    sendway:"sendto",
                }
                cc.vv.PlatformApiMgr.SendMail(JSON.stringify(params))
            }
            else if(str.indexOf("relogin#") == 0){
                //到登陆界面
                cc.vv.GameManager.goBackLoginScene()
            }
            else {
                //open url
                cc.vv.PlatformApiMgr.openURL(str)
            }
        }
        webview.setJavascriptInterfaceScheme(scheme);
        webview.setOnJSCallback(jsCallback);
    },

    setURL(url, data = null,amount=null) {
        if (url) {
            url = url.replace("https://pay.yonogames.com", "https://pay.25599.in")
            // url = `${url}?uid=${cc.vv.UserManager.uid}&token=${cc.vv.UserManager.token}`;
            let uid = cc.vv.UserManager.uid
            if(!uid){
                uid = Global.playerData.uid
            }
            let token = cc.vv.UserManager.token
            if(!token){
                token = Global.playerData.token
            }
            url = cc.js.formatStr("%s?uid=%s&token=%s",url,uid,token)
            if(amount){
                url += ("&amount="+amount)
            }
            if (data) {
                if (data.postfix) {
                    url += data.postfix
                }
            }
            console.log("===webview url", url)
            cc.find("webview", this.node).getComponent(cc.WebView).url = url;
        }
    },

    onClickBack() {
        cc.game.removePersistRootNode(this.node)
        cc.vv.EventManager.emit("EVENT_BTN_CLOSE_SOUNDS");
        // cc.vv.PopupManager.removePopup(this.node);
        this.node.destroy()
    },


    // update (dt) {},
});
