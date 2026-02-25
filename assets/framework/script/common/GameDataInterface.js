// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        _deskInfo: null,
        _gameId: 0,
        _gameJackpot: null,
        _EventId: null,
        _mySeatIndex: -1,                // 我的座位号
        _users: null,
        isOver: {
            get () {
                return this._isOver;
            },
            set (value) {
                this._isOver = value;
            }
        },
    },

    // LIFE-CYCLE CALLBACKS:

    ctor() {
        this.isOver = true;
        this._EventId = {};
        this.setEventId();
        this._EventId.PLAYER_ENTER_ROOM = "player_enter_room";          // 玩家加入
        this._EventId.CLEAR_DESK = "clear_desk";                        // 清理桌面
        this._EventId.PLAYER_LEAVE_ROOM = "player_leave_room";          // 玩家离开房间
        this._EventId.PLAYER_ALREADY = "player_already";                // 玩家已经准备
        this._EventId.PLAYER_READY_FAIL = "player_ready_fail";          // 玩家已经准备
        this._EventId.RECONNECT_DESKINFO = "reconnect_deskinfo";       // 断线重连数据
        this._EventId.EXIT_GAME = "exit_game";                         // 离开游戏
        this._EventId.OFFLINE_STATUS = "offline_status",                // 离线状态
        this._EventId.MONEY_CHANGED = "money_changed",                  // 金币变化
        this.registerMsg();
    },


    init(data, gameId, gameJackpot) {
        this._gameId = gameId;  //游戏id
        this._deskInfo = data;  //桌子数据
        this._gameJackpot = gameJackpot;  //奖池信息：{id:420, jp:[10,50,100,500], unlock:[10000,20000,50000,100000]}
        this.clearLevelupData();

        this._users = this._deskInfo.users ? this._deskInfo.users : this._deskInfo.user;
        for (let i = 0; i < this._users.length; ++i) {
            if (this._users[i].uid === cc.vv.UserManager.uid) {
                this._mySeatIndex = this._users[i].seat;
                break;
            }
        }
    },

    // 获取我自己在服务器上的座位号
    getMySeatIndex() {
        if (this._mySeatIndex > -1) return this._mySeatIndex;
        else AppLog.err("##########没有设置我的座位号");

    },

    // 设置消息id;d
    setEventId() {
        //
        throw '"' + this.constructor.name + "setEventId()方法";
    },

    // 获取桌子人数限制
    getDeskSeatNum() {
        return this._deskInfo.seat;
    },

    clear() {
        this.unregisterMsg();
        this._deskInfo = null;
        let data = cc.vv.GameDataCfg.getGameData(this._gameId);
        if(cc.vv.gameData && cc.vv.gameData.resMgr) {
            cc.vv.gameData.resMgr.releaseRes();
        }
        cc.vv.gameData = null;

       // cc.sys.garbageCollect();
    },


    // 获取玩家信息
    getUsers() {
        return this._users;
    },

    // 设置玩家信息
    setUsers(user){
        this._users = user
    },

    // 获取桌子信息
    getDeskInfo() {
        return this._deskInfo;
    },

    // 获取奖池信息
    getGameJackpot() {
        return this._gameJackpot;
    },

    registerMsg() {
        cc.vv.NetManager.registerMsg(MsgId.GAME_LEVELROOM, this.onRcvNetExitRoom, this); //退出房间
        cc.vv.NetManager.registerMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRecvNetReconnectDeskinfo, this);
        cc.vv.NetManager.registerMsg(MsgId.NOTIFY_KICK, this.onRcvNetKickNotice, this);
        cc.vv.NetManager.registerMsg(MsgId.PLAYER_LEAVE, this.onRcvPlayerLeaveNotice, this);
        //财富改变（金币改变）
        cc.vv.NetManager.registerMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, this);
        // //监听等级提升
        // cc.vv.NetManager.registerMsg(MsgId.PULL_LEVEL_UP_EXP, this.onRecvLevelupExp, this);
        // //监听等级exp变化
        // cc.vv.NetManager.registerMsg(MsgId.PULL_CHANGE_EXP, this.onRecvChangeExp, this);
        
    },

    unregisterMsg() {
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_LEVELROOM, this.onRcvNetExitRoom);
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRecvNetReconnectDeskinfo);
        cc.vv.NetManager.unregisterMsg(MsgId.NOTIFY_KICK, this.onRcvNetKickNotice);
        cc.vv.NetManager.unregisterMsg(MsgId.PLAYER_LEAVE, this.onRcvPlayerLeaveNotice);
        cc.vv.NetManager.unregisterMsg(MsgId.MONEY_CHANGED,this.onRcvNetMoneyChanged);
        // cc.vv.NetManager.unregisterMsg(MsgId.PULL_LEVEL_UP_EXP, this.onRecvLevelupExp, false, this);
        // cc.vv.NetManager.unregisterMsg(MsgId.PULL_CHANGE_EXP, this.onRecvChangeExp, false,this);
    },

    onRcvNetMoneyChanged(msg)
    {
        if (msg.code === 200) {
            if(msg.uid === Global.playerData.uid){
                Global.dispatchEvent(this._EventId.MONEY_CHANGED, msg);
            }
        }
    },



    // 有玩家离开房间
    onRcvPlayerLeaveNotice(msg) {
        this.delPlayer(msg);
    },

    // 有人加入房间
    onRcvNetEnterRoomNotice(msg) {
        let bFind = false;
        for (let i = 0; i < this._users.length; ++i) {
            if (this._users[i].uid === msg.user.uid) {
                this._users[i] = msg.user;
                bFind = true;
                break;
            }
        }
        if (!bFind) this._users.push(msg.user);
        Global.dispatchEvent(this._EventId.PLAYER_ENTER_ROOM, msg.user);
    },

    // 删除玩家数据 并通知UI层
    delPlayer(msg) {
        for (let i = 0; i < this._users.length; ++i) {
            if (this._users[i].uid === msg.uid) {
                this._users.splice(i, 1);
                break;
            }
        }
        Global.dispatchEvent(this._EventId.PLAYER_LEAVE_ROOM, msg);
    },

    onRcvNetKickNotice(msg) {
        if (msg.uid === cc.vv.UserManager.uid) {
            cc.vv.AlertView.showTips(cc.vv.Language.kick_out_game, () => {
                this.onRcvNetExitRoom({code:200});
            });
        }
        else {
            this.delPlayer(msg);
        }
    },


    onRecvNetReconnectDeskinfo(msg) {
        if (msg.gameid !== this._gameId) {
            return false
        }

        this._deskInfo = msg.deskinfo;
        Global.dispatchEvent(this._EventId.RECONNECT_DESKINFO, msg);
        return true;
    },

    //是否是体验场
    isExpriteRoom() {
        let res = false;
        if (this._deskInfo.free) {
            res = true
        }
        return res
    },

    getRoomId() {
        return this._deskInfo.deskid;
    },

    moveMenu() {

    },


    // 请求离开
    requestExit() {
        let data = cc.vv.GameDataCfg.getGameData(this._gameId);
        if (data) {
            let req = {c: MsgId.GAME_LEVELROOM};
            req.deskid = this._gameId;
            cc.vv.NetManager.send(req);

        }
        else {
            AppLog.err("无法找到gameId:" + this._gameId + "数据");
        }


    },

    getExpriCoin() {
        return this._deskInfo.virtualCoin || 0;
    },
    // 退出房间
    onExit() {
        let gameId = this._gameId;
        if(cc.vv.gameData) {
            Global.dispatchEvent(cc.vv.gameData._EventId.EXIT_GAME);
            Global.dispatchEvent(EventId.EXIT_GAME);

            if (!cc.vv.SceneMgr) {
                cc.vv.EventManager.emit(EventId.ENTER_HALL);
            }
        }
    },

    getGameId()
    {
        return this._gameId;
    },

    onRcvNetExitRoom(msg) {
        if (msg.code === 200) {
            this.onExit();

            if (cc.vv.SceneMgr){
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL);
            }
        }
    },

    // onRecvLevelupExp:function(msg){
    //     if(msg.code == 200){
    //         //更新经验
    //         this.levelupData = msg.info
    //         cc.vv.UserManager.setCurLv(msg.info.level)
    //         cc.vv.UserManager.setCurExp(msg.info.levelexp)
    //         cc.vv.UserManager.setUpdateExp(msg.info.levelup)
    //         cc.vv.UserManager.setNextLvReward(msg.next_level_reward)

    //         this.levelupData.totalCoin = msg.coin
            
    //         Global.dispatchEvent(EventId.PULL_LV_UP)

    //         if(msg.levelgift && msg.levelgift > 0){
    //             cc.vv.UserManager.setLevelGift(msg.levelgift)
    //             Global.dispatchEvent(EventId.SHOW_LEVEL_UP_GIFT);
    //         }
    //     }
    // },

    getLevelupExp:function(){
        return this.levelupData
    },

    clearLevelupData:function(){
        this.levelupData = null
    },

    // onRecvChangeExp:function(msg){
    //     if(msg.code == 200){
    //         cc.vv.UserManager.setCurExp(msg.info.levelexp)
    //         cc.vv.UserManager.setUpdateExp(msg.info.levelup)

    //         Global.dispatchEvent(EventId.REFUSH_LV_EXP)
    //     }
    // }



    // update (dt) {},
});
