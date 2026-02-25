// 针对鸟王捕鱼/雷电捕鱼/海绵宝宝等锚点不固定的序列帧动画

cc.Class({
    extends: cc.Component,

    properties: {
        frames: [cc.SpriteFrame],
        poses: [cc.Vec2],
        sample: 10,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._time = 0;
        this._frameIdx = 0;
        this._interval = 1/this.sample;
        this._frameCount = this.frames.length;
        this._sprite = this.node.getComponent(cc.Sprite);
    },

    update (dt) {
        this._time += dt;
        if (this._time >= this._interval) {
            this._time -= this._interval;
            this._frameIdx += 1;
            if (this._frameIdx >= this._frameCount) {
                this._frameIdx = 0;
            }
            this._sprite.spriteFrame = this.frames[this._frameIdx];
            this.node.position = this.poses[this._frameIdx];
        }
    },
});
