/*
** 游戏管理
** 负责处理全局消息
** 负责退出进程等接口
*/

cc.Class({
    extends: cc.Component,
    statics: {
        _interval_id: null,
        _showExit:false,        // 防止多次弹出退出框
        _isBackground:false,

        init: function () {
            //设置模式
            if (Global.localVersion) {
                cc.debug._resetDebugSetting(cc.debug.DebugMode.INFO);
                window.LogMode = cc.debug.DebugMode.INFO;
            }
            else {
                cc.debug._resetDebugSetting(cc.debug.DebugMode.ERROR);
                window.LogMode = cc.debug.DebugMode.ERROR;
                console.log = (function (oldLogFunc) {
                    return function() {
                        if(false){ //发布后屏蔽日志
                            // oldLogFunc.apply(this,arguments);
                        }
                    }
                })(console.log)
            }

            
            

            // 注册全局消息
            this.registerAllMsg();

            //归因收集
            this.doIntallReffer()
        },

        registerAllMsg: function () {

            //注册返回键
            // this.registerKeyboardBack()

            //进入大厅
            cc.vv.EventManager.on(EventId.ENTER_HALL, this.onRcvEnterHall, this);
            //进入游戏
            cc.vv.NetManager.registerMsg(MsgId.GAME_ENTER_MATCH, this.onRcvNetEnterGame, this);

            //更新推送token
            cc.vv.NetManager.registerMsg(MsgId.UPDATE_FCMTOKEN,this.onRcvFCMToken,this)
            //登录获取节点服
            cc.vv.NetManager.registerMsg(MsgId.LOGIN, this.onRcvMsgLogin, this);
            //用户登录节点服
            cc.vv.NetManager.registerMsg(MsgId.LOGIN_USERID, this.onRcvMsgLoginUserId, this);
            //用户重新登录节点服
            cc.vv.NetManager.registerMsg(MsgId.RELOGIN_USERID, this.onRcvMsgLoginUserId, this);
            //登出游戏
            cc.vv.NetManager.registerMsg(MsgId.LOGIN_OUT, this.onRcvMsgLoginout, this);
            //创建房间
            cc.vv.NetManager.registerMsg(MsgId.GAME_CREATEROOM, this.onRecNetCreateOrJoinRoom, this);
            //加入房间
            cc.vv.NetManager.registerMsg(MsgId.GAME_JOINROOM, this.onRecNetCreateOrJoinRoom, this);
            //游戏断线重连房间信息
            cc.vv.NetManager.registerMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRecNetCreateOrJoinRoom, this);
            //异地登录
            cc.vv.NetManager.registerMsg(MsgId.GAME_REMOTE_LOGIN, this.onRecNetRemoteLogin, this);
            //房间解散踢人，T回大厅
            cc.vv.NetManager.registerMsg(MsgId.NOTIFY_SYS_KICK_HALL, this.onRcvNetTickHallNotice, this); 
            //踢人，T回登录界面
            cc.vv.NetManager.registerMsg(MsgId.NOTIFY_SYS_KICK_LOGIN, this.onRcvNetSysKickNotice, this); 
            //App需要重启，可能是强更
            cc.vv.NetManager.registerMsg(MsgId.GAME_NEED_RESTART, this.onRcvNetGameRestarNotice, this); 

            //财富改变（金币改变）
            cc.vv.NetManager.registerMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, this);
            //主动同步金币
            cc.vv.NetManager.registerMsg(MsgId.SYNC_COIN, this.onRcvNetSyncMoney, this);
            //同步玩家信息
            cc.vv.NetManager.registerMsg(MsgId.SYNC_PLAYER_INFO, this.onRcvNetSyncPlayerInfo, this);
            //幸运红包变化
            cc.vv.NetManager.registerMsg(MsgId.REQ_REDPACK,this.onRcvRedPackInfo,this)

            //游戏内红包
            cc.vv.NetManager.registerMsg(MsgId.CAME_REDPACK_ALLSCENE,this.onRecvInGameRedpack,this)

            //随机轮盘活动
            cc.vv.NetManager.registerMsg(MsgId.ACTIVE_LUNPAN,this.onRecvActiveLunpan,this)
            
            //FB绑定账号
            cc.vv.NetManager.registerMsg(MsgId.REQ_BIND_FACEBOOK, this.onRcvNetBindAccount, this);


            //邮件完成通知，随时监听
            cc.vv.NetManager.registerMsg(MsgId.TASK_FINISH_NOTICE, this.onRcvNetTaskFinishNotice, this);

            //等级任务更新通知
            cc.vv.NetManager.registerMsg(MsgId.LEVEL_UP_PARTY_UPDATE_NOTICE, this.onRcvNetLevelUpPartyUpdateNotice, this);

            //破产补助
            cc.vv.NetManager.registerMsg(MsgId.COLLECT_BREAKGRANT_COIN_NOTICE, this.onRcvNetBreakGrantNotice, this);
            
            // //fb分享成功
            // cc.vv.NetManager.registerMsg(MsgId.REQ_SHARE_SUCC, this.onRcvShare, this);
            // cc.vv.NetManager.registerMsg(MsgId.REQ_FRIEND_SHARE, this.onRcvShare, this);

            //进入quest
            cc.vv.NetManager.registerMsg(MsgId.REQ_QUEST_INFO, this.OnRcvNetQuestInfo, this); 

            //全服公告
            cc.vv.NetManager.registerMsg(MsgId.GLOBAL_SYSTEM_NOTIFY, this.OnRcvNetSystemNotice, this); 

            //账号注销
            cc.vv.NetManager.registerMsg(MsgId.ACCOUNT_DELETE, this.OnRcvNetAccountDelete, this); 

            // cc.vv.PlatformApiMgr.addCallback(this.onOpenAppByURL.bind(this), 'OpenAppUrlLink');

            cc.game.on(cc.game.EVENT_HIDE, this.onBackGround, this);
            cc.game.on(cc.game.EVENT_SHOW, this.onEnterFront, this);
        },

        //注册返回键的响应
        registerKeyboardBack:function(){
            let self = this
            let backCall = function(){
                let str = 'Are you sure you want to quit the game?';
                let leftBtntext = "YES";
                let rightBtntext = "WAIT";
                if(!self._showExit){
                    self._showExit = true;
                    cc.vv.AlertView.show(str, ()=>{
                        self._showExit = false;
                    }, ()=>{
                        cc.game.end();
                    },false,null,null,leftBtntext,rightBtntext);
                }
            }
            // 安卓物理返回键:统一改成杀掉游戏进程
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function(event)
            {
                if ((event.keyCode == cc.macro.KEY.back || event.keyCode == cc.macro.KEY.escape))
                {
                    backCall()
                }
            },this);

            cc.vv.PlatformApiMgr.setBackPressCall(backCall)
        },

        onBackGround: function () {
            if(StatisticsMgr){
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_ENTER_BACKGROUND)
            }
            this._isBackground = true;
            Global.playerData.bank_token = null; //进入后台，清除银行token，防止其他人拿手机可以操作银行
        },

        onEnterFront: function () {
            if(!this._isBackground) return;
            this._isBackground = false;
            //进去前台就断线重连
            cc.log('游戏进入前台!');
            if (!(cc.director.getScene().name == Global.SCENE_NAME.LOGIN || //登录
                cc.director.getScene().name == Global.SCENE_NAME.HOTUPDATE //热更新
            )) {
                let bForseRecon = false
                if(cc.vv.gameData && cc.vv.gameData.isBackgroundReConn){
                    //如果有游戏需要切后台强制刷新，可以实现这个函数，然后返回true
                    bForseRecon = cc.vv.gameData.isBackgroundReConn()
                }
                let bConnect = cc.vv.NetManager.isConnect()
                if(!bForseRecon){
                    if(!bConnect){ //poly只有断开了才发起重连，因为重连会关闭掉小游戏
                        AppLog.warn("断线了，需要重连11111");
                        if(cc.director.getScene().name == Global.SCENE_NAME.HALL){
                            cc.vv.NetManager.reconnect();
                        }
                        
                    }
                    
                }
                else{
                    // AppLog.warn("重连222222", Global.appId, bConnect, bForseRecon);
                    cc.vv.NetManager.reconnect();
                }
                
            }
        },

        //删除注销账号
        doAccountDelete:function(){
            let req = {c: MsgId.ACCOUNT_DELETE};
            cc.vv.NetManager.send(req);
        },

        //监听通过URL打开App
        listenOpenAppByURL: function () {
            if (!Global.isNative()) return;

            let urlParamsData = cc.vv.PlatformApiMgr.getOpenAppUrlDataStr();
            if (urlParamsData && urlParamsData.length > 0) {
                urlParamsData = JSON.parse(urlParamsData);
                AppLog.log("actionId: " + urlParamsData.actionId);
                switch (parseInt(urlParamsData.actionId)) {
                    case Global.ShareActionId.ROOM_INVITE_FRIEND: //房间邀请，可以进入房间
                        let req = {c: MsgId.GAME_JOINROOM};
                        req.deskid = urlParamsData.valueId;
                        req.lng = Global.playerData.lng;
                        req.lat = Global.playerData.lat;
                        cc.vv.NetManager.send(req);
                        break;

                    default:
                        AppLog.warn('Not find the actionId[' + urlParamsData.actionId + ']，please check it!');
                        break;
                }
                ;
            }
        },

        // onOpenAppByURL: function (paramsDic) {
        //     AppLog.log("GameManager.onOpenAppByURL: " + JSON.stringify(paramsDic));
        // },

        // 断线重连，重登陆
        reqReloginUser: function () {
            let self = this;
            let req = {c: MsgId.RELOGIN_USERID};
            req.uid = Global.playerData.uid;
            req.openid = Global.playerData.openid;
            req.server = Global.playerData.serverId;
            req.subid = Global.playerData.subId;
            req.token = Global.playerData.token;
            req.appver = Global.appVersion;
            req.app = Global.appId;
            req.bundleid = self.getAppPackname();
            cc.vv.NetManager.send(req);

            //清除超时连接
            cc.vv.NetManager.clearTimeoutReconnect();
        },

        //重走登录服
        reqReLogin: function (bAuto) {
            let self = this
            //发送协议1之前connect
            StatisticsMgr.httpReport(StatisticsMgr.HTTP_SEND_MSG1,1)

            let preLoginStr = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
                if(preLoginStr){
                    AppLog.ShowScreen("relogin发送连接loginserver")
                    cc.vv.NetManager.connect(Global.loginServerAddress, function () {
                        //发送协议1 connect成功后
                        StatisticsMgr.httpReport(StatisticsMgr.HTTP_SEND_MSG1,2)

                        let reloginData = JSON.parse(preLoginStr);
                        if(Global.playerData && Global.playerData.uid){
                            reloginData.uid = Global.playerData.uid;
                        }
                        if(Global.playerData && Global.playerData.token){
                            reloginData.token = Global.playerData.token;
                        }
                        if(!bAuto){
                            reloginData.LoginExData = Global.LoginExData.reloginAction
                        }
                        else{
                            //自动登陆，替换asscesstoken
                            reloginData.accessToken = Global.getLocal('localtoken')
                        }
                        reloginData.bwss = 0
                        if (Global.isUserWSS()) {
                            reloginData.bwss = 1
                        }
                        reloginData.app = Global.appId
                        reloginData.bundleid = self.getAppPackname();
                        reloginData.dinfo = self.getDInfo()
                        reloginData.v = Global.resVersion
                        if (Global.isNative()) {
                            reloginData.av = cc.vv.PlatformApiMgr.getAppVersion();
                        }
                        let tDeviceInfo = Global.getDeviceInfo()
                        if(tDeviceInfo && tDeviceInfo.phoneBrand){
                            reloginData.phone = cc.js.formatStr("%s(%s)", tDeviceInfo.phoneBrand, tDeviceInfo.phoneSystemVision)
                        }
                        else{
                            if(cc.sys.isBrowser){
                                reloginData.phone = "Web_" + cc.sys.os
                            }
                            
                        }
                        

                        AppLog.ShowScreen("relogin发送协议1")
                        cc.vv.NetManager.send(reloginData);
                        //清除超时连接
                        cc.vv.NetManager.clearTimeoutReconnect();
                        
                        
                    });
                }
                else{
                    if(StatisticsMgr){
                        StatisticsMgr.httpReport(StatisticsMgr.HTTP_DISCONNECT)
                    }
                    

                    let sureCall = function(){
                        self.goBackLoginScene()
                    }
                    cc.vv.AlertView.showTips(cc.vv.Language.go_back_login,sureCall)
                }
        },

        //登录界面构造登录消息
        constructLoginMsg:function(nickname, pwd, loginType, accesstoken,loginExData,token){
            let req = {c: MsgId.LOGIN};
            req.user = nickname;
            req.passwd = pwd
            req.app = Global.appId
            req.v = Global.resVersion;
            if (Global.isNative()) {
                req.av = cc.vv.PlatformApiMgr.getAppVersion();
                req.fmcToken = cc.vv.PlatformApiMgr.GetFMCToken() //firebase推送的唯一标志
                //console.log("推送令牌：" + req.fmcToken)
                
                //ko唯一标志
                // req.kouuid = cc.vv.PlatformApiMgr.GetKoUUID()
                //console.log("KO令牌：" + req.kouuid)
            }
            let _loginExData = loginExData || Global.LoginExData.reloginAction
            req.t = loginType; //1随机 2 微信 3fb
            req.accessToken = accesstoken;
            req.platform = cc.sys.os;
            if (Global.isIOS()) {
                req.deviceToken = cc.vv.PlatformApiMgr.getDeviceToken();
            }
            let tDeviceInfo = Global.getDeviceInfo()
            if(tDeviceInfo && tDeviceInfo.phoneBrand){
                req.phone = cc.js.formatStr("%s(%s)", tDeviceInfo.phoneBrand, tDeviceInfo.phoneSystemVision)
            }
            else{
                if(cc.sys.isBrowser){
                    req.phone = "Web_" + cc.sys.os
                }
                
            }
            
            
            // let bOpenApi = false
            // if(cc.vv.UserManager.getLoginType() == Global.LoginType.APILOGIN){
            //     bOpenApi = true
            // }
            // if(bOpenApi && Global.openAPIModel){
            //     //开放平台登陆就需要添加额外的参数
            //     let apiGameid = cc.vv.UserManager.getApiGameId()
            //     req.gameid = apiGameid
            //     let apiSign = cc.vv.UserManager.getApiSign()
            //     req.signstr = apiSign
            // }

            req.token = token || Global.playerData.token;
            req.bwss = 0;
            req.LoginExData = _loginExData
            req.language = this._getGameLanguage()
            req.client_uuid = Global.getLocal('client_uuid', ''); //用来记录是当前客户端       
            if (Global.isUserWSS()) {
                req.bwss = 1
            }
            return req
        },
        reqLogin: function (nickname, pwd, loginType, accesstoken,loginExData,token, btype) {
            let self = this

            StatisticsMgr.httpReport(StatisticsMgr.HTTP_SEND_MSG1,1)
            AppLog.ShowScreen('开始连接loginserver')
            cc.vv.NetManager.connect(Global.loginServerAddress, function () {
                AppLog.ShowScreen('loginserver连接成功')
                let req = self.constructLoginMsg(nickname, pwd, loginType, accesstoken,loginExData,token)
                if(loginType == Global.LoginType.PHONE){ //手机登陆，如果是重置密码，需要传reset参数
                    if(loginExData == "rest"){
                        req.reset = 1
                        req.otp = token
                    }
                    else if(loginExData == "otp"){
                        req.otp = token
                    }
                }
                AppLog.ShowScreen('发送协议1')
                req.bundleid = self.getAppPackname();
                req.deviceid = Global.getDeviceId();
                req.dinfo = self.getDInfo()
                // 登录兼容绑定旧账户
                if(btype){
                    let tempReq = Global.deepClone(req)
                    tempReq.btype = btype;
                    cc.vv.NetManager.send(tempReq);
                }else {
                    cc.vv.NetManager.send(req);
                }
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_SEND_MSG1,2)
                Global.saveLocal(Global.SAVE_KEY_REQ_LOGIN, JSON.stringify(req));
                
                //清除超时连接
                cc.vv.NetManager.clearTimeoutReconnect();

                
            })
        },

        //自动游客登陆
        autoTravellerLogin:function(bOnlyGeneralParam){
            
            
            var localNickname = Global.getLocal('nick_name', '');
            if (localNickname.length == 0) {
               localNickname =  (Global.GUEST_PREFIX || 'Guest') + Global.random(999, 9999);
            }
            Global.saveLocal('nick_name', localNickname);

            var guestTokenCfg = Global.getLocal(Global.SAVE_PLAYER_TOKEN, '');
            var guestTokenMap = guestTokenCfg.length > 0?JSON.parse(guestTokenCfg) : {};
            var playerData = guestTokenMap[localNickname];
            let token = playerData?playerData.token:null;
            if (!token || token.length <= 0) {
                token = (new Date()).getTime()  + '_' + Global.random(1, 99999999);
                guestTokenMap[localNickname] = {token:token};
                Global.saveLocal(Global.SAVE_PLAYER_TOKEN, JSON.stringify(guestTokenMap));
            }
            if(bOnlyGeneralParam){
                return this.constructLoginMsg(localNickname, localNickname, Global.LoginType.Guest, '',Global.LoginExData.loginAction,token)
            }
            else{
                AppLog.ShowScreen('游客自动登陆')
                this.reqLogin(localNickname, localNickname, Global.LoginType.Guest, '',Global.LoginExData.loginAction,token)
            }
            
        },

        //返回登陆场景
        goBackLoginScene:function(autoLogin = true){
            //cc.vv.UserManager.setIsAutoLogin(autoLogin);

            Global.dispatchEvent(EventId.STOP_ACTION);
            // cc.vv.NetManager.close();
            cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN);
        },

        //用户登出
        onRcvMsgLoginout: function (msgDic) {

            if (msgDic.code === 200) {
               
               this.goBackLoginScene()
            }
            
        },



        //账号绑定消息
        onRcvNetBindAccount: function (msg) {
            let self = this
            if (msg.code === 200) {
                
                let loginType = msg.type
                let accountStr = "Facebook"
                if(loginType == Global.LoginType.GOOGLE_LOGIN){
                    accountStr = "Google"
                    
                }
                let modifyData = function(){
                    //删除本地游客的token
                    Global.deleteLocal('guest_token_map')
                                            
                    if(loginType == Global.LoginType.FB){
                        cc.vv.UserManager.setIsBindFb(true)
                    }
                    else if(loginType == Global.LoginType.GOOGLE_LOGIN){
                        
                        cc.vv.UserManager.setIsBindGoogle(true)
                    }

                    cc.vv.UserManager.setLoginType(loginType)
                    if (msg.usericon) {
                        cc.vv.UserManager.userIcon = msg.usericon
                    }
                    if (msg.playername) {
                        cc.vv.UserManager.setNickName(msg.playername)
                    }

                    Global.saveLocal(Global.SAVE_KEY_LOGIN_TYPE, loginType);
                    //Global.saveLocal(Global.SAVE_KEY_LAST_LOGIN_TYPE, loginType);
                    //修改自动登数据-登陆方式
                    let preLoginStr = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
                    let reloginData = JSON.parse(preLoginStr);
                    reloginData.t = loginType
                    Global.saveLocal(Global.SAVE_KEY_REQ_LOGIN, JSON.stringify(reloginData));

                    
                }

                if(msg.spcode === 1071){
                    //已经绑定了FB了，就直接登陆这个FB账号
                    let sureCall = function(){
                        if(cc.vv.gameData){
                            //如果在游戏内需要先退出游戏
                            if(cc.vv.gameData.ReqBackLobby){
                                cc.vv.gameData.ReqBackLobby()
                            }
                            //切换账号，清理quest的零时数据
                            if(cc.vv.gameData.SetIsQuestModel){
                                cc.vv.gameData.SetIsQuestModel(null)
                            }
                        }
                        self._isSendFbBind = true
                        modifyData()
                        let openid = msg.fbuid
                        let token = msg.fbtoken
                        self.reqLogin(openid, '', loginType, token,Global.LoginExData.loginAction,token)
                    }
                    let cancelCall = function(){

                    }
                    
                    let tips = cc.js.formatStr('Your %s account has already bound with another account, continue will remove all the info of current account and switch to the previous FB account automatically. Sure to continue？',accountStr)
                    cc.vv.AlertView.show(tips,sureCall,cancelCall,true)
                    return
                }
                else{
                    modifyData()
                }

                //绑定成功奖励
                Global.dispatchEvent(EventId.FB_BIND_SUCCESS,msg.addcoin)
             }
        },


        //进入大厅
        onRcvEnterHall: function (params) {
            
            if (cc.director.getScene().name !== Global.SCENE_NAME.HALL) {
                cc.vv.SceneMgr.setParams(params);
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL, function () {
                    cc.log('进去大厅');
                });
            }
            else{
                //刷新大厅
                cc.director.loadScene(Global.SCENE_NAME.HALL)
            }
        },

        //游戏是否开放
        isOpenOfGameId: function (gameid) {
            let gamelist = Global.playerData.gameList;
            if (gamelist) {
                for (let i = 0; i < gamelist.length; i++) {
                    if (gamelist[i].id == gameid) {
                        return gamelist[i].status == 1; //1开启
                    }
                }
            }
            return true;
        },

        //准备登陆游戏服:协议2
        reqLoginUserid:function(msgDic){
            let self = this;
            if(msgDic){
                

                //下发新的服务器地址
                // let gameServer = msgDic.net
                let gameServer = "www.25599.in/node"
                let uid = msgDic.uid
                let server = msgDic.server
                let subid = msgDic.subid
                let token = msgDic.token

                //保存uid
                Global.saveLocal('recent_uid',uid)
                Global.saveLocal('localtoken',token)

                //首次登陆下发的信息
                cc.vv.UserManager.initLoginServer(msgDic)

                AppLog.ShowScreen('连接node服')
                cc.vv.NetManager.connect(gameServer, function () {
                    AppLog.ShowScreen('协议2发送')
                    let req = {'c': MsgId.LOGIN_USERID}
                    req.uid = uid
                    req.openid = ""
                    req.server = server
                    req.subid = subid
                    req.token = token
                    req.deviceid = Global.getDeviceId()
                    req.appver = Global.appVersion;
                    req.app = Global.appId;
                    req.bundleid = self.getAppPackname();
                    req.v = Global.resVersion
                    if (Global.isNative()) {
                        req.av = cc.vv.PlatformApiMgr.getAppVersion();
                        req.fmcToken = cc.vv.PlatformApiMgr.GetFMCToken() //firebase推送的唯一标志
                        //ko唯一标志
                        req.kouuid = cc.vv.PlatformApiMgr.GetKoUUID()
                        if (Global.isIOS()) {
                            req.deviceToken = cc.vv.PlatformApiMgr.getDeviceToken();
                        }
                    }

                    cc.vv.NetManager.send(req)
                })
            }
            
        },

        onRcvMsgLogin: function (msgDic) {
            let self = this;
            if(msgDic.spcode && msgDic.spcode > 0){
                if(msgDic.spcode == 214){
                    //资源版本号不对，需要更新
                    this.showNeedUpdateRes()

                    return
                }
                else if(msgDic.spcode == 761){
                    cc.vv.FloatTip.show(___("Please login after 2 minutes!"))
                    return
                }
                else if(msgDic.spcode === 426 ){ //未开放注册
                    cc.vv.AlertView.showTips("Registration unavailable now.Please try again after some time.");
                }
                else if(msgDic.spcode === 216 ){ //IP注册限制
                    cc.vv.AlertView.showTips("Registration unavailable now.Please try again after some time.");
                }
                else if(msgDic.spcode === 217){ //设备登陆限制
                    cc.vv.AlertView.showTips("Device login restrictions.");
                }
                else if(msgDic.spcode === 218){
                    cc.vv.AlertView.showTips("Unsupported device!")
                }
                else if(msgDic.spcode === 405){//banned
                    cc.vv.AlertView.showTips("This account has been banned")
                }
                else if(msgDic.spcode === 335){//需要验证手机号码
                    cc.vv.AlertView.showTips("Your account security is important to us,please enter the OTP for new device login");
                }
                else if(msgDic.spcode === 334){
                    cc.vv.AlertView.showTips("Invalid OTP code")
                }
                else if(msgDic.spcode === 955){
                    cc.vv.AlertView.showTips(___("This account does not exist!"))
                }
                else if(msgDic.spcode === 333){
                    cc.vv.AlertView.showTips(___("wrong password!"))
                }

                else{
                    cc.vv.AlertView.showTips(cc.js.formatStr("Login fail!(%s)",msgDic.spcode));
                }
                AppLog.ShowScreen('协议1返回失败');
                let errcode = msgDic.spcode;
                Global.dispatchEvent(EventId.ENTER_LOGIN_FAILE,errcode);
                this.goBackLoginScene();
                return;
            }
            
            if (msgDic.code === 200) {
                AppLog.ShowScreen('协议1返回成功')
                //准备登陆游戏服
                this.reqLoginUserid(msgDic)
            }
            else {
                AppLog.ShowScreen('协议1返回失败')
                //登陆异常处理
                let errcode = msgDic.code
                Global.dispatchEvent(EventId.ENTER_LOGIN_FAILE,errcode)
                if (errcode === 940) {
                    //====微信登录失败
                    let loginSyncCall = function (data) {
                        if (data.result === 1) {
                            let token = data.token
                            let uid = data.uid
                            self.reqLogin(token, token, Global.LoginType.WX, uid)

                        }
                        else {
                            cc.vv.FloatTip.show(cc.vv.Language.float_tip_WeChat_authorization_fails);
                            // cc.vv.FloatTip.show('WeChat authorization fails!')
                        }

                    }
                    cc.vv.WxMgr.wxLogin(loginSyncCall)
                }
                else{
                    this.goBackLoginScene()
                }
                
            }
        },

        showNeedUpdateRes(){
            let callback = function () {
                cc.game.restart()
            }
            let tip = "There is a new resource update, restart the update immediately"
            cc.vv.AlertView.showTips(tip, callback)

            //清理热更时间
            let last = Global.getLocal('last_hotupdate','')
            if(last){
                Global.deleteLocal('last_hotupdate')
            }
            
        },

        onRcvMsgLoginUserId: function (msgDic) {
            if (msgDic.code === 200) {
                AppLog.ShowScreen('协议2返回')
                //登陆成功
                cc.vv.PlatformApiMgr.KoSDKTrackEvent('af_login',JSON.stringify({uid:msgDic.uid}))
                
                cc.vv.UserManager.initPlayerData(msgDic)
                //断线重连清理引导标志，以防卡死
                if(cc.vv.NewGuide){
                    cc.vv.NewGuide.SetIsLoadingGuide(false)
                }
                
                Global.dispatchEvent(EventId.ENTER_LOGIN_SUCCESS,msgDic);
                let loginType = cc.vv.UserManager.getLoginType()

                // //登录成功后，将user字段替换成palyername
                // if (msgDic.playerInfo && loginType == Global.LoginType.WX) {
                //     let reloginData = JSON.parse(Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, ''));
                //     reloginData.user = cc.vv.WxMgr.getWXToken()
                //     Global.saveLocal(Global.SAVE_KEY_REQ_LOGIN, JSON.stringify(reloginData));
                // }

                
                //游戏断线重连
                if (msgDic.deskFlag == 1) {
                    let gameId = msgDic.deskInfo.gameid
                    let enterFunc = function (){
                        msgDic.deskInfo.isReconnect = true;
                        cc.vv.NetManager.dispatchNetMsg({
                            c: MsgId.GAME_RECONNECT_DESKINFO,
                            code: Global.ERROR_CODE.NORMAL,
                            gameid: msgDic.deskInfo.gameid,
                            deskinfo: msgDic.deskInfo
                        });
                    }

                    let innerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //内置游戏
                    if(cc.vv.UserManager.isDownloadSubGame(gameId) || innerGame)
                    {
                        
                        
                        //发布后
                        
                        // if(!Global.publishMode || innerGame){
                        //     enterFunc()
                        // }
                        // else{
                        //     let gameCfg = cc.vv.GameItemCfg[gameId]
                        //     if(gameCfg){
                        //         cc.loader.downloader.loadSubpackage(gameCfg.name,(err) =>{
                        //             if(!err){
                        //                 cc.log('加载子包成功：'+gameCfg.name)
                        //                 enterFunc()
                        //             }
                        //             else{
                        //                 cc.log('加载子包错误：'+gameCfg.name +";"+err)
                        //             }
                        //         })
                        //     }
                        // }

                        this._checkSubpack(gameId,enterFunc)

                    }
                    else{
                        // 断线重连如果在游戏中，游戏没有下载，自动退出房间.
                        if(gameId){
                            let req = {c: MsgId.GAME_LEVELROOM};
                            req.deskid = gameId;
                            cc.vv.NetManager.send(req);

                            if(Global.isIOSReview()){
                                this.enterTS()
                            }
                            else{
                                cc.vv.EventManager.emit(EventId.ENTER_HALL);
                            }
                            
                            let gameCfg = cc.vv.GameItemCfg[gameId]
                            if(gameCfg){
                                let gameName = gameCfg.name;
                                cc.vv.AlertView.showTips(cc.js.formatStr(cc.vv.Language.cannot_entergame,gameName,gameName));
                            }
                        }
                        
                        
                    }

                }
                else {//进入大厅
                    if(loginType == Global.LoginType.APILOGIN){
                        //api调用 登陆成功后 直接进入游戏
                        let nId = cc.vv.UserManager.getApiGameId()
                        this.sendEnterGameReq(nId)
                    }
                    else{
                        if(cc.vv.SceneMgr.CanShowHallPreLoading()){
                            //在登录界面，预加载下资源
                            AppLog.ShowScreen('切换预加载场景')
                            cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD);
                        }
                        else{
                            if(Global.isIOSReview()){
                                this.enterTS()
                            }
                            // 正常断线重连不用回到大厅，就原地重连就好。
                            // 如果是fb绑定的话就要刷一下大厅
                            else{
                                let bInHall = cc.vv.SceneMgr.isInHallScene()
                                if(bInHall){
                                    if(this._isSendFbBind){
                                        this._isSendFbBind = null
                                        cc.vv.EventManager.emit(EventId.ENTER_HALL);
                                    }
                                    
                                }
                                else{
                                    //是否在游戏内
                                    if(cc.vv.gameData){
                                        let gameid = cc.vv.gameData.getGameId()
                                        if(cc.vv.gameData.GetIsQuestModel && cc.vv.gameData.GetIsQuestModel()){
                                            cc.vv.GameManager.setEnterOpation({gameTask:1})
                                        }
                                        cc.vv.GameManager.EnterGame(gameid)
                                    }
                                }
                                
                            }
                            
                        }
                    }
                    
                    
                    //cc.vv.EventManager.emit(EventId.ENTER_LOGIN_SUCCESS); 
                }
            }
            else{
                this.goBackLoginScene()
            }
        },

        //创建房间或者加入房间
        onRecNetCreateOrJoinRoom: function (msgDic) {

            let res = this._checkJoinRoomSpcode(msgDic)

            if(res && msgDic.code == 200){
                let data = cc.vv.GameDataCfg.getGameData(msgDic.gameid); // 水浒传 二人麻将统一配置
                if (data) {
                    if (data.dataName === "gameData") {
                        let ShowScene = data.loadingScene || data.gameScene
                        let dataCmp = require(data.dataCmp);
                        if (cc.vv.gameData === null || cc.vv.gameData === undefined) {
                            if(cc.vv.SceneMgr.GetCurSceneName() != ShowScene){
                                cc.vv.gameData = new dataCmp();
                                cc.vv.gameData.init(msgDic.deskinfo, msgDic.gameid, msgDic.gameJackpot);
                                Global.dispatchEvent(EventId.STOP_ACTION);
                                Global.dispatchEvent("HALL_TO_GAME");
                                AppLog.ShowScreen('准备进入游戏场景'+ShowScene)
                                cc.vv.SceneMgr.enterScene(ShowScene, null, data.orientation);
                            }
                            
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
                            Global.dispatchEvent(EventId.STOP_ACTION);
                            AppLog.ShowScreen('准备进入游戏场景'+data.gameScene)
                            cc.vv.SceneMgr.enterScene(data.gameScene, (err,tarScene) => {
                                let canvas = cc.find('Canvas')
                                let loadCmp = canvas.getComponent('SlotMachine_Loading')
                                if(!loadCmp){
                                    loadCmp = canvas.getComponent('LMSlots_Loading_Base')
                                }
                                if(loadCmp && loadCmp.setEnterGame){
                                    loadCmp.setEnterGame(msgDic.gameid)
                                }
                                
                            }, data.orientation);
                        }
                    }

                }
                
            }
            
        },

        _checkJoinRoomSpcode:function(msg){
            return true
        },

        //收到系统强制解散房间
        onRecNetDimissRoomBySystem: function (msgDic) {
            if (msgDic.code === 200) {
                let callback = function () {
                    cc.vv.EventManager.emit(EventId.ENTER_HALL);
                }
                cc.vv.AlertView.showTips(cc.vv.Language.dissolve_room, callback)
            }
        },

        //异地登录
        onRecNetRemoteLogin: function (msgDic) {
            cc.vv.NetManager.close(null, false);
            cc.vv.AlertView.showTips(cc.vv.Language.acc_online, function () {
                this.goBackLoginScene()
            }.bind(this));
        },

        onRcvNetSysKickNotice: function (msgDic) {
            cc.vv.NetManager.close(null, false);
            if(cc.vv.gameData){
                if(cc.vv.gameData.onExit){
                    cc.vv.gameData.onExit();
                }
                
                
            }
            this.goBackLoginScene();
        },

        loadLoginScene(){

        },

        //财富变化
        onRcvNetMoneyChanged: function (msgDic) {
            if (msgDic.code === 200) {
                Global.playerData.coin = msgDic.coin;
                if(msgDic.type === 1){
                    
                    let bDiamond = msgDic.diamond?true:false
                    if(bDiamond){
                        cc.vv.UserManager.setDiamond(msgDic.diamond,true)
                    }
                    let showAddCoin = function(){
                        if(!msgDic.count) return
                        //充值成功弹窗
                        let prefabPath = 'CashHero/prefab/BuyCoinResult'
                        cc.loader.loadRes(prefabPath,cc.Prefab, (err, prefab) => {
                                if(!err){
                                    let canvas = cc.find("Canvas");
                                    let old = canvas.getChildByName('BuyCoinResult')
                                    if(!old){
                                        if(cc.isValid(canvas,true)){
                                            let node = cc.instantiate(prefab)
                                            node.parent = canvas
                                            node.name = 'BuyCoinResult'
                                            let script = node.getComponent('CH_BuyCoinResult')
                                            if(script){
                                                script.ShowInfo(msgDic.count,bDiamond)
                                            }
                                        }
                                    }
                                    
                                    
                                }
                                else{
                                    //没有特殊就用通用
                                    cc.vv.AlertView.showTips(cc.js.formatStr(cc.vv.Language.add_score_succ,Global.S2P(msgDic.count)),()=>{});
                                }
                                
                        })
                    }

                    //是否有权益。如果有权益，先播放权益再播放金币
                    if(msgDic.rewards && msgDic.rewards.length >0){
                        let url = 'CashHero/prefab/pop_reward'
                        cc.loader.loadRes(url,cc.Prefab, (err, prefab) => {
                            if (!err) {
                                if(!cc.find('Canvas/pop_reward')){
                                    let node = cc.instantiate(prefab)
                                    node.parent = cc.find('Canvas')
                                    node.name = 'pop_reward'
                                    let endCall = function(){
                                        showAddCoin()
                                    }
                                    node.getComponent('CH_popreward').showRewards(msgDic.rewards,endCall)
                                }
                                
                            }
                            else{
                                AppLog.err('未找到资源:'+url)
                            }
                        });
                    }
                    else{
                        showAddCoin()
                    }
                    
                }
                Global.dispatchEvent(EventId.RECHARGE_SUCC);
            }
        },

        //主动同步金币
        onRcvNetSyncMoney: function (msgDic) {
            if (msgDic.code === 200) {
                Global.playerData.coin = msgDic.coin;
            }
        },

        onRcvNetSyncPlayerInfo: function (msgDic) {
            if (msgDic.code === 200) {
                if (msgDic.playerInfo.uid == Global.playerData.uid) {
                    for (let k in msgDic.playerInfo) {
                        Global.playerData[k] = msgDic.playerInfo[k];
                    }
                }
            }
        },

        onRcvNetTaskFinishNotice: function (msgDic) {
            if (msgDic.code === 200) {
                Global.playerData.taskNum = msgDic.hasQuest; //0没有任务 1有任务
                cc.vv.EventManager.emit(EventId.UPDATE_TASK_REDPOINT);
            }
        },

        onRcvNetLevelUpPartyUpdateNotice: function (msgDic) {
            if (msgDic.code === 200) {
                let canvas = cc.find("Canvas");
                let prefabPath = "hall_prefab/LevelUpPartyV";

                if (cc.vv.gameData && cc.vv.gameData.getGameId()) {
                    let data = cc.vv.GameDataCfg.getGameData(cc.vv.gameData.getGameId());
                    if (data.orientation === "portrait") prefabPath = "hall_prefab/LevelUpPartyV";
                }
                // cc.loader.loadRes(prefabPath,cc.Prefab, (err, prefab) => {
                //     if (!err) {
                //         if(!canvas.getChildByName('LevelUpParty')){
                //             let node = cc.instantiate(prefab);
                //             node.name = "LevelUpParty";
                //             node.parent = canvas;
                //             // node.getComponent("level_up_party").init(msgDic.state);
                //         }
                //     }
                //     else{
                //         AppLog.err('未找到资源')
                //     }
                // });

                //安队列弹出
                let showWay = {
                    type:1,
                    prefabUrl:prefabPath,
                    
                }
                cc.vv.QueueWinMrg.addPop('LevelUpPartyV',msgDic.state,showWay)
            }
        },

        onRcvNetBreakGrantNotice: function (msgDic) {
            if (msgDic.code === 200) {
                if(cc.vv.gameData){
                    // 优化
                    if(cc.vv.gameData.isNotShowBreak && cc.vv.gameData.isNotShowBreak()){
                        //不显示破产
                        return
                    }

                    //消息保存起来，合适的地方去展示
                    cc.vv.gameData.SetBreakGrant(msgDic)
                }
                 
            }
        },

        //app强制重启
        onRcvNetGameRestarNotice:function(msg){
            if(msg.code === 200){
                cc.vv.AlertView.showTips(cc.vv.Language.app_restart, function () {
                    //app重启
                    Global.dispatchEvent(EventId.STOP_ACTION);
                    cc.vv.NetManager.close();
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }.bind(this));
            }
        },

        //T回大厅
        onRcvNetTickHallNotice:function(msg){
            if(msg.code === 200){
                cc.vv.AlertView.showTips(cc.vv.Language.user_tick_notice, function () {
                    if(cc.vv.gameData){
                        if(cc.vv.gameData._EventId){
                            Global.dispatchEvent(cc.vv.gameData._EventId.EXIT_GAME);
                        }
                        Global.dispatchEvent(EventId.EXIT_GAME);
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL);
                    }
                    
                }.bind(this));
            }
        },

        //幸运红包
        onRcvRedPackInfo:function(msg){
            if(msg.code === 200){
                if(msg.num > 0){
                    //更新红包数量
                    cc.vv.UserManager.setLuckPackNum(msg.allnum)
                    //提示
                    cc.vv.AlertView.showTips(cc.vv.Language.get_luckypack_tips, function () {
                        //关闭提示就好
                        
                    }.bind(this));

                    //更新大厅红包状态
                    Global.dispatchEvent(EventId.UPDATE_REDPACK);
                    
                }
                
            }
        },

        //发送进入游戏请求
        sendEnterGameReq:function(gameId, ssid,exData){
            if(gameId){
                var req = {'c': MsgId.GAME_ENTER_MATCH};
                req.gameid = gameId;
                // req.gpsx = 0;
                // req.gpsy = 0;
                // req.gpsadd = '';
                
                //服务端已经不用了
                req.ssid = ssid || 0;
                if(exData){
                    for(let key in exData){
                        req[key] = exData[key]
                    }
                    
                }
                // AppLog.warn(JSON.stringify(req))
                cc.vv.NetManager.send(req);
            }
            
        },

        onRcvNetEnterGame:function(msg){
            AppLog.ShowScreen('进入游戏请求返回')
            
            let self = this
            let enterCall = function(){
                self.onRecNetCreateOrJoinRoom(msg)
            }
            let gameId = msg.gameid
            this._checkSubpack(gameId,enterCall)
        },

        //收到游戏内红包
        onRecvInGameRedpack:function(msg){
            if(msg.code == 200){
                //bb
                if(Global.appId == Global.APPID.BigBang){
                    cc.loader.loadRes('hall_prefab/prefab_game_redpack',cc.Prefab,(err,res) => {
                        if(!err){
                            let obj = cc.instantiate(res)
                            var winSize = cc.winSize
                            obj.x = winSize.width/2
                            obj.y = winSize.height/2
                            let curScene = cc.director.getScene();
                            curScene.addChild(obj)
                            let scriptCmp = obj.getComponent('BB_RedPack')
                            if(scriptCmp){
                                Global.playerData.coin = msg.coin;
                                cc.vv.UserManager.coin = msg.coin
                                scriptCmp.doShow(msg.hb,msg.coin)
                            }
                        }
                    })
                }
            }
        },

        onRecvActiveLunpan:function(msg){
            if(msg.code == 200){
                if(Global.appId == Global.APPID.BigBang){
                    cc.loader.loadRes('hall_prefab/prefab_lunpan_active',cc.Prefab,(err,res) => {
                        if(!err){
                            let obj = cc.instantiate(res)
                            var winSize = cc.director.getWinSize()
                            obj.x = winSize.width/2
                            obj.y = winSize.height/2
                            let curScene = cc.director.getScene();
                            curScene.addChild(obj)
                            let scriptCmp = obj.getComponent('BB_Active_lunpan')
                            if(scriptCmp){
                                scriptCmp.setData(msg)
                                Global.playerData.coin = msg.coin;
                                cc.vv.UserManager.coin = msg.coin
                                // scriptCmp.doShow(msg.hb,msg.coin)
                            }
                        }
                    })
                }
            }
        },



        //进入提审场景
        enterTS:function(){
            //不用特殊区别了
            cc.vv.EventManager.emit(EventId.ENTER_HALL);

            // let GAME_ID = require("GameIdMgr");
            // let gameId = GAME_ID.JLM
            // let dataCfg = cc.vv.GameDataCfg.getGameData(gameId);
            // if (dataCfg && dataCfg.hallScene) {
            //     cc.director.loadScene(dataCfg.hallScene, function () {
            //         Global.playEff(Global.SOUNDS.switch_scene);
            //         cc.find('Canvas').getComponent('GameCenter').init(gameId);
            //     }.bind(this));
            // }
        },

        


        //进入游戏
        EnterGame(gameId,ssid=null, data=null){
 
            if(!cc.vv.NetManager.isNetAvailable()){
                cc.vv.NetManager.showNetTipType(2)
                return
            }

            this._enterGameId = gameId
            this._enterSSID = ssid
            this._enterData = data

            // //发布后
            // let innerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //内置游戏
            // if(!Global.publishMode || innerGame){
            //     cc.vv.GameManager.doEnter()
            // }
            // else{
            //     let gameCfg = cc.vv.GameItemCfg[gameId]
            //     if(gameCfg){
            //         if(Global.loadingDown){
            //             //是否是loading的时候下载：如果是需要分离loading场景出来
            //             cc.vv.GameManager.doEnter()
            //         }
            //         else{
            //             cc.loader.downloader.loadSubpackage(gameCfg.name,(err) =>{
            //                 if(!err){
            //                     AppLog.warn('加载子包成功：'+gameCfg.name)
            //                     cc.vv.GameManager.doEnter()
            //                 }
            //                 else{
            //                     AppLog.warn('加载子包错误：'+gameCfg.name +";"+err)
            //                 }
            //             })
            //         }
                    
            //     }
            // }

            let enterCall = function(){
                cc.vv.GameManager.doEnter()
            }
            this._checkSubpack(gameId,enterCall)
        },

        _checkSubpack:function(gameId,enterCall){
            

            
            // this._dataAction = data

            //发布后
            let innerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //内置游戏
            if(!Global.publishMode || innerGame){
                // cc.vv.GameManager.doEnter()

                enterCall()
            }
            else{
                let gameCfg = cc.vv.GameItemCfg[gameId]
                if(gameCfg){
                    if(Global.loadingDown){
                        //是否是loading的时候下载：如果是需要分离loading场景出来
                        enterCall()
                    }
                    else{

                        

                        cc.loader.downloader.loadSubpackage(gameCfg.name,(err) =>{
                            if(!err){
                                AppLog.warn('加载子包成功：'+gameCfg.name)
                                enterCall()
                            }
                            else{
                                AppLog.warn('加载子包错误：'+gameCfg.name +";"+err)
                            }
                        })
                    }
                    
                }
            }
        },

        setEnterOpation(data){
            this._enterOp = data
        },
        getEnterOpation(){
            return this._enterOp
        },

        doEnter(){
            let self = this
            let gameId = this._enterGameId
            let ssid = this._enterSSID
            let extData = this._enterData
            let dataCfg = cc.vv.GameDataCfg.getGameData(gameId);
            if (dataCfg && dataCfg.selectRoom) {
                //需要选择场次
                if (cc.vv.gameData === null || cc.vv.gameData === undefined) {
                    let dataCmp = require(dataCfg.dataCmp);
                    cc.vv.gameData = new dataCmp();
                    cc.vv.gameData.init({gameid:gameId, users:[]}, gameId);
                    Global.dispatchEvent(EventId.STOP_ACTION);
                    cc.vv.SceneMgr.enterScene(dataCfg.gameScene);
                }
            }
            else if (dataCfg && dataCfg.hallScene) {
                cc.vv.SceneMgr.enterScene(dataCfg.hallScene,function(){
                    // Global.playEff(Global.SOUNDS.switch_scene);
                    cc.find('Canvas').getComponent('GameCenter').init(gameId);
                }, dataCfg.hallSceneOri)
            }
            else if (dataCfg && dataCfg.loadingScene) {

                let dataCmp = require(dataCfg.dataCmp);
                if (cc.vv.gameData === null || cc.vv.gameData === undefined) {
                    cc.vv.gameData = new dataCmp(); 
                    cc.vv.gameData.init({gameid:gameId, users:[]}, gameId);
                    Global.dispatchEvent(EventId.STOP_ACTION);

                    cc.vv.SceneMgr.enterScene(dataCfg.loadingScene, (err,tarScene) => {
                        if(gameId == GAME_ID.DZPK){
                            cc.vv.GameManager.sendEnterGameReq(gameId, ssid, extData);
                        }
                    }, dataCfg.orientation);
                }
            }
            else if(dataCfg && dataCfg.bNoLoading){
                //没有loading场景的
                cc.vv.GameManager.sendEnterGameReq(gameId, ssid, extData);
                //预加载场景
                cc.director.preloadScene(dataCfg.gameScene,(err,scene) => {
                })
            }
            
            else {
                if(Global.isYDApp && Global.isYDApp()){
                    cc.vv.GameManager.sendEnterGameReq(gameId, ssid, extData);
                    //预加载场景
                    let ShowScene = dataCfg.loadingScene || dataCfg.gameScene
                    cc.director.preloadScene(ShowScene,(err,scene) => {
                    })
                }
                else{
                    let ShowScene = dataCfg.loadingScene || dataCfg.gameScene
                    cc.vv.SceneMgr.enterScene(ShowScene, (err,tarScene) => {
                        if(cc.vv.gameData){
                            cc.vv.gameData.clear()
                        }
                        
    
                        let canvas = cc.find('Canvas')
                        let loadCmp = canvas.getComponent('SlotMachine_Loading')
                        if(!loadCmp){
                            loadCmp = canvas.getComponent('LMSlots_Loading_Base')
                        }
                        if(loadCmp && loadCmp.setEnterGame){
                            let data = this.getEnterOpation()
                            loadCmp.setEnterGame(gameId,data,ssid)
                            self.setEnterOpation(null)
                        }
                        
                    }, dataCfg.orientation);
                }
                
                
            }

            
            this._enterSSID = null
            this._enterData = null
        },

        //登出
        GameLogoout:function(){
            AppLog.log("登出");
            
            if(Global.openFacebookLogin){
                if(Global.playerData.logintype === Global.LoginType.FB){
                    if(cc.sys.isBrowser){
                        FB.logout(function(response){
                            //登出
                        })
                    }
                    else{
                        cc.vv.PlatformApiMgr.SdkLoginOut() //sdk注销一下
                    }
                }
            }

            if(Global.openWeChatLogin){
                if(Global.playerData.logintype === Global.LoginType.WX){
                    if(cc.sys.isBrowser){

                    }
                    else{
                        cc.vv.WxMgr.delWXToken() //sdk注销一下
                    }
                }
            }

            let bInGame = cc.vv.AppData.getIsInGame()
            if(bInGame && cc.vv.gameData){
                cc.vv.gameData.requestExit();
            }

            cc.vv.NetManager.send({c:MsgId.LOGIN_OUT}, true);

            // this.scheduleOnce(()=>{
                cc.vv.NetManager.close();
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN)
                Global.deleteLocal(Global.SAVE_KEY_LOGIN_TYPE, ''); //清理登录方式
            // },0.2)
        },

        // onRcvShare:function(msg){
        //     if(msg.code == 200){
        //         Global.dispatchEvent(EventId.REFRUSH_BONUSLIST)
        //         let coin = msg.coin
        //         if(coin){ //没有奖励就是0
        //             Global.dispatchEvent('share_reward',coin)
        //             // let toNode = cc.find(Global.HALL_COIN_LABEL_NODE_PATH)
        //             // cc.loader.loadRes("CashHero/prefab/fbShare/fbShareReward",cc.Prefab, (err, prefab) => {
        //             //     if(!err){
        //             //         let objParent = cc.find('Canvas')
        //             //         if(!cc.find('fbShareReward',objParent)){
        //             //             let endCall = function(){
        //             //                 //刷新金币
        //             //                 if(cc.vv.gameData){
        //             //                     cc.vv.gameData.AddCoin(coin, true)
        //             //                 } else {
        //             //                     cc.vv.UserManager.AddCoin(coin, true)
        //             //                 }
        //             //             }
        //             //             let node = cc.instantiate(prefab)
        //             //             node.name = 'fbShareReward'
        //             //             node.parent = objParent
        //             //             let scp = node.getComponent('fbShareAddcoin')
        //             //             if(scp){
        //             //                 scp.setCoin(coin,toNode,endCall)
        //             //             }
        //             //         }
                            
        //             //     }
        //             // })
        //         }
                
        //     }
        // },

        OnRcvNetQuestInfo:function(msg){
            if(msg.code == 200){
                cc.vv.UserManager.setQuestInfo(msg)
                let goScene = Global.SCENE_NAME.QUEST
                cc.vv.SceneMgr.enterScene(goScene,null,Global.APP_ORIENTATION)
            }
        },

        OnRcvNetSystemNotice:function(msg){
            if(msg.code == 200){
                //收到全服公告
                let prefabPath = 'CashHero/prefab/system_notice'
                cc.loader.loadRes(prefabPath,cc.Prefab, (err, prefab) => {
                        if(!err){
                            let canvas = cc.find("Canvas");
                            if(cc.isValid(canvas)){
                                let old = canvas.getChildByName('system_notice')
                                if(!old){
                                    old = cc.instantiate(prefab)
                                    old.parent = canvas
                                    
                                }
                                let scp = old.getComponent('system_notice')
                                scp.show(msg.message)
                            }
                            
                        }
                    }
                )
            }
        },

        OnRcvNetAccountDelete:function(msg){
            if(msg.code == 200){
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN)
            }
        },

        getGameID () {
            return this._enterGameId
        },

        //华为自动登录
        aotoHuaweiLogin(){
            AppLog.ShowScreen('开始华为SDK登陆授权')
            cc.vv.PlatformApiMgr.doHuaweiLogin((cbData) => {
                AppLog.ShowScreen('华为SDK授权完成')
                AppLog.log("=======LMSlots===doHuaweiLogin======:  " + JSON.stringify(cbData));
                let result = parseInt(cbData.result)
                if (result) {
                    cc.vv.GameManager.reqLogin(cbData.uid, "", Global.LoginType.HUAWEI, cbData.authorId, JSON.parse(cbData.detail), cbData.authorId);
                }
                else {
                    // if(cbData.errorcode == -1){ //静默登陆失败,回到登陆界面
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN)
                    // }
                }
            },1)
        },

        doIntallReffer(){
            //是否打开归因开关
            if(!Global.openInstallReff) return
            //是否是老用户
            let preLoginStr = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
            if(preLoginStr) return

            let url = Global.apiUrl
            if(cc.vv.PlatformApiMgr){
                let callBack = function(param){
                    param.ddid = Global.getLocal('client_uuid', "")
                    if(param.result == 1){
                        //success
                    }
                    else{
                        //fail
                    }

                    cc.vv.NetManager.requestHttp('/start', param,  (state, res)=> {
                        
                    },url,"POST")
                }
                cc.vv.PlatformApiMgr.installRef(callBack)
            }
        },

        nativeSkipHotupdate(){
            AppLog.ShowScreen('准备登陆')
            let autoLoginReq = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
            if(autoLoginReq && Global.openAutoLogin){
                //直接自动登陆
                let bP1Info = Global.getLocal("P1")
                if(bP1Info){
                    AppLog.ShowScreen('API下发登陆信息，非首次登陆协议2')
                    this.reqLoginUserid(JSON.parse(bP1Info))
                }
                else{
                    AppLog.ShowScreen('通过本地登陆信息自动登陆')
                    cc.vv.GameManager.reqReLogin(true)
                }
                
            }
            else{
                //华为/ios提审的时候，不自动登录|| Global.isIOSReview()
                let bHuawei = Global.IsHuawei()
                
                if(bHuawei){
                    let isHWCoreAvaild = cc.vv.PlatformApiMgr.isHuaweiServerAvailble()
                    if(isHWCoreAvaild){
                        cc.vv.GameManager.aotoHuaweiLogin()
                    }
                    else{
                        //华为服务不支持，就到登陆界面
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN)
                    }
                    
                }
                else{
                    if(Global.isIOSReview()){
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN)
                    }
                    else{
                        let bP1Info = Global.getLocal("P1")
                        if(bP1Info){
                            AppLog.ShowScreen('API下发登陆信息,首次登陆协议2')
                            this.reqLoginUserid(JSON.parse(bP1Info))
                        }
                        else{
                            //游客自动登录
                            cc.vv.GameManager.autoTravellerLogin()
                        }
                        
                    }
                }
                
                
                
            }
        },

        //获取协议1的参数
        getSaveKeyReqLoginParam(){
            let autoLoginReq = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, '')
            if(!autoLoginReq){
                //生成一个
                autoLoginReq =  JSON.stringify(cc.vv.GameManager.autoTravellerLogin(true))
            }
            return autoLoginReq
        },

        _getGameLanguage(){
            let languageType = 1 //上传语言类型
            if(Global.language == 'en'){
                languageType = 2
            }
            return languageType
        },

        /**
         * 更新推送token,以免登陆的获取到的是空的
         */
        updateFCMToken(){
            let tokenstr = cc.vv.PlatformApiMgr.GetFMCToken()
            
            if(tokenstr){
                if(this._lastFCMToken != tokenstr){
                    this._lastFCMToken = tokenstr
                    cc.vv.NetManager.send({c:MsgId.UPDATE_FCMTOKEN,token:tokenstr},true)
                }
                else{
                    // AppLog.warn("推送token未变化:"+tokenstr)
                }
                
            }
            // else{
            //     AppLog.warn("推送token获取为空")
            // }
        },

        onRcvFCMToken(msg){
            if(msg.code == 200){
                AppLog.warn("推送token更新成功")
            }
        },

        getAppPackname(){
            return cc.vv.PlatformApiMgr.getPackageName()
        },

        //获取额外的设备信息
        getDInfo(){
            if(Global.isYDApp()){
                var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
                if(localAppVersion>129){
                    let info = {}
                    let tGid = cc.vv.PlatformApiMgr.getGSFId()
                    if(tGid){
                        tGid = tGid.toString()
                    }
                    info.gid = tGid
                    info.sid = cc.vv.PlatformApiMgr.getSimcardid()
                    info.oper = cc.vv.PlatformApiMgr.getSimOperator()
                    
                    return JSON.stringify(info)
                }
                else{
                    return ""
                }
                
            }
        }
        

    }
});
