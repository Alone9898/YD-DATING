import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import UserAvatar from "../../../../../BalootClient/game_common/common_cmp/UserAvatar";
import { PBRoomType } from "../PBCommonData";
import { facade } from "../PBLogic";
import { PBPlayerInfoVo } from "./PBPlayerData";

const { ccclass, property } = cc._decorator;

/**
 * 玩家信息相关
 */
@ccclass
export class PBUserInfoCmp extends cc.Component {
    label_name: cc.Label = null;
    icon_node: cc.Node = null;
    level_node: cc.Node = null;
    coin_node: cc.Node = null;
    rp_node: cc.Node = null;
    tips_ready_ok: cc.Node = null;
    userAvatar: UserAvatar = null;
    timeTip: cc.Node = null;
    timeProgress: cc.ProgressBar = null;
    timeTw: cc.Tween<any> = null;
    isSelf = false;
    warningCallback: Function = null;
    _time = 0;
    uname = "";

    onLoad() {
        this.label_name = this.node.getChildByName("label_name").getComponent(cc.Label);
        this.icon_node = this.node.getChildByName("head_icon");
        this.icon_node["data"] = { scale: this.icon_node.scale };
        this.level_node = this.node.getChildByName("level_node");
        this.coin_node = this.node.getChildByName("coin_node");
        this.rp_node = this.node.getChildByName("rp_node");
        this.tips_ready_ok = this.node.getChildByName("tips_ready_ok");
        this.tips_ready_ok && (this.tips_ready_ok.active = false);
        this.userAvatar = this.icon_node.getComponent(UserAvatar);
        this.timeTip = cc.find("timer_tip", this.icon_node);
        this.timeProgress = cc.find("progress", this.timeTip).getComponent(cc.ProgressBar);
        this.timeTip.active = false;
        this.rp_node && (this.rp_node.active = false);
    }

    /**
     * 显示玩家基本信息
     * @param p 
     */
    show(p: PBPlayerInfoVo) {
        if (p) {
            this.uname = p.uinfo.uname;
            this.node.active = true;
            this.label_name.string = p.uinfo.uname;
            this.userAvatar.updataAvatar({ uid: p.uid, icon: p.uinfo.icon, avatarFrame: p.avatarFrame });

            this.updateExp(p);
            this.updateCoin(p);
            this.updateRp(p);
            this.feature(p);
            if (false && p.uid === cc.vv.UserManager.uid && !Global.isYDApp()) {
                cc.find("label_bg", this.node).height = 120;
                this.rp_node && (this.rp_node.active = true);
            } else {
                cc.find("label_bg", this.node).height = 89;
                this.rp_node && (this.rp_node.active = false);
            }
            if (Global.isAndroidReview) {
                this.coin_node.opacity = 0;
                this.rp_node.opacity = 0;
                cc.find("label_bg", this.node).height = 45;
            }
        } else {
            this.node.active = false;
        }
    }

    /**
     * 更新金币
     */
    updateCoin(p: PBPlayerInfoVo) {
        if (!cc.vv.gameData) return;
        if (p && this.coin_node) {
            let label = cc.find("label", this.coin_node).getComponent(cc.Label);
            if (Global.isYDApp()) {
                label.string = Global.FormatNumToComma(p.coin);
            } else {
                label.string = Global.convertNumToShort(p.coin);
            }
        }
    }

    addCoin(from: number, to: number) {
        let label = cc.find("label", this.coin_node).getComponent(cc.Label);
        cc.tween(this.coin_node)
            .to(0.5, { scale: 1.5 }, { easing: "backOut" })
            .to(1, { scale: 1 })
            .start();
        Global.doRoallNumEff(label.node, from, to, 1, () => {
            if (Global.isYDApp()) {
                label.string = Global.FormatNumToComma(to);
            } else {
                label.string = Global.convertNumToShort(to);
            }

        }, null, 0, false, false, false)
    }

    updateExp(p: PBPlayerInfoVo) {
        if (p && this.level_node) {
            let label = cc.find("label", this.level_node).getComponent(cc.Label);
            label.string = p.currLevel.toString();
        }
    }

    /**
     * 更新玩家rp值
     */
    updateRp(p: PBPlayerInfoVo) {
        if (p && this.rp_node) {
            let label = cc.find("label", this.rp_node).getComponent(cc.Label);
            label.string = Global.FormatNumToComma(p.rpScore);
        }
    }

    /**
     * 显示准备提示
     */
    showReadyTip(boo = true, ani: boolean = true) {
        if (this.tips_ready_ok) {
            if (boo && ani) {
                this.tips_ready_ok.active = true;
                this.tips_ready_ok.stopAllActions();
                this.tips_ready_ok.scale = 2;
                this.tips_ready_ok.opacity = 0x1;
                cc.tween(this.tips_ready_ok)
                    .to(0.2, { scale: 1, opacity: 0xff })
                    .start();

            } else {
                this.tips_ready_ok.active = boo;
            }
        }
    }

