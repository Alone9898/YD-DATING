//918容器鱼(旋风鱼/连锁闪电)

cc.Class({
    extends: cc.Component,

    // LIFE-CYCLE CALLBACKS:
    properties: {
        _insedeFtid: 0,                //内部鱼类型
        _insideNode: null,             //内部鱼Node
    },

    loadRes(path, file, form, anim, sample, fcnt) {
        let fish_fish = this.node.getComponent("Fish_Fish");
        if (fish_fish) {
            return fish_fish.loadRes(path, file, form, anim, sample, fcnt);
        }
    },

    init(id) {

    },

    getPos() {
        return this.node.convertToWorldSpaceAR(cc.v2(0,0));
    },

    loadInsideFishRes(ftid, path, cfg, pos) {
        if (ftid == this._insedeFtid) {
            return;
        }
        this._insedeFtid = ftid;
        if (!this._insideNode) {
            this._insideNode = new cc.Node();
            this.node.addChild(this._insideNode, 1);
        }
        let insideNode = this._insideNode;
        insideNode.removeAllChildren();
        let file = cfg.file;
        let anim = cfg.anim;
        let sample = cfg.sample;
        let fcnt = cfg.fcnt;

        cc.loader.loadRes(path+"animation/"+file, cc.SpriteAtlas, (err, atlas) => {
            if (!err) {
                let node = new cc.Node();
                node.position = pos;
                node.addComponent(cc.Sprite);
                insideNode.addChild(node);
                let ani = node.addComponent(cc.Animation);

                function int2str(i) {
                    if (i<10) return "_00"+i;
                    else if (i<100) return "_0"+i;
                    else return "_"+i;
                }
                var frameCnt = fcnt || 32;
                var frames = [];
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
            }
        });
    },

});
