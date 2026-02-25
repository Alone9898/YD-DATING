import { PBFlowState, PBRoomType } from "../../../PokerBase/scripts/PBCommonData";
import { PBGameData } from "../../../PokerBase/scripts/PBGameData";

const { ccclass, property } = cc._decorator;

/**
 * 大结算结果类型
 */
export enum PBSettlementResultType {
    DUMMY = 0,      // 啥都不干
    GO_BACK = 1,    // 返回
    MANUAL_NEXT = 2,// 手动继续下一局
    AUTO_NEXT = 3,  // 自动继续下一局
    AGAIN = 4       // 再来一局
}

@ccclass
export class PBTotalSettlement extends cc.Component {
    @property(cc.Node)
    panel: cc.Node = null; // 内容节点
    @property(cc.Node)
    flagLose: cc.Node = null;   // 失败标志
    @property(cc.Node)
    flagWin: cc.Node = null;    // 胜利标志
    @property(cc.Node)
    btn_layout: cc.Node = null;
    @property(cc.Button)
    btn_back: cc.Button = null;  // 返回按钮
    @property(cc.Button)
    btn_next: cc.Button = null;  // 继续下一局按钮 用于匹配房
    @property(sp.Skeleton)
    spine_effect_win: sp.Skeleton = null; // 胜利时播放的特效
    @property(cc.Label)
    autoNextRoundTipLabel: cc.Label = null; // 自动下一局文本

    callBack: Function = null; // 关闭界面时调用的回调方法
    settlementData: any = null; // 大结算数据
    isOpen = false;
    autoNextRoundTime = 6;   // 自动下一局倒计时

    private shareBtnNode: cc.Node = null;

    onLoad() {
        this.panel.active = false;
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("EVENT_ROOM_DISMISS", this.EVENT_ROOM_DISMISS, this);
    }

    // 在大结算界面 房间被解散 通知
    EVENT_ROOM_DISMISS() {
        if (!this.isOpen) {
            return;
        }
        this.removeTick();
        this.btn_layout.active = false;
        this.closeShareBtn();
    }

