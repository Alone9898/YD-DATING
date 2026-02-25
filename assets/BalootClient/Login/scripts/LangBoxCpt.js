// 登录语言选择框
cc.Class({
    extends: cc.Component,
    properties: {
        arItem: cc.Node,
        enItem: cc.Node,
    },


    initView(closeFunc) {
        this.closeFunc = closeFunc;
        this.arItem.on("click", () => {
            this.onChangeLang(cc.vv.i18nLangEnum.AR);
        }, this);
        this.enItem.on("click", () => {
            this.onChangeLang(cc.vv.i18nLangEnum.EN);
        }, this);
    },

    onLoad() {
        let lanConfig = cc.vv.i18nManager.getConfig();
        cc.find("isSelect", this.arItem).active = lanConfig.lang == 'ar';
        cc.find("isSelect", this.enItem).active = lanConfig.lang == 'en';
    },


    onChangeLang(lang) {
        // 进行多语言的切换
        cc.vv.i18nManager.setLanguage(lang);
        let lanConfig = cc.vv.i18nManager.getLanguageConfig(lang)
        // 通知服务器修改
        let client_uuid = Global.getLocal('client_uuid', '');
        cc.log(client_uuid);
        // 请求HTTP
        cc.vv.NetManager.requestHttp(`/lang?ddid=${client_uuid}&lan=${lanConfig.id}`, {}, () => { })
        cc.vv.PopupManager.removePopup(this.node);
    },
    onDestroy() {
        if (this.closeFunc) this.closeFunc();
    },

});
