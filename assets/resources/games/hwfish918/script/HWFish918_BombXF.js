//旋风鱼爆炸效果
cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Node,
        icon: cc.Node,
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init(data) {
        this.node.position = data.pos;
        let poses = [cc.v2(-258,-64), cc.v2(256,-64), cc.v2(256,64), cc.v2(-258,64)];
        this._targetPos = poses[data.seat-1];
        let icon = this.icon;
        cc.loader.loadRes(data.path+"animation/"+data.file, cc.SpriteAtlas, (err, atlas) => {
            if (!err) {
                icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(data.anim+"_001");
            }
        });
    },

    start() {
        this.bg.runAction(cc.repeat(cc.rotateBy(1.8, 360), 2));
        this.icon.runAction(cc.repeat(cc.rotateBy(1.8, -360), 2));
        this.node.runAction(cc.sequence(cc.moveTo(0.6, this._targetPos), cc.delayTime(3), cc.callFunc((sender)=>{
            sender.destroy();
        })));
    },
});
