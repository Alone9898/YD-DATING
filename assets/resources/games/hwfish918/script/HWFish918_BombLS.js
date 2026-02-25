//连锁闪电爆炸效果
cc.Class({
    extends: cc.Component,

    properties: {
        lightningAtlas: cc.SpriteAtlas,
        _poses: [],
        _lastPos: null,
        _interval: 0,
    },


    onLoad () {

    },

    createAnimation(name, fcnt, sample) {
        let node = new cc.Node();
        let spr = node.addComponent(cc.Sprite);
        spr.trim = false;
        spr.sizeMode = cc.Sprite.SizeMode.RAW;
        let ani = node.addComponent(cc.Animation);

        var frames = [];
        for (var i = 1; i < fcnt; i++) {
            let framename = name + (i<10 ? ("0"+i) : (""+i));
            var frame = this.lightningAtlas.getSpriteFrame(framename);
            if (frame) {
                frames.push(frame);
            }
        }
        var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = name;
        clip.wrapMode = cc.WrapMode.Loop;
        ani.addClip(clip);
        ani.play(name);

        return node;
    },

    createCircle(pos) {
        let circle = this.createAnimation("Fish28B", 4, 10);
        this.node.addChild(circle);
        circle.position = pos;
        circle.runAction(cc.sequence(cc.scaleTo(0.3, 3), cc.scaleTo(0.1, 1)));

        Global.playFishEffect("FlashMove2");
    },

    createLine(pos1, pos2) {
        let line = this.createAnimation("BOSSSDLSLine_", 11, 20);
        this.node.addChild(line);
        line.position = cc.v2((pos1.x+pos2.x)/2, (pos1.y+pos2.y)/2);
        
        let delta = pos1.sub(pos2);
        line.scaleX = (delta.mag()/600);

        let angle = cc.v2(0, 0).signAngle(delta);
        line.angle = -angle * cc.macro.DEG;
    },

    init(poses) {
        this._poses = poses;
    },

    update(dt) {
        this._interval -= dt;
        if (this._interval < 0) {
            this._interval = 0.6;
            if (this._poses.length <= 0) {
                this.node.destroy();
                return;
            }
            let pos = this._poses.shift();
            this.createCircle(pos);
            if (this._lastPos) {
                this.createLine(this._lastPos, pos);
            }
            this._lastPos = pos;
        }
    },

});
