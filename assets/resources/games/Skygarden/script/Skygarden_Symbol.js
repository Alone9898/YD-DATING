/**
 * @author Cui Guoyang
 * @date 2021/8/30
 * @description
 */

cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        _hasChange: false,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    StartMove: function () {
        this._hasChange = false;
        this._super();
    },

    ShowById(id, data) {
        this._super(id, data);
        let icon = cc.find("icon", this._showNode);
        if (icon) {
            icon.active = false;
        }
    },

    //设置_symbolIdx 行序号
    SetSymbolIdx: function (idx) {
        this._super(idx);
    },

    GetSymbolIdx() {
        return this._symbolIdx;
    },

    playBallAnimation() {
        this._hasChange = true;
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
            if (cfg.symbol[id].ball_ani && cfg.symbol[id].ball_ani.name !== "") {
                aniNode.zIndex = cfg.symbol[id].win_ani.zIndex - this._symbolIdx + this._reelIdx * 10;
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if (nodeSp) {
                    Global.SlotsSoundMgr.playEffect("JPtrans");
                    cc.tween(topShowNode)
                        .to(0.1, {scale: 1.1})
                        .to(0.1, {scale: 1})
                        .start();
                    nodeSp.setAnimation(0, cfg.symbol[id].ball_ani.name, true);
                    let effect = cc.find("effect", topShowNode);
                    effect.getComponent(sp.Skeleton).setAnimation(0, cfg.symbol[id].effect_ani.name, false);
                }
            }
        }
    },

    playBallClearAnimation() {
        // this._hasChange = false;
        this.ShowNormal();
        let icon = cc.find("icon", this._showNode);
        if (icon) {
            icon.active = true;
        }
    },

    getHasChangeBall() {
        return this._hasChange;
    },

    playClearAnimation() {
        if (this._showNode) {
            this._showNode.active = false
        }
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if (cfg.symbol[id] && cfg.symbol[id].win_node) {
            if (this._showNode) {
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node, aniNode)
            topShowNode.active = true

            aniNode.zIndex = cfg.symbol[id].win_ani.zIndex - this._symbolIdx + this._reelIdx * 10;
            let nodeSp = topShowNode.getComponent(sp.Skeleton)
            if (nodeSp) {
                nodeSp.setAnimation(0, "clean", false)
            }
        }
    },
});