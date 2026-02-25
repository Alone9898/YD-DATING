const List = require("List");

const GameSelectType = {
    BetSelect: 1,
    Slots: 2,
    TableSelect: 3,
}

// 房间列表
cc.Class({
    extends: cc.Component,
    properties: {
        // pageView: cc.PageView,
        // rankPrefabNode: cc.Node,
        roomItemList: [cc.Node],
        titleSprite: cc.Sprite,

        btnLeft: cc.Button,
        btnRight: cc.Button,
        _gameType: 1,
        // listPage: List,
        // btnSalon: cc.Button,
    },

    //设置游戏类型
    //1 poker(默认) 2 slot 3 桌游
    setType(gameType, typeData) {
        this._gameType = gameType
        this._typeData = typeData
    },

    //根据游戏类型来获取显示的游戏列表
    _getGameList() {
        let datas = cc.vv.UserManager.gameList
        if (this._gameType == GameSelectType.TableSelect) {
            //桌游
            datas = datas.filter((data) => { return cc.vv.UserConfig.allTableSelectIds().indexOf(data.id) >= 0 })
        } else if (this._gameType == GameSelectType.Slots) {
            // 老虎机数据
            datas = this._typeData
        } else {
            // 牌类数据
            datas = datas.filter((data) => { return cc.vv.UserConfig.allBetSelectIds().indexOf(data.id) >= 0 })
        }
        return datas
    },

    //slot 分档配置 固定的
    _getSlotBetlist() {
        let cfg = [
            { ssid: 1, seat: 1, entry: 5000, score: 1000, reward: 1800, vipLevel: 0, section: [10000, 250000] },
            { ssid: 2, seat: 1, entry: 10000, score: 1000, reward: 1800, vipLevel: 0, section: [50000, 1500000] },
            { ssid: 3, seat: 1, entry: 50000, score: 1000, reward: 1800, vipLevel: 0, section: [250000, 10000000] },
            { ssid: 4, seat: 1, entry: 500000, score: 1000, reward: 1800, vipLevel: 0, section: [2500000, -1] }
        ]
        return cfg
    },

    //slot 分档人数 客户端假的
    _getSlotPlayer() {
        if (this._slotPyers) {
            return this._slotPyers
        }
        this._slotPyers = []
        this._slotPyers.sess = [
            { num: Math.floor(100 + Math.random() * 1000) },
            { num: Math.floor(100 + Math.random() * 1000) },
            { num: Math.floor(100 + Math.random() * 1000) },
            { num: Math.floor(100 + Math.random() * 1000) },
        ]
        return this._slotPyers
    },

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.netListener.registerMsg(MsgId.REQ_ROOM_PALYER_NUM, this.REQ_ROOM_PALYER_NUM, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_CREATE, this.FRIEND_ROOM_CREATE, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_JOIN, this.FRIEND_ROOM_JOIN, this, false);
        this.netListener.registerMsg(MsgId.GAME_SESS_LIST, this.GAME_SESS_LIST, this, false);

        // this.pageView.node.opacity = 0;
        // this.rankPrefabNode.active = false;
        // 设置切换按钮
        this.btnLeft.node.on("click", this.onPageLeft, this);
        this.btnRight.node.on("click", this.onPageRight, this);
        // this.btnSalon.node.on("click", this.onClickSalonGame, this);

        // this.btnSalon.node.active = false;

        Global.btnClickEvent(cc.find("page_view/view/content/rank/hentiao_daily", this.node), function () {
            cc.vv.GameManager.jumpTo(12.1);
        },this);
        Global.btnClickEvent(cc.find("page_view/view/content/rank/hentiao_weekly", this.node), function () {
            cc.vv.GameManager.jumpTo(12.2);
        },this);
        Global.btnClickEvent(cc.find("page_view/view/content/rank/hentiao_monthly", this.node), function () {
            cc.vv.GameManager.jumpTo(12.3);
        },this);
        Global.btnClickEvent(cc.find("page_view/view/content/bet_cash_back/btn", this.node), function () {
            cc.vv.GameManager.jumpTo(11.1);
        },this);

        Global.btnClickEvent(cc.find("records", this.node), function () {
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_historical_record", {
                onShow: (node) => {
                    node.getComponent("yd_historical_record").init({gameid:this.gameid});
                }
            })
        },this);
    },

    onInit(gameid, friendInfo) {
        let self = this
        this.gameid = gameid;
        this.gamesess = new Map()

        let gameCfg = cc.vv.UserConfig.getGameMapInfo(gameid)
        let gameType = 0
        if (gameCfg.bTableSelect) {
            gameType = GameSelectType.TableSelect
        } else if (gameCfg.bBetSelect) {
            gameType = GameSelectType.BetSelect
        }
        this._gameType = gameType

        let betSelectNode = cc.find("content", this.node)
        let tableListNode = cc.find("table_list", this.node)
        
        betSelectNode.active = gameType != GameSelectType.TableSelect
        tableListNode.active = gameType == GameSelectType.TableSelect

        // this.btnSalon.node.active = false;
        let index = 0;
        let listDatas = this._getGameList()
        for (let i = 0; i < listDatas.length; i++) {
            const item = listDatas[i];
            if (item.id == gameid) {
                index = i;
                break;
            }
        }
        this._curPageIdx = index
        // this.listPage.numItems = listDatas.length
        // this.listPage.skipPage(index, 0)

        this.scheduleOnce(() => {
            // 进房间按钮事件
            for (let i = 0; i < this.roomItemList.length; i++) {
                const roomItemNode = this.roomItemList[i];
                roomItemNode.on("click", this.onClickRoomItem.bind(this, i), this)
            }
        })
        this.schedule(() => {
            if (self._gameType == GameSelectType.Slots) {
                //随机
                let datas = self._getSlotPlayer()
                for (let i = 0; i < datas.sess.length; i++) {
                    let item = datas.sess[i]
                    item.num += Global.random(-10, 10)
                }
                this._updatePlayers()
            }
            else if (self._gameType == GameSelectType.BetSelect) {
                for (const sess of this.gamesess.values()) {
                    for(let i=0; i<sess.length; i++) {
                        sess[i].pnum += Global.random(-5, 5)
                    }
                }
                this._updatePlayers()
            }
        }, 5)
        // 请求数据
        if (self._gameType == GameSelectType.TableSelect) {
            tableListNode.getComponent("GameTableList").onInit(gameid)
        }
        this.updateView();
        this.updateBtns();
        this.updateSelfInfo();
    },

    requestSessList(gameid) {
        let now = new Date().getTime()
        if (this._reqgameid == gameid) {
            if (now - this._reqtime < 500) {
                return
            }
        }
        this._reqgameid = gameid
        this._reqtime = now

        cc.vv.NetManager.sendAndCache({ c: MsgId.GAME_SESS_LIST, gameid: gameid }, true)
    },

    updateSelfInfo(){
        let userInfo = cc.find("userInfo", this.node);
        cc.find("head",userInfo).getComponent('HeadCmp').setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon);
        cc.find("head",userInfo).getComponent('HeadCmp').setAvatarFrame(cc.vv.UserManager.avatarframe || 0);

        cc.vv.UserConfig.setVipFrame(cc.find("vip/icon",userInfo).getComponent(cc.Sprite), cc.vv.UserManager.svip);
        // let vipLv = cc.vv.UserConfig.vipExp2Level(cc.vv.UserManager.svipexp);
        // vipLv = Math.min(vipLv + 1, 12);
        // let config = cc.vv.UserConfig.vipInfoConfig[vipLv];
        // let perExpUp = cc.vv.UserConfig.vipInfoConfig[vipLv - 1].expup;
        let need = cc.vv.UserManager.nextvipexp;
        let cur = cc.vv.UserManager.svipexp;
        cc.find("vip/progress",userInfo).getComponent(cc.ProgressBar).progress = cur / need;
        cc.find("vip/progress/label",userInfo).getComponent(cc.Label).string = Global.FormatNumToComma(cur) + "/" + Global.FormatNumToComma(need);

        cc.find("coin/value",userInfo).getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.UserManager.coin);
    },

    onDisable() {
        // let cpt = this.node.getComponentInChildren("RoomRankCpt")
        // if (cpt) {
        //     cpt.onClose()
        // }
    },

    REQ_ROOM_PALYER_NUM(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        if (msg.data) this.playerData = msg.data;
        this.updateView();
    },

    // 设置房间配置
    updateView() {
        let listDatas = this._getGameList()
        let curPageidx =  this._curPageIdx; //this.listPage.curPageNum//this.pageView.getCurrentPageIndex()
        let data = listDatas[curPageidx];
        if (!data) return;
        // 设置标题
        this._setGameTitle(data.id)
        // 设置场次
        let sess = this.gamesess.get(data.id)
        if (sess) {
            this._updateSess(sess)
        } else {
            this.requestSessList(data.id)
        }

        this.updateAdBanner(data.id);
    },

    _updateSess(sess) {
        for (let i = 0; i < this.roomItemList.length; i++) {
            const roomItemNode = this.roomItemList[i];
            let cfglist = sess || {}
            let itemData = cfglist[i];

            if (itemData) {
                roomItemNode.active = true;
                cc.find("coin", roomItemNode).active = true;
                if (itemData.maxcoin > 0) {
                    cc.find("coin/value", roomItemNode).getComponent(cc.Label).string = Global.FormatNumToComma(itemData.mincoin || 0) + `-` + Global.FormatNumToComma(itemData.maxcoin || 0);
                } else {
                    cc.find("coin/value", roomItemNode).getComponent(cc.Label).string = Global.FormatNumToComma(itemData.mincoin || 0) + "+";
                }
                cc.find("blind", roomItemNode).getComponent(cc.Label).string = Global.FormatNumToComma(itemData.basecoin || 0);
                // 超过最大值的都变成灰色
                if (cc.vv.UserManager.coin >= itemData.maxcoin && itemData.maxcoin > 0) {
                    cc.find("btn_room_open", roomItemNode).active = false;
                    cc.find("btn_room_gary", roomItemNode).active = true;
                } else {
                    cc.find("btn_room_open", roomItemNode).active = true;
                    cc.find("btn_room_gary", roomItemNode).active = false;
                }
                // 确认是否显示特效
                if (cc.vv.UserManager.coin >= itemData.mincoin && (cc.vv.UserManager.coin < itemData.maxcoin || itemData.maxcoin < 0)) {
                    cc.find("fire", roomItemNode).active = true
                } else {
                    cc.find("fire", roomItemNode).active = false
                }
                cc.find("player/value", roomItemNode).getComponent(cc.Label).string = itemData.pnum;
            } else {
                roomItemNode.active = false;
            }
        }
    },

    _setGameTitle(data) {
        let titleSlot = cc.find("title_slot", this.node)
        titleSlot.active = (this._gameType == 2)
        this.titleSprite.node.active = (this._gameType != GameSelectType.Slots)
        if (this._gameType == GameSelectType.Slots) {
            let skeCpt = titleSlot.getComponent(sp.Skeleton)
            let cfg = cc.vv.GameItemCfg[data]
            let url = "BalootClient/Slots/icon/" + cfg.action + "/spine"
            cc.vv.ResManager.setSkeleton(skeCpt, url, (skeletonCpt) => {
                skeletonCpt.setAnimation(0, "logo", true)
            })

        }
        else {
            cc.vv.UserConfig.setGameTitleFrame(this.titleSprite, data);
        }
    },

    //更新人数
    _updatePlayers(gameid) {
        if (!gameid) gameid = this.gameid
        let sess = this.gamesess.get(gameid)
        if (sess) {
            // 取人数
            for (let i = 0; i < this.roomItemList.length; i++) {
                const roomItemNode = this.roomItemList[i];
                let numData = sess[i];
                if (numData) {
                    cc.find("player/value", roomItemNode).getComponent(cc.Label).string = numData.pnum;
                }
            }
        }
    },

    updateBtns() {
        let index = this._curPageIdx;//this.listPage.curPageNum//this.pageView.getCurrentPageIndex();
        this.btnLeft.node.active = index != 0;
        let listDatas = this._getGameList()
        this.btnRight.node.active = index != (listDatas.length - 1);
    },
    // 上一页
    onPageLeft() {
        // let index = this.pageView.getCurrentPageIndex();
        // this.pageView.scrollToPage(--index);
        // this.listPage.prePage(0.5)
        this._curPageIdx -= 1
        this.onListPageNumChange(this._curPageIdx)
    },
    // 下一页
    onPageRight() {
        // let index = this.pageView.getCurrentPageIndex();
        // this.pageView.scrollToPage(++index);
        // this.listPage.nextPage(0.5)
        this._curPageIdx += 1
        this.onListPageNumChange(this._curPageIdx)
    },
    // 进入游戏
    onClickRoomItem(i) {
        let self = this
        let index = this._curPageIdx; //this.listPage.curPageNum//this.pageView.getCurrentPageIndex();
        let listDatas = this._getGameList()
        let data = listDatas[index];
        if(!data){
            let tips = ___("The game is under maintenance, please wait patiently!")
            cc.vv.AlertView.showTips(tips,()=>{
                
            })
            return
        }

        let cfglist = this.gamesess.get(data.id);
        if (this._gameType == 2) {
            cfglist = this._getSlotBetlist()
        }
        if (!cfglist) return
        let cfg = cfglist[i]
        if (!cfg) return
        // 判断金币是否满足最小携带
        if (cc.vv.UserManager.coin < cfg.mincoin) {
            cc.vv.AlertView.show(___("金币不足"), () => {
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            }, () => {
            }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
            return;
        }
        // 判断金币是否超出最大携带
        if (cfg.maxcoin > 0 && cc.vv.UserManager.coin > cfg.maxcoin) {
            cc.vv.FloatTip.show(___("您的金币已超出最大携带"));
            // cc.vv.AlertView.show(___("您的金币已超出最大携带,是否进入合适的房间?"), () => {
            //     cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, gameid: data.id }, true);
            // }, () => {
            // })
            return;
        }
        AppLog.ShowScreen('开始发送进入游戏请求')
        StatisticsMgr.reqReport(ReportConfig.ONLINE_START_GAME, null, data.id);
        if (this._gameType == 2) {
            //进入slot

            cc.vv.UserManager.setEnterSelectBet(cfg.entry)
            this._enterSlot(data, cfg.ssid)
        }
        else {
            let round = -1;
            if (data.id == 257) round = 1;
            if (data.id == 258) round = 1;
            if (data.id == 256) round = 5;
            // 发生加入房间请求
            let checkEndCall = function(){
                if (round >= 0) {
                    cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, round: round, ssid: cfg.ssid, gameid: data.id }, true);
                } else {
                    cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, ssid: cfg.ssid, gameid: data.id }, true);
                }
            }

            let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(data.id)
            let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(data.id)
            if(cc.sys.isBrowser || bNew || bInnerGame){
                
                cc.vv.GameManager._checkSubpack(data.id,checkEndCall)
            }
            else{
                let tips = cc.js.formatStr('You need to download the latest resources of 【%s】 first',cc.vv.UserConfig.getGameName(data.id))
                cc.vv.AlertView.show(tips,()=>{
                    this._waitgameId = data.id
                    cc.vv.SubGameUpdateNode.emit("check_subgame", data.id);
                    cc.vv.FloatTip.show("start download")
                },()=>{

                })
            }
            
        }

    },

    _enterSlot(data, ssid) {

        cc.vv.GameManager.EnterGame(data.id, ssid)
    },

    // 快速开始salon游戏
    // onClickSalonGame() {
    //     // 创建沙龙房间
    //     this.btnSalon.getComponent("ButtonGrayCmp").interactable = false;
    //     cc.vv.NetManager.send({
    //         c: MsgId.FRIEND_ROOM_CREATE,
    //         gameid: this.gameid,
    //     }, true);

    // },
    // 创建沙龙房结果
    FRIEND_ROOM_CREATE(msg) {
        if (msg.code != 200) {
            // this.btnSalon.getComponent("ButtonGrayCmp").interactable = true;
            return;
        }
        if (msg.spcode) {
            // this.btnSalon.getComponent("ButtonGrayCmp").interactable = true;
            if (msg.spcode == 662) {
                cc.vv.FloatTip.show(___("还在游戏中,不能加入其它房间"));
            }
            if (msg.spcode == 752) {
                cc.vv.FloatTip.show(___("创建失败,已达到最大创建房间数"));
            }
            return;
        }
        // 进入沙龙房间
        cc.vv.NetManager.send({ c: MsgId.FRIEND_ROOM_JOIN, deskid: msg.deskinfo.deskid, gameid: msg.deskinfo.gameid }, true);
    },

    FRIEND_ROOM_JOIN(msg) {
        if (!!msg.spcode) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            // this.btnSalon.getComponent("ButtonGrayCmp").interactable = true;
            return;
        }
    },

    GAME_SESS_LIST(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        this.gamesess.set(msg.gameid, msg.sess)
        //显示场次
        if (this.gameid == msg.gameid) {
            this._updateSess(msg.sess)
        }
    },

    onListRender(item, idx) {
        // let listdatas = this._getGameList()
        // if (listdatas[idx]) {
        //     item.active = true
        //     item.getComponent("RoomRankCpt").onInit(listdatas[idx].id);
        //     item.getComponent("RoomRankCpt").onOpen();
        // }
        // else {
        //     item.active = false
        // }

    },

    updateAdBanner:function(id){
        let bLop = cc.vv.UserManager.isInLepGames(id)
        let bCashBack = cc.vv.UserManager.isInRebateGames(id)

        let page_view = cc.find("page_view",this.node)
        let page1 = cc.find("view/content/rank",page_view)
        page1.active = bLop

        let page2 = cc.find("view/content/bet_cash_back",page_view)
        Global.showSpriteGray(page2,!bCashBack)


        
        if(bLop && bCashBack){
            //滚动
            cc.tween(page_view)
            .repeatForever(
            cc.tween()
            .delay(3)
            .call(()=>{
                let page_cmp = page_view.getComponent(cc.PageView)
                let idx = page_cmp.getCurrentPageIndex()
                let next = (idx==1)?0:1
                page_cmp.scrollToPage(next,0.5)
            })
            )
            .start()
        }
        else{
            //停止滚动
            page_view.stopAllActions()
        }
    },

    onListPageNumChange(pageNum) {
        // cc.log('当前是第' + pageNum + '页');
        let listDatas = this._getGameList()
        let data = listDatas[pageNum]
        this.gameid = data.id;

        let tableListNode = cc.find("table_list", this.node)
        tableListNode.getComponent("GameTableList").onInit(data.id)

        this.updateView();
        this.lastPageIndex = undefined;
        
        this.updateBtns();
    },

});
