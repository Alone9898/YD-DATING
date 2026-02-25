import PBLogic from "../../PokerBase/scripts/PBLogic";
import TeenPattiGameData from "./TeenPatti_GameData";
import { PBTableState } from "../../PokerBase/scripts/PBCommonData";
import { PBSkinMgr } from "../../PokerBase/scripts/PBSkinMgr";
import { PBSoundCtrl } from "../../PokerBase/scripts/sound/PBSoundCtrl";
import KeyCpt from "../../../../_FWExpand/Ecs/components/KeyCpt";
import BtnEvtCpt from "../../../../_FWExpand/Ecs/components/BtnEvtCpt";
import TeenPattiPotCpt from "./TeenPattiPotCpt";
import TeenPattiSeatCpt, { TeenPattiSeatState } from "./TeenPattiSeatCpt";
import JettonSystem from "../../../../_FWExpand/Ecs/systems/JettonSystem";
import PokerSystem from "../../../../_FWExpand/Ecs/systems/PokerSystem";
import JettonLayoutCpt from "../../../../_FWExpand/Ecs/components/JettonLayoutCpt";
import JettonActionInCpt from "../../../../_FWExpand/Ecs/components/JettonActionInCpt";
import JettonActionOutCpt from "../../../../_FWExpand/Ecs/components/JettonActionOutCpt";
import PokerActionInCpt from "../../../../_FWExpand/Ecs/components/PokerActionInCpt";
import PokerActionOutCpt from "../../../../_FWExpand/Ecs/components/PokerActionOutCpt";
import DeskLightCpt from "../../PokerBase/scripts/operate/DeskLightCpt";
import TeenPattiCompareCpt from "./TeenPattiCompareCpt";
import TeenPattiCompareAnimCpt from "./TeenPattiCompareAnimCpt";
import TeenPattiSoundCtrl from "./sound/TeenPatti_SoundCtrl";
import DebugTeenPattiMsg from "./DebugTeenPattiMsg";
import { PBCountdown } from "../../PokerBase/scripts/widgetplus/PBCountdown";
import Table_CountDown from "../../../Table_Common/TableBase/Table_CountDown";
import NetQueueSystem from "../../../../_FWExpand/Ecs/systems/NetQueueSystem";
import { PBPlayer } from "../../PokerBase/scripts/player/PBPlayer";


let CMD = {
    BET: 25735,  // 下注
    SEECARDS: 25736,  // 查看自己牌
    SIDESHOW: 25737,  // 申请比对上家的牌
    SIDESHOWRES: 25738,  // 是否同意比牌
    SHOW: 25739,  // 最后两人比牌
    PACK: 25740,  // 弃牌

    S_SWITCH_TABLE: 52,  // 换桌
    R_SWITCH_TABLE: 1083,  // 换桌通知

    PLAYER_ENTER_ROOM: 126001,  // 玩家进入房间
    GAME_READY: 100071,  // 开始倒计时
    PLAYER_ENTER_VIEWER: 126028,  // 观战玩家进入房间
    DEAL_CARDS: 126003,  // 开局发牌
    PLAYER_BET: 126301,  // 用户下注
    PLAYER_SEE_CARDS: 126302,  // 用户看牌
    PLAYER_SIDE_SHOW: 126303,  // 用户比牌(剩余两个人以上，和上家比牌，上家已看牌)
    PLAYER_SIDE_SHOW_RESP: 126304,  // 用户比牌响应
    PLAYER_SHOW: 126305,  // 用户比牌(剩余两个人)       
    PLAYER_PACK: 126306,  // 用户弃牌
    PLAYER_TURN_TO: 126307,  // 轮到某用户操作
    PLAYER_SIT_UP: 126308,  // 玩家站起来
    GAME_OVER: 126005,          // 小结算
    TOTAL_SETTLEMENT: 126006,  // 大结算
    R_PLAYER_EXIT_ROOM: 126011,  // 玩家被踢
    R_PLAYER_EXIT: 126029,  //观战玩家离开
}

let JETTON_CONFIG = [100, 500, 1000, 5000, 10000, 50000, 100000];
let JETTON_MAX = 150;


const { ccclass, property } = cc._decorator;

@ccclass
export default class TeenPatti_Logic extends PBLogic {
    aborts: Function[] = [];
    dm: TeenPattiGameData;
    gameHitStart: cc.Node;
    btn_see: cc.Button;
    potCpt: TeenPattiPotCpt;
    blind: number = 0;
    betList: number[] = [];
    can_show: number = 0;
    can_side_show: number = 0;
    self_bet_cnt: number = 0;
    // _allActiveCnt: number = 0; // 场上还剩余活动玩家数
    btn_switch: cc.Button;


    @property(cc.Node)
    cardTypePrefab: cc.Node = null;
    @property(cc.Node)
    seenPrefab: cc.Node = null;
    @property(cc.Node)
    packedPrefab: cc.Node = null;
    @property(cc.Node)
    compareAnimPrefab: cc.Node = null;
    @property(cc.Node)
    seatAnimWinLost: cc.Node = null;

    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    jettonSystem: JettonSystem;
    pokerSystem: PokerSystem;
    publicJettonLayout: JettonLayoutCpt;
    jettonActionSet: JettonActionInCpt;
    jettonActionIn: JettonActionInCpt;
    jettonActionOut: JettonActionOutCpt;
    pokerActionIn: PokerActionInCpt;
    pokerActionOut: PokerActionOutCpt;
    lightCpt: DeskLightCpt;
    eventListener: any;
    oprView: cc.Node;
    compareCpt: TeenPattiCompareCpt;
    gameCompareLine: cc.Node;
    compareAnimCpt: TeenPattiCompareAnimCpt;
    soundMgr: TeenPattiSoundCtrl;   // 音效管理器
    countDownCpt: Table_CountDown;
    netQueueSystem: NetQueueSystem;
    nextRoundTime: number = 0;
    noMoneyTip: cc.Node;


    set canChangeDesk(value) {
        if (this.dm.tableInfo.needSelfReady()) {
            this.btn_switch.node.active = false;
        } else {
            this.btn_switch.node.active = value;
        }
    }

    loadCtrl() {
        if (window["debug_game"]) {
            this.getCpt(DebugTeenPattiMsg).node.active = true;
        } else {
            this.getCpt(DebugTeenPattiMsg).node.active = false;
        }
        // 添加皮肤管理器
        this.panel.addComponent(PBSkinMgr);
        // 添加声音管理器
        this.panel.addComponent("Table_Sound");
        this.soundMgr = this.panel.addComponent(TeenPattiSoundCtrl);
        // 调用父类加载方法
        super.loadCtrl();
        // 初始化组件
        this.initAllCpt();
        this.initSocketCallback();
        // 加载事件回调
        this.initEventCallback();
    }
    // 复写start 移除PBLogic中的start对enterTable的调用
    start() {
        this.cleanRound();
        if (window["debug_game"]) {
            this.enterTable();
        }
        this.dm.msgHandler.run();
        cc.vv.NetManager.send({ c: 4 });
    }

