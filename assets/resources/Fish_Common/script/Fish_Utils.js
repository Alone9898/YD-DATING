var FishUtils = {

    createSpriteNode: function(atlas, name) {
        let node = new cc.Node(name);
        let spr = node.addComponent(cc.Sprite);
        spr.trim = false;
        spr.sizeMode = cc.Sprite.SizeMode.RAW;
        spr.spriteFrame = atlas.getSpriteFrame(name);

        return node;
    },

    createAnimationNode: function(atlas, name, fcnt, sample, loop) {
        if (loop===undefined) loop = true;
        let node = new cc.Node();
        let spr = node.addComponent(cc.Sprite);
        spr.trim = false;
        spr.sizeMode = cc.Sprite.SizeMode.RAW;
        let ani = node.addComponent(cc.Animation);

        var frames = [];
        for (var i = 1; i <= fcnt; i++) {
            let framename = name + (i<10 ? ("0"+i) : (""+i));
            var frame = atlas.getSpriteFrame(framename);
            if (frame) {
                frames.push(frame);
            }
        }
        var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = name;
        if (loop) clip.wrapMode = cc.WrapMode.Loop;
        ani.addClip(clip);
        ani.play(name);

        return node;
    },

    createAnimationNodeEx: function(atlas, framenames, sample, loop) {
        if (loop===undefined) loop = true;
        let node = new cc.Node();
        let spr = node.addComponent(cc.Sprite);
        spr.trim = false;
        spr.sizeMode = cc.Sprite.SizeMode.RAW;
        let ani = node.addComponent(cc.Animation);

        var frames = [];
        for (var i = 0; i < framenames.length; i++) {
            let framename = framenames[i];
            var frame = atlas.getSpriteFrame(framename);
            if (frame) {
                frames.push(frame);
            }
        }
        var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = framenames[0];
        if (loop) clip.wrapMode = cc.WrapMode.Loop;
        ani.addClip(clip);
        ani.play(framenames[0]);

        return node;
    },

    createAnimationNodeEx2: function(file, name, fcnt, sample, loop) {
        if (loop===undefined) loop = true;
        let node = new cc.Node();
        let spr = node.addComponent(cc.Sprite);
        spr.trim = false;
        spr.sizeMode = cc.Sprite.SizeMode.RAW;
        let ani = node.addComponent(cc.Animation);

        cc.loader.loadRes(file, cc.SpriteAtlas, (err, atlas) => {
            if (err) {
                cc.error('error:' + err);
                return;
            }
            var frames = [];
            for (var i = 1; i <= fcnt; i++) {
                let framename = name + (i<10 ? ("0"+i) : (""+i));
                var frame = atlas.getSpriteFrame(framename);
                if (frame) {
                    frames.push(frame);
                }
            }
            var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
            clip.name = name;
            if (loop) clip.wrapMode = cc.WrapMode.Loop;
            ani.addClip(clip);
            ani.play(name);
        });

        return node;
    },

    addAnimation: function(node, atlas, name, fcnt, sample, loop) {
        let ani = node.getComponent(cc.Animation);
        if (!ani) ani = node.addComponent(cc.Animation);

        var frames = [];
        for (var i = 1; i <= fcnt; i++) {
            let framename = name + (i<10 ? ("0"+i) : (""+i));
            var frame = atlas.getSpriteFrame(framename);
            if (frame) {
                frames.push(frame);
            } else {
                 frame = atlas.getSpriteFrame(name + i);
                 if (frame) frames.push(frame);
            }
        }
        var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = name;
        if (loop) clip.wrapMode = cc.WrapMode.Loop;
        ani.addClip(clip);
    },

    addAnimationEx: function(node, atlas, framenames, sample, loop) {
        let ani = node.getComponent(cc.Animation);
        if (!ani) ani = node.addComponent(cc.Animation);

        var frames = [];
        for (var i = 0; i < framenames.length; i++) {
            let framename = framenames[i];
            var frame = atlas.getSpriteFrame(framename);
            if (frame) {
                frames.push(frame);
            }
        }
        var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = framenames[0];
        if (loop) clip.wrapMode = cc.WrapMode.Loop;
        ani.addClip(clip);
    },
    
    //计算P点到线段AB的距离
    getDistanceToSegment: function(P, A, B) {
        if (A.equals(B)) {
             return P.sub(A).mag();
        }
        let v1=B.sub(A);
        let v2=P.sub(A);
        let v3=P.sub(B);
        if (v1.dot(v2) < 0) {
            return v2.mag();
        } else if (v1.dot(v3) > 0) {
            return v3.mag(); 
        } else {
            return Math.abs(v1.cross(v2))/v1.mag();
        }                  
    },

    //获取鱼身上最近锁定点
    //找到离炮台最近且处于屏幕内的锁定点，如果所有锁定点都不在屏幕内，则返回最近锁定点
    //from_wp: 起点
    //fishnode: 鱼节点
    //lockposes: 鱼的锁定点列表
    getLockPos(from_wp, fishnode, lockposes) {
        let w = cc.winSize.width;
        let h = cc.winSize.height;
        let wp0 = fishnode.convertToWorldSpaceAR(lockposes[0]);
        let minlen = wp0.sub(from_wp).mag();    //最小距离
        let minpos = wp0;                       //最小距离点
        let minlen_in = 10000;                  //屏幕内最小距离
        let minpos_in = null;                   //屏幕内最小距离点
        if (wp0.x>=0 && wp0.x<=w && wp0.y>=0 && wp0.y<=h) {
            minlen_in = minlen;
            minpos_in = minpos;
        }

        for (let i=1,l=lockposes.length; i<l; i++) {
            let wp = fishnode.convertToWorldSpaceAR(lockposes[i]);
            let len = wp.sub(from_wp).mag();
            if (len < minlen) {
                minlen = len;
                minpos = wp;
            }
            if (wp.x>=0 && wp.x<=w && wp.y>=0 && wp.y<=h) {
                if (minpos_in == null || len < minlen_in) {
                    minlen_in = len;
                    minpos_in = wp;
                }
            }
        }

        if (minpos_in) return minpos_in;
        else return minpos;
    },


};
module.exports = FishUtils;