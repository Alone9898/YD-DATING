import NetImg from "../../../../BalootClient/game_common/common_cmp/NetImg";
import UserAvatar from "../../../../BalootClient/game_common/common_cmp/UserAvatar";
import { PBCardItem } from "./card/PBCardItem";
import { PBChatMsgType } from "./chat/PBChatData";

const { ccclass, property } = cc._decorator;

@ccclass
export class PBSkinMgr extends cc.Component {
    @property([NetImg])
    pokerBacks: NetImg[] = [];
    @property([PBCardItem])
    pokerFaces: PBCardItem[] = [];
    @property(UserAvatar)
    userAvatar: UserAvatar = null;

    _tableBgSkin = "";
    _chatSkin = "";
    _emotionSkin = [];
    _pokerBackSkin = "";
    _pokerFaceSkin = "";
    _avatarSkin = "";
    _fontSkin = "";

    onLoad() {

    }

    updateSkin() {
        let chatSkin = cc.vv.UserManager["chatskin"];
        if (!chatSkin || chatSkin == "0") {
            chatSkin = "chat_000";
        }
        if (this._chatSkin != chatSkin) {
            this._chatSkin = chatSkin;
            this.updateChatSkin();
        }

        let emotionSkin = cc.vv.UserManager["emojilist"];
        if (emotionSkin && emotionSkin.length) {
            emotionSkin = emotionSkin;
        } else {
            emotionSkin = ["emoji_0"];
        }
        if (this._emotionSkin.length != emotionSkin.length) {
            this._emotionSkin = emotionSkin;
            this.updateEmotionSkin();
        }

        let tableBgSkin = cc.vv.UserManager["tableskin"];
        if (!tableBgSkin || tableBgSkin == "0") {
            tableBgSkin = "desk_000";
        }
        if (this._tableBgSkin != tableBgSkin) {
            this._tableBgSkin = tableBgSkin;
            this.updateTableBg();
        }

        let pokerBackSkin = cc.vv.UserManager["pokerskin"];
        if (!pokerBackSkin || pokerBackSkin == "0") {
            pokerBackSkin = "poker_free";
        }
        if (Global.isYDApp()) {
            pokerBackSkin = "poker_yd";
        }
        if (this._pokerBackSkin != pokerBackSkin) {
            this._pokerBackSkin = pokerBackSkin;
            this.updatePokerBack();
        }

        let pokerFaceSkin = cc.vv.UserManager["faceskin"];
        if (!pokerFaceSkin || pokerFaceSkin == "0") {
            pokerFaceSkin = "poker_face_0";
        }
        if (this._pokerFaceSkin != pokerFaceSkin) {
            this._pokerFaceSkin = pokerFaceSkin;
            this.updatePockerFace();
        }

        let avatarSkin = cc.vv.UserManager["avatarframe"];
        if (!avatarSkin || avatarSkin == "0") {
            avatarSkin = "avatarframe_1000";
        }
        if (this._avatarSkin != avatarSkin) {
            this._avatarSkin = avatarSkin;
            this.updateUserAvatar();
        }

        let fontSkin = cc.vv.UserManager["frontskin"];
        if (!fontSkin || fontSkin == "0") {
            fontSkin = "font_color_4";
        }
        this._fontSkin = fontSkin;

        console.log("chatskin:", chatSkin);
        console.log("tableskin:", tableBgSkin);
        console.log("pokerBackSkin:", pokerBackSkin);
        console.log("pokerFaceSkin:", pokerFaceSkin);
        console.log("avatarSkin:", avatarSkin);
    }

    /**
     * 更新桌子背景
     */
    updateTableBg() {
        if (facade.bgCtrl) {
            facade.bgCtrl.changeSkin(this._tableBgSkin);
        }

    }

    /**
     * 更新牌背
     */
    updatePokerBack() {
        if (!this.pokerBacks) {
            return;
        }
        this.pokerBacks.forEach(img => {
            if (img) {
                img.url = this._pokerBackSkin;
            }
        });

        facade.playersCtrl.players.forEach(p => {
            if (p.hideCardCtrl) {
                let cards = p.hideCardCtrl.getAllCards();
                if (cards.length > 0) {
                    cards.forEach(c => {
                        c.getComponent(NetImg).url = this._pokerBackSkin;
                    })
                } else {
                    p.hideCardCtrl.skin = this._pokerBackSkin;
                }
            }
            if (p.cardCollector) {
                let cards = p.cardCollector.cards;
                if (cards && cards.length > 0) {
                    cards.forEach(c => {
                        c.getComponent(NetImg).url = this._pokerBackSkin;
                    })
                } else {
                    p.cardCollector.skin = this._pokerBackSkin;
                }
            }
        });

        if (facade.trickRoundCards) {
            let cards = facade.trickRoundCards.getAllCards();
            if (cards && cards.length > 0) {
                cards.forEach(c => {
                    c.cardBack.getComponent(NetImg).url = this._pokerBackSkin;
                })
            }
        }
    }

    /**
     * 更新扑克牌正面
     */
    updatePockerFace() {
        this.pokerFaces.forEach(c => {
            if (c) {
                c.skin = this._pokerFaceSkin;
            }
        }, this);

        if (facade.handCardCtrl && facade.handCardCtrl.handCard) {
            let cards = facade.handCardCtrl.handCard.cards;
            cards && cards.forEach(c => {
                if (c) {
                    c.skin = this._pokerFaceSkin;
                }
            })
        }

        if (facade.trickRoundCards) {
            let cards = facade.trickRoundCards.getAllCards();
            if (cards && cards.length > 0) {
                cards.forEach(c => {
                    c.skin = this._pokerFaceSkin;
                })
            }
        }
    }

    /**
    * 更新聊天皮肤
     */
    updateChatSkin() {
        let selfInfo = facade.dm.playersDm.selfAbsInfo;
        if (this._chatSkin && selfInfo.isSeated) {
            selfInfo.chatSkin = this._chatSkin;
            facade.sendRetransmissionMsg(PBChatMsgType.diy, JSON.stringify({ cmd: "change_chat_skin" }));
        }
    }

    /**
     * 更新聊天表情皮肤
     */
    updateEmotionSkin() {
        facade.chat && (facade.chat.emotionSkin = this._emotionSkin);
    }

    /**
     * 更新头像框
     */
    updateUserAvatar() {
        if (this.userAvatar) {
            if (facade.dm.playersDm.selfInfo && this._avatarSkin != facade.dm.playersDm.selfInfo.avatarFrame) {
                facade.dm.playersDm.selfInfo.avatarFrame = this._avatarSkin;
                this.userAvatar.updateFrame(this._avatarSkin);
                facade.sendRetransmissionMsg(PBChatMsgType.diy, JSON.stringify({ cmd: "change_avatar" }));
            }
        }
    }


    get fontSkin() {
        return this._fontSkin;
    }

    get pokerFaceSkin() {
        return this._pokerFaceSkin || "poker_face_000";
    }

    get pokerBackSkin() {
        return this._pokerBackSkin || "poker_free";
    }
}