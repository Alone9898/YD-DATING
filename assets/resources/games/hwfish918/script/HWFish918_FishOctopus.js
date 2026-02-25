//918章鱼Boss

cc.Class({
    extends: cc.Component,

    properties: {
        _objNode: null,             //显示节点
        _parts: [],
        _life: 80,
        _pos: cc.v2(0, 0),
        _partidx: 0,
    },

    // LIFE-CYCLE CALLBACKS:
    loadRes(path, file, form, anim, sample, fcnt) {
        if (!this._objNode) {
            this._objNode = new cc.Node("objNode");
            this.node.addChild(this._objNode);
        }
        this._objNode.removeAllChildren();

        //3个触角
        let pos = [cc.v2(-53, -188), cc.v2(-100, 30), cc.v2(90, 127)];
        let rot = [45, 90, -110];
        for (let i=0; i<3; i++) {
            let part = new cc.Node();
            part.position = pos[i];
            part.angle = -rot[i];
            this._parts[i] = part;
            this._objNode.addChild(part);

            let boxCollider = part.addComponent(cc.BoxCollider);
            boxCollider.size = cc.size(160, 280);
            
            let spr = part.addComponent(cc.Sprite);
            spr.trim = false;
            spr.sizeMode = cc.Sprite.SizeMode.RAW;
            let ani = part.addComponent(cc.Animation);

            function int2str(i) {
                if (i<10) return "_00"+i;
                else if (i<100) return "_0"+i;
                else return "_"+i;
            }

            cc.loader.loadRes(path+"animation/"+file, cc.SpriteAtlas, (err, atlas) => {
                if (err) {
                    cc.error('error:' + err);
                    return;
                }
                var frames = [];
                var frameCnt = fcnt || 32;
                for (var i = 1; i < frameCnt; i++) {
                    var frame = atlas.getSpriteFrame(anim+int2str(i));
                    if (frame) {
                        frames.push(frame);
                    }
                    else
                        break;
                }
                var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
                clip.name = anim;
                clip.wrapMode = cc.WrapMode.Loop;
                ani.addClip(clip);
                ani.play(anim);
            });
        }
    },

    init(id) {
        for (let i=0, l=this._parts.length; i<l; i++) {
            this._parts[i]._id = id;        //用于碰撞后获取鱼ID
        }
        this._life = 72;
        let fish_fish = this.node.getComponent("Fish_Fish");
        fish_fish._lifeTime = this._life * 1000;
    },

    getPos() {
        return this._parts[this._partidx].convertToWorldSpaceAR(cc.v2(0,-100));
    },

    onTouchPart(partidx) {
        this._partidx = partidx
    },

    update(dt) {
        if (this._life > 0) {
            this._life -= dt;
            if (this._life <= 0) {
                let fish_fish = this.node.getComponent("Fish_Fish");
                fish_fish.onComplete();
            }
        }
    },

});
