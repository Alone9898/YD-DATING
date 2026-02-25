import ShopViewSkinItem from "./ShopViewSkinItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewSkin extends cc.Component {
    @property(cc.Prefab)
    pagePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    // @property(cc.Prefab)
    // infoPopup: cc.Prefab = null;

    private config: any;
    private netListener: any;
    private eventListener: any;
    private itemPool: cc.NodePool;
    private shoplist: any;
    private keyMap: any[] = [];
    pageNode: cc.Node;
    private loading: boolean;

    onLoad() {
        // cc.log("ShopViewSkin", "onLoad");
        this.keyMap = [
            { key: "data1", get title() { return ___("头像框") } },
            { key: "data2", get title() { return ___("聊天框与字体") } },
            { key: "data3", get title() { return ___("牌桌") } },
            { key: "data4", get title() { return ___("牌背") } },
            { key: "data5", get title() { return ___("牌花") } },
            { key: "data7", get title() { return ___("字体颜色") } },
            { key: "data9", get title() { return ___("经验值道具") } },
            { key: "data6", get title() { return ___("表情包") } },
        ];
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");
        this.itemPool = new cc.NodePool(ShopViewSkinItem);
        this.initView();
    }

    protected onDestroy(): void {
        this.itemPool.clear();
    }

    protected onEnable(): void {
        // cc.log("ShopViewSkin", "onEnable");
        // 获取配置
        this.netListener.registerMsg(MsgId.REQ_SKIN_SHOP, this.REQ_SKIN_SHOP, this);
        // 购买结果
        this.netListener.registerMsg(MsgId.REQ_BUY_SKIN_SHOP_ITEM, this.REQ_BUY_SKIN_SHOP_ITEM, this);
        // 下单购买道具结果
        this.netListener.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
        // 点击购买皮肤
        this.eventListener.registerEvent("CLICK_BUY_SKIN_ITEM", this.CLICK_BUY_SKIN_ITEM, this);
        // 点击使用皮肤
        this.eventListener.registerEvent("CLICK_USE_SKIN_ITEM", this.CLICK_USE_SKIN_ITEM, this);
        // 点击非卖品
        this.eventListener.registerEvent("CLICK_CHECK_SKIN_ITEM", this.CLICK_CHECK_SKIN_ITEM, this);

        // 更新用户信息成功
        this.eventListener.registerEvent("USER_INFO_CHANGE", this.updateView, this);
        // 请求配置
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SKIN_SHOP, platform: Global.isIOS() ? 2 : 1 }, true);

    }

    protected onDisable(): void {
        // cc.log("ShopViewSkin", "onDisable");
        this.netListener.clear();
    }

    initView() {
        // 预加载一些节点
        for (let i = 0; i < 50; i++) {
            this.itemPool.put(cc.instantiate(this.itemPrefab));
        }
        this.pageNode = cc.instantiate(this.pagePrefab)
        this.pageNode.parent = this.node;
        // for (let i = 0; i < this.keyMap.length; i++) {
        //     pageNode.parent = this.node;
        // }
    }

    updateView() {
        if (!this.shoplist) return;
        let data = [];
        for (let i = 0; i < this.keyMap.length; i++) {
            // let pageNode = this.node.children[i];
            let cfg = this.keyMap[i];
            cc.find("title/label", this.pageNode).getComponent(cc.Label).string = cfg.title;
            let tempData = this.shoplist[cfg.key] || [];
            data = data.concat(tempData);
        }
        // 更新Item
        let pageContent = cc.find("content", this.pageNode);
        let offset = data.length - pageContent.children.length;
        if (offset > 0) {
            for (let i = 0; i < offset; i++) {
                pageContent.addChild(this.createItemNode());
            }
        } else if (offset < 0) {
            let count = Math.abs(offset);
            while (count > 0) {
                this.itemPool.put(pageContent.children[0]);
                count--;
            }
        }
        for (let i = 0; i < pageContent.children.length; i++) {
            const itemNode = pageContent.children[i];
            itemNode.getComponent(ShopViewSkinItem).updateView(data[i]);
        }
    }
    // 获取一个item
    createItemNode() {
        if (this.itemPool.size() > 0) {
            return this.itemPool.get();
        } else {
            let node = cc.instantiate(this.itemPrefab);
            node.getComponent(ShopViewSkinItem).reuse();
            return node;
        }
    }
    // 拿到所有配置
    REQ_SKIN_SHOP(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        this.shoplist = msg.shoplist || {};
        this.updateView();
    }
    // 购买结果
    REQ_BUY_SKIN_SHOP_ITEM(msg: any) {
        // this.loading = false;
        if (msg.code != 200) return;
        if (msg.spcode == 2) {
            cc.vv.FloatTip.show(___("金币不足"));
            return;
        }
        for (const key in this.shoplist) {
            for (const tempListData of this.shoplist[key]) {
                if (tempListData.id == msg.item.id && msg.item.category != 9) {
                    tempListData.have = 1;
                }
            }
        }
        // 飞道具
        // 更新Item
        let pageContent = cc.find("content", this.pageNode);
        for (let i = 0; i < pageContent.children.length; i++) {
            const itemNode = pageContent.children[i];
            let itemCpt = itemNode.getComponent(ShopViewSkinItem)
            if (itemCpt.data.id == msg.id) {
                Global.RewardFly(msg.rewards, itemNode.convertToWorldSpaceAR(cc.v2(0, 0)));
                break;
            }
        }
        this.updateView();
    }
    // 点击购买
    CLICK_BUY_SKIN_ITEM(event, pos) {
        // if (this.loading) return;
        // this.loading = true;
        let data = event.detail;
        if (data.amount > 0) {
            if (Global.isNative()) {
                cc.vv.PayMgr.reqPurchaseOrder(data.shopid);
            } else if (CC_DEBUG) {
                cc.vv.NetManager.send({ c: 356, id: data.shopid });
            }
            StatisticsMgr.reqReport(ReportConfig.SHOP_BUY_SKIN, data.shopid);
        } else {
            cc.vv.NetManager.send({ c: MsgId.REQ_BUY_SKIN_SHOP_ITEM, id: data.id });
        }
    }
    // 点击切换皮肤
    CLICK_USE_SKIN_ITEM(event) {
    }
    // 点击非卖品
    CLICK_CHECK_SKIN_ITEM(event) {
    }

    // 购买VIP成功
    PURCHASE_RECHARGE_SUC(msg) {
        if (msg.code != 200) return;


        for (const key in this.shoplist) {
            for (const tempListData of this.shoplist[key]) {
                if (tempListData.shopid == msg.shopid) {
                    tempListData.have = 1;
                }
            }
        }
        this.updateView();

        if (msg.rewards) {
            let tempNode = null;
            let pageContent = cc.find("content", this.pageNode);
            for (let i = 0; i < pageContent.children.length; i++) {
                const itemNode = pageContent.children[i];
                let itemCpt = itemNode.getComponent(ShopViewSkinItem)
                if (itemCpt.data.shopid == msg.shopid) {
                    tempNode = itemNode;
                    break;
                }
            }
            if (tempNode) {
                Global.RewardFly(msg.rewards, tempNode.convertToWorldSpaceAR(cc.v2(0, 0)));
            }
        }
    }

}
