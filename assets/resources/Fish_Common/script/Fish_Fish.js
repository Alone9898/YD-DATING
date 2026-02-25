cc.Class({
    extends: cc.Component,

    properties: {
        _com: "",                   //组建名
        _objNode: null,             //显示节点
        _fishId: 0,                 //唯一ID
        _fishTid: 0,                //类型ID
        _traceType: 1,              //路线类型
        _trace: [],                 //路线数据
        _speed: 0,
        _bornTime: 0,               //出生时间
        _lifeTime: 0,               //存活时间

        _lastPosition: cc.v2(0,0),
        _angle:0,                   // 直线移动的角度
        _offset: cc.v2(0,0),        // 重心偏移
        _size: cc.v2(0,0),          // 大小
        _hit_snd: "",               // 击中音效
        _hit_snd_time: 0,           // 击中音效时间
        _hit_anim: false,           // 击中动画
        _hit_anim_time: 0,          // 击中动画时间
        _alive: true,
        _dieParam: null,            // 死亡参数
        _visible: false,            // 是否可见
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._lastPosition = this.node.position;
    },

    create(tid, cfg, res_path) {
        this._fishTid = tid;
        this.node.group = "Fish";

        this._com = cfg.com;
        this._offset = cc.v2(-cfg.box.offsetx, -cfg.box.offsety);
        this._size = cc.size(cfg.box.width, cfg.box.height);
        this._speed = cfg.speed;
        this._hit_snd = cfg.hit_snd;
        this._hit_anim = cfg.hit_anim;
        if (cfg.scale) {
            this.node.setScale(cfg.scale);
        }
        let boxCollider = this.node.addComponent(cc.BoxCollider);
        boxCollider.size = this._size;

        if (this._com != "") {
            let com = this.node.addComponent(this._com);
            return com.loadRes(res_path, cfg.file, cfg.form, cfg.anim, cfg.sample, cfg.fcnt, cfg.bg);
        }    

        this.loadRes(res_path, cfg.file, cfg.form, cfg.anim, cfg.sample, cfg.fcnt, cfg.bg);
    },
  
    //traceType: 1:直线 2：贝塞尔曲线 3：圆
    init(id, traceType, trace, delay) {
        this.node._id = id;
        this._fishId = id;
        this._traceType = traceType;
        delay = delay || 0;
        this._alive = true;
        this._dieParam = null;
        this._bornTime = (new Date()).getTime();
        this._lifeTime = (this._speed + delay) * 1000;
        this.node.getComponent(cc.BoxCollider).enabled = true;

        if (traceType > 0) {  
            let p1 = cc.v2(trace[0].x, trace[0].y);
            let p2 = cc.v2(trace[1].x, trace[1].y);
            this.node.position = p1;
            let degree = this.calcDegree(p1, p2);
            this.node.angle = -degree;

            let moveAction = null;
            if (traceType == 1) {           // 直线移动
                moveAction =  cc.moveTo(this._speed, p2);
            }else if (traceType == 2) {     //贝塞尔曲线
                var bezier = [p2, cc.v2(trace[2].x, trace[2].y), cc.v2(trace[3].x, trace[3].y)];
                moveAction =  cc.bezierTo(this._speed, bezier);
            }else if (traceType == 3) {     //采点取样
                let pt = [];
                for (let i=0, l=trace.length; i<l; i++) {
                    pt.push(cc.v2(trace[i].x, trace[i].y))
                }
                this.node.position = pt[0];
                moveAction =  cc.repeat(cc.cardinalSplineTo(this._speed, pt, 0), 7);
                this._lifeTime = this._speed * 7 * 1000;
            }else if (traceType == 4) {     //圆形
                //trace[0]圆心 trace[1]起点
                let r = p1.sub(p2).mag();
                let pt = [];
                for (let i=0; i<=16; i++) {
                    let theta = i * Math.PI * 0.125 + 1.5*Math.PI;
                    pt.push(p1.add(cc.v2(r*Math.cos(theta), r*Math.sin(theta))));
                }
                this.node.position = pt[0];
                moveAction = cc.cardinalSplineTo(this._speed, pt, 0);
            }else if (traceType == 5) {     //多段线段
                this.node.position = cc.v2(trace[0].x, trace[0].y);
                let count = trace.length-1;
                let actions = [];
                for (let i=1; i<=count; i++) {
                    actions.push(cc.moveTo(this._speed/count, cc.v2(trace[i].x, trace[i].y)));
                }
                moveAction = cc.sequence(actions);
            }

            if (moveAction) {
                if (delay > 0) {
                    this.node.runAction(cc.sequence(cc.delayTime(delay), moveAction, cc.callFunc(this.onComplete.bind(this))));
                } else {
                    this.node.runAction(cc.sequence(moveAction, cc.callFunc(this.onComplete.bind(this))));
                }
            }
        } else {
            this.node.position = cc.v2(trace[0].x, trace[0].y);
            this.node.angle = -0;
            this._lifeTime = 20*1000;
        }
        
        if (this._objNode) {
            this._objNode.color = cc.Color.WHITE;
            this.setVisible(true);
        }

        if (this._com != "") {
            this.node.getComponent(this._com).init(id);
        }

        this.node.active = true;
    },

    loadRes(path, file, form, anim, sample, fcnt, bg){
        let self = this
        if (bg) {
            let loadPath = path+"animation/"+bg
            cc.loader.loadRes(loadPath, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err) {
                    var node = new cc.Node("bg");
                    node.zIndex = -1;
                    node.addComponent(cc.Sprite).spriteFrame = spriteFrame;
                    this.node.addChild(node);
                    self._addToLoadList(loadPath,spriteFrame,cc.SpriteFrame)
                }
            });
        }

        this._objNode = this.createObjNode(path, file, form, anim, sample, fcnt);
        this.node.addChild(this._objNode);
        this._objNode.position = this._offset;
    },

    createObjNode(path, file, form, anim, sample, fcnt) {
        let self = this

        let objNode = new cc.Node("objNode");

        if (form == "spine") {
            let ske = objNode.addComponent(sp.Skeleton);
            let loadPath = path+"animation/"+file
            cc.loader.loadRes(loadPath, sp.SkeletonData,(err,data)=>{
                if (err) {
                    cc.error('error:' + err);
                    return;
                }
                ske.skeletonData = data;
                ske.setAnimation(0, anim, true);
                ske.premultipliedAlpha = false;

                self._addToLoadList(loadPath,data,sp.SkeletonData)
            });
        } else if (form == "plist") {
            let spr = objNode.addComponent(cc.Sprite);
            spr.trim = false;
            spr.sizeMode = cc.Sprite.SizeMode.RAW;
            let ani = objNode.addComponent(cc.Animation);

            function int2str(i) {
                if (i<10) return "_00"+i;
                else if (i<100) return "_0"+i;
                else return "_"+i;
            }

            let loadPath = path+"animation/"+file
            cc.loader.loadRes(loadPath, cc.SpriteAtlas, (err, atlas) => {
                if (err) {
                    cc.error('error:' + err);
                    return;
                }
                var frames = [];
                var frameCnt = fcnt || 32;
                for (var i = 1; i <= frameCnt; i++) {
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

                self._addToLoadList(loadPath,atlas,cc.SpriteAtlas)
            });
        } else if (form == "prefab") {
            let loadPath = path+"animation/"+file
            cc.loader.loadRes(loadPath, cc.Prefab, (err, prefab) => {
                if (err) {
                    cc.error('error:' + err);
                    return;
                }
                let node = cc.instantiate(prefab);
                objNode.addChild(node);

                self._addToLoadList(loadPath,prefab,cc.Prefab)
             });
        } else if (form == "spriteframe") {
            let spr = objNode.addComponent(cc.Sprite);
            spr.trim = false;
            spr.sizeMode = cc.Sprite.SizeMode.RAW;

            let loadPath = path+"animation/"+file
            cc.loader.loadRes(loadPath, cc.SpriteAtlas, (err, atlas) => {
                if (err) {
                    cc.error('error:' + err);
                    return;
                }
                spr.spriteFrame = atlas.getSpriteFrame(anim);
                self._addToLoadList(loadPath,atlas,cc.SpriteAtlas)
            });            
        } else if (form == "sprite") {
            let spr = objNode.addComponent(cc.Sprite);
            let loadPath = path+"animation/"+file
            cc.loader.loadRes(loadPath, cc.SpriteFrame, (err, sprite) => {
                if (err) {
                    cc.error('error:' + err);
                    return;
                }
                spr.spriteFrame = sprite;
                self._addToLoadList(loadPath,sprite,cc.SpriteFrame)
            });
        }
        else {
            cc.log("not supported fish animation form");
        }        

        return objNode;
    },

    onComplete() {
        this._alive = false;
        Global.dispatchEvent("put_fish_pool", {fid:this._fishId, tid:this._fishTid, node:this.node});
    },

    // 击中
    onHit () {
        if (this._hit_anim) {
           this._objNode.color = cc.Color.RED;
           this._hit_anim_time = 0.2;
        }
        if (this._hit_snd != "") {
            if (this._hit_snd_time < 0) {
                Global.playFishEffect(this._hit_snd);
                this._hit_snd_time = 1;
            }
        }
    },

    // 死亡
    onDead() {
        this._alive = false;
        if (this._dieParam) {
            this.showCoin(this._dieParam);
            this._dieParam = null;
        }
        this.node.stopAllActions();
        Global.dispatchEvent("put_fish_pool", {fid:this._fishId, tid:this._fishTid, node:this.node});
    },

    // 死亡
    dieWithParam(param) {
        if (!param || !param.delay) {
            return;
        }
        this._alive = false;
        this.node.stopAllActions();
        this.node.getComponent(cc.BoxCollider).enabled = true;
        this._dieParam = param;
    },

    showCoin(param) {
        if (param.coin && param.coin > 0) {
            let data = {
                num: param.coin,
                tp: this._fishTid,
                startpos: this.node.position,
                endpos: param.endpos,
            }
            Global.dispatchEvent("show_coin", data);
        }
    },

    leave() {
        this.node.stopAllActions();
        let targets = [cc.v2(640,640), cc.v2(-640,640), cc.v2(-640,-640), cc.v2(640,-640)];
        let rots = [-45, -135, 135, 45];
        let d = 0;
        let pos = this.node.position;
        if (pos.x>=0 && pos.y>=0) {
            d = 0;
        } else if (pos.x<0 && pos.y>=0) {
            d = 1;
        } else if (pos.x<0 && pos.y < 0) {
            d = 2;
        } else {
            d = 3;
        }
        //this.node.rotation = rots[d];
        this.node.runAction(cc.sequence(cc.moveBy(3, targets[d]), cc.callFunc(this.onComplete.bind(this))));
    },

    // 是否在屏幕内
    isInScreen() {
        if (this._alive) {
            let width = cc.winSize.width;
            let height = cc.winSize.height;
            //判断方法：中间或者头尾有一个点在屏幕内即可
            let p0 = this.node.convertToWorldSpaceAR(cc.v2(0,0));
            if(p0.x>=0 && p0.x<=width && p0.y>=0 && p0.y<=height) {
                return true;
            }
            let p1 = this.node.convertToWorldSpaceAR(cc.v2(-this._size.width*0.4,0));
            if(p1.x>=0 && p1.x<=width && p1.y>=0 && p1.y<=height) {
                return true;
            }
            let p2 = this.node.convertToWorldSpaceAR(cc.v2(this._size.width*0.4,0));
            if(p2.x>=0 && p2.x<=width && p2.y>=0 && p2.y<=height) {
                return true;
            }
        }
        return false;
    },

    //获取重心位置
    getPos() {
        if (this._com != "") {
            return this.node.getComponent(this._com).getPos();
        }
        return this.node.convertToWorldSpaceAR(cc.v2(0,0));
    },

    setVisible(visible) {
        //_sgNode 在新的引擎中已经不能调用了
        if (visible != this._visible && this._objNode ) {
            this._visible = visible;
            // this._objNode._sgNode.setVisible(visible);
            this._objNode.active = visible
        }
    },

    checkOverTime(currentTime) {
        return currentTime >= (this._bornTime + this._lifeTime);
    },

    calcDegree(from, to) {
        let degree = 0;
        if (to.x - from.x == 0) {
            // 垂直
            if (to.y - from.y > 0) {
                degree = -90;
            } else {
                degree = 90;
            }
        } else {
            degree = -Math.atan((to.y - from.y) / (to.x - from.x)) * cc.macro.DEG;
            if(to.x - from.x < 0) {// 从右边出来
                degree+= 180;
            }
        }
        return degree;
    },

    // 更新鱼的角度
    updateDegree() {
        let currentPos = this.node.position;
        // 如果位移不超过1，不改变角度
        // if (cc.pDistance(this._lastPosition, currentPos) < 1) {
        if(currentPos.sub(this._lastPosition).lengthSqr() < 1){
            return;
        }

        // 计算角度
        let degree = this.calcDegree(this._lastPosition, currentPos);
        this.node.angle = -degree;
        this._lastPosition = currentPos;
    },

    update(dt) {
        if (this._dieParam) {
            this._dieParam.delay -= dt;
            if (this._dieParam.delay <= 0) {
                this.showCoin(this._dieParam);
                this._dieParam = null;
                Global.dispatchEvent("put_fish_pool", {fid:this._fishId, tid:this._fishTid, node:this.node});
            }
            return;
        }

        if (this._alive && this._traceType>=2) {
            this.updateDegree();
        }

        this._hit_snd_time -= dt;
        if (this._hit_anim_time > 0) {
            this._hit_anim_time -= dt;
            if (this._hit_anim_time <= 0) {
                this._objNode.color = cc.Color.WHITE;
            }
        }
    },

    //自己手动load的加入到卸载列表
    _addToLoadList:function(key,res,loadType){
        if(cc.vv.gameData.resMgr){
            cc.vv.gameData.resMgr.addCoustomLoadRes(key,res,loadType)
        }
        
    },

});
