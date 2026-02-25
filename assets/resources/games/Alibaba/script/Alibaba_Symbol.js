/**
 * @author Cui Guoyang
 * @date 2021/9/24
 * @description
 */

cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        _hasCheck: false,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    Init: function (idx, node) {
        this._super(idx, node);
    },

    initSymbolType(type) {
        this._bonusType = type;
    },


    StartMove: function () {
        this._super();
        this._hasCheck = false;
    },

    //显示随机符号
    ShowRandomSymbol: function () {
        this._super();

        this.showCoin();
    },

    ShowById(id, data) {
        this._super(id, data);
        this.showCoin();
    },

    showCoin() {
        let coin = cc.find("coin", this.node);
        let jackpot = cc.find("jackpot", this.node);
        if (coin && jackpot && this._id === cc.vv.gameData.getGameCfg().bonusId) {
            if (this._data) {
                if (this._data.isGold) {
                    this._showNode.active = false;
                    this._showNode = cc.find("diamond", this.node);
                    this._showNode.active = true;
                    coin.active = false;
                    coin.getComponent(cc.Label).string = Global.formatNumShort(this._data.coin, 0);
                } else if (this._data.coin > 0) {
                    coin.active = true;
                    coin.getComponent(cc.Label).string = Global.formatNumShort(this._data.coin, 0);
                } else if (this._data.jackpot) {
                    jackpot.active = true;
                    jackpot.getComponent("ImgSwitchCmp").setIndex(this._data.jackpot.id - 1);
                }
            } else {
                coin.active = true;
                let randomRate = [0.25, 0.5, 0.75, 1, 2, 5, 10];
                let randomCoin = cc.vv.gameData.GetTotalBet() * randomRate[Math.floor(Math.random() * randomRate.length)];
                coin.getComponent(cc.Label).string = Global.formatNumShort(randomCoin, 0);
            }
        } else {
            coin.active = false;
            jackpot.active = false;
        }
    },

    playDiamondAnimation() {
        if (this._showNode) {
            this._showNode.active = false
        }
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()

        if (this._showNode) {
            this._showNode.active = false
        }
        let aniNode = this.setAnimationToTop(true)
        aniNode.active = true
        let topShowNode = cc.find("diamond_animation", aniNode)
        topShowNode.active = true

        aniNode.zIndex = 300 - this._symbolIdx + this._reelIdx * 10;
        let nodeSp = topShowNode.getComponent(sp.Skeleton)
        if (nodeSp) {
            nodeSp.setAnimation(0, "zuanshi_02", true)
        }

    },

    playWildMulAnimation(mult) {
        if (this._showNode) {
            this._showNode.active = false
        }
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if (cfg.symbol[id] && cfg.symbol[id].win_node) {
            this._state = "win";
            if (this._showNode) {
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node, aniNode)
            topShowNode.active = true

            aniNode.zIndex = 300 - this._symbolIdx + this._reelIdx * 10;
            let nodeSp = topShowNode.getComponent(sp.Skeleton)
            if (nodeSp) {
                if (mult === 1) {
                    nodeSp.setAnimation(0, "Wild_01_intro", false);
                    nodeSp.addAnimation(0, "Wild_01_idle", true);
                } else {
                    nodeSp.setAnimation(0, "Wild_02_intro", false);
                    nodeSp.addAnimation(0, "Wild_02_idle", true);
                    let multNode = cc.find("mult", aniNode);
                    multNode.active = true;
                    multNode.getComponent(cc.Label).string = "X" + mult;
                    multNode.scale = 0;
                    cc.tween(multNode)
                        .to(0.5, {scale: 1}, {easing: "backOut"})
                        .start();
                }

            }

        }
    },

    showDiamondCoin(baseCoin) {
        if (this._id === cc.vv.gameData.getGameCfg().bonusId && this._showNode) {
            this.setAnimationToTop(false);
            let coin = cc.find("coin", this.node);
            coin.active = true;
            coin.getComponent(cc.Label).string = Global.formatNumShort(baseCoin, 0);
        }
    },

    check() {
        this._hasCheck = true;
    },

    isCheck() {
        return this._hasCheck;
    },
});