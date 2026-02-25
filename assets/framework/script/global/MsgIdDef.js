/*
** Define the messge id 
*/
var GlobalMsgId = cc.Class({
    extends: cc.Component,

    statics: {
    },
});
window.MsgId = GlobalMsgId;

GlobalMsgId.HEARTBEAT = 11, //服务端主动检测心跳

//大厅共用协议
GlobalMsgId.LOGIN = 1; //登录游戏
GlobalMsgId.LOGIN_USERID = 2; //ID登录
GlobalMsgId.RELOGIN_USERID = 3; //断线重登陆
GlobalMsgId.REGET_DESKINFO = 4; //重新刷新房间信息
GlobalMsgId.REGET_DESKINFO_2 = 5; //主动获取房间信息
GlobalMsgId.LOGIN_OUT = 12, //登出
GlobalMsgId.SYNC_COIN = 29  ,//客户端主动同步金币
GlobalMsgId.ACCOUNT_DELETE = 1093; //删除注销账号
GlobalMsgId.UPDATE_FCMTOKEN = 390; //更新推送token


//大厅UI弹框协议
GlobalMsgId.BIND_INVITE_CODE = 28; //绑定邀请码
GlobalMsgId.PURCHASE_AGENT_LIST = 50; //获取代理（银商）列表
GlobalMsgId.PURCHASE_GOODS_LIST = 51; //获取充值列表
GlobalMsgId.FEEDBACK_COMMIT = 52; //提交反馈(type类型, memo反馈内容)
GlobalMsgId.MESSAGE_SYSTEM = 53; //系统消息
GlobalMsgId.MODIFY_INFO = 54; //修改信息（nickname昵称 memo备注）
GlobalMsgId.IDENTITY_PERSONAL = 55; //个人认证(realname姓名 idcard身份证)
GlobalMsgId.TOTAL_RANK_LIST = 56; //总金币排行榜
GlobalMsgId.HALL_SPEAKER_LIST = 59; //获取喇叭跑马灯消息
GlobalMsgId.EMAIL_LIST = 60; //获取邮件列表
GlobalMsgId.EMAIL_READ = 61; //读取邮件
GlobalMsgId.PERSIONAL_INFO = 62; //获取个人信息
GlobalMsgId.EMAIL_RECEIVE = 63; //领取邮件
GlobalMsgId.COMMIT_REPORT = 64; //提交举报
GlobalMsgId.AC_RESERVE_COIN = 72; //获取备用金
GlobalMsgId.AC_RESERVE_TAKE_LIMIT = 73; //备用金提取额度
GlobalMsgId.BIND_ACCOUNT = 74; //绑定账号
GlobalMsgId.GET_BOUNS = 75; //领取在线奖励
GlobalMsgId.GET_ONLINE_BOUNS_STATUS = 76;       // 领取状态
GlobalMsgId.GET_TASK_LIST = 77; //获取任务列表
GlobalMsgId.RECEIVE_REWARD = 78; //领取奖励
GlobalMsgId.TODAY_RANK_LIST = 79; //今日金币排行榜
GlobalMsgId.ACTIVITY_LIST = 80; //活动列表
GlobalMsgId.ACTIVITY_GET_FIVE_STAR = 81; //获取五星好评信息
GlobalMsgId.ACT_COMMIT_FIVE_STAR = 82; //提交五星好评
GlobalMsgId.ACT_INVITE_GIFT_LIST = 83; //获取邀请有礼列表
GlobalMsgId.MODIFY_NICKNAME = 84;      // 修改昵称
GlobalMsgId.SEND_CHAT = 85; //发送聊天内容
GlobalMsgId.GET_CHAT_LIST = 86; //获取聊天内容
GlobalMsgId.BIND_ACCOUNT_WX = 87; //游客绑定微信
GlobalMsgId.BIG_CHARGE_ANGENT = 88; //代理大额充值信息
GlobalMsgId.BIG_CHARGE_BACKLIST = 89; //代理大额充值返利档位
GlobalMsgId.BIG_CHARGE_ORDER = 90; //代理大额充值下单
GlobalMsgId.BIG_CHARGE_REBACKWARD = 91; //代理大额充值提现
GlobalMsgId.BIG_CHARGE_REWARD_CORD= 92; //代理大额充值提现记录
GlobalMsgId.AGENT_REWARD_DATA= 93; //下级代理水费数据
GlobalMsgId.AGENT_REWARD_REBACKWARD= 94; //下级代理水费提现
GlobalMsgId.HALL_VERSOIN = 96;           //获取大厅最新的版本号
GlobalMsgId.AGENT_REWARD_STATIC= 97; //代理查询


