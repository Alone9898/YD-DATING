
cc.Class({
    extends: require('LMSlots_Symbol_Base'),

    properties: {
        _bFollow:false,
    },

    // LIFE-CYCLE CALLBACKS:

    // 清除所有状态
    ClearState(){
        this._bFollow = false;
        this.hideAllIcon();
        this.setAnimationToTop(false)
        this.ShowKuang(false)
        this.stopWinTweenAction()
        this.node.zIndex = 50 - this._symbolIdx  + this._reelIdx*10;
    },

    StartMove(){
        this._bFollow = false;
        this._super();
    },

    ShowById(id,data){
        this._super(id,data);

        if(this._bonusType){
            this.setDim();
        }

        this.hideAllIcon();
        if(data){
            if(data.c == 1){    // 奖池
                this.setJp(data.id, data.times);
            } else if(data.c == 2){    // 金币
                this.setCoin(data.coin);
            } else if(data.c == 3){    // 倍数
                this.setMult(data.times);
            } else if(data.c == 4 || data.c == 5){    // 4-oceanPick  5-power
                this.setBonusZiti(data.c);
            }
        }

        this.setMaskVisible(true);
    },

    hideAllIcon(){
        this.setJp();
        this.setCoin();
        this.setMult();
        this.setBonusZiti();
    },

    setJp(jpIdx, mult){
        cc.find("special/jp1", this.node).active = false;
        cc.find("special/jp2", this.node).active = false;
        cc.find("special/jp3", this.node).active = false;
        cc.find("special/jp4", this.node).active = false;
        if(jpIdx){
            let showJp = cc.find("special/jp"+jpIdx, this.node);
            showJp.active = true;
            showJp.y = mult > 1 ? 27:0;

            if(mult > 1){
                this.setMult(0);
                let showMult = cc.find("special/mult"+mult, this.node);
                showMult.active = true;
                showMult.y = -27;
            }
        }
    },

    setCoin(val){
        let showCoin = cc.find("special/coin", this.node);
        if(val){
            showCoin.active = true;
            showCoin.getComponent(cc.Label).string = Global.formatNumShort(val,0);
        } else {
            showCoin.active = false;
        }
    },

    setMult(mult){
        cc.find("special/mult2", this.node).active = false;
        cc.find("special/mult5", this.node).active = false;
        cc.find("special/mult10", this.node).active = false;
        cc.find("special/mult20", this.node).active = false;

        if(mult > 1){
            let showMult = cc.find("special/mult"+mult, this.node);
            showMult.active = true;
            showMult.y = 0;
        }
    },

    setBonusZiti(type){
        if(type){
            let bonusSp = cc.find("special/ziti", this.node).getComponent(sp.Skeleton);
            bonusSp.node.active = true;
            bonusSp.setAnimation(0, type == 4?"animation4":"animation8",false);
        } else {
            cc.find("special/ziti", this.node).active = false;
        }
    },

    // 图标置灰
    setMaskVisible(isMask) {
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[this._id] && cfg.symbol[this._id].node && cfg.symbol[this._id].isMask){
            let showNode = cc.find(cfg.symbol[this._id].node,this.node)
            if (isMask && cc.vv.gameData.IsBonus()) {
                showNode.color = new cc.Color(105, 105, 105);
            }
            else {
                showNode.color = cc.Color.WHITE;
            }
        }
    },

    playMaskVisible(isMask){
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[this._id] && cfg.symbol[this._id].node && cfg.symbol[this._id].isMask){
            let showNode = cc.find(cfg.symbol[this._id].node,this.node)
            if (isMask && cc.vv.gameData.IsBonus()) {
                cc.tween(showNode)
                    .to(0.5, {color:new cc.Color(105, 105, 105)})
                    .start()
            }
            else {
                showNode.color = cc.Color.WHITE;
            }
        }
    },

    //停止动画
    playStopAnimation(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        let data = this._data
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].stop_ani){
            this._state = "stop";
            if(this._showNode){
                this._showNode.active = false
            }
            // this._showNode = cc.find(cfg.symbol[id].win_node,this.node)
            // this._showNode.active = true

            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            topShowNode.active = true
            this._bFollow = true;
            if(cfg.symbol[id].stop_ani.name != ""){
                aniNode.zIndex = cfg.symbol[id].stop_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                // isPlay = true
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].stop_ani.name,false)
                    nodeSp.addAnimation(0,cfg.symbol[id].idle_ani.name,true)
                }
                if(id == 4 && (data.c==4 || data.c==5)){
                    let bonusSp = cc.find("special/ziti", aniNode).getComponent(sp.Skeleton);
                    bonusSp.node.active = true;
                    bonusSp.setAnimation(0, data.c == 4?"animation1":"animation5",false);
                    bonusSp.addAnimation(0, data.c == 4?"animation2":"animation6",true);
                }
            }
        }
    },

    StopMoveEnd(){
        this._bFollow = false;
    },

    //idle动画
    playBonusIdleAni(bTop){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        let data = this._data
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].idle_ani){
            this._state = "idle";
            if(this._showNode){
                this._showNode.active = false
            }

            if(bTop){
                let aniNode = this.setAnimationToTop(true)
                aniNode.active = true
                let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
                topShowNode.active = true
                if(cfg.symbol[id].idle_ani.name != ""){
                    aniNode.zIndex = cfg.symbol[id].idle_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                    // isPlay = true
                    let nodeSp = topShowNode.getComponent(sp.Skeleton)
                    if(nodeSp){
                        nodeSp.setAnimation(0,cfg.symbol[id].idle_ani.name,false)
                    }
                    if(id == 4 && (data.c==4 || data.c==5)){
                        let bonusSp = cc.find("special/ziti", aniNode).getComponent(sp.Skeleton);
                        bonusSp.node.active = true;
                        bonusSp.setAnimation(0, data.c == 4?"animation2":"animation6",false);
                    }
                }
            } else {
                this._showNode = cc.find(cfg.symbol[id].win_node,this.node)
                this._showNode.active = true

                if(cfg.symbol[id].idle_ani.name != ""){
                    this.node.zIndex = cfg.symbol[id].idle_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                    let nodeSp = this._showNode.getComponent(sp.Skeleton)
                    if(nodeSp){
                        nodeSp.setAnimation(0,cfg.symbol[id].idle_ani.name,false)
                    }

                    if(id == 4 && (data.c==4 || data.c==5)){
                        let bonusSp = cc.find("special/ziti", this.node).getComponent(sp.Skeleton);
                        bonusSp.node.active = true;
                        bonusSp.setAnimation(0, data.c == 4?"animation2":"animation6",false);
                    }
                }
            }
        }
    },

    //触发动画
    //触发了才播放的。比如已经3个scatter已经触发了免费。这个和中奖的还不一样
    playTriggerAnimation(bLoop){
        let isPlay = false
        let id = this._id
        let data = this._data
        let cfg = cc.vv.gameData.getGameCfg()
        bLoop = bLoop || (id == 2); // scatter 重复播放
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].trigger_ani){
            this._state = "trigger";
            if(this._showNode){
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            topShowNode.active = true
            if(cfg.symbol[id].trigger_ani.name != ""){
                aniNode.zIndex = cfg.symbol[id].trigger_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                isPlay = true
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].trigger_ani.name,bLoop)
                }
                if(id == 4 && (data.c==4 || data.c==5)){
                    let bonusSp = cc.find("special/ziti", aniNode).getComponent(sp.Skeleton);
                    bonusSp.node.active = true;
                    bonusSp.setAnimation(0, data.c == 4?"animation3":"animation7",bLoop);
                }
            }
        }
        return isPlay
    },

    //在顶层播放动画；能覆盖左右两列
    setAnimationToTop(isTop){
        if(this._topAniNode){
            if (isTop) {
                let cloneNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);

                //如果有同一帧又创建了，需要判断卷轴是否有效
                if (!cloneNode) {
                    cloneNode = cc.instantiate(this.node)
                }

                let wordPos = this.node.convertToWorldSpaceAR(cc.v2(0.0));
                cloneNode.parent = this._topAniNode
                cloneNode.name = cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx)
                cloneNode.position = this._topAniNode.convertToNodeSpaceAR(wordPos)
                // this.node.active = false
                return cloneNode
            }else{
                let showNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);
                if (showNode) {
                    //需要重复利用的话，隐藏就好
                    showNode.removeFromParent()
                    showNode.destroy()
                }
                this.node.active = true
                if(this._showNode){
                    this._showNode.active = true
                }
            }
        }
        return this.node
    },


    // bonus游戏图标
    setBonusToTop(){
        let id = this._id
        let data = this._data
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].idle_ani){
            if(this._showNode){
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            topShowNode.active = true
            if(cfg.symbol[id].idle_ani.name != ""){
                aniNode.zIndex = this._symbolIdx  + this._reelIdx*10 + 10
                // isPlay = true
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].idle_ani.name,true)

                    if(id == 4 && (data.c==4 || data.c==5)){
                        let bonusSp = cc.find("special/ziti", aniNode).getComponent(sp.Skeleton);
                        bonusSp.node.active = true;
                        bonusSp.setAnimation(0, data.c == 4?"animation2":"animation6",false);
                    }
                }
            }
        }
    },

    playBonusWin(){
        let showNode = this.setAnimationToTop(true);
        let node = cc.find("special/314_fanbei", showNode);
        node.active = true;
        node.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
        node.getComponent(sp.Skeleton).setCompleteListener(()=>{
            node.getComponent(sp.Skeleton).setCompleteListener(null);
            node.active = false;
        });
    },

    playBonusSpecial(){
        let showNode = this.setAnimationToTop(true);
        let node = cc.find("special/314_fanbei", showNode);
        node.active = true;
        node.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
        node.getComponent(sp.Skeleton).setCompleteListener(()=>{
            node.getComponent(sp.Skeleton).setCompleteListener(null);
            node.active = false;
        });
    },

    update(){
        if(this._bFollow){
            let topNode = this.setAnimationToTop(true);
            topNode.position = topNode.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0,0)))
        }

    },

});
