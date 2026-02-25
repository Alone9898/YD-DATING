//电磁炮爆炸效果
cc.Class({
    extends: cc.Component,

    properties: {
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init(data)
    {
        this.node.position = this.node.parent.convertToNodeSpaceAR(data.pos);
        this.node.angle = -data.angle * cc.macro.DEG;
    },

    start() {
        Global.playFishEffect("DCPaosnd3");
        this.node.scaleX = (0.5);
        this.node.runAction(cc.sequence(cc.delayTime(0.6),cc.scaleTo(0.2,2.5,1),cc.delayTime(0.8),cc.fadeOut(0.4), cc.callFunc((sender)=>{
            sender.destroy();
        })));
    },
});
