
cc.Class({
    extends: cc.Component,

    properties: {
        stickTemplate: cc.Node, //模板
    },

    onLoad () {
        this._sticks_free = [];
        this._sticks_using = [];

        for (let i=0; i<5; i++) {
            let stick = cc.instantiate(this.stickTemplate);
            this.node.addChild(stick);
            this._sticks_free.push(stick);
        }
    },

    addCoinStick(num, score) {
        let sticks_free = this._sticks_free;
        let sticks_using = this._sticks_using;
        let stick = sticks_free.pop();
        if (!stick) return;

        sticks_using.push(stick);
        stick.active = true;
        stick.opacity = 255;
        let score_bg = stick.getChildByName("score_bg");
        score_bg.getChildByName("score").getComponent(cc.Label).string = cc.vv.gameData.formatNumber(score);
        score_bg.active = false;

        num = Math.max(num, 3);
        num = Math.min(num, 45);

        let STICK_WIDTH = 28;
        let t = Math.max(num * 0.02, 0.2);
        let size = sticks_using.length;
        stick.position = cc.v2((3-size)*STICK_WIDTH, 0);
        let dy = num * 6;
        stick.getComponent(cc.Animation).play("fish_coin_stick");

        let onAnimStep = function(sender) {
            sender.getChildByName("score_bg").active = true;
            sender.getComponent(cc.Animation).stop();
        };

        let onAnimEnd = function(sender) {
            let stick = sticks_using.shift();
            stick.active = false;
            sticks_free.push(stick);
            //重排位置
            for (let i=0;i<sticks_using.length;i++) {
                sticks_using[i].x = (2-i)*STICK_WIDTH;
            }
        };

        stick.runAction(cc.sequence(cc.moveBy(t, cc.v2(0, dy)), 
            cc.callFunc(onAnimStep),
            cc.delayTime(1-t),
            cc.fadeOut(0.2),
            cc.callFunc(onAnimEnd)
        ));
    },

    update (dt) {

    },
});
