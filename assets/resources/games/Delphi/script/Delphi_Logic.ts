import PBLogic from "../../PokerBase/scripts/PBLogic";
import DelphiGameData from "./Delphi_GameData";
import { PBFlowState, PBRoomType, PBTableState, PBUserState } from "../../PokerBase/scripts/PBCommonData";
import { PBSkinMgr } from "../../PokerBase/scripts/PBSkinMgr";
import KeyCpt from "../../../../_FWExpand/Ecs/components/KeyCpt";
import DelphiPotCpt from "./DelphiPotCpt";
import DelphiSeatCpt, { DelphiSeatState } from "./DelphiSeatCpt";
import JettonSystem from "../../../../_FWExpand/Ecs/systems/JettonSystem";
import PokerSystem from "../../../../_FWExpand/Ecs/systems/PokerSystem";
import JettonLayoutCpt from "../../../../_FWExpand/Ecs/components/JettonLayoutCpt";
import JettonActionInCpt from "../../../../_FWExpand/Ecs/components/JettonActionInCpt";
import JettonActionOutCpt from "../../../../_FWExpand/Ecs/components/JettonActionOutCpt";
import PokerActionInCpt from "../../../../_FWExpand/Ecs/components/PokerActionInCpt";
import PokerActionOutCpt from "../../../../_FWExpand/Ecs/components/PokerActionOutCpt";
import PokerLayoutCpt from "../../../../_FWExpand/Ecs/components/PokerLayoutCpt";
import { DelphiSoundCtrl } from "./DelphiSoundCtrl";
import DeskLightCpt from "../../PokerBase/scripts/operate/DeskLightCpt";
import DelphiHeGuanCpt from "./DelphiHeGuanCpt";
import DebugDelphiMsg from "./DebugDelphiMsg";
import { PBPlayer } from "../../PokerBase/scripts/player/PBPlayer";
import PokerCpt from "../../../../_FWExpand/Ecs/components/PokerCpt";
import BtnEvtCpt from "../../../../_FWExpand/Ecs/components/BtnEvtCpt";
import Table_CountDown from "../../../Table_Common/TableBase/Table_CountDown";
import DelphiRoundOprCpt from "./DelphiRoundOprCpt";
import NetQueueSystem from "../../../../_FWExpand/Ecs/systems/NetQueueSystem";
import { PBEvent } from "../../PokerBase/scripts/PBEvent";
import KnockoutDeskInfoCpt from "../../../BalootClient/KnockoutMatch/scripts/KnockoutDeskInfoCpt";
import KnockoutRankCpt from "../../../BalootClient/KnockoutMatch/scripts/KnockoutRankCpt";
import DelphiPossibleCpt from "./DelphiPossibleCpt";
import DelphiPlayerCtrl from "./DelphiPlayerCtrl";

