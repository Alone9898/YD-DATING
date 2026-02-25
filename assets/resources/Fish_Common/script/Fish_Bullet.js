cc.Class({
    extends: cc.Component,

    properties: {

        bulletAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        _bulletMgr: null,
        _bulletid: 0,
        _aid: 0,
        _speed: 1000,            // 子弹速度每秒
        _seat: 0,               // 哪个玩家的子弹
        _type: 0,                // 子弹类型
        _multiple: 1,            // 子弹倍率
        _isMove: true,           // 是否移动
        _lockFishId: -1,        // 锁定鱼编号
        _dx: 0,
        _dy: 0,
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init(bulletMgr, data)
    {
        this._bulletMgr = bulletMgr;
        this._bulletid = data.bid;
        this._aid = data.aid;
        this._idx = data.idx;
        this._seat = data.seat;
        this._speed = data.speed;
        this._type = data.type;
        this._multiple = data.multiple;
        let spr = this.node.getComponent(cc.Sprite);
        if (!spr){
            let bg = this.node.getChildByName("bg");
            if (bg) spr = bg.getComponent(cc.Sprite);
        }
        if (spr) spr.spriteFrame = this.bulletAltas.getSpriteFrame(data.spr);
        this.node.position = this.node.parent.convertToNodeSpaceAR(data.pos);
        this.node.angle = -data.angle * 180 / Math.PI;
        
        this._dx = this._speed * Math.sin(-this.node.angle / 180 * Math.PI);
        this._dy = this._speed * Math.cos(-this.node.angle / 180 * Math.PI);
        this._isMove = true;
        this.node.active = true;
        this._lockFishId = data.lockId;
        this.node.getComponent(cc.BoxCollider).enabled = true;
    },

    // 碰撞
    onCollisionEnter: function (other, self)
    {
        let bullet = self.node.getComponent("Fish_Bullet");
        let lockId = bullet._lockFishId;
        let otherid = other.node._id;
        if (lockId<=0 || lockId==otherid) {
            bullet.explode(otherid);

            let fish = other.node.getComponent("Fish_Fish");
            if (fish) {
                fish.onHit();
            }
        }
    },

    explode (fishid) {
        //爆炸特效
        this.node.active = false;
        this._isMove = false;
        this._bulletMgr.putBulletPool(this.node, this._type);
        this._bulletMgr.explode(fishid, this._bulletid, this._aid, this._type, this.node.position, this._idx, this._lockFishId);
    },

    update (dt) {
        if(!this._isMove) return;
        let p = this.node.position;
        p.x += dt * this._dx;
        p.y += dt * this._dy;
        
        //拉伸的适配方式，节点尺寸更准确
        let win_w = cc.winSize.width
        let win_h = cc.winSize.height
        let width = this.node.parent.width;
        let height = this.node.parent.height;

        let changeDir = true;
        if (p.x < -width/2) {
            this.node.angle = -this.node.angle;
            p.x = -width/2;
        } else if(p.x > width/2) {
            this.node.angle = -this.node.angle;
            p.x = width/2;
        } else if(p.y < -height/2) {
            this.node.angle = -(180+this.node.angle);
            p.y = -height/2;
        } else if(p.y > height/2) {
            this.node.angle = -(180+this.node.angle);
            p.y = height/2;
        } else {
            changeDir = false;
        }
        this.node.position = p;
        if (changeDir) {
            this._dx = this._speed * Math.sin(-this.node.angle / 180 * Math.PI);
            this._dy = this._speed * Math.cos(-this.node.angle / 180 * Math.PI);
            this._lockFishId = -1;
        }
     },
});
