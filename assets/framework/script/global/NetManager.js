/*
** Manager then game net
*/

cc.Class({
    extends: cc.Component,

    statics: {
        _address: "", //ip:port
        _hearBeatTimeout: 3000, //超时时间3秒
        _hearBeatInterval: 7 * 1000, //测试修改20秒
        _lastReplyInterval: 50, //最后回复间隔(默认50毫秒)
        _curReplyInterval: 0.0, //当前回复间隔
        _ws: null, //socket对象
        _hearBeatIntervalIdx: null, //心跳索引
        _lastHearBeatTime: 0, //最后心跳时间
        _nextAutoConnectDelay: 0, //下次自动连接的时间
        _autoConnectCount: 0, //自动连接次数
        _autoConnectCountMax: 2, //最大自动连接次数（最多连三次）
        _curtime: 0, //记录时间
        _fnDisconnect: null, //断线回调
        _handlers: {}, //消息处理器
        _handlersHigh: {}, //高优先级消息处理器
        _Http: require('Http'),
        _msgPack: require("msgpack.min"),
        _idx: 0,
        // 请求缓存监听器
        cacheList: [],
        cacheIdxList: [],
        notifyHandler: [],


        init: function () {
            var self = this;

            var myDate = new Date();
            this._curtime = myDate.getTime(); //1970.1.1开始的毫秒数
            this._lastHearBeatTime = this._curtime;


        },

        //注册消息
        //bHighpriority true/false高优先级：界面注册的消息是正常优先级，数据层的应该注册高优先级。先刷数据，再刷界面
        //target : 需要多处监听的消息，fn 需不用bind(this) 而是将this 赋值给target
        //示例：cc.vv.NetManager.registerMsg(MsgId.LOGIN, this.onRcvMsgLogin, this)
        registerMsg: function (cmd, fn, target, bHighpriority) {
            if (cmd == null || cmd == undefined) {
                AppLog.warn("cmd must be not null and not undefined");
                return;
            }
            if (fn == null || fn == undefined) {
                AppLog.warn("fn must be not null and not undefined");
                return
            }
            var item = { _fn: fn, _tgt: target };

            var cmdKey = String(cmd);
            if (bHighpriority && typeof (bHighpriority) == 'boolean') {
                //高优先级消息注册
                this._handlersHigh[cmdKey] = this._handlersHigh[cmdKey] || [];

                for (let i = 0; i < this._handlersHigh[cmdKey].length; i++) {
                    let itemTarget = this._handlersHigh[cmdKey][i]._tgt;
                    let cb = this._handlersHigh[cmdKey][i]._fn;
                    if (cb === fn && target === itemTarget) {
                        cc.warn("The Highcmd:" + cmd + "==>fn has registered!");
                        return;
                    }
                }
                //cc.log("registerHighMsg: ", cmd);
                this._handlersHigh[cmdKey].push(item);
            }
            else {
                this._handlers[cmdKey] = this._handlers[cmdKey] || [];
                for (var i = 0; i < this._handlers[cmdKey].length; i++) {
                    var cb = this._handlers[cmdKey][i]._fn;
                    var itemTarget = this._handlers[cmdKey][i]._tgt;
                    if (cb === fn && target === itemTarget) {
                        cc.warn("The cmd:" + cmd + "==>fn has registered!");
                        return;
                    }
                }
                //cc.log("registerMsg: ", cmd);
                this._handlers[cmdKey].push(item);
            }
        },

        // 查找相同消息上挂载多个继承同一个脚本，而且注册的事件相同，这种情况不知道到底注销哪个消息
        findSameFuncAdrr(handler, fn) {
            let num = 0;
            for (let i = 0; i < handler.length; ++i) {
                if (fn === handler[i]._fn) ++num;
            }
            return num;
        },

        //注销消息
        //fn : fn的形式如this.onNectCallback就好，不能this.onNectCallback.bind(this)否则无法注销
        //示例：cc.vv.NetManager.registerMsg(MsgId.LOGIN, this.onRcvMsgLogin)
        unregisterMsg: function (cmd, fn, bHighpriority = false, target) {
            if (cmd != null && cmd != undefined) {
                var cmdKey = String(cmd);
                if (bHighpriority && typeof (bHighpriority) == 'boolean') {
                    //注销高优先级的消息回调
                    if (fn && typeof (fn) == 'function' && this._handlersHigh[cmdKey]) {
                        let num = this.findSameFuncAdrr(this._handlersHigh[cmdKey], fn);

                        for (var i = 0; i < this._handlersHigh[cmdKey].length; i++) {
                            var item = this._handlersHigh[cmdKey][i]
                            if (item._fn === fn) {
                                if (num > 1) {
                                    if (target === null || target === undefined) {
                                        AppLog.err("请传入需要注销的消息的target");
                                    }
                                    else {
                                        var itemTarget = this._handlersHigh[cmdKey][i]._tgt;
                                        if (itemTarget === target) {
                                            AppLog.log("unregisterHighMsg: ", cmd, '=>function');
                                            this._handlersHigh[cmdKey].splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                else {
                                    AppLog.log("unregisterHighMsg: ", cmd, '=>function');
                                    this._handlersHigh[cmdKey].splice(i, 1);
                                    break;
                                }

                            }
                        }
                    }
                    else {
                        AppLog.log("unregisterMsg: ", cmd);
                        delete this._handlersHigh[cmdKey];
                    }
                }
                else {
                    if (fn && typeof (fn) == 'function' && this._handlers[cmdKey]) {
                        let num = this.findSameFuncAdrr(this._handlers[cmdKey], fn);
                        for (var i = 0; i < this._handlers[cmdKey].length; i++) {
                            var item = this._handlers[cmdKey][i];
                            if (item._fn === fn) {
                                if (num > 1) {
                                    if (target === null || target === undefined) {
                                        AppLog.err("请传入需要注销的消息的target");
                                    }
                                    else {
                                        var itemTarget = this._handlers[cmdKey][i]._tgt;
                                        if (itemTarget === target) {
                                            AppLog.log("unregisterHighMsg: ", cmd, '=>function');
                                            this._handlers[cmdKey].splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                else {
                                    AppLog.log("unregisterHighMsg: ", cmd, '=>function');
                                    this._handlers[cmdKey].splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        AppLog.log("unregisterMsg: ", cmd);
                        delete this._handlers[cmdKey];
                    }
                }
            }
        },

        //分发网络消息
        dispatchNetMsg: function (msg) {
            if (typeof (msg) == 'string') {
                msg = JSON.parse(msg);
            }
            this.handleMsg(msg);
            if (Global.isNative()) {
                AppLog.log('客户端主动分发网络消息', JSON.stringify(msg));
            } else {
                cc.log("%c 客户端主动分发网络消息(%d): %o", "background: rgb(254,189,1);color:#9932cd;font-weight:bold;", 0, msg);
            }
        },

        //处理消息
        handleMsg: function (msgDic) {
            if (!msgDic) return;
            if (this.cacheIdxList.indexOf(msgDic.c_idx) < 0) this.printNetLog("Receive", msgDic);
            var cmd = msgDic.c
            if (cmd) {
                var cmdKey = String(cmd);

                this._notifyMsgBack(cmdKey)
                if (msgDic.c != MsgId.HEARTBEAT && cc.vv.LoadingTip) { //隐藏屏蔽
                    this.hideNetTip()
                }


                //优先处理高优先级的消息回调
                var cmdHandlersHigh = this._handlersHigh[cmdKey];
                if (cmdHandlersHigh) {
                    for (var i = cmdHandlersHigh.length - 1; i >= 0; i--) {
                        var item = cmdHandlersHigh[i]
                        if (item._tgt) {
                            var cb = item._fn.bind(item._tgt)
                            if (cb(Global.copy(msgDic)) == true) break; //若返回了true，则表示处理完成，不续传其他地方处理。
                        }
                        else {
                            if (item._fn(Global.copy(msgDic)) == true) break; //若返回了true，则表示处理完成，不续传其他地方处理。
                        }

                    }
                }

                var cmdHandlers = this._handlers[cmdKey];
                if (!cmdHandlers) {
                    if (!cmdHandlersHigh) { //高优先级的已经注册了，这里可以不用提示
                        AppLog.warn('Received msg cmd:' + (cmd) + ' has no handlers');
                    }
                    return;
                }
                for (var i = cmdHandlers.length - 1; i >= 0; i--) {
                    var item = cmdHandlers[i]
                    if (item._tgt) {
                        var cb = item._fn.bind(item._tgt)
                        if (cb(Global.copy(msgDic)) == true) break; //若返回了true，则表示处理完成，不续传其他地方处理。
                    }
                    else {
                        if (item._fn(Global.copy(msgDic)) == true) break; //若返回了true，则表示处理完成，不续传其他地方处理。
                    }
                }


                if (msgDic.code != 200 && msgDic.code != 20000) {  //200正常处理，20000不予处理
                    if (!this.handleCommonErrorCode(msgDic.code, msgDic)) {
                        if (msgDic.code === 203) Global.dispatchEvent(EventId.RELOGIN);

                        let descKey = Global.code[msgDic.code.toString()];
                        let descStr = descKey ? cc.vv.Language[descKey] : ("error code:" + msgDic.code.toString());

                        // 提示需要更新
                        if (msgDic.code === 214) {
                            cc.vv.AlertView.showTips(descStr || descKey, function () {
                                Global.dispatchEvent(EventId.STOP_ACTION);
                                cc.vv.NetManager.close();
                                if (Global.isNative()) cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HOTUPDATE);
                            }.bind(this));
                        }
                        let nodeTipsCode = [399, 934, 710]
                        if (nodeTipsCode.includes(msgDic.code)) {   //不提示

                        }
                        else {
                            cc.vv.FloatTip.show(descStr || descKey);
                        }
                    }
                }
            }
            else {
                AppLog.warn('Received msg is has not the cmd！');
            }
        },

        /**
         * 注册消息返回监听，有时候业务需要监听消息是否返回了
         * @param {*} notifyCall 
         */
        registerNotify: function (notifyCall) {
            let bIn = false
            for (let i = 0; i < this.notifyHandler.length; i++) {
                let item = this.notifyHandler[i]
                if (item == notifyCall) {
                    bIn = true
                    break
                }
            }
            if (!bIn) {
                this.notifyHandler.push(notifyCall)
            }
        },

        /**
         * 取消消息返回注册监听
         * @param {*} notifyCall 
         */
        unregisterNotify: function (notifyCall) {

            for (let i = 0; i < this.notifyHandler.length; i++) {
                let item = this.notifyHandler[i]
                if (item == notifyCall) {
                    this.notifyHandler.splice(i, 1)
                    break
                }
            }
        },

        _notifyMsgBack: function (cmd) {
            for (let i = 0; i < this.notifyHandler.length; i++) {
                let itemHandler = this.notifyHandler[i]
                if (itemHandler) {
                    itemHandler(cmd)
                }
            }
        },

        //处理常用错误码
        handleCommonErrorCode: function (errorCode, msg) {
            switch (errorCode) {
                case 415: //需要重新登录
                    cc.vv.FloatTip.show(cc.vv.Language.reconnect);
                    cc.vv.GameManager.reqReLogin(); //用户重登录登录服
                    break;
                case 500:
                    cc.vv.AlertView.show(cc.vv.Language.login_fail_again, () => {
                        // cc.vv.FloatTip.show("重新连接中...");
                        cc.vv.GameManager.reqReLogin(); //用户重登录登录服
                    }, () => {
                        Global.dispatchEvent(EventId.STOP_ACTION);
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, () => {
                            this.close(); //关闭网络
                        });
                    });
                    break;
                case 801: //必须重启
                    cc.vv.AlertView.showTips(cc.vv.Language.new_ver, () => {
                        cc.audioEngine.stopAll();
                        cc.game.restart();
                    });
                    break;
                case 803: //游戏维护中
                    this.no_need_reconnect = true //不需要重连了
                    Global.dispatchEvent(EventId.STOP_ACTION);
                    //
                    let curScene = cc.director.getScene()
                    if (curScene.name != Global.SCENE_NAME.LOGIN) {
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, () => {
                            this.close()
                            cc.vv.AlertView.showTips(cc.vv.Language.system_maintenance_tips);
                        });
                    }
                    else {
                        this.close()
                        cc.vv.AlertView.showTips(cc.vv.Language.system_maintenance_tips);
                    }

                    break;
                case 804: //金币不足
                    cc.vv.FloatTip.show(cc.vv.Language.not_enough_coins);
                    Global.dispatchEvent(EventId.NOT_ENOUGH_COINS);
                    break;
                case 211: //token无效 要重新登录
                    // cc.vv.UserManager.setIsAutoLogin(false);
                    Global.dispatchEvent(EventId.RELOGIN);
                    cc.vv.AlertView.showTips(cc.vv.Language.invalid_token, () => {

                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, () => {
                            this.close();
                        })
                    });
                    break;
                case 931: //房间不存在，需要重连恢复正常
                    cc.vv.GameManager.reqReLogin();
                    break;
                default:
                    return false; //表示未处理
                    break;
            };
            return true; //表示已处理
        },

        //处理回复数据(暂时没有考虑粘包的问题)
        handleResponeData: function (msgData) {
            var self = this;
            //清理重连标识位
            this._bReconnecting = null

            var decodeArrayBuff = function (arrayBuf) {
                var dataview = new DataView(arrayBuf)
                var size = dataview.getUint8(0) * 256 + dataview.getUint8(1);
                var headSize = 8;
                var uint8Array = new Uint8Array(arrayBuf.byteLength - headSize);

                for (var i = 0; i < uint8Array.length; i++) {
                    uint8Array[i] = dataview.getUint8(headSize + i);
                }

                var msgDic = self._msgPack.decode(uint8Array);
                self._lastHearBeatTime = self._curtime;

                // if (Global.localVersion) {
                //     //let  str = JSON.stringify(msgDic);
                //     //str = str.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
                //     if (msgDic.indexOf("\"c\":11") == -1)
                //         cc.log("Recieved: ", msgDic);
                // }
                self.handleMsg(JSON.parse(msgDic));
                dataview = null; //释放对象
                uint8Array = null; //释放对象
            };

            if (window.FileReader && msgData instanceof Blob) {
                var reader = new FileReader();
                reader.addEventListener('loadend', function () {
                    decodeArrayBuff(reader.result);
                });
                reader.readAsArrayBuffer(msgData); //data是Blob类型数据;
            }
            else {
                AppLog.log('Not supported FileReader by your browser or devices');
                decodeArrayBuff(msgData);
            }
        },

        //连接
        connect: function (serverAddress, callback) {
            var self = this;
            this.no_need_reconnect = null

            this._address = serverAddress;

            if (this._ws) this.close();

            var wsHead = 'ws://'
            let bUse = Global.isUserWSS(serverAddress)
            if (bUse) {
                wsHead = 'wss://'
            }
            if (Global.isAndroid() && bUse) {
                //android原生平台如果用wss的话，必须要传后两个参数，不然链接不上服务器
                //至于这个pem，我也是网上下载的。。。
                this._ws = new WebSocket(wsHead + this._address + '/ws', [], cc.url.raw("resources/common/cert.pem"));
            }
            else {
                this._ws = new WebSocket(wsHead + this._address + '/ws');
            }

            this._ws.onopen = function (event) {
                AppLog.log("socket " + self._address + " connect succeed");
                //cc.vv.LoadingTip.hide(0.1, true); //强行关闭加载

                self._autoConnectCount = 0;

                if (callback && !this.no_need_reconnect) {
                    callback();
                }

                var bLoginServer = false
                var nPos = event.target.url.indexOf(Global.loginServerAddress)
                if (nPos > -1) {
                    bLoginServer = true
                }
                if (!bLoginServer) { //登录服，不发心跳
                    AppLog.log("节点服，发心跳！");

                    self.hearBeat();
                    this._lastReplyInterval = 100; //socket连上，表示网络好
                }
            };
            this._ws.onmessage = function (event) {
                //data是Blob类型数据
                self.handleResponeData(event.data);
            };
            this._ws.onerror = function (event) {
                AppLog.err("socket connect error!");
                AppLog.log("链接错误，5s后重连");
                self._nextAutoConnectDelay = 5000; //5秒后自动重连
            };
            this._ws.onclose = function (event) {
                AppLog.log(cc.js.formatStr("socket connect closed! url=%s,code=%s", event.target.url, event.code));

                cc.log('close url' + event.target.url)

                //登录服务器，如果断开了就不自动重连
                var bLoginServer = false
                var nPos = event.target.url.indexOf(Global.loginServerAddress)
                if (nPos > -1) {
                    bLoginServer = true
                }
                else {
                    self.stopHearBeat()
                }
                if (self._ws && !bLoginServer && self._nextAutoConnectDelay <= 0) { //表示不是主动断开（主动断开会赋值null）
                    self._nextAutoConnectDelay = 1000; //1秒后自动重连
                    Global.dispatchEvent("SOCKET_BE_CLOSE");
                    AppLog.log('1秒后自动重连');
                }
                else {
                    AppLog.log("链接断开，无任何处理！:" + self._nextAutoConnectDelay);
                    // self.checkNeedGoLoginUI()
                }
            };

            AppLog.log('连接服务' + this._address + '中...');
            if (cc.vv.LoadingTip) {
                cc.vv.LoadingTip.show();
            }


        },

        //关闭连接
        close: function (callback) {
            AppLog.log('主动 close socket!');
            if (this._ws) {
                this._ws.close()
                this.clearTimeoutReconnect();
            }
            if (callback) callback();

            this._ws = null;
            this.stopHearBeat(); //正常流程不需要，但因客户端不能主动断开socket，所以主动停止心跳
        },

        //重连
        reconnect: function () {
            AppLog.log('发起重连!');

            // this.showNetTipType(1)

            if (this.isConnect() && Global.playerData.uid != null) {
                AppLog.log('连接没断开，直接发协议3');
                cc.vv.GameManager.reqReloginUser(); //用户重登录节点服
                if (!this._hearBeatIntervalIdx) { //如果心跳不存在了，重走心跳
                    this.hearBeat();
                }
            }
            else {
                cc.vv.GameManager.reqReLogin(); //重走登录服流程
            }
        },

        //是否连接
        isConnect: function () {
            let state = (this._ws && this._ws.readyState == WebSocket.OPEN);
            if (Global.localVersion && !state && this._ws) {
                cc.log("连接状态:", this._ws.readyState);
            }

            return state;
        },

        /**
         * 网络是否可用
         */
        isNetAvailable: function () {
            if (this.isConnect() && !this._bReconnecting) {
                return true
            }
            return false
        },

        //清除超时重连
        clearTimeoutReconnect: function () {
            this._nextAutoConnectDelay = 0;
        },

        //发送消息
        //return true 发送成功 反之发送失败
        send: function (msgDic, isNotShowShield = false) {
            if (this.isConnect()) {

                //是重连状态，而且是需要提示操作断开的消息
                if (this._bReconnecting && cc.vv.NetCacheMgr && msgDic && cc.vv.NetCacheMgr.isMsgIdNeedPop(msgDic.c)) {
                    this.showNetErrorUI(msgDic.c)
                    return
                }

                if (msgDic != null && (typeof (msgDic) == 'string')) {
                    msgDic = JSON.parse(msgDic);
                    if (msgDic.c == null) {
                        AppLog.warn('The msg msgDic is lost cmd');
                        return false;
                    }
                }
                msgDic.c_ts = new Date().getTime(); //时间戳毫秒级别
                // 协议1加入加密验证
                if (msgDic.c == MsgId.LOGIN && Global.isNative()) {
                    msgDic.x = md5(msgDic.c_ts.toString() + "hero888");
                }
                msgDic.c_idx = this._idx++  //客户端记录的消息序号
                if (Global.playerData.uid) msgDic.uid = Global.playerData.uid;
                let lanVal = this.getProjectLan()
                if (lanVal) {
                    msgDic.language = lanVal
                }

                //打印发送日子
                if (!msgDic.cache) this.printNetLog("Send", msgDic)

                var bodyData = this.pack(JSON.stringify(msgDic)); //实际是返回一个uint8Array
                var headData = this.generateHead(bodyData);
                var uint8Array = this.linkHeadBody(headData, bodyData)
                this._ws.send(uint8Array);
                uint8Array = null; //释放对象

                if (!isNotShowShield && cc.vv.LoadingTip) {
                    cc.vv.LoadingTip.showNetErrorTip(true);
                }
                return true
            }
            else {
                //AppLog.warn('The WebSocket is not connected!');

                this.showNetErrorUI(msgDic.c)

            }
            return false
        },

        /**
         * 
         * @returns 当前设置的语言
         */
        getProjectLan: function () {
            return Global.language
        },

        /**
         * 打印网络日志
         * @param {} logType 
         * @param {*} msgDic 
         */
        printNetLog: function (logType, msgDic) {
            if (Global.localVersion && msgDic.c != 11) {
                let str = JSON.stringify(msgDic);
                cc.log(logType + ": ", str);
            }
        },




        //发送Http请求
        //timeout:10000默认。表示10s超时
        requestHttp: function (path, data, handler, extraUrl, type = "GET", bAllowCache = true, timeout = 10000) {
            this._Http.sendReq(path, data, handler, extraUrl, type, bAllowCache, timeout)
        },

        //数据打包
        pack: function (msgDic) {
            var bodyData = this._msgPack.encode(msgDic);
            return bodyData;
        },

        generateHead: function (bodyData) {
            var msgLen = bodyData.length;
            var len = Global.jsToCByShort(msgLen);
            var time = Global.jsToCByInt(Math.floor(this._curtime / 1000)); //毫秒转秒
            var checkSum = this.getCheckSum(bodyData, msgLen);

            var headData = "" + len + checkSum + time;
            return headData;
        },

        linkHeadBody: function (headData, bodyDataBuf) {
            var headLen = headData.length;
            var bodyLen = bodyDataBuf.length;
            var uint8Array = new Uint8Array(headLen + bodyLen);
            for (var i = 0; i < headLen; i++) {
                uint8Array[i] = headData.charCodeAt(i)
            }
            for (var i = 0; i < bodyLen; i++) {
                uint8Array[headLen + i] = bodyDataBuf[i];
            }
            return uint8Array
        },

        getCheckSum: function (bodyData, msgLen) {
            var src = '';
            var len = msgLen;
            if (len < 128) {
                src = Global.srcSum(bodyData, len);
            }
            else {
                src = Global.srcSum(bodyData, 128);
            }
            return Global.jsToCByShort(src)
        },

        //刷新时间
        updateTimer: function (delta) {
            if (!this._address) return
            this._curtime += delta;
            if (this._address.length > 0 && this._hearBeatIntervalIdx && ((this._curtime - this._lastHearBeatTime) > (this._hearBeatInterval + this._hearBeatTimeout))) { //超时,断线重连
                AppLog.log('【超时重连】当前时间:' + this._curtime + '上次时间:' + this._lastHearBeatTime);
                // StatisticsMgr.httpReport(StatisticsMgr.HTTP_NET_TIMEOUT)
                this._bReconnecting = true
                this.reconnect();
                this._lastHearBeatTime = this._curtime;
                return;
            }

            //自动连接
            this._nextAutoConnectDelay -= delta;
            if (this._nextAutoConnectDelay == 0) { //没连接上，才会重连
                this._autoConnectCount++;
                AppLog.log('【自动重连次数】次数:' + this._autoConnectCount + '总次数:' + this._autoConnectCountMax);
                if (this._autoConnectCount >= this._autoConnectCountMax) {


                    //网络断开提示
                    this.showNetErrorUI()
                }
                else {
                    AppLog.log('【自动重连】剩余时间:' + this._nextAutoConnectDelay);
                    this.reconnect();
                }
            }
            else {
                this._curReplyInterval += delta;
            }
        },

        //网络断开展示
        showNetErrorUI: function (msgid) {

            let bPlaying = false
            if (cc.vv.NetCacheMgr) {
                bPlaying = cc.vv.NetCacheMgr.isPlayingGame()
            }
            if (bPlaying) {
                this.showNetTipType(2)
                // //TODO游戏内断网退出到大厅其实体验不好
                // //先按需求做吧
                // let bHasCacheHall = cc.vv.NetCacheMgr.isCacheHall()
                // if(bHasCacheHall){
                //     //如果大厅缓存了数据
                //     this.kickToHall()
                // }
                // else{
                //     //在游戏内，没有缓存大厅提示重联
                //     this.showNetTipType(2)
                // }


            }
            else {
                //在大厅中就不给提示
                //是否在需要提示断开的列表中
                let bInNeddTip = cc.vv.NetCacheMgr.isMsgIdNeedPop(msgid)
                if (bInNeddTip) {
                    this.showNetTipType(2)
                }
            }

        },

        //网络提示类型
        showNetTipType: function (showType) {
            let self = this
            if (showType == 1) {
                //显示小的网络图标
                if (cc.vv.LoadingTip) {
                    cc.vv.LoadingTip.showNetErrorTip()
                }

            }
            else if (showType == 2) {
                //显示大的网络提示
                let url = 'CashHero/prefab/network_error'
                cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
                    if (!err) {
                        cc.vv.LoadingTip.hide();
                        let curScene = cc.director.getScene()
                        let old = curScene.getChildByName('network_error')
                        if (!old) {
                            let node = cc.instantiate(prefab);
                            node.parent = curScene;
                            let endCall = function () {
                                self.reconnect()
                            }
                            node.getComponent('NetworkTip').showUI(endCall)

                        }
                    }
                })
            }
        },

        hideNetTip: function () {
            cc.vv.LoadingTip.hide();
            let curScene = cc.director.getScene()
            let old = curScene.getChildByName('network_error')
            if (old) {
                old.destroy()
            }
        },

        //踢出游戏到大厅
        kickToHall: function () {


            let sureCall = function () {
                cc.vv.EventManager.emit(EventId.ENTER_HALL)
            }
            cc.vv.AlertView.show(cc.vv.Language.login_fail_again, sureCall)
        },

        checkNeedGoLoginUI: function () {
            let bInHallPreloading = false
            if (cc.director.getScene().name == Global.SCENE_NAME.LOGIN) {
                bInHallPreloading = true
            }
            if (bInHallPreloading) {
                cc.vv.GameManager.goBackLoginScene()
            }

        },

        //心跳
        hearBeat: function () {
            if (this.isConnect()) { //CONNECTING=0 OPEN=1 CLOSING=2 CLOSED=3
                this.stopHearBeat();
                this.registerMsg(MsgId.HEARTBEAT, this.pong.bind(this));

                this._lastHearBeatTime = this._curtime;
                this._hearBeatIntervalIdx = setInterval(this.ping.bind(this), this._hearBeatInterval);
            }
            else {
                AppLog.warn('未连接到websocket，无需发心跳！');
            }
        },

        //停止心跳
        stopHearBeat: function () {
            if (this._hearBeatIntervalIdx) {
                clearInterval(this._hearBeatIntervalIdx);
                this._hearBeatIntervalIdx = null;

                this.unregisterMsg(MsgId.HEARTBEAT);

                this._curReplyInterval = 0.0;
                this._lastReplyInterval = 520; //表示网络差
            }
        },

        //ping心跳(发送)
        ping: function () {
            this._curReplyInterval = 0.0;
            this.send({ 'c': MsgId.HEARTBEAT }, true);
        },

        //pong心跳（接收）
        pong: function () {
            this._lastHearBeatTime = this._curtime;

            var filter = 0.2; //协调参数，防止因某个回复延迟导致变动太大
            this._lastReplyInterval = this._lastReplyInterval * filter + this._curReplyInterval * (1 - filter);

            //心跳返回延迟较大
            if (this._curReplyInterval > 500) {
                setTimeout(this.ping.bind(this), 2 * 1000); //2秒再次发起心跳,检测网络状况
            }
        },

        //网络信号延迟时间间隔
        getNetworkInterval: function () {
            return this._lastReplyInterval;
        },

        //网络信号强弱等级(分4级别：0无信号 1弱 2有延迟 3很好)
        getNetworkLevel: function () {
            var networkLv = 0;
            if (this._lastReplyInterval <= 100) {
                networkLv = 3;
            }
            else if (this._lastReplyInterval <= 500) {
                networkLv = 2;
            }
            else if (this._lastReplyInterval <= 1000) {
                networkLv = 1;
            }
            return networkLv;
        },

        // 请求数据并且进行缓存(通过)
        sendAndCache(parm, isNotShowShield = true, cache = false) {
            // 获取缓存对象
            let cacheObj = this.getCacheObj(parm);
            // 如果不存在则创建一个
            if (!cacheObj) {
                // 构建缓存对象
                cacheObj = { parm: Global.copy(parm) };
                // 放入缓存池
                this.cacheList.push(cacheObj);
                // 定义缓存处理
                cacheObj.callback = (msg) => {
                    if (msg.code != 200) return;
                    if (msg.spcode && msg.spcode > 0) return;
                    // 确定请求ID是否一直
                    if (cacheObj.c_idx == msg.c_idx) {
                        // cc.log("更新缓存包", msg);
                        cacheObj.msg = Global.copy(msg);
                    }
                }
                // 注册缓存处理函数
                this.registerMsg(cacheObj.parm.c, cacheObj.callback, this, true);
            }
            // 记录当前请求ID
            cacheObj.c_idx = this._idx;
            if (cache) {
                parm.cache = 1;
                this.cacheIdxList.push(cacheObj.c_idx);
            }
            // 发送请求
            this.send(parm, isNotShowShield)
            // 查看缓存模拟一次缓存回包
            if (cacheObj.msg) {
                // 开始缓存
                if (!Global.isNative()) {
                    cc.log("%c cache(%d): %o", "background: rgb(51, 255, 102);color:#9932cd;font-weight:bold;", cacheObj.c_idx, cacheObj.msg);
                }
                cacheObj.msg.c_idx = -1;
                this.handleMsg(cacheObj.msg);
            }
        },
        // 在缓存中获取数据
        getMsgInCache(parm) { },
        // 获取缓存对象
        getCacheObj(parm) {
            for (const _cacheObj of this.cacheList) {
                // 判断是否相等
                if (this.isObjectValueEqual(parm, _cacheObj.parm)) {
                    return _cacheObj;
                }
            }
            return null;
        },
        // 判断两个对象是否相等
        isObjectValueEqual(a, b) {
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);
            // 判断key数量是否一直
            if (aProps.length != bProps.length) {
                return false;
            }
            // 判断值得内容是否一直
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i]
                var propA = a[propName]
                var propB = b[propName]
                if ((typeof (propA) === 'object')) {
                    if (this.isObjectValueEqual(propA, propB)) {
                        return true
                    } else {
                        return false
                    }
                } else if (propA !== propB) {
                    return false
                }
            }
            return true
        },
        // 判断是否存在缓存了
        hasCache(parm) {
            let cacheObj = this.getCacheObj(parm);
            if (cacheObj && cacheObj.msg) {
                return true;
            }
            return false;
        },
        // 进行缓存
        cache(parm) {
            if (!this.hasCache(parm)) {
                this.sendAndCache(parm, true, true);
            }
        }


    },
});
