cc.Class({
    extends: require("UserManager"),
    statics: {
        gameNewerGuide: 0,              //游戏玩法需要新手引导

        avatarframe: "avatarframe_1000",     //头像框
        chatskin: "chat_000",          //聊天框
        tableskin: "desk_000",        //牌桌
        pokerskin: 'poker_free',        //牌背
        frontskin: 'font_color_0',       //字体颜色
        emojiskin: 'emoji_0',           //表情包
        faceskin: 'poker_face_000',       //牌花
        salonskin: null,                //沙龙道具
        salontesttime: 0,                //沙龙体验道具时间

        newbiedone: 0,                  //新手任务完成  
        charmpack: 0,                  //新手1000美金大礼包
        tmpvip: 0,                      //是否领取临时VIP
        signrewards: 0,                 //自动签到奖励


        voice: 0,                       //是否打开语聊按钮

        charm: 0,                       //魅力值
        leagueexp: 0,                    //最大排位分
        rp: 0,                          //rp
        country: 0,                      //国籍
        sess: {},                        //房间相关数据

        sharelink: "",                  //FB分享链接
        uploadlink: "",                  //上传头像地址
        rateios: "",                    //IOS的商城页面
        rateandroid: "",                  //Android的商城页面

        club: {},                       //俱乐部信息
        whatapplink: "",                //whatsapp链接
        adtime: null,                   //广告信息
        emojilist: [],                  //所有表情
        verifyfriend: 0,                  //加好友是否需要验证

        contactus: "",                      //联系我们的地址
        feedback: "",                       //反馈的邮件地址

        charmList: [],                  //礼物配置
        charmDataList: [],                  //礼物免费次数

        pinlist: [],                    //好友房间菜单固定gameid
        fgamelist: [],                  //好友房间菜单可选gameid

        moneybag: 0,                    //当前金猪金币数
        // moneybagFull: 0,                //最大金猪金币数
        nextbag: 0,                //最大金猪金币数

        roomcnt: 0,                     //当前开房的数量
        viproomcnt: [],                 //VIP开房配置

        favorite_games: [],                 //最喜爱游戏gameid

        slotsList: [],                 //老虎机游戏

        redem: 0,                       //是否开启兑换码功能
        sender: 0,                       //是否开启赠送金币功能
        report: 0,                       //是否开启简易举报功能

        shoptimeout: 0,                       //限时商店是否开启

        fbrewards: [],                   //FB绑定的奖励

        blockuids: [],                   //屏蔽UIDs

        // loginData: null,                // 签到数据

        offlineaward: 0,            //离线奖励金币
        offlinetime: 0,            //距离上次离线时间

        isbindapple: 0,             //是否绑定了FB
        isbindfb: 0,                //是否绑定了Apple
        isbindgoogle: 0,                //是否绑定了google
        isbindhuawei: 0,                //是否绑定了华为
        isbindphone: 0,                //是否绑定了手机号

        getviplv: [],                //可以获取对应VIP的奖励

        leagueRmindTime: 0,         //联赛剩余时间

        novice: 0,                   //是否领取了改名字新手任务
        slotVoteCountry: 0,                   //老虎机选中的国家

        namerewards: 0,                   //新手改名字奖励

        adpics: 0,                   //广告位配置
        productids: [],                   //拉取本地价格配置

        pinmsg: [],                   //置顶聊天信息

        hasPopNotice:false,         // 是否弹弹窗
        hasPopRewardToday:false,    // 是否弹弹窗

        newapp: null,                   //新版本信息
        bonus_prom:null,                //bonus中的促销开关

        //初始化
        init: function () {
            //用Global来取用户数据
            Global.playerData = this;
            this.switch = [];
            cc.vv.NetManager.registerMsg(MsgId.GAME_LIST, this.recvGameList, this);
            // 金币不足的金币弹框
            cc.vv.NetManager.registerMsg(MsgId.PULL_CH_LESSCOIN_ACTIVELIST, this.onRcvLessCoinPoplist, this)
            // modify localval
            cc.vv.NetManager.registerMsg(MsgId.PULL_MODIFY_LOCALVAL, this.onRcvPullModifyLocalval, this)
            // 大厅信息同步
            cc.vv.NetManager.registerMsg(MsgId.REQ_SYNC_HALLINFO, this.onRecvRefreshHallInfo, this);

            // --------------  监听 服务器通知的用户数据发送改变 -----------------------
            // vip等级变化
            cc.vv.NetManager.registerMsg(MsgId.REQ_REFRESH_VIP, this.REQ_REFRESH_VIP, this);  //vip升级
            // 钻石和金币变化更新
            cc.vv.NetManager.registerMsg(MsgId.MONEY_CHANGED, this.MONEY_CHANGED, this);
            // 主动同步金币
            cc.vv.NetManager.registerMsg(MsgId.SYNC_COIN, this.SYNC_COIN, this);
            // BounsList改变
            cc.vv.NetManager.registerMsg(MsgId.CHANGE_BONUS_LIST, this.CHANGE_BONUS_LIST, this);
            // 经验值变化
            cc.vv.NetManager.registerMsg(MsgId.PULL_LEVEL_UP_EXP, this.PULL_LEVEL_UP_EXP, this);
            // 监听用户信息更新
            cc.vv.NetManager.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this,true);
            // 监听俱乐部信息更新
            cc.vv.NetManager.registerMsg(MsgId.CLUB_UPDATE_INFO, this.CLUB_UPDATE_INFO, this);
            // 俱乐部被踢 或者 被通过
            cc.vv.NetManager.registerMsg(MsgId.NOTIFY_CLUB_JOIN, this.NOTIFY_CLUB_JOIN, this);
            cc.vv.NetManager.registerMsg(MsgId.NOTIFY_CLUB_REMOVE, this.NOTIFY_CLUB_REMOVE, this);
            // 礼物广播
            cc.vv.NetManager.registerMsg(MsgId.USER_GIFT_BROADCAST, this.USER_GIFT_BROADCAST, this);
            // 走马灯消息
            cc.vv.NetManager.registerMsg(MsgId.GLOBAL_SPEAKER_NOTIFY, this.GLOBAL_SPEAKER_NOTIFY, this);
            // 邮件消息
            cc.vv.NetManager.registerMsg(MsgId.GLOBAL_MAIL_NOTIFY, this.GLOBAL_MAIL_NOTIFY, this);
            // 金猪同步消息
            cc.vv.NetManager.registerMsg(MsgId.PIGGY_BANK_NOTIFY, this.PIGGY_BANK_NOTIFY, this);
            // 任务完成通知
            cc.vv.NetManager.registerMsg(MsgId.TASK_COMPLETE_NOTIFY, this.TASK_COMPLETE_NOTIFY, this);
            // 收到一条好友私聊信息
            cc.vv.NetManager.registerMsg(MsgId.SOCIAL_FRIEND_MSG_REV, this.SOCIAL_FRIEND_MSG_REV, this);
            // 获取分享奖励
            cc.vv.NetManager.registerMsg(MsgId.GAME_SHARE_REWARD, this.GAME_SHARE_REWARD, this);
            cc.vv.NetManager.registerMsg(MsgId.LEAGUE_LEVEL_UP, this.LEAGUE_LEVEL_UP, this);
            // 联赛分数更新
            cc.vv.NetManager.registerMsg(MsgId.LEAGUE_EXP_CHANGE, this.LEAGUE_EXP_CHANGE, this);
            // 国家投票最高票数更新
            cc.vv.NetManager.registerMsg(MsgId.COUNTRY_TOP_CHANGE, this.COUNTRY_TOP_CHANGE, this);
            // 多米诺 分享奖励 (特殊处理)
            // cc.vv.NetManager.registerMsg(126005, this.REC_GAME_SETTLE, this);
            // 淘汰赛准备通知
            cc.vv.NetManager.registerMsg(MsgId.REQ_KNOCKOUT_READY, this.REQ_KNOCKOUT_READY, this);
            // 淘汰赛错过后退钱通知
            cc.vv.NetManager.registerMsg(MsgId.REQ_KNOCKOUT_EXIT, this.REQ_KNOCKOUT_EXIT, this);
            // 进入返回
            cc.vv.NetManager.registerMsg(MsgId.REQ_KNOCKOUT_JOIN, this.REQ_KNOCKOUT_JOIN, this);

            //消息置顶
            cc.vv.NetManager.registerMsg(MsgId.UPDATE_PINMSG, this.UPDATE_PINMSG, this,true);

            // //请求支付限制信息
            // cc.vv.NetManager.registerMsg(MsgId.GET_WITHDRAWINFO, this.GET_WITHDRAWINFO, this);

            setInterval(this.update.bind(this), 100);
        },

        initPlayerData(serverData, loginConfig) {
            var playerData = serverData.playerInfo;
            // 游戏入口配置
            this.gameList = loginConfig.gamelist || [];

            // //===test
            // let bTestShow = Global.testPack
            // if(bTestShow){
            //     this.gameList = [{id:292,ord:1},{id:265,ord:2},{id:287,ord:3},{id:293,ord:4}]
            // }
            // //====

            this.gameList.sort((a, b) => { return a.ord - b.ord });
            // slots游戏配置
            this.slotsList = loginConfig.slotslist || [];

            // //====test
            // if(bTestShow){
            //     this.slotsList = []
            // }
            // //====
            
            this.slotsList.sort((a, b) => { return a.ord - b.ord });

            this.productids = loginConfig.productids || [];
            this.pinmsg = loginConfig.pinmsg;                     //聊天界面置顶数据

            this.slotVoteCountry = serverData.country || 0                  //老虎机投票国家
            this.namerewards = loginConfig.namerewards || []                 //新手改名字任务
            this.adpics = loginConfig.adpics || {}                           //广告位配置
            this.newbiedone = serverData.newbiedone || 0                    //新手任务完成状态
            this.charmpack = playerData.charmpack || 0                    //新手任务完成状态
            this.voice = serverData.voice || 0                              //是否开启语聊按钮
            this.tmpvip = playerData.tmpvip || 0                    //新手任务完成状态

            this.newapp = serverData.newappurl                                   //新版本信息
            //this.signrewards = serverData.signrewards                       //自动签到奖励
            this.vipsign = serverData.vipsign

            this.redem = serverData.verify.redem || 0                  //是否开启兑换码功能
            this.sender = serverData.verify.sender || 0                  //是否开启兑换码功能
            this.report = serverData.verify.report || 0                  //是否开启兑换码功能

            this.shoptimeout = loginConfig.shoptimeout || 0                  //限时商店是否开启
            this.novice = playerData.novice || 0                  //是否领取了改名字新手任务

            this.rate = loginConfig.rate || 0                  //是否弹窗点赞引导
            this.guide = playerData.guide || []                  //已经完成的引导列表
            this.club = serverData.club || {};                    // 俱乐部信息
            this.sess = serverData.sess;                    //匹配与排位游戏盲注配置
            this.sharelink = loginConfig.sharelink || "";              // FB分享链接
            this.uploadlink = loginConfig.uploadlink || "";
            this.rateios = loginConfig.rateios || "";
            this.rateandroid = loginConfig.rateandroid || "";
            this.contactus = loginConfig.contactus || "";
            //保存一下客服地址
            Global.saveLocal('contacturl',this.contactus)
            this.reg_bonus_coin = loginConfig.reg_bonus_coin    //注册送的金币数量
            this.sign_bonus_coin = loginConfig.sign_bonus_coin  //签到送的总金币数量

            this.feedback = loginConfig.feedback || "";
            this.charmList = loginConfig.charmList || [];        //礼物配置
            this.charmList.sort((a, b) => {
                return a.count - b.count;
            })

            this.charmDataList = playerData.charmlist || [];        //礼物免费次数

            this.pinlist = playerData.pinlist || [];        //沙龙配置
            this.fgamelist = playerData.fgamelist || [];        //沙龙配置

            // this.whatapplink = loginConfig.whatapplink || "";              // whatsapp链接
            // this.adtime = serverData.adtime;                    // 广告数据


            this.bindfbcoin = playerData.bindfbcoin;            // 绑定FB奖励金币
            this.bindfbdiamond = playerData.bindfbdiamond;      // 绑定FB奖励钻石
            this.newerpack = playerData.newerpack;              // 新手礼包状态

            this.avatarframe = playerData.avatarframe;      //头像框ID
            this.chatskin = playerData.chatskin;            //聊天框
            this.tableskin = playerData.tableskin;          //牌桌
            this.pokerskin = playerData.pokerskin;          //牌背
            this.frontskin = playerData.frontskin;          //字体颜色
            this.emojiskin = playerData.emojiskin;          //表情包
            this.emojilist = playerData.emojilist;            //所有表情
            this.faceskin = playerData.faceskin;            //牌花
            this.salonskin = playerData.salonskin;            //牌花
            this.salontesttime = playerData.salontesttime;            //牌花
            this.verifyfriend = playerData.verifyfriend;    //加好友是否需要验证
            this.charm = playerData.charm;                  //魅力值
            this.leagueexp = playerData.leagueexp;                  //排位分
            this.rp = playerData.rp || 0;                  //rp
            this.country = playerData.country || 0;                  //国籍
            this.getviplv = playerData.getviplv || [];

            // this.level = playerData.level;

            this.moneybag = playerData.moneybag;            //金猪当前值
            // this.moneybagFull = playerData.moneybagFull;            //金猪最大值
            this.nextbag = playerData.nextbag;            //金猪最大值
            this.roomcnt = playerData.roomcnt;            //当前开房数

            this.viproomcnt = playerData.viproomcnt || [];                    // 开房配置
            this.favorite_games = loginConfig.favorite_games || [];                    // 喜爱游戏

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
            this.isbindfb = playerData.isbindfb || 0;
            this.isbindapple = playerData.isbindapple || 0;
            this.isbindgoogle = playerData.isbindgoogle || 0;
            this.isbindghuawei = playerData.isbindghuawei || 0;
            this.isbindphone = playerData.isbindphone || 0;
            this.fbrewards = playerData.fbrewards || []; //FB绑定的奖励
            this.blockuids = playerData.blockuids || []; //屏蔽UIDS
            this.fbicon = playerData.fbicon    //fb头像地址
            this.spread = playerData.spread || 0;    //推广总代级别0，1，2，3
            this.luckRedvelopesNum = playerData.luckRedvelopesNum
            this.growup = serverData.growup
            this.evo = serverData.evo
            this._curExp = playerData.levelexp
            // this._updateExp = playerData.levelup
            this.initgift = playerData.initgift;
            this.svip = playerData.svip || 0;
            this.svipexp = playerData.svipexp || 0;
            this.nextvipexp = playerData.nextvipexp || 0;   // vip升级到下一级需要充值的金额
            this.svipup = playerData.svipup || 0;
            this.leftdays = playerData.leftdays || 0;
            this.bonusList = loginConfig.bonuslist || [];
            this.activityList = serverData.activitylist
            this.offlineaward = playerData.offlineaward;    // 离线奖励
            this.offlinetime = playerData.offlinetime;      // 离线时间
            this.popLuckySpin = serverData.fbshare || serverData.bonuswheel //是否需要弹出转盘

            this.ecoin = playerData.ecoin;  // 不可提现金额
            this.dcoin = playerData.dcoin;  // 可提现金额
            this.cashbonus = playerData.cashbonus;  // 优惠钱包金额
            this.dcashbonus = playerData.dcashbonus;  // 可提现到现金余额的金额
            this.bankcoin = playerData.bankcoin;  // 保险箱余额
            this.todaybonus = playerData.todaybonus;  //

            this.invit_uid = playerData.invit_uid //上级代理的uid

            

            this.logonTime = new Date().getTime()
            this.serverTime = serverData.servertime
            this._levelGift = 0;
            this._richpoint = playerData.upoint
            this._diamond = playerData.diamond || 0

            this.kyc = playerData.kyc || 0;

            this.payurl = loginConfig.payurl;
            this.contactus = loginConfig.contactus;
            this.kycUrl = loginConfig.kyc;
            this.drawUrl = loginConfig.drawurl;
            this.transactionUrl = loginConfig.transaction;
            this.paymentUrl = loginConfig.payment;
            this.addInvite = playerData.invits //新增的代理数
            this.emotionProplist = loginConfig.proplist
            this.lepordgames = loginConfig.lbgames //排行榜游戏参与的游戏
            this.salonVip = loginConfig.salonvip //沙龙限制的vip
            this.notice = loginConfig.notice
            this.rebatGames = loginConfig.rbgameids
            
            this.todayrewards = loginConfig.todayrewards
            this.bonus_prom = loginConfig.promoopen //bonus中促销是否打开

            Global.saveLocal(Global.SAVE_KEY_LOGIN_TYPE, this.logintype);
            this._preLoad = [] //预加载记录
            var compare = function (prop) {
                return function (obj1, obj2) {
                    var val1 = obj1[prop];
                    var val2 = obj2[prop]; if (val1 < val2) {
                        return -1;
                    } else if (val1 > val2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
            // 记住密码
            // 保存token
            let tokenList = Global.getLocal(Global.SAVE_PLAYER_TOKEN);
            if (tokenList === undefined) {
                tokenList = {};
            }
            else {
                tokenList = JSON.parse(tokenList);
            }
            if (this.logintype !== Global.LoginType.Guest) {
                if (this.rememberPsw) {
                    if (!tokenList[this.nickName]) tokenList[this.nickName] = {};
                    tokenList[this.nickName].token = this.token;
                }
                else {
                    if (tokenList[this.nickName]) tokenList[this.nickName] = {};
                }
            }
            tokenList["curr_account"] = this.nickName;                  // 当前登录账号
            Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(tokenList));

            if (Global.IsHuawei()) {
                if (serverData.reg) {//1 新用户

                    let eventval2 = {
                        "$AcountType": "hw_account",
                        "$RegistMethod": "hw_account",
                        "$OccurredTime": cc.sys.now(),
                        "$Inviter": "none",
                    }
                    cc.vv.PlatformApiMgr.KoSDKTrackEvent("$RegisterAccount", JSON.stringify(eventval2))


                }
                else {
                    //sign in
                    let eventval = {
                        "$RoleClass": "NewPlayer",
                        "$RoleName": this.nickName,
                        "$FirstSignIn": 0,
                        "$RoleGender": this.sex || "w",
                        "$Server": "s1",
                        "$Combat": "0",
                        "$LevelId": this.getCurLv(),
                    }
                    cc.vv.PlatformApiMgr.KoSDKTrackEvent("$SignInRole", JSON.stringify(eventval))
                }
            }
        },

        //重写内置游戏
        isNoNeedDownGame(gameId) {
            let res
            let noNeedDowns = cc.vv.UserConfig.gameMap; //内置游戏，不需要下载
            for (let i = 0; i < noNeedDowns.length; i++) {
                let item = noNeedDowns[i]
                if (item.gameid == gameId) {
                    res = !item.bDownload
                    break
                }
            }
            return res
        },
        // 游戏入口配置
        recvGameList(msg) {
            if (msg.code === 200) {
                if(msg.gamelist[0]){
                    this.gameList = msg.gamelist[0];
                    this.gameList.sort((a, b) => {
                        return a.ord - b.ord;
                    });
                }

                if(msg.gamelist[1]){
                    this.slotsList = msg.gamelist[1]
                    this.slotsList.sort((a, b) => {
                        return a.ord - b.ord;
                    });
                }
                
                Global.dispatchEvent("GAME_LIST_UPDATE");
            }
        },
        // 服务器推送 金币钻石变化同步
        MONEY_CHANGED: function (msg) {
            if (msg.code === 200) {
                if (msg.bankcoin != undefined) {
                    cc.vv.UserManager.setBankCoin(msg.bankcoin)
                }
                if (msg.coin != undefined) {
                    cc.vv.UserManager.SetCoin(msg.coin, true)
                }
                if (msg.diamond != undefined) {
                    cc.vv.UserManager.setDiamond(msg.diamond, true)
                }
            }
        },

        // 主动同步金币
        SYNC_COIN: function (msg) {
            if (msg.code === 200) {
                cc.vv.UserManager.SetCoin(msg.coin, true)
                cc.vv.UserManager.setDiamond(msg.diamond, true)
                // 额外需要同步一下exp
                // cc.vv.UserManager.setCurLv(msg.level);
                cc.vv.UserManager.setCurExp(msg.levelexp);
                // cc.vv.UserManager.setUpdateExp(msg.levelup);
                // 发出事件通知
                Global.dispatchEvent("USER_EXP_CHANGE");
            }
        },

        // 设置
        SetCoin(val, bRefushHall) {
            this.coin = Number(val.toFixed(2));
            // this.totalcoin = this.coin + this.cashbonus + this.bankcoin;
            if (bRefushHall) {
                Global.dispatchEvent(EventId.UPATE_COINS)
            }
        },

        // BounsList改变
        CHANGE_BONUS_LIST(msg) {
            if (msg.code != 200) return;
            // 更新本地数据
            cc.vv.UserManager.bonusList = msg.bonuslist;
            // 发出事件通知
            Global.dispatchEvent("BONUS_CHANGE");
        },
        // 更新本地用户信息
        UPDATE_USER_INFO(msg) {
            if (msg.code != 200) return;
            if(msg.spcode){
                let spVal = msg.spcode
                if(spVal == 1073){
                    cc.vv.FloatTip.show("This username is not available")
                }
                return
            }
            let data = msg.user;
            // 修改内存数据
            if (data.playername != undefined) cc.vv.UserManager.nickName = data.playername;
            if (data.sex != undefined) cc.vv.UserManager.sex = data.sex;
            if (data.redem != undefined) cc.vv.UserManager.redem = data.redem;
            if (data.sender != undefined) cc.vv.UserManager.sender = data.sender;
            if (data.report != undefined) cc.vv.UserManager.report = data.report;
            if (data.usericon != undefined) cc.vv.UserManager.userIcon = data.usericon;
            if (data.avatarframe != undefined) cc.vv.UserManager.avatarframe = data.avatarframe;
            if (data.chatskin != undefined) cc.vv.UserManager.chatskin = data.chatskin;
            if (data.tableskin != undefined) cc.vv.UserManager.tableskin = data.tableskin;
            if (data.pokerskin != undefined) cc.vv.UserManager.pokerskin = data.pokerskin;
            if (data.frontskin != undefined) cc.vv.UserManager.frontskin = data.frontskin;
            if (data.emojiskin != undefined) cc.vv.UserManager.emojiskin = data.emojiskin;
            if (data.faceskin != undefined) cc.vv.UserManager.faceskin = data.faceskin;
            if (data.salonskin != undefined) cc.vv.UserManager.salonskin = data.salonskin;
            if (data.salontesttime != undefined) cc.vv.UserManager.salontesttime = data.salontesttime;
            if (data.svip != undefined) cc.vv.UserManager.svip = data.svip;
            if (data.svipexp != undefined) cc.vv.UserManager.svipexp = data.svipexp;
            if (data.nextvipexp != undefined) cc.vv.UserManager.nextvipexp = data.nextvipexp;
            if (data.svipup != undefined) cc.vv.UserManager.svipup = data.svipup;
            if (data.leftdays != undefined) cc.vv.UserManager.leftdays = data.leftdays;
            if (data.emojilist != undefined) cc.vv.UserManager.emojilist = data.emojilist;
            if (data.verifyfriend != undefined) cc.vv.UserManager.verifyfriend = data.verifyfriend;
            if (data.viproomcnt != undefined) cc.vv.UserManager.viproomcnt = data.viproomcnt;
            if (data.charm != undefined) cc.vv.UserManager.charm = data.charm;
            if (data.leagueexp != undefined) cc.vv.UserManager.leagueexp = data.leagueexp;
            if (data.fgamelist != undefined) cc.vv.UserManager.fgamelist = data.fgamelist;
            if (data.blockuids != undefined) cc.vv.UserManager.blockuids = data.blockuids;
            if (data.roomcnt != undefined) cc.vv.UserManager.roomcnt = data.roomcnt;
            if (data.rp != undefined) cc.vv.UserManager.rp = data.rp;
            if (data.country != undefined) cc.vv.UserManager.country = data.country;
            if (data.getviplv != undefined) cc.vv.UserManager.getviplv = data.getviplv;
            if (data.tmpvip != undefined) cc.vv.UserManager.tmpvip = data.tmpvip;
            // if (data.moneybagFull != undefined) cc.vv.UserManager.moneybagFull = data.moneybagFull;
            if (data.nextbag != undefined) cc.vv.UserManager.nextbag = data.nextbag;
            if (data.charmlist != undefined) cc.vv.UserManager.charmDataList = data.charmlist;
            
            if (data.coin != undefined) cc.vv.UserManager.SetCoin(data.coin, true)
            if (data.ecoin != undefined) cc.vv.UserManager.ecoin = data.ecoin;
            if (data.dcoin != undefined) cc.vv.UserManager.dcoin = data.dcoin;
            if (data.cashbonus != undefined) cc.vv.UserManager.cashbonus = data.cashbonus;
            if (data.dcashbonus != undefined) cc.vv.UserManager.dcashbonus = data.dcashbonus;
            if (data.bankcoin != undefined) cc.vv.UserManager.bankcoin = data.bankcoin;
            if (data.todaybonus != undefined) cc.vv.UserManager.todaybonus = data.todaybonus;
            if (data.kyc != undefined) cc.vv.UserManager.kyc = data.kyc
            if (data.isbindphone != undefined) cc.vv.UserManager.isbindphone = data.isbindphone
            
            if (data.moneybag != undefined) {
                cc.vv.UserManager.moneybag = data.moneybag;
                if (data.moneybag > 0) {
                    //动画表现
                    Global.dispatchEvent("USER_PIGGY_BANK_HINT_NEW");
                }
                //同时刷新UI TODO：感觉可以合成一个消息的
                //bag值变化
                Global.dispatchEvent("USER_PIGGY_BANK_CHANGE");
            }
            if (data.invits) {
                Global.dispatchEvent("EVENT_ADD_REFFER", data.invits);
            }
            // 发送事件 通知信息已经更新
            Global.dispatchEvent("USER_INFO_CHANGE");
        },
        // 更新俱乐部信息
        CLUB_UPDATE_INFO(msg) {
            if (msg.code != 200) return;
            if (msg.spcode && msg.spcode > 0) return;
            let club = msg.club || {};
            if (club.name != undefined) cc.vv.UserManager.club.name = club.name;
            if (club.avatar != undefined) cc.vv.UserManager.club.avatar = club.avatar;
            if (club.detail != undefined) cc.vv.UserManager.club.detail = club.detail;
            if (club.cap != undefined) cc.vv.UserManager.club.cap = club.cap;
            if (club.join_type != undefined) cc.vv.UserManager.club.join_type = club.join_type;
            // 发送事件 通知信息已经更新
            Global.dispatchEvent("CLUB_INFO_CHANGE");
        },
        // 被俱乐部加入
        NOTIFY_CLUB_JOIN(msg) {
            cc.vv.UserManager.club = msg.club;
        },
        // 被俱乐部踢出
        NOTIFY_CLUB_REMOVE(msg) {
            cc.vv.UserManager.club = {};
        },
        // 用户等级提升
        PULL_LEVEL_UP_EXP(msg) {
            if (msg.code != 200) return;
            // 修改本地数据
            cc.vv.UserManager.setCurExp(msg.info.levelexp);
            // 发出事件通知
            Global.dispatchEvent("USER_EXP_CHANGE");
        },
        // 排位赛等级提升
        LEAGUE_LEVEL_UP(msg) {
            if (msg.code != 200) return;
        },
        // VIP变化
        REQ_REFRESH_VIP: function (msg) {
            if (msg.code != 200) return;
            // 提示VIP升级 TODO
            // cc.vv.PopupManager.addPopup("BalootClient/ShopV2/prefabs/PopupVipUpgrade", {
            //     scaleIn: true,
            //     onShow: (node) => {
            //         let cpt = node.getComponent("PopupVipUpgrade")
            //         if (cpt) {
            //             cpt.onInit({ wait: msg.svip != 1, svip: msg.svip });
            //         }
            //     }
            // });
        },
        // 礼物广播
        USER_GIFT_BROADCAST(msg) {
            if (msg.code != 200) return;
            // 拒接他人礼物动画
            let isRefuseGiftAnim = Global.getLocal("REFUSE_GIFT_ANIM", 0);
            if (isRefuseGiftAnim == 1 && (msg.send.uid != cc.vv.UserManager.uid && msg.receive.uid != cc.vv.UserManager.uid)) {
                return;
            }
            // // 过滤自己送的礼物(自己送的礼物 客户端会提前处理)
            // if (msg.send.uid == cc.vv.UserManager.uid) {
            //     return;
            // }
            if (cc.director.getScene().name == Global.SCENE_NAME.HALL) {
                cc.vv.BroadcastManager.addGiftAnim(msg);
            } else {
                // 房间内存在接受者,则播放动画
                if (window.facade && window.facade.commonProxy && window.facade.commonProxy.checkPlayerInTable) {
                    if (window.facade.commonProxy.checkPlayerInTable(msg.send.uid) || window.facade.commonProxy.checkPlayerInTable(msg.receive.uid)) {
                        cc.vv.BroadcastManager.addGiftAnim(msg);
                    }
                }
                //或者在slot中
                if (cc.vv.gameData && cc.vv.gameData.getGameId && cc.vv.gameData.getGameId() > 600) {
                    if (msg.receive.uid == cc.vv.UserManager.uid) {
                        cc.vv.BroadcastManager.addGiftAnim(msg);
                    }
                }
            }
        },
        // 走马灯
        GLOBAL_SPEAKER_NOTIFY(msg) {
            if (msg.code != 200) return;
            // 进行跑马灯播报
            cc.vv.BroadcastManager.addBroadcast({
                content: msg.notices.msg,
                extra_info: msg.notices.extra_info,
                direction: cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR ? 2 : 1,
                level: msg.level,
            });
        },
        // 邮件
        GLOBAL_MAIL_NOTIFY(msg) {
            if (msg.code != 200) return;
            cc.vv.RedHitManager.setKeyVal("mail_notify", cc.vv.RedHitManager.data["mail_notify"]+1);
        },
        // 金猪
        PIGGY_BANK_NOTIFY(msg) {
            if (msg.code != 200) return;
            // 更新金猪的金币数
            this.moneybag = msg.moneybag;
            this.nextbag = msg.nextbag;
            // this.moneybagFull = msg.moneybagFull;
            // 发出事件通知
            Global.dispatchEvent("USER_PIGGY_BANK_CHANGE");
        },
        // 任务完成通知
        TASK_COMPLETE_NOTIFY(msg) {
            if (cc.director.getScene().name == Global.SCENE_NAME.HALL) return;
            cc.loader.loadRes("YD_Pro/TaskCompleteHint/TaskCompleteHint", cc.Prefab, (err, prefab) => {
                if (!!err) return;
                if(cc.find("Canvas/TaskCompleteHint")) {


                } else {
                    let node = cc.instantiate(prefab);
                    node.parent = cc.find("Canvas");
                    node.name = "TaskCompleteHint";
                    node.zIndex = 1000;
                    node.getComponent("TaskCompleteHintCpt").run(msg);
                }
            });
        },
        // 收到一条好友私聊信息 
        SOCIAL_FRIEND_MSG_REV(msg) {
            // 自己不接受自己发的私聊信息
            if (msg.data.uid == cc.vv.UserManager.uid) return;
            // 如果已经在私聊界面 则不提示
            let topPopup = cc.vv.PopupManager.getTop()
            if (topPopup) {
                let chatCpt = topPopup.getComponent("PopupPrivateChatView")
                if (chatCpt && chatCpt.uid == msg.data.uid) {
                    return;
                }
            }
            cc.loader.loadRes("BalootClient/Social/PrivateChatMsgHint", cc.Prefab, (err, prefab) => {
                if (!!err) return;
                let node = cc.instantiate(prefab);
                node.parent = cc.find("Canvas")
                node.zIndex = 1000;
                node.getComponent("PrivateChatMsgHintCpt").run(msg.data);
            });
        },
        // 分享奖励结果
        GAME_SHARE_REWARD(msg) {
            if (msg.code != 200) return;
            if (msg.spcode && msg.spcode > 0) {
                cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
                return;
            }
            if (!!msg.rewards) {
                Global.RewardFly(msg.rewards, cc.find("Canvas").convertToWorldSpaceAR(cc.v2(0, -cc.winSize.height / 2 + 700)));
            }
        },
        // 多米诺大结算
        REC_GAME_SETTLE(msg) {
            if (!msg.fbshare) return;
            let fbShareData = msg.fbshare[cc.vv.UserManager.uid];
            if (!fbShareData) return;
            let facade = window.facade;
            if (!facade) return;
            cc.loader.loadRes('games/PokerBase/prefabs/settlement_btn_share_fb', cc.Prefab, (err, prefab) => {
                if (err) return;
                let shareBtnNode = cc.instantiate(prefab);
                shareBtnNode.parent = cc.find("Canvas/safe_node");
                shareBtnNode.y = -cc.winSize.height / 2 + 700;
                shareBtnNode.active = false;
                cc.find("layout/multiple", shareBtnNode).getComponent(cc.Label).string = "x" + fbShareData.times;
                shareBtnNode.getComponent(cc.Button).node.on("click", () => {
                    shareBtnNode.getComponent(cc.Button).interactable = false;
                    // 确定分享地址
                    let shareLink = null;
                    let gameid = facade.dm.tableInfo.gameId;
                    let lang = cc.vv.i18nManager.getLanguage();
                    if (fbShareData.type == 1) {
                        // type=1 累计赢:
                        shareLink = `http://inter.sekiengame.com/fb/win/total/?uid=${cc.vv.UserManager.uid}&lang=${lang}&gameid=${gameid}`
                    } else if (fbShareData.type == 2) {
                        // type=2 连续赢:
                        shareLink = `http://inter.sekiengame.com/fb/win/cumulative/?uid=${cc.vv.UserManager.uid}&lang=${lang}&gameid=${gameid}`
                    } else if (fbShareData.type == 3) {
                        // type=3 牌型:
                        shareLink = `http://inter.sekiengame.com/fb/win/card/?uid=${cc.vv.UserManager.uid}&lang=${lang}&gameid=${gameid}`
                    }
                    if (shareLink) {
                        if (Global.isNative()) {
                            cc.vv.FBMgr.fbShareWeb(shareLink, null, "", (data) => {
                                // 分享成功
                                cc.vv.NetManager.send({ c: MsgId.GAME_SHARE_REWARD, gameid: gameid, cat: fbShareData.type });
                            });
                        } else if (CC_DEBUG) {
                            cc.vv.NetManager.send({ c: MsgId.GAME_SHARE_REWARD, gameid: gameid, cat: fbShareData.type });
                        }
                    }
                }, this);
                // 延迟销毁
                cc.tween(shareBtnNode).delay(3.5).call(() => {
                    shareBtnNode.active = true
                    shareBtnNode.getComponent(cc.Button).interactable = true;
                }).delay(5).call(() => {
                    shareBtnNode.destroy()
                }).start();
            })
        },
        // 联赛分数更新
        LEAGUE_EXP_CHANGE(msg) {
            if (msg.code == 200) {
                for (const item of this.gameList) {
                    if (item.id == msg.gameid) {
                        item.leagueexp = msg.exp;
                    }
                }
            }
        },
        // 国家投票最高票数更新
        COUNTRY_TOP_CHANGE(msg) {
            if (msg.code == 200) {
                for (const item of this.gameList) {
                    if (item.id == msg.gameid) {
                        item.topCountry = msg.topCountry;
                    }
                }
            }
        },
        // 淘汰赛开始通知
        REQ_KNOCKOUT_READY(msg) {
            if (cc.director.getScene().name != Global.SCENE_NAME.HALL) return;
            cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutHintStart", {
                scaleIn: true,
                noCloseHit: true,
                onShow: (node) => {
                    node.getComponent("KnockoutHintStartView").onInit(msg);
                }
            });
        },
        // 淘汰赛退钱通知
        REQ_KNOCKOUT_EXIT(msg) {
            if (cc.director.getScene().name == Global.SCENE_NAME.HALL) {
                cc.vv.PopupManager.removeAll();
                cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutHintNotJoin", {
                    scaleIn: true,
                    noCloseHit: true,
                    noTouchClose: true,
                    noCloseHit: true,
                    onShow: (node) => {
                        cc.find("node_time/value", node).getComponent(cc.Label).string = Global.formatTime("hh:mm", msg.start_time || 0);
                        cc.find("btn_ok", node).on("click", () => {
                            cc.vv.PopupManager.removePopup(node);
                            
                        })
                    }
                });
            } else {
                // 判断是否在对应的游戏
                cc.vv.PopupManager.removeAll();
                // if (window.facade && window.facade.dm && window.facade.dm.deskInfo && window.facade.dm.deskInfo.conf && window.facade.dm.deskInfo.conf.tn_id && window.facade.dm.deskInfo.conf.tn_id == msg.tn_id) {
                if(cc.vv.gameData && cc.vv.gameData.deskInfo && cc.vv.gameData.deskInfo.conf && cc.vv.gameData.deskInfo.conf.tn_id && cc.vv.gameData.deskInfo.conf.tn_id == msg.tn_id){
                    cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutHintNotJoin", {
                        scaleIn: true,
                        noCloseHit: true,
                        noTouchClose: true,
                        noCloseHit: true,
                        onShow: (node) => {
                            cc.find("node_time/value", node).getComponent(cc.Label).string = Global.formatTime("hh:mm", msg.start_time || 0);
                            cc.find("btn_ok", node).on("click", () => {
                                cc.vv.PopupManager.removePopup(node);
                                if (window.facade && window.facade.gotoHall) {
                                    window.facade.gotoHall();
                                }
                                else{
                                    if(cc.vv.gameData.doExitRoom){
                                        cc.vv.gameData.doExitRoom()
                                    }
                                }
                                

                            })
                        }
                    });
                }
            }
        },
        // 尝试进入比赛结果
        REQ_KNOCKOUT_JOIN(msg) {
            if (msg.code != 200) return;
            if (msg.spcode && msg.spcode > 0) {
                cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
                cc.vv.PopupManager.removeAll();
                return;
            }
        },

        UPDATE_PINMSG(msg){
            if(msg.code == 200){
                this.pinmsg = msg.pinmsg
            }
        },

        setLeagueRemindTime(val) {
            this.leagueRmindTime = val
        },

        leagueexpTime() {
            if (this.leagueRmindTime) {
                this.leagueRmindTime -= 1
                if (this.leagueRmindTime < 0) {
                    this.leagueRmindTime = 0
                }
            }
        },

        updateTimer(dt) {
            this.leagueexpTime()
        },

        level() {
            return cc.vv.UserConfig.totalExp2Level(this._curExp);
        },

        //overwrite
        getCurLv() {
            return this.level()
        },

        getVip() {
            return cc.vv.UserConfig.vipExp2Level(cc.vv.UserManager.svipexp);
        },

        //新增的代理数
        getAddInvite() {
            return this.addInvite
        },

        // 设置震动开关状态
        setShakeStatus(status) {
            if (status) {
                Global.saveLocal("ROOM_SHAKE_STAUS", "1");
            } else {
                Global.saveLocal("ROOM_SHAKE_STAUS", "0");
            }
        },
        // 获取震动开关状态
        getSkateStatus() {
            let status = Global.getLocal("ROOM_SHAKE_STAUS", "1");
            if (status && status == "1") {
                return true;
            }
            return false;
        },

        getRegisterCoin(){
            return this.reg_bonus_coin
        },

        getSignTotalCoin(){
            return this.sign_bonus_coin
        },

        //游戏是否开放
        isGameOpen(gameid){
            for (const _item of cc.vv.UserManager.gameList) {
                if (_item.id == gameid || gameid == 9999) {
                    return true;
                }
            }
            return false;
        },

        // //获取充值限制信息
        // getDrawInfo(){
        //     return this.drawinfo
        // },

        // sendReqDrawInfo(){
        //     cc.vv.NetManager.sendAndCache({c:MsgId.GET_WITHDRAWINFO})
        // },

        // GET_WITHDRAWINFO(msg){
        //     if(msg.code == 200){
        //         this.drawinfo = msg.drawinfo

        //     }
        // },


        showChargeUI(){
            // let _pDrawinfo = cc.vv.UserManager.getDrawInfo()
            // if(_pDrawinfo && _pDrawinfo.coin > _pDrawinfo.maxcoin){

            //     if(_pDrawinfo.isfirstdeposit){
            //         //需要提示
            //         let url = "YD_Pro/prefab/yd_withdarwtips"
            //         cc.vv.PopupManager.addPopup(url, {
            //             onShow:(node) =>{
            //                 node.getComponent("yd_withdrawTips").showTipType(2,_pDrawinfo.maxcoin)
            //             }
            //         })
            //         return
            //     }
            // }
            

            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                }
            })
        },

        getLepGames(){
            return this.lepordgames
        },

        //是否在排行榜的游戏列表
        isInLepGames(val){
            let res = false
            if(this.lepordgames){
                for(let i = 0; i < this.lepordgames.length; i++){
                    if(val == this.lepordgames[i]){
                        res = true
                        break
                    }
                }
            }
            
            return res
        },

        getSalonVip(){
            return this.salonVip
        },

        //是否在反水游戏列表
        isInRebateGames(val){
            let res = false
            for(let i = 0; i < this.rebatGames.length; i++){
                if(val == this.rebatGames[i]){
                    res = true
                    break
                }
            }
            return res
        },

        //bonus促销是否打开
        isBonusPromOpen(){
            return this.bonus_prom
        },

        update(){
            if(cc.vv.ChipPool){
                cc.vv.ChipPool.update()
            }
        },

    }
});
