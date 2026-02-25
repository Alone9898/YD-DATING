/**
 * 押注筹码-base
 */
cc.Class({
    extends: cc.Component,

    properties: {
       _chipdata:null,
       atlas:cc.SpriteAtlas,
       _bSelect:false,
       _bCanClick:false
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node,this.onClickBet,this)
    },

    start () {
        
    },

    init:function(data){
        this._chipdata = data

        this._showChip()
    },

    /**
     * 获取筹码面值
     */
    getChipVal:function(){
        return this._chipdata
    },

    /**
     * 设置缩放系数
     * @param {*} val 
     */
    setScale:function(val){
        this.node.scale = val
    },


    _showChip:function(){
        //设置icon
        this.node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(this._chipdata)
        // //设置lbl
        // Global.setLabelString("lbl",this.node,this._chipdata)
    },

    onClickBet:function(){
        if(this._bCanClick){
            Global.TableSoundMgr.playCommonEff("com_click")
            Global.dispatchEvent("change_chip",this._chipdata)
        }
        
    },


    //设置是否可以点击
    setClickEnable:function(val){
        this._bCanClick = val
        this.node.getComponent(cc.Button).enabled = val
    },

    //是否可以选中筹码
    setCanSelect:function(val){
        this.node.getComponent(cc.Button).interactable=val
        if(val){
            this.showSelectFlag(this._bSelect)
        }
        else{
            this.showSelectFlag(false)
        }
    },

    setSelect:function(val){
        this._bSelect = val
        if(val){
            //选中
            this.node.y = 16
            this.node.scale = 1.2
            this.showSelectFlag(true)
        }
        else{
            //不选中
            this.node.y = 0
            this.node.scale = 1
            this.showSelectFlag(false)
        }
    },

    showSelectFlag:function(val){
        let flag = cc.find("sel",this.node)
        flag.active = val
    }

    // update (dt) {},
});
