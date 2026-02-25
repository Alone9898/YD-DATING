cc.Class({
    extends: cc.Component,

    properties: {

        _fishCfg: null,
        _fishPools: null,
        _fishNumber: 0,
        _countdownTime: -1,
        _fishLayer: null,
        _fishTideLayer: null,
        _fishMap: null,
        _delayFishes:[],
    },

    // LIFE-CYCLE CALLBACKS:

    init(fishCfg) {
        this._fishCfg = fishCfg;

        this._fishMap = new Map();

        this._fishPools = {};
        for (let tid in fishCfg.fishes) {
            this._fishPools[tid] = new cc.NodePool();
        }

        Global.registerEvent("put_fish_pool", this.putFishInPool, this);
    },

    onLoad() {
        this._fishLayer = cc.find("fish_layer", this.node);
    },

    onDestroy() {
        for (let tid in this._fishPools) {
            this._fishPools[tid].clear();
        }
    },

    fishCount() {
        return this._fishMap.size;
    },

    seekFish(fid) {
        return this._fishMap.get(fid);
    },

    seekBoss() {
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid>=21 && fish.isInScreen()) {
                return item;
            }
        }
        return null;
    },

    removeBosses() {
        let bosses = [];
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid>=21) {
                bosses.push(fish);
            }
        }

        for (let i=0; i<bosses.length; i++) {
            bosses[i].onDead();
        }
    },

    removeAllFishes() {
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish) {
                fish.node.stopAllActions();
                this._fishPools[fish._fishTid].put(fish.node);
            }
        };
        this._fishMap.clear();
    },

    removeFishesByTid(ftid) {
        let fishes = [];
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid>=ftid) {
                fishes.push(fish);
            }
        }

        for (let i=0; i<fishes.length; i++) {
            fishes[i].onDead();
        }
    },

    driveAwayAllFishes() {
        this._fishMap.forEach(function (item, key, mapObj) {
            let fish = item.getComponent("Fish_Fish");
            if (fish) {
                fish.leave();
            }
        });  
    },

    removeOvertimeFishes() {
        let fishes = [];
        let current = (new Date()).getTime();
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish.checkOverTime(current)) {
                fishes.push(fish);
            }
        }

        for (let i=0; i<fishes.length; i++) {
            fishes[i].onDead();
        }
    },

    // 点击鱼
    onTouchFish(pos) {
        for (let [key, item] of this._fishMap) {
            let boxCollider = item.getComponent(cc.BoxCollider);
            if(boxCollider && boxCollider.enabled) {
                let w = boxCollider.size.width;
                let h = boxCollider.size.height;
                if (w > 0 || h > 0) {
                    let rect = new cc.Rect(-w/2, -h/2, w, h);
                    let p = item.convertToNodeSpaceAR(pos);
                    if (rect.contains(p)) {
                        return item;
                    }
                } else {
                    let objNode = item.getChildByName("objNode");
                    if (!objNode) return null;
                    let children = objNode.children;
                    for (let i = 0, count=children.length; i < count; ++i) {
                        let part = children[i];
                        let boxCollider = part.getComponent(cc.BoxCollider);
                        if (boxCollider) {
                            let w = boxCollider.size.width;
                            let h = boxCollider.size.height;
                            let rect = new cc.Rect(-w/2, -h/2, w, h);
                            let p = part.convertToNodeSpaceAR(pos);
                            if (rect.contains(p)) {
                                let octopus = item.getComponent("HWFish918_FishOctopus");
                                if (octopus) octopus.onTouchPart(i);
                                return item;
                            }
                        }
                    }
                }
            }
        }
        return null;
    },

    // 找到屏幕内最大的鱼
    findLargestFish() {
        let maxType = 0;
        let maxNode = null;
        this._fishMap.forEach(function (item, key, mapObj) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish.isInScreen()) {
                if (maxType < fish._fishTid) {
                    maxType = fish._fishTid;
                    maxNode = item;
                }
            };
        });
        return maxNode;
    },

    // 找到大于minType的一条鱼
    findFishLargerThanType(minType) {
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish.isInScreen()) {
                if (fish._fishTid >= minType) {
                    return item;
                }
            }
        }
        return null;
    },

    // 找到类型为type的一条鱼
    findFishByType(ft) {
        for (let [key, item] of this._fishMap) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish.isInScreen()) {
                if (fish._fishTid == ft) {
                    return item;
                }
            }
        }
        return null;
    },

    shuffle(array) {
        let l = array.length;
        for (let i=0; i<l; i++) {
            let r = Math.floor(Math.random() * l);
            let tmp = array[i];
            array[i] = array[r];
            array[r] = tmp;
        }
    },

    // 找到以某点为圆心一定半径范围内的鱼
    findFishIdInRange(pos, radius, count, maxType) {
        let fishides = [];
        pos = cc.v2(pos.x, pos.y);
        this._fishMap.forEach(function(item, key, mapObj) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid <= maxType && fish.isInScreen()) {
                let p = item.position;
                if (pos.sub(p).mag() <= radius) {
                    fishides.push(fish._fishId);
                }
            }
        });

        this.shuffle(fishides);
        while (fishides.length > count) {
            fishides.pop();
        }
        return fishides;
    },

    // 找到某一射线上的鱼
    //pos1: 射线断点
    //direction: 射线方向向量
    //distance: 到射线的距离
    findFishIdInRay(pos1, direction, distance, count, maxType) {
        if (direction.equals(cc.v2(0,0)))
            direction = cc.v2(1,1);
        let length = direction.mag();
        pos1 = cc.v2(pos1.x, pos1.y);
        let pos2 = pos1.add(direction.mul(1600/length));

        let fishides = [];
        this._fishMap.forEach(function(item, key, mapObj) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid <= maxType && fish.isInScreen()) {
                let p = item.position;
                let v1 = pos2.sub(pos1);
                let v2 = p.sub(pos1);
                let v3 = p.sub(pos2);
                let d = 0;
                if (v1.dot(v2) < 0) {
                    d = v2.mag();
                } else if (v1.dot(v3) > 0) {
                    d = v3.mag(); 
                } else {
                    d = Math.abs(v1.cross(v2))/v1.mag();
                }
                if (d <= distance) {
                    fishides.push(fish._fishId);
                }
            }
        });

        this.shuffle(fishides);
        while (fishides.length > count) {
            fishides.pop();
        }
        return fishides;
    },

    findRandomFishId(maxType, count) {
        let fishides = [];
        this._fishMap.forEach(function(item, key, mapObj) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid <= maxType && fish.isInScreen()) {
                fishides.push(fish._fishId);
            }
        });

        this.shuffle(fishides);
        while (fishides.length > count) {
            fishides.pop();
        }
        return fishides;
    },

    findFishIdByTid(ftid, count) {
        let fishides = [];
        this._fishMap.forEach(function(item, key, mapObj) {
            let fish = item.getComponent("Fish_Fish");
            if (fish && fish._fishTid == ftid && fish.isInScreen()) {
                fishides.push(fish._fishId);
            }
        });
        this.shuffle(fishides);
        while (fishides.length > count) {
            fishides.pop();
        }
        return fishides;
    },

    // 停止移动
    stopMove(time) {
        this._countdownTime = time;
        this._fishMap.forEach(function(item, key, mapObj) {
            item.pauseAllActions();
        });
    },

    putFishInPool(data) {
        Global.dispatchEvent("fish_dead", data.detail.node);
        this._fishPools[data.detail.tid].put(data.detail.node);
        this._fishMap.delete(data.detail.fid);
    },

    createFish(tid, id, traceType, trace, groupid, parent) {
        if (!this._fishPools[tid]) {
            cc.log("unkown fish type id", tid);
            return null;
        }
        let cfg = this._fishCfg.fishes[tid];
        let fishNode = null;
        if (this._fishPools[tid].size() > 0) {
            fishNode = this._fishPools[tid].get();
        } else {
            fishNode = new cc.Node();
            let fish = fishNode.addComponent("Fish_Fish");
            fish.create(tid, cfg, this._fishCfg.res_path);
        }
        let delay = 0;
        if (groupid) {
            delay = Math.max(groupid*cfg.speed/25, groupid*cfg.speed*cfg.box.width/(cc.winSize.width+cfg.box.width));
        }
        fishNode.getComponent("Fish_Fish").init(id, traceType, trace, delay);
        // fishNode.name = id;
        fishNode.parent = parent?parent:this._fishLayer;
        if (this._countdownTime > 0.1) {
            fishNode.pauseAllActions();
        }

        this._fishMap.set(id, fishNode);
        return fishNode;
    },

    start() {
    },

    update(dt) {
        if (this._countdownTime > 0) {
            this._countdownTime -= dt;
            if (this._countdownTime <= 0) {
                this._fishMap.forEach(function(item, key, mapObj) {
                    item.resumeAllActions();
                });
            }
        }
    },

    // 场景鱼潮  鱼潮持续时间不超过30秒
    buildfishtide(style, fids, fts) {
        this._delayFishes = [];
        if (style == 1) {
            return this.buildfishtide1(fids, fts);
        }else if (style == 2) {
            return this.buildfishtide2(fids, fts);
        }else if (style == 3) {
            return this.buildfishtide3(fids, fts);
        }else if (style == 4) {
            return this.buildfishtide4(fids, fts);
        }else if (style == 5) {
            return this.buildfishtide5(fids, fts);
        }else if (style == 6) {
            return this.buildfishtide6(fids, fts);
        }else if (style == 7) {
            return this.buildfishtide7(fids, fts);
        }else if (style == 8) {
            return this.buildfishtide8(fids, fts);
        }else if (style == 9) {
            return this.buildfishtide9(fids, fts);
        }else if (style == 10) {
            return this.buildfishtide10(fids, fts);
        }else if (style == 11) {
            return this.buildfishtide11(fids, fts);
        }else if (style == 12) {
            return this.buildfishtide12(fids, fts);
        }else if (style == 13) {
            return this.buildfishtide13(fids, fts);
        }else if (style == 14) {
            return this.buildfishtide14(fids, fts);
        }else if (style == 15) {
            return this.buildfishtide15(fids, fts);
        }
        return 0;
    },

    // 鱼潮样式1: 一带三小
    buildfishtide1(fids, fts) {
        // 共出两轮，每轮1条帝王鲸，带3个灯笼鱼，以及40条小丑鱼围成的2个圈，以及20条黄蓝纹鱼组成的队列
        let self = this;
        function createOneTakeThree() {
            let node = new cc.Node();
            node.addComponent("Fish_Recycle");
            //帝王鲸x1
            self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(200, 0)], 0, node);
            //灯笼鱼x3
            for (let j=0; j<3; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(650+j*200, 0)], 0, node);
            }
            //小丑鱼x40
            for (let j=0; j<2; j++) {
                for (let l=0; l<20; l++) {
                    let r = 100;
                    let theta = l / 20 * 2 * Math.PI;
                    let c = cc.v2(650+j*400, 0);
                    self.createFish(fts.shift(), fids.shift(), 0, [c.add(cc.v2(r*Math.cos(theta), r*Math.sin(theta)))], 0, node);
                }
            }
            //黄蓝纹鱼x20
            for (let j=0; j<7; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(520+j*100, 192)], 0, node);
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(520+j*100, -192)], 0, node);
            }
            for (let j=0; j<3; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(720+j*100, 128)], 0, node);
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(720+j*100, -128)], 0, node);
            }

            let children = node.children;
            for (let i = 0, count=children.length; i < count; ++i) {
                children[i].angle = -180;
            }

            node.parent = self._fishLayer;
            node.x = 640;
            node.runAction(cc.sequence(cc.moveBy(18, cc.v2(-2560, 0)), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })));
        }

        this.node.runAction(cc.sequence(cc.callFunc(()=>{
                createOneTakeThree();
            }),
            cc.delayTime(12),
            cc.callFunc(()=>{
                createOneTakeThree();
            })));
        return 30;
    },

    // 鱼潮样式2：旋转的圆
    buildfishtide2(fids, fts) {
        //共出两个同心圈，每个同心圈4层，中心1条海龟，第2圈8条粉红刺鱼，第3圈12条黄蓝纹鱼，第4圈24条小丑鱼
        let self = this;
        function createRotateCircle(count, center, radius, deltaDegree, rot) {
            let node = new cc.Node();
            node.position = center;
            for (let i=0; i<count; i++) {
                let theta = i / count * 2 * Math.PI;
                let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(radius*Math.cos(theta), radius*Math.sin(theta))], 0, node);
                fishNode.angle = -(90 - theta * cc.macro.DEG + deltaDegree);
                fishNode.runAction(cc.sequence(cc.hide(),cc.delayTime(i*5/count),cc.show(),cc.delayTime(24),cc.callFunc((sender)=>{
                    let f = sender.getComponent("Fish_Fish");
                    if (f) f.onDead();
                })));
            }
            node.addComponent("Fish_Recycle");
            node.runAction(cc.sequence(cc.repeat(cc.rotateBy(5, rot), 6), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })))
            return node;
        }

        for (let i=0; i<2; i++) {
            let center = cc.v2(-300+i*600, 0);
            //海龟x1
            let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [center]);
            fishNode.runAction(cc.sequence(cc.delayTime(28), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Fish").onDead();
            })));
            //粉红刺鱼x8
            let node1 = createRotateCircle(8, center, 120, 0, 360);
            node1.parent = self._fishLayer;

            //黄蓝纹鱼x12
            let node2 = createRotateCircle(12, center, 180, 180, -360);
            node2.parent = self._fishLayer;

            //小丑鱼x24
            let node3 = createRotateCircle(24, center, 230, 0, 360);
            node3.parent = self._fishLayer;
        }
        return 29;
    },

    // 鱼潮样式3：三纵三横
    buildfishtide3(fids, fts) {
        // 大鱼: 帝王鲸+杀人鲸，共出3轮
        // 小鱼: 黄蓝纹鱼20x3，小丑鱼20*3
        let self = this;
        // 大鱼x6
        for (let i=0; i<6; i++) {
            let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(960, 0)]);
            fishNode.runAction(cc.sequence(cc.delayTime(i*3), cc.moveBy(10, cc.v2(-1920, 0)), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Fish").onDead();
            })));
            fishNode.angle = -180;
        }
        //小鱼x120
        let nodex = new cc.Node();
        nodex.parent = this._fishLayer;

        let nodey = new cc.Node();
        nodey.parent = this._fishLayer;

        for (let i=0; i<20; i++) {
            for (let j=-1; j<=1; j++) {
                let fishNode1 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(i*128, j*216)], 0, nodex);
                fishNode1.angle = -180;

                let fishNode2 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(j*380, i*72)], 0, nodey);
                fishNode2.angle = -90;
            }
        }

        nodex.x = 640;
        nodex.addComponent("Fish_Recycle");
        nodex.runAction(cc.sequence(cc.moveBy(30, cc.v2(-1280*3, 0)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));

        nodey.y = 360;
        nodey.addComponent("Fish_Recycle");
        nodey.runAction(cc.sequence(cc.moveBy(30, cc.v2(0, -720*3)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));

        return 30;
    },

    // 鱼潮样式4：交叉组合
    buildfishtide4(fids, fts) {
        //6条蓝魔鬼鱼,60条精英粉红刺鱼
        let self = this;
        //蓝魔鬼鱼x6
        //左边3条
        let nodeL = new cc.Node();
        nodeL.parent = this._fishLayer;
        nodeL.x = -740
        nodeL.addComponent("Fish_Recycle");
        nodeL.runAction(cc.sequence(cc.moveBy(5, cc.v2(340, 0)), cc.delayTime(22), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));
        self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0, 0)], 0, nodeL);
        self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-160, 130)], 0, nodeL);
        self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-160, -130)], 0, nodeL);

        //右边3条
        let nodeR = new cc.Node();
        nodeR.parent = this._fishLayer;
        nodeR.x = 740
        nodeR.addComponent("Fish_Recycle");
        nodeR.runAction(cc.sequence(cc.moveBy(5, cc.v2(-340, 0)), cc.delayTime(22), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));
        let f1 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0, 0)], 0, nodeR);
        f1.angle = -180;
        let f2 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(160, 130)], 0, nodeR);
        f2.angle = -180;
        let f3 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(160, -130)], 0, nodeR);
        f3.angle = -180;

        //粉红刺鱼x60
        let nodeLB = new cc.Node();
        nodeLB.position = cc.v2(-640, -320);
        nodeLB.parent = this._fishLayer;

        let nodeRB = new cc.Node();
        nodeRB.position = cc.v2(640, -320);
        nodeRB.parent = this._fishLayer;

        for (let i=0; i<30; i++) {
            let f1 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-i*160, -i*90)], 0, nodeLB);
            f1.angle = 30;
            let f2 = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(i*160, -i*90)], 0, nodeRB);
            f2.angle = 150;
        }
        nodeLB.addComponent("Fish_Recycle");
        nodeLB.runAction(cc.sequence(cc.moveBy(30, cc.v2(6000, 3375)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));
        nodeRB.addComponent("Fish_Recycle");
        nodeRB.runAction(cc.sequence(cc.moveBy(30, cc.v2(-6000, 3375)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));

        return 30;
    },
    
    //鱼潮样式5，三角阵型
    buildfishtide5(fids, fts) {
        //共出两组，每组烛光鱼x16,背刺鱼x16，鸳鸯鱼x4
        let self = this;
        function createTriangle() {
            let node = new cc.Node();
            node.addComponent("Fish_Recycle");
            //烛光鱼x16
            for (let j=0; j<6; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(j*80, j*50)], 0, node);
                if (j > 0) {
                    self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(j*80, -j*50)], 0, node);
                }
            }
            for (let j=0; j<5; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(400, 160-j*80)], 0, node);
            }
            //背刺鱼x16
            for (let j=0; j<6; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(500+j*70, j*40)], 0, node);
                if (j > 0) {
                    self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(500+j*70, -j*40)], 0, node);
                }
            }
            for (let j=0; j<5; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(500+350, 140-j*70)], 0, node);
            }
            //鸳鸯鱼x4
            for (let j=0; j<4; j++) {
                self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(1000, (j-1.5)*80)], 0, node);
            }

            let children = node.children;
            for (let i = 0, count=children.length; i < count; ++i) {
                children[i].angle = -180;
            }

            node.parent = self._fishLayer;
            node.x = 640;
            node.runAction(cc.sequence(cc.moveBy(18, cc.v2(-2560, 0)), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })));
        }

        this.node.runAction(cc.sequence(cc.callFunc(()=>{
                createTriangle();
            }),
            cc.delayTime(10),
            cc.callFunc(()=>{
                createTriangle();
            })));

        return 28;
    },

    // 鱼潮样式6：发射鱼环
    buildfishtide6(fids, fts) {
        //共出两个圆环，每个圆环发射5次，每次发射8条鱼
        let self = this;
        function createCircle(pos) {
            let node = new cc.Node();
            node.position = pos;
            node.addComponent("Fish_Recycle");
            node.runAction(cc.sequence(cc.rotateBy(30, 360), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })))
            return node;
        }

        for (let i=0; i<2; i++) {
            let pos = cc.v2(-300+i*600, 0);
            let circle = createCircle(pos)
            circle.parent = self._fishLayer;

            let count = 12;
            let radius = 960; //半径
            for (let j=0; j<5; j++) {   //发射5次
                for (let k=0; k<count; k++) {   //每次12条
                    let theta = k / count * 2 * Math.PI;
                    let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0,0)], 0, circle);
                    fishNode.angle = theta * cc.macro.DEG;
                    fishNode.runAction(cc.sequence(cc.hide(), cc.delayTime(j*4), cc.show(),
                        cc.spawn(cc.moveBy(15, cc.v2(radius*Math.cos(theta), radius*Math.sin(theta))), cc.rotateBy(15, 90))));
                }
            }
        }

        return 31;
    },

    // 鱼潮样式7：平移的圈
    buildfishtide7(fids, fts) {
        //共出12个圆环，从右到左平移，每个圈15条鱼
        let self = this;
        function createCircle() {
            let radius = 220;
            let node = new cc.Node();
            node.position = cc.v2(640+radius, 0);
            node.parent = self._fishLayer;
            node.addComponent("Fish_Recycle");
            node.runAction(cc.sequence(cc.moveTo(15, cc.v2(-640-radius, 0)), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })))

            let count = 15;
            for (let i=0; i<count; i++) {
                let theta = i / count * 2 * Math.PI;
                let pos = cc.v2(radius*Math.cos(theta), radius*Math.sin(theta));
                let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [pos], 0, node);
                fishNode.angle = -180;
            }

        }

        let actions = [];
        for (let i=0; i<12; i++) {
            actions.push(cc.callFunc(()=>{
                createCircle();
            }));
            actions.push(cc.delayTime(1.85));
        }
        this.node.runAction(cc.sequence(actions));

        return 35;
    },

    // 鱼潮样式8：相对的圈
    buildfishtide8(fids, fts) {
        //共出2个圆环，分别从左到右和从右到左，相向移动
        let self = this;
        function createCircle(rot, startpos, endpos) {
            let node = new cc.Node();
            node.position = startpos;
            node.parent = self._fishLayer;
            node.addComponent("Fish_Recycle");
            node.runAction(cc.sequence(cc.moveTo(32, endpos), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })))

            //中间的鱼
            let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0,0)], null, node);
            fishNode.angle = -rot;
            //从内到外3圈
            let counts = [18, 27, 36];
            let radiuses = [170, 230, 280];
            for (let i=0; i<3; i++) {
                let count = counts[i];
                let radius = radiuses[i];
                for (let j=0; j<count; j++) {
                    let theta = j / count * 2 * Math.PI;
                    let pos = cc.v2(radius*Math.cos(theta), radius*Math.sin(theta));
                    let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [pos], null, node);
                    fishNode.angle = -rot;
                }
            }
        }

        //从左到右
        createCircle(0, cc.v2(-cc.winSize.width/2-300, 0), cc.v2(cc.winSize.width/2+300, 0));
        //从右到左
        createCircle(180, cc.v2(cc.winSize.width/2+300, 0), cc.v2(-cc.winSize.width/2-300, 0));

        return 32;
    },

    // 鱼潮样式9：放射圆环
    buildfishtide9(fids, fts) {
        let self = this;
        let idx = 0;
        let counts = [15,12,15,12,15,12,15,12,6,3];
        function createCircle() {
            let node = new cc.Node();
            node.parent = self._fishLayer;
            node.addComponent("Fish_Recycle");
            node.runAction(cc.sequence(cc.delayTime(15), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })));

            let radius = 800;
            let count = counts[idx];
            idx += 1;
            for (let i=0; i<count; i++) {
                let theta = (i + (idx%2==0?0:0.5)) / count * 2 * Math.PI;
                let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0,0)], 0, node);
                fishNode.angle = theta * cc.macro.DEG;
                fishNode.runAction(cc.moveBy(15, cc.v2(radius*Math.cos(theta), radius*Math.sin(theta))));
            }
        }

        let actions = [];
        for (let i=0; i<counts.length; i++) {
            actions.push(cc.callFunc(()=>{
                createCircle();
            }));
            if (i==counts.length-2)
                actions.push(cc.delayTime(2.5))
            else
                actions.push(cc.delayTime(2.2));
        }
        this.node.runAction(cc.sequence(actions));

        return 35;
    },

    // 鱼潮样式10：一带五小阵列
    buildfishtide10(fids, fts) {
        let node = new cc.Node();
        node.parent = this._fishLayer;
        node.position = cc.v2(-cc.winSize.width/2-150, 0);
        node.addComponent("Fish_Recycle");

        let offsets = [cc.v2(140, 0), cc.v2(0, 100), cc.v2(0, -100), cc.v2(-140, -60), cc.v2(-140, 60)]
        for (let i=0; i<3; i++) {
            for (let j=0; j<2; j++) {
                let pos = cc.v2(-i*500, (j-0.5)*300);
                this.createFish(fts.shift(), fids.shift(), 0, [pos], 0, node);
                for (let k=0; k<5; k++) {
                    this.createFish(fts.shift(), fids.shift(), 0, [pos.add(offsets[k])], 0, node);
                }
            }
        }
        this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-1400, 150)], 0, node);
        this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-1400, -150)], 0, node);
        this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-1700, 0)], 0, node);

        node.runAction(cc.sequence(cc.moveBy(30, cc.v2(2000+cc.winSize.width, 0)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));

        return 30;
    },

    // 鱼潮延时11: 上下穿插
    buildfishtide11(fids, fts) {
        let spanx = 240;    //间隔
        let spany = 220;    //间隔
        let fishNode = null;
        // 下面
        let nodeB = new cc.Node();
        nodeB.parent = this._fishLayer;
        nodeB.position = cc.v2(0, -cc.winSize.height/2-100);
        nodeB.addComponent("Fish_Recycle");
        nodeB.runAction(cc.sequence(cc.moveBy(30, cc.v2(0, cc.winSize.height+1450)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })))
        for (let i=0;i<5;i++) {
            for (let j=0; j<5; j++) {
                fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2((j-2)*spanx, -i*spany)], 0, nodeB);
                fishNode.angle = 90;
            }
        }
        fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0, -5*240)], 0, nodeB);
        fishNode.angle = 90;

        // 上面
        let nodeT = new cc.Node();
        nodeT.parent = this._fishLayer;
        nodeT.position = cc.v2(0, cc.winSize.height/2+100);
        nodeT.addComponent("Fish_Recycle");
        nodeT.runAction(cc.sequence(cc.moveBy(30, cc.v2(0, -cc.winSize.height-1450)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })))
        for (let i=0;i<5;i++) {
            for (let j=0; j<4; j++) {
                fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2((j-1.5)*spanx, i*spany)], 0, nodeT);
                fishNode.angle = -90;
            }
        }
        fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-spanx, 5*240)], 0, nodeT);
        fishNode.angle = -90;
        fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(spanx, 5*240)], 0, nodeT);
        fishNode.angle = -90;

        return 30;
    },

    // 鱼潮延时12: 左右穿插
    buildfishtide12(fids, fts) {
        let px = [0, 160, 320, 490, 660, 840, 1040, 1260];    //间隔
        let spany = 160;    //间隔
        let fishNode = null;
        // 左面
        let nodeL = new cc.Node();
        nodeL.parent = this._fishLayer;
        nodeL.position = cc.v2(-cc.winSize.width/2-100, 0);
        nodeL.addComponent("Fish_Recycle");
        nodeL.runAction(cc.sequence(cc.moveBy(30, cc.v2(cc.winSize.width+1500, 0)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })))
        for (let i=0;i<8;i++) {
            for (let j=0; j<4; j++) {
                fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(-px[i], (j-1.5)*spany)], 0, nodeL);
            }
        }

        // 右面
        let nodeR = new cc.Node();
        nodeR.parent = this._fishLayer;
        nodeR.position = cc.v2(cc.winSize.width/2+100, 0);
        nodeR.addComponent("Fish_Recycle");
        nodeR.runAction(cc.sequence(cc.moveBy(30, cc.v2(-cc.winSize.width-1500, 0)), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })))
        for (let i=0;i<8;i++) {
            for (let j=0; j<3; j++) {
                fishNode = this.createFish(fts.shift(), fids.shift(), 0, [cc.v2(px[i], (j-1)*spany)], 0, nodeR);
                fishNode.angle = -180;
            }
        }

        return 30;
    },

    // 鱼潮样式13: 分列两旁
    buildfishtide13(fids, fts) {
        let self = this;
        //中间
        function createFishWithDelay(tid, id, traceType, trace, interval, delay) {
            let fishNode = self.createFish(tid, id, 0, trace);
            let moveAction = null;
            if (traceType==1) {
                moveAction =  cc.moveTo(interval, trace[1]);
            } else {
                moveAction = cc.cardinalSplineTo(interval, trace, 0);
            }
            fishNode.angle = -180;
            fishNode.getComponent("Fish_Fish")._traceType = 2;
            fishNode.runAction(cc.sequence(cc.delayTime(delay), moveAction, cc.callFunc((sender)=>{
                sender.getComponent("Fish_Fish").onComplete();
            })));
            return fishNode;
        }
        let w = cc.winSize.width;
        let h = cc.winSize.height;
        let startpos = cc.v2(w/2+96, 0);
        let trace1 = [startpos, cc.v2(-w/2-96, 0)];
        let trace2 = [startpos, cc.v2(0, h/4+32), cc.v2(-w/4, h/2+64)];
        let trace3 = [startpos, cc.v2(0, -h/4-32), cc.v2(-w/4, -h/2-64)];
        for (let i=0; i<3; i++) {
            let delay = i * 11 //一波间隔11秒
            createFishWithDelay(fts.shift(), fids.shift(), 1, trace1, 15, delay+0);
            createFishWithDelay(fts.shift(), fids.shift(), 2, trace2, 15, delay+2);
            createFishWithDelay(fts.shift(), fids.shift(), 2, trace3, 15, delay+2);
            createFishWithDelay(fts.shift(), fids.shift(), 2, trace2, 15, delay+4);
            createFishWithDelay(fts.shift(), fids.shift(), 2, trace3, 15, delay+4);
            createFishWithDelay(fts.shift(), fids.shift(), 2, trace2, 15, delay+6);
            createFishWithDelay(fts.shift(), fids.shift(), 2, trace3, 15, delay+6);
        }

        //两旁
        function createForm() {
            let p1 = cc.v2(0, -cc.winSize.height/2-32);
            let p2 = cc.v2(0, cc.winSize.height/2+32);
            let path=[[p1,p2],[p2,p1]];
            let rot = [-90, 90]
            for (let i=0; i<2; i++) {
                let node = new cc.Node();
                node.parent = self._fishLayer;
                node.addComponent("Fish_Recycle");
                node.position = path[i][0];
                node.runAction(cc.sequence(cc.moveTo(12, path[i][1]), cc.callFunc((sender)=>{
                    sender.getComponent("Fish_Recycle").recycle();
                })))
                
                let startx = -cc.winSize.width/2;
                let interval = cc.winSize.width/29;
                for (let j=0; j<30; j++) {
                    let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(startx+interval*j, 0)], null, node);
                    fishNode.angle = -rot[i];
                }
            }
        }
        let actions = [];
        for (let i=0; i<3; i++) {
            actions.push(cc.callFunc(()=>{
                createForm();
            }));
            if (i<2) actions.push(cc.delayTime(15));
        }
        this.node.runAction(cc.sequence(actions));

        return 42;
    },

    // 鱼潮样式14: 田径跑道
    buildfishtide14(fids, fts) {
        let self = this;
        let node = new cc.Node();
        node.parent = this._fishLayer;
        node.addComponent("Fish_Recycle");
        node.runAction(cc.sequence(cc.delayTime(30), cc.callFunc((sender)=>{
            sender.getComponent("Fish_Recycle").recycle();
        })));

        let w = cc.winSize.width;
        let h = cc.winSize.height;
        let poses = [cc.v2(-224, 0), cc.v2(224, 0)];
        let rots = [0, 180];
        let ends = [cc.v2(w/2+128, 0), cc.v2(-w/2-128)];
        for (let i=0; i<2; i++) {
            let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [poses[i]], null, node);
            fishNode.angle = -rots[i];
            fishNode.runAction(cc.sequence(cc.delayTime(15), cc.moveTo(15, ends[i])));
        }
        for (let i=0; i<10; i++) {
            let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0, 0)], null, node);
            if (i<5) {
                fishNode.angle = 90;
                fishNode.position = cc.v2(-200+i*100, 120);
                fishNode.runAction(cc.sequence(cc.delayTime(15), cc.moveBy(12, cc.v2(0, h/2))));
            } else {
                fishNode.angle = -90;
                fishNode.position = cc.v2(-200+(i-5)*100, -120);
                fishNode.runAction(cc.sequence(cc.delayTime(15), cc.moveBy(12, cc.v2(0, -h/2))));
            }
        }

        function createRunway(radius, count1, count2) {
            let d = 320;
            for (let i=0; i<count1; i++) {
                let theta = i / count1 * 2 * Math.PI;
                let pos = cc.v2(radius*Math.cos(theta), radius*Math.sin(theta));
                if (i <= count1/4 || i >= count1*3/4) pos.x += d;
                else pos.x -= d;
                let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [pos], null, node);
                fishNode.angle = theta * cc.macro.DEG;
                fishNode.runAction(cc.sequence(cc.delayTime(15), cc.moveBy(12, cc.v2(256*Math.cos(theta), 256*Math.sin(theta)))));
            }

            let c = Math.floor(count2/2);
            let dx = d * 2 / c;
            for (let i = 0; i<2; i++) {
                for (let j=0; j<c; j++) {
                    let pos = cc.v2(-d + dx*0.2 + j*dx, (i==0?radius:-radius));
                    let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [pos], null, node);
                    if (i==0) {
                        fishNode.angle = 90;
                        fishNode.runAction(cc.sequence(cc.delayTime(15), cc.moveBy(12, cc.v2(0, 256))));
                    } else {
                        fishNode.angle = -90;
                        fishNode.runAction(cc.sequence(cc.delayTime(15), cc.moveBy(12, cc.v2(0, -256))));
                    }
                }
            }
        }

        createRunway(150, 32, 28);
        createRunway(200, 42, 38);

        return 30;
    },

    // 鱼潮样式15: 四重双环
    buildfishtide15(fids, fts) {
        //两个大圆环，每个圆环由4圈鱼组成，中心点各有一条大鱼
        let self = this;
        function createCircle(rot, startpos, endpos) {
            let node = new cc.Node();
            node.position = startpos;
            node.parent = self._fishLayer;
            node.addComponent("Fish_Recycle");
            node.runAction(cc.sequence(cc.delayTime(45), cc.callFunc((sender)=>{
                sender.getComponent("Fish_Recycle").recycle();
            })));

            //从外到内4圈
            let counts = [30, 24, 20, 18];
            let radiuses = [250, 200, 150, 100];
            for (let i=0; i<4; i++) {
                let count = counts[i];
                let radius = radiuses[i];
                for (let j=0; j<count; j++) {
                    let theta = j / count * 2 * Math.PI;
                    let pos = cc.v2(radius*Math.cos(theta), radius*Math.sin(theta));
                    let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [pos], null, node);
                    fishNode.angle = theta*cc.macro.DEG + 90;
                    //沿切线方向移动
                    let beta = theta+Math.PI/2;
                    fishNode.runAction(cc.sequence(cc.delayTime((i+1)*8), cc.moveBy(16, cc.v2(1024*Math.cos(beta), 1024*Math.sin(beta)))));
                }
            }

            //中间的鱼
            let fishNode = self.createFish(fts.shift(), fids.shift(), 0, [cc.v2(0,0)], null, node);
            fishNode.angle = -rot;
            fishNode.runAction(cc.sequence(cc.delayTime(32), cc.moveTo(10, endpos)));
        }

        //左
        createCircle(0, cc.v2(-cc.winSize.width/4, 0), cc.v2(cc.winSize.width*5/4, 0));
        //右
        createCircle(180, cc.v2(cc.winSize.width/4, 0), cc.v2(-cc.winSize.width*5/4, 0));

        return 40;
    },

});
