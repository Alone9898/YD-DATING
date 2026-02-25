import { facade } from "../PBLogic";

const { ccclass, property } = cc._decorator;

/**
 * 玩家信息相关
 */
@ccclass
export class PBToggleVoice extends cc.Component {
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;   // 动画
    @property(cc.Toggle)
    toggle: cc.Toggle = null;    // 开关

    uid: number = 0;             // 玩家id
    _isInit = false;
    _isPlaySayingAni = false;   // 正在播放动画
    _canPlaySaying: boolean = false;    // 正在说话
    _cbHandler: Function = null;

    joinChat: number = -1;  // 是否加入聊天室
    mic: number = -1;  // 是否开启麦克风
    isBeRefuse: boolean = false; //是否被屏蔽

    micSprite: cc.Sprite;

    forceInit() {
        this._isInit = true;
        this.spine.node.active = false;

        this.toggle.enabled = false;
        this.toggle.target.active = false;
        cc.find("checkmark", this.toggle.node).active = true;
        this.micSprite = cc.find("checkmark", this.toggle.node).getComponent(cc.Sprite);
        this.micSprite.spriteFrame = null;
        // 设置点击回调
        this.toggle.node.addComponent(cc.Button);
        this.toggle.node.on("click", () => {
            // 判断点击的是自己的还是别人的
            // 根据自己的状态,向客户端发情请求
            let playerCpt = facade.playersCtrl.getPlayerByUid(this.uid);
            if (this.uid == cc.vv.UserManager.uid) {
                // 自己开麦/闭麦操作
                if (this.mic == 0) {
                    facade.dm.msgWriter.sendVoiceChanged(1);
                } else {
                    facade.dm.msgWriter.sendVoiceChanged(0);
                }
            } else {
                // 根据别人的状态进行屏蔽或者解开
                if (playerCpt.voiceToggle.joinChat == 1) {
                    playerCpt.voiceToggle.isBeRefuse = !playerCpt.voiceToggle.isBeRefuse;
                    playerCpt.voiceToggle.updateView();
                }
            }
        })
    }

    init(uid) {
        this.uid = uid;
        this.mic = 0;
        this.isBeRefuse = false;
    }


    // 刷新界面
    updateView() {
        if (this.uid == cc.vv.UserManager.uid) {
            // 确认是否加入聊天室
            if (this.joinChat == 1) {
                facade.voiceCtrl.joinVoiceRoom();
            } else {
                facade.voiceCtrl.levelVoiceRoom();
            }
            if (this.mic == 1) {
                // 自己开麦
                cc.vv.ResManager.setSpriteFrame(this.micSprite, "games/PokerBase/texture/icon_voice_1", null, null);
                facade.voiceCtrl.muteSelfVoice(false);
            } else {
                // 自己闭麦
                cc.vv.ResManager.setSpriteFrame(this.micSprite, "games/PokerBase/texture/icon_voice_0", null, null);
                facade.voiceCtrl.muteSelfVoice(true);
            }
        } else {
            // 对方是否开麦
            if (this.mic == 1) {
                if (this.isBeRefuse) {
                    // 屏蔽
                    cc.vv.ResManager.setSpriteFrame(this.micSprite, "games/PokerBase/texture/icon_voice_0", null, null);
                    facade.voiceCtrl.muteOtherVoice(this.uid, true);
                } else {
                    // 未屏蔽
                    cc.vv.ResManager.setSpriteFrame(this.micSprite, "games/PokerBase/texture/icon_voice_1", null, null);
                    facade.voiceCtrl.muteOtherVoice(this.uid, false);
                }
            } else {
                cc.vv.ResManager.setSpriteFrame(this.micSprite, "games/PokerBase/texture/icon_voice_2", null, null);
            }
        }
    }

    set canSaying(boo: boolean) {
        this._canPlaySaying = boo;
        if (this._canPlaySaying) {
            this._playSayingAni();
        }
    }

    _playSayingAni() {
        if (this._isPlaySayingAni) {
            return;
        }
        this._canPlaySaying = false;
        this._isPlaySayingAni = true;
        this.spine.node.active = true;
        this.spine.setAnimation(0, "animation", true);
        this.spine.setCompleteListener(() => {
            if (this._canPlaySaying) {
                this._canPlaySaying = false;
            } else {
                this.spine.setCompleteListener(null);
                this.spine.node.active = false;
                this._isPlaySayingAni = false;
            }

        })
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this._canPlaySaying = false;
        this._isPlaySayingAni = false;
        this.spine.node.active = false;
        this.node.active = false;
    }
}