const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewVip extends cc.Component {

    @property(cc.Label)
    vipTitle: cc.Label = null;
    // @property(cc.Label)
    // timeLabel: cc.Label = null;
    // @property(cc.Button)
    // btnReward: cc.Button = null;
    @property(cc.Button)
    btnLeft: cc.Button = null;
    @property(cc.Button)
    btnRight: cc.Button = null;
    @property(cc.Node)
    pageNode: cc.Node = null;
    @property(cc.ToggleContainer)
    pageToggles: cc.ToggleContainer = null;
    @property(cc.Node)
    toggleNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    chatAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    userComAtlas: cc.SpriteAtlas = null;
    @property(cc.Label)
    infoLabel: cc.Label = null;
    // @property(cc.Node)
    // vipInfoBase: cc.Node = null;
    @property(cc.Node)
    vipInfoEx: cc.Node = null;

    private netListener: any;
    private eventListener: any;

    private _index = 0;
    private vip1Data: any;
    private vip2Data: any;

    set index(value) {
        if (value < 0) {
            value += (Math.floor(Math.abs(value / 13)) + 1) * 13
        }
        this._index = value % 13;
        this.updateView();
    }
    get index() {
        return this._index;
    }

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");
        this.initView();

        this.btnLeft.node.on("click", () => {
            this.index--;
        })
        this.btnRight.node.on("click", () => {
            this.index++;
        })

        cc.find("btn_charge", this.vipInfoEx).on("click", () => {
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 3 });
        })

        //浏览了权益列表
        cc.vv.NetManager.send({ c: MsgId.REQ_RANK_MAIN_VIEW, id: 2 }, true);
    }

    protected onDestroy(): void {
    }

    protected onEnable(): void {
        this.index = Math.min(Math.max(0, cc.vv.UserManager.svip), 12);
        this.eventListener.registerEvent("USER_INFO_CHANGE", () => {
            this.index = Math.min(Math.max(0, cc.vv.UserManager.svip), 12);
        }, this);
        // 监听是否需要去领取奖励 
        this.eventListener.registerEvent("VIP_GET_REWARD", () => {
        }, this);
        this.updateView();
        // 主动领取奖励
        if (this.vip2Data && this.vip2Data.collect == 1) {
        }
    }

    protected onDisable(): void {
        this.netListener.clear();
        this.eventListener.clear();
    }
    // 加载数据
    initData(vip1Data: any, vip2Data: any) {
        this.vip1Data = vip1Data;
        this.vip2Data = vip2Data;
        this.updateView();
    }
    // 初始化界面
    initView() {
        // this.pageCpt.enabled = false;
        for (let i = 0; i < 12; i++) {
            cc.instantiate(this.toggleNode).parent = this.pageToggles.node;
        }
        // this.btnReward.getComponent("ButtonGrayCmp").interactable = false;
        cc.find("reward/gou", this.pageNode).active = false;
        this.index = cc.vv.UserManager.svip;
    }
    // 刷新界面
    updateView() {
        // 拿到客户端VIP(服务器认为svip=1 为客户端界面的vip0)
        let tempVip = cc.vv.UserManager.svip - 1;
        this.scheduleOnce(() => {
            this.pageToggles.toggleItems[this.index].isChecked = true;
        })
        let config = cc.vv.UserConfig.vipInfoConfig[this.index];
        // 头像框
        if (config.avatarframe) {
            cc.find("frame", this.pageNode).active = true;
            cc.vv.UserConfig.setAvatarFrame(cc.find("frame/spine", this.pageNode).getComponent(sp.Skeleton), config.avatarframe);
        } else {
            cc.find("frame", this.pageNode).active = false;
        }
        // 全服礼物
        if (config.gift) {
            cc.find("gift", this.pageNode).active = true;
            cc.find("gift/icon", this.pageNode).getComponent(cc.Sprite).spriteFrame = this.userComAtlas.getSpriteFrame(config.gift.img);
            cc.find("gift/value", this.pageNode).getComponent(cc.Label).string = "x" + config.gift.count;
        } else {
            cc.find("gift", this.pageNode).active = false;
        }
        // 互动表情
        cc.find("emojoy/spine", this.pageNode).getComponent(sp.Skeleton).setAnimation(0, config.emoj, true);
        // 聊天框
        if (config.chatSkin) {
            cc.find("chatbox", this.pageNode).active = true;
            cc.find("chatbox/icon", this.pageNode).getComponent(cc.Sprite).spriteFrame = this.chatAtlas.getSpriteFrame(config.chatSkin);
            // cc.find("chatbox/icon/icon_number", this.pageNode).getComponent(cc.Sprite).spriteFrame = this.chatAtlas.getSpriteFrame("text_" + config.chatSkin);
        } else {
            cc.find("chatbox", this.pageNode).active = false;
        }
        // 每日奖励
        cc.find("reward/layout/coin", this.pageNode).active = false;
        cc.find("reward/layout/diamond", this.pageNode).active = false;
        if (config.rewards.length == 1) {
            cc.find("reward/layout", this.pageNode).scale = 1;
        } else {
            cc.find("reward/layout", this.pageNode).scale = 0.8;
        }
        for (const item of config.rewards) {
            if (item.type == 1) {
                cc.find("reward/layout/coin", this.pageNode).active = true;
                cc.find("reward/layout/coin/value", this.pageNode).getComponent(cc.Label).string = item.count.toString();
            }
            if (item.type == 25) {
                cc.find("reward/layout/diamond", this.pageNode).active = true;
                cc.find("reward/layout/diamond/value", this.pageNode).getComponent(cc.Label).string = item.count.toString();
            }
        }
        //文字部分权益
        let lblList = cc.find("lbl_benefits", this.node)
        lblList.removeAllChildren()
        let lblItem = cc.find("lbl_benefits_item", this.node)
        let _addLblItem = function (des) {
            let addItem = cc.instantiate(lblItem)
            addItem.active = true
            addItem.parent = lblList
            cc.find("des", addItem).getComponent(cc.Label).string = des
        }
        //沙龙房间数
        _addLblItem(___("沙龙房间数:{1}", config.room))
        //免费参加排位赛
        if (config.freeRank) {
            _addLblItem(___("免费参加排位赛"))
        }
        //好友上限
        if (config.friendadd) {
            _addLblItem(___("好友上限:{1}", config.friendadd))
        }
        //票数
        // _addLblItem(___("票数:{1}", config.tickets))
        cc.vv.UserConfig.setVipFrame(cc.find("vipicon", this.node).getComponent(cc.Sprite), this.index + 1);
        cc.find("vipicon", this.node).active = this.index == 0;
        this.vipTitle.string = ___("VIP{1} 权益", this.index || '');
        // 没有成为VIP显示
        // this.vipInfoBase.active = this.index == 0;
        this.vipInfoEx.active = this.index != 0;
        if (this.vip1Data) {
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(this.vip1Data.productid);
            }
            localPrice = localPrice || __(this.vip1Data.unit, Global.FormatNumToComma(this.vip1Data.amount));
        }
        if (this.vip2Data) {
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(this.vip2Data.productid);
            }
            localPrice = localPrice || __(this.vip2Data.unit, Global.FormatNumToComma(this.vip2Data.amount));
            // cc.find("layout/btn2/btn_pay/lbl_price", this.vipInfoBase).getComponent(cc.Label).string = localPrice;
            // 每日奖励领取按钮
            if (tempVip == this.index) {
                // 当前VIP
                // this.btnReward.node.active = this.vip2Data.collect == 1;
                // this.btnReward.getComponent("ButtonGrayCmp").interactable = this.vip2Data.collect == 1;
                cc.find("reward/gou", this.pageNode).active = this.vip2Data.collect == 2;
            } else if (tempVip < this.index) {
                // 未达到的VIP界面
                // this.btnReward.node.active = true;
                // this.btnReward.getComponent("ButtonGrayCmp").interactable = false;
                cc.find("reward/gou", this.pageNode).active = false;
            } else if (tempVip > this.index) {
                // 已达到的VIP界面
                // this.btnReward.node.active = false;
                cc.find("reward/gou", this.pageNode).active = false;
            }
        }
        // VIP内容显示
        cc.find("hit", this.vipInfoEx).active = false;
        cc.find("gou", this.vipInfoEx).active = false;
        cc.find("btn_charge", this.vipInfoEx).active = false;

        // let isVip = cc.vv.UserManager.svip > 0
        // // 使用svip判断是否具有充值
        // if (isVip) {
        //     if (tempVip >= this.index) {
        //         cc.find("gou", this.vipInfoEx).active = false;
        //     } else {
        //         cc.find("btn_charge", this.vipInfoEx).active = false;
        //     }
        // } else {
        //     cc.find("hit", this.vipInfoEx).active = false;
        // }
        // 进度条更新
        let curExp = Math.min(cc.vv.UserManager.svipexp, config.expup)
        cc.find("layout/progress/label", this.vipInfoEx).getComponent(cc.Label).string = Global.FormatNumToComma(curExp) + "/" + Global.FormatNumToComma(config.expup);
        cc.find("layout/progress", this.vipInfoEx).getComponent(cc.ProgressBar).progress = curExp / config.expup;
        cc.vv.UserConfig.setVipFrame(cc.find("layout/vip", this.vipInfoEx).getComponent(cc.Sprite), this.index + 1);
        // if (this.index == 0) {
        //     // 在充值页面
        //     if (isVip) {
        //         this.infoLabel.string = ___("VIP续费");
        //     } else {
        //         this.infoLabel.string = ___("成为VIP");
        //     }
        //     cc.find("info_layout_ar", this.node).active = false;
        //     cc.find("info_layout_en", this.node).active = false;
        // } else {
        // }
        // 在进度界面
        if (cc.vv.UserManager.svip > this.index) {
            this.infoLabel.string = ___("恭喜您已经成为VIP{1}", this.index);
            cc.find("info_layout_ar", this.node).active = false;
            cc.find("info_layout_en", this.node).active = false;
        } else {
            if (this.index == 0) {
                this.infoLabel.string = ___("购买开启VIP资格");
                cc.find("info_layout_ar", this.node).active = false;
                cc.find("info_layout_en", this.node).active = false;
            } else {
                this.infoLabel.string = '';
                cc.find("info_layout_ar/value", this.node).getComponent(cc.Label).string = config.expup.toString();
                cc.find("info_layout_en/value", this.node).getComponent(cc.Label).string = config.expup.toString();
                cc.find("info_layout_ar/vip", this.node).getComponent(cc.Label).string = "VIP" + this.index.toString();
                cc.find("info_layout_en/vip", this.node).getComponent(cc.Label).string = "VIP" + this.index.toString();
                cc.find("info_layout_ar", this.node).active = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR;
                cc.find("info_layout_en", this.node).active = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.EN;
            }
        }
    }
    // 切换page
    onChangeIndex() {
        let toggle = null;
        for (const _t of this.pageToggles.toggleItems) {
            if (_t.isChecked) toggle = _t;
        }
        this.index = this.pageToggles.toggleItems.indexOf(toggle);
    }
    // 领取vip每日奖励返回
    REQU_GET_VIP_REWARD(msg) {
    }

}
