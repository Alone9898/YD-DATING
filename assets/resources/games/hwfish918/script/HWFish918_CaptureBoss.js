//捕获boss动画

let fishUtils = require("Fish_Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        par: cc.Node,
        lblScore: cc.Node,
        bg: cc.Sprite,
        icon: cc.Node,
        sprAtlas: cc.SpriteAtlas,
        parAtlas: cc.SpriteAtlas,
        _score: 0,
        _phase: 0,
        _phaseScore: 0,
        _curScore: 0,
        _delayTime: 0,
        _rollStart: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    show(seat, bossid, score, startpos, endpos) {
        this.node.position = startpos;

        this.bg.spriteFrame = this.sprAtlas.getSpriteFrame("GetScoreBox"+bossid);
        
        let animPar = "BOSSPar_";
        fishUtils.addAnimation(this.par, this.parAtlas, animPar, 30, 30, true);
        this.par.getComponent(cc.Animation).play(animPar);  

        let animIcon = "GetScoreMinBox"+bossid+"_";
        fishUtils.addAnimation(this.icon, this.sprAtlas, animIcon, 16, 15, true);
        
        this.bg.node.active = false;
        let self = this;
        this.node.runAction(cc.sequence(cc.delayTime(1),
            cc.callFunc(()=>{
                self.par.active = false;
                self.bg.node.active = true;
                self.icon.getComponent(cc.Animation).play(animIcon);
                self.lblScore.getComponent("HWFish918_RollNumber").show(self, score, true, {seat:seat, score:score});
            }),
            cc.moveTo(2, endpos)
        ));
    },

    onRollOver(param) {
        Global.dispatchEvent("add_score", param);
        this.node.destroy();
    },

});
