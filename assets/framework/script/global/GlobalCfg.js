/*
** 全局配置
** 主要是定义各种资源
*/

var GlobalMgr = require('GlobalVar');

GlobalMgr.ChatType = {
	TXT: 0,
	EMOJI: 1,
	VOICE: 2,
	TXT_EFF: 3,
};

GlobalMgr.LoginType = {
	Guest:1,	//游客登录
	WX:2,		//微信登录
	ACCOUNT: 4, //账号登录
	REGISTER: 5, //注册
	TOKEN:6,	//token登录
	APILOGIN:7,	//Api调用登陆
    GOOGLE_LOGIN:10, //google登录
    APPLE_LOGIN: 11, //苹果登录
	FB:12,		//fb登录
	HUAWEI:13,	//huawei
	PHONE:9,	//手机号
}

//产品id定义
GlobalMgr.APPID = {
	BigBang:1,
	Poly:4,

	SouthAmerica: 6, //南非华为
    Indian:7,		//印度渠道
	HuaweiDRM:8,    //华为DRM
	Baloot:9,
	Baloot_HW:11,

	PokerHero:12,	//poker hero
	PokerHero_HW:13,//pokerhero华为渠道
	PokerHero_Durak_HW:14, //pokerhero华为渠道durak包
	PokerHero_HW_CardMaster:18, //ArabHero 华为渠道合作包

	YonoGames:17,

	TestCashHero:10, //内网映射测试包CashHero
	TestPokerHero:100, //内网映射测试包PokerHero
}

//是否是华为渠道包
GlobalMgr.IsHuawei = function(){
	if(Global.isAndroid()){
		let bHuawei = (Global.appId == Global.APPID.SouthAmerica || Global.appId == Global.APPID.HuaweiDRM || Global.appId == Global.APPID.Baloot_HW 
			|| Global.appId == Global.APPID.PokerHero_HW || Global.appId == Global.APPID.PokerHero_Durak_HW
			|| Global.appId == Global.APPID.PokerHero_HW_CardMaster)
		return bHuawei
	}
	
}

GlobalMgr.isDurakApp = function() {
	return Global.appId == Global.APPID.PokerHero_Durak_HW
}

GlobalMgr.isYDApp = function(){
	return Global.appId == Global.APPID.YonoGames
}

GlobalMgr.isArabHero = function(){
	return Global.appId == Global.APPID.PokerHero || Global.appId == Global.APPID.PokerHero_HW;
}

//语言定义
GlobalMgr.LANGUAGE = {
	EN:'en',	//英文
	ZH:'zh',	//中文
	IDA:'ida',	//印度文
	AR:'ar',	//阿拉伯文
}



//登陆扩展参数
GlobalMgr.LoginExData = {
	loginAction:1, //标识是登陆界面登陆
	reloginAction:2,//标识是断线重连
}

GlobalMgr.ERROR_CODE = {
	NORMAL: 200,
},

//全局常量定义
GlobalMgr.CONST_NUM = {
	HIGHT_ZORDER : 100,	//像提示框，loading框这些层级需要提高
},

//物品ID
GlobalMgr.PROP_ID = {
    COIN: 1,            // 金币
    VIP_POINT: 2,       // VIP点数
    DOUBLE_LEVEL_EXP: 3,// 双倍等级经验
    DOUBLE_LEVEL_REWARD: 4, // 双倍等级奖励
    TURN_TABLE: 5,      // 在线转盘
    ACTIVITY: 6,        // 活跃值
    MISSION: 7,         // mission star
    HERO_CARD: 8,       // 英雄卡包（需要展示开包动画）
	HERO_FRAGEMENT:26,	//英雄碎片（不需要开包过程）
	LUCKY_RESTART:9,	// luckycard复活卡
	RICH_POINT: 10,     //富豪点
	ACTIVITY_DAILY:11,	//每日活跃度
	ACTIVITY_WEEKLY:12,	//每周活跃度
	GLOD_HUMER:13,		//金锤子
	BINGO_BALL:16,		//bingo-球
	LUCKY_BOM:20,		// 炸弹
	FULL_CARD:21,		//整卡
	EXPLORE_DICE:22,	// 骑士探险-罗盘
	DIAMOND:25,			//钻石
    HEROCARD_EXP:27,    //万能经验
    PVP_TICKET:28,      //pvp门票
    DOUBLE_LEVEL_EXP_AR:29,      //双倍等级经验 阿拉伯版本
	
	EXPRESS_GIFT_CAR:31,	//互动表情-跑车
	EXPRESS_GIFT_EVIL:32,	//互动表情-恶魔
	EXPRESS_GIFT_DRINK:33,	//互动表情-饮料
	EXPRESS_GIFT_KISS:34,	//互动表情-吻
	EXPRESS_GIFT_MONEY:35,	//互动表情-钱
	EXPRESS_GIFT_CAKE:36,	//互动表情-蛋糕
	EXPRESS_GIFT_RING:37,	//互动表情-戒指
	EXPRESS_GIFT_TOWER:38,	//互动表情-塔
	
	

	LOCAL_FULL_CARD:10021,//客户端临时的整卡
	LOCAL_HERO_CARD:10008,//客户端临时的碎片
},