GlobalMsgId.BANK_LOGIN = 100; //银行登录（进入）
GlobalMsgId.BANK_HALL_INFO = 101; //获取银行大厅信息
GlobalMsgId.BANK_SAVE_COIN =102; //存入银行
GlobalMsgId.BANK_TAKE_COIN = 103; //取款从银行
GlobalMsgId.BANK_RECORD_LIST = 104; //银行记录
GlobalMsgId.BANK_MODIFY_PW = 105; //修改银行密码
GlobalMsgId.BANK_EXIT = 106; //退出银行
GlobalMsgId.BANK_TAKE_INGAME = 107; //游戏内银行取款

GlobalMsgId.NICKNAME_INCLUCE_ILLEGAL_CHARACTER = 1073; //您的昵称包含非法字，请重新修改
GlobalMsgId.NICKNAME_HAD_USED = 1074;                   //昵称已经被使用

GlobalMsgId.PURCHASE_GET_ORDER = 70; //获取充值订单号
GlobalMsgId.PURCHASE_CHECK_ORDER = 71; //充值成功，发送服务端是否有效的订单
GlobalMsgId.PURCHASE_RECHARGE_SUC = 1035; //充值成功推送
GlobalMsgId.REWARD_ONLINE = 1036;         //在线奖励通知
GlobalMsgId.TASK_FINISH_NOTICE = 1037;     //任务完成通知
GlobalMsgId.POP_FIVE_STAR_NOTICE = 1038;   //五星好评通知

GlobalMsgId.MONEY_CHANGED = 1010; //财产变化（主要是金币变化）


GlobalMsgId.GAME_REMOTE_LOGIN = 1017; //异地登录
GlobalMsgId.GAME_NEED_RESTART = 801; //必须重启app


//游戏相关协议
GlobalMsgId.GAME_SESS_LIST = 30; //获取指定游戏的场次列表        
GlobalMsgId.GAME_ROOM_LIST = 34; //展示指定游戏的全部房间列表
GlobalMsgId.GAME_CREATEROOM = 31; //创建房间
GlobalMsgId.GAME_JOINROOM = 32; //加入房间
GlobalMsgId.GAME_LEVELROOM = 40; //离开房间
GlobalMsgId.GAME_ENTER_MATCH = 43; //加入匹配场
GlobalMsgId.RELIEF_FUND = 99;      // 救济金
GlobalMsgId.ENTER_CASINO = 120;    // 进入真人视讯
GlobalMsgId.EXIT_CASINO = 121;     // 退出真人视讯
GlobalMsgId.CHANGE_CASINO_COIN = 122;     // 兑换在线的钱

GlobalMsgId.NOTIFY_SYS_KICK_HALL = 100050; //房间解散，T回大厅
GlobalMsgId.NOTIFY_SYS_KICK_LOGIN = 100054; //系统T人，T回登录界面

GlobalMsgId.GLOBAL_MAIL_NOTIFY = 100053;  //邮件通知
GlobalMsgId.GLOBAL_SPEAKER_NOTIFY = 100055;  //全局喇叭通知
GlobalMsgId.GLOBAL_SYSTEM_NOTIFY = 100066;  //全局公告
GlobalMsgId.SEND_CHAT_NOTICE = 100056; //发送聊天通知
GlobalMsgId.PLAYER_LEAVE = 1016         //有玩家离开
GlobalMsgId.SYNC_PLAYER_INFO = 100057; //同步玩家信息


//客户端自定义网络消息ID从99000开始
//游戏断线重连，桌子信息
GlobalMsgId.GAME_RECONNECT_DESKINFO = 99000;
GlobalMsgId.GAME_ENTER_BACKGROUND = 9900;

