// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const Md5 = require('Md5');
cc.Class({
    extends: cc.Component,

    properties: {
        
        progressBar: cc.ProgressBar,
        lblTips: cc.Label,

        // _manifestUrl: null, //配置文件URL
        // mainfest:{
        //  type:cc.Asset,//   cc.RawAsset,
        //  default:null,
        // },
        // visionUrl:{
        //     type:cc.Asset,
        //     default:null,
        // },

        // 成员变量
        _updating: false, //是否正在更新
        _failCount: 0, 
        _canRetry: false, //重试
        _checkListener: null, //检查监听器
        _updateListener: null, //更新监听器
        _storagePath: '', //存储路径
        _assManager: null, //资源管理器

        _checkOver: false, //检测完成
        _countdownSec: 0, //倒计时
        _overtimeCount: 0, //超时次数
        _light:null,
        _proVal:0,
        _newPackUrl:null, //新的热更地址
    },    


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.autoAdaptDevices(false);
        
        this.node.parent.name = Global.SCENE_NAME.HOTUPDATE;
        if (!Global.isNative()) return;
        
        // this._light = this.progressBar.node.getChildByName("light");
        // if(this._light) this._light.active = false;
        


        this.initHotupdate()
        
    },

    start () {
        if (!Global.isNative()) {
            this.enterLoginScene();
            return;
        }

        // this.lblTips.string = '版本检测中,请稍后...';
        //开始检测是否强制更新
        this.checkForceAppUpdate();
    },

    initHotupdate(newPackUrl){
        this._newPackUrl = newPackUrl
        AppLog.ShowScreen('初始化热更')
        //保存新的地址
        if(newPackUrl){
            cc.sys.localStorage.setItem("newpackurl",newPackUrl)
        }
        else{
            cc.sys.localStorage.removeItem("newpackurl")
        }
        

        // //进度条初始化为0
        // this.progressBar.progress = 0.01;
        StatisticsMgr.httpReport(StatisticsMgr.HTTP_START_HOTUPDATE)
        // this._manifestUrl = this.mainfest;
        AppLog.log("#####################-------------------")
        var searchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
        AppLog.log(JSON.stringify(searchPaths));

        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset';

        this._assManager = new jsb.AssetsManager('', this._storagePath, this.versionComHandle.bind(this));
        Global.retain(this._assManager)
        this._assManager.setVerifyCallback(this.verifyCallback.bind(this));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._assManager.setMaxConcurrentTask(4);
        }
    },

    update (dt) {
        
        if (!this._checkOver && this._sendVersion) {
            this._countdownSec += dt;
            if(this._countdownSec>3){
                this._countdownSec = 0;
                if (this._overtimeCount >= 3) { //3次之后，不再继续，直接进入登录场景
                    
                    this._checkOver = true //此次启动就不检测了，进入登录
                    this.enterLoginScene();
                }
                else {
                    this._overtimeCount += 1;
                    AppLog.ShowScreen('开始检查热更-Http请求重试'+this._overtimeCount)
                    this.checkForceAppUpdate();
                    // AppLog.log('超时。。。第' + this._overtimeCount + '次，继续强制更新');
                }
            }
            
        }

        
        this.ReportUpdateTime(dt)
        
    },

    //是否显示进度条
    ShowUpdateProcess:function(bShow){
        if(cc.isValid(this.progressBar,true)){
            if(this.progressBar.node){
                this.progressBar.node.active = bShow
            }
            
        }
        
    },
    //设置进度条进度
    SetUpdateProcess:function(val,nDownByte,nTotalByte){
        
        if(cc.isValid(this.progressBar,true)){
            this.progressBar.progress = val
        }
        if(cc.isValid(this.lblTips,true)){
            this.lblTips.string = Math.floor(val*100) + "%"
        }
        
    },

    ReportUpdateTime(dt){   
        if(this.bStartUpdateing){
            if(!this._updateDuring){
                this._updateDuring = 0
            }
            if(!this.updateCount){
                this.updateCount = 0
            }
            this._updateDuring += dt;
            if(this._updateDuring >= 1){
                this._updateDuring = 0
                this.updateCount += 1
            }
            if(this.updateCount == 15){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_TIME15)
            }
            if(this.updateCount == 30){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_TIME30)
            }
            if(this.updateCount == 45){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_TIME45)
            }
            if(this.updateCount == 60){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_TIME60)
            }
            if(this.updateCount == 90){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_TIME90)
            }
            if(this.updateCount == 180){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_TIME180)
            }
        }
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        Global.release(this._assManager);
    },
   
    enterLoginScene: function () {

        //记录更新成功时间.重启后5分钟不检查热更，减少网络失败的概率
        let ntime = new Date().getTime()
        Global.saveLocal('last_hotupdate',ntime)
        

        if (this._assManager.getLocalManifest()) {
            Global.resVersion = this._assManager.getLocalManifest().getVersion();
            Global.saveLocal('c_resv',Global.resVersion)
            AppLog.ShowScreen('1resvision：'+Global.resVersion)
        }
        //进入登陆
        cc.vv.GameManager.nativeSkipHotupdate()
        
    },

    //加载本地的manifist文件
    loadFile:function(file,endCall,bJson){
        let filePath = 'Manifest/Main/'+file
        cc.loader.loadRes(filePath,cc.Asset,function(err,txt){
            if(!err){
                let fileStr = jsb.fileUtils.getStringFromFile(txt.nativeUrl)
                var result = fileStr
                if(bJson){
                    result = JSON.parse(fileStr);
                }
                if(endCall){
                    endCall(result)
                }
            }
            else{
                cc.log('loadFile:'+err)
            }
        })
    },

    checkForceAppUpdate: function () {
        let self = this
        AppLog.log('检测App强制更新！');


        if(Global.remoteVisionmanifistData){
            //已经通过其它协议获取到了远端的vision.manifish。就不再单独请求
            AppLog.ShowScreen('Api已经下发了vision的信息，直接使用')
            this._checkRemoteVisionAction(Global.remoteVisionmanifistData)
        }
        else{
            //加载本地的version.manifest文件
            let nextCall = function(localVersionObj){
                //检查是否有新的热更地址
                self.checktNewPackUrl(localVersionObj)
                AppLog.ShowScreen('开始请求remoteversion')
                AppLog.log("##############url:"+localVersionObj.remoteVersionUrl);
                self._checkOver = false
                self._sendVersion = true
                cc.vv.NetManager.requestHttp('', {}, function (state, data) {
                    if (state) {
                        self._sendVersion = false
                        AppLog.ShowScreen('请求remoteversion完成')
                        if (self._checkOver) {
                            AppLog.log('已经检测完成...');
                            return;
                        } //已经开始更新了
                        self._checkOver = true;
                        
                        self._checkRemoteVisionAction(data)
                    }
                    else {

                        //重试TODO
                        AppLog.ShowScreen('开始检查热更-Http请求version失败')
                        // self._reTryGetVisioninfo(data)

                    }
                }.bind(self), localVersionObj.remoteVersionUrl,"GET",false);
            }
            AppLog.ShowScreen('开始检查热更-load本地version')
            this.loadFile('version',nextCall,true)
        }
        

        
    },

    _reTryGetVisioninfo:function(data){
        this._reTryCount = this._reTryCount || 0
        if(this._reTryCount>2){
            //http出错
            // let errorMsg = data || 'hotupdate http timeout'
            // StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_FAILED,errorMsg)
            this.startCheckHotUpdate();
            return
        }
        else{
            this._reTryCount += 1
            this.checkForceAppUpdate()
        }
    },

    _checkRemoteVisionAction:function(data){
        var remoteVersionObj = (typeof data == 'string' ? JSON.parse(data) : data);
                    
        // if (Global.isIOS() && cc.vv.PlatformApiMgr.getAppVersion() == remoteVersionObj.ios_review_version) {
        //     AppLog.log('当前是提审版本！');

        //     Global.isReview = true;
        //     this.enterLoginScene();
        //     return;
        // }
        
        //保存子游戏的版本md5
        cc.vv.AppData.setSubverMd5(remoteVersionObj.subVer)
        Global.resVersion = remoteVersionObj.version;
        AppLog.ShowScreen('远端Version:'+Global.resVersion)
        Global.saveLocal('c_resv',Global.resVersion)

        var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
        var remoteAppVersion = parseInt(remoteVersionObj.android_app_version.split('.').join(''));
        var isNeedForceUpdate = remoteVersionObj.force_update_android;
        var app_update_url = remoteVersionObj.androidAppUrl;
        if (Global.isIOS()) {
            remoteAppVersion = parseInt(remoteVersionObj.ios_app_version.split('.').join(''));
            
           
            
            isNeedForceUpdate = remoteVersionObj.force_update_ios;
            app_update_url = remoteVersionObj.iosAppUrl;
        }
        //强制写华为的地址
        if(Global.appId == Global.APPID.SouthAmerica){
            app_update_url = "https://appgallery.cloud.huawei.com/ag/n/app/C103558397?locale=zh_CN&source=appshare&subsource=C103558397"
        }
        
         AppLog.log('@@@@@@@@@@@@@localAppVersion: ' + localAppVersion);
         AppLog.log('@@@@@@@@@remoteAppVersion: ' + remoteAppVersion);
         AppLog.log('@@@@@@@@@@@@isNeedForceUpdate: ' + isNeedForceUpdate);
         AppLog.log('@@@@@@@@@@@@@@app_update_url: ' + app_update_url);

        if (localAppVersion < remoteAppVersion) {
            AppLog.log('需要更新App');
            if (isNeedForceUpdate) {
                AppLog.log('需要强制更新App');
                this.deleteSubgameDir()
                cc.vv.AlertView.show("Update the APP version to enjoy the game!", function () {
                    cc.vv.PlatformApiMgr.openURL(app_update_url);
                    cc.game.end();
                }.bind(this),null,false,null,null,"null","Confirm");
            }
            else {
                cc.vv.AlertView.show("Update the APP version to enjoy the game!", function () { //确定
                    cc.vv.PlatformApiMgr.openURL(app_update_url);
                    cc.game.end();
                }.bind(this), function () { //关闭
                    //开始检测更新
                    AppLog.log('非强制更新，检测热更新！');
                    this.startCheckHotUpdate();
                }.bind(this), false, null,null,null,"Confirm");
            }
        }
        else {
            //开始检测更新
            AppLog.log('不需要更新App！');
            this.startCheckHotUpdate();
        }
    },

    startCheckHotUpdate: function () {
        AppLog.ShowScreen('开始checkupdate')
        //检查热更打点
        StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_CHECK)
        //开始检测更新
        this.checkHotUpdate()
        // if (!this.checkHotUpdate()) {
        //     AppLog.warn('检测更新失败');
        //     this.enterLoginScene();
        // } 
    },

    checkHotUpdate: function () {
        if (this._updating) {
            AppLog.log('Checking or Updating ...');
            return;
        }

        let nextCall = function(fileStr){
            AppLog.ShowScreen('load本地project完成')
            fileStr = this.checktNewPackUrl(fileStr)

            if (this._assManager.getState() === jsb.AssetsManager.State.UNINITED) {
                var manifest = new jsb.Manifest(fileStr, this._storagePath);
                this._assManager.loadLocalManifest(manifest, this._storagePath);
            }

            if (!this._assManager.getLocalManifest() || !this._assManager.getLocalManifest().isLoaded()) {
                AppLog.warn('Failed to load local manifest ...');
                return;
            }
            //开始热更打点
            StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_ENTER)

            this._assManager.setEventCallback(this.checkCallback.bind(this))
    
            this._assManager.checkUpdate();
        }
        AppLog.ShowScreen('开始load本地project')
        this.loadFile('project',nextCall.bind(this))

        // if (this._assManager.getState() === jsb.AssetsManager.State.UNINITED) {
        //     this._assManager.loadLocalManifest(this._manifestUrl.nativeUrl);
        // }
        // if (!this._assManager.getLocalManifest() || !this._assManager.getLocalManifest().isLoaded()) {
        //     AppLog.warn('Failed to load local manifest ...');
        //     return;
        // }
        
        // this._assManager.setEventCallback(this.checkCallback.bind(this))

        // this._assManager.checkUpdate();
        // return true;
    },

    startHotupdate: function () {
        if (this._assManager && !this._updating) {
            // this.lblTips.string = 'Resources loading ...';

            // this._updateListener = new jsb.EventListenerAssetsManager(this._assManager, this.updateCallback.bind(this));
            // cc.eventManager.addListener(this._updateListener, 1);

            this._assManager.setEventCallback(this.updateCallback.bind(this))

            // if (this._assManager.getState() === jsb.AssetsManager.State.UNINITED) {
            //     this._assManager.loadLocalManifest(this._manifestUrl.nativeUrl);
            // }

            this._failCount = 0;
            this._assManager.update();
            this._updating = true;
        }
    },

    checkCallback: function (event) {
        let self = this
        let bCheckRes = false
        let ckCode = event.getEventCode()
        StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_CHECKRESULT,ckCode)
        
        switch (ckCode) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                AppLog.warn("【check】No local manifest file found, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                AppLog.warn("【check】Fail to download manifest file, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                AppLog.warn("【check】Already up to date with the latest remote version.");
                bCheckRes = true;
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                AppLog.warn("New version found, please try to update.");
                //发现新版本需要更新的表现
                this.checkNewVisionFound()
                return;
            default:
                return;
        }

        
        this._assManager.setEventCallback(null)
        this._checkListener = null;
        this._updating = false;
        if(bCheckRes){
            
            //不更新，直接进入登录
            this.enterLoginScene();
        }
        else{
            //
            let sureCall = function(){
                self.checkHotUpdate()
            }
            
            cc.vv.AlertView.show('check failed! please check network.',sureCall)
        }
        
    },

    checkNewVisionFound:function(){
        let self = this
        let nSize = 0
        AppLog.ShowScreen('checkupdate完成,发现新版准备下载')
        if(this._assManager){
            nSize = this._assManager.getTotalBytes()
        }
        if(nSize && (nSize > 1024*1024*50) && cc.sys.getNetworkType() == cc.sys.NetworkType.WWAN){
            //如果大于某个值(50M)且是移动流量需要确认提示框
            let tipStr = this._getUpdateStartTip(nSize)
            let sureCall = function(){
                self.startHotupdate()
            }
            let cancelCall = function(){
                cc.game.end()
            }
            cc.vv.AlertView.show(tipStr,sureCall,cancelCall)
        }
        else{
            this.startHotupdate();
        }
    },
    //方便重写多语言文字
    _getUpdateStartTip(nSize){
        let nMB = ((nSize/1024)/1024).toFixed(2)
        let tipStr = cc.js.formatStr("It is detected that the resource pack of %sM needs to be updated. Do you want to download it now?",nMB)
        return tipStr
    },

    updateCallback: function (event) {
        let self = this
        var needRestart = false; //重启游戏
        var failed = false;
        let bAreadyUpdated = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                AppLog.warn("No local manifest file found, hot update skipped.");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                //this.panel.fileProgress.progress = event.getPercentByFile();
                if(!this.bStartUpdateing){
                    AppLog.ShowScreen('开始下载')
                }
                this.bStartUpdateing = true
                //this.lblTips.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                //this.lblTips.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                let nDownByte = event.getDownloadedBytes()
                let nTotalByte = event.getTotalBytes()
                var loadPercent = Math.floor(nDownByte/nTotalByte*100);
                loadPercent = (isNaN(loadPercent)?0:loadPercent);

                if(loadPercent<=100){
                    
                    this._proVal = loadPercent/100
                    this.ShowUpdateProcess(true)
                    this.SetUpdateProcess(loadPercent/100,nDownByte,nTotalByte)
                }
                // if(this._light) {
                //     this._light.active = this._pro<1;
                //     this._light.x = -this.progressBar.totalLength/2 + this.progressBar.totalLength*this.progressBar.progress;
                //     this._light.y = 0;
                // }
                var msg = event.getMessage();
                if (msg) {
                    //this.panel.info.string = 'Updated file: ' + msg;
                    AppLog.log(event.getPercent()/100 + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                let errorMsg = 'Fail to download manifest file'
                AppLog.warn(errorMsg);
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_FAILED,errorMsg)
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                AppLog.warn('Already up to date with the latest remote version.');
                // 已经是最新直接进入游戏，不需要重启
                // bAreadyUpdated = true;
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                AppLog.log('Update finished. ' + event.getMessage());
                //更新完成就写版本号
                Global.saveLocal('c_resv',Global.resVersion)
                Global.saveLocal('has_hot_res', "true");
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                let errorMsg1 = event.getMessage()
                AppLog.warn('UpdateFailed:'+errorMsg1);
                this.lblTips.string = errorMsg1
                this._updating = false;
                this._canRetry = true;
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_FAILED,errorMsg1)
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                let errorMsg2 = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage()
                AppLog.warn(errorMsg2);
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_HOTUPDATE_PRO_FAILED,errorMsg2)
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                AppLog.log(event.getMessage());
                break;
            default:
                break;
        }

        if(this._canRetry){
            console.log("#################download update failed files");
            if(!this._nRetrCount){
                this._nRetrCount = 0
            }
            this._nRetrCount++
            if(this._nRetrCount > 5){
                let sureCall = function(){
                    cc.game.restart()
                }
                let closeCall = function(){
                    cc.game.end()
                }
                cc.vv.AlertView.show('Oops! Something went wrong. Please try again.',sureCall,null,true,closeCall)
                return
            }
            else{
                //let sureCall = function(){
                    self._canRetry = false;
                    self._assManager.downloadFailedAssets();
                    self.lblTips.string = cc.js.formatStr('Wait a minute, I am working hard to update~(%s)',this._nRetrCount)
                //}
                //cc.vv.AlertView.show(cc.js.formatStr('update failed! try it again?(%s)',this._nRetrCount),sureCall)
            }
            

            
        }
        if (failed) {
            //解析热更服务端失败了，不能进入游戏
            this._assManager.setEventCallback(null);
            this._updateListener = null;
            this._updating = false;

            let sureCall = function(){
                cc.game.end()
            }
            
            cc.vv.AlertView.show('update failed! please check network.',sureCall)
        }

        if (needRestart) {
            //记录更新成功时间.重启后5分钟不检查热更，减少网络失败的概率
            let ntime = new Date().getTime()
            Global.saveLocal('last_hotupdate',ntime)

            AppLog.ShowScreen('完成下载，准备重启')
            StatisticsMgr.httpReport(StatisticsMgr.HTTP_SUCCESS_HOTUPDATE)
            this._assManager.setEventCallback(null);
            this._updateListener = null;

            var searchPaths = jsb.fileUtils.getSearchPaths();
            // AppLog.warn('[jsb]'+JSON.stringify(searchPaths));
            if(this._assManager.getLocalManifest()){
                var newPaths = this._assManager.getLocalManifest().getSearchPaths();
                AppLog.warn(JSON.stringify(newPaths));
    
                //在搜索路径之前增加新的搜索路径
                Array.prototype.unshift(searchPaths, newPaths);
            }
            

            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            //记录当前的进度条
            Global.saveLocal('app_pro',this._proVal)
            cc.audioEngine.stopAll();
            cc.game.restart();
        }
        
        //已经是最新不需要重启，直接进入游戏
        if(bAreadyUpdated){
            this._assManager.setEventCallback(null);
            this._updateListener = null;
            this._updating = false;
            this.enterLoginScene()
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
        if(size>1024*100){//大于100K
            AppLog.warn("[download file] : " + relativePath + " size:" + size);
        }
        if (compressed) {
            AppLog.log("Verification passed : " + relativePath);
            return true;
        }
        else {
            if(Global.APPID.TestCashHero == Global.appId){
                //测试版本
                return true
            }
            let extName = cc.path.extname(relativePath)
            if(extName == '.manifest'){
                return true
            }
            var file =  jsb.fileUtils.getWritablePath() + "remote-asset_temp/"+ relativePath;
            if (jsb.fileUtils.isFileExist(file)) {
                let md5Value = Md5(jsb.fileUtils.getDataFromFile(file));
                return md5Value === asset.md5;
            }
            else{
                return false;
            }
        }
    },

    //检查是否需要替换packurl
    checktNewPackUrl:function(fileObj){
        if(fileObj){
            if(!this._newPackUrl || Global.packageUrl == this._newPackUrl){
                //不用替换
                AppLog.warn("不用替换热更地址")
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

        
    //删除热更目录，强制换底包的时候需要
    deleteSubgameDir:function(){
        if (!Global.isNative()) return;
        
        let fullPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset/';
        if (jsb.fileUtils.isDirectoryExist(fullPath)){
            
            jsb.fileUtils.removeDirectory(fullPath);
            AppLog.warn("[删除热更缓存]")
        }
    },
});
