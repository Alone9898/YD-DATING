
cc.Class({
    extends: cc.Component,

    properties: {
        lblScore: cc.Node,
        icon: cc.Sprite,
        sprAtlas: cc.SpriteAtlas,
        _score: 0,
        _curScore: 0,
        _deltaScore: 0,
        _time: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    show(seat, fishTid, score, startPos, endPos) {     
        this.icon.spriteFrame = this.sprAtlas.getSpriteFrame("BigFish0"+fishTid);
        this.icon.node.runAction(cc.rotateBy(12, 1440));
        this.node.position = startPos;
        this.node.runAction(cc.moveTo(2.5, endPos));

        this.lblScore.getComponent("HWFish918_RollNumber").show(this, score, false, {seat:seat, score:score});
    },

    onRollOver(param) {
        Global.dispatchEvent("add_score", param);
        this.node.destroy();
    }
});
