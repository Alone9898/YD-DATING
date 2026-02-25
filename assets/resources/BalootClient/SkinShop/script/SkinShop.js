cc.Class({
    extends: cc.Component,
    properties: {
        typeTabbar: require("Tabbar"),
        listView: require("ListView"), //Item 小
        itemNode: cc.Node,
        infoLabel: cc.Label,
        btnPay: cc.Button,
        btnGo: cc.Button,
        btnUse: cc.Button,

        chatBoxAtlas: cc.SpriteAtlas,
        pokerBackAtlas: cc.SpriteAtlas,
        skinShopAtlas: cc.SpriteAtlas,
        userComAtlas: cc.SpriteAtlas,
    },

    onLoad() {
        this.colorMap = {
            [100]: new cc.Color(231, 81, 90),
            [50]: new cc.Color(76, 189, 107),
            [25]: new cc.Color(246, 181, 25),
        }
        this.typeConfig = {
            [0]: "data1",
            [1]: "data2",
            [2]: "data3",
            [3]: "data4",
            [4]: "data5",
            [5]: "data6",
            // [6]: "data7",
            [6]: "data8",
            [7]: "data9",
        };
        this.pNameMap = [
            "avatarframe",
            "chatskin",
            "tableskin",
            "pokerskin",
            "faceskin",
            "emojiskin",
            "frontskin",
        ]
        StatisticsMgr.reqReport(ReportConfig.SKIN_OPEN);
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_SKIN_BAG, this.REQ_SKIN_BAG, this);
        netListener.registerMsg(MsgId.REQ_BUY_SKIN_SHOP_ITEM, this.REQ_BUY_SKIN_SHOP_ITEM, this);
        netListener.registerMsg(MsgId.WORLD_GIFT_BUY, this.WORLD_GIFT_BUY, this);
        netListener.registerMsg(MsgId.USE_PROP, this.USE_PROP, this);
        let eventListener = this.node.addComponent("EventListenerCmp");
        // 更新用户信息成功
        eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        this.btnPay.node.on("click", this.onClickBuy, this);
        this.btnGo.node.on("click", this.onClickGo, this);
        this.btnUse.node.on("click", this.onClickUse, this);
        // 类型切换
        this.typeTabbar.setChangeCallback(this.onChangeTypeView.bind(this));
        this.btnPay.node.active = false;
        this.btnGo.node.active = false;
        this.btnUse.node.active = false;
    },
    onEnable() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SKIN_BAG }, true);
    },
    // 接受商城对应的数据
    REQ_SKIN_BAG(msg) {
        if (msg.code != 200) return;
        // 存储数据
        this.shoplist = msg.shoplist;
        this.updateView();
    },
    // 用户信息改变
    USER_INFO_CHANGE() {
        // 设置选中
        this.updateView();
    },
    // 购买结果
    REQ_BUY_SKIN_SHOP_ITEM(msg) {
        if (msg.code != 200) return;
        if (msg.spcode == 2) {
            cc.vv.FloatTip.show(___("金币不足"));
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 0 });
            return;
        }
        if (msg.item.category != 9) {
            // 进行穿戴
            let reqData = { c: MsgId.UPDATE_USER_INFO }
            reqData[this.pNameMap[this.typeTabbar.index]] = msg.item.img;
            cc.vv.NetManager.send(reqData);
        }
        // 刷新拥有
        for (const key in this.shoplist) {
            for (const tempListData of this.shoplist[key]) {
                if (tempListData.id == msg.item.id) {
                    tempListData.have = 1;
                    if (msg.item.days) tempListData.time = msg.item.days;
                }
            }
        }
        this.updateCurItemView(this.selectData);
    },
    // 购买世界礼物
    WORLD_GIFT_BUY(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            if (msg.spcode == 652 || msg.spcode == 804) {
                cc.vv.AlertView.show(___("金币不足"), () => {
                    cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
                }, () => {
                }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
            } else {
                cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            }
            return;
        }
    },
    // 使用道具结果
    USE_PROP(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
    },
    // 切换皮肤类型显示
    onChangeTypeView(index, item, items) {
        this.selectData = null;
        this.updateView();
    },
    // 根据不用的类型和操作模式
    updateView() {
        if (!this.shoplist) return;
        // this.listView.selectedId = -1;
        // 处理列表数据
        this.listData = this.shoplist[this.typeConfig[this.typeTabbar.index]] || [];
        // 设置默认选中
        if (!this.selectData) {
            let currData = null;
            for (let i = 0; i < this.listData.length; i++) {
                const _data = this.listData[i];
                if (_data.img == cc.vv.UserManager[this.pNameMap[this.typeTabbar.index]]) {
                    currData = _data;
                }
            }
            if (currData) {
                this.selectData = currData
                this.updateCurItemView(currData);
            } else {
                this.updateCurItemView();
            }
        } else {
            this.updateCurItemView(this.selectData);
        }
        this.listView.numItems = this.listData.length;
    },
    // 更新item显示
    onUpdateListItem(item, index) {
        let data = this.listData[index];
        // 设置显示
        if (data.have == 1 || data.free == 1) {
            cc.find("lock", item).active = false;
        } else {
            cc.find("lock", item).active = true;
        }
        this.updateItemNodeView(item, data);
        // time
        cc.find("time", item).active = (data.time && data.time > 0);
        cc.find("time/value", item).getComponent(cc.Label).string = ___("{1}天", data.time);
        // 设置选中
        if (this.selectData && this.selectData.img == data.img) {
            cc.find("use", item).active = true;
        } else {
            cc.find("use", item).active = false;
        }
    },
    // 选中Item
    onSelectListItem(event) {
        let data = this.listData[event.currentTarget._listId];
        if (data) {
            this.selectData = data;
            // this.updateCurItemView(data);
            this.updateView();
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        }
    },
    // 显示当前选中的道具
    updateCurItemView(data) {
        if (!data) {
            this.infoLabel.string = ""
            this.btnPay.node.active = false;
            this.btnGo.node.active = false;
            this.itemNode.active = false;
            this.btnUse.node.active = false;
            return;
        }
        // 设置图标
        this.itemNode.active = true;
        this.updateItemNodeView(this.itemNode, data);
        // 描述
        this.infoLabel.string = data.content || "";
        // 前往任务按钮
        this.btnGo.node.active = data.questid && data.questid > 0 && !data.have;

        // 关闭使用按钮
        this.btnUse.node.active = false;
        let diamondIcon = cc.find("layout/icon_diamond", this.btnPay.node)
        let coinIcon = cc.find("layout/icon_coin", this.btnPay.node)
        diamondIcon.active = data.diamond != undefined;
        coinIcon.active = data.coin != undefined;

        // 判断是不是全服礼物
        if (data.category == 8) {
            this.btnPay.node.active = data.vip <= 0;
            this.btnPay.node.getComponentInChildren(cc.Label).string = data.diamond || data.coin;
        } else if (data.category == 9) {
            let count = 0;
            for (const item of cc.vv.UserManager.charmDataList) {
                if (item.img == data.img) count = item.times;
            }
            this.btnPay.node.active = true;
            this.btnPay.node.getComponentInChildren(cc.Label).string = data.diamond || data.coin;
            this.btnUse.node.active = count > 0;
        } else {
            // 购买按钮
            if (data.diamond > 0 && data.have != 1) {
                this.btnPay.node.active = true;
                this.btnPay.node.getComponentInChildren(cc.Label).string = data.diamond || data.coin;
            } else {
                this.btnPay.node.active = false;
                // 直接进行穿戴
                let reqData = { c: MsgId.UPDATE_USER_INFO };
                if (data.category == 1) {
                    reqData['avatarframe'] = data.img;
                } else if (data.category == 2) {
                    reqData['chatskin'] = data.img;
                } else if (data.category == 3) {
                    reqData['tableskin'] = data.img;
                } else if (data.category == 4) {
                    reqData['pokerskin'] = data.img;
                } else if (data.category == 5) {
                    reqData['faceskin'] = data.img;
                } else if (data.category == 6) {
                    reqData['emojiskin'] = data.img;
                } else if (data.category == 7) {
                    reqData['frontskin'] = data.img;
                }
                // 发送更新信息请求
                if (data.img != cc.vv.UserManager[this.pNameMap[this.typeTabbar.index]]) {
                    if (data.have == 1 || data.free == 1) {
                        cc.vv.NetManager.send(reqData);
                    }
                }
            }
        }
    },
    // 更新图标显示
    updateItemNodeView(item, data) {
        if (!data) return;
        // 设置显示
        cc.find("avatar", item).active = data.category == 1;
        cc.find("icon", item).active = data.category != 1;
        cc.find("icon", item).scale = 1;
        cc.find("icon", item).angle = 0;
        cc.find("icon", item).y = 0;
        let charmNode = cc.find("charm", item)
        if (charmNode) charmNode.active = false;
        let countNode = cc.find("count", item)
        if (countNode) countNode.active = false;
        let rateNode = cc.find("rate", item)
        if (rateNode) rateNode.active = false;
        if (data.category == 1) {
            // 头像框
            cc.vv.UserConfig.setAvatarFrame(cc.find("avatar", item).getComponent(sp.Skeleton), data.img);
        } else if (data.category == 2) {
            // 聊天框
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.chatBoxAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1.2;
        } else if (data.category == 3) {
            // 牌桌
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 0.75;
            // cc.find("icon", item).angle = 90;
        } else if (data.category == 4) {
            // 牌背
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.pokerBackAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1.75;
        } else if (data.category == 5) {
            // 牌花
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 0.6;
        } else if (data.category == 6) {
            // 表情
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 0.45;
        } else if (data.category == 7) {
            // 字体颜色
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
        } else if (data.category == 8) {
            cc.find("icon", item).y = 15;
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.userComAtlas.getSpriteFrame(data.img);
            if (charmNode && data.charm && data.charm > 0) {
                charmNode.active = true;
                cc.find("value", charmNode).getComponent(cc.Label).string = "+" + data.charm;
            }
            if (countNode) {
                countNode.active = true;
                let valueNode = cc.find("count/layout/value", item)
                let diamondIcon = cc.find("count/layout/icon_diamond", item)
                let coinIcon = cc.find("count/layout/icon_coin", item)
                if (data.vip > 0) {
                    coinIcon.active = false;
                    diamondIcon.active = false;
                    valueNode.getComponent(cc.Label).string = data.content;
                } else {
                    let count = 0;
                    for (const item of cc.vv.UserManager.charmDataList) {
                        if (item.img == data.img) count = item.times;
                    }
                    if (count <= 0) {
                        diamondIcon.active = data.diamond != undefined;
                        coinIcon.active = data.coin != undefined && data.coin > 0;
                        if((data.diamond || data.coin)>0){
                            valueNode.getComponent(cc.Label).string = Global.FormatNumToComma(data.diamond || data.coin);
                        } else {
                            valueNode.getComponent(cc.Label).string = "free"
                        }


                    } else {
                        coinIcon.active = false;
                        diamondIcon.active = false;
                        valueNode.getComponent(cc.Label).string = "x" + Global.FormatNumToComma(count || 0);
                    }
                }
            }
        } else if (data.category == 9) {
            // 经验值道具
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.userComAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 0.5;
            if (countNode) {
                countNode.active = true;
                let valueNode = cc.find("count/layout/value", item)
                let diamondIcon = cc.find("count/layout/icon_diamond", item)
                let coinIcon = cc.find("count/layout/icon_coin", item)
                if (data.vip > 0) {
                    coinIcon.active = false;
                    diamondIcon.active = false;
                    valueNode.getComponent(cc.Label).string = data.content;
                } else {
                    let count = 0;
                    for (const item of cc.vv.UserManager.charmDataList) {
                        if (item.img == data.img) count = item.times;
                    }
                    if (count <= 0) {
                        diamondIcon.active = data.diamond != undefined;
                        coinIcon.active = data.coin != undefined;
                        valueNode.getComponent(cc.Label).string = Global.FormatNumToComma(data.diamond || data.coin);
                    } else {
                        coinIcon.active = false;
                        diamondIcon.active = false;
                        valueNode.getComponent(cc.Label).string = "x" + Global.FormatNumToComma(count || 0);
                    }
                }
            }
            if (rateNode) {
                rateNode.active = true;
                // rateNode.getComponent(cc.Label).string = data.buffer + "%";
                cc.vv.UserConfig.setExpBuffFrame(rateNode.getComponent(cc.Sprite), data.buffer);
                rateNode.color = this.colorMap[data.buffer] || cc.Color.WHITE;
            }
        }
    },
    // 点击前往Bonus
    onClickGo() {
        // questid --1:新手任务, 2:主线任务, 3:登录签到任务 4：成长任务 5:商城
        let pageIndex = -1;
        if (this.selectData.questid == 1) {
            pageIndex = 0
        } else if (this.selectData.questid == 2) {
            pageIndex = 3
        } else if (this.selectData.questid == 3) {
            pageIndex = 4
        } else if (this.selectData.questid == 4) {
            pageIndex = 2
        } else if (this.selectData.questid == 5) {
            cc.vv.GameManager.jumpTo(10);
            return;
        }
        let gameHallCpt = cc.director.getScene().getComponentInChildren("GameHall");
        if (pageIndex >= 0 && gameHallCpt && gameHallCpt.pageTabbar) {
            cc.vv.PopupManager.removeAll();
            gameHallCpt.pageTabbar.setPage(3);
            // gameHallCpt.pageTabbar.tabs[3].pageNode
            let tabbar = cc.find("TabbarContent/Tabbar", gameHallCpt.pageTabbar.tabs[3].pageNode).getComponent("Tabbar")
            if (tabbar) {
                tabbar.setPage(pageIndex)
            }
        }

    },
    // 点击购买
    onClickBuy(event) {
        if (this.selectData.category == 8) {
            cc.vv.NetManager.send({ c: MsgId.WORLD_GIFT_BUY, img: this.selectData.img });
        } else {
            cc.vv.NetManager.send({ c: MsgId.REQ_BUY_SKIN_SHOP_ITEM, id: this.selectData.id });
        }
    },
    // 点击使用
    onClickUse() {
        cc.vv.NetManager.send({ c: MsgId.USE_PROP, img: this.selectData.img });
    },
});