    // 重置
    reset() {
        this.dm.reset();
    }
    reconnectInGameReset() {
        this.dm.reset();
    }
    // 加载所有组件
    initAllCpt() {
        this.eventListener = this.node.addComponent("EventListenerCmp");

        this.jettonSystem = this.getSystem(JettonSystem);
        this.jettonSystem.parentNode = this.panel;
        this.pokerSystem = this.getSystem(PokerSystem);
        this.pokerSystem.parentNode = this.panel;
        if (Global.isYDApp()) {
            this.pokerSystem.pokerPrefab = this.cardPrefab;
        }
        this.netQueueSystem = this.getSystem(NetQueueSystem);

        // 操作指向灯
        this.lightCpt = this.getCpt(DeskLightCpt);
        // this.lightCpt.node.zIndex = 1;

        this.interactiveEmotionCtrl.node.zIndex = 1000;

        // 询问框
        this.compareAnimCpt = this.getCpt(TeenPattiCompareAnimCpt);
        this.compareAnimCpt.node.zIndex = 1000;

        this.compareCpt = this.getCpt(TeenPattiCompareCpt);
        this.compareCpt.node.zIndex = 1000;

        // 牌 和 筹码 动画配置
        this.publicJettonLayout = this.getCptByKey(JettonLayoutCpt, 'public')
        this.jettonActionSet = this.getCptByKey(JettonActionInCpt, 'set')
        this.jettonActionIn = this.getCptByKey(JettonActionInCpt, 'in')
        this.jettonActionOut = this.getCptByKey(JettonActionOutCpt, 'out')
        this.pokerActionIn = this.getCptByKey(PokerActionInCpt, 'in')
        this.pokerActionOut = this.getCptByKey(PokerActionOutCpt, 'out')

        // TeenPatti座位组件初始化
        for (const playerCpt of this.playersCtrl.activePlayers) {
            let cpt = playerCpt.node.addComponent(TeenPattiSeatCpt);
            // 设置属性
            cpt.betNode = cc.find("node_bet", playerCpt.node);
            cpt.coinNode = cc.find("user_info_node/coin_node", playerCpt.node);
            cpt.bankerNode = cc.find("dealer", playerCpt.node);
            cpt.cardTypePrefab = this.cardTypePrefab;
            cpt.seenPrefab = this.seenPrefab;
            cpt.packedPrefab = this.packedPrefab;
            cpt.compareAnimPrefab = this.compareAnimPrefab;
            cpt.seatAnimWinLost = this.seatAnimWinLost;
            cpt.init(this.panel);
            cpt.node.zIndex = 120;
            cpt.clear();
        }
        this.gameHitStart = this.getCptByKey(KeyCpt, "game_hit_start").node;
        this.btn_see = this.getCptByKey(BtnEvtCpt, "game_opr_see").getComponent(cc.Button);
        this.btn_see.node.zIndex = 100;
        this.btn_see.node.active = false;
        this.potCpt = this.getCpt(TeenPattiPotCpt);
        this.potCpt.node.zIndex = 10;
        // 换做按钮
        this.btn_switch = this.getCptByKey(BtnEvtCpt, "opr_switch_table").getComponent(cc.Button);
        this.btn_switch.node.zIndex = 200;
        this.canChangeDesk = false;

        this.gameCompareLine = this.getCptByKey(KeyCpt, "game_compare_line").node;
        this.gameCompareLine.zIndex = 100;

        this.countDownCpt = this.getCpt(Table_CountDown);
        this.countDownCpt.node.zIndex = 100;

        // 操作面板
        this.oprView = this.getCptByKey(KeyCpt, "game_view_opr").node;
        this.oprView.zIndex = 400;

        this.noMoneyTip = this.getCptByKey(KeyCpt,"no_money_tip").node;
        this.noMoneyTip.zIndex = 400;
        this.noMoneyTip.stopAllActions();
        this.noMoneyTip.active = false;

    }
    // 注册服务器协议回调
    initSocketCallback() {
        this.netQueueSystem.registerNoQueue(CMD.GAME_READY, this.GAME_READY.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.BET, this.SELF_BET.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.DEAL_CARDS, this.DEAL_CARDS.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_BET, this.PLAYER_BET.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_SEE_CARDS, this.PLAYER_SEE_CARDS.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_SIDE_SHOW, this.PLAYER_SIDE_SHOW.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_SIDE_SHOW_RESP, this.PLAYER_SIDE_SHOW_RESP.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_SHOW, this.PLAYER_SHOW.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_PACK, this.PLAYER_PACK.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_TURN_TO, this.PLAYER_TURN_TO.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_SIT_UP, this.PLAYER_SIT_UP.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.GAME_OVER, this.GAME_OVER.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.TOTAL_SETTLEMENT, this.TOTAL_SETTLEMENT.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.S_SWITCH_TABLE, this.S_SWITCH_TABLE.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.R_SWITCH_TABLE, this.R_SWITCH_TABLE.bind(this), this);

        this.netQueueSystem.register(CMD.PLAYER_ENTER_ROOM, this.PLAYER_ENTER_ROOM.bind(this));
        this.netQueueSystem.register(CMD.PLAYER_ENTER_VIEWER, this.PLAYER_ENTER_VIEWER.bind(this));
        this.netQueueSystem.register(CMD.R_PLAYER_EXIT_ROOM, this.R_PLAYER_EXIT_ROOM.bind(this));
        this.netQueueSystem.register(CMD.R_PLAYER_EXIT, this.R_PLAYER_EXIT.bind(this));
        // 玩家准备
        this.netQueueSystem.registerNoQueue(this.dm.msgCmd.R_PLAYER_READY, this.playerReady.bind(this), this);


        // this.dm.msgHandler.registerNoCacheHandler(CMD.PLAYER_ENTER_ROOM, (msg) => {
        //     this.PLAYER_ENTER_ROOM.bind(this)
        // });
        // this.dm.msgHandler.registerNoCacheHandler(CMD.PLAYER_ENTER_VIEWER, this.PLAYER_ENTER_VIEWER.bind(this));
        // this.dm.msgHandler.registerNoCacheHandler(CMD.R_PLAYER_EXIT_ROOM, this.R_PLAYER_EXIT_ROOM.bind(this));
        // this.dm.msgHandler.registerNoCacheHandler(CMD.R_PLAYER_EXIT, this.R_PLAYER_EXIT.bind(this));
        // this.dm.msgHandler.registerHandler(CMD.PLAYER_ENTER_ROOM, this.PLAYER_ENTER_ROOM.bind(this), 0);
        // this.dm.msgHandler.registerHandler(CMD.PLAYER_ENTER_VIEWER, this.PLAYER_ENTER_VIEWER.bind(this), 0);
        // this.dm.msgHandler.registerHandler(CMD.R_PLAYER_EXIT_ROOM, this.R_PLAYER_EXIT_ROOM.bind(this), 0);
        // this.dm.msgHandler.registerHandler(CMD.R_PLAYER_EXIT, this.R_PLAYER_EXIT.bind(this), 0);

        // this.dm.msgHandler.startPlayCmd();

    }
    // 注册事件回调
    initEventCallback() {
        // 看自己的牌
        this.eventListener.registerEvent("game_opr_see", (button: cc.Button) => {
            this.soundMgr.playEffect("flop_card_3")
            cc.vv.NetManager.send({ c: CMD.SEECARDS });
        })
        // 跟注
        this.eventListener.registerEvent("game_opr_blind", (button: cc.Button) => {
            // 检查钱是否足够
            cc.vv.NetManager.send({ c: CMD.BET, coin: this.betList[0] });
            this.oprView.active = false;
        })
        // 跟注
        this.eventListener.registerEvent("game_opr_blind_2", (button: cc.Button) => {
            // 检查钱是否足够
            cc.vv.NetManager.send({ c: CMD.BET, coin: this.betList[1] });
            this.oprView.active = false;
        })
        // 弃牌
        this.eventListener.registerEvent("game_opr_packed", (button: cc.Button) => {
            cc.vv.NetManager.send({ c: CMD.PACK });
            this.oprView.active = false;
        })
        // 比牌
        this.eventListener.registerEvent("game_opr_show", (button: cc.Button) => {
            cc.vv.NetManager.send({ c: CMD.SIDESHOW });
            this.oprView.active = false;
        })
        // 开牌
        this.eventListener.registerEvent("game_opr_show_all", (button: cc.Button) => {
            cc.vv.NetManager.send({ c: CMD.SHOW });
            this.oprView.active = false;
        })
        // 接受比牌
        this.eventListener.registerEvent("game_opr_accept", (button: cc.Button) => {
            cc.vv.NetManager.send({ c: CMD.SIDESHOWRES, rtype: 1 });
            this.compareCpt.close();
        })
        // 拒绝比牌
        this.eventListener.registerEvent("game_opr_cancel", (button: cc.Button) => {
            cc.vv.NetManager.send({ c: CMD.SIDESHOWRES, rtype: 0 });
            this.compareCpt.close();
        })
        // 换桌
        this.eventListener.registerEvent("opr_switch_table", (button: cc.Button) => {
            this.canChangeDesk = false;
            cc.vv.NetManager.send({ c: CMD.S_SWITCH_TABLE, uid: cc.vv.UserManager.uid });
        })

    }
    // 清除所有
    cleanRound() {
        this.playersCtrl.hideTimer();
        this.jettonSystem.destroyAllJetton();
        this.pokerSystem.destroyAllPoker();
        this.netQueueSystem.clearQueue();
        this.netQueueSystem.running = true;
        for (const abortFunc of this.aborts) {
            abortFunc();
        }
        for (const seatCpt of this.getCpts(TeenPattiSeatCpt)) {
            seatCpt.clear();
        }
        // this.countdown.hide();
        this.countDownCpt.hide();
        this._showMathUIAni(false);
        this.gameHitStart.active = false;
        // 清理奖池盲注组件
        this.potCpt.betChips = 0;
        this.potCpt.round = 0;
        this.btn_see.node.active = false;
        this.lightCpt.close();
        this.oprView.active = false;
        this.compareCpt.close();
        this.gameCompareLine.active = false;
        this.compareAnimCpt.close();
        this.betList = []
        this.can_show = 0;
        this.can_side_show = 0;
        this.self_bet_cnt = 0;
        // this._allActiveCnt = 0;
        this.canChangeDesk = false;
        this.operate.reset();
        cc.find("safe_node/maxPot", this.node).active = false;
    }
    // 打开规则
    openRule() {
    }
    loadBgCtrl() {
        return null
    }
    // 重连和进入场景后调用(非重新)
    enterTableLater() {
    }
    // 音效播放组件
    loadSoundCtrl() {
        return this.panel.addComponent(TeenPattiSoundCtrl);
    }