    // 打开大结算界面
    open(dic: any, cb: Function = null) {
        this.isOpen = true;
        this.settlementData = dic;
        this.callBack = cb;
        // 设置游戏状态
        this.getDm<PBGameData>().tableStatus.flowState = PBFlowState.total_settlement;
        this.flagWin.active = false;
        this.flagLose.active = false;
        this.panel.active = true;
        this.btn_layout.active = false;
        // 刷新界面
        this.updateView();
        // 加载分享按钮
        if (!this.shareBtnNode && Global.isSingle()) {
            cc.loader.loadRes('games/PokerBase/prefabs/settlement_btn_share_fb', cc.Prefab, (err, prefab) => {
                if (err) return;
                this.shareBtnNode = cc.instantiate(prefab);
                this.shareBtnNode.parent = this.panel;
                this.shareBtnNode.y = -cc.winSize.height / 2 + 700;
                this.shareBtnNode.getComponent(cc.Button).node.on("click", this.onClickShare, this);
                this.updateShareBtn();
            })
        }
        this.updateShareBtn();
    }
    // 刷新分享按钮
    updateShareBtn() {
        if (Global.isSingle() || Global.isYDApp()) {
            if (this.shareBtnNode)
                this.shareBtnNode.active = false;
            return;
        }
        if (!this.shareBtnNode) return;
        this.closeShareBtn();
        if (!this.settlementData) return;
        if (!this.settlementData.fbshare) return;
        let fbShareData = this.settlementData.fbshare[cc.vv.UserManager.uid];
        if (!fbShareData) {
            this.shareBtnNode.active = false;
        } else {
            this.shareBtnNode.active = true;
            this.shareBtnNode.getComponent(cc.Button).interactable = true;
            cc.find("layout/multiple", this.shareBtnNode).getComponent(cc.Label).string = "x" + fbShareData.times;
        }
    }
    // 关闭分享按钮
    closeShareBtn() {
        if (this.shareBtnNode) this.shareBtnNode.active = false;
    }
    // 点击分享按钮
    onClickShare() {
        if (!this.settlementData) return;
        if (!this.settlementData.fbshare) return;
        let fbShareData = this.settlementData.fbshare[cc.vv.UserManager.uid];
        if (!fbShareData) return;
        this.shareBtnNode.getComponent(cc.Button).interactable = false;
        // 确定分享地址
        let shareLink = null;
        let gameid = facade.dm.tableInfo.gameId;
        let lang = cc.vv.i18nManager.getLanguage();
        if (fbShareData.type == 1) {
            // type=1 累计赢:
            shareLink = `http://inter.sekiengame.com/fb/win/total/?uid=${cc.vv.UserManager.uid}&lang=${lang}&gameid=${gameid}`
        } else if (fbShareData.type == 2) {
            // type=2 连续赢:
            shareLink = `http://inter.sekiengame.com/fb/win/cumulative/?uid=${cc.vv.UserManager.uid}&lang=${lang}&gameid=${gameid}`
        } else if (fbShareData.type == 3) {
            // type=3 牌型:
            shareLink = `http://inter.sekiengame.com/fb/win/card/?uid=${cc.vv.UserManager.uid}&lang=${lang}&gameid=${gameid}`
        }
        if (shareLink) {
            if (Global.isNative()) {
                cc.vv.FBMgr.fbShareWeb(shareLink, null, "", (data) => {
                    // 分享成功
                    cc.vv.NetManager.send({ c: MsgId.GAME_SHARE_REWARD, gameid: gameid, cat: fbShareData.type });
                });
            } else if (CC_DEBUG) {
                cc.vv.NetManager.send({ c: MsgId.GAME_SHARE_REWARD, gameid: gameid, cat: fbShareData.type });
            }
        }
    }
    // 移除按钮事件
    removeBtnListener() {
        this.btn_back && this.btn_back.node.off("click");
        this.btn_next && this.btn_next.node.off("click");
    }
    // 添加按钮事件
    addBtnListener() {
        this.btn_back && this.btn_back.node.on("click", () => {
            this.removeBtnListener();
            if (this.getDm<PBGameData>().tableStatus.isDismiss) {
                facade.gotoHall();
            } else {
                facade.dm.msgWriter.sendExit();
                this.close(PBSettlementResultType.GO_BACK);
            }
        });

        if (this.getDm<PBGameData>().tableStatus.isDismiss) {
            this.btn_next && (this.btn_next.node.active = false);
        } else {
            if (this.btn_next) {
                this.btn_next.node.active = true;
                this.btn_next.node.on("click", () => {
                    this.btn_next.node.off("click");
                    this.close(PBSettlementResultType.MANUAL_NEXT);
                    facade.dm.msgWriter.sendReady();
                });

                this.btn_next.node.active = true;
                let timeout = 6;
                if (this.settlementData.timeout) {
                    timeout = this.settlementData.timeout - 6;
                }
                timeout = timeout > 0 ? timeout : 5;
                this.showAutoNextRoundTip(timeout);
            }
        }
    }
    // 显示自动开始提示
    showAutoNextRoundTip(time = 6) {
        this.autoNextRoundTime = time;
        this.btn_next.node.active = true;
        if (this.autoNextRoundTipLabel) {
            this.autoNextRoundTipLabel.unscheduleAllCallbacks();
            this.tick();
        }
    }
    // 关闭大结算
    close(type: PBSettlementResultType = 0) {
        this.clear();
        if (this.callBack) {
            this.callBack({ type: type, restTime: this.autoNextRoundTime });
        }
    }
    // 清空大结算
    clear() {
        this.isOpen = false;
        this.removeBtnListener();
        this.removeTick();
        this.btn_layout && this.btn_layout.stopAllActions();
        this.panel && (this.panel.active = false);
        this.spine_effect_win && (this.spine_effect_win.node.active = false);
    }
    // 移除倒计时
    removeTick() {
        this.autoNextRoundTipLabel && this.autoNextRoundTipLabel.unscheduleAllCallbacks();
    }
    // 倒计时定时器
    tick() {
        let label = this.autoNextRoundTipLabel;
        label.string = __(___("NEXT"), `(${this.autoNextRoundTime})`);
        if (this.autoNextRoundTime > 0) {
            label.scheduleOnce(() => {
                this.autoNextRoundTime--;
                this.tick();
            }, 1);
        } else {
            let roomType = this.getDm<PBGameData>().tableInfo.roomType;
            if (roomType == PBRoomType.friend) {
                facade.dm.msgWriter.sendReady();
            }
            this.close(PBSettlementResultType.AUTO_NEXT);
        }
    }
    // 等待被继承的函数
    updateView() {
    }
    // 显示分享按钮
    showButton() {
        this.btn_layout.active = true;
        this.addBtnListener();
    }
    // 显示输赢标志
    async showWinOrLoseFlag(isWin: boolean) {
        if (isWin) {
            this.spine_effect_win.node.active = true;
            this.spine_effect_win.setAnimation(0, "animation", true);
            facade.soundMgr.playBaseEffect("win");
        } else {
            this.spine_effect_win.node.active = false;
            facade.soundMgr.playBaseEffect("lose");
            Global.dispatchEvent("USER_PIGGY_BANK_HINT");
        }

        // 显示logo
        this.flagLose.active = !isWin;
        this.flagWin.active = isWin;

        if (isWin) {
            let spine = cc.find("spine", this.flagWin).getComponent(sp.Skeleton);
            spine.setAnimation(0, "ani_mbdc", false);
            spine.addAnimation(0, "ani_lizioop", true);
        } else {
            let spine = cc.find("spine", this.flagLose).getComponent(sp.Skeleton);
            spine.setAnimation(0, "ani_mbdc", false);
            spine.addAnimation(0, "ani_lizioop", true);
        }
    }

    getDm<T>(): T {
        return facade.dm as T;
    }

    getFacade<T>(): T {
        return facade as T;
    }
}