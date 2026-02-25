cc.Class({
    extends: require("NetManager"),
    statics: {
        /**
         * overwrite
         * @returns 当前设置的语言
         */
        getProjectLan: function () {
            let val
            if (cc.vv.i18nManager) val = cc.vv.i18nManager.getConfig().id;

            return val
        },
        //overwrite
        printNetLog: function (logType, msgDic) {
            if (Global.localVersion && msgDic.c != 11) {
                if (msgDic.c == 245) {
                    if (logType == "Send") {
                        cc.log("%c %s %o", "background: rgb(153,102,255);color:#fff;font-weight:bold;", `report >> ${msgDic.act}`, msgDic.ext);
                    }
                    return;
                }
                let color = "background: rgb(50,154,207);color:#fff;font-weight:bold;"
                if (logType == "Receive") {
                    color = "background: rgb(0,99,0);color:#fff;font-weight:bold;"
                }
                let str = JSON.stringify(msgDic);
                if (Global.isNative()) {
                    cc.log(logType + ": ", str);
                } else {
                    if (msgDic.c_idx >= 0) {
                        cc.log("%c %s(%d): %o", color, `[${msgDic.c}] ` + logType, msgDic.c_idx, msgDic);
                    } else {
                        if (msgDic.c_idx == undefined) {
                            color = "background: rgb(255,102,255);color:#fff;font-weight:bold;"
                            logType = "Notification"
                            cc.log("%c %s: %o", color, `[${msgDic.c}] ` + logType, msgDic);
                        }
                    }
                }
            }
        },
        //网络断开展示
        showNetTipType: function (showType) {
            let self = this
            if (showType == 1) {
                //显示小的网络图标
                if (cc.vv.SceneMgr) {
                    let curName = cc.vv.SceneMgr.GetCurSceneName() //项目需求：在启动和大厅加载界面不显示
                    if (curName != Global.SCENE_NAME.LAUNCH && curName != Global.SCENE_NAME.HALL_PRELOAD) {
                        if (cc.vv.LoadingTip) {
                            cc.vv.LoadingTip.showNetErrorTip()
                        }
                    }
                }
            }
            else if (showType == 2) {
                //显示大的网络提示
                let url = 'BalootClient/BaseRes/prefabs/network_error'
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
        //处理常用错误码
        handleCommonErrorCode: function (errorCode, msg) {
            switch (errorCode) {
                case 415: //需要重新登录
                    cc.vv.FloatTip.show(___("重连中..."));
                    cc.vv.GameManager.reqReLogin(); //用户重登录登录服
                    break;
                case 500:
                    cc.vv.FloatTip.show(___("网络错误"));
                    // cc.vv.AlertView.show(___("登录失败，请检查网络后再重新登录连接"), () => {
                    //     cc.vv.GameManager.reqReLogin(); //用户重登录登录服
                    // }, () => {
                    //     Global.dispatchEvent(EventId.STOP_ACTION);
                    //     cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, () => {
                    //         this.close(); //关闭网络
                    //     });
                    // });
                    break;
                case 538: //有vip限制进入游戏
                    let extVal = msg.minsvip
                    let tipsmsg = cc.js.formatStr("Upgrade your VIP level to VIP%s to enjoy the game", extVal)
                    cc.vv.AlertView.show(___(tipsmsg), () => {
                        Global.dispatchEvent("OpenCharge")
                    }, () => {

                    }, false, null, null, null, "Upgrade Now");
                    break
                case 559: //游戏维护中
                case 425:
                    let tips = ___("The game is under maintenance, please wait patiently!")
                    cc.vv.AlertView.showTips(tips, () => {

                    })
                    break
                case 560:
                    if (msg.c == MsgId.GET_NEWER_GIFT_REWARDS || msg.c == MsgId.EVENT_VIP_SIGN_REWARD) {   // 注册领取
                        cc.vv.AlertView.show(___("One more step to enjoy the game:Mobile number verify"), () => {
                            let kyc = cc.vv.UserManager.kycUrl;
                            if (kyc) {
                                cc.vv.PopupManager.addPopup("YD_Pro/prefab/PhoneBinding", {
                                    noTouchClose: true,
                                })
                            }
                        }, null, false, null, null, null, ___("Verify Now"));
                    } else {
                        cc.vv.AlertView.show(___("One more step to enjoy the game:Mobile number verify"), () => {
                            let kyc = cc.vv.UserManager.kycUrl;
                            if (kyc) {
                                cc.vv.PopupManager.addPopup("YD_Pro/prefab/PhoneBinding")
                            }
                        }, () => {

                        }, false, null, null, ___("Verify Later"), ___("Verify Now"));
                    }
                    break
                case 561:
                    cc.vv.AlertView.show(___("One more step to enjoy the game: Bank verify"), () => {
                        let kyc = cc.vv.UserManager.kycUrl;
                        if (kyc) {
                            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                                onShow: (node) => {
                                    node.getComponent("yd_charge").setURL(kyc);
                                }
                            })
                        }
                    }, () => {

                    }, false, null, null, ___("Verify Later"), ___("Verify Now"));
                    break

                case 801: //必须重启
                    cc.vv.AlertView.showTips(___("发现新版本，请点击更新按钮将游戏更新到最新的版本"), () => {
                        cc.audioEngine.stopAll();
                        cc.game.restart();
                    });
                    break;
                case 802: //房间解散后的多余操作 目前无需处理
                    break;
                case 803: //游戏维护中
                    this.no_need_reconnect = true //不需要重连了
                    Global.dispatchEvent(EventId.STOP_ACTION);
                    //
                    let curScene = cc.director.getScene()
                    if (curScene.name != Global.SCENE_NAME.LOGIN) {
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, () => {
                            this.close()
                            cc.vv.AlertView.showTips(___("系统维护期间无法登录"));
                        });
                    }
                    else {
                        this.close()
                        cc.vv.AlertView.showTips(___("系统维护期间无法登录"));
                    }
                    break;
                case 804: //金币不足
                    cc.vv.FloatTip.show(___("金币不足"));
                    if (msg.gameChangeDesk && msg.gameChangeDesk == 1) {
                        //换房成功导致的金币不足，不走804(列如：领取破产补助后依旧金币不足)
                    } else {
                        cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COINS);
                    }
                    break;
                case 211: //token无效 要重新登录
                    Global.dispatchEvent(EventId.RELOGIN);
                    cc.vv.AlertView.showTips(___("自动登录已过期，请重新登录"), () => {
                        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.LOGIN, () => {
                            this.close();
                        })
                    });
                    break;
                case 931: //房间不存在，需要重连恢复正常
                    cc.vv.GameManager.reqReLogin();
                    break;
                case 4005: //不在语聊房内,重连或者回到大厅
                    cc.vv.EventManager.emit(EventId.ENTER_HALL);
                    break
                default:
                    return false; //表示未处理
                    break;
            };
            return true; //表示已处理
        },
        // 同步请求
        asyncSend(params) {
            return new Promise((resolve, reject) => {
                // 注册监听
                let callback = (msg) => {
                    resolve(msg);
                    // 移除监听
                    cc.vv.NetManager.unregisterMsg(params.c, callback);
                }
                cc.vv.NetManager.registerMsg(params.c, callback);
                this.send(params);
            });
        }

    }
});
