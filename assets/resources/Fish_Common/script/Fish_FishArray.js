//阵法鱼

cc.Class({
    extends: cc.Component,

    // LIFE-CYCLE CALLBACKS:

    loadRes(path, file, form, anim, sample, fcnt, bg) {
        cc.loader.loadRes(path+"animation/"+bg, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.error('error:' + err);
                return;
            }
            let node = cc.instantiate(prefab);
            this.node.addChild(node);
            for (let i=1; i<=4; i++) {
                let fishNode = node.getChildByName("fish"+i);
                if (fishNode) {
                    this.loadFishRes(path, file, anim, sample, fcnt, fishNode);
                } else {
                    break;
                }
            }

         });
    },

    loadFishRes(path, file, anim, sample, fcnt, fishNode) {
        cc.loader.loadRes(path+"animation/"+file, cc.SpriteAtlas, (err, atlas) => {
            if (!err) {
                let node = new cc.Node();
                let spr = node.addComponent(cc.Sprite);
                spr.trim = false;
                spr.sizeMode = cc.Sprite.SizeMode.RAW;
                fishNode.addChild(node);
                let ani = node.addComponent(cc.Animation);

                function int2str(i) {
                    if (i<10) return "_00"+i;
                    else if (i<100) return "_0"+i;
                    else return "_"+i;
                }

                var frames = [];
                var frameCount = fcnt || 32;
                for (var i = 1; i < frameCount; i++) {
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
            }
        });
    },

    init(id) {

    },

    getPos() {
        return this.node.convertToWorldSpaceAR(cc.v2(0,0));
    },

});
