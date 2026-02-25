/**
 * shop-vip
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewVip extends cc.Component {

    @property(cc.Prefab)
    vipBenefitsPrefab: cc.Prefab = null;

    @property(cc.Button)
    btnLeft: cc.Button = null;
    @property(cc.Button)
    btnRight: cc.Button = null;
    @property(cc.Button)
    btnReward: cc.Button = null;

    @property(cc.Node)
    pageNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    chatAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    userComAtlas: cc.SpriteAtlas = null;

    @property(cc.Button)
    getBtn: cc.Button = null;

    private vip1Data: any;
    private vip2Data: any;
    private vipInfoBase: any;
    private vipgift: any;

    private _index = 0;
    private vipGiftId: number;

    set index(value) {
        this._index = this.calcIndex(value)
        this.updateView();
    }
    get index() {
        return this._index;
    }

    eventListener: any;
    netListener: any;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");

        this.vipInfoBase = cc.find("vip_info_base", this.node)

        cc.find("layout/btn1/btn_pay", this.vipInfoBase).on("click", () => {
            StatisticsMgr.reqReport(ReportConfig.SHOP_BUY_VIP_7);
            if (Global.isNative()) {
                cc.vv.PayMgr.reqPurchaseOrder(this.vip1Data.id);
            } else if (CC_DEBUG) {
                cc.vv.NetManager.send({ c: 356, id: this.vip1Data.id });
            }
        })
        cc.find("layout/btn2/btn_pay", this.vipInfoBase).on("click", () => {
            StatisticsMgr.reqReport(ReportConfig.SHOP_BUY_VIP_30);
            if (Global.isNative()) {
                cc.vv.PayMgr.reqPurchaseOrder(this.vip2Data.id);
            } else if (CC_DEBUG) {
                cc.vv.NetManager.send({ c: 356, id: this.vip2Data.id });
            }
        })
        cc.find("vip_info/btn_gift/btn_green", this.node).on("click", () => {
            // StatisticsMgr.reqReport(ReportConfig.SHOP_BUY_VIP_30);
            if (this.vipgift) {
                if (Global.isNative()) {
                    cc.vv.PayMgr.reqPurchaseOrder(this.vipgift.id);
                } else if (CC_DEBUG) {
                    cc.vv.NetManager.send({ c: 356, id: this.vipgift.id });
                }
            }
        })
        cc.find("vip_info/quanyi/btn_benefits", this.node).on("click", () => {
            //显示权益列表
            cc.vv.PopupManager.addPopup(this.vipBenefitsPrefab, {
                opacityIn: true,
                onShow: (node) => {
                    node.getComponent("ShopViewVipBenefits").initData(this.vip1Data, this.vip2Data);
                }
            })
        })

        this.getBtn.node.on("click", this.onClickGetReward, this);

        this.btnLeft.node.on("click", () => {
            this.index--;
        })
        this.btnRight.node.on("click", () => {
            this.index++;
        })
        this.btnReward.node.on("click", () => {
            if (this.vip2Data && this.vip2Data.collect == 1) {
            }
        })
    }

    protected onEnable(): void {
        this.netListener.registerMsg(MsgId.GET_ALL_VIP_REAWRDS, this.GET_ALL_VIP_REAWRDS, this);
        this.netListener.registerMsg(MsgId.REQ_SHOP_EX, this.REQ_SHOP_EX, this);
        this.netListener.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
        this.eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        // 设置当前的VIP对应权益
        this.index = Math.min(Math.max(0, cc.vv.UserManager.svip - 1), 12);
    }

    protected onDestroy(): void {
        this.eventListener.clear();
        this.netListener.clear();
    }

    calcIndex(value) {
        if (value < 0) {
            value += (Math.floor(Math.abs(value / 13)) + 1) * 13
        }
        return value % 13;
    }

    REQ_SHOP_EX(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        let shoplist = msg.shoplist || {};
        if (shoplist.data30 && shoplist.data30.length > 0) {
        } else {
            this.vipgift = null;
            this.updateView();
        }
    }

    start() {
        this.updateView()
    }

    initData(vip1, vip2, vipgift) {
        this.vip1Data = vip1;
        this.vip2Data = vip2;
        this.vipgift = vipgift;
        if (this.vipgift) this.vipGiftId = this.vipgift.id
    }

    updateView() {
        // index 0-11 代表了vip1 -vip12
        let curVipLevel = this.index;
        curVipLevel = Math.max(curVipLevel, 0);
        curVipLevel = Math.min(curVipLevel, 12);
        let config = cc.vv.UserConfig.vipInfoConfig[curVipLevel];
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
        cc.find("emojoy/spine", this.pageNode).position = cc.v3(0, config.emoj == "5_st" ? -50 : 0);
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
                cc.find("reward/layout/coin/value", this.pageNode).getComponent(cc.Label).string = Global.FormatNumToComma(item.count);
            }
            if (item.type == 25) {
                cc.find("reward/layout/diamond", this.pageNode).active = true;
                cc.find("reward/layout/diamond/value", this.pageNode).getComponent(cc.Label).string = Global.FormatNumToComma(item.count);
            }
        }
        // 剩余时间
        let timeLabel = cc.find('day', this.node)
        if (cc.vv.UserManager.leftdays > 0) {
            timeLabel.getComponent(cc.Label).string = ___("剩余VIP时间:{1}天", cc.vv.UserManager.leftdays);
        } else {
            timeLabel.getComponent(cc.Label).string = ___("购买开启VIP资格,根据不同档位享受VIP权益时间!");
        }
        // 商品价格
        if (this.vip1Data) {
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(this.vip1Data.productid);
            }
            localPrice = localPrice || __(this.vip1Data.unit, Global.FormatNumToComma(this.vip1Data.amount));
            cc.find("layout/btn1/btn_pay/lbl_price", this.vipInfoBase).getComponent(cc.Label).string = localPrice;
        }
        if (this.vip2Data) {
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(this.vip2Data.productid);
            }
            localPrice = localPrice || __(this.vip2Data.unit, Global.FormatNumToComma(this.vip2Data.amount));
            cc.find("layout/btn2/btn_pay/lbl_price", this.vipInfoBase).getComponent(cc.Label).string = localPrice;
        }
        // 进度条更新
        if (config.expup <= 0) {
            cc.find("vip_info/layout/progress/label", this.node).getComponent(cc.Label).string = cc.vv.UserManager.svip > 0 ? ___("已激活") : ___("未激活");
            cc.find("vip_info/layout/progress", this.node).getComponent(cc.ProgressBar).progress = cc.vv.UserManager.svip > 0 ? 1 : 0;
        } else {
            let curExp = Math.min(cc.vv.UserManager.svipexp, config.expup)
            cc.find("vip_info/layout/progress/label", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(curExp) + "/" + Global.FormatNumToComma(config.expup);
            cc.find("vip_info/layout/progress", this.node).getComponent(cc.ProgressBar).progress = curExp / config.expup;
        }
        cc.vv.UserConfig.setVipFrame(cc.find("vip_info/layout/icon", this.node).getComponent(cc.Sprite), curVipLevel + 1);
        if (cc.vv.UserManager.svip > curVipLevel) {
            // 已经成为VIP界面
            cc.find("vip_info/info_layout_complete", this.node).active = true;
            cc.find("vip_info/info_layout_complete", this.node).getComponent(cc.Label).string = ___("恭喜您已经成为VIP{1}", curVipLevel);
            cc.find("vip_info/info_layout_ar", this.node).active = false;
            cc.find("vip_info/info_layout_en", this.node).active = false;
        } else {
            // 未达到VIP界面
            if (curVipLevel == 0) {
                cc.find("vip_info/info_layout_complete", this.node).active = true;
                cc.find("vip_info/info_layout_complete", this.node).getComponent(cc.Label).string = ___("购买开启VIP资格");
                cc.find("vip_info/info_layout_ar", this.node).active = false;
                cc.find("vip_info/info_layout_en", this.node).active = false;
            } else {
                cc.find("vip_info/info_layout_complete", this.node).active = false;
                cc.find("vip_info/info_layout_ar/value", this.node).getComponent(cc.Label).string = config.expup.toString();
                cc.find("vip_info/info_layout_en/value", this.node).getComponent(cc.Label).string = config.expup.toString();
                cc.find("vip_info/info_layout_ar/vip", this.node).getComponent(cc.Label).string = "VIP" + curVipLevel.toString();
                cc.find("vip_info/info_layout_en/vip", this.node).getComponent(cc.Label).string = "VIP" + curVipLevel.toString();
                cc.find("vip_info/info_layout_ar", this.node).active = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR;
                cc.find("vip_info/info_layout_en", this.node).active = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.EN;
            }
        }
        // 更新VIP大礼包
        if (this.vipgift && cc.vv.UserManager.svip < 6) {
            cc.find("vip_info/btn_gift", this.node).active = true;
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(this.vipgift.productid);
            }
            localPrice = localPrice || __(this.vipgift.unit, Global.FormatNumToComma(this.vipgift.amount));
            cc.find("vip_info/btn_gift/btn_green/label", this.node).getComponent(cc.Label).string = localPrice;
            cc.find("vip_info/btn_gift/price/value", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(this.vipgift.diamond)
            this.node.height = 1400;
        } else {
            cc.find("vip_info/btn_gift", this.node).active = false;
            this.node.height = 1050
        }
        let curRewardState = cc.vv.UserManager.getviplv[curVipLevel] || 0;
        // 是否可以领取VIP奖励
        this.getBtn.getComponent("ButtonGrayCmp").interactable = curRewardState == 1;
        cc.find("red", this.getBtn.node).active = curRewardState == 1;
        // 更新奖励领取状态
        cc.find("frame/icon_ok", this.pageNode).active = curRewardState == 2;
        cc.find("emojoy/icon_ok", this.pageNode).active = curRewardState == 2;
        cc.find("chatbox/icon_ok", this.pageNode).active = curRewardState == 2;
        cc.find("gift/icon_ok", this.pageNode).active = curRewardState == 2;
        cc.find("reward/icon_ok", this.pageNode).active = false;
        // 左右按钮红点

        let hasLeftRed = false;
        let hasRightRed = false;
        for (let i = 0; i < cc.vv.UserManager.getviplv.length; i++) {
            const state = cc.vv.UserManager.getviplv[i];
            if (i < curVipLevel && state == 1) {
                hasLeftRed = true;
            }
            if (i > curVipLevel && state == 1) {
                hasRightRed = true;
            }
        }
        cc.find("red", this.btnLeft.node).active = hasLeftRed;
        cc.find("red", this.btnRight.node).active = hasRightRed;
    }

    // 领取vip每日奖励返回
    REQU_GET_VIP_REWARD(msg) {
        // 更新VIP信息
        if (msg.code != 200) return;
        // 提示领取金币成功
        Global.RewardFly(msg.rewards, this.btnReward.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        // 修改本地数据
        this.vip1Data.collect = 2;
        this.vip2Data.collect = 2;
        this.updateView();
    }

    // 购买VIP成功
    PURCHASE_RECHARGE_SUC(msg) {
        if (msg.code != 200) return;
        if (msg.rewards) {
            let tempNode = null;
            let hasReward = false;
            if (this.vip1Data && this.vip1Data.id == msg.shopid) {
                hasReward = true;
                tempNode = cc.find("layout/btn1/btn_pay", this.vipInfoBase)
            }
            if (this.vip2Data && this.vip2Data.id == msg.shopid) {
                hasReward = true;
                tempNode = cc.find("layout/btn2/btn_pay", this.vipInfoBase)
            }
            if (this.vipGiftId && this.vipGiftId == msg.shopid) {
                hasReward = true;
                tempNode = cc.find("vip_info/btn_gift", this.node)
            }
            if (hasReward) {
                if (tempNode) {
                    Global.RewardFly(msg.rewards, tempNode.convertToWorldSpaceAR(cc.v2(0, 0)));
                } else {
                    Global.RewardFly(msg.rewards, this.node.convertToWorldSpaceAR(cc.v2(0, -300)));
                }
            }
        }
    }
    // 领取奖励
    onClickGetReward() {
        cc.vv.NetManager.send({ c: MsgId.GET_ALL_VIP_REAWRDS, vip: this.index });
    }
    // 一键领取VIP奖励结果
    GET_ALL_VIP_REAWRDS(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        Global.RewardFly(msg.rewards, this.getBtn.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        // 更新按钮状态
        this.getBtn.getComponent("ButtonGrayCmp").interactable = false;
    }
    // 用户信息改变
    USER_INFO_CHANGE() {
        // this.index = Math.min(Math.max(0, cc.vv.UserManager.svip - 1), 12);
        this.updateView();
    }

}
