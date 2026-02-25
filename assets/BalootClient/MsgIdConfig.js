let MsgId = require('MsgIdDef');
// ------------------------ 补充 协议 start ---------------------------
// 请求所有排行榜的简要数据
MsgId.ALL_RANK_LIST = 243;
// 更新用户信息
MsgId.UPDATE_USER_INFO = 211;
// 购买头像框
MsgId.BUY_USER_FRAME = 63;
// 请求领取VIP的奖励
MsgId.REQU_GET_VIP_REWARD = 282;
// 充值VIP成功
MsgId.REQU_CHARGE_VIP = 1062;
//经验变化
MsgId.PULL_CHANGE_EXP = 1052;
//经验等级提升
MsgId.PULL_LEVEL_UP_EXP = 1050;
//玩家当前任务进度通知 
MsgId.NEW_NOTICE_MISSION_CUR_PROCESS = 1053;
// 修改当前语言
MsgId.CHANGE_LANGUAGE = 199;
// Bouns发生了改变
MsgId.CHANGE_BONUS_LIST = 1070;
// 聊天室用户信息更新
MsgId.CHAT_USER_INFO_UPDATE = 1091;
// 收到一条新的聊天信息
MsgId.CHAT_NEW_MSG = 1092;
// 离开聊天室
MsgId.CHAT_LEAVE_ROOM = 424;
// 发送一条消息
MsgId.CHAT_SEND_MSG = 334;
// 删除一条世界聊天信息
MsgId.CHAT_DEL_MSG = 1094;
// 清空聊天室
MsgId.CHAT_DELALL_MSG = 1095;
// 钻石兑换金币
MsgId.DIAMOND_TO_COIN = 429;
// 通知服务器玩家是否去点赞
MsgId.LIKE_OPR = 357;
// 获取单个排行榜的前三数据
MsgId.RANK_THREE_DATA = 258;
// 背包协议
MsgId.REQ_SKIN_BAG = 415;
// 获取在线人数
MsgId.REQ_ROOM_PALYER_NUM = 311;
// 通知服务器 拉取了排行榜
MsgId.REQ_RANK_MAIN_VIEW = 460;
// 领取商城免费奖励
MsgId.REQ_SHOP_FREE_REWARD = 264;
// 通知服务器 退出私聊
MsgId.REQ_CHAT_FRIEND_EXIT = 271;
// 一键删除所有邮件
MsgId.MAIL_REMOVE_ALL = 201;
// 读取邮件
MsgId.MAIL_READ = 203;
// VIP每日奖励数据
MsgId.VIP_DAILY_VIEW = 283;
// 举报
MsgId.REPORT_USER = 222;
// 领取离线奖励
MsgId.GET_OFFLINE_REWARDS = 220;
// 购买全服礼物
MsgId.WORLD_GIFT_BUY = 660;
// 用户反馈
MsgId.USER_FEEDBAKC = 169;
// 举报聊天内容
MsgId.USER_REPORT_CHAT = 223;
// 新手改名奖励
MsgId.USER_NEW_GIFT = 168;
// 一键领取VIP奖励
MsgId.GET_ALL_VIP_REAWRDS = 152;
// 通知服务器进行排位赛数据更新
MsgId.REQ_UPDATE_LEAGUE_EXP = 150;
// 历史战绩
MsgId.GAME_RECORD = 700;
// 经验值道具使用
MsgId.USE_PROP = 420;
// 私聊协议
MsgId.PRIVATE_CHAT_LIST = 463;
// 分享whatsapp上报
MsgId.SHARE_WHATSAPP_REPORT = 430;
// 任务完成通知
MsgId.TASK_COMPLETE_NOTIFY = 1070;

// 沙龙收益记录
MsgId.SALON_INCOME_RECORD = 505;
// 联赛变更通知
MsgId.LEAGUE_CHANGE_NOTIFY = 1043;

MsgId.TASK_SALON_CONFIG = 290;
MsgId.TASK_SALON_REWARD = 291;

MsgId.GAME_CONFIG = 333;