//物品详情配置
GlobalMgr.ITEMCFG = {
	1:{name:'COIN'},
	2:{name:'VIP POINTS'},
	3:{name:'DOUBLE EXP'},
	8:{name:'HERO PACKS'},
	9:{name:'LUCKY CARDS'},
	10:{name:'HERO PALACE'}
}

//声音资源配置
//common表示共用，不考虑切换语言
GlobalMgr.SOUNDS = Global.SOUNDS || {};
GlobalMgr.SOUNDS.bgm_hall = {path: 'CashHero/' , filename:'hall/bgm_hall', common: true};               //大厅背景音乐
GlobalMgr.SOUNDS.bgm_hall_slots = {path: 'CashHero/' , filename:'hall/bgm_hall_slots', common: true};     //大厅slots页面背景音乐
GlobalMgr.SOUNDS.bgm_hall_club = {path: 'CashHero/' , filename:'hall/bgm_hall_club', common: true};     //大厅club页面背景音乐
GlobalMgr.SOUNDS.bgm_herocard = {path: 'CashHero/' , filename:'hall/hero_bgm', common: true};	//大厅herocard背景音乐
GlobalMgr.SOUNDS.bgm_quest = {path: 'CashHero/' , filename:'quest/bgm_quest', common: true};     //Quest界面背景音乐
GlobalMgr.SOUNDS.bgm_login = {path: 'CashHero/' , filename:'hall/LobbyMailBgm', common: true}; 			//登录音效
GlobalMgr.SOUNDS.game_loading = {path: 'CashHero/' , filename:'hall/game_loading', common: true}; 			//登录音效
GlobalMgr.SOUNDS.sound_fly_coins = {path: 'CashHero/' , filename:'CoinBalanceComplete', common: true};		//飞金币音效
GlobalMgr.SOUNDS.bgm_poker_2nd = {path: 'CashHero/' , filename:'hall/LobbyWheelBgm', common: true};	//二级大厅背景音乐
GlobalMgr.SOUNDS.bgm_luckycard = {path: 'CashHero/' , filename:'luckycard/bgm', common: true};	//luckycard bgm
GlobalMgr.SOUNDS.bgm_battle = {path: 'CashHero/' , filename:'pvp/bgm_battle', common: true};	//战斗 bgm

//欢呼声
GlobalMgr.SOUNDS.sound_celebration = {path: 'CashHero/' , filename:'hall/celebration', common: true};
//挂卡声
GlobalMgr.SOUNDS.sound_scratch = {path: 'CashHero/' , filename:'hall/scratch', common: true};
//pick声
GlobalMgr.SOUNDS.sound_pick = {path: 'CashHero/' , filename:'hall/pick_open', common: true};
GlobalMgr.SOUNDS.sound_level_up = {path: 'CashHero/' , filename:'hall/levelup_collect', common: true};		//经验升级音效
GlobalMgr.SOUNDS.bgm_hall_wheel = {path: 'CashHero/' , filename:'hall/LobbyWheelBgm', common: true};	//转盘背景音乐
GlobalMgr.SOUNDS.sound_wheel_spin = {path: 'CashHero/' , filename:'hall/wheel_spin', common: true};		//转盘开始按钮音效
GlobalMgr.SOUNDS.sound_wheel_result = {path: 'CashHero/' , filename:'hall/wheel_result', common: true};	//转盘转完显示结果音效
GlobalMgr.SOUNDS.sound_wheel_pointer = {path: 'CashHero/' , filename:'hall/wheel_pointer', common: true};	//转盘指针音效
GlobalMgr.SOUNDS.sound_click = {path: 'CashHero/' , filename:'hall/TabClick', common: true};     //大厅底部按钮切换


