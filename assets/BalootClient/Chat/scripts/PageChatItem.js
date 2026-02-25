const { default: RewardListCpt } = require("../../../_FWExpand/UI/RewardListCpt");

/**
 * 聊天List Item
 */
cc.Class({
    extends: cc.Component,
    properties: {
        headCmp: require("HeadCmp"),
        emojiNode: cc.Node,
        textNode: cc.Node,
        nameLabel: cc.Label,
        textLabel: cc.Label,
        bgFrames: cc.SpriteAtlas,
        emojiSke: sp.Skeleton,

        // salonAdNode: cc.Node,
        salonGameNode: cc.Node,

        // giftNode: cc.Node,

        // reportPrefab: cc.Prefab,
        privateChatSendPrefab: cc.Prefab,

        // replyBtn: cc.Button,
        // replyInfoNode: cc.Node,


    },
    onLoad() {
        this.textNode.active = false;
        this.emojiNode.active = false;
        // this.salonAdNode.active = false;
        this.salonGameNode.active = false;
        // this.giftNode.active = false;

        // this.replyBtn.node.on("click", this.onClickReply, this);

        // for (const touchCpt of this.node.getComponentsInChildren("LongTouchCpt")) {
        //     touchCpt.setCallback(() => {
        //         if (this.data.uid == cc.vv.UserManager.uid) return;
        //         let worldPos = touchCpt.node.convertToWorldSpaceAR(cc.v2(0, 0));
        //         let endPos = cc.find("Canvas").convertToNodeSpaceAR(worldPos)
        //         endPos.x = Math.max(endPos.x, -300);
        //         endPos.x = Math.min(endPos.x, 300);
        //         // 弹出预制体
        //         cc.vv.PopupManager.addPopup(this.reportPrefab, {
        //             noCloseHit: true,
        //             // noTouchClose: true,
        //             noMask: true,
        //             scaleIn: true,
        //             pos: endPos,
        //             onShow: (node) => {
        //                 node.getComponent("ChatReportView").onInit(this.data);
        //             }
        //         })
        //     })
        // }
        cc.find("layout/buttons/btn_join", this.salonGameNode).on("click", this.onClickSalonGame, this);
    },
    getUIType(data) {
        // 考虑多语言系数
        // let isAr = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR;
        // 区分是不是自己
        let isSelf = data.uid == cc.vv.UserManager.uid;
        let uiType = 1;
        if (isSelf) {
            uiType = 2;
            // if (isAr) {
            // } else {
            //     uiType = 2;
            // }
        } else {
            uiType = 1;
            // if (isAr) {
            //     uiType = 2;
            // } else {
            //     uiType = 1;
            // }
        }
        return uiType;
    },
    init(data, item) {
        this.data = data
        let stype = data.stype || data.type;
        let content = data.content || data.msg;
        // 私聊相关
        // if (!!data.private) {
        //     // this.replyBtn.node.active = !data.reply;
        //     this.replyBtn.node.active = !(data.uid == cc.vv.UserManager.uid)
        //     this.replyInfoNode.active = !!data.reply;
        //     if (!!data.reply) {
        //         cc.find("node_head", this.replyInfoNode).getComponent("HeadCmp").setHead(data.reply.uid, data.reply.avatar || data.reply.usericon);
        //         if (data.reply.avatarframe) {
        //             let _avatarframe = data.reply.avatarframe.toString();
        //             _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        //             cc.find("node_head", this.replyInfoNode).getComponent("HeadCmp").setAvatarFrame(_avatarframe);
        //         }
        //         cc.find("lbl_name", this.replyInfoNode).getComponent(cc.Label).string = data.reply.name || data.reply.playername;
        //         cc.find("emojibox", this.replyInfoNode).active = false;
        //         cc.find("content", this.replyInfoNode).active = false;
        //         // 设置表情
        //         if (data.reply.type == 1) {
        //             // 文本内容
        //             cc.find("content", this.replyInfoNode).active = true;
        //             let replyContent = data.reply.content || data.reply.msg;
        //             if (!!replyContent && replyContent.length > 5) {
        //                 replyContent = __(replyContent.substring(0, 5), "...")
        //             }
        //             cc.find("content", this.replyInfoNode).getComponent(cc.Label).string = replyContent;
        //         } else if (data.reply.type == 2) {
        //             cc.find("emojibox", this.replyInfoNode).active = true;
        //             cc.vv.UserConfig.setEmoji(cc.find("emojibox/emoji", this.replyInfoNode).getComponent(sp.Skeleton), data.reply.content, (skeletonCpt, emojiType) => {
        //                 skeletonCpt.node.scale = 0.18;
        //                 skeletonCpt.node.y = -20;
        //             });
        //         }
        //     }
        // } else {
        //     this.replyBtn.node.active = false;
        //     this.replyInfoNode.active = false;
        // }
        // 重置文本属性
        this.textLabel.node.width = 0;
        this.textLabel.node.height = 0;
        this.textLabel.overflow = cc.Label.Overflow.NONE;
        this.textLabel.string = '';
        // 设置头像
        this.headCmp.setHead(data.uid, data.avatar || data.usericon);
        let _avatarframe = data.avatarframe.toString();
        _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        this.headCmp.setAvatarFrame(_avatarframe);
        // 名字设置
        this.nameLabel.string = Global.strConfuse(data.name || data.playername || "");
        // // 等级设置
        // if ("levelexp" in data) {
        //     this.levelLabel.string = "LV." + cc.vv.UserConfig.totalExp2Level(data.levelexp);
        // } else {
        //     this.levelLabel.string = "LV." + data.level;
        // }
        // 设置聊天框皮肤
        let skinName = data.chatskin || "chat_free";
        skinName = skinName.toString();
        skinName = skinName.indexOf("chat_") >= 0 ? skinName : "chat_free";
        // cc.find("bg", this.emojiNode).getComponent(cc.Sprite).spriteFrame = this.bgFrames.getSpriteFrame(skinName);
        cc.find("bg", this.textNode).getComponent(cc.Sprite).spriteFrame = this.bgFrames.getSpriteFrame(skinName);
        // cc.find("bg_ex", this.textNode).color = cc.vv.UserConfig.getChatBoxColor(skinName);
        // cc.find("bg_ex", this.emojiNode).color = cc.vv.UserConfig.getChatBoxColor(skinName);
        // VIP特别标识
        // let emojiVipNumberNode = cc.find("bg_vip_num", this.emojiNode);
        // let textVipNumberNode = cc.find("bg_vip_num", this.textNode);
        // if (skinName.indexOf("chat_vip_") >= 0) {
        //     emojiVipNumberNode.active = true;
        //     textVipNumberNode.active = true;
        //     emojiVipNumberNode.getComponent(cc.Sprite).spriteFrame = this.bgFrames.getSpriteFrame("text_" + skinName);
        //     textVipNumberNode.getComponent(cc.Sprite).spriteFrame = this.bgFrames.getSpriteFrame("text_" + skinName);
        // } else {
        //     emojiVipNumberNode.active = false;
        //     textVipNumberNode.active = false;
        // }
        // 左右差异
        if (this.getUIType(data) == 1) {
            this.headCmp.node.x = -440;
            this.nameLabel.node.x = -440;
            // this.nameLabel.node.anchorX = 0;
            // this.levelLabel.node.x = -440;
            // this.levelLabel.node.anchorX = 0;
            // this.replyBtn.node.x = -440;
            // this.replyInfoNode.anchorX = 0;
            // this.replyInfoNode.x = -350;
            // this.replyInfoNode.y = -240;
        } else {
            this.headCmp.node.x = 440;
            this.nameLabel.node.x = 440;
            // this.nameLabel.node.anchorX = 1;
            // this.levelLabel.node.x = 440;
            // this.levelLabel.node.anchorX = 1;
            // this.replyBtn.node.x = 440;
            // this.replyInfoNode.anchorX = 1;
            // this.replyInfoNode.x = 350;
            // this.replyInfoNode.y = -240;
        }
        this.textNode.active = false;
        this.emojiNode.active = false;
        // this.salonAdNode.active = false;
        this.salonGameNode.active = false;
        // this.giftNode.active = false;

        // this.nameLabel.node.active = stype != 6;
        // this.headCmp.node.active = stype != 6;
        // this.levelLabel.node.active = stype != 6;

        // this.inviteNode.active = false;
        if (stype == 1) {
            // stype == 1 文本
            this.textNode.active = true;
            this.updateTextNode(data, content, item);
        } else if (stype == 2) {
            // stype == 2 表情
            this.emojiNode.active = true;
            this.updateEmojiNode(data, content, item);
        } else if (stype == 6) {
            // this.salonAdNode.active = true;
            // this.updateSalonAdNode(data, content, item);
        } else if (stype == 5) {
            this.salonGameNode.active = true;
            this.updateSalonGameNode(data, content, item);
        } else if (stype == 7) {
            // this.giftNode.active = true;
            // this.updateGiftNode(data, content, item);
        }
    },
    // 更新文本
    updateTextNode(data, content, item) {
        content = content.trim()
        // 文本内容设置
        this.textLabel.string = content || ""; //cc.vv.FilterWordConfig.filter(content || "");
        // 设置字体颜色
        this.textLabel.node.color = cc.vv.UserConfig.getColor(data.frontskin);
        this.textLabel.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.textLabel._forceUpdateRenderData(true);
        // 控制文本宽度
        if (this.textLabel.node.getContentSize().width > 550) {
            this.textLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this.textLabel.node.width = 600;
            this.textLabel._forceUpdateRenderData(true);
        }
        // 设置文本背景大小
        cc.find("bg", this.textNode).width = this.textLabel.node.getContentSize().width + 75;
        cc.find("bg", this.textNode).height = this.textLabel.node.getContentSize().height + 40;
        // 回复信息的位置
        // this.replyInfoNode.y = -150 - this.textLabel.node.height;
        if (this.getUIType(data) == 1) {
            // 文本设置
            this.textNode.x = -347;
            this.textNode.anchorX = 0;
            cc.find("bg", this.textNode).scaleX = 1;
            cc.find("bg", this.textNode).x = -8;
            // cc.find("bg_ex", this.textNode).scaleX = 1;
            // cc.find("bg_ex", this.textNode).x = -11;
            this.textLabel.node.x = 27;
            this.textLabel.node.anchorX = 0;
            // this.textLabel.horizontalAlign = cc.macro.TextAlignment.LEFT;
            // 设置VIP数字 位置 (这个时候才知道 聊天框的宽度和高度)
            // cc.find("bg_vip_num", this.textNode).x = this.textLabel.node.width + 40;
            // cc.find("bg_vip_num", this.textNode).y = -(this.textLabel.node.height + 40);

            // this.replyBtn.node.x = -440 + 182 + cc.find("bg", this.textNode).width;
        } else {
            // 文本设置
            this.textNode.x = 347;
            this.textNode.anchorX = 1;
            cc.find("bg", this.textNode).scaleX = -1;
            cc.find("bg", this.textNode).x = 8;
            // cc.find("bg_ex", this.textNode).scaleX = -1;
            // cc.find("bg_ex", this.textNode).x = 11;
            this.textLabel.node.x = -27;
            this.textLabel.node.anchorX = 1;
            // this.textLabel.horizontalAlign = cc.macro.TextAlignment.RIGHT;
            // cc.find("bg_vip_num", this.textNode).x = -(this.textLabel.node.width + 40);
            // cc.find("bg_vip_num", this.textNode).y = -(this.textLabel.node.height + 40);

            // this.replyBtn.node.x = 440 - 182 - cc.find("bg", this.textNode).width;
        }
        cc.find("bg_ex", this.textNode).active = false;
        // if (cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR) {
        //     this.textLabel.horizontalAlign = cc.macro.TextAlignment.RIGHT;
        // } else {
        //     this.textLabel.horizontalAlign = cc.macro.TextAlignment.LEFT;
        // }

        // 更新item高度
        item.height = this.textLabel.node.getContentSize().height + 120 + 70;
    },
    // 更新表情
    updateEmojiNode(data, content, item) {
        // 表情设置
        cc.vv.UserConfig.setEmoji(this.emojiSke, content, (skeletonCpt, emojiType) => {
            skeletonCpt.node.scale = 0.6;
            skeletonCpt.node.y = -165 + 10;
        });
        // 布局设置
        if (this.getUIType(data) == 1) {
            // 表情设置
            this.emojiNode.x = -346;
            this.emojiNode.anchorX = 0;
            this.emojiSke.node.x = 111;
            // cc.find("bg", this.emojiNode).scaleX = 1;
            // cc.find("bg", this.emojiNode).x = -8;
            // cc.find("bg_ex", this.emojiNode).scaleX = 1;
            // cc.find("bg_ex", this.emojiNode).x = -11;
            // cc.find("bg_vip_num", this.emojiNode).x = 200;

            // this.replyBtn.node.x = -440 + 200 + 200;
        } else {
            // 表情设置
            this.emojiNode.x = 346;
            this.emojiNode.anchorX = 1;
            this.emojiSke.node.x = -111;
            // cc.find("bg", this.emojiNode).scaleX = -1;
            // cc.find("bg", this.emojiNode).x = 8;
            // cc.find("bg_ex", this.emojiNode).scaleX = -1;
            // cc.find("bg_ex", this.emojiNode).x = 11;
            // cc.find("bg_vip_num", this.emojiNode).x = -200;

            // this.replyBtn.node.x = 440 - 200 - 200;
        }
        // 更新item高度
        item.height = 290;
    },
    // // 更新沙龙广告内容
    // updateSalonAdNode(data, content, item) {
    //     let lang = cc.vv.i18nManager.getConfig().lang;
    //     let infoStr = data.msg ? data.msg[lang] : "";
    //     cc.find("info", this.salonAdNode).getComponent(cc.Label).string = infoStr; // 广告内容
    //     // 显示个数
    //     let tempRewards = [];
    //     for (let i = 0; i < data.rewards.length; i++) {
    //         if (i < 6) {
    //             tempRewards.push(data.rewards[i]);
    //         }
    //     }
    //     // 奖励
    //     cc.find("rewards", this.salonAdNode).getComponent(RewardListCpt).updateView(tempRewards, [
    //         { type: 1, scale: 0.4 },
    //         { type: 25, scale: 0.4 },
    //         { type: 53, scale: 0.3 },
    //         { type: 54, scale: 0.66 },
    //         { type: 55, scale: 0.4 },
    //     ]);
    //     // if (nodeMap[1]) nodeMap[1].icon.scale = 0.4;
    //     // if (nodeMap[25]) nodeMap[25].icon.scale = 0.4;
    //     // if (nodeMap[53]) nodeMap[53].icon.scale = 0.3;
    //     // if (nodeMap[55]) nodeMap[55].icon.scale = 0.4;
    //     // if (nodeMap[54]) nodeMap[54].hddj.scale = 0.3;


    //     if (this.getUIType(data) == 1) {
    //         cc.find("bg", this.salonAdNode).scaleX = 1;
    //         cc.find("info", this.salonAdNode).x = 8;
    //     } else {
    //         cc.find("bg", this.salonAdNode).scaleX = -1;
    //         cc.find("info", this.salonAdNode).x = -8;
    //     }
    //     item.height = 300;
    // },
    // 沙龙邀请
    updateSalonGameNode(data, content, item) {
        // let gameid = content.split(";")[0];
        // let deskid = content.split(";")[1];
        // let entry = content.split(";")[2];
        // 邀请的房间ID
        cc.find("layout/roominfo/roomid/label", this.salonGameNode).getComponent(cc.Label).string = data.room.deskid;
        cc.find("layout/roominfo/coin/label", this.salonGameNode).getComponent(cc.Label).string = Global.formatNumber(data.room.entry, { threshold: 100000 });
        // 设置名称
        cc.find("layout/icon_game/name", this.salonGameNode).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(data.room.gameid);
        cc.find("layout/buttons", this.salonGameNode).active = !cc.vv.gameData;

        // this.data.room.status
        cc.find("layout/buttons/btn_join", this.salonGameNode).active = data.room.status == 1;
        cc.find("layout/buttons/btn_end", this.salonGameNode).active = data.room.status != 1;
        // 是不是密码房
        cc.find("layout/icon_game/lock", this.salonGameNode).active = data.room.private == 1;

        // 设置图标
        cc.vv.UserConfig.setGameCafeFrame(cc.find("layout/icon_game/icon", this.salonGameNode).getComponent(cc.Sprite), data.room.gameid);
        if (this.getUIType(data) == 1) {
            cc.find("bg", this.salonGameNode).scaleX = 1;
            cc.find("info", this.salonGameNode).x = 8;
            // cc.find("layout", this.salonGameNode).getComponent(cc.Layout).horizontalDirection = cc.Layout.HorizontalDirection.RIGHT_TO_LEFT;
        } else {
            cc.find("bg", this.salonGameNode).scaleX = -1;
            cc.find("info", this.salonGameNode).x = -8;
            // cc.find("layout", this.salonGameNode).getComponent(cc.Layout).horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
        }
        item.height = 280;
    },
    // // 世界礼物
    // updateGiftNode(data, content, item) {

    //     let str = "";
    //     if (data.charmpack.img == "gift_cake") {
    //         str = ___("赠送{1}一杯甜点，幸福甜美天天来", data.charmpack.name);
    //     } else if (data.charmpack.img == "gift_car") {
    //         str = ___("赠送{1}一杯跑车，一往无前享受激情！", data.charmpack.name);
    //     } else if (data.charmpack.img == "gift_hookah") {
    //         str = ___("赠送{1}一杯水烟，点燃无穷快乐！", data.charmpack.name);
    //     } else if (data.charmpack.img == "gift_kiss") {
    //         str = ___("赠送{1}一杯吻，热情浪漫永长存！", data.charmpack.name);
    //     } else if (data.charmpack.img == "gift_ring") {
    //         str = ___("赠送{1}一杯戒指，如钻石一般闪耀！", data.charmpack.name);
    //     } else if (data.charmpack.img == "gift_tea") {
    //         str = ___("赠送{1}一杯红茶，生活暖洋洋！", data.charmpack.name);
    //     }
    //     cc.find("info", this.giftNode).getComponent(cc.Label).string = str;

    //     cc.find("item", this.giftNode).getComponent("RewardItemCpt").updateView({ type: 54, img: data.charmpack.img });
    //     cc.find("charm/value", this.giftNode).getComponent(cc.Label).string = "+" + Global.formatNumber(data.charmpack.charm);


    //     if (this.getUIType(data) == 1) {
    //         this.giftNode.x = -60;
    //         cc.find("bg", this.giftNode).scaleX = 1;
    //         // cc.find("info", this.giftNode).x = 48; 
    //     } else {
    //         this.giftNode.x = 60;
    //         cc.find("bg", this.giftNode).scaleX = -1;
    //         // cc.find("info", this.giftNode).x = -48;
    //     }

    //     item.height = 260;
    // },
    // 进行回复
    onClickReply() {
        cc.vv.PopupManager.addPopup(this.privateChatSendPrefab, {
            onShow: (node) => {
                // 打开点对点聊天框
                node.getComponent("PrivateChatSendView").init(this.data);
            }
        });
    },
    // 点击进入沙龙房间
    onClickSalonGame() {
        // cc.log(this.data.room.status);
        if (!!this.data.room)
            cc.vv.NetManager.send({ c: MsgId.FRIEND_ROOM_JOIN, deskid: this.data.room.deskid, gameid: this.data.room.gameid }, true);
    },
});