MsgId.SALON_INVITE_CHAT = 335;
// 投票有变动
MsgId.COUNTRY_TOP_CHANGE = 10355;
// 删除对应好友聊天记录
MsgId.DELETE_FRIEND_RECORD = 469;
// 获取新手1000美金大礼包
MsgId.GET_NEWER_GIFT_REWARDS = 665;


// 获取破产补助信息
MsgId.GET_BANKRUPTCY_INFO = 149;
// 领取破产补助
MsgId.GET_BANKRUPTCY_REWARD = 151;

// 手机号验证码与绑定
MsgId.GET_PHONE_CODE = 135;
MsgId.BIND_PHONE = 134;

// ------------------------ 补充 协议 end ---------------------------



// ------------------------ 金猪 start  ---------------------------
// 金猪的信息
MsgId.PIGGY_BANK_VIEW = 249;
// 金猪满了推送
MsgId.PIGGY_BANK_NOTIFY = 100065;

// ------------------------ 联赛 start  ---------------------------
// 联赛的配置
MsgId.LEAGUE_VIEW = 188;
// 联赛报名协议
MsgId.LEAGUE_APPLY = 187;
// 联赛往届冠军
MsgId.LEAGUE_RECORD = 189;
// 领取联赛奖励
MsgId.LEAGUE_REWARD = 190;
//游戏内联赛积分变化
MsgId.LEAGUE_EXP_CHANGE = 100067
// 排位赛最高等级提升
MsgId.LEAGUE_LEVEL_UP = 100068
// ------------------------ RP start  ---------------------------
MsgId.RP_VIEW = 312;
MsgId.RP_REWARD = 313;
MsgId.RP_VIEW_RULE = 314;
// ------------------------ RP start  ---------------------------
// 国家投票信息
MsgId.COUNTRY_RANK = 354;
// 给国家投票
MsgId.COUNTRY_VOTE = 355;
// 领取沙龙体验卡
MsgId.SALON_GET_TEST = 336;
// 领取沙龙收益
MsgId.SALON_GET_INCOME = 506;
// 回应沙龙邀请
MsgId.SALON_INVITE_APPLY = 192;





// ------------------------ 好友房 start ---------------------------
MsgId.FRIEND_ROOM_CREATE = 500;             // 创建好友房间
MsgId.FRIEND_ROOM_JOIN = 501;               // 加入好友房间
MsgId.FRIEND_ROOM_INVITE = 503;             // 邀请好友
MsgId.FRIEND_ROOM_BE_INVITE = 126201;       // 被好友邀请
MsgId.FRIEND_ROOM_INVITE_FEEDBACK = 126202;       // 邀请人反馈
MsgId.FRIEND_ROOM_LIST = 175;               // 请求房间列表
MsgId.FRIEND_ROOM_LIST_CHANGE = 125620;     // 房间列表更新
MsgId.FRIEND_ROOM_LEAVE = 176;              // 退出模块
MsgId.FRIEND_ROOM_DISSOLVE = 504;          // 解散房间
MsgId.CHECK_DESK_INFO = 502;       //查询沙龙房间信息