GlobalMsgId.SCORE_LOG = 27;                 // 上下分记录
GlobalMsgId.MODIFY_PSW = 26;                // 修改密码
GlobalMsgId.GAME_LIST = 100059;             // 游戏列表
GlobalMsgId.JACKTPOT_HALL = 121202;         // 大厅奖池
GlobalMsgId.JACKPOT_GAME = 121203;          // 游戏奖池
GlobalMsgId.NOTIFY_KICK = 100906;           //踢出房间
GlobalMsgId.REQ_REDPACK = 7100;           //请求幸运红包
GlobalMsgId.OPEN_REDPACK = 7101;           //拆开1个幸运红包
GlobalMsgId.REQ_LUCKRAIN = 7102;           //请求红包雨
GlobalMsgId.REQ_GROWUPDATA = 130;          //请求玩家成长值数据
GlobalMsgId.REQ_LUCKBOX = 131;             //请求玩家成长值奖励详情
GlobalMsgId.REQ_LUCKBOX_REWARD = 132;      //请求领取玩家成长值奖励
GlobalMsgId.REQ_AGENT_INFO = 135;          // 代理信息
GlobalMsgId.REQ_TRANSFER = 142;            // 转账
GlobalMsgId.REQ_MODIFY_CHARGE_PSW = 136;   // 修改支付密码
GlobalMsgId.REQ_WITHDRAWAL = 137;          // 提现
GlobalMsgId.REQ_WITHDRAWAL_RECORD = 138;   // 提现记录
GlobalMsgId.REQ_AGENTLIST = 139;           // 玩家列表
GlobalMsgId.REQ_TRANSFER_RECORD = 140;     // 转账记录
GlobalMsgId.REQ_FAV_CHANGE = 150;     // 收藏通知服务端
GlobalMsgId.RESET_PSW = 143;              // 重置下级默认密码
GlobalMsgId.ENTER_CASINO = 120;    // 进入真人视讯
GlobalMsgId.EXIT_CASINO = 121;     // 退出真人视讯
GlobalMsgId.CHANGE_CASINO_COIN = 122;     // 兑换在线的钱
GlobalMsgId.CAME_REDPACK_ALLSCENE = 1039;     // 游戏内随机发的红包
GlobalMsgId.ACTIVE_LUNPAN = 1018;     // 随机发的轮盘


GlobalMsgId.REQ_SHOP = 201;                 //商城
GlobalMsgId.REQ_MAIL_LIST = 202;            //获取邮件列表
GlobalMsgId.REQ_READ_MAIL = 203;            //读取邮件
GlobalMsgId.REQ_GET_MAIL_ATTACH = 204;      //领取邮件附件
GlobalMsgId.REQ_CHANGE_USER_HEAD = 211;         //更改头像
GlobalMsgId.REQ_GET_LEVEL_GITFS = 214;      //等级礼包
GlobalMsgId.REQ_GET_ALL_MALL_ATTACH = 215;  //邮件一键领取
GlobalMsgId.REQ_GET_NEW_MAIL = 100053;      //收到新邮件
GlobalMsgId.REQ_GET_ONLINE_COIN = 205;      //领取在线奖励
GlobalMsgId.REQ_ONLINE_REWARDS = 206;       //在线奖励
GlobalMsgId.REQ_GET_SPINE_CONF = 208;       //幸运大转盘配置
GlobalMsgId.REQ_GET_SPINE_RESULT = 209;     //幸运大转盘结果
GlobalMsgId.REQ_GET_TURNTABLE_STATE = 210;  //获取转盘状态
GlobalMsgId.REQ_GET_VIP_INFO = 212;         //获取vip信息
GlobalMsgId.REQ_OPEN_GIFT= 213;             //领取礼盒
GlobalMsgId.REQ_GET_DAILY_MISSION_LIST = 216;  //获取每日任务信息
GlobalMsgId.REQ_GET_MISSION_REWARD = 217;      //获取任务奖励
GlobalMsgId.REQ_DAILY_MISSION_REMAIN_REWARD = 280; //领取累计奖励
// GlobalMsgId.NEW_NOTICE_MISSION_CUR_PROCESS = 1053; //玩家当前任务进度通知
GlobalMsgId.REQ_GET_SIGNIN_LIST = 218;      //获取签到详情
GlobalMsgId.REQ_GET_SIGIN_ACTION = 219;      //签到
GlobalMsgId.REQ_SHOP_EX = 263;              //商城同时请求多类商品信息

