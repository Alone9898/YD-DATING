/**
 * webview 去掉刷新
 */
cc.Class({
    extends: cc.WebView,

    properties: {
        
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable () {
        let impl = this._impl;
        impl.createDomElementIfNeeded(this.node.width, this.node.height);
        if (!CC_EDITOR) {
            impl.setEventListener(cc.WebView.EventType.LOADED, this._onWebViewLoaded.bind(this));
            impl.setEventListener(cc.WebView.EventType.LOADING, this._onWebViewLoading.bind(this));
            impl.setEventListener(cc.WebView.EventType.ERROR, this._onWebViewLoadError.bind(this));
        }
        // impl.loadURL(this._url);
        impl.setVisible(true);
    },

    // update (dt) {},
});
