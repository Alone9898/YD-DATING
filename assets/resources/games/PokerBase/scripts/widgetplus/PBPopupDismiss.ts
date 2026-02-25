import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { CDButtonProxy } from "../../../../../BalootClient/game_common/common_cmp/CDButtonProxy";
import UserAvatar from "../../../../../BalootClient/game_common/common_cmp/UserAvatar";
import { facade } from "../PBLogic";

const { ccclass, property } = cc._decorator;

/**
 * 邀请弹窗
 */
@ccclass
export class PBPopupDismiss extends cc.Component {
    static PREFAB_PATH = "games/PokerBase/prefabs/popup_dismiss";
    static POPUP_NAME = "popup_dismiss";
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Node)
    btns_layout: cc.Node = null;
    @property(CDButtonProxy)
    btn_agree: CDButtonProxy = null;
    @property(CDButtonProxy)
    btn_reject: CDButtonProxy = null;
    @property(cc.Node)
    sponsor_info: cc.Node = null;
    @property([cc.Node])
    reply_layers_info: cc.Node[] = [];
    @property(cc.Label)
    label_tips: cc.Label = null;

    _dismissData: any = null;
    _time = 10;
    _isClosing = false;

    protected onDestroy(): void {
        this._dismissData = null;
    }

    onLoad() {
        this.btn_agree.addClickHandler(() => {
            this.reply(1);
        });
        this.btn_reject.addClickHandler(() => {
            this.reply(2);
        });
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("EVNT_PLAYER_REPLY_DISMISS", this.EVNT_PLAYER_REPLY_DISMISS, this);
        eventListener.registerEvent("EVENT_ROOM_DISMISS", this.EVENT_ROOM_DISMISS, this);
    }

    EVNT_PLAYER_REPLY_DISMISS(evt: any) {
        let dic = evt.detail;
        this._dismissData = dic.dismiss;
        this.updateView();
    }

    EVENT_ROOM_DISMISS() {
        this.close();
    }

    /**
     * 回复 1同意 2拒绝
     */
    reply(state: number) {
        this.btns_layout.active = false;
        facade.dm.msgWriter.sendReplyDismiss(state);
    }

    start() {
        this.open();
    }

    close() {
        if (this._isClosing) {
            return;
        }
        this._isClosing = true;
        CommonStyle.fastHide(this.node, () => {
            cc.vv.PopupManager.removePopup(this.node);
        })
    }

    async open() {
        this.bg.active = true;
        CommonStyle.fastShow(this.panel);
    }

    onPopup(dismissData: any) {
        this._dismissData = dismissData;
        this._time = dismissData.delayTime || 15;
        this.updateView();
        this._tick();
    }

    _tick() {
        if (this._time <= 0) {
            this.close();
            return;
        }
        this.label_tips.string = ___("({1}秒后自动拒绝解散)", this._time);
        this.label_tips.unscheduleAllCallbacks();
        this.label_tips.scheduleOnce(() => {
            this._time--;
            this._tick();
            this.label_tips.string = ___("({1}秒后自动拒绝解散)", this._time);
        }, 1);
    }

    updateView() {
        if (!this._dismissData) {
            return;
        }
        // 显示发起者信息
        let sponsorId = this._dismissData.uid
        let str = "";
        if (facade.dm.playersDm.isSelf(sponsorId)) {
            let temp = ___("您");
            str = ___("{1} 发起了解散房间请求", temp);
        } else {
            let p = facade.dm.playersDm.getPlayerByUid(this._dismissData.uid);
            str = ___("{1} 发起了解散房间请求", p.uinfo.uname);
        }
        this.sponsor_info.getChildByName("label").getComponent(cc.Label).string = str;

        let selfIsReply = facade.dm.playersDm.isSelf(sponsorId);
        let index = 0;
        let replayCnt = 1;      // 已经回复的人数
        let hasReject = false;  // 是否有人拒绝
        // 显示其他人的操作状态
        for (let i = 0; i < this._dismissData.users.length; i++) {
            let u = this._dismissData.users[i];
            if (sponsorId == u.uid) {
                continue;
            }

            let p = facade.dm.playersDm.getPlayerByUid(u.uid);
            let nameStr = p.uinfo.uname;
            cc.find("head_icon", this.reply_layers_info[index]).getComponent(UserAvatar).updataAvatar({ uid: p.uid, icon: p.uinfo.icon, avatarFrame: p.avatarFrame });

            if (facade.dm.playersDm.isSelf(p.uid)) {
                nameStr = ___("您");
                selfIsReply = u.status > 0;
            }
            // let color = cc.Color.BLACK;
            // let stateStr = ___("操作中...");
            cc.find("ani_match_normal", this.reply_layers_info[index]).active = true;
            cc.find("confirm", this.reply_layers_info[index]).active = false;
            cc.find("refuse", this.reply_layers_info[index]).active = false;
            if (u.status == 1) {
                replayCnt++;
                cc.find("ani_match_normal", this.reply_layers_info[index]).active = false;
                cc.find("confirm", this.reply_layers_info[index]).active = true;
                cc.find("refuse", this.reply_layers_info[index]).active = false;
                // stateStr = ___("同意");
                // color = color.fromHEX("#266500");
            } else if (u.status == 2) {
                replayCnt++;
                hasReject = true;
                cc.find("ani_match_normal", this.reply_layers_info[index]).active = false;
                cc.find("confirm", this.reply_layers_info[index]).active = false;
                cc.find("refuse", this.reply_layers_info[index]).active = true;
                // stateStr = ___("拒绝");
                // color = color.fromHEX("#FF4F32");
            }
            // let str = ___("{1}({2})", nameStr, stateStr);
            // let label = this.reply_layers_info[index].getChildByName("label").getComponent(cc.Label);
            // label.string = str;
            // label.node.color = color;
            index++;
            // cc.log(i, cc.find("point", this.reply_layers_info[i]).active, cc.find("confirm", this.reply_layers_info[i]).active, cc.find("refuse", this.reply_layers_info[i]).active)
        }
        for (let i = index; i < this.reply_layers_info.length; i++) {
            this.reply_layers_info[i].active = false;
        }

        // 显示同意拒绝按钮
        this.btns_layout.active = !selfIsReply;
        if (facade.dm.tableInfo.isViewer) {
            this.btns_layout.active = false;
        }

        if (replayCnt == this._dismissData.users.length || hasReject) {
            this.scheduleOnce(() => {
                this.close();
            }, 1)
        }
    }
}