GlobalMsgId.REQ_SKIN_SHOP = 421;
GlobalMsgId.REQ_BUY_SKIN_SHOP_ITEM = 422;

GlobalMsgId.REQ_GET_FBInfo = 240;           //FB分享邀请信息
GlobalMsgId.REQ_SHARE_SUCC = 241;           //FB分享成功
GlobalMsgId.REQ_RANK = 242;      //排行榜
GlobalMsgId.REQ_RANK_GET_WIN_COIN = 247;      //竞标赛领奖
GlobalMsgId.REQ_MAIL_ADDZBMATCHINFO = 248;  //邮件争霸赛前三名填信息
GlobalMsgId.REQ_GET_MONEYBANK = 249;        //moneybank获取数据

GlobalMsgId.REQ_BIND_FACEBOOK = 244;    //绑定facebook
GlobalMsgId.REQ_REPORT_STATISTICS = 245;    //数据上报统计Report statistics
GlobalMsgId.REQ_COLLECT_NEWERGIFT = 246;    //领取新手礼包

GlobalMsgId.REQ_LEVEL_UP_PARTY_INFO = 252;    //等级升级任务
GlobalMsgId.REQ_LEVEL_UP_PARTY_AWARD = 253;    //领取等级升级任务奖励
GlobalMsgId.LEVEL_UP_PARTY_UPDATE_NOTICE = 100063;    //升级任务信息更新通知

GlobalMsgId.REQ_FRIENDS_LIST = 270;    //好友列表
// GlobalMsgId.REQ_FRIEND_INFO = 62;    //获取单个好友信息

GlobalMsgId.REQ_ADD_FRIENDS = 273;    //添加好友
GlobalMsgId.REQ_DELETE_FRIENDS = 274;    //删除好友
GlobalMsgId.RET_ADD_FRIENDS_NOTICE = 1059; //添加好友通知

GlobalMsgId.FRIEND_PRESENT = 271;    //赠送
GlobalMsgId.FRIEND_PRESENTALL = 272;    //一键赠送

// GlobalMsgId.REQ_GETCOINLIST = 273;    //可领取好友金币列表
// GlobalMsgId.FRIEND_GETCOIN = 274;    //领取
// GlobalMsgId.FRIEND_GETCOINALL = 275;    //一键领取
//
// GlobalMsgId.REQ_JACKPOTLIST = 275;    //幸运领取列表
GlobalMsgId.GET_JACKPOT = 276;    //领取jackpot
GlobalMsgId.GET_JACKPOTALL = 277;    //一键领取jackpot
GlobalMsgId.REQ_RECOMMENDLIST = 278;    //获取推荐好友

// GlobalMsgId.REQ_GET_STAMP_INFO = 254;       // 获取邮票册信息
// GlobalMsgId.PULL_OPEN_STAMP_PACKAGE = 1056;   // 打开邮票包
// GlobalMsgId.REQ_BUY_STAMP_PACKAGE = 255;    // 购买邮票包

GlobalMsgId.REQ_COLLECT_BREAKGRANT_COIN = 151; //领取破产补助
GlobalMsgId.REQ_HUMMER_PRODUCT_LIST = 152;  //锤子商品列表

GlobalMsgId.COLLECT_BREAKGRANT_COIN_NOTICE = 1057; //领取破产补助通知

GlobalMsgId.REQ_MISSION_PASS_INFO = 257; //获取主线等级任务信息
GlobalMsgId.REQ_PURCHASE_LIST_INFO = 258; //获取充值列表
GlobalMsgId.REQ_COLLECT_MISSION_PASS_REWARD = 259; //领取主线等级任务奖励
GlobalMsgId.REQ_COLLECT_MISSION_PASS_ALL_REWARD = 260; //领取主线等级全部任务奖励
GlobalMsgId.REQ_REDEEM = 264;   //礼包码兑换

GlobalMsgId.SPORT_LIST = 160;
GlobalMsgId.SPORT_JOIN = 161;
GlobalMsgId.SPORT_RANKING = 162;
GlobalMsgId.SPORT_CANCEL = 163;

