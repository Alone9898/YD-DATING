cc.Class({
    extends: cc.Component,

    statics: {
        //=========首次登陆下发的数据=====
        gameServer:'',  //服务端下发的游服地址
        token:'',       //首次登陆的token
        serverId:'',    //服务器id
        subId:'',

        //==============================
        uid: 0,         //用户id
        openid: 0,      //用户openid（第三方id）

        totalcoin:0,
        dcoin:0,
        cashbonus:0,
        dcashbonus:0,
        bankcoin:0,
        coin: {
            get () {
                return this._coin?this._coin:0;
            },
            set (value) {
                this._coin = value;
            }
        },        //金币
        level:1,
        userIcon: '',   //头像地址
        sex: 1,         //1男2女
        agent:0,        //代理等级
        nickName:'',    //昵称
        inviteCode:'', //自己的邀请码
        bindcode: '', //绑定的邀请码
        ip: '192.168.0.1', //玩家的ip
        memo: '', //备注
        onlinestate:0,      // 在线奖励领取状态
        syotime:0,          // 倒计时
        lrwardstate:0,      // 每日奖励领取
        switch:null,        // 运营开关
        showActivity:true, // 弹出活动页面
        //GPS信息
        lat:0, //纬度
        lng:0, //经度
        unionid:'',     //微信才有的唯一id,用来微信冷登录



        bank_token:null, //银行token
        bank_info: {}, //银行信息
        rememberPsw:false,
        gameList:null,  // 有些列表
        isAutoLogin:false,  // 自动登录
        // notice:"",      // 公告
        luckRedvelopesNum:0,    //幸运红包的个数
        growup:null,    //成长星级
        red_envelop:0,      // bigbang红包
        // localFavList:null,  //本地的喜爱列表
        areaCode:null,      //http服务器下发的区域代码
        evo:0,      //是否在casino中

        _stampInfo: null,   // 邮票信息

        svip: 0,    //vip等级
        svipexp: 28,    //vip经验
        svipup: 1,  //vip升级经验

        logonTime: 0,
        serverTime: 0,

        bonusList:null, //bonus页面的显示活动

        guides:null,    //已经完成的引导列表

        favorite_games:[], //喜爱列表

        _notEnoughCoinPopList:null, //金币不足的弹框

        activityTipsInGame:false, //游戏内活动提示
        questmaxcoin: 0,//QUEST奖励金币
        _dailygift:null,//0:不可领取，1可以领取

        _richpoint: 0,  //富豪点

        _hallIconSpin:[],

        _firstBuyGift: {},  //首充
        _diamond:0,
        _noticerewards:0,//召回奖励金币
        _questroundid:1,//当前第几轮quest
        _bingoFrom: 1,// 从哪进入bingo
        _popParams:null,//弹窗游戏id
        _betData:{},//押注数据
        playedGameIds:[], //玩家玩过的游戏列表

        _bonusTab:0,
        _hallRankData:{},//大厅排行数据

        _pvpRank:'', //pvp排名
        _pvpScore:'', //pvp积分
        _pvpCC:'',//pvp战力
        _pvp_defend_team:[],
        //初始化
        init: function () {
             //用Global来取用户数据
            Global.playerData = this;
            this.switch = [];

            cc.vv.NetManager.registerMsg(MsgId.GAME_LIST,this.recvGameList,this);
            //金币不足的金币弹框
            cc.vv.NetManager.registerMsg(MsgId.PULL_CH_LESSCOIN_ACTIVELIST,this.onRcvLessCoinPoplist,this)

            //vip等级变化
            cc.vv.NetManager.registerMsg(MsgId.REQ_REFRESH_VIP,this.onEventRefreshVip,this);  //vip升级

            //modify localval
            cc.vv.NetManager.registerMsg(MsgId.PULL_MODIFY_LOCALVAL,this.onRcvPullModifyLocalval,this)
            //大厅信息同步
            cc.vv.NetManager.registerMsg(MsgId.REQ_SYNC_HALLINFO,this.onRecvRefreshHallInfo,this);  

            cc.vv.NetManager.registerMsg(MsgId.REQ_FRIENDS_LIST, this.onRcvFriendsList, this);//获得好友列表 判断是否是好友
            cc.vv.NetManager.registerMsg(MsgId.REQ_ADD_FRIENDS, this.onFriendAdded, this);
            cc.vv.NetManager.registerMsg(MsgId.REQ_DELETE_FRIENDS, this.onFriendRemoved, this);

            this.registerExMsg()
        },

        //方便扩张重写注册消息
        registerExMsg:function(){

        },

        //初始化登陆服务器下发的数据
        initLoginServer: function (loginServerData) {
            this.gameServer = loginServerData.net;
            this.token = loginServerData.token;
            this.serverId = loginServerData.server;
            this.subId = loginServerData.subId;
            this.uid = loginServerData.uid;
            this.unionid = loginServerData.unionid;
        },

        recvGameList(msg)
        {
            if(msg.code === 200)
            {
                this.gameList = msg.gamelist;
                for(let k in this.gameList){
                    let list = this.gameList[k];
                    list.sort((a,b)=>{
                        return a.ord-b.ord;
                    });
                }
                Global.dispatchEvent(EventId.UPDATE_GAME_LIST);
            }
        },


        //初始化玩家数据
        initPlayerData: function (serverData) {
            var playerData = serverData.playerInfo
            this.clubInvitePop = serverData.clubInvitePop    //俱乐部邀请函数据

            var act = serverData.actlist

            this.setCurLv(playerData.level);

            this.uid = playerData.uid
            this.coin = playerData.coin
            this.userIcon = playerData.usericon 
            this.sex = playerData.sex
            this.agent = playerData.agent
            this.nickName = playerData.playername
            this.memo = playerData.memo;
            this.inviteCode = playerData.code
            this.bindcode = playerData.bindcode;
            this.ip = playerData.ip;
            this.onlinestate = playerData.onlinestate;
            this.lrwardstate = playerData.lrwardstate;
            this.upcoin = serverData.upcoin;                // 修改昵称需要金币数量
            this.ispayer = playerData.ispayer;
            this.account = playerData.account;
            this.logincoin = playerData.logincoin;
            this.switch = playerData.switch || [];
            this.logintype = playerData.logintype; //登录方式：游客/微信/fb/账号
            this.isbindfb = playerData.isbindfb;
            this.fbIcon = playerData.fb_icon    //fb头像地址
            this.isbindgoogle = playerData.isbindgg;
            this.spread = playerData.spread || 0;    //推广总代级别0，1，2，3
            this.gameList = serverData.gamelist;
            this.luckRedvelopesNum = playerData.luckRedvelopesNum
            this.growup = serverData.growup
            this.red_envelope = playerData.red_envelope;
            this.evo = serverData.evo
            this._curExp = playerData.levelexp
            this._updateExp = playerData.levelup
            this._nextLvReward = playerData.next_level_reward;
            this.initgift = playerData.initgift;
            // this.onetime = playerData.onetime;
            // this.bCanShowOneTimeOnly = serverData.poponetime
            this.svip = playerData.svip || 0;
            this.svipexp = playerData.svipexp || 0;
            this.svipup = playerData.svipup || Global.VIP_INFO[this.svip].upNeedExp;
            this.bonusList = serverData.bonuslist
            this.activityList = serverData.activitylist
            this.offlineAward = playerData.offlineaward;    // 离线奖励
            this.offlineTime = playerData.offlinetime;      // 离线时间
            this.guides = playerData.guide //已经完成的引导列表
            // this.questopenlv = serverData.quest //quest开启等级 0 表示未开启
            this.questmaxcoin = serverData.questmaxcoin //quest奖励金币
            this.logonTime = new Date().getTime()
            this.serverTime = serverData.servertime
            this._levelGift = 0;
            this.pvp_card_exp = playerData.pvp_card_exp;   //当前卡牌剩余经验
            this._pvp_defend_team = playerData.pvp_defend_team;  //pvp防守队伍
            this.charm = playerData.charm;
            this.charmList = serverData.charmList;
            
            this._richpoint = playerData.upoint
            this._diamond = playerData.diamond || 0
            this.favorite_games = serverData.favorite_games //喜爱列表
            this._noticerewards = serverData.backGameCoin

            this._questroundid = serverData.questroundid
            this._popParams = serverData.popParams

            this.setBetData(playerData.palace)

            if(serverData.redPoint){
                this.setSliverHarm(serverData.redPoint.dailyGift)
            }
            
            //bingo倒计时标志
            if(serverData.bingo){
                this.countData = Math.floor(((serverData.bingo.endTime*1000) - new Date().getTime())/1000)
                this.bingoData = serverData.bingo
            }
            //骑士
            this._journey = serverData.journey;
        
            this._firstBuyGift = serverData.firstPayGift  //首充礼包

            if(cc.vv.PopUIMgr){
                //登录弹框数据
                let bHas = false
                if(Global.isIOSReview()){
                    //是否包含新手奖励
                    for(let i = 0; i < serverData.poplist.length; i++){
                        if(serverData.poplist[i] == 1){
                            bHas = true
                            break
                        }
                    }
                    
                }
                if(bHas){
                    cc.vv.PopUIMgr.setLoginPopList([1]);
                }
                else{
                    if(Global.isIOSReview()){
                        cc.vv.PopUIMgr.setLoginPopList([]);
                    }
                    else{
                        cc.vv.PopUIMgr.setLoginPopList(serverData.poplist);
                        if(this.clubInvitePop){
                            //有俱乐部邀请函才弹出窗口
                            cc.vv.PopUIMgr.addLoginPopList(101);
                        }
                    }
                    
                }
            }
            
            

            for(let k in this.gameList){
                let list = this.gameList[k];
                if(list && list instanceof Array){
                    list.sort((a,b)=>{
                        return a.ord-b.ord;
                    });
                }

                
            }
            // if(this.notice === "" && serverData.notice !== undefined)
            // {
            //     this.notice = serverData.notice;        // 公告
            // }

            Global.saveLocal(Global.SAVE_KEY_LOGIN_TYPE, this.logintype);
            //Global.saveLocal(Global.SAVE_KEY_LAST_LOGIN_TYPE, this.logintype);

            // this._preLoad = [] //预加载记录
            // var compare = function (prop) {
            //     return function (obj1, obj2) {
            //         var val1 = obj1[prop];
            //         var val2 = obj2[prop];if (val1 < val2) {
            //             return -1;
            //         } else if (val1 > val2) {
            //             return 1;
            //         } else {
            //             return 0;
            //         }            
            //     } 
            // }

            // 记住密码
            // 保存token
            let tokenList = Global.getLocal(Global.SAVE_PLAYER_TOKEN);
            if(tokenList === undefined)
            {
                tokenList = {};
            }
            else{
                tokenList = JSON.parse(tokenList);
            }
            if(this.logintype !== Global.LoginType.Guest){
                if(this.rememberPsw){
                    if(!tokenList[this.nickName]) tokenList[this.nickName] = {};
                    tokenList[this.nickName].token = this.token;
                }
                else{
                    if(tokenList[this.nickName]) tokenList[this.nickName] = {};
                }
            }
            tokenList["curr_account"] = this.nickName;                  // 当前登录账号
            Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(tokenList));

            // // this.getFavList()
            // if(cc.vv.AppData){
            //     if (this.isActivityOpen(1)) {
            //         cc.vv.RedSys.setRedTip(11)
            //     }
    
            //     cc.vv.RedSys.setRedTip(13)
            // }
            

        },

        SetUserIcon(icon){
            this.userIcon = icon
        },

        //加钱
        AddCoin(val,bRefushHall){
            this.coin += val
            if(bRefushHall){
                Global.dispatchEvent(EventId.UPATE_COINS)
            }
        },

        // 设置
        SetCoin(val,bRefushHall){
            this.coin = val
            this.totalcoin = this.coin + this.cashbonus + this.bankcoin;
            if(bRefushHall){
                Global.dispatchEvent(EventId.UPATE_COINS)
            }
        },

        setBankCoin(value){
            this.bankcoin = value
        },

        // // 获取bigbang红包
        // getRedEnvelope(){
        //   return this.red_envelope;
        // },

        // hideRedEnvelope(){
        //   this.red_envelope = 0;
        // },
        // // 获取公告
        // getNotice()
        // {
        //     return this.notice;
        // },

        // // 清理公告
        // clearNotice(){
        //   this.notice = "";
        // },

        // getIsAutoLogin()
        // {
        //     return this.isAutoLogin;
        // },

        // setIsAutoLogin(value)
        // {
        //     this.isAutoLogin = value;
        // },

        // 获取游戏列表
        getGameList(){
            return this.gameList;
        },

        //获取喜爱列表
        getFavourList(){
            return this.favorite_games
        },
        setFavourList(val){
            this.favorite_games = val
        },
        //是否是喜爱的游戏
        isFavourGame(id){
            let res
            if(this.favorite_games){
                for(let i = 0; i < this.favorite_games.length; i++){
                    let item = this.favorite_games[i]
                    if(item == id){
                        res = true
                        break
                    }
                }
            }
            
            return res
        },

        //获取已经解锁过的游戏
        getUnlockGames(){
            let datas = []
            for(let bigType in this.gameList){
                let bigDatas = this.gameList[bigType]
                for(let i = 0; i < bigDatas.length; i++){
                    let gData = bigDatas[i]
                    let gameCfg = cc.vv.GameItemCfg[gData.id]
                    if(gameCfg){
                        if(gData.level < this.level && gData.status == 1 ){
                            datas.push(gData)
                        }
                    }
                    
                }
            }
            return datas
        },

        // 获取游戏列表中某个游戏数据
        getGameListById(gameId){
            let res = null
            for(let bigType in this.gameList){
                let bigDatas = this.gameList[bigType]
                for(let i = 0; i < bigDatas.length; i++){
                    if(Number(gameId) == Number(bigDatas[i].id)){
                        res = bigDatas[i]
                        break
                    }
                }
            }
            return res
        },

        // 设置记住密码
        setRemember(value)
        {
            this.rememberPsw = value;
        },

        setNickName(name)
        {
          this.nickName = name;
        },

        getNickName () {
            return this.nickName
        },

        

        //获取召回奖励
        getNocticeRewards:function(){
            return this._noticerewards
        },
        clearNoticeRewards:function(){
            this._noticerewards = 0
        },

        // //设置经纬度
        // setLatLng: function (lat, lng) {
        //     this.lat = lat || 0;
        //     this.lng = lng || 0;
        // },

        // //设置幸运红包数目
        // setLuckPackNum:function(num){
        //     this.luckRedvelopesNum = num
        // },

        // //获取幸运红包数目
        // getLuckPackNum:function(){
        //     return this.luckRedvelopesNum
        // },

        // //获取growup成长值系统
        // getRowup:function(){
        //     return this.growup
        // },

        // //设置growup成长值
        // setRowup:function(val){
        //     this.growup = val
        // },

        // //Api登陆暂存的参数
        // //data.gameid:游戏id
        // //data.token:玩家token
        // //data.signstr:验签数据
        // setApiData:function(data){
        //     this._apiData = data
        // },
        // //api游戏id
        // getApiGameId:function(){
        //     if(this._apiData){
        //         return this._apiData['gameid']
        //     }
            
        // },
        // //api签名数据
        // getApiSign:function(){
        //     if(this._apiData){
        //         return this._apiData['signstr']
        //     }
        // },


        //Api登陆暂存的登陆方式
        setLoginType:function(val){
            this.logintype = val
        },
        getLoginType(){
            return this.logintype
        },

        getClubInvitePop(){
            return this.clubInvitePop
        },

        setIsBindFb: function(isBind) {
            this.isbindfb = isBind?true:false;
        },

        isBindFb: function() {
            return this.isbindfb;
        },

        setIsBindGoogle:function(isBind){
            this.isbindgoogle = isBind
        },
        getIsBindGoogle:function(){
            return this.isbindgoogle
        },

        //获取金币不足的提示弹框
        getNotEncoughCoinPoplist(){
            return this._notEnoughCoinPopList
        },
        

        setNotEncoughPopForceFlag(val){
            if(this._notEnoughCoinPopList){
                this._notEnoughCoinPopList.bforse = val
            }
            
        },
        // //设置弹出的列表
        // setNodtEncoughPopList(val){
        //     if(!this._notEnoughCoinPopList){
        //         this._notEnoughCoinPopList = {}
        //     }
        //     this._notEnoughCoinPopList.list = val
        // },

        getDiamond:function(){
            return this._diamond
        },
        setDiamond:function(val,bRefushHall){
            this._diamond = val
            if(bRefushHall){
                Global.dispatchEvent(EventId.UPATE_DIAMOND)
            }
        },
        
        //加钻石
        AddDiamond(val,bRefushHall){
            this._diamond += val
            if(bRefushHall){
                Global.dispatchEvent(EventId.UPATE_DIAMOND)
            }
        },

        getCurQuestId () {
            return this._questroundid
        },

        setCurQuestId (val) {
            this._questroundid = val
        },

        // //获取本地的喜爱列表
        // getFavList:function(){
        //     if(!this.localFavList){
        //         this.localFavList = []
        //         let str = Global.getLocal("FavList"+this.uid,"")
        //         if(str){
        //             this.localFavList = JSON.parse(str)
        //         }
                
        //     }
        //     return this.localFavList
        // },

        // //游戏是否在喜爱列表中
        // isInFav:function(gameId){
        //     if(this.localFavList){
        //         for(let i = 0; i < this.localFavList.length; i++){
        //             if(Number(gameId) == Number(this.localFavList[i])){
        //                 return true
        //             }
        //         }
        //     }
        //     return false
        // },
    
        // //设置游戏的喜爱属性
        // setFav:function(gameId,bFav){
        //     let self = this
        //     let getValIdx = function(val){
        //         for(let i = 0; i < self.localFavList.length; i++){
        //             if(Number(val) == Number(self.localFavList[i])){
        //                 return i
        //             }
        //         }
        //         return -1
        //     }
        //     if(bFav){
        //         //插入
        //         if(getValIdx(gameId) == -1){
        //             this.localFavList.push(gameId)
        //             Global.saveLocal("FavList"+this.uid,JSON.stringify(this.localFavList))
        //         }
                
        //     }
        //     else{
        //         //删除
        //         let idx = getValIdx(gameId)
        //         if(idx > -1){
        //             this.localFavList.splice(idx,1)
        //             Global.saveLocal("FavList"+this.uid,JSON.stringify(this.localFavList))
        //         }
        //     }
        // },

        // //设置arenCode
        // setAeraCode:function(val){
        //     this.areaCode = val
        // },
        // getAreaCode:function(){
        //     return this.areaCode
        // },

        // //是否是demo/test账号
        // isTestAccount:function(){
        //     let bTest = false
        //     let preStr = "test"
        //     if(Global.appId == Global.APPID.BigBang){
        //         preStr = "demo"
        //     }
        //     let fdIdx = this.nickName.indexOf(preStr)
        //     if(fdIdx > -1){
        //         bTest = true
        //     }
        //     return bTest
        // },

        //大厅中检测是否在casino中，如果玩家进了casino,直接关进程就会锁在casino中
        //所以待玩家重新进入大厅的时候，需要把玩家推出了
        isCasioSatusOnHall:function(){
            return this.evo
        },

        //游戏是否解锁
        isGameLock:function(gameid){
            let gData = this.getGameListById(gameid)
            if(gData){
                return gData.level > this.level 
            }
            return true
        },

        //设置游戏解锁
        setGameUnlock:function(gameid){
            let gData = this.getGameListById(gameid)
            if(gData){
                gData.level = 0
                Global.dispatchEvent(EventId.REFUSH_GAME_ITEM,gameid)
            }
        },

        //有可能服务端会关闭
        isServerOpenGame:function(gameid){
            let gData = this.getGameListById(gameid)
            return (gData.status == 1)
        },

        //是否已经下载过这个子游戏
        isDownloadSubGame(gameId){
            if(Global.isNative()){
                
                // let res = this.isNoNeedDownGame(gameId)
                // if(res){
                //    return true //不需要下载的 
                // }

                let gameCfg = cc.vv.GameItemCfg[gameId]
                if(gameCfg){
                    let name = gameCfg.name
                    let file = cc.sys.localStorage.getItem(name);
                    if (file) {
                        return true; //已经下载过了
                    } else {
                        return false;
                    }
                }
                {
                    //没有配置入口
                    AppLog.warn('没有配置入口'+gameId)
                    return true
                }
                
            }
            else{
                return true
            }
            
        },

        //是否是内置游戏
        isNoNeedDownGame:function(gameId){
            let res
            
            let noNeedDowns = this.getNoNeedDownGames()
            for(let i = 0; i < noNeedDowns.length; i++){
                if(noNeedDowns[i] == gameId){
                    res = true
                    break
                }
            }
            return res
        },

        //内置游戏列表
        getNoNeedDownGames(){
            let noNeedDowns = [611,659,631,657] //内置游戏，不需要下载
            if(Global.appId === Global.APPID.SouthAmerica || Global.appId == Global.APPID.HuaweiDRM){
                //noNeedDowns.push(255) //德州
            }
            if(Global.appId == Global.APPID.Indian || Global.appId == Global.APPID.Poly){
                // noNeedDowns.push(250) //印度lami
            }
            
            return noNeedDowns
        },

        //获取当前经验
        getCurExp(){
           return this._curExp
        },
        setCurExp(val){
            this._curExp = val
        },
        //获取升级的总经验
        getUpdateExp(){
           return this._updateExp
        },
        setUpdateExp(val){
            this._updateExp = val
        },

        //获取当前等级
        getCurLv(){
            return this.level
        },
        setCurLv(val){
            this.level = val
            Global.saveLocal('userlv',val)
        },

        //下级的升级奖励金币
        getNextLvReward(){
            return this._nextLvReward
        },
        setNextLvReward(val){
            this._nextLvReward = val
        },

        //hall 当前的tab
        setHallTab(val){
            this._hallTab = val
        },
        getHallTab(){
            return this._hallTab
        },

        //bonus 当前tab
        setBonusTab(val){
            this._bonusTab = val
        },
        getBonusTab(){
            return this._bonusTab
        },

        getHallOffset(){
            return this._scrollOff
        },

        setHallOffset(val){
            this._scrollOff = val
        },

        //等级礼包剩余时间
        setLevelGift(val){
            this._levelGift = val
        },

        getLevelGift(){
            return this._levelGift;
        },

        getVipLevel() {
            return this.svip;
        },

        setVipLevel(lv) {
            this.svip = lv;
        },

        setVipUp(vipup) {
            this.svipup = vipup;
        },

        setVipExp(vipexp) {
            this.svipexp = vipexp;
        },

        getVipExp(){
            return this.svipexp;
        },

        getVipPro() {
            if (this.svipup<=0) return 1;
            return  this.svipexp / this.svipup;
        },

        getOfflineAward(){
            return this.offlineAward;
        },

        getOfflineTime(){
            return this.offlineTime;
        },

        getRichPoint() {
            return this._richpoint
        },

        addRichPoint(point) {
            this._richpoint += point
        },

        getPvpCardExp(){
            return this.pvp_card_exp;
        },
        setPvpCardExp(val){
            this.pvp_card_exp = val;
        },

        getPvpDefendTeam(){
            return this._pvp_defend_team;
        },
        setPvpDefendTeam(val){
            this._pvp_defend_team = val;
        },

        getCharm(){
            return this.charm;
        },

        getCharmList(){
            return this.charmList;
        },

        //大厅bonus列表
        getHallBonusList(){
            return this.bonusList
        },
        isHallBonusOpen(id){
            let bOpen = false
            if(this.bonusList){
                for(let i = 0;i < this.bonusList.length; i++){
                    if(id == this.bonusList[i]){
                        bOpen = true
                        break
                    }
                }
            }
            
            return bOpen
        },
        //开放的活动 1:BINGO
        isActivityOpen(id){
            if (this.activityList){
                for(let i = 0;i < this.activityList.length; i++){
                    if(id == this.activityList[i]){
                        return true
                    }
                }
            }
            return false
        },

        onRcvLessCoinPoplist:function(msg){
            if(msg.code == 200){
                this._notEnoughCoinPopList = {}
                this._notEnoughCoinPopList.list = msg.poplist
                this._notEnoughCoinPopList.bforse = msg.forcepop
                this._notEnoughCoinPopList.first = msg.first
                this.updatePopParams(msg.popParams)
            }
        },

        setPigbankData:function(data){
            this._pigbankData = data
        },
        getPigbankData:function(){
            return this._pigbankData
        },

        getCompleteGuide:function(){
            this.guides = this.guides || []
            return this.guides
        },

        saveCompleteGuideId:function(id){

            if(Array.isArray(id)){
                for(let i = 0; i < id.length; i++){
                    if(id[i]){
                        this.guides.push(id[i])
                    }
                    
                }
            }
            else{
                if(id){
                    this.guides.push(id)
                }
                
            }
            
        },

        //临时存储Quest信息
        setQuestInfo:function(val){
            this._questInfo = val
        },
        //获取Quest信息
        getQuestInfo:function(){
            return this._questInfo
        },
        //更新Quest进度部分数据
        updateQuestInfoData:function(val){
            if(this._questInfo){
                this._questInfo.data = val
            }
            
        },
        //更新Quest的配置部分
        updateQuestInfoCfg:function(val){
            if(this._questInfo){
                this._questInfo.roundCfg = val
            }
        },

        //quest服务端是否开启
        isOpenQuestServer:function(){
            return true//this.questopenlv
        },


        onEventRefreshVip:function(msg){
            // if(msg.code === 200){
            //     let curLevel = this.getVipLevel();
            //     let newLevel;
            //     if(msg.is_max){ // 满级
            //         newLevel = Global.VIP_INFO[Global.VIP_INFO.length-1].level;
            //     } else {
            //         newLevel = msg.info.level-1;
            //     }
            //     if(msg.cur_exp >= 0){
            //         cc.vv.UserManager.setVipExp(msg.cur_exp);
            //     }
            //     if(newLevel > curLevel){
            //         cc.vv.UserManager.setVipLevel(newLevel);
            //         cc.vv.UserManager.setVipUp(Global.VIP_INFO[newLevel].upNeedExp);

            //         cc.loader.loadRes("CashHero/prefab/vip/CH_vip_up",cc.Prefab, (err, prefab) => {
            //             let canvas = cc.find("Canvas");
            //             if (!err && cc.isValid(canvas)) {
            //                 let old = canvas.getChildByName('CH_vip_up');
            //                 if(!old){
            //                     let node = cc.instantiate(prefab);
            //                     node.parent = canvas;
            //                     node.getComponent('CH_vip_up').init(Global.VIP_INFO[newLevel])
            //                 }
            //             }
            //         })
            //     }
            //     Global.dispatchEvent(EventId.REFRUSH_VIP);
            // }
        },

        //功能是否开放
        isOpen:function(lv){
            let myLv = this.getCurLv()
            if(lv>=0 && myLv>=lv){
                return true
            }else {
                return false
            }
        },

        //进入到大厅的操作标准，像是好友解锁。需要退出到大厅然后打开好友界面
        setEnterHallAction:function(strType){
            this._hallAciton = strType
        },
        getEnterHallAction:function(){
            return this._hallAciton
        },

        //跳转到某个游戏
        setGoSpinGame:function(gameId){
            this._goGame = gameId
        },
        //获取跳转游戏
        getGoSpinGame:function(){
            return this._goGame
        },

        //存放icon的资源，
        setHallIconSpin:function(data){
            let bHas = false
            for(let i = 0;i < this._hallIconSpin.length; i++){
                if(this._hallIconSpin[i].res == data.res){
                    bHas = true
                    break

                }
            }
            if(!bHas){
                this._hallIconSpin.push(data)
                let nLen = this._hallIconSpin.length
                for(let i = nLen - 2; i >= 0; i--){
                    let resItem = this._hallIconSpin[i]
                    if(Math.abs(resItem.idx - data.idx) > 8 ){
                        // let deps = cc.loader.getDependsRecursively(resItem.res)
                        // cc.loader.release(deps);
                        cc.loader.releaseResDir(resItem.dir)
                        cc.loader.release(resItem.res)
                        this._hallIconSpin.splice(i,1)
                        cc.log('=======释放:'+resItem.dir)
                    }
                    
                }
                // if(nLen >= 15){
                //     let resItem = this._hallIconSpin.shift()

                //     // cc.loader.releaseResDir(resItem.dir)
                //     // cc.loader.release(resItem.res)
                //     cc.log('=======释放:'+resItem.dir)

                //     let deps = cc.loader.getDependsRecursively(resItem.res)
                //     cc.loader.release(deps);
                // }
            }
            
            
        },
        //释放icon的资源
        releaseHallIconSpin:function(){
            for(let i = 0; i < this._hallIconSpin.length; i++){
                let data = this._hallIconSpin[i]
                cc.loader.releaseResDir(data.dir)   
                cc.loader.release(data.res)

                // let deps = cc.loader.getDependsRecursively(data)
                // cc.loader.release(deps);
            }
            this._hallIconSpin = []
        },

        //按队列加载sloticon
        loadSlotIconByQueue:function(obj,url,loadType,loadCall){
            this._loadlist = this._loadlist || []
            let item = {}
            item.obj = obj
            item.url = url
            item.loadType = loadType
            item.loadCall = loadCall
            this._loadlist.push(item)
            this._doLoadlist()
        },

        _doLoadlist:function(){
            if(this._listloading) return
            this._listloading = true
            let item = this._loadlist.shift()
            if(item){
                let obj = item.obj
                
                cc.loader.loadRes(item.url, item.loadType, (err, data) => {
                    if(cc.isValid(obj,true)){
                        if(item.loadCall){
                            item.loadCall(err,data)
                        }
                    }
                    this._listloading = false
                    this._doLoadlist()
                })
            }
            else{
                this._listloading = false
            }
            
        },

        onRcvPullModifyLocalval:function(msg){
            if(msg.code == 200){
                if(msg.data){
                    if(msg.data.questmaxcoin){
                        this.questmaxcoin = msg.data.questmaxcoin
                    }

                    let loginpoplist = msg.data.poplist
                    if(loginpoplist){
                        cc.vv.PopUIMgr.updateLoginPopList(loginpoplist)
                    }

                    if(msg.data.palace){
                        
                        this.setBetData(msg.data.palace)
                    }
                }
            }
        },

        getServerTime() {
            return this.serverTime + (new Date().getTime() - this.logonTime) / 1000
        },

        //是否有银锤子可以领取
        isHaveSliverHarm(){
            return this._dailygift
        },
        setSliverHarm(val){
            this._dailygift = val
            Global.dispatchEvent(EventId.SLIVERICON_SHOW)
        },

        //设置选择的押注额
        setEnterSelectBet(betVal){
            this._betVal = betVal
        },
        getEnterSelectBet(){
            return this._betVal
        },
    
        //设置最大押注额
        setEnterMaxBet(betVal){
            this._maxbetVal = betVal
        },
        getEnterMaxBet(){
            return this._maxbetVal
        },

        //通过弹窗id取值
        getPopParams(id){
            if (this._popParams) {
                return this._popParams[id]
                // let _key = Object.keys(this._popParams)
                // for (let i = 0; i < _key.length; i++) {
                //     if ((""+id) == _key[i]) {
                //         return Object.values(this._popParams)[i]
                //     }
                // }
            }
            return false
        },

        updatePopParams(data){
            if(this._popParams){
                //追加
                for (var item in data) {
                    this._popParams[item] = data[item]
                }
                
            }
            else{
                this._popParams=data
            }
        },
        
        getBetData(){
            if (this._betData) {
                return this._betData
            }
        },
        setBetData(betData) {
            this._betData = betData

            
        },

        getHallRankData(){
            if (this._hallRankData) {
                return this._hallRankData
            }
            return false
        },
        setHallRankData(hallRankData){
            this._hallRankData = hallRankData
        },

        //更新，1s执行一次
        update(){
            this.bingoUpdate()
            this.exploreUpdate()
            // this.bonusTimeUpdate()
        },
        
        bingoUpdate(){
            if(Global.SYS_OPEN){
                if (this.isOpen(Global.SYS_OPEN.BINGO)) {
                    if (this.countData > 1) {
                        this.countData--
                        if (this.countData == 1) {
                            this.countData = null
                            this.getBingoPop() 
                            return
                        }
                    }
                }
            }
            
        },

        getBingoPop () {
            cc.loader.loadRes("CashHero/prefab/bingo/bingo_pop",cc.Prefab, (err, prefab) => {
                let canvas = cc.find("Canvas")
                if (!err && cc.isValid(canvas)) {
                    let old = canvas.getChildByName('bingo_pop')
                    if(!old){
                        let node = cc.instantiate(prefab);
                        node.parent = canvas;
                        node.getComponent('Bingo_Pop').firstDay(this.bingoData)
                    }
                }
            })
        },

        // bonusTimeUpdate(){
        //     let _bonusRedGiftTime = this.getBonusRedGiftTime()
        //     let _bonusDataOnlineTime = this.getBonusDataOnlineTime()
        //     if (_bonusRedGiftTime) {
        //         _bonusRedGiftTime -= 1
        //         this.setBonusRedGiftTime(_bonusRedGiftTime)
        //     }
        //     if (_bonusDataOnlineTime) {
        //         _bonusDataOnlineTime -= 1
        //         this.setBonusDataOnlineTime(_bonusDataOnlineTime)
        //     }
        // },

        // setBonusRedGiftTime(val){
        //     this._bonusRedGiftTime = val
        // },

        // getBonusRedGiftTime(){
        //     return this._bonusRedGiftTime
        // },

        // setBonusDataOnlineTime(val){
        //     this._bonusDataOnlineTime = val
        // },

        // getBonusDataOnlineTime(){
        //     return this._bonusDataOnlineTime
        // },

        getJourney(){
            return this._journey;
        },

        // 更新骑士探索活动
        exploreUpdate(){
            if(!Global.SYS_OPEN){
                return
            }
            if (this.isOpen(Global.SYS_OPEN.EXPLORATION) && this._journey) {
                if(this._journey.endTime === Math.floor(new Date().getTime()/1000)){
                    cc.loader.loadRes("CashHero/prefab/exploration/explore_pop",cc.Prefab, (err, prefab) => {
                        let canvas = cc.find("Canvas")
                        if (!err && cc.isValid(canvas)) {
                            let old = canvas.getChildByName('explore_pop')
                            if(!old){
                                let node = cc.instantiate(prefab);
                                node.parent = canvas;
                                node.getComponent('Explore_Pop').popNewSeason()
                            }
                        }
                        return
                    })

                }
            }
        },

        getFirstBuyGift () {
            return this._firstBuyGift
        },

        delFirstBuyGift () {
            this._firstBuyGift = null
        },

        getFbIconPath () {
            return this.fbIcon
        },

        setBingoFrom (data) {
            if (data) {
                this._bingoFrom = data
            }
        },

        getBingoFrom () {
            return this._bingoFrom
        },

        //设置当前总共获得卡牌数据
        setHeroData (data) {
            this.curHeroData = data
        },

        //获得当前卡牌总数据
        getHeroData () {
            return this.curHeroData ? this.curHeroData:null
        },

        //清空数据
        clearHeroData () {
            this.curHeroData = null
        },

        setPvpRank(rank) {
            this._pvpRank = rank
        },
        getPvpRank() {
            return this._pvpRank
        },
        setPvpScore(score) {
            this._pvpScore = score
        },
        getPvpScore(){
            return this._pvpScore
        },
        setPvpCC(cc) {
            this._pvpCC = cc
        },
        getPvpCC(){
            return this._pvpCC
        },

        //1 binggo 2 knight
        getOpenActiveType(){
            let nType 
            if(this.bingoData){
                nType = 1
            }
            if(this.getJourney()){
                nType = 2
            }
            return nType
        },

        syncHallInfo:function(){
            //同步大厅信息
            cc.vv.NetManager.sendAndCache({c: MsgId.REQ_SYNC_HALLINFO},true);
        },

        onRecvRefreshHallInfo:function(msg){
            if(msg.code == 200){
                this.SetCoin(msg.coin,true)
                this.setDiamond(msg.diamond,true)
                
                this.setFavourList(msg.favorite_games)
                
    
            }
        },

        isFriend:function(firendUid){
            if(this._friendData){
                return this._friendData.some(function(item) {
                    if (item.uid == firendUid) {
                        return true
                    }
                })
            }
            
        },

        reqFriendList:function(){
            let req = {c: MsgId.REQ_FRIENDS_LIST};
            req.curPage = 1;
            req.recommends = 0;  //是否需要推荐好友，1是， 0否
            cc.vv.NetManager.sendAndCache(req);
        },

        onRcvFriendsList:function(msg){
            if(msg.code == 200 && !this._hasGetList){
                this._hasGetList = true
                this._friendData = []
                for (let i=0; i<msg.items; i++) {
                    this._friendData.push(msg.items[i])
                }
            }
        },

        //添加了好友
        onFriendAdded(msg) {
            if(msg.code == 200 && !msg.spcode){
                if (!this._friendData) return
                this._friendData.push(msg.friend)
            }
        },
        //删除了好友
        onFriendRemoved(msg) {
            if(msg.code == 200){
                if (!this._friendData) return
                if (!msg.frienduids || msg.frienduids.length <= 0) return
                for (let i=0; i<msg.frienduids.length; i++) {
                    let friendid = msg.frienduids[i]
                    for (let j=0; j<this._friendData.length; j++) {
                        if (friendid == this._friendData[j].uid) {
                            this._friendData.splice(j, 1)
                            break
                        }
                    }
                }
            }
        },

        isMySelf(uid){
            return uid == this.uid
        }


    },
});