    // 进入房间 或者 断线重连
    async enterTable() {
        // 开启网络包处理
        this.netQueueSystem.run();

        this.cleanRound();
        // 更新联赛显示
        this.playersCtrl.cleanRound();
        let tableStatus = this.dm.tableStatus;
        // 根据用户数据,座位组件 与 数据关联
        this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);
        // 判断是不是观战
        if (this.dm.tableInfo.isViewer && !this.dm.playersDm.selfAbsInfo.isSeated) {
            this.viewerList.show(this.dm.playersDm.viewerList);
        } else {
            this.viewerList.hide();
        }
        // 是否有申请解散
        if (this.dm.deskInfo.dismiss) {
            this.playerApplyDismiss(this.dm.deskInfo.dismiss);
        }
        // 获取自己信息
        let selfInfo = this.dm.playersDm.selfAbsInfo;
        // 断线重连与进入游戏初始化数据
        this.blind = this.dm.deskInfo.bet;

        // 玩家状态恢复
        for (const _info of this.dm.deskInfo.users) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(TeenPattiSeatCpt);
            // let activeSeatCpt = this.playersCtrl.getPlayerByUid(_info.uid);
            if (_info.round) {
                this.pokerSystem.forceUpdateLayout(seatCpt.handLayout, _info.round.cards);
                seatCpt.handLayout.updateLayout();
                seatCpt.coin = _info.coin;
                // seatCpt.setBetChips(_info.round.betCoin, false);
                seatCpt.isLoser = _info.round.packed;
                seatCpt.isPacked = _info.round.packed;

                this.self_bet_cnt = _info.round.betCnt;
                this.btn_see.getComponentInChildren(cc.Label).string = ___("SEE({1}/{2})", this.self_bet_cnt, this.dm.deskInfo.conf.blindCnt);

                if (!seatCpt.isLoser) {
                    // this._allActiveCnt += 1;
                }
                // 如果自己已经开牌
                if (_info.uid == cc.vv.UserManager.uid) {
                    seatCpt.isViewCard = _info.round.seen == 1 ? 2 : 0;
                    // 操作面板恢复
                    this.betList = _info.round.betList || [this.blind, this.blind * 2];
                    // 操作面板恢复
                    this.can_show = _info.round.can_show || 0;
                    this.can_side_show = _info.round.can_side_show || 0;
                    for (const pokerCpt of seatCpt.handLayout.pokerList) {
                        pokerCpt.isFront = _info.round.seen > 0;
                    }
                    if (_info.round.packed == 0 && _info.round.seen > 0) {
                        seatCpt.setCardType(_info.round.cardType || 0, true);
                    }
                    // 是否托管
                    if (_info.auto == 1) {
                        this.autoHost.show()
                    } else {
                        this.autoHost.hide()
                    }
                } else {
                    seatCpt.isViewCard = _info.round.seen;
                }

                if (_info.uid == cc.vv.UserManager.uid) {
                    if (_info.round.packed == 1) {
                        this.selfBetCoin = 0;
                    } else {
                        this.selfBetCoin = _info.round.betCoin;
                    }
                }

                // 如果已经弃牌
                if (_info.round.packed == 1) {
                    seatCpt.isViewCard = 0;
                }
            }
            // 恢复准备状态
            seatCpt.userInfoCmp.showReadyTip(_info.state == 2, false);
        }
        // 恢复是观战玩家匿名
        for (const _info of this.dm.deskInfo.views) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(TeenPattiSeatCpt);
            seatCpt.isUnknown = true;
            seatCpt.isWather = true;
            // seatCpt.setCoinNodeActive(false);
        }
        // 恢复座位上玩家匿名
        for (const _info of this.dm.deskInfo.users) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(TeenPattiSeatCpt);
            seatCpt.isUnknown = this.dm.tableInfo.isViewer == 1//tableStatus.currStatus != PBTableState.PLAY;
            seatCpt.isWather = this.dm.tableInfo.isViewer == 1;
            // seatCpt.setCoinNodeActive(this.dm.tableInfo.isViewer == 0);
        }
        // 恢复奖池筹码节点
        this.potCpt.betChips = this.dm.deskInfo.round.potCoin || 0;
        for (const _info of this.dm.deskInfo.views) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(TeenPattiSeatCpt);
            seatCpt.coin = _info.coin;
        }

        if (this.dm.deskInfo.state == PBTableState.MATCH || this.dm.deskInfo.state == PBTableState.READY) {
            this.canChangeDesk = true;
        } else {
            if (this.dm.tableInfo.isViewer == 1) {
                this.canChangeDesk = true;
                this.operate.showWatchTips(true);
            } else {
                this.canChangeDesk = false;
                // 判断自己是否弃牌
                for (const _info of this.dm.deskInfo.users) {
                    if (_info.uid == cc.vv.UserManager.uid) {
                        if (_info.round.packed == 1) {
                            this.canChangeDesk = true;
                        }
                    }
                }
            }
        }
        // 进入房间倒计时
        if (this.dm.deskInfo.waitTime > 0) {
            // this.countdown.show(this.dm.deskInfo.waitTime);
            // this.countDownCpt.show(this.dm.deskInfo.waitTime);
            this._showMathUIAni(true, this.dm.deskInfo.waitTime)
        }
        // 恢复
        if (tableStatus.currStatus == PBTableState.MATCH || tableStatus.currStatus == PBTableState.READY || tableStatus.currStatus == PBTableState.GAMEOVER || tableStatus.currStatus == PBTableState.SETTLE) {
            // 是否显示邀请和准备按钮
            if (this.dm.tableInfo.needSelfReady() && this.dm.tableInfo.isViewer == 0) {
                this.operate.showTableCode(true);
                this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                this.operate.showInvite(true);
            }
            this.playersCtrl.hideAllEmptySeat();
        } else if (tableStatus.currStatus == PBTableState.PLAY) {
            // 关闭空座位显示
            this.playersCtrl.hideAllEmptySeat();
            // 操作恢复
            let activeSeatInfo = this.dm.playersDm.getPlayerBySeatId(this.dm.deskInfo.round.activeSeat);
            if(activeSeatInfo) {
                this.playersCtrl.showTimer(activeSeatInfo.position, this.dm.deskInfo.round.delayTime || 10);
                // 指向灯
                let activeSeatCpt = this.playersCtrl.getPlayerByUid(activeSeatInfo.uid);
                let seatCpt = this.playersCtrl.getPlayerByUid(activeSeatCpt.playerInfoVo.uid).getComponent(TeenPattiSeatCpt);
                if (seatCpt.data.uid == cc.vv.UserManager.uid) {
                    this.lightCpt.trunTo(cc.v3(seatCpt.node.parent.convertToNodeSpaceAR(seatCpt.pokerPos)), 0);
                } else {
                    this.lightCpt.trunTo(seatCpt.node.position, 0);
                }
                // 判断是不是自己操作
                if (activeSeatInfo.uid == cc.vv.UserManager.uid) {
                    // 复原被邀请状态
                    let ask_uid = -1;
                    let ans_uid = -1;
                    let isBeInvite = false;
                    for (const _info of this.dm.deskInfo.users) {
                        if (_info.uid == cc.vv.UserManager.uid && _info.state == 25) {
                            // 显示比牌询问框
                            isBeInvite = true;
                        }
                        if (_info.state == 24) {
                            ask_uid = _info.uid;
                        } else if (_info.state == 25) {
                            ans_uid = _info.uid;
                        }
                    }
                    if (isBeInvite) {
                        let askSeat = this.playersCtrl.getPlayerByUid(ask_uid).getComponent(TeenPattiSeatCpt);
                        let beAskSeat = this.playersCtrl.getPlayerByUid(ans_uid).getComponent(TeenPattiSeatCpt);
                        this.compareCpt.open(this.dm.deskInfo.round.delayTime, askSeat.data, beAskSeat.data);
                    } else {
                        this.oprView.active = true;
                        this.updateOprView(this.dm.deskInfo.round.delayTime || 10, false);
                    }
                }
            }
            // 恢复庄家
            if (this.dm.deskInfo.round.dealer && this.dm.deskInfo.round.dealer.uid) {
                let seatCptD = this.playersCtrl.getPlayerByUid(this.dm.deskInfo.round.dealer.uid).getComponent(TeenPattiSeatCpt);
                seatCptD.isBanker = true;
            }
            // 是否可以看牌
            for (const _info of this.dm.deskInfo.users) {
                if (_info.uid == cc.vv.UserManager.uid) {
                    this.btn_see.node.active = _info.round.seen == 0 && _info.round.packed == 0;
                }
            }
        }
        // 更新皮肤
        this.changeSkin();
    }
    // 某玩家进入房间
    PLAYER_ENTER_ROOM(msg) {
        // console.log("玩家进入房间 126001", msg)
        if (msg.code === 200 && !msg.spcode) {
            let pvo = this.dm.parseAPlayer(msg.user);
            this.dm.playersDm.viewerList.push(pvo);
            if (pvo.seatId) { // 观战玩家在位子上的也要坐下
                this.dm.playersDm.seat(pvo);
                this.playersCtrl.seat(pvo);
                let seatCpt = this.playersCtrl.getPlayerByUid(pvo.uid).getComponent(TeenPattiSeatCpt);
                seatCpt.coin = msg.user.coin;
                seatCpt.isUnknown = true;
                seatCpt.isWather = false;
                // seatCpt.setCoinNodeActive(true);
            }
        }
    }
    // 观战玩家进入房间
    PLAYER_ENTER_VIEWER(msg) {
        if (msg.code === 200 && !msg.spcode) {
            let pvo = this.dm.parseAPlayer(msg.user);
            this.dm.playersDm.viewerList.push(pvo);
            if (pvo.seatId) { // 观战玩家在位子上的也要坐下
                this.dm.playersDm.seat(pvo);
                this.playersCtrl.seat(pvo);
                let seatCpt = this.playersCtrl.getPlayerByUid(pvo.uid).getComponent(TeenPattiSeatCpt);
                seatCpt.coin = msg.user.coin;
                seatCpt.isUnknown = true;
                seatCpt.isWather = true;
                // seatCpt.setCoinNodeActive(false);
                if (pvo.uid == cc.vv.UserManager.uid) {   // 自己是观战玩家
                    this.dm.tableInfo.isViewer = 1;
                }
            }
        }
    }

    R_PLAYER_EXIT_ROOM(msg) {
        this.playerExit(msg);
    }
    // 观战玩家离开房间
    R_PLAYER_EXIT(msg) {
        let p = this.dm.playersDm.getPlayerByUid(msg.uid);
        if (p) {
            this.dm.playersDm.removeAUser(p.uid);
            this.playersCtrl.standUp(p.position);
        }
    }

    SELF_BET(msg) {
        if (msg.spcode == 210) {
            console.log("下注金额不对")
        } else if (msg.spcode == 1066) {
            cc.vv.FloatTip.show(___("金币不足"));
        }

        if(msg.lackcoin == 1){// 金币可能不够
            if(this.noMoneyTip){
                this.noMoneyTip.stopAllActions();
                this.noMoneyTip.active = true;
                let selfNode = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).node
                let sPos = this.noMoneyTip.parent.convertToNodeSpaceAR(selfNode.convertToWorldSpaceAR(cc.v2(0,0)));
                this.noMoneyTip.position = cc.v3(sPos);
                this.noMoneyTip.opacity = 0;
                cc.tween(this.noMoneyTip)
                    .by(0.2, {y:200, opacity:255})
                    .delay(3)
                    .to(0.3,{opacity:0})
                    .call(()=>{
                        this.noMoneyTip.active = false;
                    })
                    .start()
            }
        }
    }
    // 游戏进入倒计时
    GAME_READY(msg) {
    }

    // 开始游戏-发牌
    async DEAL_CARDS(msg) {
        // 重置
        this.cleanRound();
        this.playersCtrl.hideAllEmptySeat();
        // 提示游戏开始
        // this.hitStart();
        // await this.delay(1.5, this.aborts);
        // 提示游戏开始声音
        this.soundMgr.playBaseEffect("game_start");
        // 所有玩家取消准备状态
        this.playersCtrl.cancelPlayerReady(this.dm.playersDm.seatedPlayersInfo);
        let playerList = [];
        // this._allActiveCnt = 0;
        for (const palyerCpt of this.playersCtrl.activePlayers) {
            if (palyerCpt.playerInfoVo && msg.discardUids.indexOf(palyerCpt.playerInfoVo.uid) >= 0) {
                playerList.push(palyerCpt.playerInfoVo);
                // this._allActiveCnt += 1;
            }
        }
        // 发牌排序
        playerList.sort((a, b) => {
            return a.position - b.position;
        })
        if (playerList[0]) {//有时进入游戏报错，代码保护下
            while (playerList[0].uid != msg.dealerUid) {
                playerList.push(playerList.shift());
            }
        }

        playerList.push(playerList.shift());
        // 下注声音
        this.soundMgr.playEffect("bet");
        for (const info of playerList) {
            // 修改座位状态
            let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(TeenPattiSeatCpt);
            seatCpt.isUnknown = false;
            seatCpt.isWather = false;
            // seatCpt.setCoinNodeActive(true);
            seatCpt.state = TeenPattiSeatState.POKER;
            seatCpt.isBanker = msg.dealerUid == info.uid
            seatCpt.coin = seatCpt.coin - this.blind;
            seatCpt.setBetChips(this.blind);
            this.selfBetCoin = this.blind;
            if (info.uid == cc.vv.UserManager.uid) {
                this.self_bet_cnt += 1;
            }
            // 下注
            // for (const jettonCpt of this.jettonSystem.createJettonByConfig(this.blind, JETTON_CONFIG, JETTON_MAX)) {
            //     this.jettonActionIn.jettonCpt = jettonCpt;
            //     this.jettonActionIn.fromNode = seatCpt.node;
            //     this.jettonSystem.jettonInLayout(this.publicJettonLayout, this.jettonActionIn);
            // }
        }
        // 同步奖池数量
        await this.delay(0.4, this.aborts);
        this.potCpt.betChips = msg.potCoin;
        await this.delay(0.3, this.aborts);
        // 创建发牌配置
        let sendConfig = [];
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < playerList.length; i++) {
                const info = playerList[i];
                let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(TeenPattiSeatCpt);
                let cardUint = 0;
                if (info.uid == cc.vv.UserManager.uid) {
                    cardUint = msg.cards[j];
                }
                sendConfig.push({
                    layout: seatCpt.handLayout,
                    cardUint: cardUint,
                })
            }
        }
        for (const item of sendConfig) {
            this.soundMgr.playEffect("dealcard");
            this.playHeguanAnim("fapai");
            let pokerCpt = this.pokerSystem.createPoker(item.cardUint);
            pokerCpt.isFront = false;
            this.pokerActionIn.toLayout = item.layout;
            this.pokerActionIn.pokerCpt = pokerCpt;
            this.pokerSystem.pokerInLayout(this.pokerActionIn);
            await this.delay(0.05, this.aborts);
        }
        await this.delay(0.5, this.aborts);
        this.playHeguanAnim("kaishi");
        await this.delay(0.1, this.aborts);
        if (!this.dm.tableInfo.isViewer) {
            // 显示看牌按钮
            this.btn_see.node.active = true;
            this.btn_see.getComponentInChildren(cc.Label).string = ___("SEE({1}/{2})", this.self_bet_cnt, this.dm.deskInfo.conf.blindCnt);
        }
    }
    // 某用户下注结果
    PLAYER_BET(msg) {
        // console.log("玩家下注", msg)
        this.soundMgr.playEffect("bet");
        this.playersCtrl.hideTimer();
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(TeenPattiSeatCpt);
        seatCpt.isOpr = false;
        seatCpt.coin = seatCpt.coin - msg.coin;
        seatCpt.setBetChips(msg.coin, true, () => {
            this.potCpt.betChips = msg.potCoin;
        });
        // let playerInfo = this.dm.playersDm.getPlayerByUid(msg.uid);
        // 如果是自己关闭面板
        if (msg.uid == cc.vv.UserManager.uid) {
            this.oprView.active = false;
            this.selfBetCoin = msg.betCoin;
            this.self_bet_cnt = msg.betCnt;
            this.btn_see.getComponentInChildren(cc.Label).string = ___("SEE({1}/{2})", this.self_bet_cnt, this.dm.deskInfo.conf.blindCnt);
        }
        // for (const jettonCpt of this.jettonSystem.createJettonByConfig(msg.coin, JETTON_CONFIG, JETTON_MAX)) {
        //     this.jettonActionIn.jettonCpt = jettonCpt;
        //     this.jettonActionIn.fromNode = seatCpt.node;
        //     this.jettonSystem.jettonInLayout(this.publicJettonLayout, this.jettonActionIn);
        // }
    }
    // 某用户弃牌
    PLAYER_PACK(msg) {
        // console.log("玩家弃牌", msg)
        this.playersCtrl.hideTimer();
        this.soundMgr.playEffect("flop_card_3")
        // this._allActiveCnt -= 1;
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(TeenPattiSeatCpt);
        seatCpt.isLoser = true;
        seatCpt.isPacked = true;
        seatCpt.isViewCard = 0;
        seatCpt.isOpr = false;
        seatCpt.cardTypeCpt.close();
        if (msg.uid == cc.vv.UserManager.uid) {
            this.btn_see.node.active = false;
            this.selfBetCoin = 0;
            this.canChangeDesk = true;
        }
        // 记录是否可以申请比牌
        this.can_show = msg.can_show;
        // 是否可以亮牌
        this.can_side_show = msg.can_side_show;
        this.updateOprView();
    }
    // 某用户看牌结果
    PLAYER_SEE_CARDS(msg) {
        // console.log("玩家看牌", msg)
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(TeenPattiSeatCpt);
        // 自己看牌
        if (msg.uid == cc.vv.UserManager.uid) {
            // 更新操作面板
            if (msg.betList) {
                this.betList = msg.betList;
            }
            // 记录是否可以申请比牌
            this.can_show = msg.can_show;
            // 是否可以亮牌
            this.can_side_show = msg.can_side_show;
            seatCpt.isViewCard = 2;
            this.updateOprView();
            let selfHandLayout = seatCpt.handLayout;
            this.pokerSystem.forceUpdateLayout(selfHandLayout, msg.cards);
            this.pokerSystem.updateLayout(selfHandLayout);
            // AppLog.warn("=====玩家看牌：" + selfHandLayout);
            for (const pokerCpt of selfHandLayout.pokerList) {
                pokerCpt.flip = !pokerCpt.isFront;
            }
            seatCpt.setCardType(msg.cardType || 0, true);
            this.btn_see.node.active = false;
        } else {
            // 记录玩家已经看牌
            seatCpt.isViewCard = 1;
            // 记录是否可以申请比牌
            this.can_show = msg.can_show;
            // 是否可以亮牌
            this.can_side_show = msg.can_side_show;
            this.updateOprView();
        }
    }
    // 发现请求比牌
    PLAYER_SIDE_SHOW(msg) {
        // console.log("玩家请求比牌", msg)
        let askSeat = this.playersCtrl.getPlayerByUid(msg.ask_uid).getComponent(TeenPattiSeatCpt);
        let beAskSeat = this.playersCtrl.getPlayerByUid(msg.ans_uid).getComponent(TeenPattiSeatCpt);
        askSeat.isOpr = false;
        // 显示比牌连线动画
        this.gameCompareLine.active = true;
        let dir = beAskSeat.node.position.sub(askSeat.node.position);
        this.gameCompareLine.position = askSeat.node.position.lerp(beAskSeat.node.position, 0.5);
        this.gameCompareLine.angle = cc.Vec3.RIGHT.signAngle(dir) * 180 / Math.PI;
        // askSeat.setReqCompareAnim();
        // beAskSeat.setReqCompareAnim();
        // 进行下注
        askSeat.coin -= msg.coin;
        askSeat.setBetChips(msg.coin, true, () => {
            // 更新奖池 最好是要需要全量更新
            this.potCpt.betChips += msg.coin;
        });
        // for (const jettonCpt of this.jettonSystem.createJettonByConfig(msg.coin, JETTON_CONFIG, JETTON_MAX)) {
        //     this.jettonActionIn.jettonCpt = jettonCpt;
        //     this.jettonActionIn.fromNode = askSeat.node;
        //     this.jettonSystem.jettonInLayout(this.publicJettonLayout, this.jettonActionIn);
        // }
        // 关闭所有倒计时
        this.playersCtrl.hideTimer();
        // 自己被邀请比牌
        if (msg.ans_uid == cc.vv.UserManager.uid) {
            // 显示比牌询问框
            this.compareCpt.open(msg.delayTime, askSeat.data, beAskSeat.data);
        } else if (msg.ask_uid == cc.vv.UserManager.uid) {
            // 关闭操作面板
            this.oprView.active = false;
        }
    }
    // 某用户比牌响应
    async PLAYER_SIDE_SHOW_RESP(msg) {
        this.compareCpt.close();
        // 记录是否可以申请比牌
        this.can_show = msg.can_show;
        // 是否可以亮牌
        this.can_side_show = msg.can_side_show;
        this.updateOprView();
        // 输赢区分
        let askSeat = this.playersCtrl.getPlayerByUid(msg.ask_uid).getComponent(TeenPattiSeatCpt);
        let beAskSeat = this.playersCtrl.getPlayerByUid(msg.ans_uid).getComponent(TeenPattiSeatCpt);
        // 关闭连线动画
        this.gameCompareLine.active = false;
        // 关闭比牌持续动画
        askSeat.closeCompareAnim();
        beAskSeat.closeCompareAnim();
        // 关闭所有倒计时
        this.playersCtrl.hideTimer();
        // 同意比牌
        if (msg.rtype > 0) {
            let winSeat: TeenPattiSeatCpt = null;
            let lostSeat: TeenPattiSeatCpt = null;
            if (msg.ask_uid == msg.win_uid) {
                winSeat = askSeat;
                lostSeat = beAskSeat;
            } else {
                winSeat = beAskSeat;
                lostSeat = askSeat;
            }
            // 比牌动画
            this.compareAnimCpt.run(
                { cards: msg.lcards, cardType: msg.lcardType, userinfo: askSeat.data },
                { cards: msg.rcards, cardType: msg.rcardType, userinfo: beAskSeat.data },
                winSeat.data.uid,
            );
            await this.delay(3, this.aborts);
            // 播放输赢动画
            winSeat.setWinLostAnim(1);
            lostSeat.setWinLostAnim(2);
            // 输的出来
            lostSeat.isLoser = true;
            lostSeat.isPacked = true;
            lostSeat.isViewCard = 0;
            lostSeat.state = TeenPattiSeatState.FOLD;
            lostSeat.closeCardType();
            // 自己比输了弃牌
            if (lostSeat.data.uid == cc.vv.UserManager.uid) {
                this.selfBetCoin = 0;
                this.canChangeDesk = true;
            }
        } else {
            // 拒绝比牌
            beAskSeat.setWinLostAnim(3);
        }
    }
    // 最后两人直接亮牌
    PLAYER_SHOW(msg) {
        // console.log("最后两人亮牌", msg)
        // 关闭所有倒计时
        this.playersCtrl.hideTimer();
        // show 牌需要扣钱
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(TeenPattiSeatCpt);
        seatCpt.isOpr = false;
        // 进行下注
        seatCpt.coin -= msg.coin;
        seatCpt.setBetChips(msg.coin, true, () => {
            // 更新奖池
            this.potCpt.betChips += msg.coin;
        });
    }
    // 轮到某人操作
    PLAYER_TURN_TO(msg) {
        // 关闭所有倒计时
        this.playersCtrl.hideTimer();
        let pbPlayer = this.playersCtrl.getPlayerByUid(msg.nextUid);
        let playerInfo = this.dm.playersDm.getPlayerByUid(msg.nextUid);
        if (pbPlayer) {
            let seatCpt = pbPlayer.getComponent(TeenPattiSeatCpt);
            seatCpt.coin = msg.coin;
            // 指向第一个操作的人
            if (seatCpt.data.uid == cc.vv.UserManager.uid) {
                this.lightCpt.trunTo(cc.v3(seatCpt.node.parent.convertToNodeSpaceAR(seatCpt.pokerPos)));
            } else {
                this.lightCpt.trunTo(seatCpt.node.position);
            }
            // 显示倒计时
            this.playersCtrl.showTimer(playerInfo.position, msg.delayTime);
            if (msg.state == 26) {
                // 如果是自己开启操作面板
                if (msg.nextUid == cc.vv.UserManager.uid) {
                    cc.vv.PlatformApiMgr.deviceShock && cc.vv.PlatformApiMgr.deviceShock();
                    this.betList = msg.betList;
                    this.oprView.active = true;
                    // 是否可以亮牌
                    this.can_side_show = msg.can_side_show;
                    this.updateOprView(msg.delayTime, true);
                } else {
                    this.oprView.active = false;
                }
            }
        }
    }
    // 某用户站起
    PLAYER_SIT_UP(msg) {
        // console.log("玩家站起", msg)
    }
    // 小结算-游戏结束
    async GAME_OVER(msg) {
        let animTime = 0;
        this.netQueueSystem.running = false;
        this.compareCpt.close();
        // 移除所有的定时器
        for (const abort of this.aborts) { abort(); }
        // 关闭指示灯
        this.lightCpt.close();
        // 记录玩家下注情况
        this.selfBetCoin = 0;
        // 关闭操作面板
        this.oprView.active = false;
        // 关闭看牌按钮
        this.btn_see.node.active = false;
        // 更新玩家状态
        for (const seatCpt of this.getCpts(TeenPattiSeatCpt)) {
            seatCpt.setBetChips(0);
            seatCpt.closeCardType();
        }
        // 比牌结算,出现比牌动画后再开牌
        if (msg.rtype == 1) {
            let seatCpt_1 = this.playersCtrl.getPlayerByUid(msg.allCards[0].uid).getComponent(TeenPattiSeatCpt);
            let seatCpt_2 = this.playersCtrl.getPlayerByUid(msg.allCards[1].uid).getComponent(TeenPattiSeatCpt);
            let winUid = null;
            if (msg.allCards[0].coin > 0) {
                winUid = msg.allCards[0].uid;
            } else {
                winUid = msg.allCards[1].uid;
            }
            this.compareAnimCpt.run(
                { cards: msg.allCards[0].cards, cardType: msg.allCards[0].cardType, userinfo: seatCpt_1.data },
                { cards: msg.allCards[1].cards, cardType: msg.allCards[1].cardType, userinfo: seatCpt_2.data },
                winUid,
            );
            animTime += 3;
            await this.delay(3, this.aborts);
        }
        else if (msg.rtype == 3) {    // 3.封顶自动结算
            cc.find("safe_node/maxPot", this.node).active = true;
            cc.find("safe_node/maxPot", this.node).zIndex = 100;
            cc.find("safe_node/maxPot/spine", this.node).getComponent(sp.Skeleton).setAnimation(0, "animation", false);
            animTime += 2;
            await this.delay(2, this.aborts);
            cc.find("safe_node/maxPot", this.node).active = false;
        }
        if (msg.rtype != 2) {
            // 准备开牌
            for (const info of msg.allCards) {
                if (info.cards.length > 0) {
                    let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(TeenPattiSeatCpt);
                    seatCpt.state = TeenPattiSeatState.WAIT;
                    seatCpt.isViewCard = 0;
                    this.openCards(seatCpt, info);
                    // 输的人牌变灰
                    if (info.coin <= 0) {
                        seatCpt.isViewCard = 0;
                        seatCpt.isLoser = true;
                    } else {
                        seatCpt.coin = seatCpt.coin + info.coin;
                    }
                }
            }
            animTime += 1.1;
            await this.delay(1.1, this.aborts);
        }
        // 分筹码
        let jettonConfig = [];
        for (const info of msg.winners) {
            let winCoin = 0;
            for (const _info of msg.allCards) {
                if (_info.uid == info) {
                    winCoin = _info.coin;
                }
            }
            jettonConfig.push({ uid: info, jettonCpts: [], coin: winCoin });
        }
        this.potCpt.betChips = 0;
        for (let i = 0; i < jettonConfig.length; i++) {
            const config = jettonConfig[i];
            // cc.audioEngine.playEffect(this.getAudio("chips"), false);
            let seatCpt = this.playersCtrl.getPlayerByUid(config.uid).getComponent(TeenPattiSeatCpt);
            seatCpt.setBetChips(config.coin, false);
            seatCpt.betNode.stopAllActions();
            seatCpt.betNode.position = seatCpt.betNode.parent.convertToNodeSpaceAR(this.potCpt.node.convertToWorldSpaceAR(cc.v3()));
            cc.tween(seatCpt.betNode).to(0.3, { position: seatCpt.betNode.parent.convertToNodeSpaceAR(seatCpt.headPos) }, { easing: 'sineOut' }).call(() => {
                seatCpt.setBetChips(0);
            }).start();
        }
        animTime += 0.4;
        await this.delay(0.4, this.aborts);
        // 播放输赢提示结果
        this.soundMgr.playEffect("win");
        for (const info of msg.allCards) {
            let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(TeenPattiSeatCpt);
            if (info.coin > 0) {
                seatCpt.setWinLostAnim(1);
            } else if (info.coin < 0) {
                seatCpt.setWinLostAnim(2);
            } else {
                seatCpt.setWinLostAnim(0);
            }
            seatCpt.pbPlayer.playCoinChange(info.coin, false, false);
            seatCpt.coin += info.coin;
        }
        // 同步用户金币
        if (msg.settle) {
            for (let i = 0; i < msg.settle.fcoins.length; i++) {
                const fcoin = msg.settle.fcoins[i];
                let playerVfo = this.dm.playersDm.getPlayerBySeatId(i + 1);
                if (playerVfo && fcoin) {
                    let pInfo = this.playersCtrl.getPlayerByUid(playerVfo.uid).getComponent(TeenPattiSeatCpt);
                    pInfo.coin = fcoin;
                }
            }
        }
        // 等待动作结束
        animTime += 0.7;
        await this.delay(0.7, this.aborts);
        // 清空座位状态
        for (const seatCpt of this.getCpts(TeenPattiSeatCpt)) {
            seatCpt.clear();
        }
        // 清楚所有牌
        this.pokerSystem.destroyAllPoker();
        this.netQueueSystem.running = true;

        let bShowMatch = false;
        if (this.nextRoundTime) {
            // 显示换桌和倒计时
            this.countDownCpt.show(Math.ceil(this.nextRoundTime - animTime));
            // bShowMatch = true;  // 正常结算，两局直接显示match倒计时
            this.canChangeDesk = true;
            this.operate.showWatchTips(false);
        } else {
        }
        // 是否显示邀请和准备按钮
        if (this.dm.tableInfo.needSelfReady() && this.dm.tableInfo.isViewer == 0) {
            // bShowMatch = !this.dm.playersDm.selfInfo.isReady;   // 好友房，已经准备了，就不再显示倒计时了
            this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
            this.operate.showInvite(false);//this.dm.playersDm.getPlayerCount() == 1);
            this.operate.showTableCode(false);//this.dm.playersDm.getPlayerCount() == 1);
        }
        // this._showMathUIAni(bShowMatch, Math.ceil(this.nextRoundTime - animTime));
    }
    // 大结算
    async TOTAL_SETTLEMENT(msg) {
        this.nextRoundTime = msg.delayTime;
        if (this.dm.playersDm.selfAbsInfo.isSeated) {
            this.dm.playersDm.selfInfo = this.dm.playersDm.selfAbsInfo;
            this.dm.tableInfo.isViewer = 0;
        }
    }
    // 换桌结果
    S_SWITCH_TABLE(dic) {
        if (dic.spcode == 1) {
            cc.vv.FloatTip.show(___("No more tables available now"));
        } else if (dic.spcode == 2) {
            cc.vv.FloatTip.show(___("Only matching rooms can be exchanged"));
        } else if (dic.spcode == 3) {
            cc.vv.FloatTip.show(___("The player is not in the room"));
        } else if (dic.spcode == 4) {
            cc.vv.FloatTip.show(___("金币不足"));
            this.dm.msgWriter.sendExit(); //退出游戏
        } else if (dic.spcode == 0) {
            for (let i = 1; i <= 4; i++) {
                this.playersCtrl.standUp(i)
            }
            // 取消托管
            this.autoHost.hide();
            this.cleanRound();
        }
    }
    // 进入新房间返回
    R_SWITCH_TABLE(dic) {
        if (dic.code == 200 && dic.gameid == 291) {
            cc.vv.gameData.init(dic.deskinfo);
            this.enterTable();
        } else {
            // 回大厅
            this.gotoHall();
        }
    }
    // 更新操作面板
    updateOprView(oprTime = 0, animation = false) {
        let seatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(TeenPattiSeatCpt);
        let selfCoin = seatCpt.coin;

        let packedNode = this.getCptByKey(BtnEvtCpt, "game_opr_packed").node;
        let showNode = this.getCptByKey(BtnEvtCpt, "game_opr_show").node;
        let showAllNode = this.getCptByKey(BtnEvtCpt, "game_opr_show_all").node;
        let blindNode = this.getCptByKey(BtnEvtCpt, "game_opr_blind").node;
        let blind2Node = this.getCptByKey(BtnEvtCpt, "game_opr_blind_2").node;

        packedNode.active = false;
        showNode.active = false;
        showAllNode.active = false;
        blindNode.active = false;
        blind2Node.active = false;

        let showNodeList = [packedNode];

        if (selfCoin > this.betList[0]) {
            showNodeList.push(blindNode);
            cc.find("number", blindNode).getComponent(cc.Label).string = Global.FormatNumToComma(this.betList[0]);
            if (seatCpt.isViewCard) {
                cc.find("label", blindNode).getComponent(cc.Label).string = ___("Chaal");
            } else {
                cc.find("label", blindNode).getComponent(cc.Label).string = ___("Blind");
            }
        }

        if (this.betList[1] && selfCoin > this.betList[1]) {
            showNodeList.push(blind2Node);
            cc.find("number", blind2Node).getComponent(cc.Label).string = Global.FormatNumToComma(this.betList[1]);
            if (seatCpt.isViewCard) {
                cc.find("label", blind2Node).getComponent(cc.Label).string = ___("Chaal X2");
            } else {
                cc.find("label", blind2Node).getComponent(cc.Label).string = ___("Blind X2");
            }
        }

        if (this.can_show > 0 && selfCoin > this.betList[0]) {    // 活动玩家只有两位
            showNodeList.push(showAllNode);
        }

        if (this.can_side_show > 0 && selfCoin > this.betList[0]) {
            showNodeList.push(showNode);
        }
        // 位置配置
        let showPosCfg = {
            [0]: [],
            [1]: [cc.v3(0, 0)],
            [2]: [cc.v3(-120, 0), cc.v3(120, 0)],
            [3]: [cc.v3(-260, -47), cc.v3(0, 0), cc.v3(260, -47)],
            [4]: [cc.v3(-300, -47), cc.v3(-100, 0), cc.v3(100, 0), cc.v3(300, -47)],
        }
        // 是否需要动画
        if (animation) {
            // 设置按钮位置
            for (let i = 0; i < showNodeList.length; i++) {
                const btnNode = showNodeList[i];
                btnNode.active = true;
                btnNode.position = cc.v3();
                btnNode.opacity = 0;
                btnNode.stopAllActions();
                cc.tween(btnNode).to(0.1, { position: showPosCfg[showNodeList.length][i], opacity: 255 }).start();
            }
        } else {
            // 设置按钮位置
            for (let i = 0; i < showNodeList.length; i++) {
                const btnNode = showNodeList[i];
                btnNode.active = true;
                btnNode.stopAllActions();
                btnNode.position = showPosCfg[showNodeList.length][i];
                btnNode.opacity = 255;
            }
        }
        // if (oprTime > 0) {
        //     seatCpt.isOpr = showNodeList.length > 0;
        //     let maskSp = cc.find("mask", packedNode).getComponent(cc.Sprite);
        //     maskSp.fillRange = 1;
        //     cc.tween(maskSp).to(oprTime, { fillRange: 0 }).start();
        // }

    }
    // 游戏开始提示
    hitStart() {
        this.soundMgr.playEffect("start");
        this.gameHitStart.stopAllActions();
        this.gameHitStart.active = true;
        this.gameHitStart.getComponentInChildren(sp.Skeleton).setAnimation(0, "animation", false);
        cc.tween(this.gameHitStart).delay(1.3).call(() => {
            this.gameHitStart.active = false;
        }).start()
    }
    // 进行开牌
    openCards(seatCpt, data) {
        let layout = seatCpt.handLayout;
        let cards = data.cards;
        this.pokerSystem.forceUpdateLayout(layout, cards);
        this.pokerSystem.updateLayout(layout);
        // 如果自己已经开牌
        if (data.uid != cc.vv.UserManager.uid) {
            for (const pokerCpt of layout.pokerList) {
                pokerCpt.isFront = seatCpt.isViewCard > 0;
            }
        }
        // 开牌
        for (const pokerCpt of layout.pokerList) {
            if (!pokerCpt.isFront) {
                pokerCpt.flip = true;
            }
        }
        // 显示牌型
        seatCpt.setCardType(data.cardType, false);
    }

    playHeguanAnim(type) {
        let hgSp = cc.find("safe_node/bg_teenpatti_hall/icon_teenpatti_girl", this.node).getComponent(sp.Skeleton);
        if (type == "fapai") {
            hgSp.setAnimation(0, "animation1", false);
        } else if (type == "kaishi") {
            hgSp.setAnimation(0, "animation2", false);
        }
    }

}
