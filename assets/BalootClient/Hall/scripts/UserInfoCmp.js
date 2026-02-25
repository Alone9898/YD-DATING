// 用户信息组件(头像 等级 金币 钻石)
cc.Class({
    extends: cc.Component,
    properties: {
        userHead: require("HeadCmp"),
        // levelNode: cc.Node,
        progressLevel: cc.ProgressBar,
        // labelCoin: cc.Label,
        nameLabel: cc.Label,
        uidLabel: cc.Label,

        vipExpNode: cc.Node,
        // rpLabel: cc.Label,
        // leagueExpNode: cc.Node,

        coinNode:cc.Node,
        cashNode:cc.Node,
        withdrawalNode: cc.Node,
    },
    onLoad() {
        this._svip = cc.vv.UserManager.svip;
        this._svipexp = cc.vv.UserManager.svipexp
        let netListener = this.node.addComponent("NetListenerCmp");
        let eventListener = this.node.addComponent("EventListenerCmp");
        // 监听更新金币事件
        eventListener.registerEvent(EventId.UPATE_COINS, this.updateCoin, this)
        // // 监听更新钻石更新
        // eventListener.registerEvent(EventId.UPATE_DIAMOND, this.updateDiamond, this)
        // 更新用户信息成功
        eventListener.registerEvent("USER_INFO_CHANGE", this.updateInfo, this);
        // 经验值变动
        eventListener.registerEvent("USER_EXP_CHANGE", this.updateExp, this);
        // 更新VIP经验值
        eventListener.registerEvent("USER_VIP_EXP_CHANGE", this.updateVipExp, this);
        // VIP升级
        netListener.registerMsg(MsgId.REQ_REFRESH_VIP, this.REQ_REFRESH_VIP, this);

        Global.btnClickEvent(cc.find("btn_add", this.coinNode),function () {
            if(Global.isIOSAndroidReview()){
                //前往充值
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            } else {
                cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                    onShow: (node) => {
                        node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                    }
                })
            }
        },this);
    },
    // 更新头像和头像框
    updateInfo: function () {
        if (this.userHead) {
            let uid = cc.vv.UserManager.uid
            let headIcon = cc.vv.UserManager.userIcon
            let avatarframe = cc.vv.UserManager.avatarframe || 0;
            this.userHead.setHead(uid, headIcon)
            this.userHead.setAvatarFrame(avatarframe)
        }
        if (this.nameLabel) {
            this.nameLabel.string = cc.vv.UserManager.nickName;
        }
        if (this.uidLabel) {
            this.uidLabel.string = cc.vv.UserManager.uid;
        }
        if (this.rpLabel) {
            this.rpLabel.string = cc.vv.UserManager.rp;
        }
        this.updateVipExp()
        // this.updateLeagueExp()
        this.updateCashBonus();
        this.updatewithdrawal();
    },
    // 金币 更新
    updateCoin: function () {

        cc.find("lbl_coin", this.coinNode).getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.UserManager.coin);

    },
    // Exp 更新
    updateExp: function () {
        //等级
        let lv = cc.vv.UserManager.level();
        if (this.levelNode) {
            this.levelNode.getComponent("LevelCpt").setLevel(lv);
        }
        let exp = cc.vv.UserManager.getCurExp()
        let upExp = cc.vv.UserConfig.getCmpLevelNeedExp(lv);
        let per = exp / upExp
        per = Math.min(per, 1)
        per = Math.max(per, 0)
        if (this.progressLevel) {
            this.progressLevel.progress = per
        }
    },
    // 更新VIP进度条
    updateVipExp() {
        this.vipExpNode.getComponent("VipExpCpt").updateVipExp();
    },

    // updateLeagueExp() {
    //     this.leagueExpNode.getComponent("LeagueExpCpt").updateView();
    // },

    // 播放VIP升级通知
    REQ_REFRESH_VIP(msg) {
        // 增加动画

    },
    // // Diamond 更新
    // updateDiamond() {
    //     this.labelDiamond.string = Global.FormatNumToComma(cc.vv.UserManager.getDiamond());
    // },

    // 优惠钱包金额
    updateCashBonus(){
        let dcashbonus = cc.vv.UserManager.dcashbonus;    //  可提现到现金余额的金额
        let cashbonus = cc.vv.UserManager.cashbonus;    // 优惠钱包金额

        if(cashbonus == 0){
            cc.find("progress", this.cashNode).getComponent(cc.ProgressBar).progress = 0;
        } else {
            cc.find("progress", this.cashNode).getComponent(cc.ProgressBar).progress = dcashbonus/cashbonus;
        }

        cc.find("value", this.cashNode).getComponent(cc.Label).string = `${dcashbonus}/${cashbonus}`;
    },

    // 提现金额
    updatewithdrawal() {
        cc.find("lbl_val", this.withdrawalNode).getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.UserManager.dcoin);

        Global.btnClickEvent(cc.find("btn_add", this.withdrawalNode),function () {
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge",{
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                }
            })
        },this);
    },

    // 更新全部
    updateAll() {
        this.updateInfo()
        this.updateExp()
        this.updateCoin()
        // this.updateDiamond()
        this.updateVipExp()
        // this.updateLeagueExp()
        this.updateCashBonus();
        this.updatewithdrawal();
    },
    start() {
        // 主动刷新一次用户数据
        this.updateAll()
    },
});
