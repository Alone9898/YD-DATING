
cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        _type:"normal",
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},


    ClearState:function(){
        this.setAnimationToTop(false)
        this.ShowKuang(false)
        this.stopWinTweenAction()
        this.node.zIndex = 50 - this._symbolIdx  + this._reelIdx*10;
    },


    setType(type){
        this._type = type;
    },

    //显示symbole
    //id:物品id
    //data:额外传递的数据
    ShowById:function(id,data){
        if(id == 3){
            if(this._type == "bonus_1"){
                id = 301;
            } else if(this._type == "bonus_2"){
                id = 302;
            } else if(this._type == "bonus_3"){
                id = 303;
            }
        }

        this._super(id, data)

        this.hideAllIcon();
        if(data){
            if(data.coin){
                this.setCoin(data.coin)
            } else if(data.jackpot){
                this.setJackpot(data.jackpot.id)
            }
        }

        this.setSymbolMask(true)
    },

    setSymbolMask(bMask){
        if(this._type == "bonus_1" || this._type == "bonus_2" || this._type == "bonus_3"){
            let cfg = cc.vv.gameData.getGameCfg()
            if(cfg.symbol[this._id] && cfg.symbol[this._id].node){
                let showNode = cc.find(cfg.symbol[this._id].node,this.node)
                if (bMask && cfg.symbol[this._id].isMask) {
                    showNode.color = new cc.Color(100, 100, 100);
                }
                else {
                    showNode.color = cc.Color.WHITE;
                }
            }
        }
    },

    //开始旋转时刻
    StartMove:function(){
        if(this._type == "bonus_1" || this._type == "bonus_2" || this._type == "bonus_3"){

        } else {
            this.setAnimationToTop(false)
        }

        this.ShowKuang(false)
        this.stopWinTweenAction()
        this.node.zIndex = 50 - this._symbolIdx  + this._reelIdx*10;
    },


    // 隐藏所有特殊图标
    hideAllIcon(){
        this.setCoin();
        this.setJackpot();
    },

    setCoin(coin){
        let lbl = cc.find("lbl", this.node);
        if(lbl){
            if(coin){
                lbl.active = true;
                lbl.getComponent(cc.Label).string = Global.formatNumShort(coin,0);
            } else {
                lbl.active = false;
                lbl.getComponent(cc.Label).string = "";
            }
        }
    },

    setJackpot(id){
        let jp = cc.find("jp", this.node);
        if(jp){
            if(id){
                jp.active = true;
                jp.getComponent("ImgSwitchCmp").setIndex(id-1);
            }else {
                jp.active = false;
            }
        }
    },

    //在顶层播放动画；能覆盖左右两列
    //bonus图标调整层级
    setAnimationToTop(isTop, bBonus=false){
        let rNode = this._super(isTop);

        if(bBonus){
            if(this._topAniNode) {
                if (isTop) {
                    let cloneNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s", this._symbolIdx, this._reelIdx), this._topAniNode);
                    if(cloneNode){
                        cloneNode.zIndex = (3-this._symbolIdx) * (this._reelIdx+1)
                    }
                }
            }
        }

        return rNode
    },

    playBonusWinAnim(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(id == 301 || id == 302 || id == 303){
            if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].win_ani){
                let winNode = cc.find(cfg.symbol[id].win_node, this.node);
                winNode.active = true;
                winNode.getComponent(cc.Animation).play(cfg.symbol[id].win_ani.name);
                // winNode.getComponent(cc.Animation).off("stop");
                // winNode.getComponent(cc.Animation).on("stop",()=>{winNode.active = false});
            }
        }
    },

    playBonusIdleAnim(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(id == 301 || id == 302 || id == 303){
            if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].idle_ani){
                let winNode = cc.find(cfg.symbol[id].win_node, this.node);
                winNode.active = true;
                winNode.getComponent(cc.Animation).play(cfg.symbol[id].idle_ani.name);
                // winNode.getComponent(cc.Animation).off("stop");
                // winNode.getComponent(cc.Animation).on("stop",()=>{winNode.active = false});
            }
        }
    },

    playBonusStopAnim(){
        return new Promise(async(success, failed)=> {
            let id = this._id
            let cfg = cc.vv.gameData.getGameCfg()
            let bonusIds = cfg.bonusIds;
            if (id == 3 || bonusIds.includes(id)) {
                if (cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].stop_ani) {
                    let winNode = cc.find(cfg.symbol[id].win_node, this.node);
                    winNode.active = true;
                    winNode.getComponent(cc.Animation).play(cfg.symbol[id].stop_ani.name);

                    winNode.getComponent(cc.Animation).off("stop");
                    winNode.getComponent(cc.Animation).on("stop", () => {
                        success();
                    });
                }
            }
        });
    },

    playBonusShowAnim(){
        return new Promise(async(success, failed)=> {
            let id = this._id
            let cfg = cc.vv.gameData.getGameCfg()
            let bonusIds = cfg.bonusIds;
            if (bonusIds.includes(id)) {
                if (cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].show_ani) {
                    let winNode = cc.find(cfg.symbol[id].win_node, this.node);
                    winNode.active = true;
                    winNode.getComponent(cc.Animation).play(cfg.symbol[id].show_ani.name);

                    winNode.getComponent(cc.Animation).off("stop");
                    winNode.getComponent(cc.Animation).on("stop", () => {
                        // if(cfg.symbol[id].idle_ani){
                        //     winNode.getComponent(cc.Animation).play(cfg.symbol[id].idle_ani.name);
                        // }
                        success();
                    });
                }
            }
        });
    },

    playBonusTriggerAnim(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if (id == 3) {
            if (cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].trigger_ani) {
                let winNode = cc.find(cfg.symbol[id].win_node, this.node);
                winNode.active = true;
                winNode.getComponent(cc.Animation).play(cfg.symbol[id].trigger_ani.name);

                // winNode.getComponent(cc.Animation).off("stop");
                // winNode.getComponent(cc.Animation).on("stop", () => {
                // });
            }
        }
    },


    getAnimationTop(){
        if(this._topAniNode){
            let cloneNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);

            if(cloneNode){
                return cloneNode;
            }
        }

        return null;
    },

    // update (dt) {},
});
