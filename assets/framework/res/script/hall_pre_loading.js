// 大厅界面预加载
const Md5 = require('Md5');
let itemsListCfg = require("GameItemCfg");
cc.Class({
    extends: cc.Component,

    properties: {
        
        lbl_precent:cc.Label,
        pro_precent:cc.ProgressBar,
        _pro:0,
        _light:null,
        _openGames:[],
        _enterType:1,//1 登录进来 2 游戏中来
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        Global.autoAdaptDevices(false);

        if(StatisticsMgr){
            StatisticsMgr.reqReport(StatisticsMgr.REQ_HALL_LOADING_START);
        }
        

        this.node.name = Global.SCENE_NAME.HALL_PRELOAD
        this._light = this.pro_precent.node.getChildByName("light");
        if(this._light) this._light.active = false;

        AppLog.ShowScreen('大厅预加载启动')
     },

    start () {
       

        this.initUI();
        
        this.preloadHall();
        //是游戏退出到大厅type=2
        if(this._enterType == 2){
            cc.vv.UserManager.syncHallInfo()
            this._hotupdateFinish = true
            this._loadResFinish = true
        }
        else{
            this.checkUnusedSubgame()
            this.loadAtlas();
            this.checkSubGameByMd5()
            this.loadMsgCache()
        }


        
    },

    setEnterType:function(val){
        this._enterType = val
    },

    //初始化ui
    initUI:function(){
        //缓存消息不卡流程
        this._loadBaseMsgFInish = true

        this._loadResFinish = null
        this._hotupdateFinish = null
        this._curDt = 0
        this._curCount = 0
        if(cc.vv.AppData){
            this._curCount = Math.floor(cc.vv.AppData.getLaunchProgress()*100) || 0
        }
        

        this._enterHall = null
        this._totalCheckTime = 0 //如果10s还没检查完直接进游戏
        this.loadProgress(this._curCount,100)
        
        

    },

    loadMsgCache:function(){
        
        cc.vv.NetCacheMgr.loadBasicMsg()
    },

    loadAtlas:function(){
        let self = this
        
        //加载登陆弹窗预制
        let loadPrefabs = []
        let pop = cc.vv.PopUIMgr.getLoginPopList()
        for(let i = 0 ; i < pop.length; i++){
            let url 
            let val = pop[i]
            if(val == 2){
                url = 'common/prefab/one_time_only'
            }
            else if(val == 15 ){
                url = 'CashHero/prefab/growth_fund/growth_fund_ad'
            }
            else if(val == 16 ){
                url = 'CashHero/prefab/firstBuyGift'
            }
            else if(val == 12 ){
                url = 'CashHero/prefab/month_card'
            }
            else if(val == 11){
                url = 'CashHero/prefab/quest_loginpop'
            }
            else if(val == 5){
                url = 'hall_prefab/SignIn'
            }
            else if(val == 10){
                url = 'CashHero/prefab/offline_reward'
            }
            else if(val == 1){
                url = 'hall_prefab/NewerGift'
            }
            else if(val == 18){
                url = 'CashHero/prefab/notice_rewards'
            }
            
            if(url){
                loadPrefabs.push(url)
            }
            
        }

        //押注选择界面
        let betSelect = 'CashHero/prefab/Bet_Select'
        loadPrefabs.push(betSelect)

        
        let endCall = function(){
            AppLog.ShowScreen('大厅预加载-预加载资源完成')
           
            self._loadResFinish = true
        }
        Global.LoadByQueue(loadPrefabs,cc.Prefab,null,endCall)
    },

    //直接请求在主包version的md5方式来对比
    async checkSubGameByMd5(){
        let md5Datas = cc.vv.AppData.getSubverMd5()
        if(md5Datas){
            for(let name in md5Datas){
                await this._compareSubgameLocalMd5(name,md5Datas[name])
            }
        }
        
        this._hotupdateFinish = true
        AppLog.ShowScreen('大厅预加载-子包检查完成')
    },

    _compareSubgameLocalMd5:function(gameDir,remoteMd5){
        let self = this
        return new Promise((resolve,reject) => {
            let gameId = self._getGameIdByName(gameDir)
            if(gameId){
                let bDownloaded = cc.vv.UserManager.isDownloadSubGame(gameId) 
                if(bDownloaded){
                    let filePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset/'+gameDir+'/project.manifest'
                
                    let fileStr = jsb.fileUtils.getStringFromFile(filePath)
                    if(fileStr){
                        var manifest = JSON.parse(fileStr);
                        let allMd5Array = []
                        for(let val in manifest.assets){
                            allMd5Array.push(manifest.assets[val].md5)
                        }
                        allMd5Array.sort()
                        let subFileMd5s = ""
                        for(let i = 0; i < allMd5Array.length; i++){
                            subFileMd5s = subFileMd5s + allMd5Array[i]
                        } 
                        
                       
                        let localMd5 = Md5(self.stringToUint8Array(subFileMd5s))
                        AppLog.warn('子游戏：'+gameDir+'L:'+localMd5 + '  R:'+remoteMd5)
                        if(localMd5 == remoteMd5){
                            //不需要更新
                            cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._addToNewList(gameId)
                        }
                        else{
                            //需要更新
                            cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._addCheckNeedDown(gameId)
                        }
                        
                    }
                }
            }
            else{
                AppLog.warn('未找到子游戏目录配置：'+gameDir)
            }

            
            
            
            resolve()
                
        })
        
        
    },

    stringToUint8Array(str){
        var arr = [];
        for (var i = 0, j = str.length; i < j; ++i) {
          arr.push(str.charCodeAt(i));
        }
       
        var tmpUint8Array = new Uint8Array(arr);
        return tmpUint8Array
    },

    _getGameIdByName:function(name){
        for(let id in itemsListCfg){
            if(itemsListCfg[id].name == name){
                return id
            }
        }
    },

    preloadHall:function(){
        let self = this
        this._preLoadHallFinish = false
        cc.director.preloadScene(Global.SCENE_NAME.HALL,(err,data)=>{
            self._preLoadHallFinish = true
            AppLog.ShowScreen('大厅预加载-大厅场景加载完成')
        })
    },

    //检查无用的内置子游戏
    //因为有些子游戏由动态下载的游戏变成内置游戏了.原来的目录就需要删除,不然会优先找到原来的子游戏目录
    checkUnusedSubgame:function(){
        let gameIds = cc.vv.UserManager.getNoNeedDownGames()
        for(let i = 0; i < gameIds.length; i++){
            let item = gameIds[i]
            let cfg = itemsListCfg[item]
            if(cfg){
                cc.vv.SubGameUpdateNode.getComponent('subGameMgr').deleteSubgameDir(cfg.name)
            }
        }
    },


   

    //load的真实进度
    loadProgress:function(completedCount, totalCount, item){
        
        this._pro =  Number(completedCount/totalCount);
        if( isNaN(this._pro)){
            this._pro = 0.01
        }
        
        if(this._pro >=1) this._pro = 1;
        this.pro_precent.progress = this._pro;
        this.lbl_precent.string = Global.S2P((this._pro*100),0)+"%";
        if(this._light) {
            this._light.active = this._pro<1;
            this._light.x = -this.pro_precent.totalLength/2 + this.pro_precent.totalLength*this._pro;
            this._light.y = 0;
        }
    },

    

    _enterNext:function(){
        if(StatisticsMgr){
            StatisticsMgr.reqReport(StatisticsMgr.REQ_HALL_LOADING_END);
        }
       
        cc.vv.EventManager.emit(EventId.ENTER_HALL);
        
    },

    update:function(dt){
        this._curDt += dt
        this._totalCheckTime += dt

        //
        // if(cc.vv.NetCacheMgr){
        //     if(cc.vv.NetCacheMgr.isCacheHall()){
        //         this._loadBaseMsgFInish = true
        //     }
        // }

        if(this._curDt > 0.05){
            this._curDt = 0
            this._curCount += 1
            if(this._curCount >= 100){
                if(this._hotupdateFinish && this._loadResFinish && this._preLoadHallFinish && this._loadBaseMsgFInish){
                    //可以进入大厅了
                    AppLog.ShowScreen('一切就绪，准备切换大厅场景')
                    if(!this._enterHall){
                        this._enterHall = true
                        this._enterNext()
                    }
                    
                }
                else{
                    this._curCount = 100
                }
            }
            else{
                if(this._hotupdateFinish && this._loadResFinish && this._preLoadHallFinish && this._loadBaseMsgFInish && this._totalCheckTime > 2){
                    //数据都准备好了，且进度条至少走了2s,提前结束了
                    this._curCount += (1+Math.random(0,1)*10)
                }
            }
            this.loadProgress(this._curCount,100)
        }

        if(this._totalCheckTime > 20){
           
            if(!this._hotupdateFinish){
                cc.log("条件1")
            }
            if(!this._loadResFinish){
                cc.log("条件2")
            }
            if(!this._preLoadHallFinish){
                cc.log("条件3")
            }
            if(!this._loadBaseMsgFInish){
                cc.log("条件4")
            }
            if(!this._enterHall){
                AppLog.ShowScreen('超时直接进入大厅')
                this._enterHall = true
                this._enterNext()
            }
        }
    }

    // update (dt) {},
});
