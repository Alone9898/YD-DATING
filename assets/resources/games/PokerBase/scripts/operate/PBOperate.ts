import { PBRoomType } from "../PBCommonData";
import { facade } from "../PBLogic";
const { ccclass, property } = cc._decorator;

/**
 * 一些通用按钮的操作
 */
@ccclass
export class PBOperate extends cc.Component {

    @property(cc.Button)
    btnReady: cc.Button = null;
    @property(cc.Button)
    btnInvite: cc.Button = null;
    @property(cc.Button)
    changeBtn: cc.Button = null;
    @property(cc.Node)
    tableCode: cc.Node = null;
    @property(cc.Node)
    leaveBtn: cc.Node = null;
    @property(cc.Node)
    confirmBtn: cc.Node = null;
    @property(cc.Node)
    watchTipNode: cc.Node = null;

    _bClickBack: any;

    onLoad(): void {
        if (this.btnReady) {
            this.btnReady.node.active = false;
            this.btnReady.node.on("click", () => {
                this.showReady(false);
                this.sendReadyReq()
            }, this);
        }

        if (this.changeBtn) {
            this.changeBtn.node.on("click", () => {
                this.changeBtn.interactable = false;
                this.sendChangeReq()
            }, this)
        }

        if (this.btnInvite) {
            this.btnInvite.node.active = false;
            this.btnInvite.node.on("click", () => {
                // cc.vv.PopupManager.addPopup(PBPopupInvite.PREFAB_PATH, {noCloseHit:true});
                this.showInviteNode()

            }, this);
            // 添加引导
            cc.loader.loadRes("BalootClient/NewerGuide/NewGuideHint", (err, prefab) => {
                if (!err) {
                    var guideNode: cc.Node = cc.instantiate(prefab);
                    guideNode.position = cc.v3(100, 0, 0);
                    let guideCpt = guideNode.getComponent("NewGuideHintCpt");
                    if (guideCpt) {
                        guideCpt.key = "salon";
                        guideCpt.step = 3;
                        guideCpt.buttons.push(this.btnInvite);
                    }
                    guideNode.parent = this.btnInvite.node;
                }
            });

        }

        if (this.tableCode) {
            this.tableCode.getComponent("Desk_Table_code").deskid = this.getTableid();
        }

        if (this.leaveBtn) {//离开房间
            this.leaveBtn.on("click", () => {
                if (this._bClickBack) return
                this._bClickBack = true
                this.scheduleOnce(() => {
                    this._bClickBack = null
                }, 1)
                if (cc.vv.gameData) {
                    cc.vv.gameData.ReqBackLobby()
                }
            }, this)
        }

        if (this.confirmBtn) {
            this.confirmBtn.on("click", () => {
                if (facade) {
                    facade.confirmBtnClick();
                }
            }, this)
        }
    }

    /**
     * 显示/隐藏 准备按钮
     */
    showReady(boo: boolean) {
        if (this.btnReady) {
            if (this.isWatcher()) {
                this.btnReady.node.active = false;
                return;
            }
            this.btnReady.node.active = boo;
        }
    }

    /**
     * 显示/隐藏 房间号
     */
    showTableCode(boo: boolean) {
        if (this.tableCode) {
            if (this.isWatcher()) {
                this.tableCode.active = false;
                return;
            }
            this.tableCode.active = boo;
        }
    }

    /**
     * 显示邀请按钮
     */
    showInvite(boo: boolean) {
        if (this.btnInvite) {
            if (this.isWatcher()) {
                this.btnInvite.node.active = false;
                return;
            }
            if (Global.isSingle()) {
                this.btnInvite.node.active = false;
                return;
            }
            this.btnInvite.node.active = boo;
        }
    }

    reset() {
        this.btnReady && (this.btnReady.node.active = false);
        this.btnInvite && (this.btnInvite.node.active = false);
        this.changeBtn && (this.changeBtn.node.active = false);
        this.tableCode && (this.tableCode.active = false);
        this.leaveBtn && (this.leaveBtn.active = false);
        this.confirmBtn && (this.confirmBtn.active = false);
        this.watchTipNode && (this.watchTipNode.active = false);
    }

    showChangeBtn(bShow) {
        if (!Global.isYDApp() || facade.dm.deskInfo.conf.roomtype == PBRoomType.friend) {
            this.changeBtn.node.active = false;
            this.changeBtn.interactable = false;
            return;
        }
        if (this.changeBtn) {
            this.changeBtn.node.active = bShow;
            this.changeBtn.interactable = bShow;
        }
    }

    /**
     * 是否显示离桌按钮
     * @param bShow 
     */
    showLeaveBtn(bShow) {
        if (this.leaveBtn) {
            this.leaveBtn.active = bShow
        }
    }

    /**
     * 是否显示结算确认按钮
     * @param bShow
     */
    showConfirmBtn(bShow, time?) {
        if (this.confirmBtn) {
            this.confirmBtn.active = bShow;
            if (time) {
                cc.find("Background/label", this.confirmBtn).getComponent("ReTimer").setReTimer(time, 1, null, "Confirm(%ss)")
            } else {
                cc.find("Background/label", this.confirmBtn).getComponent(cc.Label).string = "Confirm";
            }
        }
    }

    sendReadyReq() {
        StatisticsMgr.reqReportNow(ReportConfig.new_salon_click_ready);
        facade.dm.msgWriter.sendReady();
    }

    sendChangeReq() {
        facade.dm.msgWriter.sendChange();
    }

    isWatcher() {
        return facade.dm.tableInfo.isViewer === 1
    }

    // 观战提示
    showWatchTips(bShow: boolean) {
        if (this.watchTipNode) {
            this.watchTipNode.active = bShow;
        }
    }

    showInviteNode() {
        StatisticsMgr.reqReportNow(ReportConfig.new_salon_click_share);
        cc.vv.PopupManager.addPopup("BalootClient/GameInvite/CafeGameInvite", { noMask: true, opacityIn: true, noCloseHit: true });
    }

    getTableid() {
        if (cc.vv.gameData.deskInfo) {
            return cc.vv.gameData.deskInfo.deskid
        }
        else {
            return cc.vv.gameData.getDeskInfo().deskid
        }

    }
}