let CMD = {
    BET: 25735,  // 下注
    PACK: 25740,  // 弃牌
    PASS: 25742,  // 过牌
    SHOW: 25741,  // 过牌
    PLAYER_ENTER_ROOM: 126001,  // 玩家进入房间
    PLAYER_ENTER_VIEWER: 126028,  // 观战玩家进入房间
    DEAL_CARDS: 126003,  // 开局发牌
    PLAYER_BET: 126301,  // 用户下注 
    PLAYER_PACK: 126306,  // 用户弃牌
    PLAYER_TURN_TO: 126307,  // 轮到某用户操作
    PLAYER_SIT_UP: 126308,  // 玩家站起来
    PLAYER_PASS: 126311,  //用户过牌
    GAME_BOARD_DEAL: 126309,  //公共牌发牌
    GAME_READY: 100071,  // 开始倒计时

    PLAYER_FOLD_SHOW: 126310,  // 用户弃牌后公示牌
    GAME_OVER: 126005,          // 小结算
    TOTAL_SETTLEMENT: 126006,  // 大结算

    R_PLAYER_EXIT_ROOM: 126011,  // 玩家被踢
    R_PLAYER_EXIT: 126029,  //观战玩家离开

    S_SWITCH_TABLE: 52,  // 换桌
    R_SWITCH_TABLE: 1083,  // 换桌通知
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class Delphi_Logic extends PBLogic {
    aborts: Function[] = [];
    dm: DelphiGameData;
    blind: number = 0;
    url_rule = "games/Delphi/prefabs/game_rule";

    jettonSystem: JettonSystem;
    pokerSystem: PokerSystem;
    publicJettonLayout: JettonLayoutCpt;
    jettonActionSet: JettonActionInCpt;
    jettonActionIn: JettonActionInCpt;
    jettonActionOut: JettonActionOutCpt;
    pokerActionIn: PokerActionInCpt;
    pokerActionOut: PokerActionOutCpt;
    heguanSpineNode: cc.Node;
    eventListener: any;

    @property(cc.Node)
    cardTypePrfab: cc.Node = null;
    @property(cc.Node)
    allInAnimPrefab: cc.Node = null;
    @property(cc.Node)
    winAnimPrefab: cc.Node = null;
    @property(cc.Node)
    handPokerAnimPrefab: cc.Node = null;

    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    // currRoundJetton: Array<any> = []; //次轮金币对象
    // isCanMenuClick: boolean = false; //点击按钮是否可以直接下注
    // nextOperate: any = null; //下一次的操作属性 自己早就操作好的
    // isAutoOperate: boolean = false; //是否可以自动操作
    // currBetCoin: number = 0;   //当前次轮的别人下的金币值
    // currBetMyCoin: number = 0; //次轮自己下注的金币--这一轮已经下过的金币
    // indexWinner: number = 0;

    lightCpt: DeskLightCpt;
    heGuanCpt: DelphiHeGuanCpt;
    publicPokerLayout: PokerLayoutCpt;
    // oprCpt: DelphiOprCpt;
    // betSliderCpt: DelphiBetSliderCpt;
    allinAnimNode: cc.Node;

    betCoin: number = 0;
    selfBetCoin: number = 0;
    potCpt: DelphiPotCpt;
    dealerNode: cc.Node;
    pkAnimNode: cc.Node;
    pingFenAnimNode: cc.Node;
    btn_switch: cc.Button;
    countDownCpt: Table_CountDown;
    oprRoundCpt: DelphiRoundOprCpt;
    netQueueSystem: NetQueueSystem;
    nextRoundTime: number = 0;
    knockCpt: KnockoutDeskInfoCpt;
    possCardTypeCpt: DelphiPossibleCpt;
    publicPokerLightAnimNode: cc.Node;
    showPokerToggle1: cc.Toggle;
    showPokerToggle2: cc.Toggle;

    set canChangeDesk(value) {
        if (this.dm.tableInfo.needSelfReady() || this.dm.deskInfo.conf.roomtype == PBRoomType.match) {
            this.btn_switch.node.active = false;
        } else {
            this.btn_switch.node.active = value;
        }
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
    // pots:Array<any> = []; //保存奖池数据


    loadPlayersCtrl(){
        return this.panel.addComponent(DelphiPlayerCtrl);
    }

    // 音效播放组件
    loadSoundCtrl() {
        return this.panel.addComponent(DelphiSoundCtrl);
    }
    loadBgCtrl() {
        return null
    }
    loadCtrl() {
        if (window["debug_game"]) {
            this.getCpt(DebugDelphiMsg).node.active = true;
        } else {
            this.getCpt(DebugDelphiMsg).node.active = false;
        }
        // 添加声音管理器
        this.panel.addComponent("Table_Sound");
        // this.soundMgr = this.panel.addComponent(TeenPattiSoundCtrl);
        // 添加皮肤管理器
        this.panel.addComponent(PBSkinMgr); //safe_node
        // 调用父类加载方法
        super.loadCtrl();
        // 初始化组件
        this.initAllCpt();
        // 服务器消息监听加载
        this.initSocketCallback();
        // 加载事件回调
        this.initEventCallback();
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

        this.publicPokerLayout = this.getCptByKey(PokerLayoutCpt, 'public')
        // 牌 和 筹码 动画配置
        this.publicJettonLayout = this.getCptByKey(JettonLayoutCpt, 'public')
        this.jettonActionSet = this.getCptByKey(JettonActionInCpt, 'set')
        this.jettonActionIn = this.getCptByKey(JettonActionInCpt, 'in')
        this.jettonActionOut = this.getCptByKey(JettonActionOutCpt, 'out')
        this.pokerActionIn = this.getCptByKey(PokerActionInCpt, 'in')
        this.pokerActionOut = this.getCptByKey(PokerActionOutCpt, 'out')

        // 操作面板
        this.oprRoundCpt = this.getCpt(DelphiRoundOprCpt);
        this.oprRoundCpt.init();
        this.oprRoundCpt.node.zIndex = 110;


        // 拖动下注面板
        // this.betSliderCpt = this.getCpt(DelphiBetSliderCpt);
        // this.betSliderCpt.node.zIndex = 910;

        this.showPokerToggle1 = this.getCptByKey(KeyCpt, "game_show_poker_1").getComponent(cc.Toggle);
        this.showPokerToggle2 = this.getCptByKey(KeyCpt, "game_show_poker_2").getComponent(cc.Toggle);
        this.showPokerToggle1.node.zIndex = 100;
        this.showPokerToggle2.node.zIndex = 100;

        // AllIn动画
        this.allinAnimNode = this.getCptByKey(KeyCpt, "game_allin_anim").node;
        this.allinAnimNode.zIndex = 1000;
        // 公共牌光效
        this.publicPokerLightAnimNode = this.getCptByKey(KeyCpt, "game_public_poker_anim").node;
        this.publicPokerLightAnimNode.zIndex = 20;
        // PK动画
        this.pkAnimNode = this.getCptByKey(KeyCpt, "game_anim_pk").node;
        this.pkAnimNode.zIndex = 1000;
        // 平分动画
        this.pingFenAnimNode = this.getCptByKey(KeyCpt, "game_anim_pingfen").node;
        this.pingFenAnimNode.zIndex = 1000;
        // 庄家图标
        this.dealerNode = this.getCptByKey(KeyCpt, "game_node_dealer").node;
        this.dealerNode.zIndex = 20;
        // 换桌
        this.btn_switch = this.getCptByKey(BtnEvtCpt, "opr_switch_table").getComponent(cc.Button);
        this.btn_switch.node.zIndex = 200;
        this.canChangeDesk = false;
        // Pot组件
        this.potCpt = this.getCpt(DelphiPotCpt);
        this.potCpt.node.zIndex = 100;
        // possible牌型组件
        this.possCardTypeCpt = this.getCpt(DelphiPossibleCpt);
        this.possCardTypeCpt.node.zIndex = 100;
        //提高层级
        this.autoHost.node.zIndex = 102;
        // 荷官组件
        this.heGuanCpt = this.getCpt(DelphiHeGuanCpt);
        // 操作指向灯
        this.lightCpt = this.getCpt(DeskLightCpt);
        // 比赛组件
        this.knockCpt = this.getCpt(KnockoutDeskInfoCpt);


        this.countDownCpt = this.getCpt(Table_CountDown);
        this.countDownCpt.node.zIndex = 100;

        //德扑座位组件初始化  通过DelphiSeatCpt 控制座位信息
        for (const playerCpt of this.playersCtrl.activePlayers) {
            let cpt = playerCpt.node.addComponent(DelphiSeatCpt);
            // 设置属性
            cpt.betNode = cc.find("node_bet", playerCpt.node);
            cpt.statusNode = cc.find("peopleStatus", playerCpt.node);
            cpt.coinNode = cc.find("user_info_node/coin_node", playerCpt.node);
            cpt.bankerNode = cc.find("dealer", playerCpt.node);
            cpt.init(this.panel, this.cardTypePrfab, this.allInAnimPrefab, this.winAnimPrefab, this.handPokerAnimPrefab);
            cpt.node.zIndex = 50;
            cpt.clear();
        }
        this.interactiveEmotionCtrl.node.zIndex = 1000;

    }
    // 注册服务器协议回调
    initSocketCallback() {
        // 游戏准备
        this.netQueueSystem.registerNoQueue(CMD.GAME_READY, this.GAME_READY.bind(this), this);
        // 自己下注结果
        this.netQueueSystem.registerNoQueue(CMD.BET, this.SELF_BET.bind(this), this);
        //开局发牌
        this.netQueueSystem.registerNoQueue(CMD.DEAL_CARDS, this.DEAL_CARDS.bind(this), this);
        //用户下注
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_BET, this.PLAYER_BET.bind(this), this);
        //用户弃牌
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_PACK, this.PLAYER_PACK.bind(this), this);
        //用户过牌
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_PASS, this.PLAYER_PASS.bind(this), this);
        //轮到某用户操作
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_TURN_TO, this.PLAYER_TURN_TO.bind(this), this);
        //玩家站起来
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_SIT_UP, this.PLAYER_SIT_UP.bind(this), this);
        //用户弃牌公示牌 
        this.netQueueSystem.registerNoQueue(CMD.PLAYER_FOLD_SHOW, this.PLAYER_FOLD_SHOW.bind(this), this);
        //用户发公共牌
        this.netQueueSystem.registerNoQueue(CMD.GAME_BOARD_DEAL, this.GAME_BOARD_DEAL.bind(this), this);
        //大小结算
        this.netQueueSystem.registerNoQueue(CMD.GAME_OVER, this.GAME_OVER.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.TOTAL_SETTLEMENT, this.TOTAL_SETTLEMENT.bind(this), this);
        // 换桌相关
        this.netQueueSystem.registerNoQueue(CMD.S_SWITCH_TABLE, this.S_SWITCH_TABLE.bind(this), this);
        this.netQueueSystem.registerNoQueue(CMD.R_SWITCH_TABLE, this.R_SWITCH_TABLE.bind(this), this);

        // 玩家准备
        this.netQueueSystem.registerNoQueue(this.dm.msgCmd.R_PLAYER_READY, this.playerReady.bind(this), this);

        // 玩家退出与加入
        this.netQueueSystem.register(CMD.PLAYER_ENTER_ROOM, this.PLAYER_ENTER_ROOM.bind(this));
        this.netQueueSystem.register(CMD.PLAYER_ENTER_VIEWER, this.PLAYER_ENTER_VIEWER.bind(this));
        this.netQueueSystem.register(CMD.R_PLAYER_EXIT_ROOM, this.R_PLAYER_EXIT_ROOM.bind(this));
        this.netQueueSystem.register(CMD.R_PLAYER_EXIT, this.R_PLAYER_EXIT.bind(this));

    }
    // 注册事件回调
    initEventCallback() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent(PBEvent.USER_COIN_CHANGE, this.USER_COIN_CHANGE, this);

        this.pkAnimNode.getComponent(sp.Skeleton).setCompleteListener((tck) => {
            if (tck.animation && tck.animation.name == "animation") {
                this.pkAnimNode.active = false;
            }
        })
        this.pingFenAnimNode.getComponent(sp.Skeleton).setCompleteListener((tck) => {
            if (tck.animation && tck.animation.name == "animation") {
                this.pingFenAnimNode.active = false;
            }
        })
        // 换桌
        this.eventListener.registerEvent("opr_switch_table", (button: cc.Button) => {
            this.canChangeDesk = false;
            cc.vv.NetManager.send({ c: CMD.S_SWITCH_TABLE, uid: cc.vv.UserManager.uid });
        })
        // ALlin动画
        this.allinAnimNode.getComponent(sp.Skeleton).setCompleteListener((tck) => {
            if (tck.animation && tck.animation.name == "animation") {
                this.allinAnimNode.active = false;
            }
        })
        // 是否亮牌选择
        let callFunc = () => {
            if (this.showPokerToggle1.isChecked && !this.showPokerToggle2.isChecked) {
                cc.vv.NetManager.send({ c: CMD.SHOW, show: 1 });
            } else if (!this.showPokerToggle1.isChecked && this.showPokerToggle2.isChecked) {
                cc.vv.NetManager.send({ c: CMD.SHOW, show: 2 });
            } else if (!this.showPokerToggle1.isChecked && !this.showPokerToggle2.isChecked) {
                cc.vv.NetManager.send({ c: CMD.SHOW, show: 0 });
            } else if (this.showPokerToggle1.isChecked && this.showPokerToggle2.isChecked) {
                cc.vv.NetManager.send({ c: CMD.SHOW, show: 3 });
            }
        }
        this.showPokerToggle1.node.on("toggle", callFunc, this);
        this.showPokerToggle2.node.on("toggle", callFunc, this);

    }
    // 清除所有
    cleanRound() {
        for (const abortFunc of this.aborts) {
            abortFunc();
        }
        for (const seatCpt of this.getCpts(DelphiSeatCpt)) {
            seatCpt.clear();
        }
        this.netQueueSystem.clearQueue();
        this.netQueueSystem.running = true;
        this.playersCtrl.hideTimer();
        this.jettonSystem.destroyAllJetton();
        this.pokerSystem.destroyAllPoker();
        this.countDownCpt.hide();
        this._showMathUIAni(false);
        this.countdown.hide();
        this.heGuanCpt.close();
        // this.betSliderCpt.close();
        this.lightCpt.close();
        this.oprRoundCpt.close();
        this.potCpt.closePot();
        this.potCpt.amount = 0;
        this.allinAnimNode.active = false;
        this.pkAnimNode.active = false;
        this.pingFenAnimNode.active = false;
        this.dealerNode.position = this.dealerNode.parent.convertToNodeSpaceAR(this.heGuanCpt.bankerPos);
        this.operate.reset();
        this.canChangeDesk = false;
        if(this.knockCpt){
            this.knockCpt.closeAllPanel();
        }
        
        this.possCardTypeCpt.close();
        this.publicPokerLightAnimNode.active = false;
        this.showPokerToggle1.node.active = false;
        this.showPokerToggle1.isChecked = false;
        this.showPokerToggle2.node.active = false;
        this.showPokerToggle2.isChecked = false;
    }
    // 进入房间 或者 断线重连
    async enterTable() {
        // 开启网络包处理
        this.netQueueSystem.run();

        this.cleanRound();
        // 更新皮肤
        this.changeSkin();
        this.playersCtrl.cleanRound();
        let tableStatus = this.dm.tableStatus;
        // 根据游戏类型 显示或者隐藏赛事
        if (this.dm.deskInfo.conf.roomtype == PBRoomType.match) {
            for (const cpt of this.getCpts(KnockoutRankCpt)) {
                cpt.node.active = true;
            }
            if(this.knockCpt){
                this.knockCpt.init(this.dm.deskInfo);
            }
            
        } else {
            for (const cpt of this.getCpts(KnockoutRankCpt)) {
                cpt.node.active = false;
            }
            if(this.knockCpt){
                this.knockCpt.close();
            }
            
        }
        // 根据用户数据,座位组件 与 数据关联
        this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);
        // 是否有申请解散
        if (this.dm.deskInfo.dismiss) {
            this.playerApplyDismiss(this.dm.deskInfo.dismiss);
        }
        // 断线重连与进入游戏初始化数据
        this.blind = this.dm.deskInfo.bet;
        this.betCoin = this.dm.deskInfo.round.betCoin;
        // let bBlindUid = this.dm.deskInfo.round.bBlind;      // 大盲注玩家uid
        // let sBlindUid = this.dm.deskInfo.round.sBlind;      // 大盲注玩家uid
        // 玩家金币恢复
        for (const _info of this.dm.deskInfo.views) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(DelphiSeatCpt);
            seatCpt.coin = _info.coin;
        }
        // 玩家恢复
        for (const _info of this.dm.deskInfo.users) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(DelphiSeatCpt);
            if (_info.round) {
                seatCpt.coin = _info.coin;
                seatCpt.state = _info.round.action;
                // 手牌恢复
                this.pokerSystem.forceUpdateLayout(seatCpt.handLayout, _info.round.cards);
                this.pokerSystem.updateLayout(seatCpt.handLayout);
                for (const pokerCpt of seatCpt.handLayout.pokerList) {
                    pokerCpt.isFront = _info.uid == cc.vv.UserManager.uid;
                }
                seatCpt.isLoser = _info.round.folded == 1;
                seatCpt.isAllin = _info.round.allin == 1;
                // 玩家下注恢复
                seatCpt.setBetChips(_info.round.currBet, false);
                // 庄家恢复
                if (this.dm.deskInfo.round.dealer && this.dm.deskInfo.round.dealer.uid == _info.uid) {
                    this.dealerNode.position = this.dealerNode.parent.convertToNodeSpaceAR(seatCpt.bankerPos);
                }
                // 记录自己当前在该局下注的金额
                if (_info.uid == cc.vv.UserManager.uid) {
                    if (_info.round.folded == 1) {
                        this.selfBetCoin = 0;
                    } else {
                        this.selfBetCoin = _info.round.betCoin;
                    }
                    // 牌型恢复
                    if (_info.round.cardInfo) {
                        seatCpt.setCardType(_info.round.cardInfo.cardType, this.panel.convertToNodeSpaceAR(seatCpt.handLayout.worldCenterPoint.add(cc.v3(0, -60))));
                    } else {
                        seatCpt.closeCardType();
                    }
                }
                // 是否托管
                if (_info.auto == 1) {
                    this.autoHost.show()
                } else {
                    this.autoHost.hide()
                }
            }
            // 恢复准备状态
            seatCpt.userInfoCmp.showReadyTip(_info.state == 2, false);
        }
        // 恢复是观战玩家匿名
        for (const _info of this.dm.deskInfo.views) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(DelphiSeatCpt);
            seatCpt.isUnknown = true;
            seatCpt.isWather = true;
            // seatCpt.setCoinNodeActive(false);
        }
        // 恢复座位上玩家匿名
        for (const _info of this.dm.deskInfo.users) {
            let seatCpt = this.playersCtrl.getPlayerByUid(_info.uid).getComponent(DelphiSeatCpt);
            seatCpt.isUnknown = this.dm.tableInfo.isViewer == 1;
            seatCpt.isWather = this.dm.tableInfo.isViewer == 1;
            // seatCpt.setCoinNodeActive(this.dm.tableInfo.isViewer == 0);
        }
        // 获取自己座位组件
        let selfSeatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);

        // 恢复公共牌
        if (this.dm.deskInfo.round.showCards) {
            this.pokerSystem.forceUpdateLayout(this.publicPokerLayout, this.dm.deskInfo.round.showCards);
            this.pokerSystem.updateLayout(this.publicPokerLayout);
        }
        // 恢复牌型提示
        if (this.dm.deskInfo.round.tip && this.dm.tableInfo.isViewer == 0 && selfSeatCpt.state != DelphiSeatState.FOLD) {
            this.possCardTypeCpt.open(this.dm.deskInfo.round.tip);
        }
        // 同步奖池数量
        if (this.dm.deskInfo.round.pots) {
            this.potCpt.updatePotView(this.dm.deskInfo.round.pots);
            this.potCpt.amount = this.dm.deskInfo.round.potCoin;
        }
        // 倒计时显示
        if (this.dm.deskInfo.waitTime > 0) {
            // this.countDownCpt.show(this.dm.deskInfo.waitTime);
            this._showMathUIAni(true, this.dm.deskInfo.waitTime);
        }
        // 换桌按钮恢复
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
                        if (_info.round.folded == 1) {
                            this.canChangeDesk = true;
                            this.showPokerToggle1.node.active = true;
                            this.showPokerToggle2.node.active = true;
                        } else {
                            this.showPokerToggle1.node.active = false;
                            this.showPokerToggle2.node.active = false;
                        }
                    }
                }
            }
        }
        // 状态恢复
        if (tableStatus.currStatus == PBTableState.MATCH || tableStatus.currStatus == PBTableState.READY || tableStatus.currStatus == PBTableState.GAMEOVER || tableStatus.currStatus == PBTableState.SETTLE) {
            if (this.dm.tableInfo.needSelfReady() && this.dm.tableInfo.isViewer == 0) {
                this.operate.showTableCode(true);
                this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                this.operate.showInvite(true);
            }
            this.playersCtrl.hideAllEmptySeat();
        } else if (tableStatus.currStatus == PBTableState.PLAY) {
            this.playersCtrl.hideAllEmptySeat();
            let activeSeatInfo = this.dm.playersDm.getPlayerBySeatId(this.dm.deskInfo.round.activeSeat);
            if (activeSeatInfo) {
                let activeSeatCpt = this.playersCtrl.getPlayerByUid(activeSeatInfo.uid).getComponent(DelphiSeatCpt);
                // 指向灯
                if (activeSeatCpt.data.uid == cc.vv.UserManager.uid) {
                    this.lightCpt.trunTo(cc.v3(activeSeatCpt.node.parent.convertToNodeSpaceAR(activeSeatCpt.pokerPos)), 0);
                } else {
                    this.lightCpt.trunTo(activeSeatCpt.node.position, 0);
                }
                // 操作倒计时
                this.playersCtrl.showTimer(activeSeatInfo.position, this.dm.deskInfo.round.delayTime || 10);
                // 恢复操作面板(如果弃牌 ALLIN 观战 都不需要操作按钮)
                if (selfSeatCpt.state == DelphiSeatState.FILLALL ||
                    selfSeatCpt.state == DelphiSeatState.FOLD ||
                    selfSeatCpt.isAllin == true ||
                    this.dm.tableInfo.isViewer == 1) {
                    this.oprRoundCpt.close();
                } else {
                    // 判断操作的人 是不是自己
                    let needCoin = this.dm.deskInfo.round.currBet - selfSeatCpt.betChips
                    if (activeSeatInfo.uid == cc.vv.UserManager.uid) {
                        this.oprRoundCpt.open(true, needCoin, selfSeatCpt.coin, this.blind, this.betCoin, this.dm.deskInfo.round.currBet, selfSeatCpt, this.dm.deskInfo.round.delayTime || 10);
                    } else {
                        this.oprRoundCpt.open(false, needCoin, selfSeatCpt.coin, this.blind);
                        selfSeatCpt.isOpr = false;
                    }
                }
                this.allinAnimNode.active = selfSeatCpt.state == DelphiSeatState.FILLALL;
            }
        }
    }
    // 游戏进入倒计时
    GAME_READY(msg) {
    }
    // 玩家进入坐下
    PLAYER_ENTER_ROOM(msg) {
        if (msg.code === 200 && !msg.spcode) {
            let pvo = this.dm.parseAPlayer(msg.user);
            if (pvo.seatId) {
                this.dm.playersDm.seat(pvo);
                this.playersCtrl.seat(pvo);
                let seatCpt = this.playersCtrl.getPlayerByUid(pvo.uid).getComponent(DelphiSeatCpt);
                seatCpt.coin = msg.user.coin;
                seatCpt.isUnknown = true;
                seatCpt.isWather = false;
                // seatCpt.setCoinNodeActive(true);
            }
        }
    }
    // 观战玩家坐下
    PLAYER_ENTER_VIEWER(msg) {
        if (msg.code === 200 && !msg.spcode) {
            let pvo = this.dm.parseAPlayer(msg.user);
            if (pvo.seatId) { // 观战玩家在位子上的也要坐下
                this.dm.playersDm.seat(pvo);
                this.playersCtrl.seat(pvo);
                let seatCpt = this.playersCtrl.getPlayerByUid(pvo.uid).getComponent(DelphiSeatCpt);
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
    // 座位上玩家离开
    R_PLAYER_EXIT_ROOM(msg) {
        if(this.playersCtrl.getPlayerByUid(msg.uid)){
            let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(DelphiSeatCpt);
            this.pokerSystem.destroyPokerList(seatCpt.handLayout.pokerList);
            this.playerExit(msg);
        }
        // if (msg.uid == cc.vv.UserManager.uid) {

        // }
    }
    // 观战玩家离开房间
    R_PLAYER_EXIT(msg) {
        let p = this.dm.playersDm.getPlayerByUid(msg.uid);
        if (p) {
            this.dm.playersDm.removeAUser(p.uid);
            this.playersCtrl.standUp(p.position);
        }
    }
    // 用户金币变化 TODO
    USER_COIN_CHANGE(msg) {
        if (!msg || !msg.detail || !msg.detail.uid) { return; }
    }

    //用户弃牌后公示牌
    PLAYER_FOLD_SHOW(msg) {

    }
    // 开始游戏-发牌
    async DEAL_CARDS(msg) {
        // 重置
        this.cleanRound();
        // 更新游戏状态
        this.dm.deskInfo.state = PBFlowState.playing;
        if (this.dm.deskInfo.roomtype == PBRoomType.match) {
            if(this.knockCpt){
                this.knockCpt.updateView();
            }
           
        }
        // 重置预操作状态
        this.oprRoundCpt.clearPreOpr();
        // 隐藏所有座位
        this.playersCtrl.hideAllEmptySeat();
        let playerList = [];
        for (const palyerCpt of this.playersCtrl.activePlayers) {
            if (palyerCpt.playerInfoVo && msg.discardUids.indexOf(palyerCpt.playerInfoVo.uid) >= 0) {
                playerList.push(palyerCpt.playerInfoVo);
            }
        }
        // 所有玩家取消准备状态
        this.playersCtrl.cancelPlayerReady(this.dm.playersDm.seatedPlayersInfo);
        // 提示游戏开始声音
        this.soundMgr.playBaseEffect("game_start");
        // 提示游戏开始
        this.heGuanCpt.run(2);
        // 记录自己的下注值
        if (cc.vv.UserManager.uid == msg.sBlind) {
            this.selfBetCoin = msg.sBlindCoin;
        } else if (cc.vv.UserManager.uid == msg.bBlind) {
            this.selfBetCoin = msg.bBlindCoin;
        }
        // 庄家图标节点移动 
        let bankerSeatCpt = this.playersCtrl.getPlayerByUid(msg.dealerUid).getComponent(DelphiSeatCpt);
        cc.tween(this.dealerNode).to(0.35, { position: this.dealerNode.parent.convertToNodeSpaceAR(bankerSeatCpt.bankerPos) }).start();
        await this.delay(0.15, this.aborts);
        // 盲注大小盲注 以及玩家状态更新
        this.soundMgr.playEffect("sfx_gameplay_06", false)
        for (const info of playerList) {
            let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(DelphiSeatCpt);
            seatCpt.isUnknown = false;
            seatCpt.isWather = false;
            // seatCpt.setCoinNodeActive(true);
            if (info.uid == msg.sBlind) {
                seatCpt.state = DelphiSeatState.SMALLBET;//小盲注
                seatCpt.setBetChips(msg.sBlindCoin);
                seatCpt.coin -= msg.sBlindCoin;
            } else if (info.uid == msg.bBlind) {
                //大盲注
                seatCpt.state = DelphiSeatState.BIGBET;
                seatCpt.setBetChips(msg.bBlindCoin);
                seatCpt.coin -= msg.bBlindCoin;
            }
        }
        // 同步奖池数量 TODO
        this.potCpt.amount = msg.sBlindCoin + msg.bBlindCoin;
        await this.delay(0.3, this.aborts);
        //荷官动画
        this.heGuanCpt.run(1, true);
        // 创建发牌配置
        let sendConfig = [];
        // for (let j = 0; j < 2; j++) {
        for (let i = 0; i < playerList.length; i++) {
            const info = playerList[i];
            let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(DelphiSeatCpt);
            let cards = [0, 0];
            if (info.uid == cc.vv.UserManager.uid) {
                cards = msg.cards;
            }
            sendConfig.push({
                layout: seatCpt.handLayout,
                cards: cards,
            });
        }
        // }
        for (const item of sendConfig) {
            let pokerCptList = this.pokerSystem.createPokerList(item.cards, this.panel);
            for (const pokerCpt of pokerCptList) {
                pokerCpt.isFront = false;
                pokerCpt.node.position = this.pokerActionIn.fromNode.position;
                pokerCpt.node.scale = 0.2;
                pokerCpt.node.opacity = 0;
            }
            this.pokerSystem.bindToLayout(pokerCptList, item.layout);
            let index = 0;
            for (const pokerCpt of item.layout.pokerList) {
                let attr = item.layout.getAttrTByLayout(pokerCpt);
                attr.animTime = 0.3;
                attr.delayTime = 0.1 + 0.2 * index++;
                attr.opacity = 255;
                attr.startCallback = (action) => {
                    action.node.opacity = 155;
                    this.soundMgr.playEffect("flop_card_3", false);
                }
                this.pokerSystem.runNodeAction(attr);
            }
        }
        await this.delay(0.4, this.aborts);
        this.heGuanCpt.close();
        await this.delay(0.4, this.aborts);
        // 翻开
        for (const info of playerList) {
            let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(DelphiSeatCpt);
            for (const pokerCpt of seatCpt.handLayout.pokerList) {
                if (pokerCpt.uint > 0 && !pokerCpt.isFront) {
                    pokerCpt.flip = true;
                    this.soundMgr.playEffect("flop_card_3", false);
                }
            }
        }
        // 牌型恢复
        if (msg.discardUids.indexOf(cc.vv.UserManager.uid) >= 0 && msg.cardInfo) {
            let seatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);
            seatCpt.setCardType(msg.cardInfo.cardType, this.panel.convertToNodeSpaceAR(seatCpt.handLayout.worldCenterPoint.add(cc.v3(0, -60))));
        }
    }
    //发公共牌
    async GAME_BOARD_DEAL(msg) {
        //荷官动画 需要荷官从手上发出
        this.heGuanCpt.run(1, true);
        // 关闭可能牌型提示
        this.possCardTypeCpt.close();
        // 发牌
        let dealPokerList = this.pokerSystem.createPokerList(msg.cards)
        for (const pokerCpt of dealPokerList) {
            pokerCpt.isFront = false;
            this.pokerActionIn.toLayout = this.publicPokerLayout;
            this.pokerActionIn.pokerCpt = pokerCpt;
            this.soundMgr.playEffect("sfx_gameplay_01", false)
            this.pokerSystem.pokerInLayout(this.pokerActionIn);
            await this.delay(0.05, this.aborts);
        }
        this.heGuanCpt.close();
        await this.delay(0.2, this.aborts);
        this.soundMgr.playEffect('sfx_gameplay_14', false);
        // 翻牌
        for (const pokerCpt of this.publicPokerLayout.pokerList) {
            if (!pokerCpt.isFront) pokerCpt.flip = true;
        }
        // 显示可能的牌型
        let selfSeatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);
        if (msg.tip && this.dm.tableInfo.isViewer == 0 && selfSeatCpt.state != DelphiSeatState.FOLD) {
            this.soundMgr.playEffect("sfx_gameplay_17", false);
            this.possCardTypeCpt.open(msg.tip);
            let endPos = this.publicPokerLayout.rightPoint.add(cc.v3(this.publicPokerLayout.padding, 0));
            this.possCardTypeCpt.node.position = endPos.add(cc.v3(-this.publicPokerLayout.padding, 0));
            this.possCardTypeCpt.node.opacity = 0;
            cc.tween(this.possCardTypeCpt.node).to(0.2, { position: endPos, opacity: 255 }, { easing: 'sineOut' }).start();
        } else {
            this.possCardTypeCpt.close();
        }
        // 牌型恢复
        if (msg.cardInfo) {
            selfSeatCpt.setCardType(msg.cardInfo.cardType, this.panel.convertToNodeSpaceAR(selfSeatCpt.handLayout.worldCenterPoint.add(cc.v3(0, -60))));
        }
    }
    // 自己下注结果
    SELF_BET(msg) {
        if (msg.spcode == 210) {
            // console.log("下注金额不对")
        } else if (msg.spcode == 1066) {
            cc.vv.FloatTip.show(___("金币不足"));
        }
    }
    // 某用户下注结果
    PLAYER_BET(msg) {
        this.playersCtrl.hideTimer();
        // this.betSliderCpt.close();
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(DelphiSeatCpt);
        seatCpt.isOpr = false;
        // 下注动画
        this.soundMgr.playEffect("sfx_gameplay_06", false)
        seatCpt.setBetChips(msg.userBet, true, () => {
            if (msg.isClose == 1) {
                // 重置预操作状态
                this.oprRoundCpt.clearPreOpr();
                this.potCpt.betOver(msg.pots, () => {
                    // 关闭所有用户状态
                    for (const saet of this.getCpts(DelphiSeatCpt)) {
                        saet.nextState();
                    }
                });
                this.lightCpt.close();
            }
        });
        // 同步下用户身上的金币
        seatCpt.coin = msg.userCoin;
        // 记录玩家自己在该局下注的钱
        if (msg.uid == cc.vv.UserManager.uid) {
            this.selfBetCoin = msg.betCoin;
        }
        // 状态改变
        seatCpt.state = msg.rtype;
        if (msg.isall == 1) {
            // 打开头像ALLIN动画
            seatCpt.showAllInAnim();
            seatCpt.isAllin = true;
            // 自己的ALLin动画
            if (cc.vv.UserManager.uid == msg.uid) {
                this.allinAnimNode.active = true;
                this.soundMgr.playEffect("sfx_gameplay_12", false);
            }
            // 是否全部人都ALLIN
            if (msg.fullallin == 1) {
                this.pkAnimNode.active = true;
                this.pkAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
            }
        }
        //更新奖池金币
        this.potCpt.amount = msg.potCoin;
        // 关闭拖动面板
        // this.betSliderCpt.close();
        // 更新预操作面板
        let selfSeatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);
        //次轮下注结束 回收金币
        if (msg.isClose == 1) {
            this.oprRoundCpt.close();
        } else if (selfSeatCpt.isAllin || selfSeatCpt.state == DelphiSeatState.FILLALL || selfSeatCpt.state == DelphiSeatState.FOLD || this.dm.tableInfo.isViewer == 1) {
            this.oprRoundCpt.close();
        } else {
            this.oprRoundCpt.open(false, msg.currBet - selfSeatCpt.betChips, selfSeatCpt.coin, this.blind);
        }
    }
    //过牌
    PLAYER_PASS(msg) {
        // this.betSliderCpt.close();
        // 关闭倒计时
        this.playersCtrl.hideTimer();
        // //有时候进入场景，这个数值取不到
        // let ac_player = this.playersCtrl.getPlayerByUid(msg.uid)
        // if(!ac_player) return

        // 过牌的玩家 状态更新
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(DelphiSeatCpt);
        seatCpt.state = DelphiSeatState.CHECK;
        seatCpt.isOpr = false;
        // 音效
        this.soundMgr.playEffect("sfx_gameplay_user_01", false)
        // 关闭拖动面板
        // this.betSliderCpt.close();
        //次轮下注结束
        let selfSeatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);
        if (msg.isClose == 1) {
            this.oprRoundCpt.close();
            // 重置预操作状态
            this.oprRoundCpt.clearPreOpr();
            this.potCpt.betOver(msg.pots);
            this.lightCpt.close();
            // 关闭所有用户状态
            for (const saet of this.getCpts(DelphiSeatCpt)) {
                saet.nextState();
            }
        } else if (selfSeatCpt.isAllin || selfSeatCpt.state == DelphiSeatState.FILLALL || selfSeatCpt.state == DelphiSeatState.FOLD || this.dm.tableInfo.isViewer == 1) {
            this.oprRoundCpt.close();
        } else {
            // 更新预操作面板
            this.oprRoundCpt.open(false, msg.currBet - selfSeatCpt.betChips, selfSeatCpt.coin, this.blind);
        }
    }
    // 某用户弃牌
    PLAYER_PACK(msg) {
        this.playersCtrl.hideTimer();
        // this.betSliderCpt.close();

        // //有时候进入场景，这个数值取不到
        // let ac_player = this.playersCtrl.getPlayerByUid(msg.uid)
        // if(!ac_player) return

        let seatCpt = this.playersCtrl.getPlayerByUid(msg.uid).getComponent(DelphiSeatCpt);
        seatCpt.state = DelphiSeatState.FOLD;
        seatCpt.isLoser = true;
        seatCpt.isOpr = false;
        // 音效
        if (msg.uid == cc.vv.UserManager.uid) {
            this.soundMgr.playEffect("sfx_gameplay_04", false);
            this.selfBetCoin = 0;
            this.canChangeDesk = true;
            // 显示亮牌按钮
            this.showPokerToggle1.node.active = true;
            this.showPokerToggle2.node.active = true;
        } else {
            this.soundMgr.playEffect("sfx_gameplay_user_02", false);
            for (const pokerCpt of seatCpt.handLayout.pokerList) {
                pokerCpt.dark = true;
            }
            // 其他玩家丢掉手牌
            // let index = 0;
            // for (const pokerCpt of seatCpt.handLayout.pokerList) {
            //     this.pokerSystem.runNodeAction({
            //         node: pokerCpt.node,
            //         opacity: 0,
            //         pos: this.heGuanCpt.node.position,
            //         animTime: 0.3,
            //         delayTime: 0.1 * index++,
            //         completeCallback: () => {
            //             this.pokerSystem.destroyPoker(pokerCpt);
            //         }
            //     })
            // }
        }
        //次轮下注结束 回收金币
        let selfSeatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);
        // 自己弃牌关闭牌型提示
        if (msg.uid == cc.vv.UserManager.uid) {
            this.possCardTypeCpt.close();
        }
        // 关闭拖动面板
        // this.betSliderCpt.close();
        if (msg.isClose == 1) {
            this.oprRoundCpt.close();
            // 重置预操作状态
            this.oprRoundCpt.clearPreOpr();
            this.potCpt.betOver(msg.pots);
            this.lightCpt.close();
            // 关闭所有用户状态
            for (const saet of this.getCpts(DelphiSeatCpt)) {
                saet.nextState();
            }
        } else if (selfSeatCpt.isAllin || selfSeatCpt.state == DelphiSeatState.FILLALL || selfSeatCpt.state == DelphiSeatState.FOLD || this.dm.tableInfo.isViewer == 1) {
            this.oprRoundCpt.close();
        } else {
            // 更新预操作面板
            if (msg.uid == cc.vv.UserManager.uid) {
                this.oprRoundCpt.close();
            } else {
                this.oprRoundCpt.open(false, msg.currBet - selfSeatCpt.betChips, selfSeatCpt.coin, this.blind);
            }
        }
    }
    // 轮到某人操作
    PLAYER_TURN_TO(msg) {
        // 关闭所有倒计时
        this.playersCtrl.hideTimer();
        // //有时候进入场景，这个数值取不到
        // let ac_player = this.playersCtrl.getPlayerByUid(msg.uid)
        // if(!ac_player) return

        this.betCoin = msg.betCoin;
        let seatCpt = this.playersCtrl.getPlayerByUid(msg.nextUid).getComponent(DelphiSeatCpt);
        seatCpt.betChips = msg.userBet;
        let playerInfo = this.dm.playersDm.getPlayerByUid(msg.nextUid);
        // 指向第一个操作的人
        if (seatCpt.data.uid == cc.vv.UserManager.uid) {
            this.lightCpt.trunTo(cc.v3(seatCpt.node.parent.convertToNodeSpaceAR(seatCpt.pokerPos)));
            cc.vv.PlatformApiMgr.deviceShock && cc.vv.PlatformApiMgr.deviceShock();
        } else {
            this.lightCpt.trunTo(seatCpt.node.position);
        }
        // 显示倒计时
        this.playersCtrl.showTimer(playerInfo.position, msg.delayTime);
        // 更新预操作面板
        let selfSeatCpt = this.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).getComponent(DelphiSeatCpt);
        if (selfSeatCpt.isAllin || selfSeatCpt.state == DelphiSeatState.FILLALL || selfSeatCpt.state == DelphiSeatState.FOLD || this.dm.tableInfo.isViewer == 1) {
            this.oprRoundCpt.close();
        } else {
            if (msg.nextUid == cc.vv.UserManager.uid) {
                let needCoin = msg.currBet - selfSeatCpt.betChips;
                // 先更新预操作面板,如果有人加注了则取消预操作
                this.oprRoundCpt.open(false, needCoin, selfSeatCpt.coin, this.blind, this.betCoin, msg.currBet, selfSeatCpt, msg.delayTime);
                // 是否需要预操作
                if (this.oprRoundCpt.preOprAction > 0) {
                    this.oprRoundCpt.handlePreOpr(needCoin, selfSeatCpt.coin, this.blind);
                } else {
                    this.oprRoundCpt.open(true, needCoin, selfSeatCpt.coin, this.blind, this.betCoin, msg.currBet, selfSeatCpt, msg.delayTime);
                }
            } else {
                this.oprRoundCpt.open(false, msg.currBet - selfSeatCpt.betChips, selfSeatCpt.coin, this.blind);
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
        // 关闭show牌
        this.showPokerToggle1.node.active = false;
        this.showPokerToggle1.isChecked = false;
        this.showPokerToggle2.node.active = false;
        this.showPokerToggle2.isChecked = false;
        // 暂停出来玩家加入或者离开
        this.netQueueSystem.running = false;
        // 可能提示的牌 关闭
        this.possCardTypeCpt.close();
        // 关闭操作面板
        this.oprRoundCpt.close();
        // 关闭所有倒计时
        this.playersCtrl.hideTimer();
        // 关闭AllIn动画
        this.allinAnimNode.active = false;
        // 关闭指示灯
        this.lightCpt.close();
        // 记录玩家下注情况
        this.selfBetCoin = 0;
        // 关闭所有用户状态
        for (const seatCpt of this.getCpts(DelphiSeatCpt)) {
            seatCpt.closeAllInAnim();
            seatCpt.hidePeopleAllStatus();
        }
        // 强制刷新所有奖池
        this.potCpt.updatePotView(msg.pots);
        // 强制刷新同步公共牌
        this.pokerSystem.forceUpdateLayout(this.publicPokerLayout, msg.showCards);
        this.pokerSystem.updateLayout(this.publicPokerLayout);

        // 玩家主动Show牌
        if (msg.userShow.length > 0) {
            for (const info of msg.userShow) {
                let player = this.playersCtrl.getPlayerByUid(info.uid)
                if (player) {
                    let showPokerList = [];
                    let seatCpt = player.getComponent(DelphiSeatCpt);
                    if (info.uid != cc.vv.UserManager.uid) {
                        // 他人亮牌
                        this.pokerSystem.forceUpdateLayout(seatCpt.handLayout, info.cards);
                        this.pokerSystem.updateLayout(seatCpt.handLayout);
                        for (const cpt of seatCpt.handLayout.pokerList) {
                            cpt.isFront = false;
                        }
                        for (const cpt of seatCpt.handLayout.pokerList) {
                            if (cpt.uint > 0) {
                                showPokerList.push(cpt);
                            }
                        }
                    } else {
                        // 找到需要亮的牌 
                        for (const cpt of seatCpt.handLayout.pokerList) {
                            if (info.cards.indexOf(cpt.uint) >= 0) {
                                showPokerList.push(cpt);
                            }
                        }
                    }
                    this.pokerSystem.bindToLayout(showPokerList, seatCpt.showLayout);
                    let index = 0;
                    for (const pokerCpt of seatCpt.showLayout.pokerList) {
                        let attr = seatCpt.showLayout.getAttrTByLayout(pokerCpt);
                        attr.animTime = 0.15;
                        attr.delayTime = 0.04 * index++;
                        attr.completeCallback = () => {
                            if (!pokerCpt.isFront) {
                                pokerCpt.node.angle = 0;
                                pokerCpt.dark = false;
                                pokerCpt.flip = true;
                                this.soundMgr.playEffect("flop_card_3", false);
                            }
                        }
                        this.pokerSystem.runNodeAction(attr);
                    }
                }
            }
        }

        // 判断是否弃牌结束 来确定是否需要开牌
        if (msg.allCards.length > 0) {
            // 玩家开牌
            for (const info of msg.allCards) {
                if (info.cards.length > 0) {
                    let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(DelphiSeatCpt);
                    this.pokerSystem.forceUpdateLayout(seatCpt.handLayout, info.cards);
                    for (const cpt of seatCpt.handLayout.pokerList) {
                        cpt.isFront = info.uid == cc.vv.UserManager.uid;
                    }
                    this.pokerSystem.updateLayout(seatCpt.handLayout);
                    // 牌转移到showLayout内
                    this.pokerSystem.bindToLayout(seatCpt.handLayout.pokerList, seatCpt.showLayout);
                    let index = 0;
                    for (const pokerCpt of seatCpt.showLayout.pokerList) {
                        let attr = seatCpt.showLayout.getAttrTByLayout(pokerCpt);
                        attr.animTime = 0.15;
                        attr.delayTime = 0.04 * index++;
                        attr.completeCallback = () => {
                            if (!pokerCpt.isFront) {
                                pokerCpt.node.angle = 0;
                                pokerCpt.flip = true;
                                this.soundMgr.playEffect("flop_card_3", false);
                            }
                        }
                        this.pokerSystem.runNodeAction(attr);
                    }
                }
            }
            animTime += 0.3;
            await this.delay(0.3, this.aborts);
            for (const info of msg.allCards) {
                if (info.cards.length > 0) {
                    let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(DelphiSeatCpt);
                    seatCpt.showCardType(info.cardType);
                }
            }
            animTime += 1.2;
            await this.delay(1.2, this.aborts);
        }
        this.potCpt.amount = 0;
        // 遍历底池 依次结算 {"coin": 1000, "uid": [], "win_uids": [], "main": 1}
        for (const winPotIdList of msg.win_config) {
            // 计算胜利的人
            let win_uids = msg.pots[winPotIdList[0] - 1].win_uids;
            let winList = [];
            for (const winUid of win_uids) {
                let winItem: any = { uid: winUid }
                for (const cardInfo of msg.allCards) {
                    if (winUid == cardInfo.uid) {
                        winItem.cardInfo = cardInfo;
                    }
                }
                winList.push(winItem);
            }
            // 胜利音效
            this.soundMgr.playEffect('sfx_gameplay_20', false);
            // 关闭当前次轮不收筹码的牌型显示
            let isShowCardType = false;
            for (const info of msg.allCards) {
                let seatCpt = this.playersCtrl.getPlayerByUid(info.uid).getComponent(DelphiSeatCpt);
                if (win_uids.indexOf(info.uid) >= 0) {
                    // 判断是否显示了牌型
                    if (!seatCpt.cardTypeCpt.isShow) {
                        seatCpt.showCardType(info.cardType);
                    }
                    seatCpt.cardTypeCpt.showLight();
                    isShowCardType = true;
                    // 高亮胜利玩家手牌
                    for (const pokerCpt of seatCpt.showLayout.pokerList) {
                        pokerCpt.dark = false;
                        if (info.bestCards.indexOf(pokerCpt.uint) >= 0) {
                            pokerCpt.isLight = true;
                        }
                    }
                } else {
                    seatCpt.closeCardType();
                    for (const pokerCpt of seatCpt.showLayout.pokerList) {
                        pokerCpt.dark = true;
                    }
                }
            }
            // 高亮公共牌中组成牌型的牌
            let isShowCardLight = false;
            for (const winInfo of winList) {
                if (winInfo.cardInfo) {
                    isShowCardLight = true;
                    for (const pokerCpt of this.publicPokerLayout.pokerList) {
                        if (winInfo.cardInfo.bestCards.indexOf(pokerCpt.uint) >= 0) {
                            pokerCpt.isLight = true;
                        }
                    }
                }
            }
            if (isShowCardType) {
                animTime += 1;
                await this.delay(1, this.aborts);
            }
            // if (isShowCardLight) {
            //     animTime += 0.7;
            //     await this.delay(0.7, this.aborts);
            // }
            // 显示胜利动画 显示手牌光效 分开手牌动画 
            for (const winInfo of winList) {
                let winSeatCpt = this.playersCtrl.getPlayerByUid(winInfo.uid).getComponent(DelphiSeatCpt);
                winSeatCpt.showWinAnim();
                if (winInfo.cardInfo) {
                    winSeatCpt.showPokerLight();
                }
            }
            for (const winInfo of winList) {
                if (winInfo.cardInfo) {
                    let winSeatCpt = this.playersCtrl.getPlayerByUid(winInfo.uid).getComponent(DelphiSeatCpt);
                    for (const pokerCpt of this.publicPokerLayout.pokerList) {
                        pokerCpt.dark = winInfo.cardInfo.bestCards.indexOf(pokerCpt.uint) < 0;
                    }
                    for (const pokerCpt of winSeatCpt.showLayout.pokerList) {
                        pokerCpt.dark = winInfo.cardInfo.bestCards.indexOf(pokerCpt.uint) < 0;
                    }
                }
            }
            // animTime += 0.2;
            // await this.delay(0.2, this.aborts);
            // 牌型飞到中间
            let isCardTypeAnim = false;
            for (let i = 0; i < winList.length; i++) {
                const winInfo = winList[i];
                if (winInfo.cardInfo) {
                    isCardTypeAnim = true;
                    // 找到最好牌型 高亮 并且 弹出
                    let winSeatCpt = this.playersCtrl.getPlayerByUid(winInfo.uid).getComponent(DelphiSeatCpt);
                    // 显示牌型
                    winSeatCpt.hitCardType(winInfo.cardInfo.cardType, cc.v3(0, -130), () => {
                        if (i != 0) {
                            winSeatCpt.closeCardType();
                        }
                    });
                }
            }
            if (isCardTypeAnim) {
                animTime += 0.5;
                await this.delay(0.5, this.aborts);
            }

            // 抬起牌
            let isHintPoker = false;
            for (const winInfo of winList) {
                if (winInfo.cardInfo) {
                    isHintPoker = true;
                    let winSeatCpt = this.playersCtrl.getPlayerByUid(winInfo.uid).getComponent(DelphiSeatCpt);
                    for (const pokerCpt of this.publicPokerLayout.pokerList) {
                        if (winInfo.cardInfo.bestCards.indexOf(pokerCpt.uint) >= 0) {
                            pokerCpt.isSelect = true;
                        }
                    }
                    for (const pokerCpt of winSeatCpt.showLayout.pokerList) {
                        if (winInfo.cardInfo.bestCards.indexOf(pokerCpt.uint) >= 0) {
                            pokerCpt.isSelect = true;
                        }
                    }
                    this.pokerSystem.updateLayout(winSeatCpt.showLayout, { animTime: 0.2 })
                }
            }
            this.pokerSystem.updateLayout(this.publicPokerLayout, { animTime: 0.2 })
            // 根据牌型显示对应动画
            let winInfo = winList[0];
            if (winInfo.cardInfo) {
                this.publicPokerLightAnimNode.active = true;
                if (winInfo.cardInfo.cardType <= 1) {
                    this.publicPokerLightAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation0", true);
                } else if (winInfo.cardInfo.cardType <= 3) {
                    this.publicPokerLightAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation1", true);
                } else if (winInfo.cardInfo.cardType <= 5) {
                    this.publicPokerLightAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation2", true);
                } else if (winInfo.cardInfo.cardType <= 7) {
                    this.publicPokerLightAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation3", true);
                } else {
                    this.publicPokerLightAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation4", true);
                }
            }
            if (isHintPoker) {
                // 平分动画提示
                if (winList.length > 1) {
                    this.pingFenAnimNode.active = true;
                    this.pingFenAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
                }
                animTime += 0.8;
                await this.delay(0.8, this.aborts);
            }
            // 找到比瓜分的奖池
            this.soundMgr.playEffect("sfx_gameplay_10", false)
            for (const winInfo of winList) {
                let winSeatCpt = this.playersCtrl.getPlayerByUid(winInfo.uid).getComponent(DelphiSeatCpt);
                let pot2seat_cfg = [];
                let potAllChips = 0;
                for (const potId of winPotIdList) {
                    potAllChips += msg.pots[potId - 1].coin;
                }
                let winCoins = Number((potAllChips / win_uids.length).toFixed(2));
                for (const potId of winPotIdList) {
                    pot2seat_cfg.push({
                        potId: potId - 1,
                        remaining: 0,
                        coin: winCoins,
                    })
                }
                // 奖池发钱
                this.potCpt.potChips2Seat(pot2seat_cfg, winSeatCpt.headPos, () => {
                    // 票分动画
                    winSeatCpt.getComponent(PBPlayer).playCoinChange(winCoins, false, false);
                    winSeatCpt.coin += winCoins;
                });
            }
            animTime += 1;
            await this.delay(1, this.aborts);
            // 关闭所有牌型 与 高亮
            for (const seatCpt of this.getCpts(DelphiSeatCpt)) {
                seatCpt.closeCardType()
                for (const pokerCpt of seatCpt.showLayout.pokerList) {
                    pokerCpt.isLight = false;
                    pokerCpt.isSelect = false;
                }
                seatCpt.showLayout.updateLayout();
                seatCpt.closeWinAnim();
            }
            for (const pokerCpt of this.publicPokerLayout.pokerList) {
                pokerCpt.isLight = false;
                pokerCpt.isSelect = false;
            }
            for (const poketCpt of this.getCpts(PokerCpt)) {
                poketCpt.dark = false;
            }
            this.publicPokerLayout.updateLayout();
            this.publicPokerLightAnimNode.active = false;
            // 显示胜利动画 显示手牌光效 分开手牌动画 
            for (const winInfo of winList) {
                let winSeatCpt = this.playersCtrl.getPlayerByUid(winInfo.uid).getComponent(DelphiSeatCpt);
                winSeatCpt.closePokerLight();
            }
        }

        // 弃牌结算 等待3秒
        if (msg.allCards.length <= 0 && msg.userShow.length > 0) {
            animTime += 3;
            await this.delay(3, this.aborts);
        }

        // 清空桌子
        this.pokerSystem.destroyAllPoker();
        for (const seatCpt of this.getCpts(DelphiSeatCpt)) {
            seatCpt.isLoser = false;
            seatCpt.isUnknown = false;
            seatCpt.isWather = false;
            // seatCpt.setCoinNodeActive(seatCpt.data)
        }
        // 恢复网络
        this.netQueueSystem.running = true;

        // 同步用户金币
        for (let i = 0; i < msg.fcoins.length; i++) {
            const fcoin = msg.fcoins[i];
            let playerVfo = this.dm.playersDm.getPlayerBySeatId(i + 1);
            if (playerVfo && fcoin) {
                let pInfo = this.playersCtrl.getPlayerByUid(playerVfo.uid).getComponent(DelphiSeatCpt);
                pInfo.coin = fcoin;
            }
        }

        let bShowMatch = false;
        if (this.nextRoundTime) {
            // 显示换桌和倒计时
            this.countDownCpt.show(Math.ceil(this.nextRoundTime - animTime));
            // bShowMatch = true;  // 正常结算，两局直接显示match倒计时
            this.canChangeDesk = true;
            this.operate.showWatchTips(false);
        }
        // 是否显示邀请和准备按钮
        if (this.dm.tableInfo.needSelfReady() && this.dm.tableInfo.isViewer == 0) {
            // bShowMatch = !this.dm.playersDm.selfInfo.isReady;   // 好友房，已经准备了，就不再显示倒计时了
            this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
            this.operate.showInvite(false);
            this.operate.showTableCode(false);
        }
        this.playersCtrl.hideAllEmptySeat();
        // this._showMathUIAni(bShowMatch, Math.ceil(this.nextRoundTime - animTime));
    }
    // 大结算
    TOTAL_SETTLEMENT(msg) {
        this.nextRoundTime = msg.delayTime;
        if (this.dm.playersDm.selfAbsInfo && this.dm.playersDm.selfAbsInfo.isSeated) {
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
            for (let i = 1; i <= 6; i++) {
                this.playersCtrl.standUp(i)
            }
            // 取消托管
            this.autoHost.hide();
            this.cleanRound();
        }
    }
    // 进入新房间返回
    R_SWITCH_TABLE(dic) {
        if (dic.code == 200 && dic.gameid == 293) {
            cc.vv.gameData.init(dic.deskinfo);
            this.enterTable();
        } else {
            // 回大厅
            this.gotoHall();
        }
    }
}