// 房间匹配排位VIP相关
// ############### online ##################
MsgId.ONLINE_ENTER_LONLINE = 185;       // 进入online 界面
MsgId.ONLINE_START_MATCH_ROOM = 170;      // 请求匹配 匹配房
MsgId.ONLINE_REC_MATCH_ROOM = 125618;   // 服务器广播匹配数据
MsgId.ONLINE_REQ_CANCLE_MATCH = 171;    // 取消匹配
// ############### vip ##################
MsgId.VIP_ROOM_LIST = 175;          // 请求房间列表
MsgId.VIP_ROOM_LIST_CHANGE = 125620;// 列表更新
MsgId.VIP_CREATE_ROOM = 172;        // 创建房间
MsgId.VIP_JOIN_ROOM = 173;          // 加入房间
MsgId.VIP_ROOM_MATCH_CHANGE = 125619;// 匹配过程中人数变化
MsgId.VIP_EXIT_VIP_MATCH = 174;      // vip 匹配过程中退出
MsgId.VIP_DISMISS_ROOM = 125621;   // 匹配过程中解散房间
MsgId.VIP_FAST_JOIN = 177;         // 快速开始
// ############### league ##################
MsgId.LEAGUE_ENTER_LEAGUE = 178; // 进入排位赛界面
MsgId.LEAGUE_RECEIVE_AN_INVITATION = 125622; // 收到一个排位邀请
MsgId.LEAGUE_KICK_FRIEND = 180;       // 踢出好友
MsgId.LEAGUE_GOT_KICKED = 125625;  // 被好友踢了
MsgId.LEAGUE_START_MATCH = 181;    // 开始排位
MsgId.LEAGUE_REC_MATCH_ROOM = 125618; // 匹配过程中数据变化
MsgId.LEAGUE_REQ_CANCLE_MATCH = 171;   // 取消匹配
MsgId.LEAGUE_RANKING_LIST = 242;   //  排行榜
MsgId.LEAGUE_TASK_LIST = 216;       // 任务列表
MsgId.LEAGUE_TASK_GET_REWARD = 217; // 领取奖励
// other
MsgId.EXIT_MODULE = 176;                // 退出模块
MsgId.INVITE_FRIEND_JOIN_TEAM = 179;    // 邀请好友进行排位
MsgId.KICK_TEAM_MEMBER = 180;           // 踢掉队员
MsgId.INVITATION_RESULT = 182;          // 回复邀请
MsgId.QUIT_TEAM = 184;                  // 玩家退出队伍
MsgId.TEAM_CHANGE_ENTER = 186;          // 房主修改进房条件
MsgId.FRIEND_LIST = 270;                // 请求好友列表

// ------------------------ 社交 协议 start ---------------------------
// 好友列表
MsgId.SOCIAL_FRIEND_LIST = 270;
// 最近的聊天记录
MsgId.SOCIAL_FRIEND_MESSAGE_LIST = 452;
// 添加好友请求列表
MsgId.SOCIAL_FRIEND_REQUEST_LIST = 449;
// 处理好友请求(同意/拒绝)
MsgId.SOCIAL_FRIEND_REQUEST_HANDLE = 448;
// 添加好友
MsgId.SOCIAL_FRIEND_HANDLE_ADD = 273;
// 删除好友
MsgId.SOCIAL_FRIEND_HANDLE_REMOVE = 274;
// 推荐好友
MsgId.SOCIAL_FRIEND_HANDLE_RECOMMEND = 278;
// 获取指定UID的聊天记录
MsgId.SOCIAL_FRIEND_MSG_LIST = 453;
// 发送一条好友的聊天信息
MsgId.SOCIAL_FRIEND_MSG_SEND = 451;
// 接受到一条好友的聊天信息
MsgId.SOCIAL_FRIEND_MSG_REV = 100203;
// 最近一起玩游戏的玩家列表
MsgId.SOCIAL_RECENT_PLAYER_LIST = 450;
// 模糊查找好友
MsgId.SOCIAL_SEARCH_USER = 468;
// 系统消息
MsgId.SOCIAL_SYSTEM_MESSAGE_LIST = 426;
// 删除一条系统消息
MsgId.SOCIAL_SYSTEM_MESSAGE_DELETE = 427;
// 清空系统消息
MsgId.SOCIAL_SYSTEM_MESSAGE_DELETE_ALL = 428;
// 获取额外奖励
MsgId.GAME_SHARE_REWARD = 191;
// ------------------------ 社交 协议 end ---------------------------


// ------------------------ 活动和任务 协议 start ---------------------------
// 登录奖励
MsgId.EVENT_SIGN_CONFIG = 418;
MsgId.EVENT_SIGN_REWARD = 419;
// VIP登录奖励
MsgId.EVENT_VIP_SIGN_CONFIG = 416;
MsgId.EVENT_VIP_SIGN_REWARD = 417;
// 任务协议 -- type:1每日任务 2：活跃任务 3:升级任务 5:VIP等级奖励 8:新手任务
MsgId.EVENT_TASK_CONFIG = 216;
MsgId.EVENT_TASK_REWARD = 217;
// 主线任务
MsgId.EVENT_TASK_MAIN_CONFIG = 342;
MsgId.EVENT_TASK_MAIN_REWARD = 343;
MsgId.EVENT_VIP_MAIN_CONFIG = 345;
MsgId.EVENT_VIP_MAIN_REWARD = 346;
MsgId.EVENT_BONUS_RECORD = 315;
// login
MsgId.EVENT_LOGIN_BONUS_CONFIG = 344;
// 获取新手任务奖励
MsgId.EVENT_GET_NEW_PLAYER_CONFIG = 218;
MsgId.EVENT_GET_NEW_PLAYER_REWARD = 219;

