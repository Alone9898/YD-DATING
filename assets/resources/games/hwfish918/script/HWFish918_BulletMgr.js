
cc.Class({
    extends: cc.Component,

    properties: {
        _bulletLayer:null,
        _bulletCfg:null,
        _bulletPrefab:null,
        _bulletLyfbPrefab:null,
        _netPrefab:null,
        _boomPrefab:null,
        _lyfbBoomPrefab:null,
        _bulletPool:null,               // 子弹对象池
        _bulletLyfbPool:null,
        _netPool:null,
        _boomPool:null,
        _lyfbBoomPool:null,
        _interval:0,
        _bulletid:0,
        _valid:true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._effectLayer = cc.find("effect_layer", this.node);
        this._bulletLayer = cc.find("bullet_layer", this.node);

        this._bulletPool = new cc.NodePool();
        this._bulletLyfbPool = new cc.NodePool();
        this._netPool =new cc.NodePool();
        this._boomPool =new cc.NodePool();
        this._lyfbBoomPool =new cc.NodePool();
        this._interval = 0.1;

        this.colors = [cc.color(255,255,255),
            cc.color(61,208,213), cc.color(236,51,220),
            cc.color(242,39,23), cc.color(247,215,50)];
   },

    onDestroy() {
        this._bulletPool.clear();
        this._bulletLyfbPool.clear();
        this._netPool.clear();
        this._boomPool.clear();
        this._lyfbBoomPool.clear();
    },

    init(bulletPrefab, bulletLyfbPrefab, netPrefab, boomPrefab, lyfbBoomPrefab, bulletCfg){
        this._bulletPrefab = bulletPrefab;
        this._bulletLyfbPrefab = bulletLyfbPrefab;
        this._netPrefab = netPrefab;
        this._boomPrefab = boomPrefab;
        this._lyfbBoomPrefab = lyfbBoomPrefab;
        this._bulletCfg = bulletCfg;

        for(let i=0;i<50;++i) {
            let bullet = cc.instantiate(this._bulletPrefab); // 创建节点
            this._bulletPool.put(bullet); // 通过 putInPool 接口放入对象池
        }
        for (let i=0;i<20;++i) {
            let bulletNet = cc.instantiate(this._netPrefab);
            this._netPool.put(bulletNet);
        }
        for (let i=0;i<20;++i) {
            let bulletBoom = cc.instantiate(this._boomPrefab);
            this._boomPool.put(bulletBoom);
        }
    },

    clear() {
        let childs = this._bulletLayer.children;
        for (let i=0, l=childs.length; i<l; i++) {
            this.putBulletPool(childs[i]);
        }
    },

    setValid(flag) {
        this._valid = flag;
    },

    putBulletPool(node, bulletType) {
        if (bulletType==4) {
            this._bulletLyfbPool.put(node);
        } else {
            this._bulletPool.put(node);
        }
    },

    fire(bulletInfo) {
        let cfg = this._bulletCfg[bulletInfo.type];
        bulletInfo.spr = cfg.sprite;
        let bullet = null;
        if (bulletInfo.type==1 || bulletInfo.type==2) { //网格，导弹
            if(this._bulletPool.size() > 0){
                bullet = this._bulletPool.get();
            } else {
                bullet = cc.instantiate(this._bulletPrefab);
            }
        } else if (bulletInfo.type == 4) { //火球
            if(this._bulletLyfbPool.size() > 0){
                bullet = this._bulletLyfbPool.get();
            } else {
                bullet = cc.instantiate(this._bulletLyfbPrefab);
            }
        }

        if (bullet) {
            bullet.parent = this._bulletLayer;
            bullet.getComponent("Fish_Bullet").init(this, bulletInfo);
        }
    },

    explode(fishid, bulletid, aid, bulletType, pos, idx) {
        //爆炸特效
        let effect = null;
        let pool = null;
        if (bulletType == 1) {
            pool = this._netPool;
        } else if (bulletType == 2) {
            pool = this._boomPool;
        } else if (bulletType == 4) {
            pool = this._lyfbBoomPool;
        }
        if (pool.size() > 0) {
            effect = pool.get();
        } else {
            if (bulletType == 1) {
                effect = cc.instantiate(this._netPrefab);
            } else if (bulletType == 2){
                effect = cc.instantiate(this._boomPrefab);
            } else if (bulletType == 4) {
                effect = cc.instantiate(this._lyfbBoomPrefab);
            }
        }
        effect.setPosition(pos);
        this._effectLayer.addChild(effect);
        if (bulletType == 1) {
            effect.color = this.colors[idx];
            effect.runAction(cc.sequence(cc.scaleTo(0.1, 1.05), cc.scaleTo(0.1, 1), cc.delayTime(0.4), cc.callFunc((sender)=>{
                pool.put(sender);
            })));
        } else if (bulletType == 2) {
            effect.getComponent(cc.Animation).play("bullet_boom");
            effect.runAction(cc.sequence(cc.delayTime(0.6), cc.callFunc((sender)=>{
                pool.put(sender);
            })));
        } else if (bulletType == 4) {
            effect.getComponent(cc.Animation).play("lyfb_boom");
            effect.runAction(cc.sequence(cc.delayTime(0.6), cc.callFunc((sender)=>{
                pool.put(sender);
            })));
        }
        
        //爆炸音效
        //Global.playFishEffect("hw_b_bomb_"+bulletType);

        //发送catch信息
        if (bulletid > 0 && this._valid) {
            let msg = {c: MsgId.FISH_CATCH};
            msg.bid = bulletid;
            msg.aid = aid;
            msg.fids = [];
            msg.x = Math.floor(pos.x);
            msg.y = Math.floor(pos.y);

            if (bulletType == 2) { //渔网
                msg.fids.push(fishid);
            } else {
                msg.fids.push(fishid);
            }

            cc.vv.NetManager.send(msg, true);
        }
    },

});
