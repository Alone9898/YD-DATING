cc.Class({
    extends: cc.Component,
    properties: {
        chatBoxAtlas: cc.SpriteAtlas,
        pokerBackAtlas: cc.SpriteAtlas,
        skinShopAtlas: cc.SpriteAtlas,
    },

    onLoad() {
        this.node.on("click", () => {
            if (this.oprType == 1) {
                Global.dispatchEvent("CLICK_USE_SKIN_ITEM", this.changeParm);
            } else {
                Global.dispatchEvent("CLICK_BUY_SKIN_ITEM", this.data);
            }
        })
    },

    updateView(item, data, isBig, oprType) {
        this.data = data;
        this.oprType = oprType;
        cc.find("hit", item).active = false;
        cc.find("price", item).active = false;
        cc.find("own", item).active = false;
        // 设置显示
        if (data.have == 1) {
            cc.find("own", item).active = true;
        } else if (data.diamond <= 0 || data.free == 1) {
            // 免费的 或者 不能够买的 都显示 content
            cc.find("hit", item).active = true;
            cc.find("hit/value", item).getComponent(cc.Label).string = data.content;
        } else {
            cc.find("price", item).active = true;
            cc.find("price/value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.diamond);
        }
        // 设置显示
        if (!isBig) {
            cc.find("avatar", item).active = data.category == 1;
            cc.find("icon", item).active = data.category != 1;
            cc.find("icon", item).scale = 1;
            if (data.category == 1) {
                // 头像框
                cc.vv.UserConfig.setAvatarFrame(cc.find("avatar", item).getComponent(sp.Skeleton), data.img);
            } else if (data.category == 2) {
                // 聊天框
                cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.chatBoxAtlas.getSpriteFrame(data.img);
            } else if (data.category == 4) {
                // 牌背
                cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.pokerBackAtlas.getSpriteFrame(data.img);
                cc.find("icon", item).scale = 0.55;
            } else if (data.category == 7) {
                // 聊天颜色
                cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
            }
        } else {
            cc.find("item/icon", item).getComponent(cc.Sprite).spriteFrame = this.skinShopAtlas.getSpriteFrame(data.img);
        }
        // 判断是否已经被用户使用
        this.changeParm = {};

        // 商城页面 关闭选中判断
        if (oprType == 0) {
            cc.find("use", item).active = false;
        } else {
            if (data.category == 1) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.avatarframe;
                this.changeParm['avatarframe'] = data.img;
            } else if (data.category == 2) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.chatskin;
                this.changeParm['chatskin'] = data.img;
            } else if (data.category == 3) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.tableskin;
                this.changeParm['tableskin'] = data.img;
            } else if (data.category == 4) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.pokerskin;
                this.changeParm['pokerskin'] = data.img;
            } else if (data.category == 5) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.faceskin;
                this.changeParm['faceskin'] = data.img;
            } else if (data.category == 6) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.emojiskin;
                this.changeParm['emojiskin'] = data.img;
            } else if (data.category == 7) {
                cc.find("use", item).active = data.img == cc.vv.UserManager.frontskin;
                this.changeParm['frontskin'] = data.img;
            } else {
                cc.find("use", item).active = false;
            }
        }


        // HOT & NEW
        if (oprType == 1) {
            cc.find("icon_hot", item).active = false;
            cc.find("icon_new", item).active = false;
        } else {
            cc.find("icon_hot", item).active = data.hot == 1;
            cc.find("icon_new", item).active = data.new == 1;
        }

    },

});
