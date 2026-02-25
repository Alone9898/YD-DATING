/**
 * 子游戏管理
 */
const Md5 = require('Md5');
cc.Class({
    extends: cc.Component,

    properties: {
        _curCheckId:null,
        _downList:[],//下载列表
        _newList:[],//已经更新过的
        _checkNeedDown:[],//检查模式下，需要下载的游戏
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!Global.isNative()) return;
        cc.vv.SubGameUpdateNode.on("check_subgame",this.onCheckSubGame,this);

    },

    start () {

    },

    //设置是否是登陆模式检查热更模式
    //登陆预加载的时候就检查，但不实际下载
    setLoadingCheckModel:function(bValue,nextCall){
        this._bOnlyCheck = bValue
        this._nextCheckCall = nextCall
    },

    //_bOnlyCheck = true的时候，通知检查下一个游戏
    notiyNextCheck:function(from){
        AppLog.warn('【检查】完成：'+from)
        this._curCheckId = null
        this._updateGameId = null
        if(this._nextCheckCall){
            this._nextCheckCall()
        }
        // this._nextCheckCall = null
        // this._bOnlyCheck = null
    },

    //需要下载的游戏列表
    _addCheckNeedDown:function(gameId){
        AppLog.warn('【检查】添加到下载列表：'+gameId)
        if(gameId){
            this._checkNeedDown.push(gameId)
        }
        
    },

    //是否需要更新
    isInCheckDownlist:function (gameId) {
        let bIn = false
        for(let i = 0; i < this._checkNeedDown.length; i++){
             if(gameId == this._checkNeedDown[i]){
                 bIn = true
                 break
             }
        }
        return bIn
    },

    //更新需要下载的游戏列表
    _delCheckNeedDown:function(gameId){
        let key = -1
        for(let i = 0; i < this._checkNeedDown.length; i++){
            if(this._checkNeedDown[i] == gameId){
                key = i
                break
            }
        }
        if(key > -1){
            this._checkNeedDown.splice(key,1)
        }
    },

    onCheckSubGame:function(data){
        let gameId = data;
        AppLog.warn('检查热更：'+gameId)
        
        this.coustomCheck(gameId)
        
    },

    //自定义检测是否需要更新
    coustomCheck:function(gameId){
        let self = this
        let gameCfg = cc.vv.GameItemCfg[gameId]
        if(gameCfg){
            //是否已经是最新版本
            let bNew = self._isAreadyNew(gameId)
            if(bNew){
                if(this._bOnlyCheck){
                    AppLog.warn('已经是最新了，检查下一个')
                    this.notiyNextCheck(5)
                }
                else{
                    AppLog.warn('已经是最新了，直接进入')
                    Global.dispatchEvent("enter_game", gameId);
                }
                
                return
            }
            //是否在下载列表中
            let bHas = self._isInDownList(gameId)
            if(bHas){
                AppLog.warn('已经在下载列表中了')
                return
            }

            
            // let bInCheckDown = self.isInCheckDownlist(gameId)
            // if(bInCheckDown){
            //     AppLog.warn('预加载检查需要更新：'+gameId)
            //     this.addGameToDownlist(gameId)
            // }

            self._curCheckId = gameId
            //是否下载过
            if(cc.vv.UserManager.isDownloadSubGame(gameId)){
                //有下载过
                self.addGameToDownlist(gameId)

                
            }
            else{
                AppLog.warn('没下载过：'+gameId)
                if(this._bOnlyCheck){
                    this.notiyNextCheck(6)
                }
                else{
                    //没有下载过的，直接加入下载列表
                    this.addGameToDownlist(gameId)
                }
                
    
            }
        }
        else{
            AppLog.warn('未找到下载游戏配置:'+gameId)
            this.notiyNextCheck(7)
        }
        
    },

    //加一个游戏到下载列表
    addGameToDownlist:function(gameId){
        //
        this._curCheckId = null
        // let bHas = this._isInDownList(gameId)
        // if(bHas){
        //     return
        // }
        AppLog.warn('需要添加到下载列表:'+gameId)
        this._downList.push(gameId)
        if(this._updateGameId){ //正在下载的
            //提示等待下载
            AppLog.warn('等待下载'+this._updateGameId)
            Global.dispatchEvent('SubGameWaiting',gameId)
        }
        else{
            // this._updateGameId = gameId
            //开始下载
            this.startOneSub()
        }

    },

    //是否在下载列表中
    _isInDownList:function(gameId){
        let bHas = false
        for(let i = 0; i < this._downList.length; i++){
            let val = this._downList[i]
            if(gameId == val){
                bHas = true
                break
            }
        }
        return bHas
    },

    //是否是等待状态
    _isWaitToDownload:function(gameId){
        let bIn = this._isInDownList(gameId)
        if(bIn && gameId != this._updateGameId){
            return true
        }
        return false
    },

    //是否已经在最新的
    _isAreadyNew:function(gameId){
        let bRes = false
        for(let i = 0; i < this._newList.length; i++){
            let val = this._newList[i]
            if(val == gameId){
                bRes = true
                break
            }
        }
        return bRes
    },

    _addToNewList:function(gameId){
        AppLog.warn('添加到最新：'+gameId)
        let bHas = this._isAreadyNew(gameId)
        if(!bHas){
            this._newList.push(gameId)
        }
        this._delCheckNeedDown(gameId)
    },

    startOneSub:function(){
        this._needUpdate = false
        //每次都是重第一个开始下载
        this._ckfailCount = 0
        this._failCount = 0
        let gameId = this._downList[0]
        this._updateGameId = gameId

        Global.dispatchEvent('checkSubStart',gameId)
        this.startCheck(gameId)
    },

    //检测下一个下载的
    checkNextSub:function(){
        let self = this
        
        //self._assManager.destroy()
        if(self._assManager){
            self._assManager.setEventCallback(null);
        }
        
        self._assManager = null
        self._updating = false;
        self._failCount = 0;
        self._ckfailCount = 0
        //删除当前下载的这个
        self._downList.shift()
        this._delCheckNeedDown(this._updateGameId)
        self._updateGameId = null
        if(self._downList[0]){
            //开始下一个下载
            self.startOneSub()
        }
        
    },

    startCheck:function(gameId){
        let self=this
        let gameCfg = cc.vv.GameItemCfg[gameId]
        if(gameCfg){
            let gameDir = gameCfg.name
            self._subGameName = gameDir
            let filePath = 'Manifest/'+gameDir+'/project'
            cc.loader.loadRes(filePath,cc.Asset,function(err,txt){
                if(!err){
                    self.checkHotUpdate(txt)
                }
                else{
                    self._updateGameId = null
                    AppLog.warn('加载本地project失败:'+gameDir)
                    Global.dispatchEvent('update_subgame_fail',{id:gameId,code:1})
                    self.checkNextSub()
                }
            })
        }
        else{
            self._updateGameId = null
            self.checkNextSub()
            AppLog.warn('未找到游戏配置')
        }
    },

    checkHotUpdate:function(fileurl){
        //打点
        StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_DOWNLOAD_START,null,this._updateGameId)

        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset/'+this._subGameName;
        if(!this._assManager){
            this._assManager = new jsb.AssetsManager('', this._storagePath, this.versionComHandle.bind(this));
            this._assManager.setVerifyCallback(this.verifyCallback.bind(this));
            this._assManager.setMaxConcurrentTask(8)
        }
        let fileStr = jsb.fileUtils.getStringFromFile(fileurl.nativeUrl)
        //检查是否需要动态替换热更地址
        fileStr = this.checktNewPackUrl(fileStr)

        this.loadCustomManifest(this._assManager,fileStr)

        // if(cc.vv.UserManager.isDownloadSubGame(this._updateGameId)){
        //     this._assManager.setEventCallback(this.checkCallback.bind(this))
        //     this._assManager.checkUpdate();
        // }
        // else{
            this._SubGameStatic(StatisticsMgr.HTTP_SUBGAME_HOT_START)
            this._assManager.setEventCallback(this.updateCallback.bind(this))
            
            this._assManager.update();
            this._updating = true;
        // }
        
        
    },

    loadCustomManifest: function (as,fileStr) {
        if (as.getState() === jsb.AssetsManager.State.UNINITED) {
            AppLog.warn('custommanifest:'+fileStr)
            var manifest = new jsb.Manifest(fileStr, this._storagePath);
            as.loadLocalManifest(manifest, this._storagePath);
            
        }
    },

    checkCallback: function (event) {
        let ckCode = event.getEventCode()
        AppLog.warn('Code: ' + ckCode);
        this._isDownloading = true;
        let success = false;
        switch (ckCode) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST: //0
                AppLog.warn("No local manifest file found, hot update skipped.");
                success = false;
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST://1
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST://2
                AppLog.warn("Fail to download manifest file, hot update skipped.");
                success = false;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE://4
                AppLog.warn("Already up to date with the latest remote version.");
                
                
                if(!this._isTry)
                {
                    cc.vv.SubGameUpdateNode.emit("already_update_to_date",this._updateGameId);
                }
                success = true;
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND://3
                //先不判断size,需要底包支持
                // let nTotal = this._assManager.getTotalBytes()
                // AppLog.warn("New version found, please try to update.Size="+nTotal);
                // if(nTotal == '0'){
                //     //没有东西需要更新
                //     success = true;
                //     break;
                // }
                // else{
                    this.startHotupdate();
                    return;
                // }
                
            default:
                return;
        }

        this._assManager.setEventCallback(null)
        this._updating = false;
        AppLog.warn('-------------------finish: ' + ckCode);
        //不更新，直接进入登录
        if(success) {
            if(this._bOnlyCheck){
                //加入到最新列表
                this._addToNewList(this._updateGameId)
                this.checkNextSub()
                //通知检查下一个游戏
                this.notiyNextCheck(1)
            }
            else{
                this.enterGame();
            }
            
        }
        else {
            if(this._bOnlyCheck){
                //失败了直接检查下一个游戏
                this.checkNextSub()
                this.notiyNextCheck(2)
            }
            else{
                Global.dispatchEvent('update_subgame_fail',{id:this._updateGameId,code:ckCode})
                ++this._ckfailCount;
                console.log("**************fail count:" +this._ckfailCount);
                if(this._ckfailCount<5) {
                    
                    this.startCheck(this._updateGameId);
                }
                else {
                    this._updateGameId = null
                    console.log("**************fail Show faildlg" +this._ckfailCount);
                    this.showFailDlg();
                }
            }

            
        }
    },

    startHotupdate:function(){
        
        if (this._assManager && !this._updating) {
            this._assManager.setEventCallback(null)
            if(this._bOnlyCheck){
                //加入需要更新的列表
                this._addCheckNeedDown(this._updateGameId)
                this.checkNextSub()
                //通知检查下一个
                this.notiyNextCheck(3)
            }
            else{
                //直接开始更新
                this._assManager.setEventCallback(this.updateCallback.bind(this))
                // if (this._assManager.getState() === jsb.AssetsManager.State.UNINITED) {
                //     this._assManager.loadLocalManifest(this.manifestUrl);
                // }

                
                this._assManager.update();
                this._updating = true;
            }
            
        }
    },

    showFailDlg:function(codeVal=0){
        //打点
        StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_DOWNLOAD_FAILE,null,this._updateGameId)

        Global.dispatchEvent('update_subgame_fail',{id:this._updateGameId,code:codeVal})
        
        if(this._bOnlyCheck){
            //通知坚持下一个
            this.notiyNextCheck(4)
        }
        else{
            //检查下一个
            this.checkNextSub()
        }
        
    },

    updateCallback: function (event) {
        var self = this

        var needAddSearch = false;
        var finish = false; //重启游戏
        var failed = false;
        this._isDownloading = true;
        
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                AppLog.warn("No local manifest file found, hot update skipped.");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this._needUpdate = true
                var loadPercent = event.getDownloadedBytes()/event.getTotalBytes()*100;
                //AppLog.warn("########loadPercent:" +loadPercent);
                loadPercent = isNaN(loadPercent)? 0 :loadPercent;
                // let subGame = this._subGameMap.get(this._updateGameId.toString());
                // if(subGame){
                //     subGame.pro = Global.S2P(loadPercent,0);
                // }
                cc.vv.SubGameUpdateNode.emit("update_subgame_pro",{per:Global.S2P(loadPercent,0),gameId:this._updateGameId});
                
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                AppLog.warn('Fail to download manifest file, hot update skipped.');
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                AppLog.warn('@@@@@@@@@updateCallback Already up to date with the latest remote version.');
                finish = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                AppLog.warn('Update finished. ' + event.getMessage());
                cc.vv.SubGameUpdateNode.emit("update_subgame_status",{txt:"更新完成!",gameId:this._updateGameId});
                finish = true;
                needAddSearch = true;
                this._canRetry = false;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                AppLog.warn('Update failed. ' + event.getMessage());
                
                
                this._SubGameStatic(StatisticsMgr.HTTP_SUBGAME_HOT_RESULT,'Fail')
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                let logMsg = event.getAssetId() + ', ' + event.getMessage()
                AppLog.warn('Asset update error: ' + logMsg);
                this._SubGameStatic(StatisticsMgr.HTTP_SUBGAME_HOT_PROCESS,logMsg)
                //failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                AppLog.warn(event.getMessage());
                failed = true;
                break;
            default:
                break;
        }

        if(this._canRetry)
        {
            ++this._failCount;
            if(this._failCount<3)
            {
                // this.setSubGameUpdateStatus(false);
                this._canRetry = false;
                let bAvaild = cc.isValid(this._assManager)
                AppLog.warn('update Faile,retry:'+bAvaild)
                if(bAvaild){
                    
                    setTimeout(()=>{
                        self._assManager.downloadFailedAssets();
                    },1000)
                    // self.checkNextSub()

                    return
                }
                else{
                    this.showFailDlg(3)
                    return
                }
                
            }
            else{
                this.showFailDlg(4);
                return
            }
        }

        if (failed) {
            // this.setSubGameUpdateStatus(false);
            this.showFailDlg(5);
            return
        }

        //
        if(!cc.isValid(this._assManager)){ //没有被销毁
            return
        }
        if(needAddSearch){
            needAddSearch = false
            //原来的
            var searchPaths = jsb.fileUtils.getSearchPaths();
            //新增的
            var newPaths = this._assManager.getLocalManifest().getSearchPaths();

            let datas = []
            //在搜索路径之前增加新的搜索路径
            for(let i = 0; i < newPaths.length; i++){
                //AppLog.warn('new:'+newPaths[i])
                datas.push(newPaths[i])
            }
            for(let i = 0; i < searchPaths.length; i++){
                //AppLog.warn('old:'+searchPaths[i])
                datas.push(searchPaths[i])
            }
            // Array.prototype.unshift(searchPaths, newPaths);

            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(datas));
            //jsb.fileUtils.setSearchPaths(searchPaths);
        }

        if(finish)
        {
            this._assManager.setEventCallback(null);
            cc.sys.localStorage.setItem(this._subGameName,'1')
            this.enterGame()
            return
        }

        

    },

    

    //可以进入游戏
    enterGame:function(){
        let self =  this
        //打点
        StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_DOWNLOAD_SUCCESS,null,this._updateGameId)

        self._addToNewList(self._updateGameId)
        if(self._needUpdate){
            self._needUpdate = null
            this._SubGameStatic(StatisticsMgr.HTTP_SUBGAME_HOT_RESULT,'Success')
            //更新了，隐藏
            Global.dispatchEvent("checkSubFinish", self._updateGameId);
            cc.vv.EventManager.emit("checkSubFinish",self._updateGameId);
            self._updateGameId = null
            self.checkNextSub()
        }
        else{
            //没有更新，可直接进
            let enterGame = self._updateGameId
            self.checkNextSub()
            AppLog.warn('子包热更检查完成，准备进入游戏:'+enterGame)
            Global.dispatchEvent("enter_game", enterGame);
            self._updateGameId = null
            
        }
    },

    //子游戏热更统计
    _SubGameStatic:function(id,data){
        if(!this._bOnlyCheck){ //热更检查阶段
            let costomKey = {}
            costomKey.key = "gameid"
            costomKey.val = this._updateGameId
            StatisticsMgr.httpReport(id,data,costomKey)
        }
        
    },

    



    // Setup your own version compare handler, versionA and B is versions in string
    // if the return value greater than 0, versionA is greater than B,
    // if the return value equals 0, versionA equals to B,
    // if the return value smaller than 0, versionA is smaller than B.
    versionComHandle: function (versionA, versionB) {
        AppLog.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var verA = versionA.split('.');
        var verB = versionB.split('.');
        for (var i=0; i < verA.length; ++i) {
            var a = parseInt(verA[i]);
            var b = parseInt(verB[i]);
            if (a === b) {
                continue;
            }
            else {
                return -1;
            }
        }
        if (verB.length > verA.length) {
            return -1;
        }
        else {
            return 0;
        }
    },

    // Setup the verification callback, but we don't have md5 check function yet, so only print some message
    // Return true if the verification passed, otherwise return false
    verifyCallback: function (path, asset) {
        // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
        var compressed = asset.compressed;
        // Retrieve the correct md5 value.
        var expectedMD5 = asset.md5;
        // asset.path is relative path and path is absolute.
        var relativePath = asset.path;
        // The size of asset file, but this value could be absent.
        var size = asset.size;
        if (compressed) {
            AppLog.log("Verification passed : " + relativePath);
            return true;
        }
        else {
            // //是否是js脚本
            // let extName = cc.path.extname(relativePath)
            // if(extName == '.js'){
            //     var file =  jsb.fileUtils.getWritablePath() + "remote-asset/"+ this._subGameName + '_temp/' +relativePath;
            //     if (jsb.fileUtils.isFileExist(file)) {
            //         let md5Value = Md5(jsb.fileUtils.getDataFromFile(file));
            //         return md5Value === asset.md5;
            //     }
            //     else{
            //         AppLog.warn('file not foud:'+file)
            //         return false;
            //     }
            // }
            // else{
                return true
            // }
            
            
        }
    },

    //检查是否需要替换packurl
    checktNewPackUrl:function(fileObj){
        if(fileObj){
            if(!this._newPackUrl){
                this._newPackUrl = cc.sys.localStorage.getItem("newpackurl")
            }
            if(!this._newPackUrl || Global.packageUrl == this._newPackUrl){
                //不用替换
                AppLog.warn("不用替换子游戏热更地址")
                return fileObj
            }
            //替换
           
            if(cc.js.isString(fileObj)){
                fileObj = fileObj.replace(new RegExp(Global.packageUrl, 'g'),this._newPackUrl)
            }
            else{
                if(fileObj.packageUrl){
                    fileObj.packageUrl = fileObj.packageUrl.replace(Global.packageUrl,this._newPackUrl)
                }
                if(fileObj.remoteVersionUrl){
                    fileObj.remoteVersionUrl = fileObj.remoteVersionUrl.replace(Global.packageUrl,this._newPackUrl)
                }
                if(fileObj.remoteManifestUrl){
                    fileObj.remoteManifestUrl = fileObj.remoteManifestUrl.replace(Global.packageUrl,this._newPackUrl)
                }
            }
            
            
            
        }
        return fileObj
    },



    //删除子游戏目录
    deleteSubgameDir:function(subGamedir){
        if (!Global.isNative()) return;
        
        let fullPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset/'+subGamedir;
        if (jsb.fileUtils.isDirectoryExist(fullPath)){
            
            jsb.fileUtils.removeDirectory(fullPath);
            cc.sys.localStorage.removeItem(subGamedir)
            AppLog.warn("[删除子游戏]"+subGamedir)
        }
    }

    // update (dt) {},
});
