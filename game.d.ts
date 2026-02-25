/**
 * 声明游戏中常用的接口（不全需要时自行添加
 * 全局对象的大部分初始化在launch.js中
 */
declare namespace cc {
    export var vv: {
        YDPRO: any;
        LoginData: any;
        NetCacheMgr: any;
        Data: {};
        HeadManager: any;
        FilterWordConfig: any;
        Timer: any;
        // 声音管理模块 实现在 AudioManager.js
        AudioManager: {
            playBGMClip: any;
            onBackGround: () => void, // 进入后台
            onBackGround: () => void, // 进入前台
            getSoundURL: (subpath: string, filename: string, iscommon: boolean) => string, // 获取声音资源路径（这里可以用来处理国际化音效）
            playBgm: (subpath, filename, iscommon, curVolum, cb, loop = true) => number, //播放背景音乐            
            stopBgm: () => void, //停止背景音乐
            playAudioClip: (audioClip, loop, callback?, volume?) => void,
            playEff: any,
            pauseAll: () => void,
            resumeAll: () => void,
            stopAudio: (audioId: number) => void, //停止背景音乐
            stopAllEffect: (debarList = []) => void,
            pauseAllEffect: () => void,
            resumeAllEffect: () => void,
            stopEffectByName: (effName) => void, // 停止某个音效
            stopAll: () => void, // 停止所有声音
            getBgmVolume: () => number; // 音乐音量
            getEffVolume: () => number; // 音效音量
            setEffVolume: (val: number) => void; // 音量
        },

        // 事件管理器 实现在 EventManager.js
        EventManager: {
            emit: (eventName: string, ...parm?) => void,  // 事件发送
            on: (eventName: string, callback, target) => void, // //事件监听
            once: (eventName, callback, target) => void, // 注册事件监听处理一次，注销
            off: (eventName, callback) => void, // 注销事件
        },
        // 网络模块 实现在 NetManager.js
        NetManager: {
            _autoConnectCountMax: number;
            init: () => void,
            registerMsg: (cmd: number, fn, target, bHighpriority) => void,
            unregisterMsg: (cmd, fn, bHighpriority = false, target) => void,
            dispatchNetMsg: (msg) => void,
            handleMsg: (msg) => void,
            handleCommonErrorCode: (errorCode) => void,
            handleResponeData: (msgData) => void,
            connect: (serverAddress, callback) => void,
            close: (callback) => void,
            reconnect: () => void,
            isConnect: () => void,
            clearTimeoutReconnect: (msgDic, isNotShowShield = false) => void,
            send: (msgDic: any, isNotShowShield = false) => void,
            sendAndCache: (msgDic: any, isNotShowShield = false) => void,
            requestHttp: (path, data, handler, extraUrl, type = "GET", parm1?, parm2?) => void,
            pack: (msgDic) => void,
            generateHead: () => string,
            linkHeadBody: (headData, bodyDataBuf) => any,
            getCheckSum: (time, msgLen, bodyData) => any,
            updateTimer: (delta) => void,
            hearBeat: () => void, // 停止心跳
            stopHearBeat: () => void, // 停止心跳
            ping: () => void, // ping心跳(发送)
            pong: () => void, // pong心跳（接收）
            getNetworkInterval: () => number, //网络信号延迟时间间隔
            getNetworkLevel: () => number, //网络信号强弱等级(分4级别：0无信号 1弱 2有延迟 3很好)
        },

        // 平台api 实现在 PlatformApi.js
        PlatformApiMgr: any,

        // 弹窗管理类 实现在 PopUIMgr.js
        PopUIMgr: any,

        // 子游戏配置 实现在 GameDataCfg.js
        GameDataCfg: {
            init();
            gameDataList: Map<number, any>,
            getGameData: (gameId: number) => any,
        },

        // 监听一些通用数据消息 在GameInit.js中初始化 在AppData.js中实现
        AppData: {
            getHotupdateStart: any;
            setLaunchProgress(val: any);
            setSubverMd5(subVer: any);
            getGameId: () => number;
            clearGameId: () => void;
            getIsInGame: () => boolean;
        },

        // 语言文件 在在GameInit.js中初始化 在 ChineseCfg.js 和 EnglishCfg中定义
        Language: any,

        // 路径配置 在PathManager.js中定义
        PathMgr: any;

        // 漂浮提示 实现在 FloatTip.js
        FloatTip: any,

        // 奖励动画
        RewardFly: {
            run: (rewards: any, fromNode: cc.Node) => void;
        },

        // 提示弹窗 接口在 AlertViewMgr.js 实现在 AlertView
        AlertView: {
            init(arg0: string);
            showTips: (tisp: string, sureCb?) => void,
            show: any;
        },

        // 场景管理 实现在 SceneMgr.js
        SceneMgr: {
            enterScene: (sceneName, callback, orientation?) => void,
            GetCurSceneName: () => string,
            isInHallScene: () => boolean,
            isInLoginScene: () => boolean,
            CanShowHallPreLoading: () => boolean,
            setParams: (params) => void,
            getParams: (clean = true) => void
        },

        // 常驻节点 绑定组件subGameMgr(subGameMgr.js) 用于管理子游戏下载更新
        SubGameUpdateNode: cc.Node,

        // 游戏管理 实现在 GameManager.js
        GameManager: {
            jumpTo(jumpTo: any);
            reqLoginUserid(loginData: any);
            reqLogin(localNickname: string, localNickname: string, Guest: any, arg3: string, loginAction: any, token: any);
            nativeSkipHotupdate();
            getSaveKeyReqLoginParam(): any;
            sendEnterGameReq: (gameId: number, ssid) => void,
            EnterGame: (gameId: number) => void,
        },

        // 用户数据 实现在 UserManager.js
        UserManager: {
            drawUrl: any;
            kycUrl: any;
            kyc: any;
            payurl: any;
            draw: any;
            signrewards: any;
            tmpvip: number;
            voice: number;
            charmpack: number;
            newbiedone: number;
            blockuids: any;
            salontesttime: any;
            getNickName();
            isbindapple: number;
            isbindfb: number;
            isbindphone: number;
            uid: number;
            // level: number;
            nickName: string;
            userIcon: string,
            coin: number;
            totalcoin: number;
            club: any;
            rp: any;
            moneybag: number;
            roomcnt: number;
            leagueexp: number;
            nextbag: number;
            // 是否需要开启新手引导
            gameNewerGuide: number;
            sess: any;
            setDiamond: (diamond: number, isSendEvent: boolean) => void;
            getDiamond: () => number,
            level: () => number,
            avatarframe: string,
            chatskin: string,
            tableskin: string,
            pokerskin: string,
            faceskin: string,
            emojiskin: string,
            frontskin: string,
            salonskin: string,
            svip: number,
            getVip: () => number,
            svipexp: number,
            nextvipexp: number,
            getviplv: number[],
            leftdays: number,
            emojilist: string[],
            gameList: any[],
            slotsList: any[],
            fgamelist: any[],
            pinlist: any[],
            viproomcnt: any[],
            favorite_games: any[],
            sharelink: string,
            sender: number;
            shoptimeout: number;

            offlineaward: number;
            offlinetime: number;

            whatapplink: string,
            uploadlink: string,

            slotVoteCountry: number;
            namerewards: any[],
            leagueRmindTime: number;
            adpics: any;


        },

        // 喇叭管理 实现在 SpeakerMgr.js
        SpeakerMgr: any,

        // json 文件管理
        JsonMgr: {
            Init();
            async LoadJson: (fileName) => void;
            GetJson: (fileName) => any;
        },

        FBMgr: {
            deskInvite: any;
            fbShareWeb: any;
            WhatsappShare: any;
            MessagerShare: any;
        },

        // 商店
        Shop: {
            show: () => void;
        }

        /**
         * 弹窗管理控制器
         */
        PopupManager: {
            addPopup: (path: string | cc.Prefab, args?: {
                onShow?: (node: cc.Node) => void,
                onShowEnd?: (node: cc.Node) => void,
                onClose?: (node: cc.Node) => void,
                opacityIn?: boolean,
                scaleIn?: boolean,
                noMask?: boolean,
                noCloseHit?: boolean,
                noTouchClose?: boolean,
                touchThrough?: boolean,
                delayCloseTime?: number,
                weight?: number,
                isWait?: boolean,
                pos?: any
            }) => void;
            removePopup: (popupNode: cc.Node) => void;
            removeAll: () => void;
            removeTop: () => void;
            checkIsAdded: (popupNode: cc.Node) => void;
            getPopupByName: (name: string) => cc.Node;
        }

        RedHitManager: {
            setFilterKeys: (keys: string[]) => void;
        },

        // 子游戏数据
        gameData: any,

        // 多语言管理器
        i18nManager: any,
        i18nLangEnum: any,

        UserConfig: any,
        PayMgr: {
            reqPurchaseOrder: (id: number) => void;
            getLocalPrice: (pid: any) => string;
        },
        RewadPath: any,

        // 广播管理器
        BroadcastManager: {
            init();
            broadcastPrefabPath: string;
            addBroadcast: (broadcast: { content: string, direction: number }) => void;
            giftAnimPrefabPath: string;
        }

        ResManager: {
            setSpriteFrame(statusIcon: Sprite, arg1: string, arg2: null, arg3: null);
            loadImage: any;
            loadPrefab: any;
        }
    }
}

/**
 * 日志接口
 */
declare var AppLog: {
    ShowScreen(arg0: string);
    getDateString: () => string,
    log: (...args) => void,
    info: (...args) => void,
    warn: (...args) => void,
    err: (...args) => void,
}

/**
 * 声明挂在Global变量下面的接口
 * 包含的文件 GlobalVar.js GlobalCfg.js GlobalFunc.js
 */
declare var Global: any;

/**
 * 网络消息id定义 实现在 MsgIdDef.js
 */
declare var MsgId: any;

/**
 * 事件名定义 实现在 EventDef.js AppIdEventId.js table_game_eventid.js 等等
 */
declare var EventId: any;

/**
 * 统计打点模块 实现在 StatisticsMgr.js
 */
declare var StatisticsMgr: any;
declare var ReportConfig: any; // 配置

declare var ListView: any;

/**
 * 棋牌子游戏入口类实例引用
 */
declare var facade: any;

// ###多语言相关#### //

declare function ___(...args);

declare function __(...args);