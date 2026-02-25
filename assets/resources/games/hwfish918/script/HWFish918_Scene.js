
cc.Class({
    extends: cc.Component,

    properties: {
        bulletPrefab: {
            default: null,
            type: cc.Prefab,
        },
        goldCoinPref: cc.Prefab,
        goldTextPref: cc.Prefab,
        goldBoomPref: cc.Prefab,
        bulletNetPrefab: cc.Prefab,
        bulletLyfbPrefab: cc.Prefab,
        bulletBoomPrefab: cc.Prefab,
        lyfbBoomPrefab: cc.Prefab,
        captureBossPrefab: cc.Prefab,
        captureBigFishPrefab: cc.Prefab,
        captureBwjPrefab: cc.Prefab,
        bombZTPrefab: cc.Prefab,
        bombDCPrefab: cc.Prefab,
        bombZDPrefab: cc.Prefab,
        bombLSPrefab: cc.Prefab,
        bombXFPrefab: cc.Prefab,
        dragonPrafab: cc.Prefab,

        _gameid: 32,
        _isPress: false,
        _time: 0,
        _lastFireTime: 0,
        _firePos: cc.v2(0, 0),
        _isAutoFire: false,      // 自动开火
        _isAutoLock: false,      // 自动锁定
        _fireSpeed: 1,
        _lockFishNode: null,     // 锁定鱼动画
        _bulletMgr: null,
        _fishMgr: null,
        _mapMgr: null,
        _fishCfg: null,
        _players: [],
        _seat: 1,
        _bulletid: 0,
        _boomid: 0, //保存炸弹ID
        _sceneid: 1,
        _effectLayer: null,
        _selected: false,
        _fishLayer: null,
        _pauseTime: 0,
        _changeRoom: false,
    },

    // LIFE-CYCLE CALLBACKS:

    TB_FixShow : function(node){
        if(!node){
            return
        }
        var canvasNode = cc.find('Canvas');
        var canvas = canvasNode.getComponent(cc.Canvas);
        
        var frameWidth = canvasNode.width;
        var frameHeight = canvasNode.height;
        var designWidth = canvas.designResolution.width;
        var designHeight = canvas.designResolution.height;
        if ((frameWidth/frameHeight) < (designWidth/designHeight)) { //按照宽来适配
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
        else { //按照高来适配
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }
    
        var winSize = cc.winSize;
        node.scaleX = winSize.width/node.width;
        node.scaleY = winSize.height/node.height;
    
    },
    

    onLoad() {
        cc.game.setFrameRate(30);
        // if (Global.isIOS() && Global.appId == Global.APPID.Poly)
        //     cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.SHOW_ALL);
        // else
        //     cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.EXACT_FIT);
        let root = this.node.getChildByName('root')
        this.TB_FixShow(root)

        // Global.autoAdaptDevices(false);


        Global.playFishMusic = function(fn) {
            cc.vv.AudioManager.playBgm("games/hwfish918/", fn, true);
        };
        Global.playFishEffect = function(fn) {
            cc.vv.AudioManager.playEff("games/hwfish918/", fn, true);
        };
        Global.stopFishEffect = function(fn) {
            cc.vv.AudioManager.stopEffectByName("games/hwfish918/audio/"+fn);
        }

        this._rootNode = cc.find("root", this.node);

        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{
            this.setFirePos(event);
            this._isPress = true;
            let player = this._players[this._seat];
            if (player.getStatus() == 0) {
                if (this._isAutoLock) {
                    let fishNode = this._fishMgr.onTouchFish(this._firePos);
                    if (fishNode) {
                        player.lockFish(fishNode.getComponent("Fish_Fish"));
                    }
                } else {
                    if (!player.sufficient()) {
                        //钱不够，弹出充值
                        // cc.vv.FloatTip.show(cc.vv.Language.coins_lack);
                        cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COIN_POP_UI);
                        Global.playFishEffect("GoldNotEnough");
                    } else if (this._time > this._lastFireTime + this._fireSpeed) {
                           this.fire();
                    }
                }
            } else {
                player.magicFire();
            }
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event)=>{
            this.setFirePos(event);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{
            this._isPress = false;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event)=>{
            this._isPress = false;
        }, this);

        let fishCfg = require("HWFish918_ResCfg");
        this._fishCfg = fishCfg;

        this._bulletMgr = this._rootNode.addComponent("HWFish918_BulletMgr");
        this._bulletMgr.init(this.bulletPrefab, this.bulletLyfbPrefab, this.bulletNetPrefab, this.bulletBoomPrefab, this.lyfbBoomPrefab, fishCfg.bullets);
        
        this._fishMgr = this._rootNode.addComponent("Fish_FishMgr");
        this._fishMgr.init(fishCfg);

        this._coinMgr = this._rootNode.addComponent("HWFish918_CoinMgr");
        this._coinMgr.init(this.goldCoinPref, this.goldTextPref, this.goldBoomPref);

        this._mapMgr = this._rootNode.getComponent("HWFish918_MapMgr");

        for (let i=1; i<=4; ++i) {
            let playerNode = cc.find("ui/players_node/player"+i, this._rootNode);
            this._players[i] = playerNode.getComponent("HWFish918_Player");
            this._players[i].init(this._fishMgr, fishCfg);
        }

        let autoFireBtn = cc.find("ui/control_node/btn_auto", this._rootNode);
        Global.btnClickEvent(autoFireBtn, this.onAutoFire, this);

        let changeCannonBtn = cc.find("ui/control_node/btn_change", this._rootNode);
        Global.btnClickEvent(changeCannonBtn, this.onChangeCannon, this);

        let autoLockBtn = cc.find("ui/control_node/btn_lock", this._rootNode);
        Global.btnClickEvent(autoLockBtn, this.onAutoLock, this);

        this._effectLayer = cc.find("effect_layer", this._rootNode);
        this._fishLayer = cc.find("fish_layer", this._rootNode);
        this._fireSpeed = 0.3;
        this._firePos = cc.v2(1136/2, 640/2);

        this.initEvent();
    },

    onDestroy() {
        this.unregisterMsg();
        // cc.loader.releaseResDir("games/hwfish918");
        cc.game.setFrameRate(60);
    },

    start() {
        let roomData = null;
        if (cc.vv.gameData) {
            roomData = cc.vv.gameData.getRoomData()
            this._gameid = roomData.gameid;
        }

        if (roomData && roomData.sceneid) { //已经选择了场次
            this.initRoomData(roomData);
        } else {
            this.initSelectRoom();
        }
        Global.playFishMusic("bg_music/bg0");
        
        // let oct = this._fishMgr.createFish(23, 1000000, 0, [cc.v2(0,0), cc.v2(0,-200), cc.v2(0, 300), cc.v2(300,300)]);
        // oct.removeFromParent();
        // cc.find("bg_layer/bg1/fish_layer", this._rootNode).addChild(oct);
        // this._mapMgr.showMap(1);
        // this._mapMgr.showBossCome(1)
	
        this.registerMsg();
    },

    onEnable() {
        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable() {
        cc.director.getCollisionManager().enabled = false;
    },

    update(dt) {
        this._pauseTime -= dt;
        this._time += dt;
        if (this._isPress || this._isAutoFire || this._isAutoLock) {
            if (this._time > this._lastFireTime + this._fireSpeed) {
                if (this._isPress || this._fishMgr.fishCount()>0) {
                    this.fire();
                }
            }
        }
    },

    initSelectRoom() {
        this._selected = true;
        let select = cc.find("select", this._rootNode);
        select.active = true;
        let unlocklevel = [1, 30, 200, 2000];
        let lv = cc.vv.UserManager.getCurLv();
        for (let i=0; i<4; i++) {
            let btn = cc.find("btn_"+i, select);
            let unlocked = (lv >= unlocklevel[i]);
            btn.getChildByName("locker").active = !unlocked;
            btn.getComponent(cc.Button).interactable = unlocked;
            Global.btnClickEvent(btn, this.onBtnSess, this);
        }
        let btnBack = cc.find("btn_back", select);
        Global.btnClickEvent(btnBack, this.onBtnBack, this);
    },

    initRoomData(roomData, switchMap) {
        cc.find("select", this._rootNode).active = false;
        this._bulletMgr.setValid(true);
        this._pauseTime = 0;

        cc.log("roomData", roomData);
        for (let i=1; i<=4; i++) {
            this._players[i].setWaiting(true);
        }
        for (let i=0; i < roomData.users.length; i++) {
            let user = roomData.users[i];
            if (user.uid == Global.playerData.uid) {
                this._seat = user.seat;
            }
            this._players[user.seat].setWaiting(false);
            this._players[user.seat].setScore(user.coin);
            if (user.mults) {
                this._players[user.seat].setMutiples(user.mults);
            } 
        }
        for (let i=1; i<=4; i++) {
            this._players[i].setOwn(i==this._seat);
        }
        let rot = 0;
        if (this._seat >= 3)
            rot = 180;
        cc.find("fish_layer", this._rootNode).angle = -rot;
        cc.find("bullet_layer", this._rootNode).angle = -rot;
        cc.find("effect_layer", this._rootNode).angle = -rot;
        cc.find("coin_layer", this._rootNode).angle = -rot;
        cc.find("text_layer", this._rootNode).angle = -rot;
        cc.find("ui/players_node", this._rootNode).angle = -rot;
        this._coinMgr.setRot(rot);

        let sceneid = roomData.sceneid;
        this._sceneid = sceneid;
        if (switchMap) this._mapMgr.switchMap(sceneid);
        else this._mapMgr.showMap(sceneid);
        
        Global.playFishMusic("bg_music/bg"+(sceneid-1));

        // this.showPlayerLevel();
    },

    // showPlayerLevel(){
    //     let isLeft = this._seat == 1; //玩家自己是否在左边
    //     let left = cc.find("ui/level_node_left", this._rootNode);
    //     left.active = isLeft;
    //     let right = cc.find("ui/level_node_right", this._rootNode);
    //     right.active = !isLeft;

    //     let levelNode = isLeft?left:right;
    //     let lvProgress = cc.find("node_level/pro_exp", levelNode);
    //     lvProgress.getComponent(cc.ProgressBar).progress = Math.min(1,cc.vv.UserManager.getCurExp()/cc.vv.UserManager.getUpdateExp());
    //     cc.find("node_level/lbl_level", levelNode).getComponent(cc.Label).string = Global.playerData.level;

    //     cc.find("level_up_tips",levelNode).active = false;

    //     Global.btnClickEvent(cc.find('node_level',levelNode), ()=>{
    //         let tips = cc.find("level_up_tips",levelNode);
    //         tips.active = !tips.active;
    //         if (tips.active) {
    //             let script = tips.getComponent('level_up_tips')
    //             let expNeed = cc.vv.UserManager.getUpdateExp() - cc.vv.UserManager.getCurExp()
    //             let nextReward = cc.vv.UserManager.getNextLvReward()
    //             script.setUIData(expNeed,nextReward)
    //         }
    //     },this);
    // },

    initEvent(){
        Global.registerEvent("auto_lock", this.onAutoLock, this);
        Global.registerEvent("show_library", this.onShowLibrary, this);
        Global.registerEvent("send_boom", this.onSendBoom, this);
        Global.registerEvent("fish_exit", this.onFishExit, this);
        Global.registerEvent("kill_fish", this.onKillFish, this);
        Global.registerEvent("add_score", this.onAddScore, this);
    },

    onBtnSess(event) {
        let name = event.target.name;
        let sessid = 0;
        let basescore = [1000,100000,1000000,10000000];
        if (name == "btn_0") sessid = 0;
        else if (name == "btn_1")  sessid = 1;
        else if (name == "btn_2")  sessid = 2;
        else if (name == "btn_3")  sessid = 3;
        for (let i=1; i<=4; i++) {
            this._players[i].setMutiple(basescore[sessid]);
        }

        cc.vv.GameManager.sendEnterGameReq(this._gameid, sessid);
    },

    onBtnBack(event) {
        cc.vv.EventManager.emit(EventId.ENTER_HALL);
    },

    // 自动开火
    onAutoFire(event) {
        // if (!this.st) {
        //     this.st = 0;
        // }
        // this.st += 1;
        // if (this.st > 4) this.st = 1;
        // let ang = this._players[this.st].getCannonAngle();
        // let pos = this._players[this.st].getFirePos();
        // this.playMagicBoomEffect(26, this.st, pos, ang);
        // return;

        //this.playMagicBoomEffect28([cc.v2(-256,-128),cc.v2(256,-128),cc.v2(256,128),cc.v2(-256,128)]);
        //return;

        //this.playMagicBoomEffect29(Global.random(5,10), this.st, cc.v2(0, 0));
        //this.showCaptureBoss(Global.random(1,3), Global.random(21,24), 89.99, cc.v2(0,0));
        //this.showCaptureBigFish(Global.random(1,3), Global.random(14,19), 90.00, cc.v2(0,0));
        //return;
        // let pos = this._fishLayer.convertToWorldSpaceAR(cc.v2(0,0));
        // this._players[this.st].showMagicCannon(Global.random(25,29), cc.v2(cc.winSize.width/2, cc.winSize.height/2));
        // return;
        //this._players[this._seat]._status = 1;
        //this._players[this._seat].magicCannonLog.active = true;
        //this._players[this._seat].showGainScoreWithDalay(90.00, 3);
        //this._players[this._seat].showLyfbScore(123.44, 1.21, 145.66);
        //return;
        
        this.setAutoFire(!this._isAutoFire);
    },

    setAutoFire(flag) {
        if (this._isAutoFire != flag) {
            this._isAutoFire = flag;
            this._players[this._seat].setAutoFire(flag);

            let img = cc.find("ui/control_node/btn_auto/img_flag", this._rootNode);
            img.active = flag;
        }
    },

    // 自动锁定
    onAutoLock(event) {
        this.setAutoLock(!this._isAutoLock);
    },

    setAutoLock(flag) {
        if (this._isAutoLock != flag) {
            this._isAutoLock = flag;
            this._players[this._seat].setAutoLock(flag);
            if (!flag) {
                this._players[this._seat].changeCannon();
            }
            this.adjustCannonSpeed();

            let img = cc.find("ui/control_node/btn_lock/img_flag", this._rootNode);
            img.active = flag;
        }
    },

    //显示Library
    onShowLibrary(data) {
        cc.find("ui/help_node", this._rootNode).active = true;
    },

    //退出
    onFishExit(data) {
        var msg = {c: MsgId.FISH_EXIT};
        cc.vv.NetManager.send(msg);
        this._bulletMgr.setValid(false);
        this.setAutoFire(false);
        this.setAutoLock(false);
    },

    //发送炸弹
    onSendBoom(data) {
        let boom = data.detail.boom;
        let fishides = this._fishMgr.findFishIdInRange(cc.v2(0, 0), 400, 12, 16);

        //发送爆炸信息
        let msgToSend = {c: MsgId.FISH_BOOM};
        msgToSend.boomid = this._boomid;
        msgToSend.fids = fishides;
        msgToSend.x = data.detail.pos.x;
        msgToSend.y = data.detail.pos.y;
        msgToSend.ang = data.detail.angle;
        cc.vv.NetManager.send(msgToSend, true);

        this._boomid = 0;
    },

    //击杀鱼
    onKillFish(data) {
        let fishNode = this._fishMgr.seekFish(data.detail);
        if (fishNode) {
            fishNode.getComponent("Fish_Fish").onDead();
        }
    },

    //增加分数
    onAddScore(data) {
        if (data.detail && data.detail.seat && data.detail.score) {
            let player = this._players[data.detail.seat];
            player.incSyncScore(-1);    //恢复同步分数
            player.addScore(data.detail.score);
        }
    },

    //切换炮台
    onChangeCannon(event) {
        this.setAutoLock(false);
        this._players[this._seat].changeCannon();
        this.adjustCannonSpeed();
    },

    adjustCannonSpeed() {
        let cannonType = this._players[this._seat].getCannonType();
        if (cannonType == 1) {  //网格炮
            this._fireSpeed = 0.3;
        } else if (cannonType == 4) { //火球
            this._fireSpeed = 0.25;
        } else {
            this._fireSpeed = 0.2;
        }
    },

    setFirePos(event) {
        var touches = event.getTouches();
        var p = touches[0].getLocation();
        this._firePos = p;
        this._players[this._seat].setCannonDir(p);
    },

    fire() {
        if (this._pauseTime > 0) return;
        if (!cc.vv.NetManager.isConnect()) {
            return;
        }
        let player = this._players[this._seat];
        if (!player.sufficient()) {
            this.setAutoFire(false);
            this.setAutoLock(false);
            return;
        }

        this._lastFireTime = this._time;
        let bulletInfo = player.fire(this._firePos);
        if (bulletInfo) {
            player.addScore(-bulletInfo.multiple);

            let bulletid = (this._bulletid * 10) + this._seat;  //生成自己的子弹ID
            this._bulletid += 1;
            if (this._bulletid > 1000) {
                this._bulletid = 0;
            }
            bulletInfo.bid = bulletid;
            this._bulletMgr.fire(bulletInfo);

            //发送子弹消息
            let msg = {c: MsgId.FISH_FIRE};
            msg.bid = bulletid;
            msg.bt = bulletInfo.type;
            msg.ang = bulletInfo.angle;
            msg.mul = bulletInfo.multiple;
            msg.fid = bulletInfo.lockId;
            cc.vv.NetManager.send(msg, true);
        }
    },

    playCaptureSound(tid) {
        let snd = "";
        if (tid >= 9 && tid < 20) snd = "SRJ"+Global.random(1,3);
        else if (tid == 20) snd = "hw_f_die_dragon";
        else if (tid == 21) snd = "hw_f_die_px";
        else if (tid == 22) snd = "hw_f_die_dly";
        else if (tid == 23) snd = "hw_f_die_zy";
        else if (tid == 24) snd = "hw_f_die_ey";
        else if (tid == 25) snd = "ZTP";
        else if (tid == 26) snd = "DCPaosnd"+Global.random(1,2);
        else if (tid == 27) snd = "ZDX"+Global.random(1,3);
        else if (tid == 28) snd = "SDLS";
        else if (tid == 29) snd = "XFY";
        else if (tid == 30) snd = "BOSSGetScoreEnd";

        if (snd != "") {
            Global.playFishEffect(snd);
        }
    },

    showDragonEffect(fid, trace) {
        let dragon = cc.instantiate(this.dragonPrafab);
        //引擎升级，setTag已经移除
        // dragon.setTag(-fid);
        dragon.name = '' + (-fid)
        this._fishLayer.addChild(dragon);
        if (trace[0].x < -1) {
            dragon.angle = -180;
        } else if (trace[0].x > 1) {
            dragon.angle = -0;
        } else if (trace[0].y > 1) {
            dragon.angle = 90;
        } else {
            dragon.angle = -90;
        }
        dragon.runAction(cc.sequence(cc.delayTime(9.5), cc.callFunc((sender)=>{sender.destroy()})));
    },

    showCaptureBoss(seat, fishTid, score, startPos) {
        this._players[seat].incSyncScore(1);    //暂停同步分数
        let layer = cc.find("ui/players_node", this._rootNode);
        let playerNode = this._players[seat].node;
        let endPos = playerNode.convertToWorldSpaceAR(cc.v2(0,180));
        endPos = layer.convertToNodeSpaceAR(endPos);

        let capture = cc.instantiate(this.captureBossPrefab);
        capture.angle = playerNode.angle;
        layer.addChild(capture);
        capture.getComponent("HWFish918_CaptureBoss").show(seat, fishTid, score, startPos, endPos);
    },

    showCaptureBigFish(seat, fishTid, score, startPos) {
        this._players[seat].incSyncScore(1);    //暂停同步分数
        let layer = cc.find("ui/players_node", this._rootNode);
        let playerNode = this._players[seat].node;
        let endPos = playerNode.convertToWorldSpaceAR(cc.v2(0,100));
        endPos = layer.convertToNodeSpaceAR(endPos);
        if (fishTid == 19) {    //霸王鲸
            let bwj = cc.instantiate(this.captureBwjPrefab);
            bwj.angle = playerNode.angle;
            bwj.setPosition(endPos);
            bwj.setScale(0.5);
            layer.addChild(bwj);
            bwj.runAction(cc.sequence(cc.scaleTo(0.5, 1), cc.delayTime(2), cc.destroySelf()));
        }
        let capture = cc.instantiate(this.captureBigFishPrefab);
        capture.angle = playerNode.angle;
        layer.addChild(capture);
        capture.getComponent("HWFish918_CaptureBigFish").show(seat, fishTid, score, startPos, endPos);
    },


    shake() {
        let node = this._rootNode;
        let time = 1.0;
        let originPos = cc.v2(0,0);
        let duration = 0.04;
        let offset = 16;
        let originScale = cc.v2()
        this._rootNode.getScale(originScale)
        // 一个震动耗时4个duration左,复位,右,复位
        // 同时左右和上下震动
        let times = Math.floor(time / (duration * 4));
        let moveLeft = cc.moveBy(duration, cc.v2(-offset, 0));
        let moveLReset = cc.moveBy(duration, cc.v2(offset, 0));
        let moveRight = cc.moveBy(duration, cc.v2(offset, 0));
        let moveRReset = cc.moveBy(duration, cc.v2(-offset, 0));
        let horSeq = cc.sequence(moveLeft, moveLReset, moveRight, moveRReset);
        let moveUp = cc.moveBy(duration, cc.v2(0, offset));
        let moveUReset = cc.moveBy(duration, cc.v2(0, -offset));
        let moveDown = cc.moveBy(duration, cc.v2(0, -offset));
        let moveDReset = cc.moveBy(duration, cc.v2(0, offset));
        let verSeq = cc.sequence(moveUp, moveUReset, moveDown, moveDReset);

        node.runAction(cc.sequence(cc.scaleTo(duration,originScale.x + 0.025,originScale.y + 0.025), cc.repeat(cc.spawn(horSeq, verSeq), times), cc.scaleTo(duration,originScale.x,originScale.y), cc.callFunc(()=>{
            node.setPosition(originPos);
            node.setScale(originScale)
        })));
    },

    // 技能鱼特效 25:钻头炮 26:电磁炮 27:炸弹蟹
    playMagicBoomEffect(ft, seat, startPos, ang, fids, poses, count) {
        if (ft==25) {   //钻头炮
            let zt = cc.instantiate(this.bombZTPrefab);
            this._effectLayer.addChild(zt);
            let data = {seat: seat,
                        speed: 1600,
                        angle: ang,
                        pos: startPos,
                        fishids: fids,
                        positions: poses};
            zt.getComponent("HWFish918_BombZT").init(data);
        } else if (ft == 26) {  //电磁炮
            let dc = cc.instantiate(this.bombDCPrefab);
            this._effectLayer.addChild(dc);
            let data = {angle: ang,
                        pos: startPos};
            dc.getComponent("HWFish918_BombDC").init(data);
        } else if (ft == 27) {  //炸弹蟹
            let zd = cc.instantiate(this.bombZDPrefab);
            this._effectLayer.addChild(zd);
            let data = {seat: seat,
                        pos: startPos,
                        count: count};
            zd.getComponent("HWFish918_BombZD").init(data);
        }
    },

    playMagicBoomEffect28(poses) {
        let ls = cc.instantiate(this.bombLSPrefab);
        this._effectLayer.addChild(ls);
        ls.getComponent("HWFish918_BombLS").init(poses);
    },

    playMagicBoomEffect29(rt, seat, startPos) {
        let xf = cc.instantiate(this.bombXFPrefab);
        this._effectLayer.addChild(xf);

        let rcfg = this._fishCfg.fishes[rt];
        let data = {path: this._fishCfg.res_path,
                    file: rcfg.file,
                    anim: rcfg.anim,
                    seat: seat,
                    pos: startPos};
        xf.getComponent("HWFish918_BombXF").init(data);
    },

    registerMsg() {
        cc.vv.NetManager.registerMsg(MsgId.GAME_ENTER_MATCH, this.onRcvNetEnterGame, this);
        cc.vv.NetManager.registerMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRcvNetReconnectDeskinfo, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_PLAYER_JOIN, this.onRcvNetPlayerJoin, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_EXIT, this.onRcvNetExit, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_PLAYER_EXIT, this.onRcvNetPlayerExit, this);
        cc.vv.NetManager.registerMsg(MsgId.NOTIFY_KICK, this.onRcvNetKick, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_FIRE, this.onRcvNetFire, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_CATCH, this.onRcvNetCatch, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_ION_END, this.onRcvNetIonEnd, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_BOOM, this.onRcvNetBoom, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_ADD_FISH, this.onRcvNetAddFish, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_SWITCH_SCENE, this.onRcvNetSwitchScene, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_FISH_TIDE, this.onRcvNetFishTide, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_ROOM_STATE, this.onRcvNetRoomState, this);
        cc.vv.NetManager.registerMsg(MsgId.FISH_EVENT, this.onRcvNetEvent, this);
        cc.vv.NetManager.registerMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, this);
    },

    unregisterMsg() {
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_ENTER_MATCH, this.onRcvNetEnterGame, this);
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRcvNetReconnectDeskinfo);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_PLAYER_JOIN, this.onRcvNetPlayerJoin);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_EXIT, this.onRcvNetExit);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_PLAYER_EXIT, this.onRcvNetPlayerExit);
        cc.vv.NetManager.unregisterMsg(MsgId.NOTIFY_KICK, this.onRcvNetKick);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_FIRE, this.onRcvNetFire);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_CATCH, this.onRcvNetCatch);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_ION_END, this.onRcvNetIonEnd);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_BOOM, this.onRcvNetBoom);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_ADD_FISH, this.onRcvNetAddFish);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_SWITCH_SCENE, this.onRcvNetSwitchScene);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_FISH_TIDE, this.onRcvNetFishTide);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_ROOM_STATE, this.onRcvNetRoomState);
        cc.vv.NetManager.unregisterMsg(MsgId.FISH_EVENT, this.onRcvNetEvent);
        cc.vv.NetManager.unregisterMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged);
    },

    //进入桌子
    onRcvNetEnterGame(msg) {
        if(msg.gameid != this._gameid){
            return false;
        }
        let roomData = msg.deskinfo;
        if (roomData) {
            let switchMap = false;
            if (roomData.state == 0 && this._changeRoom) {
                switchMap = true;
            }
            this.initRoomData(roomData, switchMap);
        }
    },

    //桌子信息
    onRcvNetReconnectDeskinfo(msg) {
        if(msg.gameid != this._gameid){
            return false;
        }
        this._fishMgr.removeOvertimeFishes();
        let roomData = msg.deskinfo;
        if (roomData) {
            this._bulletMgr.setValid(true);
            for (let i=1; i<=4; i++) {
                this._players[i].setWaiting(true);
            }
            for (let i=0; i < roomData.users.length; i++) {
                let user = roomData.users[i];
                this._players[user.seat].setWaiting(false);
                this._players[user.seat].setScore(user.coin);
                if (user.mults) {
                    this._players[user.seat].setMutiples(user.mults);
                }
            }
        }
    },
    //玩家进入
    onRcvNetPlayerJoin(msg) {
        if (msg.code === 200){
            this._players[msg.user.seat].setWaiting(false);
            this._players[msg.user.seat].setScore(msg.user.coin);
        }
    },
    //离开房间
    onRcvNetExit(msg) {
        if (msg.code === 200) {
            this._bulletMgr.clear();
            this._fishMgr.removeAllFishes();
            if (this._selected) {
                cc.find("select", this._rootNode).active = true;
                this._changeRoom = true;
            } else {
                cc.vv.EventManager.emit(EventId.ENTER_HALL);
            }
        }
    },
    //玩家离开
    onRcvNetPlayerExit(msg) {
        if (msg.code === 200){
            this._players[msg.seat].setWaiting(true);
        }
    },
    //系统踢出
    onRcvNetKick(msg) {
        if (msg.uid == Global.playerData.uid) {
            this._bulletMgr.setValid(false);
            this.setAutoFire(false);
            this.setAutoLock(false);
            let tips = "Automatically exit room without operation in rule time"
            cc.vv.AlertView.show(tips, ()=>{
                cc.vv.EventManager.emit(EventId.ENTER_HALL);
            });
        }
    },
    //玩家发射
    onRcvNetFire(msg) {
        if (msg.code === 200){
            let bulletInfo = this._players[msg.seat].onRcvNetFire(msg, this._pauseTime<=0);
            if (bulletInfo) {
                if (msg.aid && msg.aid > 0) {
                    bulletInfo.aid = msg.aid;
                    bulletInfo.bid = msg.bid;
                }
                this._bulletMgr.fire(bulletInfo);
            }
        }
    },
    //玩家捕获
    onRcvNetCatch(msg) {
        if (msg.code === 200){
            let player = this._players[msg.seat];

            //显示获得金币
            let endpos = player.node.position;
            let startpos = cc.v2(0, 0);
            if (msg.x && msg.y) {
                startpos = cc.v2(msg.x, msg.y);
            } else {
                let fishNode = this._fishMgr.seekFish(msg.fids[0]);
                if (fishNode) {
                    startpos = fishNode.position;
                }
            }
            let ft = msg.ft;

            //移除鱼
            for (let i=0, l=msg.fids.length; i<l; i++) {
                let fishid = msg.fids[i];
                let fishNode = this._fishMgr.seekFish(fishid);
                if (fishNode) {
                    fishNode.getComponent("Fish_Fish").onDead();
                }
                if (ft == 20) {  //龙被捕获
                    // let node = this._fishLayer.getChildByTag(-fishid);
                    let node = this._fishLayer.getChildByName('' + (-fishid))
                    if (node) node.destroy();
                }
            }

            //播放捕获音效
            this.playCaptureSound(ft);
            
            //捕获特效
            if (msg.coin > 0) {
                if (ft >= 14 && ft <= 19) {
                    this.showCaptureBigFish(msg.seat, ft, msg.coin, startpos);
                } else if ((ft>=20 && ft<=24) || ft==30) {
                    this.showCaptureBoss(msg.seat, ft, msg.coin, startpos);
                } else {
                    this._coinMgr.showCoin(msg.coin, msg.ft, startpos, endpos);
                    player.addScore(msg.coin);
                }
            }

            // 炸弹处理
            if (msg.boom) {
                if (msg.seat == this._seat) {
                    this._boomid = msg.fids[0];
                }
                let startpos_world = this._fishLayer.convertToWorldSpaceAR(startpos);
                if (!player.showMagicCannon(ft, startpos_world)) return;
                if (msg.boom == 1) {   //局部炸弹(25:钻头炮 26:电磁炮 27:炸弹蟹)
                    //炸弹蟹直接爆炸，钻头炮和电磁炮需要手动发射
                    if (ft == 27) {
                        if (msg.seat == this._seat || (msg.aid && msg.aid > 0)) {  //我的炸弹/机器人的炸弹
                            let fishides = this._fishMgr.findFishIdInRange(cc.v2(0, 0), 400, 10, 16);
                            //发送爆炸信息
                            let msgToSend = {c: MsgId.FISH_BOOM};
                            msgToSend.boomid = msg.fids[0];
                            msgToSend.fids = fishides;
                            msgToSend.x = startpos.x;
                            msgToSend.y = startpos.y;
                            msgToSend.aid = msg.aid;
                            cc.vv.NetManager.send(msgToSend, true);
                        }
                    } else {
                        if (msg.aid && msg.aid > 0) {  //机器人的炸弹
                            let fishides = this._fishMgr.findFishIdInRange(cc.v2(0, 0), 400, 10, 16);
                            let msgToSend = {c: MsgId.FISH_BOOM};
                            msgToSend.boomid = msg.fids[0];
                            msgToSend.fids = fishides;
                            msgToSend.x = startpos.x;
                            msgToSend.y = startpos.y;
                            msgToSend.ang = player.getCannonAngle();
                            msgToSend.aid = msg.aid;
                            //延迟2秒发射
                            this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc((sender)=>{
                                cc.vv.NetManager.send(msgToSend, true);
                            })));
                        }
                    }
                } else if (msg.boom == 4) { //随机炸弹(连锁闪电)，直接爆炸
                    //我的炸弹
                    if (msg.seat == this._seat || (msg.aid && msg.aid > 0)) {       //我的炸弹/机器人的炸弹
                        let fishides = this._fishMgr.findRandomFishId(16, 5);
                        //发送爆炸信息
                        let msgToSend = {c: MsgId.FISH_BOOM};
                        msgToSend.boomid = msg.fids[0];
                        msgToSend.fids = fishides;
                        msgToSend.x = startpos.x;
                        msgToSend.y = startpos.y;
                        msgToSend.aid = msg.aid;
                        cc.vv.NetManager.send(msgToSend, true);
                    }
                } else if (msg.boom == 3) {    //同类炸弹(旋风鱼)，直接爆炸
                    //我的炸弹
                    if (msg.seat == this._seat || (msg.aid && msg.aid > 0)) {       //我的炸弹/机器人的炸弹
                        let fishides = this._fishMgr.findFishIdByTid(msg.rt, 10);
                        //发送爆炸信息
                        let msgToSend = {c: MsgId.FISH_BOOM};
                        msgToSend.boomid = msg.fids[0];
                        msgToSend.fids = fishides;
                        msgToSend.x = startpos.x;
                        msgToSend.y = startpos.y;
                        msgToSend.aid = msg.aid;
                        cc.vv.NetManager.send(msgToSend, true);
                    }
                }
            }
        }
    },
    //离子炮结束
    onRcvNetIonEnd(msg) {
        if (msg.code === 200){
            this._players[msg.seat].clearLock();
        }
    },
    //炸弹
    onRcvNetBoom(msg) {
        if (msg.code === 200){
            let player = this._players[msg.seat];
            //player.addScore(msg.coin);
            let endpos = player.node.position;
            let fids = [];
            let poses = [];
            let ft = msg.ft;
            let delay = 1;
            let count = 5;
            if (ft == 25){  //钻头
                delay = 5;
            } else if (ft == 27) { //连环炸弹
                let counts = [3,4,5,5,6,6,6,7,7,8,9];
                let count = counts[Global.random(0, counts.length-1)];
                delay = 0.6*count;
            } else if (ft == 28) { //连锁闪电
                delay = Math.max(1, msg.fids.length*0.5);
            }
            //移除鱼
            for (let i=0, l=msg.fids.length; i<l; i++) {
                let fishid = msg.fids[i];
                let score = msg.fss[i];
                let fishNode = this._fishMgr.seekFish(fishid);
                if (fishNode) {
                    fids.push(fishid);
                    poses.push(fishNode.position);
                    fishNode.getComponent("Fish_Fish").dieWithParam({delay:delay, coin:score, endpos:endpos});
                }
            }
            // 炸弹鱼特效
            if (ft >= 25 && ft <= 27) {
                if (msg.seat != this._seat && (ft==25 || ft==26)) {
                    player.magicFire(true, msg.ang);
                }
                let startpos = player.getMagicFirePos();
                if (ft == 27) startpos = cc.v2(msg.x, msg.y);
                this.playMagicBoomEffect(ft, msg.seat, startpos, msg.ang, fids, poses, count);
            } else if (ft == 28) {
                this.playMagicBoomEffect28(poses);
            } else if (ft == 29) {
                this.playMagicBoomEffect29(msg.rt, msg.seat, cc.v2(msg.x, msg.y));
            }

            player.showGainScoreWithDalay(msg.coin, delay+0.5);

            this.shake();
        }
    },
    //增加鱼
    onRcvNetAddFish(msg) {
        if (msg.code === 200){
            for (let i=0,l=msg.fishes.length; i<l; i++) {
                let fish = msg.fishes[i];
                let fishNode = this._fishMgr.createFish(fish.ft, fish.fid, fish.tt, fish.trace, fish.gid);
                if (fish.rt) {
                    let cfg = this._fishCfg.fishes[fish.ft];
                    if (cfg.com == "HWFish918_FishVessel") {
                        let com = fishNode.getComponent(cfg.com);
                        if (com) {
                            let rcfg = this._fishCfg.fishes[fish.rt];
                            com.loadInsideFishRes(fish.rt, this._fishCfg.res_path, rcfg, cc.v2(0,0));
                        }
                    }
                } else if (fish.ft == 20) {  //狂暴火龙
                    this.showDragonEffect(fish.fid, fish.trace);
                } else if (fish.ft == 23) { //深海章鱼
                    fishNode.removeFromParent();
                    cc.find("bg_layer/bg1/fish_layer", this._rootNode).addChild(fishNode);
                }
            }
        }
    },
    //切换场景
    onRcvNetSwitchScene(msg) {
        if (msg.code === 200) {
            this._fishMgr.removeFishesByTid(21);
            this._fishMgr.driveAwayAllFishes();

            this._sceneid = msg.sceneid;
            this._mapMgr.switchMap(this._sceneid);
            Global.playFishMusic("bg_music/bg"+(msg.sceneid-1));

            this._pauseTime = 3;    //暂停发射3秒
            for (let i=1; i<=4; i++) {
                this._players[i].clearLock(this._pauseTime);
            }
        }
    },
    //鱼潮
    onRcvNetFishTide(msg) {
        if (msg.code === 200) {
            this._fishMgr.buildfishtide(msg.style, msg.fids, msg.fts);
        }
    },
    //房间状态
    onRcvNetRoomState(msg) {
        if (msg.code === 200) {
            if (msg.state == 0) {

            }else if (msg.state == 1) {     //鱼潮要来了
                this._fishMgr.driveAwayAllFishes();
            }else if (msg.state == 2) {     //boss要来了
                this._mapMgr.showBossCome(this._sceneid);
            }
        }
    },
    //事件
    onRcvNetEvent(msg) {
        if (msg.code === 200) {
            if (msg.evt == "lyfb_start") {
                this._players[msg.seat].showLyfbStart(msg.mul, msg.duration);
                this.adjustCannonSpeed();
            } else if (msg.evt == "lyfb_end") {
                let player = this._players[msg.seat];
                player.showLyfbScore(msg.score, msg.extmul, msg.totalscore);
                player.setScore(msg.coin);
                this.adjustCannonSpeed();
            }
        }
    },
    //上分
    onRcvNetMoneyChanged: function (msg) {
        if (msg.code === 200 && msg.count) {
            this._players[this._seat].addScore(msg.count);
        }
    },
});
