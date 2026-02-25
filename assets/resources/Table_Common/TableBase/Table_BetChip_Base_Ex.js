/**
 * 押注筹码-base
 */

const chipWhiteColor = cc.Color.WHITE
const chipGayColor = cc.color(192,192,192,255)

cc.Class({
    extends: require("Table_BetChip_Base"),

    //设置是否可以点击
    setClickEnable:function(val){
        this._bCanClick = val
    },

    //是否可以选中筹码
    setCanSelect:function(val){
        this.node.color = val?chipWhiteColor:chipGayColor
    },

    setSelect:function(val){
        if (this._bSelect == val) return
        this._bSelect = val
        this.node.stopAllActions()
        if(val){
            //选中
            cc.tween(this.node)
                .to(0.1, {scale:1.2, y:16}, {easing:"quadIn"})
                .call(()=>{
                    this.showSelectFlag(true)
                })
                .start()
        }
        else{
            //不选中
            cc.tween(this.node)
                .to(0.1, {scale:1, y:0}, {esaing:"quadOut"})
                .call(()=>{
                    this.showSelectFlag(false)
                })
                .start()
        }
    },

    getSelect:function(){
        return this._bSelect
    }

});
