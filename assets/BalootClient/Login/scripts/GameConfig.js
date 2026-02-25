/*
** CashHero游戏自己的全局配置
** 避免不通用游戏的配置到frameworkd/golbalCfg.js
*/

var GlobalMgr = require('GlobalVar');

//场景名称定义
GlobalMgr.SCENE_NAME = {
    LAUNCH: 'Launch_BC',						//启动场景
    HOTUPDATE: 'HotUpdate_BC', 				    //热更场景
    LOGIN: 'Login_BC',						    //登陆场景
    HALL_PRELOAD: 'PreLoading_BC', 	            //大厅加载
    HALL: 'Hall_BC',							//大厅场景
    CHANGE_LANGUAGE: 'ChangeLanguage',			//切换语言中间场景
}

//游戏默认方向
GlobalMgr.APP_ORIENTATION = 'portrait'
//大厅金币节点路径
GlobalMgr.HALL_TOPCOIN_PATH = 'Canvas/top/coin_bg' //金币节点
GlobalMgr.HALL_COIN_NODE_PATH = 'Canvas/top/coin_bg/spr_coin' //金币精灵节点
GlobalMgr.HALL_COIN_LABEL_NODE_PATH = 'Canvas/top/coin_bg/lbl_coin' //金币数字label
GlobalMgr.INGAME_COIN_LABEL_NODE_PATH = 'Canvas/safe_node/LMSlots_Top/playerCoins/lbl_coinsNum' //游戏内金币数字
GlobalMgr.INGAME_COIN_NODE_PATH = 'Canvas/safe_node/LMSlots_Top/playerCoins/icon_coin' //游戏内金币


GlobalMgr.QUEST_REWARD = 3500000
//系统开放等级
GlobalMgr.SYS_OPEN = {
    GUIDE_CHANGEBET: 3,	//3级引导修改押注额度
    QUEST_TASK: 4,
    PIG_BANK: 8,
    PIG_BANK_FREEBUY: 20, //金猪免费送
    FRIEND: 1500,	//好友
    HERO_CARD: 12,	//卡牌系统开放12
    LUCKY_SMASH: 16, //砸金蛋16级
    BINGO: 10,		//bingo10级
    DAILYTASK: 5,	//日常任务5
    LUCKY_CARD: 25,	//幸运抽卡25。需要在卡牌系统之后开
    HERO_PALACE: 1, //富豪厅1
}

//商品定义
Global.SHOP_POS_ID = {
    HALL: 1, //大厅
    GAME: 2, //游戏内
    PERSONALINFO: 2,     //个人信息
    NOENOUGHMONEY: 2,    //钱不够
    MULTIPLAYERS: 3,     //大厅二级大厅
};

// Global.PID_CFG = {
//     "google": [
//         "com.sekiengame.2",
//         "com.sekiengame.3",
//         "com.sekiengame.4",
//         "com.sekiengame.5",
//         "com.sekiengame.6",
//         "com.sekiengame.7",
//         "com.sekiengame.8",
//         "com.sekiengame.9",
//         "com.sekiengame.10",
//         "com.sekiengame.11",
//         "com.sekiengame.12",
//         "com.sekiengame.13",
//         "com.sekiengame.15",
//         "com.sekiengame.25",
//         "com.wwlnsg.1",
//         "com.wwlnsg.2",
//         "com.wwlnsg.3",
//         "com.wwlnsg.4",
//         "com.wwlnsg.5",
//         "com.wwlnsg.6",
//         "com.wwlnsg.7",
//         "com.wwlnsg.8",
//         "com.wwlnsg.9",
//         "com.wwlnsg.10",
//         "com.diamond.1",
//         "com.diamond.2",
//         "com.diamond.3",
//         "com.diamond.4",
//         "com.diamond.5",
//         "com.diamond.6",
//         "com.diamond.7",
//         "com.diamond.8",
//         "com.diamond.9",
//         "com.diamond.10",
//     ],
//     "ios": [
//         "com.sekiengame.2",
//         "com.sekiengame.3",
//         "com.sekiengame.4",
//         "com.sekiengame.5",
//         "com.sekiengame.6",
//         "com.sekiengame.7",
//         "com.sekiengame.8",
//         "com.sekiengame.9",
//         "com.sekiengame.10",
//         "com.sekiengame.11",
//         "com.sekiengame.12",
//         "com.sekiengame.13",
//         "com.arabhero.1",
//         "com.arabhero.2",
//         "com.arabhero.3",
//         "com.arabhero.4",
//         "com.arabhero.5",
//         "com.arabhero.6",
//         "com.arabhero.7",
//         "com.arabhero.8",
//         "com.gospinx.1",
//         "com.gospinx.2",
//         "com.gospinx.3",
//         "com.gospinx.4",
//         "com.gospinx.5",
//         "com.gospinx.6",
//         "com.gospinx.7",
//     ],
//     "huawei": [
//         "com.sekiengame.720",
//         "com.sekiengame.31",
//         "com.sekiengame.30",
//         "com.sekiengame.29",
//         "com.sekiengame.28",
//         "com.sekiengame.27",
//         "com.sekiengame.26",
//         "com.sekiengame.25",
//         "com.sekiengame.24",
//         "com.sekiengame.23",
//         "com.sekiengame.22",
//         "com.sekiengame.21",
//         "com.sekiengame.20",
//         "com.sekiengame.15",
//         "com.sekiengame.14",
//         "com.sekiengame.13",
//         "com.sekiengame.12",
//         "com.sekiengame.11",
//         "com.sekiengame.10",
//         "com.sekiengame.9",
//         "com.sekiengame.8",
//         "com.sekiengame.7",
//         "com.sekiengame.6",
//         "com.sekiengame.5",
//         "com.sekiengame.4",
//         "com.sekiengame.3",
//         "com.sekiengame.2",
//     ],
//     "huawei14": [
//         "com.durak.2",
//         "com.durak.3",
//         "com.durak.5",
//         "com.durak.6",
//         "com.durak.7",
//         "com.durak.8",
//         "com.durak.9",
//         "com.durak.10",
//         "com.durak.11",
//         "com.durak.12",
//         "com.durak.13",
//         "com.durak.14",
//         "com.durak.15",
//         "com.durak.23"],
// }


