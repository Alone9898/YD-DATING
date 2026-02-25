/**
 * slot loading界面绑定 脚本
 * 假的进度条显示
 */
cc.Class({
    extends: cc.Component,

    properties: {
        // proLabel:{
        //     type:cc.Label, 
        //     displayName:"进度数字"
        // },
        progressBar:{
            default:null,
            type:cc.Node,
            displayName:"进度条"
        },
        _loadDone:false,
        _nIterval:0,
        _nPer:0,    //当前进度
        _loadTime:0, //loading的显示总时间，如果超过15s就显示一个关闭按钮。让可以进入大厅
        _updateFinish:false,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        Global.autoAdaptDevices(false);
        cc.director.resume()
        
        this.progressBar.getComponent(cc.ProgressBar).progress = 0
        let lblPro = cc.find('pro',this.progressBar)
        if(lblPro){
            lblPro.active = false
        }
        cc.vv.AudioManager.stopBgm();
        
        cc.vv.NetManager.registerMsg(MsgId.GAME_ENTER_MATCH, this.onRcvNetEnterGame, this);
        Global.registerEvent(EventId.ENTER_LOGIN_SUCCESS,this.onRecGameRconnect,this)

        //监听进度
        cc.vv.SubGameUpdateNode.on("update_subgame_pro",this.downloadingPro.bind(this))
        //监听是否完成
        Global.registerEvent("checkSubStart", this.downloadingStart, this);
        Global.registerEvent("checkSubFinish", this.downloadingFinish, this);
        Global.registerEvent("SubGameWaiting", this.downloadWaiting, this);
        Global.registerEvent("update_subgame_fail", this.downloadFail, this);

    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_ENTER_MATCH, this.onRcvNetEnterGame, false, this);
    },

    start () {
        this._playLoadingAudio();
        this._downloadSubgame(this._gameId)
    },

    _downloadSubgame:function(gameId){
        this._proBaseval = 0
        if(Global.loadingDown){
            let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //是否是内置游戏
            if (cc.sys.isNative && Global.openUpdate && !bInnerGame) { // 手机平台需要检测更新
                this._proBaseval = 0.5
                cc.vv.SubGameUpdateNode.emit("check_subgame", gameId);
            } else {
                this._updateFinish = true
                this._doEnterGame()
            }
        }
        else{
            this._updateFinish = true
            this._enterGameFinish = true
            this._doEnterGame()
        }
        
    },

    _doEnterGame:function(){
        if(cc.vv.gameData){
            let deskInfo = cc.vv.gameData.getDeskInfo()
            if(deskInfo && deskInfo.isReconnect){
                this._enterGameFinish = true
                this._gameId = deskInfo.gameid
            }
        }
        if(!this._enterGameFinish){
            
            let delayCall = function(){
                this._reqEnterGame();
            }
            this.scheduleOnce(delayCall.bind(this),0.2)
        }
        else{
            this.EnterGameSuccess()
        }

        StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_LOADING_START);
    },

    //设置要进入的游戏
    setEnterGame:function(gameId,data,ssid){
        this._gameId = gameId
        this._exData = data
        this._ssid = ssid

        cc.vv.AppData.setGameId(gameId)
    },

    _playLoadingAudio:function(){
        let self = this
        this._playLoadingEff = false
        let eff_cfg = {path: 'slots_common/SlotRes/' , filename:'game_loading', common: true}; 
        let endCall = function(){
            self._playLoadingEff = true //加载音效完成
        }
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common,false,endCall)
    },
    
    //预加载游戏场景
    _preLoadGameScene:function(){
        let self = this
        let gameData = self._getGameData()
        let name = gameData.mainScene
        cc.director.preloadScene(name,(err,scene) => {
            if(!err){
                self._loadDone = true
            }
            else{
                self._loadErr = err //加载出错
            }
            
        })

        StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_LOADING_SUCC);
    },

    //请求进入游戏
    _reqEnterGame:function(){
        cc.vv.GameManager.sendEnterGameReq(this._gameId,this._ssid,this._exData);
    },

    EnterGameSuccess:function(){
        this._preLoadGameScene();
    },

    //更新进度条
    _updateProgress:function(nAdd){
        this._nPer += nAdd
        if(this._nPer >= 99){
            if(this._getLoadingFinishCondion()){
                //切换场景 
                let gameData = this._getGameData()
                let name = gameData.mainScene
                let org = gameData.orientation || Global.APP_ORIENTATION
                cc.vv.SceneMgr.enterScene(name,(err,curScene) =>{
                    if(!err){
                        curScene.autoReleaseAssets = true
                    }
                    
                },org);
                return
            }
            else{
                this._nPer = 99
                if(this._showErrStr){
                    
                    this._setProVal(this._proBaseval+this._nPer/100)
                }
            }
        }
        this._setProVal(this._proBaseval+this._nPer/100)
       
    },

    //获取加载结束的标志
    _getLoadingFinishCondion(){
        return this._loadDone  && this._enterGameFinish
    },

    _getGameData:function(){
        let gameId = this._gameId
        if(!gameId){
            gameId = cc.vv.gameData.getGameId()
        }
        let gameData = cc.vv.GameDataCfg.getGameData(gameId)
        return gameData
    },

    //检查是否是loading出错了
    _checkError:function(dt){
        let self = this
        this._loadTime += dt
        if(this._loadTime > 20){
            if(!this._enterGameFinish && this._bRecon){
                this._bRecon = null
                this._reqEnterGame()
            }
            if(this._bShowClose) return
            this._bShowClose = true
            cc.loader.loadRes('slots_common/SlotRes/prefab/loading_btn_close',cc.Prefab,(err,asst) => {
                if(!err){
                    let node = cc.instantiate(asst)
                    if(node){
                        node.parent = self.node
                    }
                    Global.btnClickEvent(node,self.OnClickLoadingClose,self)
                }
                
            })
            

            //分析错误原因
            this._showErrStr = ''
            if(this._enterErr){
                //进入游戏是不
                this._showErrStr += this._enterErr
            }
            if(this._loadErr){
                //加载失败
                this._showErrStr += this._loadErr
            }
        }
    },

    //关闭loading
    OnClickLoadingClose:function(){
        //推出当前游戏
        let req = {c: MsgId.GAME_LEVELROOM};
        req.deskid = this._gameId;
        cc.vv.NetManager.send(req);
        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL);

        StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_LOADING_FAIL);
    },

    onRcvNetEnterGame:function(msgDic){
        if(msgDic.code == 200){
            let data = cc.vv.GameDataCfg.getGameData(msgDic.gameid); // 水浒传 二人麻将统一配置
            if (data) {
                if (data.dataName === "gameData") {
                    // let ShowScene = data.loadingScene || data.gameScene
                    
                    if (cc.vv.gameData === null || cc.vv.gameData === undefined) {
                        
                            let dataCmp = require(data.dataCmp);
                            cc.vv.gameData = new dataCmp();
                            cc.vv.gameData.init(msgDic.deskinfo, msgDic.gameid, msgDic.gameJackpot);
                            this._enterGameFinish = true
                            this.EnterGameSuccess()
                        }
                        
                    else {
                        cc.vv.gameData.init(msgDic.deskinfo, msgDic.gameid, msgDic.gameJackpot);
                    }
                }
                else {
                    let dataCmp = require(data.dataCmp);
                    if (dataCmp) {
                        dataCmp.init(msgDic.deskinfo, true);
                        cc.vv[data.dataName] = dataCmp;
                        this._enterGameFinish = true
                        this.EnterGameSuccess()
                    }
                }

            }
            
        }
        else{
            //进入游戏出错
            this._enterErr = cc.js.formatStr('errorcode:%s '+msgDic.code)
        }
    },

    onRecGameRconnect:function(){
        this._bRecon = true
    },

    downloadingPro:function(data){
        let gameid = data.gameId
        let pro = data.per
        if(gameid == this._gameId){
            
            
            this._setProVal(pro/2)
            this._showTipText(Math.floor(pro)+'%')
        }
    },

    downloadingStart:function(){

    },

    downloadingFinish:function(data){
        let gameid = data.detail
        if(gameid == this._gameId){
            this._updateFinish = true
            //下载完成表现
            this._showTipText('Download Success!')

        }
    },

    downloadWaiting:function(){

    },

    downloadFail:function(data){
        let info = data.detail
        if(info){
            let gameid = info.id
            if(gameid == this._gameId){
                
                //下载失败提示
                if(info.code){
                    this._showTipText(cc.js.formatStr('Download Failed!(%s)',info.code))
                }
                
            }
        }
    },

    _showTipText:function(str){
        let lblPro = cc.find('pro',this.progressBar)
        if(lblPro){
            lblPro.active = true
            lblPro.getComponent(cc.Label).string = str
        }
    },

    _setProVal:function(val){
        if(val>99){
            val = 100
        }
        this.progressBar.getComponent(cc.ProgressBar).progress = val
    },





    update (dt) {
        if(this._updateFinish){//下载完了才开始进入游戏
            this._nIterval += dt
            let nCount = 1 //进度的步长
            if(this._loadDone){
                nCount = Math.random() * 10
            }
            if(this._nIterval > 0.03){
                this._nIterval = 0
                this._updateProgress(nCount)
            }
    
            
            this._checkError(dt)
        }
        
    },
});