GlobalMsgId.PULL_LEVEL_UP_EXP = 1050;       //经验等级提升
GlobalMsgId.PULL_CHANGE_EXP = 1052;       //经验变化
GlobalMsgId.PULL_RED_NOTICE = 1019;       //小红点推送  
GlobalMsgId.PULL_ADD_OL_MULTILE   = 100064;          //在线奖励倍率变化


GlobalMsgId.PULL_RANK_RESULT = 1054;       //锦标赛推送
GlobalMsgId.PULL_JACKPOT_OTHER = 1055;     //其他玩家大奖推送
GlobalMsgId.PULL_ONETIMEONLY_DEL = 10056;     //关闭限时的one time only
GlobalMsgId.REQ_DOUBLE_XP   = 250;          //请求双倍经验信息
GlobalMsgId.REQ_EVENT_OFFER_REWARD   = 251;          //请求事件引导的操作

//CashHero
GlobalMsgId.REQ_PIGBANK_FREEOPEN = 256;         //CashHero 金猪免费开一次

GlobalMsgId.REQ_CH_MAILREWARD   = 268;          //CashHero 邮件领取奖励
GlobalMsgId.REQ_CH_MAILREWARDALL   = 269;          //CashHero 邮件领取所有奖励
GlobalMsgId.PULL_CH_MAILS_REDDOT = 1058;               //邮件红点推送
GlobalMsgId.PULL_CH_LESSCOIN_ACTIVELIST = 1060;               //金币不足的活动弹框


GlobalMsgId.REQ_COLLECT_OFFLINE_REWARD = 220;            //领取离线收益
GlobalMsgId.REQ_COLLECT_GROWTH_FUND = 279;               //领取基金
GlobalMsgId.REQ_SUCCESS_GROWTH_FUND = 1061;              //基金购买成功
GlobalMsgId.REQ_REFRESH_VIP = 1051;                      //刷新vip
GlobalMsgId.REQ_QUEST_INFO_LOGINPOP = 319;              //登陆弹窗请求Quest信息
GlobalMsgId.REQ_QUEST_INFO = 320;                       //请求Quest信息
GlobalMsgId.REQ_QUEST_REWARD = 321;                     //请求Quest奖励
GlobalMsgId.REQ_WORLD_CHAT = 322;                       //世界聊天
GlobalMsgId.REQ_CARDSHARE_CHAT = 323;                   //卡牌分享到世界聊天
GlobalMsgId.REQ_CARDSHARE_GIFT = 324;                   //打开卡牌分享礼包

GlobalMsgId.REQ_HALL_TAB_BONUS = 281;                   //获取bonus信息
GlobalMsgId.REQ_COLLECT_WEEK_MONTH_CARD = 282;          //周卡月卡，收集金币
GlobalMsgId.NOTICE_BUY_WEEK_MONTH_CARD_SUCCESS = 1062;  //周卡月卡购买成功
GlobalMsgId.NOTIFY_BUY_HUMMER = 1063;                   //购买锤子成功
GlobalMsgId.SAVE_GUIDE_ID = 284;                        //保存引导id

GlobalMsgId.REQ_LUCKYSMASH_INFO = 285;          //砸金蛋：信息
GlobalMsgId.REQ_LUCKYSMASH_RECORD = 286;        //砸金蛋：记录
GlobalMsgId.REQ_LUCKYSMASH_CRUSH = 287;         //砸金蛋：砸

GlobalMsgId.REQ_OPEN_TRIAL_CARD = 288;          //开启月卡试用
GlobalMsgId.REQ_GET_TRIAL_CARD = 289;           //领取试用月卡奖励

//俱乐部
GlobalMsgId.REQ_CLUB_LIST = 290;                   //俱乐部列表
GlobalMsgId.REQ_CLUB_DETAILS = 291;                   //俱乐部详情
GlobalMsgId.REQ_CLUB_CREATE = 292;                   //创建俱乐部

GlobalMsgId.REQ_DISSOLVE_CLUB = 293;             //解散俱乐部

GlobalMsgId.REQ_CHANGE_CLUB_INFO = 294;             //修改俱乐部信息
GlobalMsgId.REQ_APPLY_CLUB = 295;                   //申请加入
GlobalMsgId.REQ_DEAL_APPLY = 296;                   //申请回复 --管理者处理俱乐部申请
GlobalMsgId.REQ_DEAL_INVITE = 297;                   //邀请回复 --普通人处理俱乐部邀请

