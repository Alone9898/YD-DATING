cc.Class({
    extends: cc.Component,

    properties: {
        _tipIndex: [],
        _nowTipIndex: -1,
    },

    onLoad() {
        
        if (Global.isDurakApp()) {
            this.tipsConfig = [
                { get text() { return "One of the best card games ever!" } },
                { get text() { return "It will change your perception of fun!" } },
                { get text() { return "Continuous challenges are waiting for you to take on!" } },
                { get text() { return "Enjoy more and join the daily Cards Master and prove your skill!" } },
                { get text() { return  "Play now and create your own world!"} },
            ];
        } else {
            this.tipsConfig = [
                { get text() { return "مرحبًا بكم في لعبة مينسا بلاي هاند!" } },
                { get text() { return "تواصل مع الفيسبوك لحماية بياناتك!" } },
                { get text() { return "لعبة بلوت ممتازة!" } },
                { get text() { return "سجل دخولك كل يوم لتحصل على مكافآت غنية!" } },
                { get text() { return "تجربة الطاولة الأكثر أصالة!" } },
            ];
        }
        
        for (let i = 0; i < this.tipsConfig.length; i++) {
            this._tipIndex.push(i)
        }
        this.showRandomTips()
        this.schedule(() => {
            this.showRandomTips()
        }, 8)
    },

    start() {

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
