cc.Class({
    extends: cc.Component,

    properties: {
        chatBoxAtlas: cc.SpriteAtlas,
        pokerBackAtlas: cc.SpriteAtlas,
        skinShopAtlas: cc.SpriteAtlas,
        btnConfim: cc.Button,
        btnCancel: cc.Button,
    },

    onLoad() {
        this.btnConfim.node.on("click", () => {
            cc.vv.PopupManager.removePopup(this.node);
            if (this.confimCallback) {
                this.confimCallback();
            }
        })
        this.btnCancel.node.on("click", () => {
            cc.vv.PopupManager.removePopup(this.node);
            if (this.cancelCallback) {
                this.cancelCallback();
            }
        })
    },

    initData(data, confimCallback, cancelCallback) {
        StatisticsMgr.reqReport(ReportConfig.SHOP_SKIN_INFO, data.id);
        this.confimCallback = confimCallback;
        this.cancelCallback = cancelCallback;
        let item = this.node;
        cc.find("title", item).getComponent(cc.Label).string = data.title;
        cc.find("price/value", item).getComponent(cc.Label).string = data.diamond;
        cc.find("price/name", item).getComponent(cc.Label).string = data.title;
        cc.find("avatar", item).active = data.category == 1;
        cc.find("icon", item).active = data.category != 1;
        cc.find("avatar", item).scale = 1;
        cc.find("icon", item).scale = 1;
        cc.find("icon", item).rotation = 0;
        if (data.category == 1) {
            // 头像框
            cc.vv.UserConfig.setAvatarFrame(cc.find("avatar", item).getComponent(sp.Skeleton), data.img);
            cc.find("avatar", item).scale = 2;
        } else if (data.category == 2) {
            // 聊天框
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.chatBoxAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 2;
        } else if (data.category == 3) {
            // 牌桌
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1.3;
            cc.find("icon", item).rotation = 90;
        } else if (data.category == 4) {
            // 牌背
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.pokerBackAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 1.3;
        } else if (data.category == 5) {
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame("icon_info_" + data.img);
        } else if (data.category == 6) {
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame("icon_info_" + data.img);
        } else {
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            cc.find("icon", item).scale = 2;
        }
        // 判断是否隐藏 操作按钮
        if (data.have == 1 || data.diamond <= 0 || data.free == 1) {
            this.btnConfim.node.active = false;
            this.btnCancel.node.active = false;
            cc.find("price/value", item).active = false;
            cc.find("price/icon_diamond", item).active = false;
            cc.find("price/name", item).active = true;
        } else {
            this.btnConfim.node.active = true;
            this.btnCancel.node.active = true;
            cc.find("price/value", item).active = true;
            cc.find("price/icon_diamond", item).active = true;
            cc.find("price/name", item).active = false;
        }
    },

    // update (dt) {},
});