GlobalMsgId.REQ_EXIT_CLUB = 298;                   //退出俱乐部
GlobalMsgId.REQ_DEL_CLUB_USER = 299;                   //俱乐部踢人


GlobalMsgId.REQ_CLUB_APPLY_LIST = 300;                   //俱乐部申请列表 --给俱乐部管理员看
GlobalMsgId.REQ_CLUB_USER_INFO_LIST = 301;                   //成员列表
GlobalMsgId.REQ_CLUB_CHAT = 302;                   //成员列表

GlobalMsgId.REQ_CLUB_REWARDS = 303;                   //奖励信息
GlobalMsgId.REQ_CLUB_GET_REWARD = 304;                   //奖励领取


GlobalMsgId.REQ_CLUB_TASK = 305;                   //任务信息
GlobalMsgId.REQ_CLUB_TASK_GET_REWARD = 306;                   //任务奖励领取,无id领取所有


GlobalMsgId.REQ_CAN_APPLY_CLUB_LIST = 307;                   //可申请俱乐部列表
GlobalMsgId.REQ_CLUB_INVITE_OTHER = 308;                   //管理员邀请别人进俱乐部
GlobalMsgId.REQ_CLUB_INVITE_LIST = 309;                   //俱乐部邀请列表 --给普通人看 

GlobalMsgId.REQ_HEROCARD_LIST = 325;            //英雄卡牌列表
GlobalMsgId.REQ_HEROCARD_INFO = 326;            //英雄卡牌信息
GlobalMsgId.REQ_HEROCARD_UNLOCK = 327;          //英雄卡牌解锁
GlobalMsgId.REQ_HEROCARD_ADD_STAR = 328;        //英雄卡牌升星
GlobalMsgId.REQ_HEROCARD_LEVEL_UP = 329;        //英雄卡牌升级
GlobalMsgId.REQ_HEROCARD_SUMMON = 362;        //英雄卡牌10抽基本信息
GlobalMsgId.REQ_HEROCARD_SUMMON_DIAMOND = 364;        //英雄卡牌抽卡钻石
GlobalMsgId.NOTIFY_HEROCARD_DROP = 1064;        //英雄卡牌碎片掉落通知
GlobalMsgId.REQ_HEROCARD_RANK = 374;     //英雄卡牌排行榜

GlobalMsgId.REQ_PVP_FIGHT = 375;   //卡牌对战
GlobalMsgId.REQ_PVP_RANK = 376; //获取排行榜
GlobalMsgId.REQ_PVP_MATCH = 377;    //匹配战斗用户
GlobalMsgId.REQ_PVP_SET_FORMATION = 378;  //设置防守队伍
GlobalMsgId.REQ_PVP_BUY_TICKET = 379;   //购买pvp门票
GlobalMsgId.REQ_PVP_RECORD = 383;   //被挑战记录
GlobalMsgId.REQ_PVP_DETAIL = 384;   //战斗详情
GlobalMsgId.REQ_PVP_TEAM = 385;     //查询玩家队伍

GlobalMsgId.REQ_BINGO_INFO = 330;       //bingo 信息
GlobalMsgId.REQ_BINGO_SPIN = 331;       //bingo 转动
GlobalMsgId.REQ_BINGO_RANK = 332;       //bingo 排行榜
GlobalMsgId.NOTIFY_BINGO_BUFF_BUYED = 1066;     //bingo buff 购买
GlobalMsgId.NOTIFY_BINGO_GIFT_BUYED = 1067;     //bingo point 购买

GlobalMsgId.REQ_EXPLORE_INFO = 366;     // 骑士的探索-信息
GlobalMsgId.REQ_EXPLORE_SPIN = 367;     // 骑士的探索-摇色子
GlobalMsgId.REQ_EXPLORE_OPENBOX = 368;  // 骑士的探索-开箱子
GlobalMsgId.JOURNEY_CNT_GIFT_BUYED = 1072;  // 骑士的探索 cnt 礼包 购买
GlobalMsgId.JOURNEY_COIN_GIFT_BUYED = 1073; // 骑士的探索 coin 礼包 购买
GlobalMsgId.JOURNEY_STEP_GIFT_BUYED = 1074; // 骑士的探索 step 礼包 购买

