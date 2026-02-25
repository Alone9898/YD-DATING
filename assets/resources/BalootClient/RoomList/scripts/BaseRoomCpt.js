// 房间列表页面 基础类
cc.Class({
    extends: cc.Component,

    properties: {
        // animSke: sp.Skeleton,
        titileNode: cc.Node,
        itemContent: cc.Node,
        roomAtlas: cc.SpriteAtlas,
        itemPrefab: cc.Prefab,
        btnLeft: cc.Button,
        btnRight: cc.Button,
        // 排行榜
        userNodes: [cc.Node],
        // Hand特有
        btnRank: cc.Button,

        handRoundContainer: cc.ToggleContainer,
        balootRankContainer: cc.ToggleContainer,

        _isLoading: false,
        isLoading: {
            set(value) {
                this._isLoading = value;
                if (this.updateView) this.updateView();
            },
            get() {
                return this._isLoading;
            }
        }
    },

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.isLoading = false;
        this.itemNodeList = [];
        // 初始化关闭头像显示
        for (const userNode of this.userNodes) {
            userNode.active = false;
        }
        // 隐藏
        if (this.btnRank) {
            this.btnRank.node.active = false;
        }
        if (this.handRoundContainer) {
            this.handRoundContainer.node.active = false;
        }
        if (this.balootRankContainer) {
            this.balootRankContainer.node.active = false;
        }
    },

    onInit(parm) {
        this.gameid = parm.gameid;
        // 获取配置
        this.config = [];
        for (const _item of cc.vv.UserManager.gameList) {
            if (_item.id == this.gameid) {
                this.config = _item.sess
            }
        }
        this.config.sort((a, b) => { return a.entry - b.entry });
        // 设置切换按钮
        this.btnLeft.node.on("click", parm.onPageLeft);
        this.btnRight.node.on("click", parm.onPageRight);
        // 判断显示
        this.btnLeft.node.active = parm.index != 0;
        this.btnRight.node.active = parm.index != 3;
        // 排位赛入口
        this.btnRank.node.on('click', this.onClickLeague, this);
        // 动画标题
        if (this.titileNode) {
            // 设置动画类型
            let name = "";
            if (this.gameid == 256) {
                name = "Baloot"
            } else if (this.gameid == 257) {
                name = "Hand"
            } else if (this.gameid == 258) {
                name = "Hand Saudi"
            } else if (this.gameid == 259) {
                name = "Tarneeb"
            } else if (this.gameid == 265) {
                name = "Domino"
            }
            // this.animSke.setAnimation(0, name, true);
            this.titileNode.getComponent(cc.Label).string = name;
        }
        // 创建房间Item
        for (let i = 0; i < 4; i++) {
            let itemNode = cc.instantiate(this.itemPrefab);
            this.itemNodeList.push(itemNode);
            itemNode.parent = this.itemContent;
            let button = itemNode.getComponent(cc.Button);
            if (button && this.onClickRoomItem) {
                button.node.on("click", this.onClickRoomItem.bind(this, this.config[i]), this);
            }
            let buttons = itemNode.getComponentsInChildren(cc.Button);
            for (const btn of buttons) {
                btn.node.on("click", this.onClickRoomItem.bind(this, this.config[i]), this);
            }
        }
        // 更新界面
        this.updateView();
    },

    onOpen() {
        // 进入匹配监听
        this.netListener.registerMsg(MsgId.GAME_ENTER_MATCH, this.GAME_ENTER_MATCH, this, false);
        this.netListener.registerMsg(MsgId.RANK_THREE_DATA, this.RANK_THREE_DATA, this)
        // 请求排行榜 对应游戏
        cc.vv.NetManager.sendAndCache({ c: MsgId.RANK_THREE_DATA, type: 1, gameid: this.gameid });
    },

    onClose() {
        this.netListener.clear();
    },

    // 进入房间结果
    GAME_ENTER_MATCH(msg) {
        this.isLoading = false;
    },

    RANK_THREE_DATA(msg) {
        if (msg.code != 200) return;
        if (this.gameid != msg.gameid) return;
        // 设置数据
        let listData = msg.datalist || [];
        for (let i = 0; i < 3; i++) {
            let userNode = this.userNodes[i];
            let userData = listData[i];
            if (userData) {
                userNode.active = true;
                let headCmp = cc.find("head", userNode).getComponent("HeadCmp")
                if (headCmp) {
                    headCmp.setHead(userData.uid, userData.usericon);
                    headCmp.setAvatarFrame(userData.avatarframe);
                }
                cc.find("username", userNode).getComponent(cc.Label).string = userData.playername;
            } else {
                userNode.active = false;
            }
        }
    },

    // 更新界面
    updateView() {
        if (!this.gameid) return;
        for (let i = 0; i < this.itemNodeList.length; i++) {
            let cfg = this.config[i];
            if (cfg) {
                this.itemNodeList[i].active = true;
                this.updateItemView(this.itemNodeList[i], this.config[i], i);
            } else {
                this.itemNodeList[i].active = false;
            }
        }
    },

    updateItemView(itemNode, cfg, index) {
        if (!cfg) return;
        cc.find("blind", itemNode).getComponent(cc.Label).string = Global.FormatNumToComma(cfg.reward || 0);
        cc.find("coin/value", itemNode).getComponent(cc.Label).string = Global.FormatNumToComma(cfg.entry || 0);
        itemNode.getComponent(cc.Sprite).spriteFrame = this.roomAtlas.getSpriteFrame(`btn_room_${index + 1}`);
        cc.find("title", itemNode).getComponent(cc.Sprite).spriteFrame = this.roomAtlas.getSpriteFrame(`text_room_${index + 1}_${cc.vv.i18nManager.getConfig().lang}`);
        cc.find("needvip", itemNode).active = Math.max(cc.vv.UserManager.svip, 0) < cfg.vipLevel;
        cc.find("unlock", itemNode).active = this.isLoading || this.noHost;
    },
    // 进入房间
    onClickRoomItem(cfg) {
        if (this.isLoading) return;
        // 判断金币是否满足最小携带
        if (cc.vv.UserManager.coin < cfg.section[0]) {
            cc.vv.AlertView.showTips(___("您的金币不足"), () => {
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            })
            return;
        }
        // 判断金币是否超出最大携带
        if (cfg.section[1] > 0 && cc.vv.UserManager.coin > cfg.section[1]) {
            cc.vv.AlertView.show(___("您的金币已超出最大携带,是否进入合适的房间?"), () => {
                cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, gameid: this.gameid }, true);
            }, () => {
            })
            return;
        }
        this.isLoading = true;
        let round = -1;
        // Hand 回合选择
        if (this.handRoundContainer) {
            for (const toggle of this.handRoundContainer.toggleItems) {
                if (toggle.isChecked) {
                    let index = this.handRoundContainer.toggleItems.indexOf(toggle);
                    round = [1, 5][index];
                }
            }
        }
        // Baloot 回合选择
        if (this.balootRankContainer) {
            for (const toggle of this.balootRankContainer.toggleItems) {
                if (toggle.isChecked) {
                    let index = this.balootRankContainer.toggleItems.indexOf(toggle);
                    round = [5, 1][index];
                }
            }
        }
        StatisticsMgr.reqReport(ReportConfig.ONLINE_START_GAME,null, this.gameid);
        // 发生加入房间请求
        if (round >= 0) {
            cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, round: round, ssid: cfg.ssid, gameid: this.gameid }, true);
        } else {
            cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, ssid: cfg.ssid, gameid: this.gameid }, true);
        }
    },

    // 加入游戏结果
    GAME_ENTER_MATCH(msg) {
        this.isLoading = false;
    },
    // 进入排位赛界面
    onClickLeague() {
        Global.dispatchEvent("HALL_OPEN_LEAGUE");
    },

});
