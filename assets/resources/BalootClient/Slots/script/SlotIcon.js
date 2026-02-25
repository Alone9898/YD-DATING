/**
 * sloticon显示
 */
let itemsListCfg = require("GameItemCfg");
cc.Class({
    extends: cc.Component,

    properties: {
        spr_icon:cc.Node,
        // bUseCfgScale:true,
        _gameId:null,
        _spineScale:null,
        _cfg:null,
        _loadAni:null,
        _itemIdx:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let spine = cc.find('spine',this.node);
        this._spineScale = spine.scale
    },

    start () {

    },

    //设置游戏id
    setGameId:function(gameId,ani,onShowCall){
        this._gameId = gameId
        this._loadAni = ani
        this._onShowCall= onShowCall

        let icon = cc.find('icon',this.node)
        icon.active = false
        let spine = cc.find('spine',this.node);
        spine.active = false
        this._cfg = itemsListCfg[gameId]
        if (this._cfg && this._cfg.animation) {
            this.LoadIconAnimation()
        }
        else{
            this.LoadIcon()
        }


    },


    _getIconUrl(cfg){
        return "BalootClient/Slots/icon/"+ cfg.action
    },

    _getAnimationUrl(cfg) {
        return "BalootClient/Slots/icon/"+ cfg.action +"/spine"
    },


    //静态icon
    LoadIcon:function(){
        let icon = cc.find('icon',this.node)
        // icon.active = false

        if(!icon){
            icon = this.spr_icon
        }
        let cfg = this._cfg
        if(!cfg){
            cc.log(cc.js.formatStr('%s未配置GameItemCfg',this._gameId))
            icon.active = false
            return
        }

        //配置了动画就不现实静态背景图
        if (cfg.animation) {
            return
        }




        cc.loader.loadRes(this._getIconUrl(cfg), cc.SpriteFrame, (err, data) => {
            if(cc.isValid(icon,true)){
                if (!err) {
                    icon.getComponent(cc.Sprite).spriteFrame = data;
                    icon.active = true
                    if(icon.anchorY == 0){
                        if(cfg.staOffsetY || !cfg.animation){
                            icon.y = cfg.staOffsetY || -27;
                        }else {
                            icon.y = 0.45;
                        }
                    }


                }else{
                    icon.active = false
                }
            }
        });
    },

    LoadIconAnimation:function() {
        let self = this
        let spine = cc.find('spine',this.node);
        let icon = cc.find('icon',this.node)
        // if(spine){
        //     spine.active = false;
        // }

        let cfg = this._cfg
        if(!cfg){
            cc.log(cc.js.formatStr('%s未配置GameItemCfg',this._gameId))
            return
        }


        if (!cfg.animation) {
            return;
        }

        let iconUrl = this._getAnimationUrl(cfg)

        //按队列加载
        cc.vv.UserManager.loadSlotIconByQueue(spine,iconUrl,sp.SkeletonData,(err,data)=>{
            if (!err && cfg && cfg.animation && cc.isValid(spine,true)) {
                //如果外部设置了动画优先显示
                let showAni = this._loadAni? this._loadAni:cfg.animation
                icon.active = false
                spine.active = true;
                let ske = spine.getComponent(sp.Skeleton);
                ske.skeletonData = data;
                ske.setAnimation(0, showAni, true);
                if(this._onShowCall){
                    this._onShowCall()
                }
            }
        })

    },

    // update (dt) {},
});
