// 游戏临时存放的通用数据
cc.Class({
    extends: cc.Component,

    properties: {
        // _hallJackpot:null,          // 奖池
        _disslc: 0,                 //双龙彩
        _diszbc: 0,                 //争霸彩

        _disgrand: 0,
        _dismega: 0,

        _isInGame:false,            // 设置

        _record_GameType:3,         // 记录用户选择的游戏类型
        _record_PageIndex:0,        // 游戏类型页面索引
        _gameId:-1,
        _gameJackpotList:[],        // 游戏奖池
        _slotsJackpotList:[],       // slots游戏奖池
        _maxbet:10000,
        _itemsSpriteAtlasList:null,       // 大厅图标列表

        _coin: 0,
        _level: 1,
        _localRedTip:null,
        _subgameVerMd5:null,        //子游戏版本的md5数据
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(){
        //用户登录节点服
        cc.vv.NetManager.registerMsg(MsgId.GAME_CONFIG || MsgId.LOGIN_USERID, this.onRcvMsgLoginUserId, this,true);
        //用户重新登录节点服
        cc.vv.NetManager.registerMsg(MsgId.GAME_CONFIG || MsgId.LOGIN_USERID, this.onRcvMsgLoginUserId, this,true);

        //创建房间
        cc.vv.NetManager.registerMsg(MsgId.GAME_CREATEROOM, this.onEnterGame, this,true);
        //加入房间
        cc.vv.NetManager.registerMsg(MsgId.GAME_JOINROOM, this.onEnterGame, this,true);
        //游戏断线重连房间信息
        cc.vv.NetManager.registerMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onEnterGame, this,true);

        cc.vv.NetManager.registerMsg(MsgId.GAME_ENTER_MATCH, this.onEnterGame, this,true);

        cc.vv.NetManager.registerMsg(MsgId.NOTIFY_SYS_KICK_LOGIN, this.onRcvLeaveGame, this,true); //系统踢人通知

        cc.vv.NetManager.registerMsg(MsgId.GAME_LEVELROOM, this.onRcvLeaveGame, this,true); //退出房间

        // cc.vv.NetManager.registerMsg(MsgId.JACKPOT_GAME,this.onRecvJackpotGame,this);
        cc.vv.NetManager.registerMsg(MsgId.JACKTPOT_HALL,this.onRecvJackpotHall,this);

        // //小红点
        // cc.vv.NetManager.registerMsg(MsgId.PULL_RED_NOTICE,this.onRecvPullRedTips,this);
        //监听其他玩家大奖推送
        cc.vv.NetManager.registerMsg(MsgId.PULL_JACKPOT_OTHER, this.onRecvJackpot, this);

        // this._itemsSpriteAtlasList = new Map();

        let item  = cc.sys.localStorage.getItem("select_game");
        if(item){
            item = JSON.parse(item);
            this._record_GameType = item.type;
            this._record_PageIndex = item.index;
        }

        // this._localRedTip = {shop:1};
    },

    // // 添加大厅图标
    // addItemsSpriteAtlas(list){
    //     for(let i=0;i<list.length;++i){
    //         this._itemsSpriteAtlasList.set(list[i].name,list[i]);
    //     }
    // },

    // getSpriteFrame(key){
    //     let spriteFrame = this._itemsSpriteAtlasList.get(key);
    //     return spriteFrame;
    // },

    onRecvJackpotHall (msg) {
        if (msg.code === 200) {
            this._disslc = msg.disslc || this._disslc;  //双龙彩
            this._diszbc = msg.diszbc || this._diszbc;  //争霸彩

            this._disgrand = msg.disgrand || this._disgrand;  
            this._dismega = msg.dismega || this._dismega;  
        }
    },

    // // 游戏奖池
    // onRecvJackpotGame(msg){
    //     if(msg.code == 200){
    //         this._gameJackpotList = msg.gameJackpotList;
    //         this._maxbet = msg.maxbet;
    //         //通知重新刷新彩池
    //         Global.dispatchEvent(EventId.REFUSH_GAME_JP)
            
    //         this._disslc = msg.disslc || this._disslc;  //双龙彩
    //         this._diszbc = msg.diszbc || this._diszbc;  //争霸彩

    //         this._disgrand = msg.disgrand || this._disgrand;  
    //         this._dismega = msg.dismega || this._dismega;
    //     }
    // },

    // 设置奖池的值
    setGameJackpot(gameId,num){
        
        // for(let i=0;i<this._gameJackpotList.length;++i){
        //     if(Number(this._gameJackpotList[i].gameid) === Number(gameId))
        //     {
        //         this._gameJackpotList[i].gameJackpot = num;
        //     }
        // }
    },

    //获取彩池相关数据
    //返回数组 0:mini 1:minor 2:major 3:grand(mega) 4:self define
    getGameJackpot(gameId){
        for(let i=0;i<this._gameJackpotList.length;++i){
            if(Number(this._gameJackpotList[i].gameid) === Number(gameId))
            {
                return this._gameJackpotList[i].jp;
            }
        }
        for(let i=0;i<this._slotsJackpotList.length;++i){
            if(Number(this._slotsJackpotList[i].gameid) === Number(gameId))
            {
                return this._slotsJackpotList[i].jp;
            }
        }
        return [10,10,10,10];
    },

    onRcvLeaveGame(msg){
        if(msg.code == 200){
            this._gameId = -1;
        }
    },

    // // 设置当前用户选择的游戏类型游戏页面索引，以便用户从游戏回到大厅，可以显示上次选择的游戏
    // setRecordSelectGameData(type,pageIndex){
    //     this._record_GameType = type;
    //     this._record_PageIndex = pageIndex;
    //     cc.sys.localStorage.setItem("select_game",JSON.stringify({type:type,index:pageIndex}));
    // },

    onEnterGame(msg){
        if(msg.code == 200){
            this._gameId = msg.gameid;
        }
    },

    // getSelectGameData(){
    //     return{type:this._record_GameType,index:this._record_PageIndex};
    // },

    getGameId(){
      return this._gameId;
    },
    setGameId(val){
        this._gameId = val
    },

    clearGameId(){
        this._gameId = -1;
    },
    getIsInGame(){
        return this._gameId>-1;
    },

    getMaxBet() {
        return this._maxbet;
    },

    onRcvMsgLoginUserId(msg){
        if(msg.code === 200){
            // this._hallJackpot = msg.hallJackpot;              // 奖池
            for(let key in msg.gamelist){
                let list = msg.gamelist[key];
                for(let j=0;j<list.length;++j){
                    let item = {}
                    item.gameid = list[j].id
                    item.jp = list[j].jp
                    this._gameJackpotList.push(item)
                }
            }
            if(msg.slotslist){
                let list = msg.slotslist;
                for(let j=0;j<list.length;++j){
                    let item = {}
                    item.gameid = list[j].id
                    item.jp = list[j].jp
                    this._slotsJackpotList.push(item)
                }
            }
        }
        this._maxbet = msg.maxbet || 1000      //最大下注额

        this._disslc = msg.disslc || this._disslc;  //双龙彩
        this._diszbc = msg.diszbc || this._diszbc;  //争霸彩

        this._disgrand = msg.disgrand || this._disgrand;  
        this._dismega = msg.dismega || this._dismega;  

        this._level = msg.level || this._level;  
        this._coin = msg.coin || this._coin;  
    },


    // // 获取奖池
    // getHallJackpot()
    // {
    //     return this._hallJackpot;
    // },

    // getLevel () {
    //     return this._level;
    // },

    // getCoin () {
    //     return this._coin;
    // },

    getGrand(){
        return this._disgrand;
    },

    getMega(){
        return this._dismega
    },

    getSLC: function () {
        return this._disslc;
    },

    getZBC: function () {
        return this._diszbc;
    },

    setLotteryPot: function (slcNum, zbcNum, grandNum, megaNum) {
        this._disslc = slcNum || this._disslc;
        this._diszbc = zbcNum || this._diszbc;

        this._disgrand = grandNum || this._disgrand;  
        this._dismega = megaNum || this._dismega;  
    },

    start () {

    },

    // //大厅icon的节点池
    // getHallItem(){
    //     if(!this._hallIconShaderPool){
    //         this._hallIconShaderPool = new cc.NodePool()
    //     }
    //     return this._hallIconShaderPool.get()

    // },
    // putHallItem(item){
    //     if(this._hallIconShaderPool){
    //         this._hallIconShaderPool.put(item)
    //     }
    // },

    // //存储大厅pageview旋转角度
    // setPageViewRot(nType,rot){
    //     if(!this._pageviewRot){
    //         this._pageviewRot = {}
    //     }
    //     this._pageviewRot[nType] = rot
    // },
    // getPageViewRot(nType){
    //     let val = 0
    //     if(this._pageviewRot){
    //         if(this._pageviewRot[nType]){
    //             val = this._pageviewRot[nType]
    //         }
    //     }
    //     return val
    // },

    // //小红点推送
    // onRecvPullRedTips:function(msg){
    //     if(msg.code == 200){
    //         this._redTipsMsg = msg
            
    //         cc.vv.UserManager.setLevelGift(this._redTipsMsg.onetimeleft);

    //         Global.dispatchEvent(EventId.REFUSH_RED_TIPS)
    //     }
    // },

    //获取小红点提示
    /*
    {
        "onlieAward": 1, // 在线奖励是否可以领取 1可以领取， 0不能领取
        "mail": 5, //剩余未读邮件的数目
        "quest": 1, //任务  1今日任务开启 2 任务做完可以领取
        "levelgift": 0, //等级礼包购买状态 0就不显示，大于0的时间戳就直接倒计时
        "sign": 1, //签到，已经签到是1, 没有签到0
        "friend": 1 //好友
    }
    {
        "shop": 1,  //商城
        "share": 1, //分享
    }
    */
    //return:返回的数据可能各不一样，如是否有在线奖励可以领取，有几封邮件可以领取
    // getRedTip:function(type){
    //     if (this._redTipsMsg) {
    //         if (type==1) return this._redTipsMsg.onlieAward;
    //         else if (type==2) return this._redTipsMsg.mail;
    //         else if (type==3) return this._redTipsMsg.quest;
    //         else if (type==4) return this._redTipsMsg.levelgift;
    //         else if (type==5) return this._redTipsMsg.sign;
    //         else if (type==7) return this._redTipsMsg.share;
    //         else if (type==8) return this._redTipsMsg.friend;
    //         else if (type==9) return this._redTipsMsg.gametask;
    //         else if (type==10) return this._redTipsMsg.luckcard;
    //         else if (type==12) return this._redTipsMsg.firstPayGift;
    //         else if (type==14) return this._redTipsMsg.maintask;
    //         else if (type==17) return this._redTipsMsg.chat;//私聊
    //     }
    //     if (this._localRedTip) {
    //         if (type==6) return this._localRedTip.shop;
    //         else if (type==11) return this._localRedTip.bingo;
    //         else if (type==13) return this._localRedTip.firstPayGift;
    //     }
    //     return false;
    // },

    // setRedTip:function(type){
    //     if(this._redTipsMsg){
    //         if(type == 2) this._redTipsMsg.mail = 1
    //         if(type == 3) this._redTipsMsg.quest = 1
    //         if(type == 14) this._redTipsMsg.maintask = 1
    //         if(type == 17) this._redTipsMsg.chat = 1
    //     }
    //     if (this._localRedTip) {
    //         if (type==11) this._localRedTip.bingo = 1
    //         if (type==13) this._localRedTip.firstPayGift = 1
    //     }
    // },

    // //清理小红点数据
    // clearRedTip:function(type){
    //     if (this._redTipsMsg) {
    //         if (type==1) this._redTipsMsg.onlieAward = 0;
    //         else if (type==2) this._redTipsMsg.mail = 0;
    //         else if (type==3) this._redTipsMsg.quest = 0;
    //         else if (type==4) this._redTipsMsg.levelgift = 0;
    //         else if (type==5) this._redTipsMsg.sign = 0;
    //         else if (type==7) this._redTipsMsg.share = 0;
    //         else if (type==8) this._redTipsMsg.friend = 0;
    //         else if (type==9)  this._redTipsMsg.gametask = 0;
    //         else if (type==10)  this._redTipsMsg.luckcard = 0;
    //         else if (type==12) this._redTipsMsg.firstPayGift = 0;
    //         else if (type==14) this._redTipsMsg.maintask = 0;
    //         else if (type==17) this._redTipsMsg.chat = 0;
    //     }
    //     if (this._localRedTip) {
    //         if (type==6) this._localRedTip.shop = 0;
    //         else if (type==11) this._localRedTip.bingo = 0;
    //         else if (type==13) this._localRedTip.firstPayGift = 0;
    //     }
    //     Global.dispatchEvent(EventId.REFUSH_RED_TIPS);
    // },

    onRecvJackpot:function (msg) {
        if (msg.code === 200){
            //以免太频繁，控制显示的最小间隔5分钟
            this._lastnotify = this._lastnotify || cc.vv.UserManager.getServerTime()
            let curtime = cc.vv.UserManager.getServerTime()
            let nShowInter = curtime - this._lastnotify
            if(nShowInter > 5*60){
                Global.dispatchEvent(EventId.GET_JACKPOT_OTHER,msg);
                this._lastnotify = cc.vv.UserManager.getServerTime()
            }
            else{
                cc.log("中奖太频繁，小于5分钟")
            }
            
        }
    },

    // 设置子游戏的md5数据
    setSubverMd5:function(data){
        this._subgameVerMd5 = data
        //保存到本地
        Global.saveLocal("submd5",JSON.stringify(data) )
    },

    getSubverMd5:function(){
        if(!this._subgameVerMd5){
            let temp = Global.getLocal("submd5")
            if(temp){
                this._subgameVerMd5 = JSON.parse(temp)
            }
        }
        return this._subgameVerMd5
    },

    //存储启动进度条
    setLaunchProgress:function(val){
        this._launchProgress = val
    },

    getLaunchProgress:function(){
        return this._launchProgress
    },

    //启动的时候请求的公告信息
    setLaunchAnnousment:function(data){
        this._launchInfo = data
    },
    getLaunchAnnousment:function(){
        return this._launchInfo
    },
    setHotupdateStart:function(val){
        this._bHotupdateStart = val
    },
    getHotupdateStart:function(){
        return this._bHotupdateStart
    },

    

    // update (dt) {},
});