GlobalMsgId.REQ_FRIEND_CHATRANK_BETINFO = 265        //好友聊天中rank的下注信息
GlobalMsgId.REQ_FRIEND_CHATRANK_DOBET = 266        //好友聊天中rank的下注确认
GlobalMsgId.FRIEND_COLLECTALL_DOUBLE = 360          //好友一键领取分享翻倍
GlobalMsgId.DOUBLE_WIN_COINS = 361
GlobalMsgId.PULL_MODIFY_LOCALVAL = 1021          //推送修改本地的一些变量

GlobalMsgId.REQ_GIFT_SEND = 661;           //赠送魅力值道具
GlobalMsgId.REQ_GIFT_SENDLIST = 662;       //赠送出去的列表
GlobalMsgId.REQ_GIFT_RECEIVELIST = 663;    //收到的列表
GlobalMsgId.PULL_GIFT_INFO = 1042;         //全服广播送礼信息

//luckcard
GlobalMsgId.REQ_LUCKYCARD_INFO = 350            //luckycard详情
GlobalMsgId.REQ_LUCKYCARD_ACTION = 351           //luckycard 翻卡
GlobalMsgId.REQ_LUCKYCARD_TAKE = 352           //luckycard 领取奖励
GlobalMsgId.REQ_LUCKYCARD_RELIFE = 353           //luckycard 复活卡使用
GlobalMsgId.REQ_LUCKYCARD_BUYLIST = 354           //luckycard 复活卡购买列表
GlobalMsgId.PULL_LUCKYCARD_BUYSUCCESS = 1065           //luckycard 复活卡购买成功推送
GlobalMsgId.PULL_LUCKYCARD_RESET = 1069           //luckycard 重置，花钱再玩一次

//guidetask
GlobalMsgId.REQ_GUIDETASK_REWARD = 341           //引导任务 领取奖励
GlobalMsgId.PULL_GUIDETASK_UPDATEINFO = 1068          //引导任务更新进度信息
GlobalMsgId.REQ_GUIDETASK_ADD_HEROCARD = 333         //引导获取卡片
GlobalMsgId.REQ_SERVICES_INFO = 514;  // 客服

//facebook share span
GlobalMsgId.REQ_GET_SHARE_WHEEL = 342           //获取分享转盘信息
GlobalMsgId.REQ_SPIN_WHEEL = 343          //开始转动转盘

//大厅选择押注
// GlobalMsgId.REQ_HALLBETS_SELECT = 357          //档位信息获取
GlobalMsgId.REQ_HEROPALACE = 358          //富豪厅信息
GlobalMsgId.REQ_HEROPALACE_COLLECT = 359          //富豪厅领取奖励
GlobalMsgId.REQ_HEROPALACE_TICKET = 372     //富豪庭体验券
GlobalMsgId.REQ_BONUS_LISTINFO = 373     //请求bonus信息
//dailyBonus
GlobalMsgId.REQ_GET_SIGN_INFO = 418         //获得签到信息（不再使用）
GlobalMsgId.REQ_GET_SIGN_ACTION = 419           //签到操作（不再使用）
GlobalMsgId.REQ_GET_SIGN_GIFT = 420         //获得累计签到礼包（不再使用）

GlobalMsgId.REQ_SEND_FIRSTGIFT_COLLECT = 425         //发送首充的礼物选择

//集卡成就
GlobalMsgId.REQ_SET_CARD_ACHIEVE = 335      //集卡成就列表
GlobalMsgId.REQ_SET_CARD_REWARD = 337      //获得集卡奖励
// GlobalMsgId.REQ_CARD_ACHIEVE_STATUS = 339   //获得集卡成就状态
GlobalMsgId.REQ_CARD_TASK_INFO = 334        //获取单卡牌成就
GlobalMsgId.REQ_CARD_TASK_STATUS = 336      //获取单卡任务状态
GlobalMsgId.REQ_CARD_TASK_REWARD = 338      //获取单卡成就奖励

//卡牌转盘
GlobalMsgId.REQ_CARD_GET_WHEEL_INFO = 370      //获取碎片转盘信息
GlobalMsgId.REQ_CARD_PLAY_WHEEL = 371      //使用碎片转动转盘

//回大厅请求
GlobalMsgId.REQ_SYNC_HALLINFO = 349      //同步大厅信息

