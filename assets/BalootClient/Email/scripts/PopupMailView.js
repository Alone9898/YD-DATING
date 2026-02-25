// 邮件组件
cc.Class({
    extends: cc.Component,
    properties: {
        tabbar: require("Tabbar"),
        listview: require('List'),
        // 一键领取按钮
        collectButton: cc.Button,
        // 一键删除
        deleteButton: cc.Button,
        // 邮件数量
        // emailNumberLabel: cc.Label,
        // 纹理
        mailAtlas: cc.SpriteAtlas,
        // 邮件数据
        listData: [],
        // 是否正在请求网络中
        isLoading: false,
        // 没有数据提示
        noDataNode: cc.Node,
        // 邮件详情预制体
        mailInfoPrefab: cc.Prefab,
    },
    onLoad() {
        this.pageListData = [];
        this.netListener = this.addComponent("NetListenerCmp");
        // 一键领取按钮响应
        this.collectButton.node.on("click", this.onClickCollectAll, this);
        // 一键删除
        this.deleteButton.node.on("click", this.onClickDeleteAll, this);
        // 切换页面
        this.tabbar.setChangeCallback(this.onTabbarChange.bind(this));
    },
    start() {
        // 发送网络请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_MAIL_LIST });
    },

    onEnable() {
        // 邮件列表请求处理
        this.netListener.registerMsg(MsgId.REQ_MAIL_LIST, this.REQ_MAIL_LIST, this);
        // 一键领取请求处理
        this.netListener.registerMsg(MsgId.REQ_GET_ALL_MALL_ATTACH, this.REQ_GET_ALL_MALL_ATTACH, this);
        // 领取邮件的附件成功
        this.netListener.registerMsg(MsgId.REQ_GET_MAIL_ATTACH, this.REQ_GET_MAIL_ATTACH, this);
        // 删除邮件成功
        this.netListener.registerMsg(MsgId.REQ_GET_DELETE_MAIL, this.REQ_GET_DELETE_MAIL, this);
        // 删除所有邮件结果
        this.netListener.registerMsg(MsgId.MAIL_REMOVE_ALL, this.MAIL_REMOVE_ALL, this);
    },

    onDisable() {
        this.netListener.clear();
        this.listData = null
    },

    onTabbarChange(index, item, items) {
        this.updateMailList()
    },

    // 请求列表数据结果
    REQ_MAIL_LIST(msg) {
        if (msg.code == 200) {
            this.listData = msg.mails;
            this.allCollection = msg.allCollection;  //1:上锁 2:高亮 3:置灰
            this.updateMailList()
        }
    },
    // 请求领取邮件附件结果
    REQ_GET_MAIL_ATTACH(msg) {
        if (msg.code == 200) {
            // 修改邮件的状态, 让邮件可以被删除
            let tempItem = null;
            for (const item of this.listData) {
                if (item.mailid == msg.mailid) {
                    item.status = 0;
                    tempItem = item;
                }
            }
            // 直接删除邮件
            this.allCollection = msg.allCollection;
            this.updateMailList();
        } else {
            this.isLoading = false;
        }
    },
    // 一键领取结果
    REQ_GET_ALL_MALL_ATTACH(msg) {
        if (msg.code == 200) {
            // 奖励
            Global.RewardFly(msg.rewards, this.collectButton.node.convertToWorldSpaceAR(cc.v2(0, 0)));
            // 更新数据
            this.listData = msg.mails;
            this.allCollection = msg.allCollection;  //1:上锁  2：高亮 3： 置灰
            // 刷新显示
            this.updateMailList()
        }
        this.isLoading = false;
    },
    // 删除邮件结果
    REQ_GET_DELETE_MAIL(msg) {
        if (msg.code == 200) {
            // msg.mailid
            // 修改数据
            // 更新列表
        }
    },
    // 一键删除结果
    MAIL_REMOVE_ALL(msg) {
        if (msg.code != 200) return;
        // 奖励
        Global.RewardFly(msg.rewards, this.deleteButton.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        this.listData = [];
        this.allCollection = 1;
        // 刷新显示
        this.updateMailList()
    },
    // 刷新邮件列表
    updateMailList() {
        if(!this.listData) return
        
        // 更新是否可以一键领取
        this.collectButton.getComponent("ButtonGrayCmp").interactable = this.allCollection == 2;
        this.deleteButton.getComponent("ButtonGrayCmp").interactable = this.listData.length > 0;
        // 购买钻石：18
        // 购买金币：18
        // 购买道具：18
        // 激活VIP:15
        // 升级段位:19
        // 排行榜奖励:17
        // 系统通知  ：1

        // 系统欢迎邮件：8
        // 维护后的奖励邮件：13
        // 邀请好友奖励：7
        // 比赛奖励: 21
        // 22, -- 锦标赛退款
        // 23, -- 锦标赛结算
        // 24:N天后重登
        // 25:首次充值
        // 26:首次提现
        // 27:首次成为代理
        // 28:首次获得佣金
        // 29:排行榜上还差多少名
        // 30:提现成功
        // 31:提现失败
        // 32:手机号验证成功
        // 33:KYC PAN 验证成功
        // 34:KYC PAN 验证失败
        // 35:KYC BANK 验证成功
        // 36:KYC BANK 验证失败
        // 37:连续赢N场
        // 38:用户赢钱超过N
        // 39:充值审核拒绝
        // 40:每日排行榜
        // 41:每周排行榜
        // 42:每月排行榜
        // 43:代理排行榜排行榜
        let typeList = [];
        if (this.tabbar.index == 0) {
            typeList = [1, 8, 15, 17, 18, 19, 20,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43]
        } else if (this.tabbar.index == 1) {
            typeList = [13]
        } else if (this.tabbar.index == 2) {
            typeList = [21,22,23]
        }
        this.pageListData = this.listData.filter((data) => { return typeList.indexOf(data.type) >= 0 });
        if (this.pageListData.length <= 0) {
            this.listview.node.active = false;
            this.noDataNode.active = true;
            return;
        }
        this.noDataNode.active = false;

        this.pageListData.sort((a, b) => {
            return b.sendtime - a.sendtime;
        });

        // 更新所有Item
        this.listview.numItems = this.pageListData.length;
        this.listview.node.active = true;
        
        
        // 更新邮件数量
        // this.emailNumberLabel.string = __(this.pageListData.length, '/', 100);
    },
    // 更新所有的Item
    onListVRender(item, idx) {
        let itemData = this.pageListData[idx];
        this.updateItemView(item, itemData);
    },
    // 更新Item的界面显示
    updateItemView(item, data) {
        let attachNode = cc.find("rewards/attach", item);
        let moreNode = cc.find("rewards/more", item);
        // 附件的奖励
        if (data.rewards) {
            attachNode.active = true;
            attachNode.getComponent("RewardListCpt").updateView(data.rewards.slice(0, 3), [
                { type: 1, scale: 0.4 },
                { type: 25, scale: 0.4 },
                { type: 53, scale: 0.3 },
                { type: 51, scale: 0.5 },
                { type: 40, scale: 0.35 },
                { type: 50, scale: 0.2 },
                { type: 54, scale: 0.7 },
            ]);
            for (let _node of attachNode.children) {
                let gou = cc.find("gou", _node);
                if (gou) {
                    gou.active = data.status <= 0;
                }
            }
            moreNode.active = data.rewards.length > 3;
        } else {
            attachNode.active = false;
            moreNode.active = false;
        }
        // 激活VIP:15
        // 升级段位:19
        // 邀请好友奖励：7

        // 购买钻石：18
        // 购买金币：18
        // 购买道具：18
        // 排行榜奖励:17
        // 系统欢迎邮件：8
        // 系统通知  ：1
        // 维护后的奖励邮件：13
        // ["TOURNAMENT_REFUND"] = 22, -- 锦标赛退款
        // ["TOURNAMENT_SETTLE"] = 23, -- 锦标赛结算



        let bgSprite = item.getComponent(cc.Sprite)
        let iconSprite = cc.find('icon', item).getComponent(cc.Sprite)
        iconSprite.node.scale = 1;
        if (data.type == 15) {
            bgSprite.spriteFrame = this.mailAtlas.getSpriteFrame("bg_email_item_1");
            cc.vv.UserConfig.setVipFrame(iconSprite, data.rewards[0].lv || data.rewards[0].count)
            cc.find("rewards/attach", item).active = false;
        } else if (data.type == 17 || data.type == 40 || data.type == 41 || data.type == 42 || data.type == 43) {
            bgSprite.spriteFrame = this.mailAtlas.getSpriteFrame("bg_email_item_1");
            iconSprite.spriteFrame = this.mailAtlas.getSpriteFrame("icon_email_league");
        } else if (data.type == 19) {
            bgSprite.spriteFrame = this.mailAtlas.getSpriteFrame("bg_email_item_1");
            cc.vv.UserConfig.setRankFrame(iconSprite, data.rewards[0].lv || data.rewards[0].count);
            iconSprite.node.scale = 1.5;
            // cc.find("attach", item).active = false;
        } else if (data.type == 7) {
            bgSprite.spriteFrame = this.mailAtlas.getSpriteFrame("bg_email_item_3");
            iconSprite.spriteFrame = this.mailAtlas.getSpriteFrame("icon_email_friend");
        } else if (data.type == 13) {
            bgSprite.spriteFrame = this.mailAtlas.getSpriteFrame("bg_email_item_2");
            iconSprite.spriteFrame = this.mailAtlas.getSpriteFrame("icon_email_gift");
        } else {
            bgSprite.spriteFrame = this.mailAtlas.getSpriteFrame("bg_email_item_2");
            iconSprite.spriteFrame = this.mailAtlas.getSpriteFrame("icon_email_gift");
        }
        cc.find('lbl_title', item).getComponent(cc.Label).string = data.title;
        cc.find('lbl_time', item).getComponent(cc.Label).string =  Global.getTimeStr(data.sendtime)//Global.formatTime("MM/dd hh:mm:ss", data.sendtime);
        // cc.find('lbl_content', item).getComponent(cc.Label).string = data.msg;
        // cc.find('sender/lbl_sender', item).getComponent(cc.Label).string = data.sender;
        // 邮件的状态
        cc.find('red', item).active = data.status > 0
    },
    // 查看邮件详情
    onClickItem(event) {
        
        let data = this.pageListData[event.currentTarget._listId];
        cc.vv.PopupManager.addPopup(this.mailInfoPrefab, {
            // opacityIn: true,
            scaleIn: true,
            onShow: (node) => {
                if (data.type == 15 || data.type == 19) {
                    node.getComponent("MailInfoCpt").updateView2(data);
                } else {
                    node.getComponent("MailInfoCpt").updateView(data);
                }

            }
        })
    },
    // // 点击删除按钮
    // onClickDeleteItem(event) {
    //     let data = this.listData[event.currentTarget.parent._listId];
    //     cc.vv.NetManager.send({ c: MsgId.REQ_GET_DELETE_MAIL, mailid: data.mailid });
    // },
    // 一键领取响应
    onClickCollectAll() {
        if (this.isLoading) return;
        // 发送一键领取请求
        this.isLoading = true;
        cc.vv.NetManager.send({ c: MsgId.REQ_GET_ALL_MALL_ATTACH });
        StatisticsMgr.reqReport(ReportConfig.EMAIL_GET_ALL);
    },
    // 一键删除
    onClickDeleteAll() {
        if (this.isLoading) return;
        // 发送一键领取请求
        this.isLoading = true;
        cc.vv.NetManager.send({ c: MsgId.MAIL_REMOVE_ALL });
    },

});
