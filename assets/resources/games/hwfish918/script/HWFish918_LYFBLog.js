
cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Node,
        countdownBg: cc.Node,
        gainscore: cc.Node,
        lblMul: cc.Label,
        lblCountdown: cc.Label,
        lblScore: cc.Label,
        lblExtmul: cc.Label,
        _duration: 0,
    },

    onLoad () {

    },

    init(mul, duration, index) {
        this.lblMul.string = cc.vv.gameData.formatNumber(mul);
        this._duration = duration;
        this._index = index;
    },

    showScore(score, extmul, totalscore) {
        this.gainscore.active = true;
        let len = cc.vv.gameData.formatNumber(score).length;
        this.gainscore.getChildByName("bg1").x = -len*42/2;
        this.gainscore.getChildByName("bg2").x = len*42/2;
        this.lblScore.node.getComponent("HWFish918_RollNumber").show(this, score, true);
        this.lblExtmul.string = 'X'+extmul;
        this.lblExtmul.node.setScale(0);
        this._totalscore = totalscore;
    },

    onRollOver(param) {
        this.bg.runAction(cc.moveBy(1, cc.v2(0, 60)));
        this.lblExtmul.node.runAction(cc.sequence(cc.delayTime(2), cc.scaleTo(0.5, 1)));
        let totalscore = cc.vv.gameData.formatNumber(this._totalscore);
        this.lblScore.node.runAction(cc.sequence(cc.delayTime(2.5), cc.scaleTo(0.2, 0),
            cc.callFunc((sender)=>{
                sender.getComponent(cc.Label).string = totalscore;
            }),
            cc.scaleTo(0.3,1)));

        this.node.runAction(cc.sequence(cc.delayTime(5), cc.callFunc((sender)=>{
            Global.dispatchEvent("lyfb_show_end", this._index);
            sender.destroy();
        })));
    },

    update (dt) {
        if (this._duration > 0) {
            this._duration -= dt;
            if (this._duration <= 0) {      //倒计时结束
                this.countdownBg.active = false;
            }
            this.lblCountdown.string = ""+Math.floor(this._duration);
        }
    },
});
