
cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    ShowRandomSymbol(){
        this._super();

        let cfg = cc.vv.gameData.getGameCfg();
        let id = this._id;
        if(id == 3){
            let data = {}
            if(Math.random() > 0.3){
                let randIdx = Global.random(1,cfg.bonusCoinMultList.length);
                data.coin = cfg.bonusCoinMultList[randIdx - 1] * cc.vv.gameData.GetTotalBet()
            } else {
                let randIdx = Math.random();
                let randList = [0.1,0.3,0.5];
                let jpId = 1;
                if(randIdx < randList[0]){
                    jpId = 4
                } else if(randIdx < randList[1]){
                    jpId = 3
                } else if(randIdx < randList[2]){
                    jpId = 2
                }
                data.jackpot = {id:jpId}
            }

            this.ShowById(id, data);
        }
    },


    //显示symbole
    ShowById:function(id,data) {
        this._super(id, data);

        this.setNum();
        this.setJp();

        if(data && id == 3){
            if(data.coin){
                this.setNum(data.coin);
            } else if(data.jackpot){
                this.setJp(data.jackpot.id)
            }
        }
    },

    setNum(val){
        let cfg = cc.vv.gameData.getGameCfg()
        let lbl = cc.find("lbl", cc.find(cfg.symbol[3].node, this.node));
        if(lbl){
            if(val){
                lbl.active = true;
                lbl.getComponent(cc.Label).string =  Global.formatNumShort(val,0);
            } else {
                lbl.active = false;
            }
        }
        this._bonusNum = val;
    },
    getNum(){
        return this._bonusNum
    },

    setJp(val){
        let cfg = cc.vv.gameData.getGameCfg()
        let jp = cc.find("jp", cc.find(cfg.symbol[3].node, this.node));
        if(jp){
            if(val){
                jp.active = true;
                jp.getComponent("ImgSwitchCmp").setIndex(val-1);
            } else {
                jp.active = false;
            }
        }
    },

    //显示正常的结果图标
    ShowNormal() {
        this._super()
        this.stopWinTweenAction();
    },

    //停止最低点之后
    StopMoveDeep(){
        let id = this._id;
        if(id == 3 || id == 301 || id == 302){    // bonus
            this.playBonusStopAnim();
        }

    },

    // bonus图标停止动画
    playBonusStopAnim(){
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id]){

            this._showNode.stopAllActions();
            let nScale = this._showNode.scale
            this._showNodeOrgScale = nScale
            cc.tween(this._showNode).to(0.3,{scale:nScale+0.2}).to(0.2,{scale:nScale}).start()
        }
    },

    playBonusTriAnim(bDouble){
        let isPlay = false;
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg();
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
                let nodeAni = topShowNode.getComponent(cc.Animation)
                if(nodeAni){
                    let animState = nodeAni.play(cfg.symbol[id].trigger_ani.name)
                    if(bDouble){
                        animState.repeatCount = 2;
                    }
                }
                if(id == 3){
                    aniNode.stopAllActions();
                    aniNode.runAction(cc.shake(0.5,5,5))
                }
            }
        }
        return isPlay
    },

    // 上升图标、扩散图标变回bonus图标
    playBonusChangeAnim(data){
        let aniNode = this.setAnimationToTop(true);
        this.ShowById(3, data);

        cc.tween(aniNode)
            .to(0.5, {scale:0}, {easing:"backIn"})
            .call(()=>{
                this.setAnimationToTop(false);
            })
            .start()

        this.playBonusBoom();
    },

    playBonusBoom(){
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg();
        if(cfg.symbol[id] && cfg.symbol[id].win_node){

            let nodeAni = this._showNode.getComponent(cc.Animation)
            if(nodeAni){
                nodeAni.play("b_boom_1")
            }
        }
    },

    playBonusExtraBoom(){
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg();
        if(cfg.symbol[id] && cfg.symbol[id].win_node){

            let nodeAni = this._showNode.getComponent(cc.Animation)
            if(nodeAni){
                nodeAni.play("b_extra_boom")
            }
        }
    },
    playBonusJiesuan(){
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg();
        if(cfg.symbol[id] ){

            let nodeAni = this._showNode.getComponent(cc.Animation)
            if(nodeAni){
                nodeAni.play("b_jiesuan")
            }
        }
    },

    playBonusKuangAnim(bPlay){
        let id = this._id;
        let cfg = cc.vv.gameData.getGameCfg();
        if(cfg.symbol[id] && cfg.symbol[id].kuang_node){
            cc.find(cfg.symbol[id].kuang_node, this._showNode).active = bPlay;
        }
    },

    // update (dt) {},
});
