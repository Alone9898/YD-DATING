let tipsConfig = [
    "loading_tip1",// "Welcome to CASH HERO CASINO SLOTS!",
    "loading_tip2",// "Ready to win? The best vegas slots are here!",
    "loading_tip3",// "When slotmates win,you win!",
    "loading_tip4",// "Come back every day for a bigger Daily Bonus!",
    "loading_tip5",// "Increase your bet to win more in a bonus game!",
    "loading_tip6",// "Collect gifts from friends! more friends - more fun!",
    "loading_tip7",// "Get free coins every hour!",
    "loading_tip8",// "Connect with Facebook to protect your data!",
]

cc.Class({
    extends: cc.Component,

    properties: {
        _tipIndex:[],
        _nowTipIndex:-1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for (let i = 0; i < tipsConfig.length; i++) {
            this._tipIndex.push(i)
        }
        this.showRandomTips()
        
        cc.tween(this.node)
        .delay(8)
        .call(()=>{
            this.showRandomTips()
        })
        .start()
    },

    start () {

    },

    

    showRandomTips(){  //保证不会连着两次随机到相同的tips
        if(!cc.isValid(this.node,true)) return
        let tempIndex = this._tipIndex[Global.random(0,this._tipIndex.length - 1)]
        // this.node.getComponent(cc.Label).string = tipsConfig[tempIndex]
        I18N.setI18nLabel(this.node, cc.vv.Language[tipsConfig[tempIndex]]);
        this.removeItemByVal(tempIndex)
        if(this._nowTipIndex >= 0){
            this._tipIndex.push(this._nowTipIndex)
        }
        this._nowTipIndex = tempIndex
    },

    removeItemByVal(val){
        for (let i = 0; i < this._tipIndex.length; i++) {
            const element = this._tipIndex[i];
            if(element === val){
                this._tipIndex.splice(i,1)
                break
            }
        }
    },

    // update (dt) {},
});
