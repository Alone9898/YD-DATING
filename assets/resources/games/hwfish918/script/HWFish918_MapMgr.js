
cc.Class({
    extends: cc.Component,

    properties: {
        bgAtlas: cc.SpriteAtlas,
        _swithBg: null,
        _logo: null,
        _bosslogo: null,
        _maps: [],
        _mapid: 1,
    },


    onLoad () {
        this._swithBg = cc.find("switchbg", this.node);
        this._logo = cc.find("switchbg/logo", this.node);
        this._bosslogo = cc.find("bosslogo", this.node);
        for (let i=1; i<=5; i++) {
            let map = cc.find("bg_layer/bg"+i, this.node);
            this._maps[i-1] = map;
        }
    },

    switchMap(mapid) {
        this._swithBg.active = true;
        this._swithBg.opacity = 0;
        let self = this;
        this._swithBg.runAction(cc.sequence(cc.fadeIn(0.3), cc.callFunc(()=>{
            self.showMap(mapid);
        }), 
        cc.delayTime(2.7), cc.fadeOut(1),
        cc.callFunc((sender)=>{
            sender.active = false;
        })));

        this._logo.active = true;
        this._logo.x = -1000;
        this._logo.runAction(cc.sequence(cc.moveBy(0.5,cc.v2(1000,0)), cc.delayTime(2), cc.moveBy(0.5, cc.v2(1000,0)), cc.callFunc(sender=>{
            sender.active = false;
        })));
    },

    showMap(mapid) {
        cc.log("showMap", mapid);
        if (this._mapid == mapid) {
            return;
        }
        this.closeMap(this._mapid);
        this.openMap(mapid);
        this._mapid = mapid;
    },

    closeMap(mapid) {
        let map = this._maps[mapid-1];
        if (mapid == 1) {
            map.getChildByName("center").stopAllActions();
            map.stopAllActions();
            map.angle = 0;
        } else if (mapid==2) {
            let move = map.getChildByName("move");
            move.stopAllActions();
            move.x = 0;
        } else if (mapid==3) {
            map.getChildByName("center").stopAllActions();
        }
        map.active = false;
    },

    openMap(mapid) {
        let map = this._maps[mapid-1];
        map.active = true;
        if (mapid==1) {
            let center = map.getChildByName("center");
            let r = 10;
            let poses=[cc.v2(r,0), cc.v2(0.7*r,0.7*r), cc.v2(0,r),cc.v2(-0.7*r,0.7*r),cc.v2(-r,0),cc.v2(-0.7*r,-0.7*r),cc.v2(0,-r),cc.v2(0.7*r,-0.7*r)];
            center.position = cc.v2(0,0);
            let actions=[];
            for (let i=0;i<poses.length;i++) {
                actions.push(cc.moveTo(1, poses[i]));
            }
            center.runAction(cc.repeatForever(cc.sequence(actions)));
        } else if (mapid==3) {
            let center = map.getChildByName("center");
            center.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(3,1.2), cc.delayTime(0.5), cc.scaleTo(2.5,1), cc.delayTime(0.5))));
        }
    },

    showBossCome(mapid) {
        if (mapid<=4) {
            let mapid2bossid = {
                [1]: 1,   //深海章鱼
                [2]: 4,   //史前巨鳄
                [3]: 3,   //深海狂鳌
                [4]: 2,   //暗夜魔兽
            }
            let sf = "BOSSLog"+mapid2bossid[mapid];
            this._bosslogo.active = true;
            this._bosslogo.getComponent(cc.Sprite).spriteFrame = this.bgAtlas.getSpriteFrame(sf);
            this._bosslogo.x = -940;
            this._bosslogo.opacity = 255;
            this._bosslogo.runAction(cc.sequence(
                cc.moveBy(0.8,cc.v2(940,0)),
                cc.repeat(cc.sequence(cc.spawn(cc.scaleTo(0.3,1.2),cc.rotateTo(0.3,5)), cc.spawn(cc.scaleTo(0.3,1),cc.rotateTo(0.3,-5))), 4),
                cc.rotateTo(0.2, 0),
                cc.spawn(cc.moveBy(0.8, cc.v2(940,0)),cc.fadeOut(0.8)),
                cc.callFunc(sender=>{
                    sender.active = false;
            })));
        }
        if (mapid == 1) { //章鱼boss，地图旋转
            let map = this._maps[mapid-1];
            if (map.active) {
                map.runAction(cc.repeat(cc.sequence(cc.delayTime(7), cc.rotateBy(3, 90)), 7));
            }
        } else if (mapid==2) {  // 巨鳄boss，地图移动
            let map = this._maps[mapid-1];
            let move = map.getChildByName("move");
            move.x = 0;
            move.runAction(cc.repeatForever(cc.sequence(cc.moveBy(45,cc.v2(1136,0)),
                cc.callFunc((sender)=>{
                    for (let i=1; i<=2; i++) {
                        let base = sender.getChildByName("base"+i);
                        let sx = base.scaleX;
                        base.scaleX = (-sx);
                    }
                }),
                cc.moveBy(0, cc.v2(-1136,0))))
            );
        }
    }

    // update (dt) {},
});
