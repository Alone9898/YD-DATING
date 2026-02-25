/*
** 游戏管理
** 负责处理全局消息
** 负责退出进程等接口
*/
cc.Class({
    extends: require("GameManager"),
    statics: {
        _interval_id: null,
        _showExit: false,        // 防止多次弹出退出框

        registerAllMsg: function () {
            // 添加好友请求结果
            cc.vv.NetManager.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_ADD, this.SOCIAL_FRIEND_HANDLE_ADD, this);
            // 充值成功
            cc.vv.NetManager.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
            //进入大厅
            cc.vv.EventManager.on(EventId.ENTER_HALL, this.onRcvEnterHall, this);
            //进入游戏
            cc.vv.NetManager.registerMsg(MsgId.GAME_ENTER_MATCH, this.onRcvNetEnterGame, this);


            //客户端重新刷房间信息
            cc.vv.NetManager.registerMsg(MsgId.REGET_DESKINFO, this.onRcvRefushDeskInfo, this);

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

            //同步玩家信息
            cc.vv.NetManager.registerMsg(MsgId.SYNC_PLAYER_INFO, this.onRcvNetSyncPlayerInfo, this);
            //幸运红包变化
            cc.vv.NetManager.registerMsg(MsgId.REQ_REDPACK, this.onRcvRedPackInfo, this)

            //游戏内红包
            cc.vv.NetManager.registerMsg(MsgId.CAME_REDPACK_ALLSCENE, this.onRecvInGameRedpack, this)

            //随机轮盘活动
            cc.vv.NetManager.registerMsg(MsgId.ACTIVE_LUNPAN, this.onRecvActiveLunpan, this)

            //FB绑定账号
            cc.vv.NetManager.registerMsg(MsgId.REQ_BIND_FACEBOOK, this.onRcvNetBindAccount, this);


            //邮件完成通知，随时监听
            cc.vv.NetManager.registerMsg(MsgId.TASK_FINISH_NOTICE, this.onRcvNetTaskFinishNotice, this);

            //等级任务更新通知
            cc.vv.NetManager.registerMsg(MsgId.LEVEL_UP_PARTY_UPDATE_NOTICE, this.onRcvNetLevelUpPartyUpdateNotice, this);

            //破产补助
            cc.vv.NetManager.registerMsg(MsgId.COLLECT_BREAKGRANT_COIN_NOTICE, this.COLLECT_BREAKGRANT_COIN_NOTICE, this);

            //全服公告
            cc.vv.NetManager.registerMsg(MsgId.GLOBAL_SYSTEM_NOTIFY, this.OnRcvNetSystemNotice, this);

            //fb分享成功
            cc.vv.NetManager.registerMsg(MsgId.REQ_SHARE_SUCC, this.onRcvShare, this);
            cc.vv.NetManager.registerMsg(MsgId.REQ_FRIEND_SHARE, this.onRcvShare, this);

            //进入quest
            cc.vv.NetManager.registerMsg(MsgId.REQ_QUEST_INFO, this.OnRcvNetQuestInfo, this);

            //绑定邀请码
            cc.vv.NetManager.registerMsg(MsgId.EVENT_FB_INVITE_BIND_CODE, this.OnRcvNetBindInviteCode, this);

            cc.vv.PlatformApiMgr.addCallback(this.onOpenAppByURL.bind(this), 'OpenAppUrlLink');

            cc.vv.PlatformApiMgr.addCallback(this.onPressBackCall.bind(this), 'BackPressedCallback');

            cc.vv.PlatformApiMgr.addCallback(this.onRefushFMCToken.bind(this), 'RefushFMCToken');

            cc.game.on(cc.game.EVENT_HIDE, this.onBackGround, this);
            cc.game.on(cc.game.EVENT_SHOW, this.onEnterFront, this);


            // 全局 监听按钮声音事件
            cc.vv.EventManager.on("EVENT_BTN_CLICK_SOUNDS", this.EVENT_BTN_CLICK_SOUNDS, this);
            cc.vv.EventManager.on("EVENT_BTN_CLICK_2_SOUNDS", this.EVENT_BTN_CLICK_2_SOUNDS, this);
            cc.vv.EventManager.on("EVENT_BTN_CLOSE_SOUNDS", this.EVENT_BTN_CLOSE_SOUNDS, this);

            // 跳转到商城指定栏目
            cc.vv.EventManager.on("HALL_OPEN_SHOP", this.HALL_OPEN_SHOP, this);
            // 打开私人聊天界面
            cc.vv.EventManager.on("OPEN_PRIVATE_CHAT_VIEW", this.OPEN_PRIVATE_CHAT_VIEW, this);
        },


        loginConfig: null,
        // 登录成功
        async onRcvMsgLoginUserId(msgDic) {
            if (msgDic.code === 200) {
                // 加载固定配置只加载在一次
                if (!this.loginConfig) {
                    this.loginConfig = await cc.vv.NetManager.asyncSend({ c: MsgId.GAME_CONFIG });
                }
                cc.vv.UserManager.initPlayerData(msgDic, this.loginConfig);
                //登陆成功
                cc.vv.PlatformApiMgr.KoSDKTrackEvent('af_login',JSON.stringify({uid:msgDic.uid}))
                //断线重连清理引导标志，以防卡死
                Global.dispatchEvent(EventId.ENTER_LOGIN_SUCCESS, msgDic);
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
                    let innerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //内置游戏
                    if (cc.vv.UserManager.isDownloadSubGame(gameId) || innerGame) {

                        let enterFunc = function () {
                            msgDic.deskInfo.isReconnect = true;
                            cc.vv.NetManager.dispatchNetMsg({
                                c: MsgId.GAME_RECONNECT_DESKINFO,
                                code: Global.ERROR_CODE.NORMAL,
                                gameid: msgDic.deskInfo.gameid,
                                deskinfo: msgDic.deskInfo
                            });
                        }
                        //发布后

                        if (!Global.publishMode || innerGame) {
                            enterFunc()
                        }
                        else {
                            let gameCfg = cc.vv.GameItemCfg[gameId]
                            if (gameCfg) {
                                cc.loader.downloader.loadSubpackage(gameCfg.name, (err) => {
                                    if (!err) {
                                        cc.log('加载子包成功：' + gameCfg.name)
                                        enterFunc()
                                    }
                                    else {
                                        cc.log('加载子包错误：' + gameCfg.name + ";" + err)
                                    }
                                })
                            }
                        }

                    }
                    else {
                        // 断线重连如果在游戏中，游戏没有下载，自动退出房间.
                        if (gameId) {
                            let req = { c: MsgId.GAME_LEVELROOM };
                            req.deskid = gameId;
                            cc.vv.NetManager.send(req);

                            if (Global.isIOSReview()) {
                                this.enterTS()
                            }
                            else {
                                cc.vv.EventManager.emit(EventId.ENTER_HALL);
                            }

                            let gameCfg = cc.vv.GameItemCfg[gameId]
                            if (gameCfg) {
                                let gameName = gameCfg.name;
                                cc.vv.AlertView.showTips(cc.js.formatStr(cc.vv.Language.cannot_entergame, gameName, gameName));
                            }
                        }


                    }

                }
                else {//进入大厅
                    if (loginType == Global.LoginType.APILOGIN) {
                        //api调用 登陆成功后 直接进入游戏
                        let nId = cc.vv.UserManager.getApiGameId()
                        this.sendEnterGameReq(nId)
                    }
                    else {
                        if (cc.vv.SceneMgr.CanShowHallPreLoading()) {
                            //在登录界面，预加载下资源
                            cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD);
                        }
                        else {
                            if (Global.isIOSReview()) {
                                this.enterTS()
                            }
                            // 正常断线重连不用回到大厅，就原地重连就好。
                            // 如果是fb绑定的话就要刷一下大厅
                            else {
                                let bInHall = cc.vv.SceneMgr.isInHallScene()
                                if (bInHall) {
                                    if (this._isSendFbBind) {
                                        this._isSendFbBind = null
                                        cc.vv.EventManager.emit(EventId.ENTER_HALL);
                                    }

                                }
                                else {
                                    //是否在游戏内
                                    if (cc.vv.gameData) {
                                        // 在子游戏场景但是重连数据又没在游戏内说明是在游戏内断线重连但是游戏已经结束需要返回大厅
                                        // let gameid = cc.vv.gameData.getGameId()
                                        // cc.vv.GameManager.EnterGame(gameid)
                                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD, null, Global.APP_ORIENTATION);
                                    }
                                }

                            }

                        }
                    }


                    //cc.vv.EventManager.emit(EventId.ENTER_LOGIN_SUCCESS); 
                }
            }
            else {
                this.goBackLoginScene()
            }
        },
        // 添加好友成功
        SOCIAL_FRIEND_HANDLE_ADD(msg) {
            // 提示添加成功
            // 490, --好友信息不存在
            // 495, --添加好友，错误次数过于频繁
            // 619, --您的好友数量已达上限
            // 620, --不能加自己为好友
            // 621, --对方好友数量已达上限
            // 622, --好友关系在己方已经存在了
            // 623, --不能加自己为好友
            // 623, --发送请求成功
            if (msg.code != 200) return;
            if (msg.spcode && msg.spcode > 0) {
                cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
                if (msg.spcode == 557) {
                    // 弹出设置
                    cc.vv.PopupManager.addPopup("BalootClient/Setting/PopupSetting");
                }
                return;
            }
            if (msg.friend && msg.friend.playername) {
                cc.vv.FloatTip.show(___("添加好友成功"));
            } else {
                cc.vv.FloatTip.show(___("请求成功,请等待审核"));
            }
        },
        // 充值成功
        PURCHASE_RECHARGE_SUC(msg) {
            if (msg.rewards && msg.rewards.length > 0) {
            }
        },


        // 播放按钮音效
        EVENT_BTN_CLICK_SOUNDS(args) {
            cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'btn_click', true);
        },
        EVENT_BTN_CLICK_2_SOUNDS(args) {
            cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'btn_click_2', true);
        },
        // 关闭按钮音效
        EVENT_BTN_CLOSE_SOUNDS(args) {
            // 只在大厅中生效
            if (cc.director.getScene().name == Global.SCENE_NAME.HALL) {
                cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'btn_click_close', true);
            }
        },
        // 跳转到商城指定栏目
        HALL_OPEN_SHOP(event) {
            let data = event;
            cc.vv.PopupManager.removeAll();
            let gameHallCpt = cc.director.getScene().getComponentInChildren("GameHall");
            if (gameHallCpt && gameHallCpt.pageTabbar) {
                gameHallCpt.pageTabbar.setPage(0);
            }
            let navigationPageView = cc.director.getScene().getComponentInChildren("NavigationPageView");
            if (navigationPageView) {
                navigationPageView.showPage(data.open);
            }
        },
        // 打开私人聊天界面
        OPEN_PRIVATE_CHAT_VIEW(event) {
            let data = event;
            // 判断是否要更换聊天框
            let privateChatCpt = cc.director.getScene().getComponentInChildren("PopupPrivateChatView")
            if (privateChatCpt && privateChatCpt.uid != data.uid) {
                cc.vv.PopupManager.removePopup(privateChatCpt.node);
            }
            let endPos = cc.v3(0, cc.winSize.height * -0.5);
            cc.vv.PopupManager.addPopup("BalootClient/Social/PopupPrivateChat", {
                onShow: (node) => {
                    node.position = endPos.add(cc.v3(0, -node.height));
                    cc.tween(node).to(0.2, { position: endPos }, { easing: "quadOut" }).start();
                    // TODO 设置聊天对象
                    let cpt = node.getComponent("PopupPrivateChatView");
                    cpt && cpt.init(data.uid);
                },
                onClose: (node) => {
                    let tempNode = cc.instantiate(node);
                    for (const cpt of tempNode.getComponentsInChildren(cc.Component)) {
                        if (cpt instanceof cc.Sprite || cpt instanceof cc.Label) {
                        } else {
                            cpt.enabled = false;
                        }
                    }
                    tempNode.parent = cc.find("Canvas");
                    tempNode.zIndex = 1000
                    cc.tween(tempNode)
                        .by(0.2, { y: -node.height }, { easing: "quadIn" })
                        .call(() => {
                            tempNode.destroy();
                        })
                        .start();
                },
            })
        },
        // 收到破产信息
        COLLECT_BREAKGRANT_COIN_NOTICE(msg) {
            // 记录已经破产了,在需要用钱的时候进行检测
        },
        //账号绑定消息
        onRcvNetBindAccount: function (msg) {
            let self = this
            if (msg.code === 200) {
                let loginType = msg.type
                let accountStr = "Facebook"
                if (loginType == Global.LoginType.GOOGLE_LOGIN) {
                    accountStr = "Google"
                } else if (loginType == Global.LoginType.APPLE_LOGIN) {
                    accountStr = "Apple"
                }
                let modifyData = function () {
                    //删除本地游客的token
                    Global.deleteLocal('guest_token_map')
                    if (loginType == Global.LoginType.FB) {
                        cc.vv.UserManager.setIsBindFb(true)
                    } else if (loginType == Global.LoginType.GOOGLE_LOGIN) {
                        cc.vv.UserManager.setIsBindGoogle(true)
                        cc.vv.UserManager.isbindgoogle = true;
                    } else if (loginType == Global.LoginType.APPLE_LOGIN) {
                        cc.vv.UserManager.isbindapple = true;
                    }
                    cc.vv.UserManager.setLoginType(loginType)
                    if (msg.usericon) {
                        cc.vv.UserManager.userIcon = msg.usericon
                        cc.vv.UserManager.fbicon = msg.usericon
                    }
                    if (msg.playername) {
                        cc.vv.UserManager.setNickName(msg.playername)
                    }
                    Global.saveLocal(Global.SAVE_KEY_LOGIN_TYPE, loginType);
                    //Global.saveLocal(Global.SAVE_KEY_LAST_LOGIN_TYPE, loginType);
                    //修改自动登数据-登陆方式
                    let preLoginStr = Global.getLocal(Global.SAVE_KEY_REQ_LOGIN, "{}")
                    let reloginData = JSON.parse(preLoginStr);
                    reloginData.t = loginType
                    reloginData.account = msg.account;
                    reloginData.user = msg.user;
                    reloginData.token = msg.token;
                    reloginData.accesstoken = msg.accesstoken;
                    if (msg.playername) {
                        reloginData.LoginExData = { nick: msg.playername, img: msg.usericon }
                    }
                    Global.saveLocal(Global.SAVE_KEY_REQ_LOGIN, JSON.stringify(reloginData));
                    Global.dispatchEvent("USER_INFO_CHANGE");
                    cc.vv.PopupManager.removeAll();
                }
                if (msg.spcode === 1071) {
                    //已经绑定了，就直接登陆这个FB账号
                    let sureCall = function () {
                        if (cc.vv.gameData) {
                            //如果在游戏内需要先退出游戏
                            if (cc.vv.gameData.ReqBackLobby) {
                                cc.vv.gameData.ReqBackLobby();
                            }
                            //切换账号，清理quest的零时数据
                            if (cc.vv.gameData.SetIsQuestModel) {
                                cc.vv.gameData.SetIsQuestModel(null);
                            }
                        }
                        self._isSendFbBind = true;
                        modifyData();
                        // 重新登录
                        self.reqLogin(msg.user, '', loginType, msg.accesstoken, null, msg.token);
                    }
                    let cancelCall = function () {

                    }
                    let tips = ___('你的{1}账号已经绑定过其他账号了, 继续的话将移除当前账号数据并且切换到当前{2}账号. 您是否要继续？', accountStr, accountStr)
                    cc.vv.AlertView.show(tips, sureCall, cancelCall, true)
                    return
                }
                else {
                    modifyData()
                }
                //绑定成功奖励
                Global.dispatchEvent(EventId.FB_BIND_SUCCESS, msg)
            }
        },

        // 全服公告
        OnRcvNetSystemNotice: function (msg) {
            if (msg.code == 200) {
                //收到全服公告
                let prefabPath = 'BalootClient/BaseRes/prefabs/system_notice'
                cc.loader.loadRes(prefabPath, cc.Prefab, (err, prefab) => {
                    if (!err) {
                        let canvas = cc.find("Canvas");
                        if (cc.isValid(canvas)) {
                            let old = canvas.getChildByName('system_notice')
                            if (!old) {
                                old = cc.instantiate(prefab)
                                old.parent = canvas

                            }
                            let scp = old.getComponent('system_notice')
                            scp.show(msg.message)
                        }
                    }
                })
            }
        },

        //overwrite
        _checkJoinRoomSpcode: function (msgDic) {
            let spVal = msgDic.spcode
            if (spVal) {
                if(spVal == 662){
                    cc.vv.AlertView.show(___("您的游戏还未结束,是否继续游戏"), () => {
                        cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, deskid: msgDic.deskid, gameid: msgDic.gameid }, true);
                    }, () => {
                    });
                }
                
                
                return false;
            }
            return true
        },


        /**外链打开APP */
        onOpenAppByURL: function (paramsDic) {
            // AppLog.log("GameManager.onOpenAppByURL: " + JSON.stringify(paramsDic));
            // 判断当前场景是否是游戏场景
            if (cc.vv.gameData) {
                cc.vv.FloatTip.show(___("当前游戏还未结束"))
                return;
            }
            if (paramsDic) {
                cc.vv.PlatformApiMgr.clearOpenAppUrlDataStr()
                let param = paramsDic.roomid
                // let gameid = paramsDic.gameid
                // let pwd = paramsDic.pwd
                if (param) { //有房间ID必须参数

                    //加入游戏，是否有vip限制
                    let needVip = cc.vv.UserManager.getSalonVip()
                    if(needVip > cc.vv.UserManager.svip){
                        //调往充值
                        let tipsmsg = cc.js.formatStr("Upgrade your VIP level to VIP%s to enjoy the Salon", needVip)
                        cc.vv.AlertView.show(___(tipsmsg), () => {
                            Global.dispatchEvent("OpenCharge")
                        }, () => {

                        }, false, null, null, null, "Upgrade Now");
                        return false //不可以进入
                    }

                    let array = param.split("-")
                    let roomid = array[0]
                    let gameid = array[1]
                    let pwd = array[2]
                    let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameid)
                    let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(gameid)
                    if(cc.sys.isBrowser || bNew || bInnerGame){
                        let req = { c: MsgId.FRIEND_ROOM_JOIN }
                        req.deskid = roomid
                        if (gameid) {
                            req.gameid = gameid
                        }
                        if (pwd) {
                            req.pwd = pwd
                        }
                        if (roomid) {
                            //enter room 
                            cc.vv.NetManager.send(req);
                        }
                    }
                    else{
                        //提示更新
                        let tips = cc.js.formatStr('You need to download the latest resources of 【%s】 first',cc.vv.UserConfig.getGameName(gameid))
                        cc.vv.AlertView.show(tips,()=>{
                            // this._waitgameId = data.gameid
                            cc.vv.SubGameUpdateNode.emit("check_subgame", gameid);
                            cc.vv.FloatTip.show("start download")
                        },()=>{

                        })
                    }

                    
                }
                // else {
                //     //如果不是进入房间，检查是不是绑定邀请码
                //     let code = paramsDic.code
                //     if (code) {
                //         let req = { c: MsgId.EVENT_FB_INVITE_BIND_CODE }
                //         req.code = code
                //         cc.vv.NetManager.send(req)
                //     }

                // }

            }
        },

        onRefushFMCToken:function(){
            this.updateFCMToken()
        },

        //overwrite:io冷启动的时候不能调用加入房间,等到了大厅后加入
        doEnterFrontAction: function () {
            if (Global.isIOS()) {
                let urlData = cc.vv.PlatformApiMgr.getOpenAppUrlDataStr()
                if (urlData) {
                    this.onOpenAppByURL(JSON.parse(urlData))
                }
            }
        },

        //T回大厅
        onRcvNetTickHallNotice: function (msg) {
            if (msg.code === 200) {
                cc.vv.AlertView.showTips(cc.vv.Language.user_tick_notice, function () {
                    if (cc.vv.gameData) {
                        if (cc.vv.gameData._EventId) {
                            Global.dispatchEvent(cc.vv.gameData._EventId.EXIT_GAME);
                        }
                        Global.dispatchEvent(EventId.EXIT_GAME);
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL);
                    }

                }.bind(this));
            }
        },

        jumpTo(positionId) {
            let gameHallCpt = cc.director.getScene().getComponentInChildren("GameHall");
            if (!gameHallCpt) return;
            cc.vv.PopupManager.removeAll();
            if (positionId > 100000) {              // 机台
                // 切换大页面
                gameHallCpt.pageTabbar.setPage(2);
                cc.vv.PopupManager.addPopup("BalootClient/RoomList/RoomListView", {
                    opacityIn: true,
                    onShow: (node) => {
                        let cpt = node.getComponent("RoomListView")
                        if (cpt) {
                            let gameid = positionId % 100000;
                            cpt.onInit(gameid);
                        }
                    }
                });
            } else if (positionId == 1) {       // game
                gameHallCpt.pageTabbar.setPage(2);
            }  else if (positionId == 2) {       // 好友房
                gameHallCpt.pageTabbar.setPage(1);
            } else if (positionId == 3) {       // 代理
                gameHallCpt.pageTabbar.setPage(3);
            } else if (positionId == 4) {       // Slot
                gameHallCpt.pageTabbar.setPage(2);
                // 尝试点击slot按钮
                let hallBtnSlot = cc.director.getScene().getComponentInChildren("HallSlotBtn");
                if (hallBtnSlot) {
                    hallBtnSlot.onClick();
                }
            } else if (positionId == 5) {       // bank
                gameHallCpt.pageTabbar.setPage(0);
            } else if (positionId == 6) {       // 世界聊天
                gameHallCpt.pageTabbar.setPage(4);
                // 切换到聊天界面
                let cpt = cc.director.getScene().getComponentInChildren("PageSocialView");
                if (cpt) {
                    let tabbarCpt = cpt.tabbarNode.getComponentInChildren("Tabbar");
                    if (tabbarCpt) tabbarCpt.setPage(3);
                }
            } else if (positionId == 7) {       // 每日任务
                gameHallCpt.pageTabbar.setPage(3);
                let cpt = cc.director.getScene().getComponentInChildren("PageBounsView");
                if (cpt) {
                    let tabbarCpt = cpt.tabbarNode.getComponentInChildren("Tabbar");
                    if (tabbarCpt) tabbarCpt.setPage(3);
                }

            } else if (positionId == 8) {       // 分享界面
                gameHallCpt.pageTabbar.setPage(3);
                let cpt = cc.director.getScene().getComponentInChildren("PageBounsView");
                if (cpt) {
                    let tabbarCpt = cpt.tabbarNode.getComponentInChildren("Tabbar");
                    if (tabbarCpt) tabbarCpt.setPage(4);
                    // 打开分享界面
                    let shareView = cc.director.getScene().getComponentInChildren("FBShareView");
                    if (shareView) {
                        shareView.shareBtn.node.getComponent("PopupBtnCmp").onClick();
                    }
                }
            } else if (positionId == 9) {       // 新手任务
                gameHallCpt.pageTabbar.setPage(3);
                let cpt = cc.director.getScene().getComponentInChildren("PageBounsView");
                if (cpt) {
                    let tabbarCpt = cpt.tabbarNode.getComponentInChildren("Tabbar");
                    if (tabbarCpt) tabbarCpt.setPage(0);
                }
            } else if (positionId == 10) {       // 商城 皮肤页
                gameHallCpt.pageTabbar.setPage(0);
                let navigationPageView = cc.director.getScene().getComponentInChildren("NavigationPageView");
                if (navigationPageView) {
                    navigationPageView.scheduleOnce(() => {
                        navigationPageView.showPage(3);
                    }, 0.1)
                }
            }
            else if(positionId == 11){ //游戏 - bonus
                gameHallCpt.pageTabbar.setPage(3);
                // let url = "YD_Pro/prefab/yd_bonus"
                // cc.vv.PopupManager.addPopup(url, {isWait: true, opacityIn: true })
            }else if(positionId == 11.1){//游戏 - bonus-返水
                gameHallCpt.pageTabbar.setPage(3);
                Global.dispatchEvent("Bonus_Tab",1)
                // let url = "YD_Pro/prefab/yd_bonus"
                // cc.vv.PopupManager.addPopup(url, {isWait: true, opacityIn: true ,onShow:(node)=>{
                //     node.getComponent("yd_bonus").onClickToggle1()
                // }})
            } 
            else if(positionId == 11.2){//bonus-task
                gameHallCpt.pageTabbar.setPage(3);
                Global.dispatchEvent("Bonus_Tab",2)
            }
            else if(positionId == 11.3){//bonus-login
                gameHallCpt.pageTabbar.setPage(3);
                Global.dispatchEvent("Bonus_Tab",3)
            }
            else if(positionId == 11.4){//bonus-promo
                gameHallCpt.pageTabbar.setPage(3);
                Global.dispatchEvent("Bonus_Tab",4)
            }
            else if(parseInt(positionId) == 12){  // 排行榜-12.1 12.2 12.3
                gameHallCpt.pageTabbar.setPage(2);
                cc.vv.PopupManager.addPopup("YD_Pro/rank/yd_rank", {opacityIn: true,
                    onShow: (node) => {
                        node.getComponent("yd_rank").initPage(positionId*10%12);
                    }
                })
            }
        },

        onRcvRefushDeskInfo:function(msg){
            if(msg.code == 200){
                if(cc.vv.gameData){
                    if(msg.deskFlag == 1){
                        if(msg.deskInfo){
                            msg.deskInfo.isReconnect = true;
                            cc.vv.gameData.init(msg.deskInfo,msg.gameid)
                        }   
                    }
                    
                    
                }
            }
        },

        OnRcvNetBindInviteCode: function (msg) {
            if (msg.code == 200) {
                // if (msg.spcode) {
                //     let str = ""
                //     switch (msg.spcode) {
                //         case 1455:
                //             str = "Invalid code!"
                //             break;
                //         case 1454:
                //             str = "Cannot bind subordinate users!"
                //             break
                //         case 1452:
                //             str = "Can't bind repeatedly!"
                //             break;
                //         case 1453:
                //             str = "Can't bind yourself!"
                //         default:
                //             break;
                //     }
                //     if(str){
                //         cc.vv.FloatTip.show(str)
                //     }
                //     else{
                //         cc.vv.FloatTip.show("BindCode:" + msg.spcode)
                //     }
                    
                //     return
                // }

                // cc.vv.FloatTip.show("Bind invite code success!")
            }
        },

        onPressBackCall: function () {
            //看当前是否有webview
            let webs = cc.director.getScene().getComponentsInChildren(cc.WebView)
            if(webs && webs.length>0){
                //就不显示，否则会被webview挡住
                return
            }
            let tips = cc.js.formatStr("Are you sure you want to exit %s?",cc.vv.UserConfig.getAppName())
            let sureCall = function () {
                cc.game.end();
            }
            let cancelCall = function () {

            }
            cc.vv.AlertView.show(tips, sureCall, cancelCall)
        },


        //overwrite
        //获取游戏的显示语言
        _getGameLanguage() {
            return cc.vv.i18nManager.getConfig().id;
        },


        test() {
            cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/SceneTranslate", {
                onShow: (node) => {
                    node.getComponent("SceneTranslate").toHall();
                }
            })
        },

        /**
         * overwirte
         * @returns 
         */
        getAppPackname(){
            if(cc.sys.isBrowser){
                return "com.yono.games.free"
            }
            else{
                return cc.vv.PlatformApiMgr.getPackageName()
            }
            
        }

    }
});