MsgId.EVENT_GET_DAILYTASK_MAIN_REWARD = 221;
//返水信息
MsgId.EVENT_RETURN_WATER_CONFIG = 194;
MsgId.EVENT_RETURN_WATER_REWARD = 195;

//排行榜
MsgId.EVENT_GET_RANK_INFO = 197;    // 获取排行榜信息
MsgId.EVENT_REGISTER_RANK_INFO = 198;   // 注册排行榜信息
MsgId.EVENT_GET_RANK_CONFIG = 200;  // 获取排行榜配置
MsgId.EVENT_GET_RANK_REWARDS_CFG = 207; // 获取排行榜奖励配置

// 在线奖励
MsgId.EVENT_ONLINE_WHEEL_CONF = 208;  //转盘配置
MsgId.EVENT_ONLINE_WHEEL_RESULT = 209;  //转盘结果
MsgId.EVENT_ONLINE_GET_STATE = 210;  //获取转盘状态

// ------------------------ 活动和任务 协议 end ---------------------------


// FB分享奖励
MsgId.EVENT_FB_SHARE_CONFIG = 240;              //FB分享配置
MsgId.EVENT_FB_SHARE_SUCCESS = 241;          //分享成功
MsgId.EVENT_FB_SHARE_REWARD = 247;         //分享转盘转盘结果
// FB反馈
MsgId.EVENT_FEEDBACK = 169;
// FB邀请
MsgId.EVENT_FB_INVITE_CONFIG = 254;              //FB邀请配置
MsgId.EVENT_FB_INVITE_REWARD = 255;              //FB邀请单个奖励领取 (已废弃)
MsgId.EVENT_FB_INVITE_REWARD_ALL = 256;          //FB邀请全部奖励领取 (已废弃)
MsgId.EVENT_FB_INVITE_BIND_CODE = 257;          //FB绑定邀请码
MsgId.REQ_REFFERS_LIST = 255;   //获取代理列表
MsgId.REQ_REFFERS_REWARDS = 256;//我的收益列表
MsgId.REQ_REFFERS_DETAILS = 259;//收益详情列表

MsgId.REQ_REFFERS_LIST_DETAILS = 261; //代理列表
MsgId.REQ_REFFERS_REWARDS_DETAILS = 262; //收益列表


// ------------------------ 俱乐部 协议 start ---------------------------

MsgId.CLUB_LIST_RECOMMEND = 471;            //获取推荐俱乐部
MsgId.CLUB_LIST_RANK = 472;                 //俱乐部排行榜
MsgId.CLUB_CREATE = 473;                    //创建俱乐部
MsgId.CLUB_INFO = 474;                      //俱乐部详情
MsgId.CLUB_APPLY = 475;                     //申请加入俱乐部
MsgId.CLUB_LIST_APPLY = 476;                     //获取申请列表
MsgId.CLUB_HANDLE_APPLY = 477;                     //审核申请
MsgId.CLUB_HANDLE_REMOVE = 478;                     //剔除一个用户
MsgId.CLUB_LIST_USER = 479;                     //获取俱乐部成员列表
MsgId.CLUB_SIGN = 480;                          //俱乐部签到
MsgId.CLUB_EXIT = 481;                          //主动退出俱乐部
MsgId.CLUB_UPDATE_INFO = 482;                   //俱乐部信息更新
MsgId.CLUB_ROOM_LIST = 483;                   //获取俱乐部房间
MsgId.CLUB_ROOMT_CREATE = 484;                   //创建俱乐部房间
MsgId.CLUB_ROOMT_JOIN = 485;                   //加入俱乐部房间
MsgId.CLUB_ROOMT_INVITE = 486;                   //邀请加入俱乐部房间