//播放背景音乐
GlobalMgr.playBgm = function (bgm_cfg, cb, loop) {
	Global._bgmlist = Global._bgmlist || []
	Global._bgmlist.push(bgm_cfg)
	if (bgm_cfg == null || bgm_cfg == undefined) {
		AppLog.warn('bgm_cfg is null or undefined');
		return;
	}

	if (typeof(bgm_cfg) == 'string') {
		cc.vv.AudioManager.playBgm(bgm_cfg, false, cb);
	}
	else {
		if (bgm_cfg.rmax) bgm_cfg = Global.randomEffCfg(bgm_cfg, bgm_cfg.rmin || 0, bgm_cfg.rmax); //随机音效
		var filename = bgm_cfg.filename;
		cc.vv.AudioManager.playBgm(bgm_cfg.path, filename, bgm_cfg.common, bgm_cfg.vol, cb, loop);
	}
};

//恢复前一个BGM
GlobalMgr.popBgm = function(){
	if(Global._bgmlist){
		Global._bgmlist.pop()
		Global.playBgm(Global._bgmlist.pop())
	}
},

//播放音效
//sex 性别
//idx 序列（以下划线添加到filename后面）
GlobalMgr.playEff = function (eff_cfg, sex, idx) {
	if (eff_cfg == null || eff_cfg == undefined) {
		AppLog.warn('eff_cfg is null or undefined');
		return;
	}
	var audioID = null
	if (typeof(eff_cfg) == 'string') {
		audioID = cc.vv.AudioManager.playEff(eff_cfg, false);
	}
	else {
		if (eff_cfg.rmax) eff_cfg = Global.randomEffCfg(eff_cfg, eff_cfg.rmin || 0, eff_cfg.rmax); //随机音效

		var filename = eff_cfg.filename;
		if (idx != null) filename = filename + '_' + idx;//音效索引
		if (sex != null && sex != undefined ) {
			if (sex == 1) 
				filename += '_B';
			else 
				filename += '_G';
		}
		audioID = cc.vv.AudioManager.playEff(eff_cfg.path, filename, eff_cfg.common);
	}
	return audioID
};

//播放通用音效
GlobalMgr.playComEff = function (filename) {
    cc.vv.AudioManager.playSimpleEff("CashHero/audio/common/"+filename);
}

//播放CashHero/audio目录内的音效
GlobalMgr.playCashEff = function (filename) {
    cc.vv.AudioManager.playSimpleEff("CashHero/audio/"+filename);
}

GlobalMgr.playSimpleEff = function (filename) {
	cc.vv.AudioManager.playSimpleEff("arabhero/audio/"+filename);
}

//重组随机资源名称
GlobalMgr.randomEffCfg = function (eff_cfg, start, end) {
	var eff_cfg_cp = JSON.parse(JSON.stringify(eff_cfg)); //相当于深拷贝
	var idx = Global.random(start, end);
	eff_cfg_cp.filename += ('_' + idx);
	return eff_cfg_cp;
};



/*key定义*/
GlobalMgr.SAVE_KEY_REQ_LOGIN = 'SAVE_KEY_REQ_LOGIN';
GlobalMgr.SAVE_KEY_ACCOUNT_PW = 'SAVE_KEY_ACCOUNT_PW';
GlobalMgr.SAVE_KEY_IS_REMEMBER = 'SAVE_KEY_IS_REMEMBER';
GlobalMgr.SAVE_KEY_LOGIN_TYPE  = 'SAVE_KEY_LOGIN_TYPE'; //登录方式
// GlobalMgr.SAVE_KEY_LAST_LOGIN_TYPE  = 'SAVE_KEY_LAST_LOGIN_TYPE'; //上次登录方式
GlobalMgr.SAVE_PLAYER_TOKEN  = 'SAVE_PLAYER_TOKEN'; 			  //上次登录方式
GlobalMgr.SAVE_LANGUAGE  = 'SAVE_LANGUAGE'; 					  //保存语言
GlobalMgr.SAVE_FROM_SUBGAME_ID  = 'SAVE_FROM_SUBGAME_ID'; // 进入子游戏时保存，返回大厅时大厅用到
