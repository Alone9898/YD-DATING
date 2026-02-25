// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


/*
* TradPlus广告联盟
* 统一接口，统一管理，统一处理
 */


cc.Class({
    extends: cc.Component,
    statics: {
        _adUnitId: null,

        init () {
            cc.vv.PlatformApiMgr.addCallback(this.interstitialLoadedCallBack, "interstitialLoadedCallBack");
            cc.vv.PlatformApiMgr.addCallback(this.channelNameCallBack, "channelNameCallBack");
            cc.vv.PlatformApiMgr.addCallback(this.rewardedVideoLoadedCallBack, "rewardedVideoLoadedCallBack");
            cc.vv.PlatformApiMgr.addCallback(this.rewardedVideoRewardedCallBack, "rewardedVideoRewardedCallBack");
            cc.vv.PlatformApiMgr.addCallback(this.rewardedVideoAdDismissedCallBack, "rewardedVideoAdDismissedCallBack");
        },

        loadAdRewardedVideo (adUnitId) {
            cc.vv.PlatformApiMgr.loadTradPlusRewardedVideo(adUnitId);
            this._adUnitId = adUnitId;
        },

        showTradPlusRewardedVideo () {
            cc.vv.PlatformApiMgr.showTradPlusRewardedVideo(this._adUnitId || (Global.isIOS()?"160AFCDF01DDA48CCE0DBDBE69C8C669":"39DAC7EAC046676C5404004A311D1DB1"));
        },

        interstitialLoadedCallBack () {
            AppLog.warn("TradPlusAdMgr.interstitialLoadedCallBack");
        },

        channelNameCallBack (cbData) {
            AppLog.warn("TradPlusAdMgr.channelNameCallBack(" + JSON.stringify(cbData) + ")");
        },

        rewardedVideoLoadedCallBack () {
            AppLog.warn("TradPlusAdMgr.rewardedVideoLoadedCallBack");
        },

        rewardedVideoRewardedCallBack (cbData) {
            AppLog.warn("TradPlusAdMgr.rewardedVideoRewardedCallBack(" + JSON.stringify(cbData) + ")");
        },

        rewardedVideoAdDismissedCallBack () {
            AppLog.warn("TradPlusAdMgr.rewardedVideoAdDismissedCallBack");
        }
    }
});