MsgId.CLUB_ROOMT_BE_INVITE = 126102;                   //通知被邀请
MsgId.NOTIFY_CLUB_JOIN = 1080;                     //通知被 俱乐部加入
MsgId.NOTIFY_CLUB_REMOVE = 1081;                     //通知被 俱乐部移除

// ------------------------ 俱乐部 协议 end ---------------------------

// ------------------------ 通行证 start ---------------------------
MsgId.EVENT_MENSA_CARD_INFO = 461; // 获取通行证信息
MsgId.EVENT_MENSA_CARD_TAKE_REWRAD = 462; // 领取通行证奖励
MsgId.EVENT_MENSA_CARD_TASK_INFO = 463; // 获取通行证任务信息
MsgId.EVENT_MENSA_CARD_REFRESH_TASK = 464; // 使用钻石刷新任务
MsgId.EVENT_MENSA_CARD_CMP_TASK = 465; // 使用钻石完成任务
MsgId.EVENT_MENSA_CARD_TAKE_ALL_REWRAD = 467; // 一键领取奖励
// ------------------------ 通行证 end ---------------------------

// ------------------------ 送礼系统 start ---------------------------
MsgId.USER_GIFT_SEND = 661;         // 赠送礼物
MsgId.USER_GIFT_SEND_LIST = 662;         // 赠送礼物
MsgId.USER_GIFT_GET_LIST = 663;         // 赠送礼物
MsgId.USER_GIFT_BROADCAST = 1042;         // 赠送礼物广播

// ------------------------ 兑换码 start ---------------------------
MsgId.USER_EXCHANGE_CODE = 664;         // 赠送礼物广播

// --------------------- 比赛场 --------------------
MsgId.GET_MATCH_CONFIG = 510;       // 获取比赛配置
MsgId.ENTER_MATCH = 511;            // 进入比赛
MsgId.GET_MATCH_INFO = 512;         // 获取比赛信息
MsgId.PUll_MATCH_INFO = 100069;     // 主动推送比赛信息
MsgId.END_MATCH = 100070;           // 比赛结束

// --------------------- 淘汰赛 --------------------
MsgId.GET_KNOCKOUT_CONFIG = 294;       // 获取配置
MsgId.GET_KNOCKOUT_INFO = 295;       // 获取某一场详细信息
MsgId.REQ_KNOCKOUT_REGISTER = 296;       // 报名某一场
MsgId.REQ_KNOCKOUT_JOIN = 297;       // 进入比赛
MsgId.REQ_KNOCKOUT_READY = 1084;       // 比赛准备提示
MsgId.REQ_KNOCKOUT_UPDATE = 1085;       // 排名更新提示
MsgId.REQ_KNOCKOUT_CHANGE = 1087;      // 中途换桌提示
MsgId.REQ_KNOCKOUT_COUNT = 1088;      // 开始统计
MsgId.REQ_KNOCKOUT_OVER = 1089;       // 最终结算
MsgId.REQ_KNOCKOUT_LOSE = 1086;      // 被淘汰通知
MsgId.REQ_KNOCKOUT_EXIT = 1090;      // 退赛退钱






// ------------------------ 好友房 end ---------------------------

// ------------------------ 通用start ---------------------------
MsgId.GET_RAND_USERS = 310;
// ------------------------ 通用end ---------------------------


//提现获取基本信息
MsgId.YD_WITHDRAW_GET = 130
MsgId.YD_WITHDRAW_SAVE = 131
MsgId.YD_WITHDRAW_DRAW = 132
MsgId.YD_WITHDRAW_RECORD = 133
MsgId.YD_WITHDRAW_BANK_SUPPORT = 136

//优惠余额
MsgId.BONUS_COIN_PRPPORTION = 260   //优惠余额提取比例
MsgId.BONUS_COIN_INFO = 418         //优惠余额信息
MsgId.BONUS_COIN_TRANSFER = 419      //优惠余额转现金余额


//推广相关
MsgId.REFER_INFO = 254
MsgId.REFER_BROADCAST_INFO = 267

MsgId.UPDATE_PINMSG = 100072

//luckyspin
MsgId.LUCKYSPIN_RECORDS = 345
//促销详情
MsgId.BONUS_PROM_LIST = 362


window.MsgId = MsgId;