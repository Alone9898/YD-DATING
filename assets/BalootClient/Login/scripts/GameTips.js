cc.Class({
    extends: cc.Component,

    properties: {
        _tipIndex: [],
        _nowTipIndex: -1,
    },

    onLoad() {
        this.tipsConfig = [
            { get text() { return ___("India's #1 skilled gaming app") } },
            { get text() { return ___("Safe, secure & easy payment methods") } },
            { get text() { return ___("Instant and unlimited withdrawals") } },
            { get text() { return ___("24x7 customer service support") } },
            { get text() { return ___("Fair and responsible play protect") } },
            { get text() { return ___("Best Value and Top Rewards") } },
            { get text() { return ___("Tournament,Salon Room,Multiplayers,Slot") } },
            // { get text() { return ___("收集朋友的礼物! 更多的朋友 - 更多的乐趣!") } },
            // { get text() { return ___("全民都在玩Domino.") } },
            // { get text() { return ___("连接 Facebook 以保护您的数据!") } },
            // { get text() { return ___("加载资源,无流量消耗,请勿关闭游戏!") } },
        ];
        for (let i = 0; i < this.tipsConfig.length; i++) {
            this._tipIndex.push(i)
        }
        
    },

    start() {
        this.showRandomTips()
        this.schedule(() => {
            this.showRandomTips()
        }, 5)
    },

    onDestroy() {
        this.unscheduleAllCallbacks()
    },

    showRandomTips() {  //保证不会连着两次随机到相同的tips
        let tempIndex = this._tipIndex[Global.random(0, this._tipIndex.length - 1)]
        this.node.getComponent(cc.Label).string = this.tipsConfig[tempIndex].text;
        this.removeItemByVal(tempIndex)
        if (this._nowTipIndex >= 0) {
            this._tipIndex.push(this._nowTipIndex)
        }
        this._nowTipIndex = tempIndex
    },

    removeItemByVal(val) {
        for (let i = 0; i < this._tipIndex.length; i++) {
            const element = this._tipIndex[i];
            if (element === val) {
                this._tipIndex.splice(i, 1)
                break
            }
        }
    },

    // update (dt) {},
});
