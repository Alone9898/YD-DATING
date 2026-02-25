const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewSkinItem extends cc.Component {

    @property(cc.SpriteAtlas)
    userCommonAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    chatBoxAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    pokerBackAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    skinShopAtlas: cc.SpriteAtlas = null;

    public data: any;
    private changeParm: {};
    colorMap: { 100: cc.Color; 50: cc.Color; 25: cc.Color; };

    protected onLoad(): void {
        this.colorMap = {
            [100]: new cc.Color(231, 81, 90),
            [50]: new cc.Color(76, 189, 107),
            [25]: new cc.Color(246, 181, 25),
        }
    }

    reuse() {
        // cc.log("ShopViewSkinItem", "reuse")
        // this.node.on("click", this.onClick, this);
    }

    unuse() {
        // cc.log("ShopViewSkinItem", "unuse")
        // this.node.off("click", this.onClick, this);
    }

    onClick() {
        // cc.log("ShopViewSkinItem", this.data)
        // 区分状态
        if (this.data.have == 1 || this.data.free == 1) {// 判断是否拥有 + 判断是否免费
            Global.dispatchEvent("CLICK_USE_SKIN_ITEM", this.changeParm);
        } else {
            // let nodeWorldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0))
            Global.dispatchEvent("CLICK_BUY_SKIN_ITEM", this.data);
        }
    }

    updateView(data) {
        this.data = data;
        let item = this.node;
        cc.find("hit", item).active = false;
        cc.find("price", item).active = false;
        cc.find("own", item).active = false;
        // 设置显示
        if (data.have == 1) {
            cc.find("own", item).active = true;
        } else if (data.amount > 0) {
            // 显示价格
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(data.productid);
            }
            localPrice = localPrice || __(data.unit, Global.FormatNumToComma(data.amount));
            cc.find("price", item).active = true;
            cc.find("price/layout/icon_diamond", item).active = false;
            cc.find("price/layout/value", item).getComponent(cc.Label).string = localPrice;
        } else if (data.free == 1) {
            // 免费的 或者 不能够买的 都显示 content
            cc.find("hit", item).active = true;
            cc.find("hit/value", item).getComponent(cc.Label).string = data.content;
        } else {
            cc.find("price", item).active = true;
            cc.find("price/layout/icon_diamond", item).active = true;
            cc.find("price/layout/value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.diamond);
        }
        // 设置显示
        cc.find("avatar", item).active = data.category == 1;
        cc.find("icon", item).active = data.category != 1;
        cc.find("icon", item).scale = 1;
        cc.find("icon", item).angle = 0;
        cc.find("icon", item).position = cc.v3(0, 32);

        cc.find("rate", item).active = false;
        cc.find("title", item).active = false;
        cc.find("exptime", item).active = false;

        if (data.category == 1) {
            // 头像框
            cc.vv.UserConfig.setAvatarFrame(cc.find("avatar", item).getComponent(sp.Skeleton), data.img);
        } else if (data.category == 2) {
            // 聊天框
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.chatBoxAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1.65;
        } else if (data.category == 3) {
            // 牌桌
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1;
            // cc.find("icon", item).angle = 90;
        } else if (data.category == 4) {
            // 牌背
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.pokerBackAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1.75;
            // cc.find("icon", item).y = 0.75;
        } else if (data.category == 5) {
            // 牌花
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 0.8;
        } else if (data.category == 6) {
            // 表情
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 0.55;
        } else if (data.category == 7) {
            // 字体颜色
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
        } else if (data.category == 9) {
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.userCommonAtlas.getSpriteFrame(data.img);
            cc.find("title", item).active = true;
            cc.find("exptime", item).active = true;
            cc.find("rate", item).active = true;
            cc.find("title", item).getComponent(cc.Label).string = ___("经验值道具");
            cc.vv.UserConfig.setExpBuffFrame(cc.find("rate", item).getComponent(cc.Sprite), data.buffer);
            cc.find("icon", item).scale = 0.8;
            cc.find("icon", item).position = cc.v3(0, 0);
            cc.find("rate", item).color = this.colorMap[data.buffer] || cc.Color.WHITE;
        }
        // 判断是否已经被用户使用
        this.changeParm = {};
        // 商城页面 关闭选中判断
        cc.find("use", item).active = false;
        // HOT & NEW
        cc.find("icon_hot", item).active = data.hot == 1;
        cc.find("icon_new", item).active = data.new == 1;
        // time
        cc.find("time", item).active = (data.days && data.days > 0);
        cc.find("time/value", item).getComponent(cc.Label).string = ___("{1}天", data.days);
    }
}
