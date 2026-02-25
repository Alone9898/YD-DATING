import TimeDownCpt from "../../../../_FWExpand/UI/TimeDownCpt";
import { PBPlayer } from "../../../games/PokerBase/scripts/player/PBPlayer";
import KnockoutDetailsInfoView from "./KnockoutDetailsInfoView";
import KnockoutRankCpt from "./KnockoutRankCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutDeskInfoCpt extends cc.Component {
    @property(cc.Label)
    label_blind: cc.Label = null;
    @property(cc.Label)
    label_rank: cc.Label = null;
    @property(TimeDownCpt)
    timeDown: TimeDownCpt = null;


    @property(cc.Prefab)
    waitStartPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    waitChangePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    waitCountPrefab: cc.Prefab = null;


    private netListener: any;
    private waitStartNode: cc.Node;
    private waitChangeNode: cc.Node;
    private waitCountNode: cc.Node;
    localData;

    deskInfo: any;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");

        this.timeDown.setUpdateFunc((time, label) => {
            label.string = time > 0 ? `<b><color=#FFDA48>${Global.formatSecond(time, "mm:ss")}</color></b>` : "";
        })
    }

    protected onEnable(): void {
        // 获取信息
        this.netListener.registerMsg(MsgId.GET_KNOCKOUT_INFO, this.GET_KNOCKOUT_INFO, this);
        // 数据更新
        this.netListener.registerMsg(MsgId.REQ_KNOCKOUT_UPDATE, this.REQ_KNOCKOUT_UPDATE, this);
        // 中途换桌
        this.netListener.registerMsg(MsgId.REQ_KNOCKOUT_CHANGE, this.REQ_KNOCKOUT_CHANGE, this);
        // 开始统计
        this.netListener.registerMsg(MsgId.REQ_KNOCKOUT_COUNT, this.REQ_KNOCKOUT_COUNT, this);
        // 淘汰通知
        this.netListener.registerMsg(MsgId.REQ_KNOCKOUT_LOSE, this.REQ_KNOCKOUT_LOSE, this);
        // 比赛结束
        this.netListener.registerMsg(MsgId.REQ_KNOCKOUT_OVER, this.REQ_KNOCKOUT_OVER, this);
    }
    protected onDisable(): void {
        this.netListener.clear();
    }

    init(deskInfo) {
        this.deskInfo = deskInfo;
        this.node.active = true;
        cc.vv.NetManager.send({ c: MsgId.GET_KNOCKOUT_INFO, tn_id: deskInfo.conf.tn_id, reconnect: 1 });
    }

    close() {
        this.node.active = false;
    }
    closeAllPanel() {
        this.closeReady();
        this.closeChange();
        this.closeCount();
    }
    // 更新显示
    updateView() {
        if (!this.localData) return;
        let tn_info = this.localData.tn_info;
        if (!tn_info) return;
        let currTime = Math.ceil(new Date().getTime() / 1000);
        this.label_blind.string = tn_info.bet;
        // 更新所有人排名
        this.updateAllMathRank()

        // 比赛状态
        if (this.deskInfo.state == 11) {
            // 暂停倒计时
            this.timeDown.pause = true;
            this.timeDown.node.active = true;
            this.timeDown.timelife = tn_info.stop_time - tn_info.start_time; // 设置倒计时总时间
            // 人数与排名
            this.label_rank.string = `0/${tn_info.curr_cnt}`;
            // 未开始状态
            if (this.waitStartNode) {
                // 需求人数更新
                cc.find("node_people/value_need", this.waitStartNode).getComponent(cc.Label).string = tn_info.min_cnt;
                // 参加人数更新
                cc.find("node_people/value_cur", this.waitStartNode).getComponent(cc.Label).string = tn_info.join_cnt;
                // 等待开始倒计时
                let offsetTime = tn_info.start_time - Math.ceil(new Date().getTime() / 1000);
                if (offsetTime > 0) {
                    cc.find("node_time", this.waitStartNode).active = true;
                    cc.find("label_hint", this.waitStartNode).active = false;
                    this.waitStartNode.getComponentInChildren(TimeDownCpt).timelife = offsetTime;
                } else {
                    cc.find("node_time", this.waitStartNode).active = false;
                    cc.find("label_hint", this.waitStartNode).active = true;
                }
            }
        } else {
            // 人数与排名
            for (const info of tn_info.players) {
                if (info.uid == cc.vv.UserManager.uid) {
                    this.label_rank.string = `${info.ord}/${tn_info.join_cnt}`;
                }
            }
            if ([5, 12, 13].indexOf(this.deskInfo.state) >= 0) {
                // 比赛已经结束
                this.timeDown.pause = true;
                this.timeDown.node.active = true;
                this.timeDown.timelife = 0;
            } else {
                // 正在进行
                this.timeDown.pause = false;
                this.timeDown.node.active = true;
                this.timeDown.timelife = tn_info.stop_time - currTime;
            }
        }
    }
    // 等待开始
    showReady() {
        cc.vv.PopupManager.removeAll();
        // 弹出准备界面弹出,等待开始发牌
        cc.vv.PopupManager.addPopup(this.waitStartPrefab, {
            noTouchClose: true,
            noCloseHit: true,
            opacityIn: true,
            touchThrough: true,
            noMask: true,
            onShow: (node) => {
                this.waitStartNode = node;
                this.waitStartNode.getComponentInChildren(TimeDownCpt).setCallback(() => {
                    cc.find("node_time", this.waitStartNode).active = false;
                    cc.find("label_hint", this.waitStartNode).active = true;
                })
            }
        })
    }

    closeReady() {
        // 关闭准备界面
        cc.vv.PopupManager.removePopup(this.waitStartNode);
        this.waitStartNode = null;
    }

    showChange() {
        cc.vv.PopupManager.removeAll();
        // 弹出提示，等待服务器发送换桌消息
        cc.vv.PopupManager.addPopup(this.waitChangePrefab, {
            opacityIn: true,
            noTouchClose: true,
            noCloseHit: true,
            touchThrough: true,
            noMask: true,
            onShow: (node) => {
                this.waitChangeNode = node;
            }
        })
    }

    closeChange() {
        cc.vv.PopupManager.removePopup(this.waitChangeNode);
        this.waitChangeNode = null;
    }

    showCount() {
        cc.vv.PopupManager.removeAll();
        // 弹出提示，等待服务器发送结算消息
        // cc.log("开始统计", "showCount")
        cc.vv.PopupManager.addPopup(this.waitCountPrefab, {
            noTouchClose: true,
            noCloseHit: true,
            touchThrough: true,
            noMask: true,
            opacityIn: true,
            onShow: (node) => {
                this.waitCountNode = node;
            }
        })
    }
    closeCount() {
        cc.vv.PopupManager.removePopup(this.waitCountNode);
        this.waitCountNode = null;
    }
    // 数据初始化
    GET_KNOCKOUT_INFO(msg) {
        this.localData = msg;
        if (msg.reconnect == 1) {
            // 根据状态决定是否需要还原弹窗
            if (this.deskInfo.state == 11) {
                this.showReady();
            } else if (this.deskInfo.state == 12) {
                this.REQ_KNOCKOUT_CHANGE(null);
            } else if (this.deskInfo.state == 13) {
                this.REQ_KNOCKOUT_COUNT(null);
            }
        }
        this.updateView();
    }
    // 数据更新
    REQ_KNOCKOUT_UPDATE(msg) {
        if (!this.localData) return;
        // 取增量更新
        if (msg.join_cnt) {
            this.localData.tn_info.join_cnt = msg.join_cnt;
        }
        if (msg.curr_cnt) {
            this.localData.tn_info.curr_cnt = msg.curr_cnt;
        }
        if (msg.players) {
            this.localData.tn_info.players = msg.players;
        }
        this.updateView();
    }
    // 中途换桌
    REQ_KNOCKOUT_CHANGE(msg) {
        this.deskInfo.state = 12;
        this.showChange();
    }
    // 开始统计
    REQ_KNOCKOUT_COUNT(msg) {
        // cc.log("开始统计", "REQ_KNOCKOUT_COUNT")
        this.deskInfo.state = 13;
        this.showCount();
    }
    // 被淘汰
    REQ_KNOCKOUT_LOSE(msg) {
        this.deskInfo.state = 13;
        // 提示名次
        cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutResultPlay", {
            noTouchClose: true,
            noCloseHit: true,
            // touchThrough: true,
            noMask: true,
            opacityIn: true,
            onShow: (node) => {
                // 更新排名显示
                cc.find("label_rank", node).getComponent(cc.Label).string = msg.ord;
                cc.find("btn_to_lobby", node).on("click", () => {
                    this.doGoToHall()
                })
                cc.find("node_lose", node).active = true;
                cc.find("node_win", node).active = false;
            }
        })
    }
    // 比赛结束
    REQ_KNOCKOUT_OVER(msg) {
        if (!this.localData) return;
        if (!this.localData.tn_info) return;
        if (!this.localData.tn_info.tn_id) return;
        if (this.localData.tn_info.tn_id != msg.tn_id) return;
        // 关闭所有
        cc.vv.PopupManager.removeAll();
        // 判断是否可以分到钱
        let selfInfo = null;
        for (const info of msg.players) {
            if (info.uid == cc.vv.UserManager.uid) {
                selfInfo = info;
            }
        }
        if (selfInfo.rewards) {
            // 弹出比赛结果
            cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutDetailsInfo", {
                isWait: true,
                weight: 10,
                noTouchClose: true,
                noCloseHit: true,
                opacityIn: true,
                onShow: (node) => {
                    // 更新排名显示 TODO
                    node.getComponent(KnockoutDetailsInfoView).onInit(this.localData.tn_info.tn_id, 1);
                }
            })
            // 弹出比赛名次
            cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutResultPlay", {
                isWait: true,
                weight: 9,
                noTouchClose: true,
                noCloseHit: true,
                opacityIn: true,
                onShow: (node) => {
                    // 更新排名显示
                    cc.find("label_rank", node).getComponent(cc.Label).string = selfInfo.ord;
                    cc.find("btn_to_lobby", node).on("click", () => {
                        this.doGoToHall()
                    })
                    if (selfInfo.rewards) {
                        cc.find("node_win", node).active = true;
                        cc.find("node_win/value", node).getComponent(cc.Label).string = selfInfo.rewards[0].count;
                        cc.find("node_lose", node).active = false;
                    } else {
                        cc.find("node_lose", node).active = true;
                        cc.find("node_win", node).active = false;
                    }
                }
            })
        } else {
            // 弹出比赛名次
            cc.vv.PopupManager.addPopup("BalootClient/KnockoutMatch/prefabs/KnockoutResultPlay", {
                noTouchClose: true,
                noCloseHit: true,
                opacityIn: true,
                onShow: (node) => {
                    // 更新排名显示
                    cc.find("label_rank", node).getComponent(cc.Label).string = selfInfo.ord;
                    cc.find("btn_to_lobby", node).on("click", () => {
                        this.doGoToHall()
                    })
                    cc.find("node_lose", node).active = true;
                    cc.find("node_win", node).active = false;
                }
            })
        }
    }

    updateAllMathRank() {
        if (!this.localData) return
        let tn_info = this.localData.tn_info;
        // 遍历所有排名组件
        for (let rankCpt of cc.director.getScene().getComponentsInChildren(KnockoutRankCpt)) {
            rankCpt.node.active = false;
            let pbPlayerCpt = rankCpt.node.parent.getComponent(PBPlayer);
            if (pbPlayerCpt.playerInfoVo) {
                rankCpt.node.active = true;
                for (let info of tn_info.players) {
                    if (pbPlayerCpt.playerInfoVo.uid == info.uid) {
                        rankCpt.rank = info.ord;
                    }
                }
            }
        }
    }

    doGoToHall() {
        facade.gotoHall();
    }
}
