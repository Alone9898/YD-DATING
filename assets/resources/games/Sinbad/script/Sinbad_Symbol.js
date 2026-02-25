
cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        _wildMult:1,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    StartMove:function(){
        this._super();

        this.setWildMult();
        this.playBonusStopAnim(false);

        if(cc.vv.gameData.isBonusGame()){
            this.setMaskVisible(true);
        } else {
            this.setMaskVisible(false);
        }
    },

    setWildMult(val){
        this._wildMult = val?val:1;
    },

    //赢钱动画
    playWinAnimation(){
        if(this._showNode){
            this._showNode.active = false
        }
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node){
            this._state = "win";
            if(this._showNode){
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            topShowNode.active = true
            if(cfg.symbol[id].win_ani && cfg.symbol[id].win_ani.name != ""){
                aniNode.zIndex = cfg.symbol[id].win_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].win_ani.name,true)
                }

                if (id == 1 && this._wildMult > 1){
                    this.playWinMultAnimation(true);
                }
            }
        }
        else{
            //如果没有中奖动画，先显示出来
            //TODO：后续补充一个没有spin动画的显示效果
            this._showNode.active = true
            this.playWinTweenAction()
        }
    },

    // wild倍率动画
    playWinMultAnimation(bPlay){
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg()
        if(bPlay && id == 1){
            let aniNode = this.setAnimationToTop(true);
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            let multNode = cc.find("mult", topShowNode);
            multNode.active = true;
            multNode.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("Wildx%s_Intro",this._wildMult),false);
            multNode.getComponent(sp.Skeleton).addAnimation(0, cc.js.formatStr("Wildx%s_Loop",this._wildMult),true);
        }
    },

    ShowById:function(id,data){
        this._super(id, data)

        if(cc.vv.gameData.isBonusGame()){
            this.setMaskVisible(true);
        } else {
            this.setMaskVisible(false);
        }
    },

    setMaskVisible(isMask) {
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[this._id] && cfg.symbol[this._id].node){
            let showNode = cc.find(cfg.symbol[this._id].node,this.node)
            if (isMask && cfg.symbol[this._id].isMask) {
                showNode.color = new cc.Color(100, 100, 100);
            }
            else {
                showNode.color = cc.Color.WHITE;
            }
        }
    },

    Resume(backup) {
        this.stopWinTweenAction();

        this._super(backup);
    },

    //停止最低点之后
    StopMoveDeep(){
        let id = this._id;
        if(id == 3){    // bonus
            this.playBonusStopAnim(true);
            Global.SlotsSoundMgr.playEffect("reelcoin");
        }
    },

    playBonusStopAnim(bPlay){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(bPlay && id== 3){
            if(cfg.symbol[id].stop_ani.name != ""){
                let stopNode = cc.find(cfg.symbol[id].win_node,this.node);
                stopNode.active = true;
                this.node.zIndex = cfg.symbol[id].stop_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                let nodeSp = stopNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].stop_ani.name,false)
                }
            }
        } else {
            cc.find(cfg.symbol[3].win_node,this.node).active = false;
        }
    },

});
