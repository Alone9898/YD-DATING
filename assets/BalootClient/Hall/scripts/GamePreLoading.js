// 大厅界面预加载
const Md5 = require('Md5');
let itemsListCfg = require("GameItemCfg");
cc.Class({
    extends: cc.Component,
    properties: {
        lbl_precent: cc.Label,
        pro_precent: cc.ProgressBar,
        _pro: 0,
        _light: null,
        _openGames: [],
        _enterType: 1,//1 登录进来 2 游戏中来
    },

    onLoad() {
        Global.autoAdaptDevices(false);
        StatisticsMgr.reqReport(StatisticsMgr.REQ_HALL_LOADING_START);
        this._light = this.pro_precent.node.getChildByName("light");
        if (this._light) this._light.active = false;
    },

    start() {
        AppLog.ShowScreen('预加载场景start')
        this.initUI();
        this.preloadHall();
        // 是游戏退出到大厅type=2
        if (this._enterType == 2) {
            this._hotupdateFinish = true
            this._loadResFinish = true
        } else {
            this._loadResFinish = true;
            this.checkSubGameByMd5()

            // 进行数据缓存请求
            this.cacheViewConfig()

            //到达hallpreload界面
            let uid = cc.vv.UserManager.uid
            cc.vv.PlatformApiMgr.KoSDKTrackEvent('reach_hallpreload_ui', JSON.stringify({ game_uid: uid }))

        }

    },
    // 缓存一些界面数据
    cacheViewConfig() {
        let _config = [
            // 比赛-先关闭了
            // { delay: 0, parm: { c: MsgId.GET_KNOCKOUT_CONFIG } },
            
            // // 推荐好友
            // { delay: 0, parm: { c: MsgId.SOCIAL_FRIEND_HANDLE_RECOMMEND } },
            // // 背包缓存
            // { delay: 0, parm: { c: MsgId.REQ_SKIN_BAG } },
            
            // 个人资料
            { delay: 0, parm: { c: MsgId.PERSIONAL_INFO, otheruid: cc.vv.UserManager.uid } },
            // 全局聊天
            { delay: 0, parm: { c: MsgId.REQ_WORLD_CHAT, lastid: 0 } },// 全局聊天
            
            // Social
            { delay: 1, parm: { c: MsgId.SOCIAL_FRIEND_LIST } }, // 好友列表
            // { delay: 1, parm: { c: MsgId.SOCIAL_FRIEND_REQUEST_LIST } }, // 好友请求
            // { delay: 1, parm: { c: MsgId.SOCIAL_RECENT_PLAYER_LIST } }, // 最近玩家

            // { delay: 1, parm: { c: MsgId.EVENT_FB_INVITE_CONFIG } }, // 邀请好友配置


            // { delay: 1, parm: { c: MsgId.SOCIAL_FRIEND_MESSAGE_LIST } }, // 好友消息列表
            
            // 活动
            // { delay: 2, parm: { c: MsgId.EVENT_FB_INVITE_CONFIG } }, // 邀请活动配置
            // { delay: 2, parm: { c: MsgId.EVENT_FB_SHARE_CONFIG } },// 分享配置
            
            // { delay: 2, parm: { c: MsgId.EVENT_TASK_MAIN_CONFIG } },    //主线任务
            // { delay: 2, parm: { c: MsgId.EVENT_TASK_CONFIG, type: "1,2,4" } }, // 每日任务
            // { delay: 2, parm: { c: MsgId.EVENT_TASK_CONFIG, type: "3,5" } }, // 活跃任务
            // { delay: 2, parm: { c: MsgId.EVENT_VIP_SIGN_CONFIG } }, // VIP签到
            // { delay: 2, parm: { c: MsgId.EVENT_ONLINE_WHEEL_CONF } }, // 在线奖励转盘
            
            // 邮件
            { delay: 2, parm: { c: MsgId.REQ_MAIL_LIST } },
            // VIP房间列表
            { delay: 3, parm: { c: MsgId.VIP_ROOM_LIST } },
            // 沙龙收益记录
            { delay: 3, parm: { c: MsgId.SALON_INCOME_RECORD } },
        ];
        for (const cfg of _config) {
            // 如果拥有执行条件,则进行判断
            if (cfg.runCheck && !cfg.runCheck()) continue;
            if (cfg.parm) {
                setTimeout(() => {
                    cc.vv.NetManager.cache(cfg.parm);
                }, cfg.delay * 1000)
            }
        }
    },

    setEnterType: function (val) {
        this._enterType = val
    },

    //初始化ui
    initUI: function () {
        this._loadResFinish = null
        this._hotupdateFinish = null
        this._curDt = 0
        this._curCount = cc.vv.AppData.getLaunchProgress() * 100 || 0
        this._enterHall = null
        this._totalCheckTime = 0 //如果10s还没检查完直接进游戏
        this.loadProgress(this._curCount, 100)

        //异步请求本地价格数据
        // cc.vv.PayMgr.queryAllSKU()
        // cc.vv.PayMgr.queryAllSKUByProductids(cc.vv.UserManager.productids);

        

        cc.vv.ChipPool.createDefault(100)
    },

    //直接请求在主包version的md5方式来对比
    async checkSubGameByMd5() {
        let md5Datas = cc.vv.AppData.getSubverMd5()
        if (md5Datas) {
            for (let name in md5Datas) {
                await this._compareSubgameLocalMd5(name, md5Datas[name])
            }
        }
        else{
            AppLog.warn('未找到子游戏MD5')
        }
        this._hotupdateFinish = true
    },

    _compareSubgameLocalMd5: function (gameDir, remoteMd5) {
        let self = this



        return new Promise((resolve, reject) => {
            let gameIds = self._getGameIdByName(gameDir)
            for (let i = 0; i < gameIds.length; i++) {
                let gameId = gameIds[i]
                if(gameId){
                    let bDownloaded = cc.vv.UserManager.isDownloadSubGame(gameId)
                    if (bDownloaded) {
                        let filePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset/' + gameDir + '/project.manifest'
    
                        let fileStr = jsb.fileUtils.getStringFromFile(filePath)
                        if (fileStr) {
                            var manifest = JSON.parse(fileStr);
                            let allMd5Array = []
                            for (let val in manifest.assets) {
                                allMd5Array.push(manifest.assets[val].md5)
                            }
                            allMd5Array.sort()
                            let subFileMd5s = ""
                            for (let i = 0; i < allMd5Array.length; i++) {
                                subFileMd5s = subFileMd5s + allMd5Array[i]
                            }
    
                            let localMd5 = Md5(self.stringToUint8Array(subFileMd5s))
                            AppLog.warn('子游戏：' + gameDir + 'L:' + localMd5 + '  R:' + remoteMd5)
                            if (localMd5 == remoteMd5) {
                                //不需要更新
                                cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._addToNewList(gameId)
                            }
                            else {
                                //需要更新
                                cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._addCheckNeedDown(gameId)
                            }
                           
                        }
                    }
                }
                else{
                    AppLog.warn(gameId+'未找到子游戏目录配置：' + gameDir)
                }
                
            }



            resolve()

        })


    },

    stringToUint8Array(str) {
        var arr = [];
        for (var i = 0, j = str.length; i < j; ++i) {
            arr.push(str.charCodeAt(i));
        }

        var tmpUint8Array = new Uint8Array(arr);
        return tmpUint8Array
    },

    _getGameIdByName: function (name) {
        let ids = []
        if(name){
            for (let id in itemsListCfg) {
                if (itemsListCfg[id].name == name) {
                    ids.push(id)
                }
            }
        }
       
        return ids
    },

    preloadHall: function () {
        let self = this
        this._preLoadHallFinish = false
        cc.director.preloadScene(Global.SCENE_NAME.HALL, (err, data) => {
            cc.loader.loadRes(cc.vv.BroadcastManager.giftAnimPrefabPath, (err, prefab) => {
                cc.loader.loadRes(cc.vv.BroadcastManager.broadcastPrefabPath, (err, prefab) => {
                    self._preLoadHallFinish = true
                })
            })
        })
    },

    //load的真实进度
    loadProgress: function (completedCount, totalCount, item) {
        this._pro = Number(completedCount / totalCount);
        if (isNaN(this._pro)) {
            this._pro = 0.01
        }

        if (this._pro >= 1) this._pro = 1;
        this.pro_precent.progress = this._pro;
        this.lbl_precent.string = Global.S2P((this._pro * 100), 0) + "%";
        if (this._light) {
            this._light.active = this._pro < 1;
            this._light.x = -this.pro_precent.totalLength / 2 + this.pro_precent.totalLength * this._pro;
            this._light.y = 0;
        }
    },

    _enterNext: function () {
        AppLog.ShowScreen('预加载完成，准备进入大厅')
        StatisticsMgr.reqReport(StatisticsMgr.REQ_HALL_LOADING_END);
        let enterJLM
        if (enterJLM) {
            cc.vv.GameManager.enterTS()
        }
        else {
            cc.vv.EventManager.emit(EventId.ENTER_HALL);
        }

    },

    update: function (dt) {
        this._curDt += dt
        this._totalCheckTime += dt
        if (this._curDt > 0.05) {
            this._curDt = 0
            this._curCount += 1
            if (this._curCount >= 100) {
                if (this._hotupdateFinish && this._loadResFinish && this._preLoadHallFinish) {
                    //可以进入大厅了
                    if (!this._enterHall) {
                        this._enterHall = true
                        this._enterNext()
                    }
                }
                else {
                    this._curCount = 99
                }
            } else {
                if (this._hotupdateFinish && this._loadResFinish && this._preLoadHallFinish) {
                    //提前结束了
                    this._curCount += Global.random(20, 30)
                }
            }
            this.loadProgress(this._curCount, 100)
        }
        if (this._totalCheckTime > 20) {


            if (!this._enterHall) {
                AppLog.warn('超时直接进入大厅')
                this._enterHall = true
                this._enterNext()
            }
        }
    }

});
