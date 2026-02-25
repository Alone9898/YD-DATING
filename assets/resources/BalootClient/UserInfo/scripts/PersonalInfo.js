const { default: LevelCpt } = require("../../../../BalootClient/Hall/scripts/LevelCpt");

cc.Class({
    extends: cc.Component,

    properties: {
        popupBg: cc.Node,
        content: cc.Node,
        // topSelfNode: cc.Node,
        // topOtherNode: cc.Node,
        // 基本信息
        // bgSpriteNode: cc.Node,
        userHead: cc.Node,
        lbl_name: cc.Label,
        // node_coin: cc.Node,
        // lbl_coin: cc.Label,
        // node_total: cc.Node,
        // lbl_total: cc.Label,
        // node_withdrawal: cc.Node,
        // lbl_withdrawal: cc.Label,
        // node_safe: cc.Node,
        // lbl_safe: cc.Label,
        // lbl_diamond: cc.Label,
        // lbl_gender: cc.Label,
        // lbl_Introduction: cc.Label,
        lbl_level: cc.Label,
        // levelCpt: LevelCpt,
        // lbl_vip: cc.Label,
        lbl_uid: cc.Label,
        btnCopy: cc.Button,
        // lbl_county: cc.Label,
        // lbl_rp: cc.Label,
        // VIP
        // vipNode: cc.Node,
        sp_vip: cc.Sprite,
        vipProgress: cc.ProgressBar,
        vipProgressLabel: cc.Label,
        // sp_county: cc.Sprite,
        sp_gender: cc.Sprite,
        // expPrggress: cc.ProgressBar,
        // expLabel: cc.Label,
        // charmLabel: cc.Label,
        // // 在线统计
        // timeLabel: cc.Label,
        // winLabel: cc.Label,
        // winRateLabel: cc.Label,
        // abandonLabel: cc.Label,
        // // 排位数据
        // highestLeagueSprite: cc.Sprite,
        // leagueProgress: cc.ProgressBar,
        // leagueProgressLabel: cc.Label,
        // 各种修改按钮
        btn_head: cc.Button,
        btn_change: cc.Button,
        btn_name: cc.Button,
        // btn_country: cc.Button,
        btn_gender: cc.Button,
        // btn_introduction: cc.Button,
        // 操作好友按钮
        btn_message: cc.Button,
        btn_delete: cc.Button,
        btn_add: cc.Button,
        // 背包按钮
        btn_bagpack: cc.Button,
        // 送金币按钮
        btn_sendCoin: cc.Button,
        // 私聊预制体
        // prefab_chagne_name: cc.Prefab,
        // prefab_chagne_country: cc.Prefab,
        // prefab_chagne_gender: cc.Prefab,
        // prefab_chagne_head: cc.Prefab,
        // prefab_chagne_introduction: cc.Prefab,
        // prefab_message: cc.Prefab,
        // 纹理
        gender_0: cc.SpriteFrame,
        gender_1: cc.SpriteFrame,
        // 礼物系统
        // giftListView: require("ListView"),
        // giftPanelNode: cc.Node,
        btn_gift: cc.Button,
        // prefab_gift_list: cc.Prefab,
        // 个人现有的皮肤
        skinPanelNode: cc.Node,
        chatBoxAtlas: cc.SpriteAtlas,
        pokerBackAtlas: cc.SpriteAtlas,
        skinShopAtlas: cc.SpriteAtlas,
        avatarSke: sp.Skeleton,
        chatSprite: cc.Sprite,
        deskSprite: cc.Sprite,
        pokerSprite: cc.Sprite,
        pokerFaceSprite: cc.Sprite,
        // fontSprite: cc.Sprite,
        // 兑换码
        // btn_code: cc.Button,
        // 拦截与举报
        btn_black: cc.Button,
        btn_unblack: cc.Button,
        btn_report: cc.Button,
        // reportPrefab: cc.Prefab,
        // 经验值加成buff
        expBufferNode: cc.Node,
        // 等级相关规则入口
        // btn_rule_level: cc.Button,
        // btn_rule_league: cc.Button,
        btn_rule_vip: cc.Button,
        btn_rule_balance: cc.Button,

        // rulePrefab: cc.Prefab,

        // cashNode:cc.Node,
        // cashProgress:cc.ProgressBar,
        // lbl_cash:cc.Label,
        balanceNode: cc.Node,
        // balanceProgress:cc.ProgressBar,
        lbl_balance: cc.Label,

        btnKyc: cc.Button,  // kyc
        btnLogout: cc.Button,   // logout
        // btn_setting: cc.Button,

        infoNode: cc.Node,
    },

    onLoad() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        let netListener = this.node.addComponent("NetListenerCmp");
        // 监听更新金币事件
        eventListener.registerEvent(EventId.UPATE_COINS, this.updateCoin, this)
        // // 监听更新钻石更新
        // eventListener.registerEvent(EventId.UPATE_DIAMOND, this.updateDiamond, this)
        // 用户信息更新
        eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);

        // 获取到用户信息
        netListener.registerMsg(MsgId.PERSIONAL_INFO, this.PERSIONAL_INFO, this);
        // 监听删除好友返回
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, this.SOCIAL_FRIEND_HANDLE_REMOVE, this);
        // 添加好友返回
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_ADD, this.SOCIAL_FRIEND_HANDLE_ADD, this);
        // 更新用户信息成功
        netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);
        // 送礼结果
        // netListener.registerMsg(MsgId.USER_GIFT_SEND, this.USER_GIFT_SEND, this);
        // 使用道具结果
        netListener.registerMsg(MsgId.USE_PROP, this.USE_PROP, this);
        // 聊天按钮监听
        this.btn_message.node.on("click", this.onClickMessage, this);
        // 删除好友按钮监听
        this.btn_delete.node.on("click", this.onClickDelete, this);
        // 添加好友
        this.btn_add.node.on("click", this.onClickAdd, this);
        // 添加修改信息监听
        this.btn_head.node.on("click", this.onClickChangeHead, this);
        this.btn_change.node.on("click", this.onClickChangeHead, this);
        this.btn_name.node.on("click", this.onClickChangeName, this);
        // this.btn_country.node.on("click", this.onClickChangeCountry, this);
        this.btn_gender.node.on("click", this.onClickChangeGender, this);
        // this.btn_introduction.node.on("click", this.onClickChangeIntroduction, this);
        this.btn_gift.node.on("click", this.onClickOpenGiftView, this);
        this.btn_report.node.on("click", this.onClickReport, this);
        this.btn_black.node.on("click", this.onClickBlock, this);
        this.btn_unblack.node.on("click", this.onClickUnBlock, this);

        // this.btn_rule_level.node.on("click", this.onClickRuleLevel, this);
        // this.btn_rule_league.node.on("click", this.onClickRuleLeague, this);
        this.btn_rule_vip.node.on("click", this.onClickRuleVip, this);
        this.btn_rule_balance.node.on("click", this.onClickRuleBalance, this);

        this.btnCopy.node.on("click", this.onClickCopy, this);

        // 默认关闭所有差异UI
        this.updateIsSelf();
        this.btn_message.node.active = false;
        this.btn_delete.node.active = false;
        this.btn_bagpack.node.active = false;
        this.btn_sendCoin.node.active = false;
        this.btn_add.node.active = false;
        // this.btn_code.node.active = false;
        // this.topSelfNode.active = false;
        // this.topOtherNode.active = false;
        // this.giftPanelNode.active = false;
        this.skinPanelNode.active = false;

        this.btn_black.node.active = false;
        this.btn_unblack.node.active = false;
        this.btn_report.node.active = false;

        // this.btn_rule_level.node.active = false;
        // this.btn_rule_league.node.active = false;
        this.btn_rule_vip.node.active = false;

        this.expBufferNode.active = false;
        this.expBufferNode.getComponent("TimeDownCpt").setCallback(() => {
            this.expBufferNode.active = false;
        })

        this.btnKyc.node.on("click", this.onClickKyc, this);
        this.btnLogout.node.on("click", this.onClickLogout, this);

    },
    onEnable() {
        if (Global.isYDApp()) {

        }
        else {
            cc.vv.AudioManager.playBgm("BalootClient/BaseRes/", "bgm_userinfo", true, null, null, true)
        }

    },
    onDisable() {
        if (Global.isYDApp()) {

        }
        else {
            if (cc.director.getScene().name == Global.SCENE_NAME.HALL) {
                cc.vv.AudioManager.playBgm("BalootClient/BaseRes/", "bgm", true, null, null, true)
            } else {
                cc.vv.AudioManager.playBgm("games/PokerBase/audio", "bgm", true, null, null, true)
            }
        }

    },
    // 初始化需要一个UID
    init(uid) {
        this.uid = uid;
        let records = this.node.getComponentInChildren("GameRecordCpt")
        if (records) {
            records.onInit(this.uid);
        }

        cc.vv.NetManager.sendAndCache({ c: MsgId.PERSIONAL_INFO, otheruid: this.uid }, true);
        StatisticsMgr.reqReport(ReportConfig.USERINFO_OPEN, this.uid);
    },
    // 得到用户信息
    PERSIONAL_INFO(msg) {
        if (msg.code != 200) return;
        if (!msg.playerInfo) return;
        if (!msg.playerInfo.uid) return;
        if (msg.playerInfo.uid != this.uid) return;
        this.localData = msg;
        this.updateView(msg);
    },
    // 删除好友返回
    SOCIAL_FRIEND_HANDLE_REMOVE(msg) {
        if (msg.code != 200) return;
        // 关闭用户信息
        cc.vv.PopupManager.removePopup(this.node);
    },
    // 删除好友返回
    SOCIAL_FRIEND_HANDLE_ADD(msg) {
        if (msg.code != 200) return;
        // 关闭用户信息
        cc.vv.PopupManager.removePopup(this.node);
    },
    // 现金余额 更新
    updateCoin() {
        if (this.uid == cc.vv.UserManager.uid) {
            this.lbl_balance.string = Global.FormatNumToComma(cc.vv.UserManager.coin);
            // this.lbl_coin.string = Global.FormatNumToComma(Math.floor(cc.vv.UserManager.coin));
        }
    },
    // // 账户总金额 更新
    // updateTotalCoin() {
    //     if (this.uid == cc.vv.UserManager.uid) {
    //         this.lbl_total.string = Global.FormatNumToComma(Math.floor(cc.vv.UserManager.totalcoin));
    //     }
    // },
    // // 可提现金额 更新
    // updateWithdrawalCoin() {
    //     if (this.uid == cc.vv.UserManager.uid) {
    //         this.lbl_withdrawal.string = Global.FormatNumToComma(Math.floor(cc.vv.UserManager.dcoin));
    //     }
    // },
    // // 保险箱余额 更新
    // updateSafeCoin() {
    //     if (this.uid == cc.vv.UserManager.uid) {
    //         this.lbl_safe.string = Global.FormatNumToComma(Math.floor(cc.vv.UserManager.bankcoin));
    //     }
    // },

    // // 优惠钱包金额
    // updateCashBonus(){
    //     if (this.uid == cc.vv.UserManager.uid) {
    //         let dcashbonus = cc.vv.UserManager.dcashbonus;    //  可提现到现金余额的金额
    //         let cashbonus = cc.vv.UserManager.cashbonus;    // 优惠钱包金额
    //
    //         if(cashbonus == 0){
    //             this.cashProgress.progress = 0;
    //         } else {
    //             this.cashProgress.progress = dcashbonus/cashbonus;
    //         }
    //
    //         this.lbl_cash.string = `${dcashbonus}/${cashbonus}`;
    //     }
    // },
    //
    // // 金额
    // updateBalance(){
    //     if (this.uid == cc.vv.UserManager.uid) {
    //         let dcoin = cc.vv.UserManager.dcoin;    //  可提现金额
    //         let totalcoin = cc.vv.UserManager.totalcoin;    //  账户总额
    //
    //         if(totalcoin == 0){
    //             this.balanceProgress.progress = 0;
    //         } else {
    //             this.balanceProgress.progress = dcoin/totalcoin;
    //         }
    //
    //         this.lbl_balance.string = `${dcoin}/${totalcoin}`;
    //     }
    // },


    // // 钻石 更新
    // updateDiamond() {
    //     if (this.uid == cc.vv.UserManager.uid) {
    //         this.lbl_diamond.string = Global.FormatNumToComma(cc.vv.UserManager.getDiamond());
    //     }
    // },
    // 更新本地数据
    UPDATE_USER_INFO(msg) {
        if (msg.code != 200) return;
        let data = msg.user;
        if (this.uid != data.uid) return;
        // 名称
        if (data.playername != undefined) {
            this.localData.playerInfo.playername = data.playername
            this.lbl_name.string = data.playername;
        };
        // 性别
        if (data.sex != undefined) {
            this.localData.playerInfo.sex = data.sex;
            // this.lbl_gender.string = data.sex == 0 ? ___("女") : ___("男")
            this.sp_gender.spriteFrame = data.sex == 0 ? this.gender_0 : this.gender_1;
        };
        // 头像
        if (data.usericon != undefined) {
            this.localData.playerInfo.usericon = data.usericon
            this.userHead.getComponent('HeadCmp').setHead(data.uid, data.usericon);
        };
        // 头像框
        if (data.avatarframe != undefined) {
            this.localData.playerInfo.avatarframe = data.avatarframe
            this.userHead.getComponent('HeadCmp').setAvatarFrame(data.avatarframe);
            cc.vv.UserConfig.setAvatarFrame(this.avatarSke, data.avatarframe);
        };
        // // 国家
        // if (data.country != undefined) {
        //     this.localData.playerInfo.country = data.country
        //     // this.lbl_county.string = cc.vv.UserConfig.getCountry(data.country).name;
        //     cc.vv.UserConfig.setCountryFrame(this.sp_county.getComponent(cc.Sprite), data.country);
        // };
        // 简介
        if (data.memo != undefined) {
            this.localData.playerInfo.memo = data.memo;
            // this.lbl_Introduction.string = data.memo || ___("个人简介");
        }
        // // 魅力值
        // if (data.charm != undefined) {
        //     this.charmLabel.string = data.charm;
        // };
        // 聊天框
        if (data.chatskin != undefined) {
            this.chatSprite.spriteFrame = this.chatBoxAtlas.getSpriteFrame(data.chatskin);
        };
        // 牌桌
        if (data.tableskin != undefined) {
            this.deskSprite.spriteFrame = this.skinShopAtlas.getSpriteFrame(data.tableskin);
        }
        // 牌背
        if (data.pokerskin != undefined && this.pokerBackAtlas) {
            this.pokerSprite.spriteFrame = this.pokerBackAtlas.getSpriteFrame(data.pokerskin);
        }
        // 牌花
        if (data.faceskin != undefined) {
            this.pokerFaceSprite.spriteFrame = this.skinShopAtlas.getSpriteFrame(data.faceskin);
        }
    },
    USER_INFO_CHANGE() {
        let isSelf = Global.playerData.uid == this.uid;
        this.btn_black.node.active = !isSelf && cc.vv.UserManager.blockuids.indexOf(this.uid) < 0;
        this.btn_unblack.node.active = !isSelf && cc.vv.UserManager.blockuids.indexOf(this.uid) >= 0;
    },
    // 使用道具结果
    USE_PROP(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            return;
        }
        // 判断是否使用了经验道具
        if (msg.category == 9) {
            cc.vv.NetManager.send({ c: MsgId.PERSIONAL_INFO, otheruid: this.uid }, true);
        }
    },

    // // 送礼结果
    // USER_GIFT_SEND(msg) {
    //     if (msg.code != 200) return;
    //     if (msg.spcode && msg.spcode > 0) {
    //         cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
    //         if (msg.spcode == 652) {
    //             cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 0 });
    //         }
    //         return;
    //     }
    //     // 更新该玩家的魅力值 
    //     if (this.uid == msg.recevier.uid) {
    //         this.charmLabel.string = msg.recevier.charm;
    //     }
    //     // 修改本地数据
    //     if (msg.charmlist) {
    //         this.localData.charmlist = msg.charmlist;
    //     }
    //     // 更新列表显示
    //     this.giftListView.numItems = cc.vv.UserManager.charmList.length;
    // },
    // 更新界面
    updateView(msg) {
        // 界面布局更新
        let data = msg.playerInfo
        // let stat = msg.stat
        this.updateIsSelf(data)
        // 基本信息更新
        this.lbl_name.string = data.playername;
        // this.lbl_coin.string = Global.formatNumber(data.coin, { threshold: 10000 });// Global.FormatNumToComma(data.coin);
        // this.lbl_diamond.string = Global.formatNumber(data.diamond, { threshold: 10000 }); //Global.FormatNumToComma(data.diamond);
        this.lbl_uid.string = data.uid
        // this.lbl_rp.string = Global.formatNumber(data.rp, { threshold: 10000 }); //Global.FormatNumToComma(data.rp);
        this.userHead.getComponent('HeadCmp').setHead(data.uid, data.usericon);
        this.userHead.getComponent('HeadCmp').setAvatarFrame(data.avatarframe);
        // 性别
        this.sp_gender.spriteFrame = data.sex == 0 ? this.gender_0 : this.gender_1;
        // 个人简介
        // this.lbl_Introduction.string = data.memo || ___("个人简介");

        if (this.uid == cc.vv.UserManager.uid) {
            // vip设置
            this.sp_vip.node.parent.active = true;
            cc.vv.UserConfig.setVipFrame(this.sp_vip, data.vip);
            let lock = cc.find("lock", this.sp_vip.node.parent)
            if(lock){
                lock.active = data.vip <= 0;
            }
            
            // let vipLv = cc.vv.UserConfig.vipExp2Level(data.svipexp);
            // vipLv = Math.min(vipLv + 1, 12);
            // let config = cc.vv.UserConfig.vipInfoConfig[vipLv];
            // let perExpUp = cc.vv.UserConfig.vipInfoConfig[vipLv - 1].expup;
            let need = cc.vv.UserManager.nextvipexp;
            let cur = cc.vv.UserManager.svipexp;
            this.vipProgress.progress = cur / need;
            if (data.vip >= cc.vv.UserConfig.max_vip) {
                this.vipProgressLabel.string = Global.FormatNumToComma(cur)
            } else {
                this.vipProgressLabel.string = Global.FormatNumToComma(cur) + "/" + Global.FormatNumToComma(need);
            }
        }


        // cc.find("endtime", this.sp_vip.node.parent).active = (data.vip > 0 && this.isSelf);
        if (!!data.vipendtime) {
            cc.find("endtime", this.sp_vip.node.parent).active = true;
            cc.find("endtime/value", this.sp_vip.node.parent).getComponent(cc.Label).string = Global.formatTime("yyyy/MM/dd", data.vipendtime);
        } else {
            cc.find("endtime", this.sp_vip.node.parent).active = false;
        }
        // // 根据魅力值 设置背景
        // if (data.vip > 0 && data.vip <= 3) {
        //     this.bgSpriteNode.getComponent("VipUserBgCpt").setLevel(1);
        // } else if (data.vip > 3 && data.vip <= 6) {
        //     this.bgSpriteNode.getComponent("VipUserBgCpt").setLevel(2);
        // } else if (data.vip > 6 && data.vip <= 9) {
        //     this.bgSpriteNode.getComponent("VipUserBgCpt").setLevel(3);
        // } else if (data.vip > 9) {
        //     this.bgSpriteNode.getComponent("VipUserBgCpt").setLevel(4);
        // } else {
        //     this.bgSpriteNode.getComponent("VipUserBgCpt").setLevel(0);
        // }


        // 魅力值
        // this.charmLabel.string = Global.formatNumber(data.charm, { threshold: 10000 });// Global.FormatNumToComma(data.charm);
        // 个人等级 
        let lv = cc.vv.UserConfig.totalExp2Level(data.levelexp);
        // this.lbl_level.string = lv;
        // this.levelCpt.setLevelExp(data.levelexp);
        // this.expPrggress.progress = cc.vv.UserConfig.getLevelProgress(data.levelexp);
        // this.expLabel.string = cc.vv.UserConfig.getLevelRemainingExp(data.levelexp) + '/' + cc.vv.UserConfig.getCmpLevelNeedExp(lv);
        // 国家
        // this.lbl_county.string = cc.vv.UserConfig.getCountry(data.country).name;
        // cc.vv.UserConfig.setCountryFrame(this.sp_county.getComponent(cc.Sprite), data.country);
        // // 在线数据更新
        // let fmt = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR ? "mm:hh" : "hh:mm";
        // this.timeLabel.string = Global.formatSecond(stat.online.playedtime, fmt);
        // this.winLabel.string = stat.online.win;
        // this.winRateLabel.string = stat.online.win_rate + "%";
        // this.abandonLabel.string = Global.formatNumber(data.wincoin, { threshold: 10000 });
        // 排位数据更新
        // let rankData = cc.vv.UserConfig.getRank(data.leagueexp);
        // cc.vv.UserConfig.setRankBigFrame(this.highestLeagueSprite, rankData.stage);
        // if (rankData.next) {
        //     let curExp = data.leagueexp - rankData.score;
        //     let maxExp = rankData.next.score - rankData.score;
        //     this.leagueProgress.progress = curExp / maxExp;
        //     this.leagueProgressLabel.string = Global.FormatNumToComma(curExp) + "/" + Global.FormatNumToComma(maxExp);
        // } else {
        //     this.leagueProgress.progress = 1;
        //     let curExp = data.leagueexp - rankData.score;
        //     this.leagueProgressLabel.string = Global.FormatNumToComma(curExp);
        // }
        // 更新礼品数据
        // this.giftListView.numItems = cc.vv.UserManager.charmList.length;
        // 自己的皮肤数据
        // 头像框
        cc.vv.UserConfig.setAvatarFrame(this.avatarSke, cc.vv.UserManager.avatarframe);
        // 聊天框
        this.chatSprite.spriteFrame = this.chatBoxAtlas.getSpriteFrame(cc.vv.UserManager.chatskin);
        // 牌桌
        this.deskSprite.spriteFrame = this.skinShopAtlas.getSpriteFrame(cc.vv.UserManager.tableskin);
        // 牌背
        if(this.pokerBackAtlas){
            this.pokerSprite.spriteFrame = this.pokerBackAtlas.getSpriteFrame(cc.vv.UserManager.pokerskin);
        }
        
        // 牌花
        this.pokerFaceSprite.spriteFrame = this.skinShopAtlas.getSpriteFrame(cc.vv.UserManager.faceskin);
        // 字体颜色
        // this.fontSprite.spriteFrame = this.skinShopAtlas.getSpriteFrame(cc.vv.UserManager.frontskin);
        // 设置喜爱的游戏
        let records = this.node.getComponentInChildren("GameRecordCpt")
        if (records) {
            records.setLikeGame(data.favorite_games || []);
        }

        this.updateCoin();
        // this.updateTotalCoin();
        // this.updateWithdrawalCoin();
        // this.updateSafeCoin();
        // this.updateCashBonus();
        // this.updateBalance();

        // 经验值道具
        this.expBufferNode.active = data.expbuffertime > 0;
        // this.expBufferNode.active = data.expbuffer > 0;
        // cc.vv.UserConfig.setExpBuffFrame(cc.find("buffer", this.expBufferNode).getComponent(cc.Sprite), data.expbuffer);
        cc.find("buffer", this.expBufferNode).getComponent(cc.Label).string = data.expbuffer + "%";
        this.expBufferNode.getComponent("TimeDownCpt").timelife = data.expbuffertime;

        // 显示已绑定的手机号
        let bBind = data.isbindphone > 0;
        this.btnKyc.interactable = !bBind;
        this.btnKyc.node.getChildByName("label").getComponent(cc.Label).string
            = bBind ? data.phone : "Verify now";
    },
    // 更新界面差异 
    updateIsSelf(playerInfo) {
        playerInfo = playerInfo || {};
        let isSelf = Global.playerData.uid == playerInfo.uid;
        this.isSelf = isSelf;
        // this.topSelfNode.active = isSelf;
        // this.topOtherNode.active = !isSelf;
        let isfriend = playerInfo.friend > 0;

        this.popupBg.height = isSelf ? 1435 : 635;
        cc.find("logoutNode", this.popupBg).active = isSelf
        this.content.height = isSelf ? 1400 : 600;

        this.skinPanelNode.active = isSelf;
        // this.giftPanelNode.active = false//!isSelf;
        // 经验值buffer
        this.expBufferNode.active = isSelf;

        // 按钮是否开启
        this.btn_head.enabled = isSelf;
        this.btn_change.enabled = isSelf;
        this.btn_name.enabled = isSelf;
        // this.btn_country.enabled = isSelf;
        this.btn_gender.enabled = isSelf;
        // this.btn_introduction.enabled = isSelf;

        // 经验值规则
        // this.btn_rule_level.node.active = isSelf;
        // this.btn_rule_league.node.active = isSelf;
        this.btn_rule_vip.node.active = isSelf;

        // 屏蔽与举报
        this.btn_report.node.active = false//!isSelf;
        // 屏蔽UIDS
        this.btn_black.node.active = false//!isSelf && cc.vv.UserManager.blockuids.indexOf(this.uid) < 0;
        this.btn_unblack.node.active = false//!isSelf && cc.vv.UserManager.blockuids.indexOf(this.uid) >= 0;

        // 收礼列表按钮功能
        this.btn_gift.node.active = false;
        // 背包按钮
        this.btn_bagpack.node.active = isSelf;
        // 送金币按钮
        this.btn_sendCoin.node.active = isSelf && cc.vv.UserManager.sender > 0;
        // 按钮是否显示
        this.btn_change.node.active = isSelf;
        cc.find("modifyBtn", this.btn_name.node).active = isSelf;
        // // 判断是在打开场景
        // // let isHallScene = cc.director.getScene().name == Global.SCENE_NAME.HALL;
        // this.btn_message.node.active = (!isSelf && isfriend);
        // // 如果存在私聊界面 则不显示私聊按钮
        // let privateChatCpt = cc.director.getScene().getComponentInChildren("PopupPrivateChatView")
        // if (privateChatCpt) {
        //     this.btn_message.node.active = false;
        // }
        // this.btn_delete.node.active = (!isSelf && isfriend);
        // this.btn_add.node.active = (!isSelf && !isfriend);
        // // 兑换码
        // if (cc.vv.UserManager.redem > 0) {
        //     this.btn_code.node.active = isSelf;
        // } else {
        //     this.btn_code.node.active = false;
        // }

        this.infoNode.active = isSelf;

        let bBind = (cc.vv.UserManager.kyc == 1)
        this.btnKyc.node.active = isSelf && !bBind;
        
        this.btnLogout.node.active = isSelf;

        // this.btn_setting.node.active = isSelf;

    },
    // 点击聊天
    onClickMessage() {
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_FRIEND_OPEN_CHAT);
        cc.vv.EventManager.emit("OPEN_PRIVATE_CHAT_VIEW", { uid: this.localData.playerInfo.uid });
        cc.vv.PopupManager.removePopup(this.node);
    },
    // 点击添加
    onClickAdd() {
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_FRIEND_ADD);
        // 删除好友
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_HANDLE_ADD,
            frienduid: this.localData.playerInfo.uid
        });
    },
    // 点击删除
    onClickDelete() {
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_FRIEND_DELETE);
        // 删除好友
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_HANDLE_REMOVE,
            frienduids: [this.uid],
        });
    },
    // 修改名字
    onClickChangeName() {
        let url = "BalootClient/UserInfo/prefabs/PopupChangeName"
        cc.vv.PopupManager.addPopup(url, {
            opacityIn: true,
            onShow: (node) => {
                node.getComponent("ChangeUserNameCmp").init(this.localData.playerInfo)
            }
        })
    },
    // 修改国家
    onClickChangeCountry() {
    },
    // 修改性别
    onClickChangeGender() {
        if (this.localData.playerInfo.sex == 0) {
            cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, gender: 1 });
        } else {
            cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, gender: 0 });
        }
    },
    // 修改个人简介
    onClickChangeIntroduction() {
    },
    // 修改头像和头像框
    onClickChangeHead() {
        let url = "BalootClient/UserInfo/prefabs/PopupChangeHead"
        cc.vv.PopupManager.addPopup(url, {
            opacityIn: true,
            onShow: (node) => {
                node.getComponent("ChangeUserHead").init(this.localData)
            }
        })
    },
    // 更新giftItem
    onUpdateGiftItem(item, index) {
        item.getComponent("GiftItemCpt").onInit(cc.vv.UserManager.charmList[index], this.localData.playerInfo, this.localData.charmlist)
    },
    // 打开收礼列表
    onClickOpenGiftView() {
        let url = "BalootClient/UserInfo/prefabs/PopupGiftList"
        cc.vv.PopupManager.addPopup(url, { opacityIn: true })
    },
    // 设置性别男
    onClickSelectNan() {
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, gender: 1 });
    },
    // 设置性别女
    onClickSelectNv() {
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, gender: 0 });
    },
    // 点击举报
    onClickReport() {
        // cc.vv.NetManager.send({ c: 222 });
        // cc.vv.FloatTip.show(___("举报成功"));
        let url = "BalootClient/UserInfo/prefabs/PopupReport"
        cc.vv.PopupManager.addPopup(url, {
            onShow: (node) => {
                node.getComponent("PopupReport").onInit(this.localData.playerInfo);
            }
        })

    },

    onClickBlock() {
        // 请求更新
        cc.vv.UserManager.blockuids.push(this.uid);
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, blockuids: cc.vv.UserManager.blockuids });
    },
    onClickUnBlock() {
        let uids = cc.vv.UserManager.blockuids.filter((uid) => { return uid != this.uid; });
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, blockuids: uids });
    },
    // // 查看等级规则
    // onClickRuleLevel() {
    //     let wroldPos = this.btn_rule_level.node.convertToWorldSpaceAR(cc.v2(0, -50))
    //     let endPos = cc.find("Canvas").convertToNodeSpaceAR(wroldPos);
    //     let url = "BalootClient/UserInfo/prefabs/PopupRuleExp"
    //     cc.vv.PopupManager.addPopup(url, {
    //         noMask: true,
    //         pos: endPos,
    //         noCloseHit: true,
    //         onShow: (node) => {
    //             node.opacity = 0;
    //             node.position = endPos.add(cc.v2(0, 200))
    //             cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
    //             node.getComponent("UserExpRule").setType("level");
    //         }
    //     })
    // },
    // // 查看联赛规则
    // onClickRuleLeague() {
    //     let wroldPos = this.btn_rule_league.node.convertToWorldSpaceAR(cc.v2(0, -50))
    //     let endPos = cc.find("Canvas").convertToNodeSpaceAR(wroldPos);
    //     let url = "BalootClient/UserInfo/prefabs/PopupRuleExp"
    //     cc.vv.PopupManager.addPopup(url, {
    //         noMask: true,
    //         pos: endPos,
    //         noCloseHit: true,
    //         onShow: (node) => {
    //             node.opacity = 0;
    //             node.position = endPos.add(cc.v2(0, 200))
    //             cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
    //             node.getComponent("UserExpRule").setType("league");
    //         }
    //     })
    // },
    // 查看VIP
    onClickRuleVip() {
        let url = "YD_Pro/prefab/yd_vip"
        cc.vv.PopupManager.addPopup(url)

        // let wroldPos = this.btn_rule_vip.node.convertToWorldSpaceAR(cc.v2(-170, -50))
        // let endPos = cc.find("Canvas").convertToNodeSpaceAR(wroldPos);
        // let url = "BalootClient/UserInfo/prefabs/PopupRuleExp"
        // cc.vv.PopupManager.addPopup(url, {
        //     noMask: true,
        //     pos: endPos,
        //     noCloseHit: true,
        //     onShow: (node) => {
        //         node.opacity = 0;
        //         node.position = endPos.add(cc.v2(0, 200))
        //         cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
        //         node.getComponent("UserExpRule").setType("vip");
        //     }
        // })
    },

    onClickRuleBalance() {
        let wroldPos = this.btn_rule_balance.node.convertToWorldSpaceAR(cc.v2(0, -30))
        let endPos = cc.find("Canvas").convertToNodeSpaceAR(wroldPos);
        let url = "BalootClient/UserInfo/prefabs/PopupBalanceRule";
        cc.vv.PopupManager.addPopup(url, {
            noMask: true,
            pos: endPos,
            noCloseHit: true,
            onShow: (node) => {
                node.opacity = 0;
                node.position = endPos.add(cc.v2(0, 200))
                cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
            }
        })
    },

    onClickCopy() {
        if (CC_DEBUG) {
            cc.log("COPY: ", this.localData.playerInfo.uid)
        }
        cc.vv.FloatTip.show(___("复制成功"));
        cc.vv.PlatformApiMgr.Copy(this.localData.playerInfo.uid + "");
    },

    onClickKyc() {
        // let kyc = cc.vv.UserManager.kycUrl;
        // if (kyc) {
        //     cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
        //         onShow: (node) => {
        //             node.getComponent("yd_charge").setURL(kyc);
        //         }
        //     })
        // }
        cc.vv.PopupManager.addPopup("YD_Pro/prefab/PhoneBinding", {
            opacityIn: true
        });
    },

    onClickLogout() {
        // cc.vv.NetManager.send({c:MsgId.LOGIN_OUT}, true);
        cc.vv.NetManager.close();
        cc.vv.GameManager.goBackLoginScene();
    },
});
