cc.Class({
    extends: cc.Component,

    properties: {
        commonTexture: cc.SpriteAtlas,
        giftTexture: cc.SpriteAtlas,
    },

    onLoad() {
        this.node.on("click", this.onClickSendGift, this);
    },

    onInit(data, playerInfo, charmlist) {
        this.data = data;
        this.playerInfo = playerInfo;
        // 设置数据
        let freeCount = 0;
        for (const freeData of charmlist) {
            if (data.img == freeData.img) {
                freeCount = freeData.count || freeData.times;
            }
        }
        if (freeCount > 0) {
            cc.find("layout/icon", this.node).active = false;
            cc.find("layout/value", this.node).getComponent(cc.Label).string = "x" + Global.formatNumber(freeCount, { threshold: 10000 });
        } else if (data.type == 1) {
            cc.find("layout/icon", this.node).active = true;
            cc.find("layout/icon", this.node).getComponent(cc.Sprite).spriteFrame = this.commonTexture.getSpriteFrame("icon_coin");;
            cc.find("layout/value", this.node).getComponent(cc.Label).string = Global.formatNumber(Math.floor(data.count), { threshold: 10000 });
        } else {
            cc.find("layout/icon", this.node).active = true;
            cc.find("layout/icon", this.node).getComponent(cc.Sprite).spriteFrame = this.commonTexture.getSpriteFrame("icon_diamond");;
            cc.find("layout/value", this.node).getComponent(cc.Label).string = Global.formatNumber(Math.floor(data.count), { threshold: 10000 });
        }
        cc.find("icon", this.node).getComponent(cc.Sprite).spriteFrame = this.giftTexture.getSpriteFrame(data.img);

        cc.find("charm/value", this.node).getComponent(cc.Label).string = "+" + Global.formatNumber(data.charm, { threshold: 10000 });
    },

    // 赠送礼物
    onClickSendGift() {
        if (!this.data) return;
        if (!this.playerInfo) return;
        if (Global.playerData.uid == this.playerInfo.uid) return;


        // // 判断钻石是否足够
        // if (cc.vv.UserManager.getDiamond() < this.data.count) {
        //     // 跳转到商城指定栏目
        //     cc.vv.FloatTip.show(___("钻石不足"));
        //     cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 0 });
        //     return;
        // }
        // 本地模拟 礼物赠送
        // let msg = {
        //     "receive": {
        //         "uid": this.playerInfo.uid,
        //         "avatarframe": this.playerInfo.avatarframe,
        //         "charm": this.playerInfo.charm,
        //         "level": this.playerInfo.level,
        //         "usericon": this.playerInfo.usericon,
        //         "svip": this.playerInfo.svip,
        //         "playername": this.playerInfo.playername
        //     },
        //     "c": 1042,
        //     "code": 200,
        //     "send": {
        //         "uid": cc.vv.UserManager.uid,
        //         "avatarframe": cc.vv.UserManager.avatarframe,
        //         "charm": cc.vv.UserManager.charm,
        //         "level": cc.vv.UserManager.level(),
        //         "usericon": cc.vv.UserManager.userIcon,
        //         "svip": cc.vv.UserManager.svip,
        //         "playername": cc.vv.UserManager.nickName
        //     },
        //     "info": {
        //         "title": this.data.title,
        //         "charm": this.data.charm,
        //         "id": this.data.id,
        //         "img": this.data.img,
        //     }
        // }
        // cc.vv.BroadcastManager.addGiftAnim(msg);

        // 请求送东西
        cc.vv.NetManager.send({
            c: MsgId.USER_GIFT_SEND,
            friendid: this.playerInfo.uid,
            id: this.data.id,
        });

    },
    // update (dt) {},
});
