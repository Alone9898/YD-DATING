let NORMAL_CANNON_POS_Y = 20;
let SD_CANNON_POS_Y = 92;
let fishUtils = require("Fish_Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        atlas: cc.SpriteAtlas,
        fishIconAtlas: cc.SpriteAtlas,
        magicCannonAtlas: cc.SpriteAtlas,
        index: 0,
        pCannon: cc.Node,        // 炮台节点
        pLightning: cc.Node,     // 闪电
        pLightningTgt: cc.Node,  // 闪电目标
        spBg: cc.Sprite,         // 背景
        lblScore: cc.Label,      // 分数
        lblMultiple: cc.Label,   // 倍数
        pSDBase: cc.Node,        // 激光炮基
        spLockFish: cc.Sprite,   // 锁定鱼显示
        magicCannonLog: cc.Node,    // 技能炮图标
        pMagic: cc.Node,         // 技能炮节点
        pTimeBg: cc.Node,       //时间背景
        lblTime: cc.Label,
        charger: cc.Node,       // 充能器
        lyfbLog: cc.Prefab,     // 烈焰风暴

        _fishMgr: null,
        _fishCfg: null,
        _own: false,             // 是否自己
        _cannonType: 1,          // 炮台类型
        _cannonMultipleType: 0,  // 炮台倍数
        _cannonAngle: 0,         // 炮台角度
        _cannonPos: cc.v2(0, 0), // 炮台位置
        _lightningPos: cc.v2(0, 0),//闪电位置
        _lightningWorldPos: cc.v2(0, 0),//闪电位置
        _lockFish: null,         // 锁定鱼
        _lockFishId: -1,         // 锁定鱼ID
        _lockFishLockPoses: [],  // 锁定鱼锁定点
        _bulletSpeed: 0,         // 子弹速度
        _score: 0,               // 分数
        _multiple: 1,            // 倍数
        _autoLockInterval: 0.1, //自动锁定间隔
        _ionTimeElapse: 0,      //离子炮音效时间
        _autoFire: false,
        _autoLock: false,
        _lastCannonType: 1,
        _status: 0,             // 0:正常炮 >0:技能炮
        _magicCannon: null,     // 技能炮
        _magicCannonLeftTime:0, // 技能炮剩余时间
        _free: 0,           // 免费游戏 0:非免费游戏 1:免费射击阶段 2:免费结算阶段
        _waiting: true,
        _synscore: 0,    //同步分数
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._bulletSpeed = 1000;

        this._multiples = [10,20,30,50,80,100,200,500];
        this._multiple = this._multiples[0];
        this.lblMultiple.string = cc.vv.gameData.formatNumber(this._multiple);
        
        let addBtn = this.node.getChildByName("add_btn");
        if (addBtn) {
            addBtn.on('click', this.onMultipleAdd, this);
            addBtn.getComponent(cc.Button).interactable = false;
        }

        let subBtn = this.node.getChildByName("sub_btn");
        if (subBtn) {
            subBtn.on('click', this.onMultipleSub, this);
            subBtn.getComponent(cc.Button).interactable = false;
        }

        this._cannonPos = this.pCannon.getPosition();
        this._cannonAnim = this.pCannon.getComponent("cc.Animation");
        this._lightningPos = this.pLightning.getPosition();
        this._lightningWorldPos = this.pLightning.convertToWorldSpaceAR(cc.v2(0,128));
        this._chargerAnim = this.charger.getComponent("cc.Animation");

        Global.registerEvent("fish_dead", this.onFishDead, this);
        Global.registerEvent("lyfb_show_end", this.onLyfbShowEnd, this);
    },

    init(fishMgr, fishCfg) {
        this._fishMgr = fishMgr;
        this._fishCfg = fishCfg;
    },

    setOwn(own) {
        this._own = own;
        this.node.getChildByName("sub_btn").getComponent(cc.Button).interactable = own;
        this.node.getChildByName("add_btn").getComponent(cc.Button).interactable = own;
    },

    setAutoFire(autoFire) {
        this._autoFire = autoFire;
    },

    setAutoLock(autoLock) {
        if (this._free>0) return;
        this._autoLock = autoLock;
        if (autoLock) {
            this.setCannon(3);
        } else {
            this.clearLock();
        }
    },

    setWaiting(waiting) {
        cc.find("waiting", this.node).active = waiting;
        this._waiting = waiting;
        if (waiting) {
            this.setCannon(1);
            this.clearLock();
            this.setScore(0);
        }
    },

    setMutiples(mults) {
        this._multiples = mults;
        this._multiple = this._multiples[0];
        this.lblMultiple.string = cc.vv.gameData.formatNumber(this._multiple);
    },

    incSyncScore(val) {
        this._synscore += val;
    },

    getCannonAngle() {
        return this._cannonAngle;
    },

    // 清理锁定数据
    clearLock(delayTime) {
        this._lockFish = null;
        this._lockFishId = -1;
        this.pLightning.active = false;
        this.pLightningTgt.active = false;
        this.spLockFish.node.active = false;
        if (delayTime) {
            this._autoLockInterval = delayTime;
        }
    },

    onFishDead(data) {
        let fish = data.detail;
        if (this._lockFish && fish === this._lockFish.node) {
            this.clearLock();
        }
    },

    // 锁定鱼
    lockFish(fish) {
        if (this._status == 0 && this._cannonType == 3 && fish != this._lockFish) {
            this._lockFish = fish;
            this._lockFishId = this._lockFish._fishId;
            this.pLightning.active = true;
            this.pLightningTgt.active = true;
            let cfg = this._fishCfg.fishes[this._lockFish._fishTid];
            if (cfg) {
                this.spLockFish.node.active = true;
                this.spLockFish.spriteFrame = this.fishIconAtlas.getSpriteFrame(cfg.icon);
                this._lockFishLockPoses = cfg.lockposes;
            }
        }
    },

    // 金币是否足够
    sufficient() {
        return this._score >= this._multiple;
    },

    //开火
    fire(pos) {
        if (this._status != 0) return null;     // 技能炮状态

        if (this._free == 2) return null;       // 免费游戏结算阶段

        if (this._score < this._multiple) { //金币不足
            return null;
        }
        
        if (this._cannonType <= 2) {
            Global.playFishEffect("cannonfire"+this._cannonType);
        } else if (this._ionTimeElapse <= 0) {
            this._ionTimeElapse = 3;
            Global.playFishEffect("cannonfire"+this._cannonType);
        }
        
        if (pos && this._cannonType!=3) {
            this.setCannonDir(pos);
        }
        this.playFireAnim();
        
        if (this._cannonType == 3 && this._lockFish) {
            this._lockFish.onHit();
        }

        if (this._cannonType != 3 || this._lockFishId > 0) {
            let data = {
                idx: this.index,
                seat: 0,
                bid: 0,
                aid: 0,
                type: this._cannonType,
                multiple : this._multiple,
                angle: this._cannonAngle,
                pos: this.pCannon.convertToWorldSpaceAR(cc.v2(0,100)),
                speed: this._bulletSpeed,
                lockId: this._lockFishId,
            }
            return data;
        }
        return null;
    },

    //收到开火消息
    onRcvNetFire(msg, sound) {
        
        if (this._waiting) this.setWaiting(false);
        this.setCannon(msg.bt);
        this.setMutiple(msg.mul);
        if (this._free==0){
            if (this._synscore <= 0) this.setScore(msg.coin);
            else this.addScore(-msg.mul);
        }
        
        if (msg.bt == 3) {  //激光炮
            this.pCannon.angle = 0;
            this.pCannon.y = SD_CANNON_POS_Y;
            let fishNode = this._fishMgr.seekFish(msg.fid);
            if (fishNode) {
                this.lockFish(fishNode.getComponent("Fish_Fish"));
            }
        } else {
            let ang = msg.ang;
            if (this.index > 2) ang += Math.PI;
            this.pCannon.angle = -ang * cc.macro.DEG;
            this._cannonAngle = msg.ang;
            this.pCannon.y = NORMAL_CANNON_POS_Y;
            if (sound) {
                Global.playFishEffect("cannonfire"+this._cannonType);
                this.playFireAnim();
            }

            let data = {
                idx: this.index,
                seat: 0,
                bid: 0,
                aid: 0,
                type: msg.bt,
                multiple : msg.mul,
                angle: msg.ang,
                pos: this.pCannon.convertToWorldSpaceAR(cc.v2(0,100)),
                speed: this._bulletSpeed,
                lockId: msg.fid,
            }
            return data;
        }
    },

    playFireAnim() {
        if (this._cannonType != 3) {
            this.pCannon.stopAllActions();
            this.pCannon.position = this._cannonPos;
            let d = 20;
            if (this._cannonType == 2) d = 40;
            let ang = this._cannonAngle;
            if (this.index > 2) ang -= Math.PI;
            let dx = d*Math.sin(ang);
            let dy = d*Math.cos(ang);
            this.pCannon.runAction(cc.sequence(cc.moveBy(0.1, cc.v2(-dx,-dy)), cc.moveBy(0.1, cc.v2(dx,dy))));
        }
    },

    calcCannonAngle(pos) {
        pos = this.node.convertToNodeSpaceAR(pos);
        pos = cc.v2(pos.x, pos.y);
        let angle = this._cannonPos.signAngle(pos.sub(this._cannonPos));
        if (this.index > 2) angle += Math.PI;
        return angle;
    },

    // 设置炮台方向
    setCannonDir(pos) {
        pos = this.node.convertToNodeSpaceAR(pos);
        pos = cc.v2(pos.x, pos.y);
        let canPosV2 = cc.v2(this._cannonPos.x,this._cannonPos.y)
        this._cannonAngle = -canPosV2.signAngle(pos.sub(canPosV2));
        if (this._cannonType != 3) {
            this.pCannon.angle = -this._cannonAngle * cc.macro.DEG;
        }
        if (this.index > 2) this._cannonAngle = this._cannonAngle + Math.PI;
    },

    // 增加倍率
    onMultipleAdd() {
        if (!this._own) return;
        if (this._free>0) return;
        Global.playFishEffect("changebeili");
        this._cannonMultipleType += 1;
        if (this._cannonMultipleType >= this._multiples.length) this._cannonMultipleType = 0;
        this._multiple = this._multiples[this._cannonMultipleType];
        this.lblMultiple.string = cc.vv.gameData.formatNumber(this._multiple);
    },

    // 减少倍率
    onMultipleSub() {
        if (!this._own) return;
        if (this._free>0) return;
        Global.playFishEffect("changebeili");
        this._cannonMultipleType -= 1;
        if (this._cannonMultipleType < 0) this._cannonMultipleType = this._multiples.length-1;
        this._multiple = this._multiples[this._cannonMultipleType];
        this.lblMultiple.string = cc.vv.gameData.formatNumber(this._multiple);
    },

    changeCannon() {
        if (this._free>0) return;
        let cannonType = this._cannonType%2 + 1;
        if (this._cannonType == 3) {
            cannonType = this._lastCannonType;
        }
        this.setCannon(cannonType);
    },

    setCannon(cannonType) {
        if (this._cannonType != cannonType) {
            Global.playFishEffect("ChangeCannon");
            if (this._cannonType != 3) {
                this._lastCannonType = this._cannonType;
            }
            this._cannonType = cannonType;
            this._cannonAnim.play("cannon"+cannonType);
            
            if (this._cannonType == 3) {
                this.pCannon.angle = 0;
                this.pCannon.y = SD_CANNON_POS_Y;
                this.pSDBase.active = true;
                this._ionTimeElapse = 0;
                this._autoLockInterval = 0;
                this.charger.active = false;
            } else {
                this.pCannon.y = NORMAL_CANNON_POS_Y;
                this.pSDBase.active = false;
                this.clearLock();
                if (this._cannonType == 1 || this._cannonType == 2) {
                    this.charger.active = true;
                    this._chargerAnim.play("charger"+cannonType);
                } else {
                    this.charger.active = false;
                }
            }
        }
    },

    getCannonType() {
        return this._cannonType;
    },

    setScore(score) {
        if (this._score != score) {
            this._score = score;
            this.lblScore.string = Global.formatNumShort(this._score);
        }
    },

    addScore(score) {
        if (this._free>0) return;
        this._score += score;
        this.lblScore.string = Global.formatNumShort(this._score);
    },

    setMutiple(multiple) {
        if (this._multiple != multiple) {
            this._multiple = multiple;
            this.lblMultiple.string = cc.vv.gameData.formatNumber(this._multiple);
        }
    },

    getMultiple() {
        return this._multiple;
    },

    getFirePos() {
        return this.pCannon.convertToWorldSpaceAR(cc.v2(0,100));
    },

    getMagicFirePos() {
        let cannon = this.pMagic.getChildByName("cannon");
        return cannon.convertToWorldSpaceAR(cc.v2(0,80));
    },

    getCaptureImagePos() {
        return this.node.convertToWorldSpaceAR(cc.v2(0,100));
    },

    getStatus() {
        return this._status;
    },

    // 技能攻击
    magicFire(other, ang) {
        if (this._status==25 || this._status==26 && this.pTimeBg.active==true) { //钻头炮/电磁炮
            if (!other) {
                let data = {
                    boom: this._status,
                    pos: this.pCannon.convertToWorldSpaceAR(cc.v2(0,100)),
                    angle: this._cannonAngle,
                }
                Global.dispatchEvent("send_boom", data);
            }
            if (this._status==25) {
                let cannon = this.pMagic.getChildByName("cannon");
                cannon.getComponent(cc.Animation).stop();
                cannon.active = false;
            } else if (this._status==26) {
                let cannon = this.pMagic.getChildByName("cannon");
                if (!ang) {
                    cannon.angle = -this._cannonAngle * cc.macro.DEG;
                } else {
                    if (this.index > 2) ang += Math.PI;
                    cannon.angle = -ang * cc.macro.DEG;
                }
            }
            this.pMagic.getChildByName("box").active = false;

            this.pTimeBg.active = false;
            let delay = 5;
            if (this._status==25) delay = 8;
            this._status = -1; //防止重入

            this.magicCannonLog.stopAllActions();
            this.magicCannonLog.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(this.showNormalCannon.bind(this)))); //防止消息发送失败炮台无法恢复
        }
    },

    //显示技能炮(25:钻头炮 26:电磁炮 27:炸弹蟹 28:连锁闪电 29:旋风鱼, 30:烈焰风暴)
    showMagicCannon(tp, startpos_world) {
        if (this._status != 0) return false;

        let self = this;
        this._status = tp;
        this.clearLock();

        let logs = ["ZTPaoLog", "DCPaoLog", "ZDXLog", "BOSSSDLSLog", "BOSSXFYLog", "LYFBLog"];
        let posy = [26, 50, 8, -2, 14];
        let delay = 6;
        if (tp==25) delay = 18;
        if (tp==26) delay = 15;
        if (tp==27) delay = 8;
        this.magicCannonLog.active = true;
        this.magicCannonLog.stopAllActions();
        
        let bg = this.magicCannonLog.getChildByName("bg");
        bg.getComponent(cc.Sprite).spriteFrame = this.magicCannonAtlas.getSpriteFrame(logs[tp-25]);
        bg.stopAllActions();
        bg.y = 0;

        let lblMuti = bg.getChildByName("lblMuti");
        lblMuti.getComponent(cc.Label).string = cc.vv.gameData.formatNumber(this._multiple);
        lblMuti.y = posy[tp-25];

        let gainscore = this.magicCannonLog.getChildByName("gainscore");
        gainscore.active = false;
        
        this.magicCannonLog.runAction(cc.sequence(cc.scaleTo(0, 0.9), cc.scaleTo(0.5, 1), cc.delayTime(delay), cc.callFunc((sender=>{
            sender.active = false;
            if (self._status != 25 && self._status != 26) {
                self._status = 0;
            }
        }))));

        if (tp == 25 || tp == 26) {
            this.pMagic.active = true;
            let cannon = this.pMagic.getChildByName("cannon");
            cannon.active = true;
            cannon.angle = -0;
            let cannonAni = cannon.getComponent(cc.Animation);
            if (tp==25) cannonAni.play("cannon_zt");
            else if (tp==26) cannonAni.play("cannon_dc");

            this._magicCannonLeftTime = 11;
            
            let normalCannon = this.pCannon;
            let timeBg = this.pTimeBg;
            let box = this.pMagic.getChildByName("box")
            timeBg.active = false;
            box.active = false;
            cannon.position = cannon.parent.convertToNodeSpaceAR(startpos_world);
            cannon.setScale(1.5);
            cannon.runAction(cc.sequence(cc.moveTo(1,cc.v2(0,0)), cc.callFunc((sender)=>{
                normalCannon.active = false;
                timeBg.active = true;
                if (tp==26) box.active = true;
                sender.setScale(1);
            })));
        }

        return true;
    },

    showGainScoreWithDalay(score, delay) {
        this.node.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(()=>{
            this.showGainScore(score);
        })));
    },

    showGainScore(score) {
        if (score<=0 || this._status==0) return;
        if (this.magicCannonLog.active == false) return;

        this.incSyncScore(1);
        let gainscore = this.magicCannonLog.getChildByName("gainscore");
        gainscore.active = true;
        let len = cc.vv.gameData.formatNumber(score).length;
        gainscore.getChildByName("bg1").x = -len*42/2;
        gainscore.getChildByName("bg2").x = len*42/2;

        let bg = this.magicCannonLog.getChildByName("bg");
        bg.runAction(cc.moveBy(1, cc.v2(0, 40)));

        this.magicCannonLog.stopAllActions();  //先停掉恢复炮台的操作，改由分数翻滚后恢复

        let lblGainScore = gainscore.getChildByName("text_gainscore");
        lblGainScore.getComponent("HWFish918_RollNumber").show(this, score, true, {score:score});
    },

    onRollOver(param) {
        this.incSyncScore(-1);
        this.addScore(param.score);
        this.showNormalCannon();
    },

    showNormalCannon() {
        this.magicCannonLog.stopAllActions();
        this.magicCannonLog.active = false;
        this._magicCannonLeftTime = 0;
        let cannonAni = this.pMagic.getChildByName("cannon").getComponent(cc.Animation);
        cannonAni.stop();
        this.pMagic.active = false;

        this.pCannon.active = true;
        this._status = 0;
    },

    showLyfbStart(mul, duration) {
        let lyfb = this.node.getChildByName("hw918_lyfb_log");
        if (!lyfb){
            lyfb = cc.instantiate(this.lyfbLog);
            this.node.addChild(lyfb);
        }
        lyfb.position = cc.v2(-164, 96);
        lyfb.getComponent("HWFish918_LYFBLog").init(mul, duration, this.index);

        this.clearLock();
        this._free = 1;
        this._lastCannonType = this._cannonType;
        this.setCannon(4);
    },

    showLyfbScore(score, extmul, totalscore) {
        let lyfb = this.node.getChildByName("hw918_lyfb_log");
        if (lyfb) {
            lyfb.position = cc.v2(0, 160);
            lyfb.getComponent("HWFish918_LYFBLog").showScore(score, extmul, totalscore);
            this._free = 2;
        }
    },

    onLyfbShowEnd(data) {
        if (data.detail == this.index) {
            this._free = 0;
            this.setCannon(this._lastCannonType);
        }
    },

    update(dt) {
        if (this._magicCannonLeftTime > 0) {    // 技能炮
            this._magicCannonLeftTime -= dt;
            this.lblTime.string = Math.round(this._magicCannonLeftTime);
            if (this._magicCannonLeftTime <= 0) {
                this.magicFire();
            }
            return;
        }

        if (this._cannonType == 3) {
            this._ionTimeElapse -= dt;
            this._autoLockInterval -= dt;
            if (this._autoLockInterval < 0) {
                this._autoLockInterval = 0.1;

                if (this._lockFish && this._lockFish.isInScreen()) {
                    //let pos = this._lockFish.getPos();
                    let pos = fishUtils. getLockPos(this._lightningWorldPos, this._lockFish.node, this._lockFishLockPoses);
                    pos = this.node.convertToNodeSpaceAR(pos);
                    pos = cc.v2(pos.x, pos.y)
                    let lightingV2 = cc.v2(this._lightningPos.x,this._lightningPos.y)
                    let angle = lightingV2.signAngle(pos.sub(lightingV2));
                    this.pLightning.angle = angle * cc.macro.DEG;
                    this.pLightningTgt.position = pos;
                    let len = pos.sub(this._lightningPos).mag();
                    this.pLightning.scaleY = len/250;
                } else if (this._own && this.sufficient() && this._autoFire) {
                    let fishNode = this._fishMgr.findLargestFish();
                    if (fishNode) {
                        this.lockFish(fishNode.getComponent("Fish_Fish"));
                    } else {
                        this.clearLock();
                    }
                } else {
                    this.clearLock();
                }
            }
        }
    },
});
