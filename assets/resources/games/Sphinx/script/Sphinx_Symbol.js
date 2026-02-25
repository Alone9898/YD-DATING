
cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        _coinNum:0,
        _bonusType:"",
        _bonusFree:0,
    },

    /**
     * 获取随机的符号表，可重写次函数根据需要配置免费游戏的符号表
     *
     */
    GetRandomCfg:function(){
        let cfg = cc.vv.gameData.getGameCfg()
        let isFree = cc.vv.gameData.isFreeGame() || cc.vv.gameData.isSuperGame();
        if(isFree && cfg.cardmapFree) {
            return cfg.cardmapFree
        }
        return cfg.cardmap
    },


    StartMove(){
        this._super();

        this._coinNum = 0;
        this._bonusType = "";
        this._bonusFree = 0;

        this.playBonusBgGuangAnim(false);
        this._startMove = true;
    },

    StopMoveEnd(){
        this._super();

        this._startMove = false;
        this.playRunBgAnim(false, true);
    },

    //显示symbole
    //id:物品id
    //data:额外传递的数据
    ShowById:function(id,data){
        this._super(id, data);

        this.hideAllIcon();

        if(this._startMove && id == 2){
            this.playRunBgAnim(true);
        } else {
            this.playRunBgAnim(false);
        }
    },

    hideAllIcon(){
        this.setCoin();
    },

    setCoin(num, bPlay){
        let lbl_coin = cc.find("lbl_coin", this.node);
        if(num){
            let font = null;
            let nVal = cc.vv.gameData.GetTotalBet();
            if(num < 0.5*nVal){
                font = cc.vv.gameData.GetFontByName("theme227_base_coin3");
            } else if(num < nVal){
                font = cc.vv.gameData.GetFontByName("theme227_base_coin2");
            } else{
                font = cc.vv.gameData.GetFontByName("theme227_base_coin1");
            }

            lbl_coin.active = true;
            lbl_coin.getComponent(cc.Label).font = font;
            lbl_coin.getComponent(cc.Label).string = Global.formatNumShort(num,0);

            if(bPlay){
                lbl_coin.setScale(0);
                cc.tween(lbl_coin).to(0.5, {scale:1}).start()
            }

            this._coinNum = num;
        } else {
            lbl_coin.active = false;
            lbl_coin.getComponent(cc.Label).string = "";

            this._coinNum = 0;
        }
    },

    async playAddCoinAnim(data, mult){
        this.setCoin();
        this.playBonusWinCoin(data);
        await cc.vv.gameData.awaitTime(0.5);
        if(mult){
            this._curNum = this._curNum + data.coin * mult;
        } else {
            this._curNum = data.coin
        }
        this.setCoin(this._curNum, true)
    },

    // 播放scatter的背景
    playRunBgAnim(bPlay, isEnd){
        let scatter_bg = cc.find("w201", this.node);
        let id = this._id
        if(bPlay && id == 2){
            scatter_bg.active = true;
            scatter_bg.opacity = 255;
            scatter_bg.stopAllActions();
            scatter_bg.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        }else {
            if(isEnd && scatter_bg.active){
                cc.tween(scatter_bg).to(0.2, {opacity:0}).call(()=>{scatter_bg.active = false;}).start()
            } else {
                scatter_bg.active = false;
            }
        }
    },


    //触发动画
    //触发了才播放的。比如已经3个scatter已经触发了免费。这个和中奖的还不一样
    playTriggerAnimation(){
        let isPlay = false
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
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
                    nodeSp.setAnimation(0,cfg.symbol[id].trigger_ani.name,true)
                }
            }
        }
        return isPlay
    },


    // 背景光动画
    playBonusBgGuangAnim(bPlay, type){

        let bg_guang = cc.find("w_guang", this.node);
        if(bg_guang){
            if(bPlay){
                bg_guang.active = true;

                let animName = "";
                if(type == "bonus"){
                    animName = "animation1"
                } else if(type == "special"){
                    animName = "animation6"
                }
                bg_guang.getComponent(sp.Skeleton).setAnimation(0,animName,true);
            }else {
                bg_guang.active = false;
            }
        }
    },


    // 获得特殊图标，等待打开动画
    playBonusAwaitAnim(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].await_ani){
            // this._state = "stop";
            if(this._showNode){
                this._showNode.active = false
            }
            this._showNode = cc.find(cfg.symbol[id].win_node,this.node)
            this._showNode.active = true

            if(cfg.symbol[id].await_ani.name != ""){
                this.node.zIndex = cfg.symbol[id].await_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                let nodeSp = this._showNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].await_ani.name,true)
                }
            }
        }
    },

    // 赢金币动画
    async playBonusWinCoin(data){

        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].prep_node && cfg.symbol[id].prep_ani){
            if(cfg.symbol[id].prep_ani.name != ""){
                if(this._showNode){
                    this._showNode.active = false;
                }

                let prep_node = cc.find(cfg.symbol[id].prep_node, this.node);   // 准备转的动画
                prep_node.active = true;
                prep_node.getComponent(sp.Skeleton).setAnimation(0,cfg.symbol[id].prep_ani.name,false);
                prep_node.getComponent(sp.Skeleton).setCompleteListener(()=>{
                    prep_node.active = false;
                });

                this._showNode = cc.find("w_jinbi", this.node);    // 转圈圈的动画
                this._showNode.active = true;
                this._showNode.getComponent(sp.Skeleton).setAnimation(0, "animation", false);

                let quan_zhuan = cc.find("quan_zhuan", this.node);  // 光圈覆盖的动画
                quan_zhuan.active = true;
                quan_zhuan.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
                quan_zhuan.getComponent(sp.Skeleton).setCompleteListener(()=>{
                    quan_zhuan.active = false;
                });
            }
        }
    },

    // bonus图标赢非金币的特殊图标
    playBonusWin(type, freeCnt, isResume){

        this._bonusType = type;
        this._bonusFree = freeCnt;

        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg();

        let data;
        if(type == "free" && cfg.bonus_symbol.free){
            data = cfg.bonus_symbol.free
        } else if(type == "jackpot" && cfg.bonus_symbol.jackpot){
            data = cfg.bonus_symbol.jackpot
        } else if(type == "coin" && cfg.bonus_symbol.coin){
            data = cfg.bonus_symbol.coin
        } else if(type == "megaCoin" && cfg.bonus_symbol.megaCoin){
            data = cfg.bonus_symbol.megaCoin
        } else if(type == "superCoin" && cfg.bonus_symbol.superCoin){
            data = cfg.bonus_symbol.superCoin
        } else if(type == "powerUp" && cfg.bonus_symbol.powerUp){
            data = cfg.bonus_symbol.powerUp
        }

        if(this._showNode){
            this._showNode.active = false
        }
        this._showNode = cc.find(data.node,this.node)
        this._showNode.active = true

        if(isResume){

            if(data && data.node && data.resume_ani && data.resume_ani.name != ""){
                this.node.zIndex = data.open_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                let nodeSp = this._showNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cc.js.formatStr(data.resume_ani.name, freeCnt),false);
                }
            }
        } else {
            if(data && data.node && data.open_ani){
                // this._state = "stop";

                if(data.open_ani.name != ""){
                    let prep_node = cc.find(cfg.symbol[id].prep_node, this.node);   // 准备转的动画
                    prep_node.active = true;
                    prep_node.getComponent(sp.Skeleton).setAnimation(0,cfg.symbol[id].prep_ani.name,false);
                    prep_node.getComponent(sp.Skeleton).setCompleteListener(()=>{
                        prep_node.active = false;
                    });

                    this.node.zIndex = data.open_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                    let nodeSp = this._showNode.getComponent(sp.Skeleton)
                    if(nodeSp){
                        let open_name = data.open_ani.name;
                        if(type == "free"){
                            open_name = cc.js.formatStr(open_name, freeCnt);
                        }
                        nodeSp.setAnimation(0,open_name,false);

                        if(data.show_ani && data.show_ani.name != ""){
                            let show_name = data.show_ani.name;
                            if(type == "free"){
                                show_name = cc.js.formatStr(show_name, freeCnt);
                            }
                            nodeSp.addAnimation(0,show_name,false)
                        }

                    }
                }
            }
        }
    },

    // bonus触发免费、小游戏动画
    playBonusTriAnim(type, freeCnt){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg();

        let data;
        if(type == "free" && cfg.bonus_symbol.free){
            data = cfg.bonus_symbol.free
        } else if(type == "jackpot" && cfg.bonus_symbol.jackpot){
            data = cfg.bonus_symbol.jackpot
        } else if(type == "powerUp" && cfg.bonus_symbol.powerUp){
            data = cfg.bonus_symbol.powerUp
        }

        if(data && data.node && data.trigger_ani){
            // this._state = "stop";
            if(this._showNode){
                this._showNode.active = false
            }
            this._showNode = cc.find(data.node,this.node)
            this._showNode.active = true

            if(data.trigger_ani.name != ""){
                this.node.zIndex = data.trigger_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                let nodeSp = this._showNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    let tri_name = data.trigger_ani.name;
                    if(type == "free"){
                        tri_name = cc.js.formatStr(tri_name, freeCnt);
                    }
                    nodeSp.setAnimation(0,tri_name,true);
                }
            }
        }
    },

    getShowNode(){
        return this._showNode;
    },

    //备份当前状态
    Backup() {
        let backup = {};
        backup.symbolIdx = this._symbolIdx;
        backup.id = this._id;
        if (this._data) {
            backup.data = Global.copy(this._data);
        }
        backup.isKuang = this._isKuang;
        backup.state = this._state;
        backup.coinNum = this._coinNum;
        backup.bonusType = this._bonusType;
        backup.bonusFree = this._bonusFree;
        return backup
    },

    //恢复到保存的状态
    Resume(backup) {
        this._super(backup);

        if (!backup) return;
        let coinNum = backup.coinNum;
        let bonusType = backup.bonusType;
        let bonusFree = backup.bonusFree;
        this.playBonusBgGuangAnim(false);

        if(coinNum > 0){ // 赢钱
            this.setCoin(coinNum, false);
        } else {
            this.setCoin();
        }

        if(bonusType){
            this.playBonusWin(bonusType, bonusFree, true)
        }

    },

    // update (dt) {},
});