//每日任务
GlobalMsgId.REQ_GET_MISSION_INFO = 344      //获得每日任务信息列表
GlobalMsgId.REQ_GET_MISSION_REWARDS = 345   //获得任务奖励
GlobalMsgId.REQ_USE_MISSION_DIAMOND = 346   //钻石完成
GlobalMsgId.REQ_GET_MISSION_LIVE = 347   //活跃度
GlobalMsgId.REQ_SET_MISSION_PROCESS = 1071  //游戏界面进度条

GlobalMsgId.REQ_NOTICE_REWARD_COLLECT = 348 //领取召回奖励

//现金返现领取奖励
GlobalMsgId.REQ_GET_CASHBACK_REWARDS = 365 //现金返现领取奖励

//游戏内转盘
GlobalMsgId.REQ_GET_TURNTABLE_TYPE = 207 //获得需要弹免费还是付费

//私聊
GlobalMsgId.REQ_PRIVATE_GETCARD = 455  //获得好友卡牌
GlobalMsgId.REQ_PRIVATE_SENDCARD = 454  //同意赠送好友卡牌
GlobalMsgId.REQ_PRIVATE_CHAT = 453  //获得与特定好友的私聊信息
GlobalMsgId.REQ_PRIVATE_LIST = 452  //获得私聊列表
GlobalMsgId.REQ_PRIVATE_SEND = 451  //发送给特定好友的私聊信息
GlobalMsgId.REQ_PRIVATE_GET = 100203  //获得好友私聊信息
GlobalMsgId.REQ_PRIVATE_RECCARD = 100204  //获得好友赠送卡牌信息

//兑换码
GlobalMsgId.REQ_CDKEY = 664  

//bonus主线任务
GlobalMsgId.REQ_BONUS_MAINLISTINFO = 380     //请求bonus主线任务
GlobalMsgId.REQ_BONUS_MAINLISTREWARD = 381     //请求bonus主线任务奖励

//bonus红点收集
GlobalMsgId.REQ_BONUS_REDDOT_REWARDS = 382     //获得红点奖励

//大厅排行榜前三数据
GlobalMsgId.REQ_HALL_RANKTOP3 = 369     //获得红点奖励

//保险箱
GlobalMsgId.REQ_ENTER_SAFE = 100;   // 进入银行
GlobalMsgId.REQ_SAFE_INFO = 101;   // 银行大厅信息
GlobalMsgId.REQ_SAFE_SAVE = 102;   // 存款
GlobalMsgId.REQ_SAFE_TAKE = 103;   // 取款
GlobalMsgId.REQ_SAFE_RECORD = 104;   // 银行记录


// ------------------------ 桌游 -------------------------------
GlobalMsgId.PULL_FREE_STATUE = 128000 //进入空闲阶段
GlobalMsgId.PULL_BETTING_STATUE = 128001 //进入下注阶段
GlobalMsgId.PULL_RESULT_STATUE = 128002 //进入结算阶段
GlobalMsgId.PULL_OTHER_BET = 128003     //其它玩家下注
GlobalMsgId.PULL_OBSERVERS_NUM = 128004     //观众人数变化
GlobalMsgId.PULL_CRASH_TAKEREWARD = 128005     //Crash 自动提现。不通用
GlobalMsgId.PULL_CRASH_FLY = 128006     //Crash 飞机起飞。不通用
GlobalMsgId.MSG_Cash_Out = 81 //Crash 领取奖励
GlobalMsgId.PLACE_BET = 44

GlobalMsgId.REQ_LABAGAME_TOTAL_RANK = 1122      //排行榜
GlobalMsgId.REQ_LABAGAME_LIST = 1120            //游戏记录

GlobalMsgId.PULL_TABLE_PLAYER = 126001  //桌上玩家的加入
GlobalMsgId.LEFT_TABLE_PLAYER = 126011 //桌上玩家离开
GlobalMsgId.TABLE_BET_REQ = 37  //玩家下注
GlobalMsgId.REQ_OBSER_LIST = 1121   //获取观众列表
GlobalMsgId.GAME_SWITCH_TABLE = 52 //游戏内换桌
GlobalMsgId.PULL_SWITCH_TABLE = 1083 //推送游戏内换桌
//-------------------------------------------------------------