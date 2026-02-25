cc.Class({
    extends: cc.Component,

    properties: {
        // pageView: cc.PageView,
        // emojiPagePrefab: cc.Prefab,
        pageEmojiNode: cc.Node,
        tabbar: require("Tabbar"),
        emojiAtlas: cc.SpriteAtlas,
        type: 0,
    },

    onLoad() {
        this.allEmojiList = ["emoji_0", "emoji_2", "emoji_3"]
        this.tabbar.setChangeCallback(this.onTabbarChange.bind(this));
        for (let i = 1; i <= 6; i++) {
            // emojiType
            let btnNode = cc.find(`btn_${i}`, this.pageEmojiNode)
            btnNode.on("click", () => {
                // 进行消息发送
                if (cc.vv.UserManager.emojilist.indexOf(btnNode.emojiskin) >= 0) {
                    cc.vv.PopupManager.removePopup(this.node);
                    Global.dispatchEvent("REQ_CHAT_SEND", { key: btnNode.emojiKey, type: this.type });
                    StatisticsMgr.reqReport(ReportConfig.CHAT_SEND_EMOJI, btnNode.emojiKey);
                } else {
                    cc.vv.FloatTip.show(___("您还未获得此表情"));
                }
            });
        }
        for (const cpt of this.node.getComponentsInChildren("EmojiLockCpt")) {
            cpt.node.active = cc.vv.UserManager.emojilist.indexOf(cpt.key) < 0;
        }
    },

    onTabbarChange(index, item, items) {
        let emojiskin = this.allEmojiList[index];
        for (let i = 1; i <= 6; i++) {
            let btnNode = cc.find(`btn_${i}`, this.pageEmojiNode)
            let emojiKey = `${emojiskin}_${i}`;
            btnNode.emojiskin = emojiskin;
            btnNode.emojiKey = `${emojiskin}_${i}`;
            btnNode.getComponentInChildren(cc.Sprite).spriteFrame = this.emojiAtlas.getSpriteFrame(emojiKey);
        }
    },
});
