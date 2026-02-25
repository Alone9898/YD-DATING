/**
 * 物品
 */
cc.Class({
    extends: require("LMSlots_PauseUI_Base"),

    properties: {
        _itemIndex:null,    //物品的序号位置 0开始
        _reelIdx:null,
        _round:0,
        itemAtlas:cc.SpriteAtlas,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    resetItem:function(idx,reelIdx,cfg){
        this._itemIndex = idx
        this._reelIdx = reelIdx
        this._cfg = cfg
    },

    getItemIdx:function(){
        return this._itemIndex
    },

    clrearItemData:function(){
        this._round = 0
    },

    showRandSprite:function(){
        let cfg = this.getItemCfg()
        let randIdx = Global.random(1,8)
        let item = cfg[randIdx]
        this.node.getComponent(cc.Sprite).spriteFrame = this.itemAtlas.getSpriteFrame(item.normal)

    },

    showResultSprite:function(itemId){
        let cfg = this.getItemById(itemId)
        if(cfg){
            let sp = this.itemAtlas.getSpriteFrame(cfg.normal)
            if(sp){
                this.node.getComponent(cc.Sprite).spriteFrame = sp
            }
        }
    },

    //设置状态
    // strState:idle 停止,moveing 转动中 ,easing 回弹
    setMoveState:function(strState){
        this._moveState = strState
    },

    //获取移动状态
    getMoveState:function(){
        return this._moveState
    },

    //当前圈数
    getRound:function(){
        return this._round
    },
    setRound:function(val){
        this._round = val
    },
    addRound:function(val){
        this._round += 1
    },

    getItemCfg:function(){
        return this._cfg
    },

    getItemById:function(id){
        let cfg = this.getItemCfg()
        for(let i in cfg ){
            let item = cfg[i]
            if(i == id){
                return item
            }
        }
    }



    // update (dt) {},
});
