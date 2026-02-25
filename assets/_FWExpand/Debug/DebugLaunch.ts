const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugLaunch extends cc.Component {
    onLoad() {
        this.debugLaunch();
    }

    debugLaunch() {
        let _cc: any = cc;
        _cc.vv = {};
        _cc.vv.UserManager = {};
        _cc.vv.NetManager = {};
        _cc.vv.AudioManager = {};

        require('AppLog');
        require('GlobalVar');
        require('MsgIdDef');
        require('EventDef');
        require('GlobalCfg');
        require('GlobalFunc');
        require('MsgIdConfig');
        require('GlobalTools');

        // 补充判断一下
        Global.isAndroid = function () {
            if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative && jsb) {
                return true;
            }
            return false;
        }
        Global.isIOS = function () {
            if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative && jsb) {
                return true;
            }
            return false;
        }
        // 判断是否是独立版本
        Global.isSingle = function () {
            return false;
        }

        // 全局定时器
        let timer = require('TimerMgr');
        timer.init();
        cc.vv.Timer = timer

        var audioMgr = require('AudioManager');
        audioMgr.init();
        cc.vv.AudioManager = audioMgr;

        cc.vv.EventManager = require('EventManager');

        var netMgr = require('NetManagerEx');
        // netMgr.init();
        cc.vv.NetManager = netMgr;

        //原生平台Api管理
        var platformApiMgr = require('PlatformApi');
        platformApiMgr.init();
        cc.vv.PlatformApiMgr = platformApiMgr;

        let PopupManager = require('PopupManager');
        PopupManager.init();
        cc.vv.PopupManager = PopupManager;

        require('StatisticsMgr');
        StatisticsMgr.startReport();
        // 红点管理器
        let RedHitManager = require('RedHitManager');
        RedHitManager.init();
        cc.vv.RedHitManager = RedHitManager;
        // 广播管理器
        cc.vv.BroadcastManager = require('../Broadcast/BroadcastManager').BroadcastManager;
        cc.vv.BroadcastManager.broadcastPrefabPath = "BalootClient/BaseRes/prefabs/Broadcast"
        cc.vv.BroadcastManager.giftAnimPrefabPath = "BalootClient/UserInfo/prefabs/PopupGiftAnim"
        cc.vv.BroadcastManager.init();
        // 多语言管理器
        cc.vv.i18nManager = require('../i18n/i18nManager').i18nManager;
        cc.vv.i18nLangEnum = require('../i18n/i18nConst').i18nLangEnum;
        // 资源管理器
        cc.vv.ResManager = require('ResManager');
        // 用户配置
        cc.vv.UserConfig = require('UserConfig');

        let gameDataCfg = require('GameDataCfg');
        cc.vv.GameDataCfg = gameDataCfg;
        cc.vv.GameDataCfg.init();

        let gameInit = require("GameInit");
        gameInit.init();

        let FloatTips = require("FloatTipEx");
        cc.vv.FloatTip = new FloatTips();

        let AlertViewMgr = require("AlertViewMgr");
        cc.vv.AlertView = new AlertViewMgr();
        cc.vv.AlertView.init("BalootClient/BaseRes/prefabs/poly99_AlterView")

        let sceneMgr = require("SceneMgr");
        cc.vv.SceneMgr = sceneMgr;

        let node = new cc.Node();
        node.addComponent('subGameMgr');
        cc.vv.SubGameUpdateNode = node;
        cc.game.addPersistRootNode(node);

        //游戏管理
        if (!cc.vv.GameManager) {
            var gameMgr = require('GameManagerEx');
            gameMgr.init();
            cc.vv.GameManager = gameMgr;
        }

        //用户数据管理
        var userMgr = require('UserManagerEx');
        userMgr.init();
        cc.vv.UserManager = userMgr;

        // Json加载管理
        let jsonMgr = require("JsonMgr")
        cc.vv.JsonMgr = new jsonMgr()
        cc.vv.JsonMgr.Init()

        //头像管理器
        let HeadManager = require('HeadManager');
        HeadManager.init();
        cc.vv.HeadManager = HeadManager;

        //全局临时数据
        cc.vv.Data = {}
        cc.vv.FloatTip.init("BalootClient/BaseRes/prefabs/poly99_FloatTip");
        this.loadLoadingTip();
        // this.loadAlterView();
        AppLog.ShowScreen('加载代码完成')

        if (!cc.vv.NetCacheMgr) {
            let scp = require("PH_NetCacheMgr")
            cc.vv.NetCacheMgr = new scp()
            cc.vv.NetCacheMgr.init()
        }

        cc.vv.UserManager.uid = 1;
        // _cc.vv.NetManager = {};
        cc.vv.NetManager.send = () => { };
        cc.vv.NetManager.reconnect = () => { };
    }

    loadLoadingTip() {
        let func = (err, prefab) => {
            if (err == null) {
                let node = cc.instantiate(prefab);
                cc.game.addPersistRootNode(node);
            }
            else {
                AppLog.err('prefab(BalootClient/BaseRes/prefabs/poly99_LoadingTip) load error')
            }
        };
        cc.loader.loadRes("BalootClient/BaseRes/prefabs/poly99_LoadingTip", cc.Prefab, (err, prefab) => {
            func(err, prefab);
        });
    }
}
