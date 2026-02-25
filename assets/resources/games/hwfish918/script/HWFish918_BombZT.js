//钻头炮爆炸效果

let fishUtils = require("Fish_Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        sfTrailing: cc.SpriteFrame,
        sfQuan: cc.SpriteFrame,
        sfHot: cc.SpriteFrame,
        _speed: 1000,            // 子弹速度每秒
        _seat: 0,               // 哪个玩家的子弹
        _dx: 0,
        _dy: 0,
        _life: 8,
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init(data)
    {
        this._seat = data.seat;
        this._speed = data.speed;
        this.node.position = this.node.parent.convertToNodeSpaceAR(data.pos);
        this.node.angle = -data.angle * cc.macro.DEG;
        this._dx = this._speed * Math.sin(data.angle);
        this._dy = this._speed * Math.cos(data.angle);
        this._life = Global.random(8, 10);
        this._updatePos = true;
        this._fishids = [];
        this._positions = [];
        for (let i=0;i<data.fishids.length;i++) {
            this._fishids.push(data.fishids[i]);
            this._positions.push(data.positions[i]);
        }
        this._lastPos = this.node.position;
    },

    createTrailing(pos, lastPos, rot) {
        let trail = new cc.Node();
        trail.parent =  this.node.parent;
        trail.addComponent(cc.Sprite).spriteFrame = this.sfTrailing;
        trail.setAnchorPoint(cc.v2(0.5, 1));
        trail.position = pos;
        trail.angle = -rot;
        trail.runAction(cc.sequence(cc.delayTime(0.5), cc.fadeOut(0.5), cc.callFunc((sender)=>{
            sender.destroy();
        })));

        let cnt = 0;
        for (let i=this._fishids.length-1; i>=0; i--) {
            if (fishUtils.getDistanceToSegment(this._positions[i], lastPos, pos) < 50) {
                Global.dispatchEvent("kill_fish", this._fishids[i]);
                cnt += 1;
                this._fishids.splice(i, 1);
                this._positions.splice(i, 1);
            }
        };

        if (cnt > 0) {
            let cnt = Global.random(1, 3);
            for (let i=0; i<cnt; i++) {
                let quan = new cc.Node();
                quan.parent = trail;
                quan.addComponent(cc.Sprite).spriteFrame = this.sfQuan;
                quan.position = cc.v2(0, (i-(cnt-1)/2)*128-450);
                quan.runAction(cc.sequence(cc.delayTime(i*0.1), cc.spawn(cc.scaleTo(0.4, 0.6), cc.fadeTo(0.4, 96)), cc.fadeOut(0)));
            }
        }
    },

    boom() {
        let head = this.node.getChildByName("head");
        let trail = this.node.getChildByName("trailing1");
        let particle = this.node.getChildByName("particle");

        head.getComponent(cc.Sprite).spriteFrame = this.sfHot;
        trail.active = false;
        this.node.runAction(cc.sequence(cc.spawn(cc.moveTo(1,cc.v2(0,0)),cc.rotateBy(1,90)),
            cc.scaleTo(0.2,1.5),
            cc.scaleTo(0.05,1),
            cc.callFunc((sender)=>{
                head.active = false;
                particle.getComponent(cc.ParticleSystem).resetSystem();
            }),
            cc.delayTime(2),
            cc.callFunc((sender)=>{
                sender.destroy();
            })));
    },

    update (dt) {
        if (this._life < 0) {
            return;
        }

        this.node.x += dt * this._dx;
        this.node.y += dt * this._dy;
        let width = cc.winSize.width;
        let height = cc.winSize.height;

        let changeDir = true;
        let rot = -this.node.angle;
        let pos = this.node.position;
        if (pos.x < -width/2) {
            this.node.angle = rot;
            this.node.x = -width/2;
        } else if(pos.x > width/2) {
            this.node.angle = rot;
            this.node.x = width/2;
        } else if(pos.y < -height/2) {
            this.node.angle = -(180-rot);
            this.node.y = -height/2;
        } else if(pos.y > height/2) {
            this.node.angle = -(180-rot);
            this.node.y = height/2;
        } else {
            changeDir = false;
        }
        if (changeDir) {
            Global.playFishEffect("FlashMove1");

            this._dx = this._speed * Math.sin(-this.node.angle / 180 * Math.PI);
            this._dy = this._speed * Math.cos(-this.node.angle / 180 * Math.PI);
            this._life -= 1;
            if (this._life >= 0) {
                this.createTrailing(pos, this._lastPos, rot);
            } else {
                this.boom();
            }
            this._lastPos = pos;
        }
     },
});
