/*
*
*  统计管理类（上报到服务器）
*  行为操作，打点
*
 */

//key:是客户端采集的点击全路径
//val:{act:'服务端定义的上报点',des:'打点描述'}
let reportEventCfg = {
    //头像
    'top/node_head': { act: 'open_head', des: '点开大厅头像' },
    'PersonalInfo/spr_ui_bg/btnClose': { act: 'close_head', des: '关闭用户详情' },
    'PersonalInfo/spr_ui_bg/node_info/btn_layout/btn_fb': { act: 'head_facebook', des: '用户详情-connect' },
    'PersonalInfo/spr_ui_bg/node_info/btn_connectus': { act: 'head_contactus', des: '用户详情-connectus' },
    'PersonalInfo/ChangeHead/bg/btn_confirm': { act: 'sure_headpic', des: '用户详情-确认替换头像' },
    'PersonalInfo/spr_ui_bg/node_info/btn_change': { act: 'edit_headpic', des: '用户详情-进入换头像' },

    //大厅
    'top/exp_bg': { act: 'click_level', des: '大厅-点击等级条' },
    'menu_top/btn_initgift': { act: 'click_initgift', des: '大厅-点击initgift' },
    'menu_top/btn_pig': { act: 'click_hallpig', des: '大厅-点击initgift' },
    'firstCharge': { act: 'open_purchase', des: '大厅-点击firstcharge' },

    //邮件
    'menu_top/btn_email': { act: 'open_mail', des: '点开大厅邮件' },
    'hall_email/spr_bg/btn_close': { act: 'close_mail', des: '关闭邮件界面' },
    'hall_email/spr_bg/btn_collect': { act: 'mail_collectall', des: '邮件-collectall' },
    'hall_email/spr_bg/spr_center/Scrollview/view/content/mail_item/btn': { act: 'mail_collect', des: '邮件-点击单个邮件' },
    // 'hall_email/hall_email_detail/spr_bg/btn_close':{act:'close_mailitem',des:'邮件-关闭单个邮件'},
    // 'hall_email/hall_email_detail/spr_bg/btn_collect':{act:'mailitem_collect',des:'邮件-collect单个邮件'},

    //Rank
    'menu_top/btn_rank': { act: 'open_rank', des: '点开大厅-rank' },
    'ranking_list/comm_pop_ui_bg': { act: 'close_rank', des: '关闭大厅-rank' },

    //VIP
    'menu_top/btn_vip': { act: 'open_vip', des: '大厅打开VIP' },
    'vip/btn_close': { act: 'close_vip', des: '大厅关闭VIP' },
    'vip/node_content/node_title/node_exp/btn_tip': { act: 'vip_help', des: 'VIP-帮助问号' },
    //EventBonus
    'menu_top/btn_fb': { act: 'open_event', des: '大厅点开EventBonus' },
    'FbFeedback/pop_win_bg/btn_close': { act: 'close_event', des: '大厅关闭EventBonus' },
    'FbFeedback/pop_win_bg/btn_contactus': { act: 'event_contact', des: 'EventBonus-ConnectUS' },

    //大厅设置[音量开关的程序自己到代码里打点]
    'menu_top/btn_menu': { act: 'open_menu', des: '打开大厅设置界面' },
    'menu': { act: 'close_menu', des: '关闭大厅设置界面' },
    'menu/menu_bg/btn_rate': { act: 'menu_rateus', des: '大厅菜单-rateus' },
    'menu/menu_bg/btn_setting': { act: 'open_set', des: '大厅菜单-setting' },
    'LMSlots_Setting/bg/Node_FB_ContactUs/btn_conntactUs': { act: 'set_contact', des: '设置详情-connect' },
    'LMSlots_Setting/bg/Node_FansPage/btn_FansPage': { act: 'set_fan', des: '设置详情-fan' },
    'LMSlots_Setting/bg/btn_PrivacyPolicy': { act: 'set_policy', des: '设置详情-priacypolicy' },
    'LMSlots_Setting/bg/btn_logout': { act: 'logout', des: '设置详情-logout' },
    'LMSlots_Setting/bg/btn_layout/btn_fbbind': { act: 'fb_bind', des: 'fb_bind' },

    //大厅Tab页面
    'bottom/btn_buy': { act: 'menu_buy', des: 'Tab-buy' },
    'bottom/btn_poker': { act: 'menu_poker', des: 'menu_poker' },
    'bottom/btn_bonus': { act: 'menu_bonus', des: 'menu_bonus' },
    'bottom/btn_friend': { act: 'menu_friend', des: 'menu_friend' },
    'bottom/btn_slots': { act: 'menu_slots', des: 'menu_slots' },
    'AD_top/pageview/view/content/ad_1': { act: 'ad_monthcard', des: '广告语-月卡' },
    'AD_top/pageview/view/content/ad_2': { act: 'ad_quest', des: '广告语-quest' },
    'AD_top/pageview/view/content/ad_3': { act: 'ad_lucksmach', des: '广告语-砸蛋' },

    //金猪
    'safe_node/LMSlots_Top/btn_pigbank': { act: 'open_pig', des: '游戏内-打开金猪' },
    'MoneyBankUI/comm_pop_ui_bg': { act: 'close_pig', des: '游戏内-关闭金猪' },
    'MoneyBankUI/bg/btn_open': { act: 'buy_pig', des: '游戏内-购买金猪' },
    'MoneyBankUI/bg/node_content/maxi_coin/spr_spin': { act: 'click_pig_gospin', des: '游戏内-金猪GOSpine' },
    'pages/view/content/page_shop/list_shop/view/content/gift_bank/content/bg/btn_open': { act: 'buy_pig_inhall', des: '大厅-购买金猪' },
    'shop_pop_ui/page_shop/list_shop/view/content/gift_bank/content/bg/btn_open': { act: 'buy_pig_inpop', des: '商店弹窗-购买金猪' },

    //herocard


    //Bonus
    'pages/view/content/page_bonus/list_bonus/view/content/daily_bonus': { act: 'open_signin', des: 'bonus-打开签到' },
    // 'Signin/spr_ui_bg/btnClose':{act:'close_signin',des:'bonus-关闭签到'},
    'Signin/spr_ui_bg/siginList/signin_1/normal/btnRecive': { act: 'signin_1', des: '签到1天' },
    'Signin/spr_ui_bg/siginList/signin_2/normal/btnRecive': { act: 'signin_2', des: '签到2天' },
    'Signin/spr_ui_bg/siginList/signin_3/normal/btnRecive': { act: 'signin_3', des: '签到3天' },
    'Signin/spr_ui_bg/siginList/signin_4/normal/btnRecive': { act: 'signin_4', des: '签到4天' },
    'Signin/spr_ui_bg/siginList/signin_5/normal/btnRecive': { act: 'signin_5', des: '签到5天' },
    'Signin/spr_ui_bg/siginList/signin_6/normal/btnRecive': { act: 'signin_6', des: '签到6天' },
    'Signin/spr_ui_bg/siginList/signin_7/normal/btnRecive': { act: 'signin_7', des: '签到7天' },
    'pages/view/content/page_bonus/list_bonus/view/content/online_bonus': { act: 'open_online', des: '大厅打开在线奖励' },
    'online_rewards/node_center/btn_close': { act: 'close_online', des: '大厅关闭在线奖励' },
    'pages/view/content/page_bonus/list_bonus/view/content/daily_task': { act: 'open_daliytask', des: '大厅打开DaliyTask' },
    'MissionsMain/spr_ui_bg/btnClose': { act: 'close_online', des: '大厅关闭DaliyTask' },

    'pages/view/content/page_bonus/list_bonus/view/content/mission_pass': { act: 'open_mission', des: '大厅打开missionpass' },
    'MissionsMain/spr_ui_bg/btnClose': { act: 'close_mission', des: '大厅关闭missionpass' },
    'MissionsMain/spr_ui_bg/RightDetail/MissionPass/btnMissionPass': { act: 'open_mission_pass', des: '点击UNLOCK MISSION PASS' },
    'MissionsMain/uiPopNode/UnlockMissionPass/btnClose': { act: 'close_mission_pass', des: '关闭UNLOCK MISSION PASS' },

    //Friend
    'pages/view/content/page_friends/btnNode/friendsListBtn': { act: 'friend_tab_friendlist', des: '好友-tab好友列表' },
    'pages/view/content/page_friends/btnNode/luckyCoinBtn': { act: 'friend_tab_luckycoin', des: '好友-tabLuckycoin' },
    'pages/view/content/page_friends/btnNode/friendGiftBtn': { act: 'friend_tab_friendgift', des: '好友-friendgift' },
    'pages/view/content/page_friends/friendsPage/friendsList/spr_title_bg/btnEdit': { act: 'friend_edit', des: '好友-Edit按钮' },
    'pages/view/content/page_friends/friendsPage/friendsList/spr_title_bg/btnAddFriends': { act: 'click_addfriend', des: '好友-开addFriend' },
    'CH_AddFriend/bg/btnClose': { act: 'close_addfriend', des: '好友-关addFriend' },
    'CH_AddFriend/bg/btnSure': { act: 'sure_addfriend', des: '好友-搜addFriend' },
    'CH_AlertSelect/bg/btnYES': { act: 'sure_editfriend', des: '好友-搜addFriend' },
    'CH_RemoveFriend/bg/btnClose': { act: 'close_editfriend', des: '好友-关editFriend' },

    //游戏内
    'safe_node/LMSlots_Top/btn_menu': { act: 'open_set', des: '游戏内点开Top的菜单' },
    'safe_node/LMSlots_MenuNode/btn_close': { act: 'close_set', des: '游戏内关闭Top的菜单' },
    'safe_node/LMSlots_MenuNode/btn_help': { act: 'game_help', des: '游戏内菜单-needhelp' },
    'safe_node/help_node/btn_backgame': { act: 'game_help_back', des: '游戏内帮助-goback' },
    'safe_node/LMSlots_Bottom/totalBetBg/btn_add': { act: 'up_bet', des: '押注-加' },
    'safe_node/LMSlots_Bottom/totalBetBg/btn_minus': { act: 'down_bet', des: '押注-减' },
    'safe_node/LMSlots_Bottom/btn_max': { act: 'maxbet', des: '押注-Max' },
    'level_up/btn_claim': { act: '', des: '升级弹窗-claim' },
    'new_game_notice/bg/btn_confirm': { act: 'newgame_turn', des: '新游戏跳转' },
    'safe_node/LMSlots_Top/btn_purchase': { act: 'open_store', des: '游戏内-打开Shop弹窗' },
    'shop_pop_ui/btn_close': { act: 'close_store', des: '游戏内-关闭Shop弹窗' },
    'safe_node/LMSlots_Bottom/node_task': { act: 'ingame_task', des: '游戏内-task' },
    'safe_node/LMSlots_Bottom/PopSelectAutoTimes/btn_1': { act: 'subgame_auto_10', des: '自动10次' },
    'safe_node/LMSlots_Bottom/PopSelectAutoTimes/btn_2': { act: 'subgame_auto_20', des: '自动20次' },
    'safe_node/LMSlots_Bottom/PopSelectAutoTimes/btn_3': { act: 'subgame_auto_50', des: '自动50次' },
    'safe_node/LMSlots_Bottom/PopSelectAutoTimes/btn_4': { act: 'subgame_auto_100', des: '自动100次' },
    'safe_node/LMSlots_Bottom/PopSelectAutoTimes/btn_5': { act: 'subgame_auto_500', des: '自动500次' },
    'safe_node/LMSlots_Bottom/btn_stop': { act: 'subgame_stop_spin', des: 'stop_spin' },
    'safe_node/LMSlots_Top/btn_backLobby': { act: 'subgame_backlobby', des: '子游戏内返回游戏大厅' },
    'safe_node/LMSlots_Top/lay_active/node_online_reward/btn_reward': { act: 'subgame_onlinereward', des: '子游戏内在线奖励' },
    'safe_node/LMSlots_Top/playerLevel': { act: 'subgame_exp', des: '子游戏内经验条' },
    'safe_node/LMSlots_MenuNode/btn_setting': { act: 'subgame_setting', des: '子游戏内setting' },




    'hallWheel/hallWheel/wheel/btn_collect': { act: 'hall_wheel_enter', des: '大厅轮盘入口按钮' },
    'prize_wheel/node_buy/node_sure/bg/lbl_spin': { act: 'hall_wheel_makesure_buy', des: '大厅轮盘确认购买' },
    'prize_wheel/node_buy/node_sure/btn_close': { act: 'hall_wheel_makesure_close', des: '大厅轮盘确认购买close' },

    // 'pages/view/content/page_shop/list_shop/view/content/gift_welcome/content':{act:'shop_onetimeonly',des:'shop-onetimeonly入口'},
    'pages/view/content/page_shop/list_shop/view/content/gift_bank/content/bg/btn_open': { act: 'shop_pigbank', des: 'shop-pigbank购买' },




}
let statisticsClass = cc.Class({
    extends: cc.Component,
    statics: {
        _reqBatchs: [],
        _reqOnceRecord: [],

        //游戏外，http打点
        //costomKeyVal:{key:*,val:*}
        httpReport: function (eventName, exData, costomKeyVal) {
            let data = {}
            let tDeviceInfo = Global.getDeviceInfo()

            data.os = (tDeviceInfo.osValue).toLowerCase()
            data.net = tDeviceInfo.netType
            data.phone = cc.js.formatStr("%s(%s)", tDeviceInfo.phoneBrand, tDeviceInfo.phoneSystemVision)
            data.appid = Global.appId
            data.ddid = Global.getLocal('client_uuid', '')
            data.uid = Global.getLocal('recent_uid', '')
            data.waistcoat = Global.waistcoat || "0";
            data.time = (new Date()).valueOf()
            if(Global.isYDApp() && Global.isNative()){
                data.ch = cc.vv.PlatformApiMgr.GetChannelStr()
            }
            // 同步打点进入Firebase
            if (Global.isArabHero()) {
                cc.vv.PlatformApiMgr.firebaseEvent(eventName, data);
            }
            let coustomData = this._createrHttpLog(eventName, exData, costomKeyVal)
            data.d = JSON.stringify([coustomData])

            this._saveHttpReport(coustomData)

            let self = this
            cc.vv.NetManager.requestHttp('/point', data, (state, res) => {
                //没有返回值的
                self.doHTTPSendSucc(state, res)
            }, Global.apiUrl, "POST")
        },

        errorReport: function (eventName, exData, costomKeyVal) {
            let data = {}
            let tDeviceInfo = Global.getDeviceInfo()

            data.os = (tDeviceInfo.osValue).toLowerCase()
            data.net = tDeviceInfo.netType
            data.phone = cc.js.formatStr("%s(%s)", tDeviceInfo.phoneBrand, tDeviceInfo.phoneSystemVision)
            data.appid = Global.appId
            data.ddid = Global.getLocal('client_uuid', '')
            data.uid = Global.getLocal('recent_uid', '')
            data.waistcoat = Global.waistcoat || "0";
            data.time = (new Date()).valueOf()

            let coustomData = this._createrHttpLog(eventName, exData, costomKeyVal)
            data.d = JSON.stringify([coustomData])

            this._saveHttpReport(coustomData)

            let self = this
            cc.vv.NetManager.requestHttp('/report', data, (state, res) => {
                //没有返回值的
                self.doHTTPSendSucc(state, res)
            }, Global.apiUrl, "POST")
        },


        httpAll: function () {
            if (this._RTHttpLog && this._RTHttpLog.length > 0) {
                let data = {}
                let tDeviceInfo = Global.getDeviceInfo()

                data.os = (tDeviceInfo.osValue).toLowerCase()
                data.appid = Global.appId
                data.ddid = Global.getLocal('client_uuid', '')
                data.uid = Global.getLocal('recent_uid', '')
                data.waistcoat = Global.waistcoat || "0";
                data.time = (new Date()).valueOf()


                data.d = JSON.stringify(this._RTHttpLog)

                let self = this
                cc.vv.NetManager.requestHttp('/point', data, (state, res) => {
                    //没有返回值的
                    self.doHTTPSendSucc(state, res)
                }, Global.apiUrl, "POST")
            }

        },

        //协议打点方式
        reqReport: function (eventName, extData, gameid, objId) {
            if (!eventName) return
            let bBatch = true
            var req = { c: MsgId.REQ_REPORT_STATISTICS };
            if (bBatch && this._reqBatchs) {
                //批量
                let item = {}
                item.act = eventName;
                item.ext = extData || "";
                //获取是否在游戏内
                let bInGame = cc.vv.gameData && cc.vv.gameData.getGameId()
                if (!bInGame) {
                    bInGame = 0
                }
                item.gameid = gameid || bInGame //如果在游戏内，否则可能为0
                item.id = objId      //当前对象的id
                item.ts = Math.floor(cc.sys.now() / 1000)

                this._reqBatchs.push(item)
                let curNum = this._reqBatchs.length
                let batchNum = Global.STATIC_BATCH_NUM || 10
                if (curNum >= batchNum) {
                    req.batchs = this._reqBatchs
                    cc.vv.NetManager.send(req, true);
                    this._reqBatchs = []
                }
            }
            else {

                req.act = eventName;
                req.ext = extData || "";

                //获取是否在游戏内
                let bInGame = cc.vv.gameData && cc.vv.gameData.getGameId()
                if (!bInGame) {
                    bInGame = 0
                }
                req.gameid = gameid || bInGame //如果在游戏内，否则可能为0

                req.id = objId      //当前对象的id
                cc.vv.NetManager.send(req, true);
            }

        },
        // 立即打点
        reqReportNow(eventName, extData, gameid, objId) {
            if (!eventName) return
            var req = { c: MsgId.REQ_REPORT_STATISTICS };
            req.act = eventName;
            req.ext = extData || "";
            //获取是否在游戏内
            let bInGame = cc.vv.gameData && cc.vv.gameData.getGameId()
            if (!bInGame) {
                bInGame = 0
            }
            req.gameid = gameid || bInGame //如果在游戏内，否则可能为0
            req.id = objId      //当前对象的id
            if (Global.isArabHero()) {
                cc.vv.PlatformApiMgr.firebaseEvent(eventName, req);
            }
            cc.vv.NetManager.send(req, true);
        },
        // 立即打点 - 一次启动 只执行一次
        reqReportNowOnce(eventName, extData, gameid, objId) {
            if (this._reqOnceRecord.indexOf(eventName) < 0) {
                this.reqReportNow(eventName, extData, gameid, objId);
                this._reqOnceRecord.push(eventName);
            }
        },


        httpReportOnce(eventName, exData, costomKeyVal) {
            if (this._reqOnceRecord.indexOf(eventName) < 0) {
                this.httpReport(eventName, exData, costomKeyVal);
                this._reqOnceRecord.push(eventName);
            }
        },
        //开始打点
        startReport: function () {
            let self = this


            //先批量上传http打点
            if (!this._RTHttpLog) {
                //初始化数据
                let localData = Global.getLocal('HLog', '')
                if (!localData) {
                    this._RTHttpLog = []
                }
                else {
                    this._RTHttpLog = JSON.parse(localData)
                }
            }
            this.httpAll()


            this._dispatchEvent = cc.Node.prototype.dispatchEvent;
            cc.Node.prototype.dispatchEvent = function (event) {
                let bLoadingGuide = cc.vv.NewGuide && cc.vv.NewGuide.GetIsLoadingGuide()
                if (!bLoadingGuide) {
                    self._dispatchEvent.call(this, event)
                    if (event.type === cc.Node.EventType.TOUCH_END) {
                        let args = self.getNodeFullPath(this);
                        cc.log('点击：' + args)
                        let cfg = reportEventCfg[args]
                        if (cfg) {
                            self.reqReport(cfg.act)
                        }
                    }
                }
                else {
                    cc.log('==引导加载中===')
                }

            }
        },

        getNodeFullPath(node) {
            let array = [];
            let temp = node;
            do {
                array.unshift(temp.name);
                temp = temp.parent;
            } while (temp && temp.name !== 'Canvas')
            return array.join('/');
        },

        //构造一条http的打点参数
        _createrHttpLog(eventName, exData, costomKeyVal) {
            let data = {}
            data.appVer = Global.resVersion //客户端版本
            data.t = (new Date()).valueOf()
            // 协议1加入加密验证
            if (Global.isNative()) {
                data.x = md5(data.t.toString() + "hero888");
            }
            data.act = eventName
            if (exData) {
                data.act_exdata = exData
            }
            if (costomKeyVal) {
                if (costomKeyVal.key) {
                    data[costomKeyVal.key] = costomKeyVal.val
                }

            }
            return data
        },

        doHTTPSendSucc(state, data) {
            if (state) {
                if (data.type == 1) {
                    this._deleHttpReport(data.time)
                }
                else if (data.type == 2) {
                    this._deleAllHttpReport(data.time)
                }
            }

        },

        //保存一条HTTP打点
        _saveHttpReport(data) {


            this._RTHttpLog.push(data)
            //保存
            Global.saveLocal('HLog', JSON.stringify(this._RTHttpLog))

        },
        //删除一条打点数据
        _deleHttpReport(key) {
            let delKey
            for (let i = 0; i < this._RTHttpLog.length; i++) {
                let item = this._RTHttpLog[i]
                if (item.t == Number(key)) {
                    delKey = i
                    break
                }
            }
            if (delKey) {
                this._RTHttpLog.splice(delKey, 1)
                //保存
                Global.saveLocal('HLog', JSON.stringify(this._RTHttpLog))
            }
        },

        //删除批量打点数据
        _deleAllHttpReport(key) {
            for (let i = this._RTHttpLog.length - 1; i >= 0; i--) {
                let item = this._RTHttpLog[i]
                if (item.t <= Number(key)) {
                    this._RTHttpLog.splice(i, 1)
                }
            }
            //保存
            Global.saveLocal('HLog', JSON.stringify(this._RTHttpLog))
        },


        //========================================================================

        //Req协议类型打点
        REQ_HALL_BGM_OPEN: 'open_menu_music',        //开菜单BGM，有gameid说明是游戏内
        REQ_HALL_BGM_CLOSE: 'close_menu_music',      //关菜单BGM，有gameid说明是游戏内
        REQ_HALL_EFFECT_OPEN: 'open_menu_sound',     //同BGM
        REQ_HALL_EFFECT_CLOSE: 'close_menu_sound',
        REQ_SETTING_BGM_OPEN: 'open_menu_music',     //设置详情中，开BGM，有gameid说明是游戏内
        REQ_SETTING_BGM_CLOSE: 'close_menu_music',   //设置详情中，关BGM，有gameid说明是游戏内
        REQ_SETTING_EFFECT_OPEN: 'open_menu_sound',  //同详情BGM
        REQ_SETTING_EFFECT_CLOSE: 'close_menu_sound',
        REQ_POP_SHOP_OPEN: 'open_shop',              //点开商店，有gameid说明是游戏内
        REQ_POP_SHOP_CLOSE: 'close_shop',            //关商店弹窗
        REQ_SHOP_CLICKBOOTER: 'click_boost',         //商店-boost
        REQ_SHOP_BOOST_INFO: 'boost_info',           //商店-boost-叹号
        REQ_SHOP_BOOST_HELP: 'boost_help',           //商店-boost-问号
        REQ_HALL_LOADING_START: 'Load_Start',        //大厅加载开始
        REQ_HALL_LOADING_END: 'Load_End',            //大厅加载结束
        REQ_ENTER_HALL: 'Entry_Main',                //进入大厅
        REQ_OPEN_NEW_GIFT: 'InitCoin',               //弹出新生礼包
        REQ_START_GAME_GUIDE: 'Guide',               //游戏引导弹框

        REQ_CLICK_SLOTGAME: 'click_slot_item',       //点击slotitem入口
        REQ_MAIL_GOFRIENDS: 'mail_go_friend',        //邮件跳转好友界面
        REQ_MAIL_GOVIP: 'mail_go_vip',               //邮件跳转VIP
        REQ_USER_CANCEL_PAY: 'cancel_buy',           //用户取消支付


        // REQ_HEROCARD_CLICKLOCKCARD:'herocard_clicklockcard',    //herocard点击锁住的卡牌
        // REQ_HEROCARD_CLICKUNLOCKCARD:'herocard_clickunlockcard',    //herocard点击未锁住的卡牌
        // REQ_HEROCARD_GOSPINE:'herocard_gospine',    //herocard点击跳转游戏
        // REQ_HEROCARD_VIEWDETAIL:'herocard_viewdetail',    //herocard点击查看详情
        // REQ_HEROCARD_DETAILGALLARY:'herocard_detailgallary',    //herocard详情点击画报
        REQ_HERO_DETAIL_SHARE: 'hero_detail_share',    //herocard详情分享

        REQ_HERO_GUIDE_POP: 'hero_guide_pop',    //hero页面引导出现
        REQ_HERO_GUIDE_SKIP: 'hero_guide_skip',    //hero页面引导跳过
        REQ_HERO_CAMP_ALL: 'hero_camp_all',    //hero页面切换势力 所有
        REQ_HERO_CAMP_GOLD: 'hero_camp_gold',    //hero页面切换势力 金
        REQ_HERO_CAMP_WOOD: 'hero_camp_wood',    //hero页面切换势力 木
        REQ_HERO_CAMP_WATER: 'hero_camp_water',    //hero页面切换势力 水
        REQ_HERO_CAMP_FIRE: 'hero_camp_fire',    //hero页面切换势力 火
        REQ_HERO_CAMP_SOIL: 'hero_camp_soil',    //hero页面切换势力 土

        REQ_HERO_DETAIL: 'hero_detail',    //hero页面detail 
        REQ_HERO_DETAIL_POP: 'hero_detail_pop',
        REQ_HERO_DETAIL_TIPPOP: 'hero_detail_tippop',    //hero页面detailtips 出现
        REQ_HERO_DETAIL_TIPCLOSE: 'hero_detail_tipclose',    //hero页面detail 关闭
        REQ_HERO_DETAIL_GO: 'hero_detail_go',    //hero页面detail go
        REQ_HERO_DETAIL_SPIN: 'hero_detail_spin',    //hero页面detail spinnow
        REQ_HERO_DETAIL_ALLSCREEN: 'hero_detail_allscreen',    //hero页面detail 全屏
        REQ_HERO_DETAIL_EXISTALL: 'hero_detail_existall',    //hero页面detail 退出全屏
        REQ_HERO_DETAIL_CLOSE: 'hero_detail_close',    //hero页面detail 退出
        REQ_HERO_DETAIL_CHANGE: 'hero_detail_change',    //hero页面detail 切换英雄
        REQ_HERO_DETAIL_UNOLOCK: 'hero_detail_unolock',    //hero页面detail 解锁
        REQ_HERO_DETAIL_PLUSEXP: 'hero_detail_plusexp',    //hero页面detail 加经验
        REQ_HERO_DETAIL_PLUSEXP_ADD1: 'hero_detail_plusexp_add1',    //hero页面detail 加经验 加按钮1
        REQ_HERO_DETAIL_PLUSEXP_ADD2: 'hero_detail_plusexp_add2',    //hero页面detail 加经验 加按钮2
        REQ_HERO_DETAIL_PLUSEXP_CLOSE: 'hero_detail_plusexp_close',    //hero页面detail 加经验 关闭

        //hero页面detail 奖励界面
        REQ_HERO_DETAIL_REWARDS: 'hero_detail_rewards',
        REQ_HERO_DETAIL_REWARDS_POP: 'hero_detail_rewards_pop',
        REQ_HERO_DETAIL_REWARDS_COLLECT: 'hero_detail_rewards_collect',
        REQ_HERO_DETAIL_REWARDS_GO: 'hero_detail_rewards_go',
        REQ_HERO_DETAIL_REWARDS_COLLECTALL: 'hero_detail_rewards_collectall',
        REQ_HERO_DETAIL_REWARDS_CLOSE: 'hero_detail_rewards_close',

        //hero页面detail evalution界面
        REQ_HERO_DETAIL_EVOLUTION: 'hero_detail_evolution',
        REQ_HERO_DETAIL_EVOLUTION_GONOW: 'hero_detail_evolution_gonow',
        REQ_HERO_DETAIL_EVOLUTION_GO: 'hero_detail_evolution_go',
        REQ_HERO_DETAIL_EVOLUTION_UNLOCK: 'hero_detail_evolution_unlock',
        REQ_HERO_DETAIL_EVOLUTION_CLOSE: 'hero_detail_evolution_close',
        REQ_HERO_DETAIL_EVOLUTION_POP: 'hero_detail_evolution_pop',

        //hero页面detail level界面
        REQ_HERO_DETAIL_LEVEL_VIEWREWARDS: 'hero_detail_level_viewrewards',

        //100Spin
        REQ_FLOAT_100SPIN: 'float_100spin',

        //卡牌入口浮窗
        REQ_FLOAT_EXPLOCK: 'float_explock',
        REQ_FLOAT_EXPUNLOCK: 'float_expunlock',

        REQ_WELCOMEBACK_POP: 'welcomeback_pop',      //welcomeback 弹框
        REQ_WELCOMEBACK_COLLECT: 'welcomeback_collect',      //welcomeback 领取
        REQ_ONETIMEONLY_POP: 'onetimeonly_pop',      //onetimeonly 弹框
        REQ_ONETIMEONLY_BUY: 'onetimeonly_buy',      //onetimeonly  购买
        REQ_ONETIMEONLY_LATER: 'onetimeonly_later',      //onetimeonly later
        REQ_MONTHCARD_POP: 'monthcard_pop',      //monthcard 弹框
        REQ_MONTHCARD_BUY: 'monthcard_buy',      //monthcard 购买
        REQ_MONTHCARD_CLOSE: 'monthcard_close',      //monthcard 关闭
        REQ_MONTHCARD_TRAI3: 'monthcard_trai3',      //monthcard 试用3天
        REQ_MONTHCARD_RECEIVED: 'monthcard_received',      //monthcard received
        REQ_QUEST_POP: 'quest_pop',                  //quest 弹框
        REQ_QUEST_CLOSE: 'quest_close',                  //quest 关闭
        REQ_QUEST_PLAY: 'quest_play',                  //quest play
        REQ_QUESTMAIN_ENTER: 'questmain_enter',        //questmain 进入
        REQ_QUESTMAIN_EXIST: 'questmain_exist',        //questmain 推出
        REQ_QUESTMAIN_START: 'questmain_start',        //questmain 开始
        REQ_QUESTMAIN_DOWNLOAD: 'questmain_download',        //questmain 下载完成
        REQ_QUESTMAIN_REWARDINFO: 'questmain_rewardinfo',        //questmain 详情
        REQ_QUESTMAIN_REWARDPOP: 'questmain_reward_pop',        //questmain 奖励获得
        REQ_QUESTMAIN_REWARDCOLLECT: 'questmain_reward_collect',        //questmain 奖励领取
        REQ_QUESTINGAME_START: 'questingame_start',        //questmain 开始弹窗
        REQ_QUESTINGAME_START_CONTINUE: 'questingame_start_continue',        //questmain 开始弹窗continue
        REQ_QUESTINGAME_END: 'questingame_end',        //questmain 结束弹窗
        REQ_QUESTINGAME_END_CONTINUE: 'questingame_end_continue',        //questmain 结束弹窗continue
        REQ_SPECIALOFFER_POP: 'specialoffer_pop',        //specialoffer 弹窗
        REQ_SPECIALOFFER_BUY: 'specialoffer_buy',        //specialoffer buy
        REQ_SPECIALOFFER_CLOSE: 'specialoffer_close',        //specialoffer close
        REQ_PIGBANK_POP: 'pigbank_pop',        // 金猪弹窗
        REQ_PIGBANK_BUY: 'pigbank_buy',        // 金猪购买
        REQ_PIGBANK_CLOSE: 'pigbank_close',        // 金猪关闭
        REQ_PIGBANK_FREE: 'pigbank_free',        // 金猪免费
        REQ_PIGBANK_RULE: 'pigbank_rule',        // 金猪规则按钮
        REQ_PIGBANK_RULE_CLOSE: 'pigbank_rule_close',        // 金猪规则close
        REQ_HALL_WHEEL_POP: 'hall_wheel_pop',        // 大厅转盘弹出
        REQ_HALL_WHEEL_SPIN: 'hall_wheel_spin',        // 大厅弹出转盘spin
        REQ_HALL_WHEEL_COLLECT: 'hall_wheel_collect',        // 大厅弹出转盘collect
        REQ_HALL_WHEEL_SKIP: 'hall_wheel_skip',        // 大厅转盘跳过
        REQ_HALL_BUYWHEEL_POP: 'hall_buywheel_pop',        // 大厅弹出付费转盘
        REQ_HALL_BUYWHEEL_BUY: 'hall_buywheel_buy',        // 大厅弹出付费转盘购买
        REQ_HALL_BUYWHEEL_CLOSE: 'hall_buywheel_close',        // 大厅弹出付费转盘购买close
        REQ_HALL_BUYWHEEL_SUREPOP: 'hall_buywheel_surepop',        // 大厅弹出付费转盘确认弹出
        REQ_HALL_BUYWHEEL_SURESPIN: 'hall_buywheel_surespin',        // 大厅弹出付费转盘购买确认spin
        REQ_HALL_BUYWHEEL_SURECLOSE: 'hall_buywheel_sureclose',        // 大厅弹出付费转盘购买确认close
        REQ_SUBGAME_DOWNLOAD_START: 'subgame_download_start',    //开始下载子游戏
        REQ_SUBGAME_DOWNLOAD_FAILE: 'subgame_download_faile',    //下载子游戏失败
        REQ_SUBGAME_DOWNLOAD_SUCCESS: 'subgame_download_success',//下载子游戏成功
        REQ_SUBGAME_LOCKTIP: 'subgame_locktip',    //子游戏未开放
        REQ_SUBGAME_LOADING_START: 'subgame_loading_start',  //子游戏loading开始
        REQ_SUBGAME_LOADING_FAIL: 'subgame_loading_fail',    //子游戏loading失败
        REQ_SUBGAME_LOADING_SUCC: 'subgame_loading_succ',    //子游戏loading成功
        REQ_JJJ_POP: 'jjj_pop',    //救济金弹出
        REQ_JJJ_COLLECT: 'jjj_collect',    //救济金collect
        REQ_LVUPPARTY_POP: 'levelup_party_pop',    //levelup_party_pop
        REQ_LVUPPARTY_COLLECT: 'levelup_party_collect',    //levelup_party collect
        REQ_LVUPPARTY_PURSURE: 'levelup_party_pursure_pop',    //levelup_party 购买弹出
        REQ_LVUPPARTY_PURSURE_CLOSE: 'levelup_party_pursure_close',    //levelup_party 购买关闭
        REQ_LVUPPARTY_PURSURE_BUY: 'levelup_party_pursure_buy',    //levelup_party 购买
        REQ_LVUPEXP_POP: 'levelup_exp_pop',    //等级5级的提升
        REQ_LVUPEXP_COLLECT: 'levelup_exp_collect',    //等级5级 collect
        REQ_QUEST_UNLOCK_UI: 'quest_unlock_ui',    //quest 解锁出现
        REQ_HEROCARD_UNLOCK_UI: 'herocard_unlock_ui',    //herocard 解锁出现
        REQ_HEROCARD_UNLOCK_GO: 'herocard_unlock_go',    //herocard 解锁go
        REQ_PIGBANK_UNLOCK_UI: 'pigbank_unlock_ui',    //pigbank 解锁出现
        REQ_LUCKYSMACH_UNLOCK_UI: 'luckysmach_unlock_ui',    //砸蛋 解锁出现
        REQ_DAILYMISSION_POP: 'daily_mission_pop',    //dailymission 出现
        REQ_BUY_GIFT: 'buy_gift_harm',    //银锤子礼物领取
        REQ_BUY_ONETIMEONLY: 'buy_click_onetimeonly',    //buy页面点击onetimeonly
        REQ_BUY_PIGBANK: 'buy_click_pigbank',    //buy页面点击pigbank
        REQ_BUY_PIGBANK_HELP: 'buy_click_pigbank_help',    //buy页面点击pigbank帮助
        REQ_BUY_WEEKCARD: 'buy_click_weekcard',    //buy页面点击周卡
        REQ_BUY_MONTHCARD: 'buy_click_monthcard',    //buy页面点击月卡
        REQ_BUY_MONTHCARD_COLLECT: 'buy_monthcard_collect',    //buy页面点击月卡collect
        REQ_BUY_INBOX_COIN: 'buy_inbox_coin',    //buy页面点击inboxcoin购买
        REQ_BUY_GROWTHFUND: 'buy_growth_fund',    //buy页面点击growthfund购买
        REQ_BUY_GROWTHFUND_COLLECT: 'buy_growth_fund_collect',    //buy页面点击growthfund的collect
        REQ_BUY_SPRINGGIFT: 'buy_springgift',    //buy页面点击春季礼包
        REQ_BUY_TABCOIN: 'buy_tab_coin',    //buy页面点击coin
        REQ_BUY_TABSALE: 'buy_tab_sale',    //buy页面点击sale
        REQ_BUY_TABDIAMOND: 'buy_tab_diamond',    //buy页面点击diamond

        REQ_BUY_COINLIST: 'buy_coin_list',    //buy页面点击
        REQ_BUY_LEVEL_GIFT: 'buy_level_package', //购买等级礼包

        REQ_LUCKYCARD_POP: 'luckycard_pop',  // luckycard 弹出
        REQ_LUCKYCARD_GUIDE: 'luckycard_guide',  // luckycard 弹出
        REQ_LUCKYCARD_FLIP: 'luckycard_flip',  // luckycard 翻卡
        REQ_LUCKYCARD_TAKEREWARD: 'luckycard_takereward',  // luckycard 拿奖励
        REQ_LUCKYCARD_FINALREWARD_POP: 'luckycard_finalreward_pop',
        REQ_LUCKYCARD_FINALREWARD_COLLECT: 'luckycard_finalreward_collect',
        REQ_LUCKYCARD_GAMEOVER: 'luckycard_gameover',  // luckycard gameover
        REQ_LUCKYCARD_GIVEUP: 'luckycard_giveup',  // luckycard giveup
        REQ_LUCKYCARD_USE: 'luckycard_use',  // luckycard use
        REQ_LUCKYCARD_GAMEOVER_BUY: 'luckycard_gameover_buy',  // luckycard gameover buy
        REQ_LUCKYCARD_BUY_POP: 'luckycard_buy_pop',  // luckycard 购买界面弹出
        REQ_LUCKYCARD_BUY_CONFIRM: 'luckycard_buy_confirm',  // luckycard 购买界面确认
        REQ_LUCKYCARD_BUY_CLOSE: 'luckycard_buy_close',  // luckycard 购买界面关闭
        REQ_LUCKYCARD_HEART_BUY: 'luckycard_heart_buy',  // luckycard 爱心购买
        REQ_LUCKYCARD_CLOSE: 'luckycard_close',  // luckycard close

        REQ_FRIENZY_COLLECT: 'frienzy_collect',  // frienzycard collect
        REQ_FRIENZY_QUESTMASK: 'frienzy_questmask',  // frienzycard 2问号 
        REQ_FRIENZY_QUESTMASK_CLOSE: 'frienzy_questmask_close',  // frienzycard 2问号 关闭
        REQ_BOUNUS_FRIENZY: 'tab_bonus_onlinereward',  // bonus 刮刮乐
        REQ_BOUNUS_QUEST: 'tab_bonus_quest',  // bonus quest
        REQ_BOUNUS_DAILYMISSION: 'tab_bonus_dailymission',  // bonus dailymission
        REQ_BOUNUS_DAILYBONUS: 'tab_bonus_dailybonus',  // bonus dailybonus
        REQ_BOUNUS_LUCKYSMACH: 'tab_bonus_lucksmach',  // bonus 砸蛋
        REQ_BOUNUS_LUCKYCARD: 'tab_bonus_luckcard',  // bonus幸运抽卡
        REQ_BOUNUS_SHAREFB: 'tab_bonus_sharefb',  // bonus分享
        //fb分享转盘
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY: 'tab_bonus_sharefb_shareandenjoy',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_POP: 'tab_bonus_sharefb_shareandenjoy_pop',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB: 'tab_bonus_sharefb_shareandenjoy_sharetofb',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB_POP: 'tab_bonus_sharefb_shareandenjoy_sharetofb_pop',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB_COLLECT: 'tab_bonus_sharefb_shareandenjoy_sharetofb_collect',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB7_POP: 'tab_bonus_sharefb_shareandenjoy_sharetofb7_pop',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB7_SPIN: 'tab_bonus_sharefb_shareandenjoy_sharetofb7_spin',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB7_SPIN_POP: 'tab_bonus_sharefb_shareandenjoy_sharetofb7_spin_pop',
        REQ_BOUNUS_SHAREFB_SHAREANDENJOY_SHARETOFB7_SPIN_COLLECT: 'tab_bonus_sharefb_shareandenjoy_sharetofb7_spin_collect',

        REQ_BOUNUS_GIFT: 'tab_bonus_gift',  // bonus 礼盒领取

        REQ_DAILYMISSION_GOSPIN: 'tab_dailymission_gospin',  // dailymission 跳转
        REQ_DAILYMISSION_COLLECT: 'tab_dailymission_collect',  // dailymission collect
        REQ_DAILYMISSION_GIFTBOX_CHECK: 'tab_dailymission_giftbox_check',  // dailymission 礼盒查看奖励
        REQ_DAILYMISSION_GIFTBOX_TAKE: 'tab_dailymission_giftbox_take',  // dailymission 礼盒领取奖励
        REQ_DAILYMISSION_CLICK_EGG: 'tab_dailymission_clickegg',  // dailymission 点砸蛋

        REQ_SMASHUI_POP: 'smashui_pop',//砸蛋弹出
        REQ_SMASHUI_RULE: 'smashui_rule',//砸蛋界面说明
        REQ_SMASHUI_NEXT: 'smashui_next',//砸蛋界面下一页
        REQ_SMASHUI_CLOSE: 'smashui_close',//砸蛋界面关闭
        REQ_SMASHUI_SLIVER_POP: 'smashui_sliver_pop',//银蛋界面弹出
        REQ_SMASHUI_SLIVER_SMAH: 'smashui_sliver_smash',//银蛋界面砸蛋
        REQ_SMASHUI_SLIVER_BUY_POP: 'smashui_sliver_buypop',//银蛋界面购买
        REQ_SMASHUI_SLIVER_BUY: 'smashui_sliver_buy',//银蛋界面购买
        REQ_SMASHUI_SLIVER_BUY_CANCEL: 'smashui_sliver_buycanel',//银蛋界面购买取消
        REQ_SMASHUI_GOLD_POP: 'smashui_gold_pop',//金蛋界面弹出
        REQ_SMASHUI_GOLD_BUY_POP: 'smashui_gold_buypop',//银蛋界面购买
        REQ_SMASHUI_GOLD_SMAH: 'smashui_gold_smash',//金蛋界面砸蛋
        REQ_SMASHUI_GOLD_BUY: 'smashui_gold_buy',//金蛋界面购买
        REQ_SMASHUI_GOLD_BUY_CANCEL: 'smashui_gold_buycanel',//金蛋界面购买取消
        REQ_SMASH_CLOSE: 'smash_close',    //砸蛋界面关闭


        REQ_SOCIAL_HI: 'social_hi',    //点击hi按钮
        REQ_SOCIAL_ADDME: 'social_addme',    //点击addme按钮
        REQ_SOCIAL_SEND: 'social_send',    //点击send按钮
        REQ_SOCIAL_INPUTMSG: 'social_inputmsg',//輸入信息
        REQ_SOCIAL_GIFT: 'social_gift',    //点击礼物
        REQ_SOCIAL_GIFTCLOSE: 'social_giftclose',    //关闭礼物
        REQ_SOCIAL_NEWS: 'social_news',    //点击新消息
        REQ_SOCIAL_FRIENDS: 'social_friends',    //选择好友界面
        REQ_SOCIAL_CHAT: 'social_chat',    //选择聊天界面
        REQ_SOCIAL_FRIENDS_SEND: 'social_friends_send',
        REQ_SOCIAL_FRIENDS_CHAT: 'social_friends_chat',
        REQ_SOCIAL_FRIENDS_COLLECT: 'social_friends_collect',    //收取好友礼物
        REQ_SOCIAL_FRIENDS_COLLECTALL_OUT: 'social_friends_collectall_out',    //一键收好友礼物窗口
        REQ_SOCIAL_FRIENDS_COLLECTALL_COLLECT: 'social_friends_collectall_collect',    //收取
        REQ_SOCIAL_FRIENDS_COLLECTALL_FBSHARE: 'social_friends_collectall_fbshare',    //fb分享
        REQ_SOCIAL_FRIENDS_GIFTBACK: 'social_friends_giftback',    //一键送礼
        REQ_SOCIAL_ADDFRIENDS_OUT: 'social_addfriends_out',    //打开添加好友窗口
        REQ_SOCIAL_ADDFRIENDS_ADD: 'social_addfriends_add',    //点击添加好友
        REQ_SOCIAL_ADDFRIENDS_SEARCH_OUT: 'social_addfriends_search_out',    //查找好友
        REQ_SOCIAL_ADDFRIENDS_SEARCH_ADD: 'social_addfriends_search_add',    //添加查找的好友
        REQ_SOCIAL_ADDFRIENDS_SEARCHID: 'social_addfriends_searchid',    //添加查找的好友ID
        REQ_SOCIAL_ADDFRIENDS_REFRUSH: 'social_addfriends_refrush',    //添加好友刷新按钮
        REQ_SOCIAL_ADDFRIENDS_SEARCH_CLOSE: 'social_addfriends_search_close',    //关闭查找窗口
        REQ_SOCIAL_ADDFRIENDS_CLOSE: 'social_addfriends_close',    //关闭添加好友窗口
        REQ_SOCIAL_DELFRIENDS_OUT: 'social_delfriends_out',    //打开删除好友窗口
        REQ_SOCIAL_DELFRIENDS_SELECTALL: 'social_delfriends_selectall',    //全选好友
        REQ_SOCIAL_DELFRIENDS_SELECT: 'social_delfriends_select',    //勾选好友
        REQ_SOCIAL_DELFRIENDS_SELECT_OUT: 'social_delfriends_select_out',    //点击删除好友
        REQ_SOCIAL_DELFRIENDS_SELECT_OUT_POP: 'social_delfriends_select_out_pop',    //点击删除好友弹出
        REQ_SOCIAL_DELFRIENDS_SELECT_CONFIRM: 'social_delfriends_select_confirm',    //确定删除
        REQ_SOCIAL_DELFRIENDS_SELECT_CLOSE: 'social_delfriends_select_close',    //关闭删除窗口
        REQ_SOCIAL_FRIENDS_MORE: 'social_friends_more',
        REQ_SOCIAL_FRIENDS_MORE_FBFRIENDS: 'social_friends_more_fbfriends',
        REQ_SOCIAL_FRIENDS_MANAG: 'social_friends_manag',

        REQ_SOCIAL_CHAT_GLOBAL: 'social_chat_global',
        REQ_SOCIAL_CHAT_GIFT: 'social_chat_gift',
        REQ_SOCIAL_CHAT_RANK: 'social_chat_rank',
        REQ_SOCIAL_CHAT_PRIVATE: 'social_chat_private',
        REQ_SOCIAL_CHAT_ARROW: 'social_chat_arrow',

        //押注
        REQ_SOCIAL_RANKQUIZ: 'social_rankquiz',
        REQ_SOCIAL_RANKQUIZ_RULE: 'social_rankquiz_rule',
        REQ_SOCIAL_RANKQUIZ_ADD: 'social_rankquiz_add',
        REQ_SOCIAL_RANKQUIZ_REDUCE: 'social_rankquiz_reduce',
        REQ_SOCIAL_RANKQUIZ_CONFIRM: 'social_rankquiz_confirm',
        REQ_SOCIAL_RANKQUIZ_CLOSE: 'social_rankquiz_close',

        //去邮件
        REQ_SOCIAL_GOTOINBOX: 'social_gotobox',

        //高倍场
        REQ_SELECTBET_TAB_NOR: 'selectbet_tab_nor',
        REQ_SELECTBET_TAB_HIG: 'selectbet_tab_hig',
        REQ_SELECTBET_NOR_BET: 'selectbet_nor_bet',
        REQ_SELECTBET_HIG_BET: 'selectbet_hig_bet',
        REQ_SELECTBET_LEFT: 'selectbet_left',
        REQ_SELECTBET_RIGHT: 'selectbet_right',
        //富豪厅
        REQ_HEROPALACE_EARNINGPT: 'heropalace_earningpoint',
        REQ_HEROPALACE_GOSPIN: 'heropalace_gospin',
        REQ_HEROPALACE_BUYPIG: 'heropalace_buypig',
        REQ_HEROPALACE_DOUBLEEXP: 'heropalace_doubleexp',
        REQ_HEROPALACE_HEROPACK: 'heropalace_heropack',
        REQ_HEROPALACE_ONLINEREWARD: 'heropalace_onlinereward',
        REQ_HEROPALACE_POINT_BUY: 'heropalace_pointui_buy',
        REQ_HEROPALACE_POINT_TAB_PLAY: 'heropalace_pointui_play',
        REQ_HEROPALACE_POINT_TAB_STORE: 'heropalace_pointui_store',
        REQ_HEROPALACE_HALL_OPEN: 'open_palace',

        //Bingo
        REQ_BINGO_FLOAT_LOCK: 'bingo_float_lock',
        REQ_BINGO_FLOAT_LOCK_POPTIP: 'bingo_float_lock_poptip',
        REQ_BINGO_FLOAT_UNLOCK: 'bingo_float_unlock',
        REQ_BINGO_FLOAT_UNLOCK_click: 'bingo_float_unlock_click',
        REQ_BINGO_FLOAT_UNLOCK_BETTIP: 'bingo_float_unlock_bettip',
        REQ_BINGO_GAME_BACK: 'bingo_game_back',
        REQ_BINGO_LEVEL_BACK: 'bingo_level_back',
        REQ_BINGO_LEVEL_PLAY: 'bingo_level_play',
        REQ_BINGO_PLAYTIP_POP: 'bingo_playtip_pop',
        REQ_BINGO_PLAYTIP_PLAYGAME: 'bingo_playtip_playgame',
        REQ_BINGO_PLAYTIP_NOTIFY: 'bingo_playtip_notify',
        REQ_BINGO_PLAYTIP_CLOSE: 'bingo_playtip_close',
        REQ_BINGO_PLAY: 'bingo_play',
        REQ_BINGO_REWARD_POP: 'bingo_reward_pop',
        REQ_BINGO_REWARD_COIN: 'bingo_reward_coin',
        REQ_BINGO_REWARD_COUNT: 'bingo_reward_count',
        REQ_BINGO_BUY_BACK: 'bingo_buy_back',
        REQ_BINGO_BUY_GIFT: 'bingo_buy_gift',
        REQ_BINGO_BUY_BUFF: 'bingo_buy_buff',
        REQ_BINGO_HELP_POP: 'bingo_help_pop',
        REQ_BINGO_HELP_PAGE: 'bingo_help_page',
        REQ_BINGO_HELP_CLOSE: 'bingo_help_close',
        REQ_BINGO_RANK_CLOSE: 'bingo_rank_close',
        REQ_BINGO_RANK_HELP: 'bingo_rank_help',
        REQ_BINGO_RANK_HELP_CLOSE: 'bingo_rank_help_close',
        REQ_BINGO_LEFT10S_POP: 'bingo_left10s_pop',
        REQ_BINGO_LEFT10M_POP: 'bingo_left10m_pop',
        REQ_BINGO_LEFT10S_OK: 'bingo_left10s_ok',
        REQ_BINGO_LEFT10M_OK: 'bingo_left10m_ok',
        REQ_BINGO_NEWSEASON_POP: 'bingo_newseason_pop',
        REQ_BINGO_NEWSEASON_ENJOY: 'bingo_newseason_enjoy',

        //权益
        REQ_BENEFITS_CLICK: 'benefits_click',
        REQ_BENEFITS_POP: 'benefits_pop',
        REQ_BENEFITS_CLOSE: 'benefits_close',

        //卡牌碎片转盘
        REQ_HERO_WHEEL_POP: 'hero_wheel_pop',
        REQ_HERO_WHEEL_FILL: 'hero_wheel_fill',
        REQ_HERO_WHEEL_GO: 'hero_wheel_go',
        REQ_HERO_WHEEL_GO_SPIN: 'hero_wheel_go_spin',
        REQ_HERO_WHEEL_GO_SPIN_POP: 'hero_wheel_go_spin_pop',
        REQ_HERO_WHEEL_GO_SPIN_COLLECT: 'hero_wheel_go_spin_collect',
        REQ_HERO_WHEEL_CARDADD: 'hero_wheel_cardadd',
        REQ_HERO_WHEEL_CARDREDUCE: 'hero_wheel_cardreduce',
        REQ_HERO_WHEEL_GOLD: 'hero_wheel_gold',
        REQ_HERO_WHEEL_WOOD: 'hero_wheel_wood',
        REQ_HERO_WHEEL_WATER: 'hero_wheel_water',
        REQ_HERO_WHEEL_FIRE: 'hero_wheel_fire',
        REQ_HERO_WHEEL_SOIL: 'hero_wheel_soil',
        REQ_HERO_WHEEL_ALL: 'hero_wheel_all',
        REQ_HERO_WHEEL_CLOSE: 'hero_wheel_close',

        //卡牌成就
        REQ_HERO_REWARD: 'hero_reward',
        REQ_HERO_REWARD_POP: 'hero_reward_pop',
        REQ_HERO_REWARD_PROGRESSING: 'hero_reward_progressing',
        REQ_HERO_REWARD_COLLECT: 'hero_reward_collect',
        REQ_HERO_REWARD_COLLECTALL: 'hero_reward_collectall',
        REQ_HERO_REWARD_CLOSE: 'hero_reward_close',

        //卡牌more
        REQ_HERO_MORE: 'hero_more',
        //卡牌规则
        REQ_HERO_MORE_RULE: 'hero_more_rule',
        REQ_HERO_MORE_RULE_POP: 'hero_more_rule_pop',
        REQ_HERO_MORE_RULE_CLOSE: 'hero_more_rule_close',

        //卡牌图签
        REQ_HERO_MORE_COLLECTION: 'hero_more_collection',
        REQ_HERO_MORE_COLLECTION_POP: 'hero_more_collection_pop',
        REQ_HERO_MORE_COLLECTION_GOLD: 'hero_more_collection_gold',
        REQ_HERO_MORE_COLLECTION_WOOD: 'hero_more_collection_wood',
        REQ_HERO_MORE_COLLECTION_WATER: 'hero_more_collection_water',
        REQ_HERO_MORE_COLLECTION_FIRE: 'hero_more_collection_fire',
        REQ_HERO_MORE_COLLECTION_SOIL: 'hero_more_collection_soil',
        REQ_HERO_MORE_COLLECTION_SHARE: 'hero_more_collection_share',
        REQ_HERO_MORE_COLLECTION_CLOSE: 'hero_more_collection_close',

        //抽卡
        REQ_HERO_SUMMON: 'hero_summon',
        REQ_HERO_SUMMON_POP: 'hero_summon_pop',
        REQ_HERO_SUMMON_RULE: 'hero_summon_rule',
        REQ_HERO_SUMMON_RULE_POP: 'hero_summon_rule_pop',
        REQ_HERO_SUMMON_RULE_CLOSE: 'hero_summon_rule_close',
        REQ_HERO_SUMMON_ONCE: 'hero_summon_once',
        REQ_HERO_SUMMON_TENTN: 'hero_summon_tenth',
        REQ_HERO_SUMMON_CLOSE: 'hero_summon_close',

        //共用提示框
        REQ_SHOWSIMPLE_POP: 'showsimple_pop',
        REQ_SHOWSIMPLE_YES: 'showsimple_yes',
        REQ_SHOWSIMPLE_NO: 'showsimple_no',

        //抽卡展示
        REQ_PACKDROP_POP: 'packdrop_pop',
        REQ_PACKDROP_CONFIRM: 'packdrop_confirm',
        REQ_PACKDROP_AGAIN: 'packdrop_again',
        REQ_PACKDROP_CONTINUE: 'packdrop_continue',
        REQ_PACKDROP_SKIP: 'packdrop_skip',

        //关联fb解锁子游戏弹窗
        REQ_FBBINDAD_POP: 'fbbindad_pop',
        REQ_FBBINDAD_CONNECT: 'fbbindad_connect',
        REQ_FBBINDAD_CLOSE: 'fbbindad_close',

        //基金弹窗
        REQ_FUND_POP: 'fund_pop',
        REQ_FUND_BUY: 'fund_buy',
        REQ_FUND_CLOSE: 'fund_close',

        //首充礼包
        REQ_FIRSTBUYGIFT: 'firstbuygift',
        REQ_FIRSTBUYGIFT_POP: 'firstbuygift_pop',
        REQ_FIRSTBUYGIFT_GETNOW: 'firstbuygift_getnow',
        REQ_FIRSTBUYGIFT_CLOSE: 'firstbuygift_close',
        REQ_FIRSTBUYGIFT_COLLECT: 'firstbuygift_collect',

        //邮件宝箱
        REQ_MAIL_BOX: 'mail_box',
        REQ_MAIL_FBCONNECT: 'mail_fbconnect',
        REQ_MAIL_REDEEM: 'mail_redeem',


        //邮件fb绑定提示
        REQ_MAIL_FBBIND_POP: 'mail_fbbind_pop',
        REQ_MAIL_FBBIND_CONNECT: 'mail_fbbind_connect',
        REQ_MAIL_FBBIND_CLOSE: 'mail_fbbind_close',

        //成长之路
        REQ_HEROROAD_OPEN: 'heroroad_open',
        REQ_HEROROAD_CLOSE: 'heroroad_close',
        REQ_HEROROAD_BTN2: 'heroroad_btn2',
        REQ_HEROROAD_BTN3: 'heroroad_btn3',
        REQ_HEROROAD_BTNQUEST: 'heroroad_btnquest',
        REQ_HEROROAD_BTNMISSION: 'heroroad_btnmission',
        REQ_HEROROAD_BTNBONUS: 'heroroad_btnbonus',
        REQ_HEROROAD_BTNSCRATCH: 'heroroad_btnscratch',
        REQ_HEROROAD_BTNBIGPIG: 'heroroad_btnbigpig',
        REQ_HEROROAD_BTNUNLOCKSLOTS: 'heroroad_btnunlockslots',
        REQ_HEROROAD_BTNLUCKYSMASH: 'heroroad_btnluckysmash',
        REQ_HEROROAD_BTNRANKING: 'heroroad_btnranking',
        REQ_HEROROAD_BTNHERO: 'heroroad_btnhero',

        //游戏内升级
        REQ_SLOTLEVEL_QUEST_CLOSE: 'slotlevel_quest_close',
        REQ_SLOTLEVEL_QUEST_PLAY: 'slotlevel_quest_play',
        REQ_SLOTLEVEL_MISSION_POP: 'slotlevel_mission_pop',
        REQ_SLOTLEVEL_MISSION_CLICK: 'slotlevel_mission_click',
        REQ_SLOTLEVEL_MISSION_COLLECT: 'slotlevel_mission_collect',
        REQ_SLOTLEVEL_MISSION_COLLECTALL: 'slotlevel_mission_collectall',
        REQ_MISSION_TIP: 'mission_tip',
        REQ_SLOTLEVEL_MISSION_GO: 'slotlevel_mission_go',
        REQ_SLOTLEVEL_MISSION_DIA: 'slotlevel_mission_dia',
        REQ_SLOTLEVEL_MISSION_DIA_TIP: 'slotlevel_mission_dia_tip',
        REQ_SLOTLEVEL_MISSION_CLOSE: 'slotlevel_mission_close',
        REQ_SLOTLEVEL_BONUS_COLLECT: 'slotlevel_bonus_collect',
        REQ_SLOTLEVEL_BONUS_CLOSE: 'slotlevel_bonus_close',
        REQ_SLOTLEVEL_SCRATCH: 'slotlevel_scratch',
        REQ_SLOTLEVEL_SCRATCH_CLOSE: 'slotlevel_scratch_close',
        REQ_SLOTLEVEL_MISSION_SMASH: 'slotlevel_mission_smash',
        REQ_SLOTLEVEL_MISSION_TAB: 'slotlevel_mission_tab',
        REQ_SLOTLEVEL_RANKING_POP: 'slotlevel_ranking_pop',
        REQ_SLOTLEVEL_RANKING_CLOSE: 'slotlevel_ranking_close',
        REQ_SLOTLEVEL_RANKING_TOTALWIN: 'slotlevel_ranking_totalwin',
        REQ_SLOTLEVEL_RANKING_WINRANK: 'slotlevel_ranking_winrank',
        REQ_SLOTLEVEL_RANKING_LEVELUP: 'slotlevel_ranking_levelup',
        REQ_SLOTLEVEL_RANKING_BET: 'slotlevel_ranking_bet',
        REQ_SLOTLEVEL_RANKING_HREOCARD: 'slotlevel_ranking_herocard',
        REQ_SLOTLEVEL_RANKING_IBTN: 'slotlevel_ranking_ibtn',
        REQ_SLOTLEVEL_RANKING_PVP: 'slotlevel_ranking_pvp',

        //进入后台
        HTTP_ENTER_BACKGROUND: 'enter_background',
        //网络超时
        HTTP_NET_TIMEOUT: 'net_timeout',

        //HTTP类型统计
        HTTP_REGISTER: 'addToken',               //产生一个新注册码
        HTTP_LAUNCH: 'startApp',                 //app启动
        HTTP_START_HOTUPDATE: 'loadHotUpdate',   //开始热更
        HTTP_SUCCESS_HOTUPDATE: 'endLoadHot',    //结束热更
        SHOW_LOGO: 'showlogo',                   //显示logo
        START_LOADRES: 'startloadres',           //开始资源加载
        END_LOADRES: 'endloadres',               //结束资源加载
        HTTP_UPDATE_RESTART:'update_restart',    //热更重启APP完成

        // HTTP_CHECK_NONEEDUPDATE:'noNeedHot',   //check阶段已经最新不需要热更
        HTTP_START_AUTO_LOGIN: 'autoLogin',      //自动登陆
        HTTP_SHOW_LOGIN: 'showLogin',            //显示登陆
        HTTP_HOTUPDATE_PRO_ENTER: 'hotupdate_pro_enter', //热更进入
        HTTP_HOTUPDATE_PRO_CHECK: 'hotupdate_pro_check', //热更检查
        HTTP_HOTUPDATE_PRO_CHECKRESULT: 'hotupdate_pro_checkresult', //热更开始
        HTTP_HOTUPDATE_PRO_TIME15: 'hotupdate_pro_time15', //热更15s
        HTTP_HOTUPDATE_PRO_TIME30: 'hotupdate_pro_time30', //热更30s
        HTTP_HOTUPDATE_PRO_TIME45: 'hotupdate_pro_time45', //热更45s
        HTTP_HOTUPDATE_PRO_TIME60: 'hotupdate_pro_time60', //热更60s
        HTTP_HOTUPDATE_PRO_TIME90: 'hotupdate_pro_time90', //热更90s
        HTTP_HOTUPDATE_PRO_TIME180: 'hotupdate_pro_time180', //热更180s
        HTTP_HWSDK_LOGIN_FAIL: 'hwsdk_login_fail',   //华为登陆授权失败
        HTTP_CLICK_HW_SIGN: 'hwsdk_click_sign',      //点华为登陆按钮
        HTTP_CLICK_GUEST_SIGN: 'guest_click_sign',   //点游客登陆按钮
        HTTP_CLICK_FB_SIGN: 'fb_click_sign',     //点FB登陆按钮
        HTTP_CLICK_APPLE_SIGN: 'apple_click_sign',   //点苹果登陆按钮
        // HTTP_HOTUPDATE_PRO_RESTART :'hotupdate_pro_restart', //热更重启
        HTTP_HOTUPDATE_PRO_FAILED: 'hotupdate_pro_failed', //热更失败
        HTTP_SUBGAME_HOT_START: 'http_subgame_hotupdate_start',   //子游戏热更开始
        HTTP_SUBGAME_HOT_PROCESS: 'http_subgame_hotupdate_process',   //子游戏热更过程
        HTTP_SUBGAME_HOT_RESULT: 'http_subgame_hotupdate_result',   //子游戏热更结果
        HTTP_DISCONNECT: 'http_disconnect',//未连接成功
        HTTP_SPIN_NET_TIME: 'SpinTime', //游戏Spin请求花费的平均时间
        HTTP_SEND_MSG1: 'sendMsg1',  //发送协议1

        //骑士探险
        REQ_BOUNUS_EXPROLATION_SPIN: 'bounus_exprolation_spin',
        REQ_BOUNUS_EXPROLATION_CLOSE: 'bounus_exprolation_close',
        REQ_BOUNUS_EXPROLATION_KEEPGOING: 'bounus_exprolation_keepgoing',
        REQ_BOUNUS_EXPROLATION_BOXOPENNOW: 'bounus_exprolation_boxopennow',
        REQ_BOUNUS_EXPROLATION_BOXOPENNOW_POP: 'bounus_exprolation_boxopennow_pop',
        REQ_BOUNUS_EXPROLATION_BOXOPENNOW_YES: 'bounus_exprolation_boxopennow_yes',
        REQ_BOUNUS_EXPROLATION_BOXOPENNOW_NO: 'bounus_exprolation_boxopennow_no',
        REQ_BOUNUS_EXPROLATION_BOXOPEN: 'bounus_exprolation_boxopen',
        REQ_BOUNUS_EXPROLATION_BOXOPEN_POP: 'bounus_exprolation_boxopen_pop',
        REQ_BOUNUS_EXPROLATION_DESPOP: 'bounus_exprolation_despop',
        REQ_BOUNUS_EXPROLATION_DESCOLSE: 'bounus_exprolation_descolse',
        REQ_BOUNUS_EXPROLATION_PAY_CLOSE: 'bounus_exprolation_pay_close',
        REQ_BOUNUS_EXPROLATION_PAY_POINTONE: 'bounus_exprolation_pay_pointone',

        REQ_EXPROLATION_PLAYTIP_POP: 'exprolation_playtip_pop',
        REQ_EXPROLATION_PLAYTIP_GO: 'exprolation_playtip_go',
        REQ_EXPROLATION_PLAYTIP_CHECK: 'exprolation_playtip_check',
        REQ_EXPROLATION_PLAYTIP_CLOSE: 'exprolation_playtip_close',


        REQ_SUGGEST: 'suggest',

        //游戏内运营活动转盘
        REQ_WHEELINGAME_POP: 'wheelingame_pop',        // 破产时弹出的运营活动fb转盘
        REQ_WHEELINGAME_GO: 'wheelingame_go',        // go按钮
        REQ_WHEELINGAME_CLOSE: 'wheelingame_close',        // 破产时弹出的运营活动fb转盘关闭

        //abtest
        REQ_ABTEST_POP: 'abtest_pop',
        REQ_ABTEST_WAIT: 'abtest_wait',
        REQ_ABTEST_WAIT_DOWNLOAD: 'abtest_wait_download',
        REQ_ABTEST_WAIT_CLOSE: 'abtest_wait_close',
        REQ_ABTEST_CLOSE: 'abtest_close',

        //fb绑定广告
        REQ_HALL_CLICKCOIN: 'hall_clickcoin',
        REQ_HALL_CLICKDIA: 'hall_clickdia',

        //个人信息
        REQ_HALL_PERSONALINFO_EDITNAME: 'hall_personalinfo_editname',
        REQ_HALL_PERSONALINFO_COIN: 'hall_personalinfo_coin',
        REQ_HALL_PERSONALINFO_DIA: 'hall_personalinfo_dia',

        //14级引导任务完成
        REQ_DAILYMISSION_POP: 'dailymission_pop',
        REQ_DAILYMISSION_COLLECT: 'dailymission_collect',

        //日常签到
        REQ_DAILYBONUS_POP: 'dailybonus_pop',

        //大奖
        REQ_BIGWIN_POP: 'bigwin_pop',
        REQ_BIGWIN_SHAREFB: 'bigwin_sharefb',
        REQ_BIGWIN_CLOSE: 'bigwin_close',

        //cashback
        REQ_CASHBACK_POP: 'cashback_pop',
        REQ_CASHBACK_CLOSE: 'cashback_close',
        REQ_CASHBACK_INGAME_POP: 'cashback_ingame_pop',
        REQ_CASHBACKWALLET_CLICK: 'cashbackwallet_click',
        REQ_CASHBACK_TOMORROW_POP: 'cashback_tomorrow_pop',
        REQ_CASHBACK_TOMORROW_COLLECT: 'cashback_tomorrow_collect',

        //设置里fb绑定
        REQ_SETTING_FBBIND: 'setting_fbbind',

        //8级弹出游戏推荐
        REQ_NEWGAME_POP: 'newgame_pop',
        REQ_NEWGAME_GOSPIN: 'newgame_gospin',
        REQ_NEWGAME_CLOSE: 'newgame_close',
        REQ_NEWGAME_HODEON_POP: 'newgame_hodeon_pop',
        REQ_NEWGAME_HODEON_CONFIRM: 'newgame_hodeon_confirm',
        REQ_NEWGAME_HODEON_CLOSE: 'newgame_hodeon_close',

        //最后一版bonus
        REQ_BONUS_CLICKTAB: 'bonus_clicktab',
        REQ_BONUS_CLICKITEM_BTN: 'bonus_clickitem_btn',

        //卡牌掉落
        REQ_CARDDROP_UNLOCK: 'carddrop_unlock',

        //私聊
        REQ_CHAT_PRIVATECLICK: 'chat_privateclick',
        REQ_CHAT_PRIVATEPOP: 'chat_privatepop',
        REQ_CHAT_PRIVATEGIFT: 'chat_privategift',
        REQ_CHAT_PRIVATECLOSE: 'chat_privateclose',
    }
});

window.StatisticsMgr = statisticsClass;