    /**
     * 显示玩家特征
     */
    feature(p: PBPlayerInfoVo) {
        let feature_node = cc.find("feature_node", this.node);

        // 显示排位相关信息
        let league = cc.find("league", feature_node);
        let leagueInfo = cc.vv.UserConfig.getRank(p.leaguePoints);
        league.active = true;
        if (Global.isSingle()) {
            league.active = false;
        }
        let legaueIcon = cc.find("icon_medal", league);
        let legaueIconNI = legaueIcon.getComponent(NetImg);
        if (legaueIconNI) {
            legaueIconNI.url = `icon_league_big_${leagueInfo.stage}`;
        } else {
            let legaueIconIS = legaueIcon.getComponent(ImgSwitchCmpTS);
            legaueIconIS && legaueIconIS.setIndex(leagueInfo.stage - 1);
        }

        // 显示vip 相关信息
        let vip = cc.find("vip", feature_node);
        if (p.svip > 0 && !Global.isSingle()) {
            vip.active = true;
            vip.y = 0;
            let icon = vip.getChildByName("icon");
            icon.getComponent(NetImg).url = `vip_${p.svip}`;
            icon.scale = 1;
            icon.width = icon.height = 80;

        } else {
            vip.active = false;
        }
    }

    /**
     * 显示托管标记
     */
    showAutoHost(boo: boolean) {
        // this.icon_hosted && (this.icon_hosted.active = boo);
        if (this.node.getChildByName("robot")) {
            this.node.getChildByName("robot").active = boo;
        }
    }

    _tick() {
        let timeLabel = cc.find("label", this.timeTip);
        if (timeLabel) {
            timeLabel.getComponent(cc.Label).string = this._time + "";
            timeLabel.scale = 0.5;
            cc.tween(timeLabel)
                .to(0.2, { scale: 1 }, { easing: "backOut" })
                .start();
            if (this._time > 3) {
                timeLabel.color = cc.color(15, 255, 0);
            } else {
                timeLabel.color = cc.color(254, 59, 59);
            }
        }
        this.scheduleOnce(() => {
            this._time--;
            if (this._time > 0) {
                this._tick();
                if (this.isSelf && this._time <= this.getWarningTime()) {
                    // if(facade.soundMgr.countDownEff){
                    //     facade.soundMgr.playEffect(facade.soundMgr.countDownEff);
                    // } else {
                    facade.soundMgr.playBaseEffect("clock_warning");
                    // }

                    if (this.warningCallback) {
                        this.warningCallback();
                        this.warningCallback = null;
                    }
                }
            } else {
                this._time = 0;
            }
        }, 1);
    }

    setWarningCallback(callback: Function) {
        this.warningCallback = callback;
    }

    cleanWarningCallback() {
        this.warningCallback = null;
    }

    getWarningTime() {
        // 选择8，10秒出牌时间的游戏，小闹钟在最后3秒响起
        // 选择15，20秒出牌时间的游戏，小闹钟在最后5秒响起
        // 选择30秒出牌时间的游戏，小闹钟在最后8秒响起
        let t = facade.dm.tableInfo.turnTime;
        if (t < 15) {
            return 3;
        } else if (t < 30) {
            return 5;
        } else {
            return 8;
        }
    }

    startTimeTip(time = 8) {
        this.cleanWarningCallback();
        this.unscheduleAllCallbacks();
        if (this.timeTw) {
            this.timeTw.stop();
            this.timeTw = null;
        }
        if (this.isSelf) {
            facade.soundMgr.playBaseEffect("my_turn");
            if (cc.vv.UserManager.getSkateStatus()) {
                if (facade.dm.tableInfo.isViewer == 0) {
                    cc.vv.PlatformApiMgr.deviceShock && cc.vv.PlatformApiMgr.deviceShock();
                }
            }
        }
        this._time = time;
        this._tick();
        this.icon_node.stopAllActions();
        this.icon_node.scale = 1;
        let iconNodeData = this.icon_node["data"];
        cc.tween(this.icon_node)
            .to(0.2, { scale: iconNodeData.scale * 1.2 })
            .to(0.2, { scale: iconNodeData.scale })
            .start();
        this.timeTip.active = true;
        cc.find("progress", this.timeTip).getComponent(cc.ProgressBar).progress = 1;
        this.timeTw = cc.tween(this)
            .to(time, { progress: 0 })
            .call(() => {
                this.timeTw = null;
            })
            .start();
    }

    get progress(): number {
        return this.timeProgress.progress;
    }

    set progress(percent: number) {
        this.timeProgress.progress = percent;
        let effect = cc.find("effect", this.timeTip);
        if (effect) {
            effect.angle = 360 * percent;
            if (!effect["isPlaySp"]) {
                effect["isPlaySp"] = true;
                cc.find("lizi", effect).getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            }
        }
        if (percent <= 0) {
            this.stopTimeTip();
        }
    }

    stopTimeTip() {
        if (this.timeTw) {
            this.timeTw.stop();
            this.timeTw = null;
        }
        this._time = 0;
        this.icon_node.stopAllActions();
        this.icon_node.scale = 1;
        this.timeTip.active = false;
        this.unscheduleAllCallbacks();
    }

    // 设置是否隐藏头像昵称
    hideAvatarName(bHide, p = true) {
        // this.userAvatar.hideAvatar(bHide);
        cc.find("head_icon", this.node).active = !bHide;
        if (Global.isYDApp()) {
            this.coin_node && (this.coin_node.active = !bHide && p);
        }
        this.label_name.string = bHide ? "unknown" : this.uname;
        let default_icon = cc.find("default_unknown", this.node);
        if (default_icon) default_icon.active = bHide;
    }

    // 设置观战时玩家头像状态
    showWather(bShow) {
        let watcher_head = cc.find("node_watcher_head", this.node);
        if (watcher_head) watcher_head.active = bShow;
    }
}