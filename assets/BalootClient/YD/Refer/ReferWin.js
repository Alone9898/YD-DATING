

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REFER_INFO, this.REFER_INFO, this)
        cc.vv.NetManager.sendAndCache({ c: MsgId.REFER_INFO })

        Global.onClick("layout/shares/btn_whatsapp", this.node, this.onClickWhatsapp, this)
        Global.onClick("layout/shares/btn_fb", this.node, this.onClickFb, this)
        Global.onClick("layout/shares/btn_copy", this.node, this.onClickCopy, this)

        let prog = cc.find("layout/coins/progress", this.node)
        prog.getComponent(cc.ProgressBar).progress = 0.01
    },

    REFER_INFO(msg) {
        if (msg.code != 200) return
        this.updateView(msg.info)
        this._url = msg.info.url
    },

    updateView(info) {
        Global.setLabelString("layout/coins/lbl_invited", this.node, info.hadcnt)
        Global.setLabelString("layout/shares/code_bg/lbl_code", this.node, info.code)
    },

    shareCallback(data) {
        if (data.result == "-2") {
            cc.vv.FloatTip.show("Share failed")
        }else if (data.result == "-10") {
            cc.vv.FloatTip.show(___("未安装Messager"))
        } else if (data.result == "-11") {
            cc.vv.FloatTip.show(___("未安装whatsapp"))
        }
    },

    onClickWhatsapp(){
        cc.vv.FBMgr.WhatsappShare(this._url, this.shareCallback.bind(this));
    },

    onClickFb(){
        cc.vv.FBMgr.fbShareWeb(this._url, null, "", this.shareCallback.bind(this));
    },

    onClickCopy(){
        cc.vv.PlatformApiMgr.Copy(this._url)
        cc.vv.FloatTip.show(___("复制成功"))
    },

});
