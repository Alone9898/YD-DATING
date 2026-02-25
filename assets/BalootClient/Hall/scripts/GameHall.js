/**
 * 竖版大厅
 */
cc.Class({
    extends: cc.Component,
    properties: {
        pageTabbar: require("Tabbar"),
        // 房间入口界面
        gameBtnContent: cc.Node,
        // pwdPrefab: cc.Prefab,
        roomBtnPrefab: cc.Prefab,
        roomBtnBigPrefab: cc.Prefab,
        gamesScrollview: cc.ScrollView,
        // 过度界面
        // translatePrefab: cc.Prefab,
        // newGuideUserNamePrefab: cc.Prefab,
        // whatsapp
        // whatsapp: cc.Button,

        // btnPoker: cc.Button,
        // btnMore: cc.Button,

        // btnMatch: cc.Button,
    },
    onLoad() {
        // 初始化监听
        this.node.parent.name = Global.SCENE_NAME.HALL;
        Global.autoAdaptDevices(false);

        let eventListener = this.node.addComponent("EventListenerCmp");
        let netListener = this.node.addComponent("NetListenerCmp");

        // 设置动画回调
        for (const tabItem of this.pageTabbar.tabs) {
            let selectSke = tabItem.selectNode.getComponentsInChildren(sp.Skeleton)[0];
            if (selectSke) {
                selectSke.setAnimation(0, "loop_" + this.getTabbarAnimName(this.pageTabbar.tabs.indexOf(tabItem)), true);
                selectSke.setCompleteListener((tck) => {
                    if (cc.isValid(this.pageTabbar, true)) {//循环调用，可能调用的时候就已经无效了
                        if (tck.animation && tck.animation.name == "idle_" + this.getTabbarAnimName(this.pageTabbar.tabs.indexOf(tabItem))) {
                            selectSke.setAnimation(0, "loop_" + this.getTabbarAnimName(this.pageTabbar.tabs.indexOf(tabItem)), true);
                        }
                    }

                })
            }
            let unSelectSke = tabItem.unSelectNode.getComponentsInChildren(sp.Skeleton)[0];
            if (unSelectSke) {
                if (this.pageTabbar.tabs.indexOf(tabItem) == 1) {
                    unSelectSke.setAnimation(0, "loop3_" + this.getTabbarAnimName(this.pageTabbar.tabs.indexOf(tabItem)), true);
                } else {
                    unSelectSke.setAnimation(0, "loop2_" + this.getTabbarAnimName(this.pageTabbar.tabs.indexOf(tabItem)), true);
                }
            }
        }
        // 页面切换 监听
        this.pageTabbar.setChangeCallback(this.onPageTabbarChange.bind(this));
        // 接收到一个沙龙玩牌邀请
        netListener.registerMsg(MsgId.FRIEND_ROOM_BE_INVITE, this.FRIEND_ROOM_BE_INVITE, this);
        // 加入好友房间结果
        netListener.registerMsg(MsgId.FRIEND_ROOM_JOIN, this.FRIEND_ROOM_JOIN, this);
        // 匹配房间结果
        netListener.registerMsg(MsgId.GAME_ENTER_MATCH, this.GAME_ENTER_MATCH, this);
        // 沙龙房间快速坐下结果
        netListener.registerMsg(MsgId.VIP_FAST_JOIN, this.FRIEND_ROOM_JOIN, this);
        // 接受事件 打开排位赛页面
        eventListener.registerEvent("HALL_OPEN_LEAGUE", this.HALL_OPEN_LEAGUE, this)
        // 接受事件 进入游戏前
        eventListener.registerEvent("HALL_TO_GAME", this.HALL_TO_GAME, this)
        eventListener.registerEvent("OpenCharge",this.OpenCharge,this)
        eventListener.registerEvent("GAME_LIST_UPDATE",this.GAME_LIST_UPDATE,this)
        // 金币不足弹出
        eventListener.registerEvent(EventId.NOT_ENOUGH_COINS, this.NOT_ENOUGH_COINS, this)
        Global.registerEvent("EVENT_ADD_REFFER",this.onAddRefferTip,this)
        // 判断是否从游戏内出来
        this.backGameId = Global.getLocal("SAVE_FROM_SUBGAME_ID", 0);
        // 判断从游戏内回来的游戏类型
        this.backGameType = Global.getLocal("SAVE_FROM_SUBGAME_ROOM_TYPE", 0);
        this.backNeedCoin = Global.getLocal("SUBGAME_GOLD_SHORTAGE", 0);
        // 返回大厅操作
        this.scheduleOnce(() => {
            // 移除记录
            Global.saveLocal("SAVE_FROM_SUBGAME_ID", "0");
            Global.saveLocal("SAVE_FROM_SUBGAME_ROOM_TYPE", "0");
            Global.saveLocal("SUBGAME_GOLD_SHORTAGE", "0");
        }, 0);
        //同步金币请求
        cc.vv.NetManager.send({ c: MsgId.SYNC_COIN }, true);
        // 客服连接
        // this.whatsapp.node.on("click", () => {
        //     cc.vv.PlatformApiMgr.openURL(cc.vv.UserManager.whatapplink);
        // })
        // this.btnPoker.node.on("click", () => {
        //     cc.vv.PopupManager.addPopup("BalootClient/Hall/GameBtnListView", {
        //         bottomIn: true,
        //         bottomOut: true,
        //         onShow: (node) => {
        //             node.getComponent("GameBtnList").onInit(2);
        //         },
        //     })
        // })
        // this.btnMore.node.on("click", () => {
        //     cc.vv.PopupManager.addPopup("BalootClient/Hall/GameBtnListView", {
        //         bottomIn: true,
        //         bottomOut: true,
        //         onShow: (node) => {
        //             node.getComponent("GameBtnList").onInit(3);
        //         }
        //     })
        // })

        // 比赛
        // this.btnMatch.node.on("click", () => {
        //     cc.vv.PopupManager.addPopup("BalootClient/RoomList/prefabs/game_match", {
        //         bottomIn: true,
        //         bottomOut: true,
        //         onShow: (node) => {
        //             node.getComponent("RoomMatch").open();
        //         }
        //     })
        // })
        // 初始化游戏入口
        let nGame = 0
        for (const info of cc.vv.UserManager.gameList) {
            if (info.ord < 0 || info.ord > 100) continue;
            let roomBtnNode = null;
            // if (info.ord == 1) {
            //     roomBtnNode = cc.instantiate(this.roomBtnBigPrefab);
            // } else {
                roomBtnNode = cc.instantiate(this.roomBtnPrefab);

            // }
            roomBtnNode.parent = this.gameBtnContent;
            let roomTypeCpt = roomBtnNode.getComponent("RoomTypeBtn");
            roomTypeCpt.gameid = info.id;
            roomTypeCpt.updateView();
            nGame += 1
        }

        //slot是否开放
        let nSlots = cc.vv.UserManager.slotsList.length || 0
        let btnSlots = cc.find("PageContent2/PageHall/Games/view/content/content/btn_hall_game_slots",this.node)
        if(btnSlots){
            btnSlots.active = nSlots > 0
        }
        

        //是否需要添加一个comesoon
        if(nGame%2 == 0){
            let roomBtnNode = cc.instantiate(this.roomBtnPrefab);
            roomBtnNode.parent = this.gameBtnContent;
            let roomTypeCpt = roomBtnNode.getComponent("RoomTypeBtn");
            roomTypeCpt.gameid = 9999;
            roomTypeCpt.updateView();
        }

        this.GAME_LIST_UPDATE(); //游戏入口排序


        this.gamesScrollview.content.getComponent(cc.Layout).updateLayout()
        this.gameBtnContent.getComponent(cc.Layout).updateLayout()

    },
    start() {
        // cc.vv.NetManager.send({ c: MsgId.REQ_UPDATE_LEAGUE_EXP });
        if (this.backGameId && this.backGameId > 0) {
            // 判断是否是好友房出来的
            if (this.backGameType && this.backGameType == 5) {
                this.pageTabbar.setPage(1);
            } else {
                //从机台出来进入机台大厅
                let bSlot = this.backGameId > 600 || this.backGameId == 419
                if (bSlot) {
                    let hallSlotbtn = this.node.getComponentInChildren("HallSlotBtn")
                    if (hallSlotbtn) {
                        hallSlotbtn.node.emit("click")
                    }
                }
                // 判断出来的游戏类型
                let type = 1;
                for (const item of cc.vv.UserManager.gameList) {
                    if (item.id == this.backGameId) {
                        type = item.ctype;
                        break;
                    }
                }
                if (Global.isDurakApp() || Global.isYDApp()) {
                    type = 0;
                }
                console.log(this.backGameId, type);
                for (let i = 0; i < this.gameBtnContent.childrenCount; i++){
                    let node = this.gameBtnContent.children[i];
                    let roomTypeBtn = node.getComponent("RoomTypeBtn");
                    if(roomTypeBtn){
                        if(roomTypeBtn.gameid == this.backGameId){
                            roomTypeBtn.showExitState(true);
                            this.scheduleOnce(()=>{
                                let offPos = cc.vv.UserManager.getHallOffset() || this.gamesScrollview.node.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0,node.height)))
                                this.gamesScrollview.scrollToOffset(cc.v2(0, Math.abs(offPos.y)))
                            },0)
                        } else {
                            roomTypeBtn.showExitState(false);
                        }
                    }
                }
                if (type == 2) {
                    // // 弹出游戏列表弹窗
                    // cc.vv.PopupManager.addPopup("BalootClient/Hall/GameBtnListView", {
                    //     bottomIn: true,
                    //     bottomOut: true,
                    //     onShow: (node) => {
                    //         node.getComponent("GameBtnList").onInit(2);
                    //     },
                    // })

                } else if (type == 3) {
                    // 弹出游戏列表弹窗
                    cc.vv.PopupManager.addPopup("BalootClient/Hall/GameBtnListView", {
                        bottomIn: true,
                        bottomOut: true,
                        onShow: (node) => {
                            node.getComponent("GameBtnList").onInit(3);
                        },
                    })
                }
            }
        } else {
            //登陆来的大厅
            let uid = cc.vv.UserManager.uid
            cc.vv.PlatformApiMgr.KoSDKTrackEvent('reach_lobby_ui', JSON.stringify({ game_uid: uid }))
        }
        // 播放背景音乐
        this.scheduleOnce(() => {
            let name = "bgm"
            // let nDay = new Date()
            // if(nDay.getDate() % 2 == 0){
            //     name = "bgm1"
            // }
            cc.vv.AudioManager.playBgm("BalootClient/BaseRes/", name, true, null, null, true)

            
            StatisticsMgr.httpAll()
        }, 1)
        // 开始处理广播
        cc.vv.BroadcastManager.run();
        // 统计上报
        StatisticsMgr.reqReport(StatisticsMgr.REQ_ENTER_HALL, JSON.stringify({
            novice: cc.vv.UserManager.novice,
            charmpack: cc.vv.UserManager.charmpack,
        }));
        // // !!!!!!!! 其他弹窗 权重不要超过1000 
        // if (cc.vv.UserManager.novice > 0) {
        //     let url = "BalootClient/NewerGuide/PopupNewGuideUserName"
        //     cc.vv.PopupManager.addPopup(url, {
        //         weight: 998,
        //         noCloseHit: true,
        //         noTouchClose: true,
        //         isWait: true,
        //         scaleIn: true,
        //     })
        //     cc.vv.UserManager.novice = 0;
        // }
        // 提示新APP弹窗
        if (!!cc.vv.UserManager.newapp) {
            //是否隔天
            if(Global.needPopDayTips('newappurl')){
                cc.vv.PopupManager.addPopup("BalootClient/NewAppHint/NewAppHint", {
                    weight: 997,
                    isWait: true,
                    scaleIn: true,
                    onShow: (node) => {
                        node.getComponent("NewAppHintView").onInit(cc.vv.UserManager.newapp);
                        cc.vv.UserManager.newapp = null;
                    }
                })
            }
            
        }
        // 新手1000美金礼包
        if (cc.vv.UserManager.charmpack ) {
            cc.vv.PopupManager.addPopup("BalootClient/NewComerGift/PopupNewComerGift", {
                weight: 996,
                isWait: true,
                noCloseHit: true,
                noTouchClose: true,
                scaleIn: true,
                onShow: (node) => {
                    node.getComponent("NewerGiftView").setCoin(cc.vv.UserManager.charmpack)
                    cc.vv.UserManager.charmpack = 0;
                }
            })
        }
        // rewards today
        let todayrewards = cc.vv.UserManager.todayrewards;
        let win = 0;
        for (let key in todayrewards){
            win += todayrewards[key]
        }
        if(win > 0 && !cc.vv.UserManager.hasPopRewardToday){
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_reward_today", {
                weight: 993,
                isWait: true,/* scaleIn: true,*/
                onShow: (node) => {
                    node.getComponent("yd_reward_today").updateView();
                }
            });
            cc.vv.UserManager.hasPopRewardToday = true;
        }
        // 活动弹窗
        if (cc.vv.UserManager.notice && !cc.vv.UserManager.hasPopNotice) {
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_activity", {
                weight: 992,
                isWait: true,/* scaleIn: true,*/
                onShow: (node) => {
                    node.getComponent("yd_activity").updateView(cc.vv.UserManager.notice)
                    // cc.vv.UserManager.notice = null;
                }
            });
            cc.vv.UserManager.hasPopNotice = true;
        }

        //签到弹窗
        if (cc.vv.UserManager.vipsign == 0) { //需要签到
            cc.vv.PopupManager.addPopup("BalootClient/PopupSign/PopupSign", {weight: 995,isWait: true, scaleIn: true });
            cc.vv.UserManager.vipsign = 1;
        }

        //luckyspin
        // cc.vv.UserManager.popLuckySpin = 1
        if(cc.vv.UserManager.popLuckySpin == 1){
            cc.vv.PopupManager.addPopup("BalootClient/PopLuckySpin/PopLuckySpin", {weight: 994,isWait: true, scaleIn: true });
        }

        // // 提醒好评弹窗
        // if (cc.vv.UserManager.rate > 0) {
        //     cc.vv.PopupManager.addPopup("BalootClient/LikeReminder/LikeReminder", { isWait: true, scaleIn: true });
        //     cc.vv.UserManager.rate = 0;
        // }
        //新增代理
        let addNum = cc.vv.UserManager.getAddInvite()
        if(addNum){
            cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferAddTips", {
                isWait: true,
                scaleIn: true,
                onShow: (node) => {
                    node.getComponent("ReferAddTips").setInfo(addNum)
                }
            });
        }
        //补单
        cc.vv.PayMgr.doReplaceOrder()

        //检查是否有外链数据传入
        this.checkOpenUrlAction()

        //代理绑定
        this.chekBindCodeAction()
    },
    onDestroy() {
        // 停止广播处理
        // cc.vv.BroadcastManager.stop();
    },
    getTabbarAnimName(index) {
        let animName = "";
        if (index == 0) {
            animName = "shop";
        } else if (index == 1) {
            animName = "game";
        } else if (index == 2) {
            animName = "events";
        } else if (index == 3) {
            animName = "social";
        }
        // else if (index == 4) {
        //     animName = "social";
        // }
        return animName;
    },
    // 切换页面处理
    onPageTabbarChange(index, item, items) {
        // 点击音效
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
        // 做动画
        let skes = item.selectNode.getComponentsInChildren(sp.Skeleton);
        for (const ske of skes) {
            if (ske.node.active) {
                ske.setAnimation(0, "idle_" + this.getTabbarAnimName(index), false);
            }

        }
        // 打开商城 默认打开Diamond页面
        if (index == 0) {
            let navigationPageView = cc.director.getScene().getComponentInChildren("NavigationPageView");
            if (navigationPageView) {
                navigationPageView.showPage(0);
            }
        }
        // if (index == 1) {
        //     let cpt = item.pageNode.getComponentInChildren("LeftMenuCpt");
        //     if (cpt) {
        //         cpt.show = false;
        //     }
        // }

        if (index == 4) {
            // let isShowZC = Global.getLocal("IS_SHOW_ZC");
            // if (!isShowZC) {
            //     cc.vv.PopupManager.addPopup("BalootClient/Setting/prefabs/PopupZCService", { scaleIn: true });
            //     return;
            // }
        }
    },
    // 收到一个沙龙玩牌邀请
    FRIEND_ROOM_BE_INVITE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        // 询问玩家是否接受
        cc.vv.PopupManager.addPopup("BalootClient/GameInvite/PopupBeInvite", {
            scaleIn: true,
            noTouchClose: true,
            noCloseHit: true,
            onShow: (node) => {
                let cpt = node.getComponent("BeInviteView");
                cpt && cpt.onInit(msg);
            }
        });
        // cc.vv.AlertView.show(___("快速对决,我在房间{1}等你,准备展示实力了吗?", msg.deskid), () => {
        //     cc.vv.NetManager.send({ c: MsgId.SALON_INVITE_APPLY, type: 1, idx: msg.idx, from: msg.from, gameid: msg.gameid, deskid: msg.deskid });
        //     cc.vv.NetManager.send({
        //         c: MsgId.FRIEND_ROOM_JOIN,
        //         gameid: msg.gameid,
        //         deskid: msg.deskid
        //     });
        // }, () => {
        //     cc.vv.NetManager.send({ c: MsgId.SALON_INVITE_APPLY, type: 0, idx: msg.idx, from: msg.from, gameid: msg.gameid, deskid: msg.deskid });
        // }, false)
    },
    // 加入好友房间结果
    FRIEND_ROOM_JOIN(msg) {
        if (msg.spcode) {
            if (msg.spcode == 751) {
                if (!msg.pwd) {
                    cc.vv.PopupManager.addPopup("BalootClient/salon/RoomFriendPwd", {
                        opacityIn: true,
                        onShow: (node) => {
                            let pwdCpt = node.getComponent("RoomFriendPwd");
                            pwdCpt.setCallback((pwd, closeFunc) => {
                                if (pwd.length >= 4) {
                                    cc.vv.NetManager.send({
                                        c: MsgId.FRIEND_ROOM_JOIN,
                                        gameid: msg.gameid,
                                        deskid: msg.deskid,
                                        pwd: pwd,
                                    });
                                }
                            });
                        }
                    });
                } else {
                    cc.vv.FloatTip.show(___("密码错误"));
                }
            } else {
                if(msg.spcode == 804){
                    cc.vv.AlertView.show(___("金币不足"), () => {
                        cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
                    }, () => {
                    }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
                } else {
                    cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
                }
                // cc.vv.FloatTip.show(___("进入房间失败"));
            }
        }
        
    },
    // 匹配房间结果 
    GAME_ENTER_MATCH(msg) {
        if (msg.code && msg.code == 804) {
            // cc.vv.PopupManager.addPopup("BalootClient/CoinCharge/CoinCharge", { opacityIn: true })
            cc.vv.AlertView.show(___("金币不足"), () => {
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            }, () => {
            }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
        }

        if(msg.code == 200){
            let off = this.gamesScrollview.getScrollOffset();
            cc.vv.UserManager.setHallOffset(off);
        }
    },
    // 接受事件 打开排位赛页面
    HALL_OPEN_LEAGUE(event) {
        cc.vv.PopupManager.removeAll();
        this.pageTabbar.setPage(1);
    },
    // 更新游戏入口顺序
    GAME_LIST_UPDATE() {
        // 进行排序
        let isOpen = (gameid) => {
            for (const _item of cc.vv.UserManager.gameList) {
                if (_item.id == gameid || gameid == 9999) {
                    return true;
                }
            }
            return false;
        }
        // 更新状态
        for (let i = 0; i < this.gameBtnContent.children.length; i++) {
            const node = this.gameBtnContent.children[i];
            let roomTypeBtn = node.getComponent("RoomTypeBtn")
            if (roomTypeBtn) {
                node.active = isOpen(roomTypeBtn.gameid);
            }
        }
        let getOrd = (node) => {
            let ord = 1000;
            let roomTypeCpt = node.getComponent("RoomTypeBtn");
            if (roomTypeCpt) {
                let gameid = node.getComponent("RoomTypeBtn").gameid;
                for (const _item of cc.vv.UserManager.gameList) {
                    if (_item.id == gameid) ord = _item.ord;
                }
            } else if (node.getComponent("HallSlotBtn")) {
                ord = 10
            }
            //  else if (node == this.btnPoker.node) {
            //     ord = 98
            // } else if (node == this.btnMore.node) {
            //     ord = 99
            // }
            return ord;
        }
        this.gameBtnContent.children.sort((a, b) => {
            return getOrd(a) - getOrd(b);
        });
    },
    // 接受事件 服务器已经进入游戏
    HALL_TO_GAME() {
        let bInHall = cc.vv.SceneMgr.isInHallScene()
        if(bInHall){
            cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/ToGameLoading", { noCloseHit: true, opacityIn: true ,parent:cc.find("Canvas")});
        }
        
    },

    //检查是不是外部链接动作
    checkOpenUrlAction: function () {
        let urlData = cc.vv.PlatformApiMgr.getOpenAppUrlDataStr()
        if (urlData) {
            cc.vv.GameManager.onOpenAppByURL(JSON.parse(urlData))
        }
    },

    //检查代理绑定关系
    chekBindCodeAction:function(){
        if(cc.vv.UserManager.invit_uid){
            //已经绑定了
            return;
        }
        let code = cc.vv.PlatformApiMgr.GetChannelStr()
        if (code) {
            let req = { c: MsgId.EVENT_FB_INVITE_BIND_CODE }
            req.code = code
            var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
            if(localAppVersion>129){
                req.cx = cc.vv.PlatformApiMgr.GetChannelExStr()
            }
            cc.vv.NetManager.send(req)
        }
    },

    NOT_ENOUGH_COINS() {
        // cc.vv.PopupManager.addPopup("BalootClient/CoinCharge/CoinCharge", {
        //     opacityIn: true,
        // })
        cc.vv.AlertView.show(___("金币不足"), () => {
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
        }, () => {
        }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
    },

    onAddRefferTip(data){
        let val = data.detail
        if(val){
            cc.vv.PopupManager.addPopup("YD_Pro/Refer/ReferAddTips", {
                isWait: true,
                scaleIn: true,
                onShow: (node) => {
                    node.getComponent("ReferAddTips").setInfo(val)
                }
            });
        }
    },

    OpenCharge(){
        let btn_customer = cc.find("safeview/UserinfoBar/coin/btn_add",this.node)
        if(btn_customer){
            btn_customer.emit("click")
        }
    },


    update(dt){
        if(!this._updateIntv) this._updateIntv = 0
        this._updateIntv += dt
        if(this._updateIntv>1){ //1 去检测一次
            this._updateIntv = 0
            if(cc.vv.GameManager){
                cc.vv.GameManager.updateFCMToken()
            }
           
        }
        
        
    },


    // test() {
    //     let rewards = [
    //         { type: 1, count: 100000000 },
    //         { type: 43, img: "avatarframe_2003", count: 1, days: 7 },
    //         { type: 43, img: "avatarframe_2002", count: 1, days: 7 },
    //         { type: 25, count: 1500 }]
    //     Global.RewardFly(rewards, null);
    // },

    // testBroadcast() {
    //     // let rewards = [
    //     //     { type: 1, count: 100000000 },
    //     //     { type: 43, img: "avatarframe_2003", count: 1, days: 7 },
    //     //     { type: 43, img: "avatarframe_2002", count: 1, days: 7 },
    //     //     { type: 25, count: 1500 }]
    //     // cc.vv.BroadcastManager.addBroadcast({
    //     //     content: "1231231231阿斯顿发撒的发生的发斯蒂芬asdf",
    //     //     rewards: rewards,
    //     //     direction: cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR ? 2 : 1,
    //     //     level: 10,
    //     // })

    //     let msg = {
    //         "receive": {
    //             "uid": 5607,
    //             "avatarframe": "avatarframe_0",
    //             "charm": 628522000,
    //             "level": 2,
    //             "usericon": "8",
    //             "svip": 0,
    //             "playername": "11"
    //         },
    //         "c": 1042,
    //         "code": 200,
    //         "send": {
    //             "uid": 11110,
    //             "avatarframe": "avatarframe_1002",
    //             "charm": 1300,
    //             "level": 2,
    //             "usericon": "8",
    //             "svip": 0,
    //             "playername": "123"
    //         },
    //         "info": {
    //             "title": "kiss",
    //             "charm": 1000,
    //             "id": 2,
    //             "img": "gift_kiss",
    //             "title_al": "قبلة"
    //         }
    //     }

    //     cc.vv.BroadcastManager.addGiftAnim(msg);

    // },

    // testLevelUp(num) {
    //     cc.vv.PopupManager.addPopup("BalootClient/UpgradeHint/LevelUpHint", {
    //         isWait: true,
    //         noMask: true,
    //         onShow: (node) => {
    //             node.scale = 0.3;
    //             let levelUpHint = node.getComponent("LevelUpHint");
    //             levelUpHint.run(num || 3);
    //         }
    //     });
    // },

    // testLeagueUp(num) {
    //     cc.vv.PopupManager.addPopup("BalootClient/UpgradeHint/LeagueUpHint", {
    //         isWait: true,
    //         noMask: true,
    //         onShow: (node) => {
    //             node.getComponent("LeagueUpHint").run(num || 7);
    //         }
    //     });
    // },

    // testUpgrade(level, league) {
    //     let levelShowPos = cc.v2(0, 0);
    //     let leagueShowPos = cc.v2(0, 0);
    //     if (!!level && !!league) {
    //         levelShowPos = levelShowPos.add(cc.v2(-170, -300));
    //         leagueShowPos = leagueShowPos.add(cc.v2(170, -300));
    //     }
    //     if (!!level) {
    //         cc.vv.PopupManager.addPopup("BalootClient/UpgradeHint/LevelUpHint", {
    //             noMask: true,
    //             pos: levelShowPos,
    //             touchThrough: true,
    //             noCloseHit: true,
    //             onShow: (node) => {
    //                 node.scale = 0.3;
    //                 let levelUpHint = node.getComponent("LevelUpHint");
    //                 levelUpHint.run(level || 1);
    //             }
    //         });
    //     }
    //     if (!!league) {
    //         cc.vv.PopupManager.addPopup("BalootClient/UpgradeHint/LeagueUpHint", {
    //             noMask: true,
    //             pos: leagueShowPos,
    //             touchThrough: true,
    //             noCloseHit: true,
    //             onShow: (node) => {
    //                 node.scale = 0.5;
    //                 node.getComponent("LeagueUpHint").run(league || 1);
    //             }
    //         });
    //     }
    // },

    // testGM() {
    //     let message = {
    //         title: "标题", //标题
    //         msg: "内容内容内容内容内容", //内容
    //         type: 2, //1:不可关闭 2：玩家点击界面关闭 3：展示Xs后自动关闭 4：展示Xs后自动关闭且玩家可以点击关闭
    //         close: 2, //展示2s后关闭
    //         count: 1, //通告次数
    //         interval: 3, //间隔秒数
    //     }
    //     cc.vv.GameManager.OnRcvNetSystemNotice({ code: 200, message: message });
    // },

});