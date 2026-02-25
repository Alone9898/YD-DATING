import { UnoPlayersCtrl } from "./player/Uno_PlayersCtrl";
import { UnoHandCardCtrl } from "./card/Uno_HandCardCtrl";
import { UnoSoundCtrl } from "./sound/Uno_SoundCtrl";
import { UnoCardStack } from "./card/Uno_CardStack";
import { UnoDiscardsPool } from "./card/Uno_DiscardsPool";
import { UnoTotalSettlement } from "./settlement/Uno_TotalSettlement";
import { UnoAlgHelper } from "./Uno_AlgHelper";


import { PromiseLock } from "../../../../BalootClient/game_common/PromiseLock";
import PBLogic from "../../PokerBase/scripts/PBLogic";
import { PBCardItem } from "../../PokerBase/scripts/card/PBCardItem";
import { PBFlowState, PBRoomType, PBTableState } from "../../PokerBase/scripts/PBCommonData";
import { PBSettlementResultType } from "../../PokerBase/scripts/settlement/PBTotalSettlement";
import { PBQualifying } from "../../PokerBase/scripts/widgetplus/PBQualifying";

import UnoGameData = require("./Uno_GameData");
import { UnoUserState } from "./Uno_CommonData";
import { UnoDiscardOrPass } from "./operate/Uno_DiscardOrPass";
import { UnoChooseColor } from "./operate/Uno_ChooseColor";
import { UnoPlayer } from "./player/Uno_Player";
import { UnoChallenge } from "./operate/Uno_Challenge";
import { getPBCardSuit, getPBCardVal } from "../../PokerBase/scripts/card/PBCardData";
import { UnoOperate } from "./operate/Uno_Operate";
import { PBOperate } from "../../PokerBase/scripts/operate/PBOperate";
import Table_CountDown from "../../../Table_Common/TableBase/Table_CountDown";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnoLogic extends PBLogic {
    playersCtrl: UnoPlayersCtrl;
    handCardCtrl: UnoHandCardCtrl;
    cardStackCtrl: UnoCardStack;
    operate: UnoOperate;

    discardsPool: UnoDiscardsPool;
    totalSettlementCtrl: UnoTotalSettlement;

    discardOrPass: UnoDiscardOrPass;
    chooseColor: UnoChooseColor;
    challenge: UnoChallenge;

    dm: UnoGameData;

    url_rule = "games/Uno/prefabs/game_rule";
    countDown: Table_CountDown;

    loadCtrl() {
        super.loadCtrl();

        this.handCardCtrl = this.loadHandCardCtrl();
        this.cardStackCtrl = this.loadCardStackCtrl();
        this.discardsPool = this.loadDiscardsPool();
        this.totalSettlementCtrl = this.loadTotalSettlementCtrl();

        this.discardOrPass = this.loadDiscardOrPass();
        this.chooseColor = this.loadChooseColor();
        this.challenge = this.loadChallenge();
        // 添加声音管理器
        this.panel.addComponent("Table_Sound");
        this.countDown = this.loadCountdown();
    }

    loadOperate() {
        let operateNode = cc.find("operate", this.panel);
        if (operateNode) {
            return operateNode.getComponent(UnoOperate);
        } else {
            return null;
        }
    }

    // afterInit() {
    //     super.afterInit();
    //     this.dm.msgHandler.run();
    //     cc.vv.NetManager.send({ c: 3 });
    // }

    start(){
        this.dm.msgHandler.run();
        cc.vv.NetManager.send({ c: 4 });
        this.enterTable();
        this.enterTableLater();
    }


    /**
     * 重置资源
     */
    reset() {
        this.dm.reset();
        this.dm.msgHandler.clearMsgQueue();
        this.handCardCtrl.clear();
        this.playersCtrl.cleanRound();
    }

    reconnectInGameReset() {
        this.dm.msgHandler.clearMsgQueue();
        this.dm.clearRound();
        this.dm.reset();
    }

    //////////////// 初始化控制器 ///////////////////////
    loadQualifying() {
        let node = cc.find("top_left_layout/qualifying", this.panel);
        if (node) {
            return node.getComponent(PBQualifying);
        } else {
            return null;
        }
    }

    loadDiscardOrPass() {
        return cc.find("discard_or_pass", this.panel).getComponent(UnoDiscardOrPass);
    }

    loadPlayersCtrl() {
        return this.panel.addComponent(UnoPlayersCtrl);
    }

    loadChooseColor() {
        return cc.find("choose_color", this.panel).getComponent(UnoChooseColor);
    }

    loadChallenge() {
        return cc.find("challenge", this.panel).getComponent(UnoChallenge);
    }

    loadHandCardCtrl() {
        let hc = cc.find("hand_card_node", this.panel).addComponent(UnoHandCardCtrl);
        // this.scheduleOnce(() => {
        hc.init(cc.find("card_item_template", this.panel));
        hc.changeHandler = () => {
            //this.cardOperateCtrl.cardSelectChange(true);
        }
        // })
        return hc;
    }

    loadCardStackCtrl() {
        let cmp = cc.find("cards_stack", this.panel).addComponent(UnoCardStack);
        return cmp;
    }

    loadDiscardsPool() {
        return cc.find("discards_pool", this.panel).addComponent(UnoDiscardsPool);
    }

    loadTotalSettlementCtrl() {
        return cc.find("total_settlement", this.panel).getComponent(UnoTotalSettlement);
    }

    loadSoundCtrl() {
        return this.panel.addComponent(UnoSoundCtrl);
    }
    /**
     * 加载倒计时
     */
    loadCountdown() {
        let node = cc.find("table_count_down", this.panel);
        if (node) {
            return node.getComponent("Table_CountDown");
        } else {
            return null;
        }
    }
    //////////////// 消息操作 ///////////////////////
    /**
     * 清理一局ui和数据
     */
    cleanRound() {
        this.dm.clearRound();
        this.playersCtrl.cleanRound();
        this.handCardCtrl.clear();
        this.countDown.hide();
        this._showMathUIAni(false)
        this.operate.showChangeBtn(false);
        this.operate.showLeaveBtn(false);
        this.operate.showConfirmBtn(false);
    }


    // 换桌
    changeTable() {
        for (let i = 1; i <= 4; i++) {
            this.playersCtrl.standUp(i)
        }
        this.cleanRound();
    }

    /**
     * 进入房间
     */
    async enterTable() {
        this.scheduleOnce(async () => {
            // cc.find("safe_node/bg_node_yd", this.node).active = Global.isYDApp();
            this.playersCtrl.cleanRound();
            this.handCardCtrl.clear();
            this.discardsPool.reset();
            this.cardStackCtrl.reset();

            this.countDown.hide();
            this._showMathUIAni(false);
            this.operate.showReady(false);
            this.operate.showInvite(false);
            this.operate.showTableCode(false);
            this.totalSettlementCtrl.clear();

            this.challenge.hide();
            this.discardOrPass.hide();
            this.chooseColor.hide();

            this.operate.hideUnoBtn();

            this.showFingerTip(false);
            // UnoGameTypeSelector.close();

            if (this.dm.tableInfo.roomType == PBRoomType.friend) {
                cc.find("top_left_layout/room_id", this.panel).active = true;
                cc.find("top_left_layout/room_id/label", this.panel).getComponent(cc.Label).string = this.dm.tableInfo.tableId.toString();
            } else {
                cc.find("top_left_layout/room_id", this.panel).active = false;
            }

            let tableStatus = this.dm.tableStatus;

            if (this.dm.tableInfo.isViewer) {
                this.operate.hideUnoBtn();
            }

            this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);
            let selfInfo = this.dm.playersDm.selfAbsInfo;

            if (this.dm.tableInfo.isViewer && !this.dm.playersDm.selfAbsInfo.isSeated) {
                this.viewerList.show(this.dm.playersDm.viewerList);
            } else {
                this.viewerList.hide();
            }

            if (this.dm.deskInfo.dismiss) {
                this.playerApplyDismiss(this.dm.deskInfo.dismiss);
            }

            if (this.dm.tableStatus.currStatus === PBTableState.PLAY) {
                this.operate.showChangeBtn(false);
            } else {
                this.operate.showChangeBtn(true);
            }

            if (tableStatus.isReconnect) {
                if (selfInfo.autoHost) {
                    this.autoHost.show();
                }
                let handCards = [];
                if (this.dm.tableInfo.isViewer) {
                    this.handCardCtrl.clear();
                } else {
                    handCards = selfInfo.handCards;
                    if (handCards && handCards.length > 0) {
                        UnoAlgHelper.sort(handCards);
                        this.handCardCtrl.dealCards(handCards, false);
                        this.handCardCtrl.setCanOperate(true);
                        this.handCardCtrl.setCanOutCard(tableStatus.canOutCard);
                    }
                }
                let players = this.dm.playersDm.getPlayesInfo();
                switch (tableStatus.currStatus) {
                    case PBTableState.MATCH:
                    case PBTableState.READY:
                    case PBTableState.GAMEOVER:
                        if(this.dm.deskInfo.waitTime > 0){
                            this._showMathUIAni(true, this.dm.deskInfo.waitTime)
                        }
                        this.dm.tableStatus.flowState = PBFlowState.match;
                        if (this.dm.tableInfo.roomType == PBRoomType.friend) {
                            let countdownTime = this.dm.countdownTime;
                            if (countdownTime > 0) {
                                this.dm.tableStatus.flowState = PBFlowState.countdown;
                                // this.countdown.show(countdownTime);
                                // this._showMathUIAni(true, countdownTime);
                                this.operate.showReady(false);
                                this.operate.showInvite(false);
                                this.operate.showTableCode(false);
                                this.playersCtrl.hideAllEmptySeat();
                            } else {
                                this.operate.showReady(!this.dm.playersDm.selfAbsInfo.isReady);
                                this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                                this.operate.showTableCode(true);
                            }
                        }
                        break;
                    case PBTableState.PLAY:
                        this.operate.showUnoBtn();
                        this.dm.tableStatus.flowState = PBFlowState.playing;
                        // 显示牌池的牌
                        let roundInfo = this.dm.deskInfo.round;
                        if (roundInfo) {
                            let roundCards = roundInfo.discardCards || [];
                            tableStatus.tableCard = roundCards[roundCards.length - 1];
                            this.discardsPool.showCard(roundCards[roundCards.length - 1]);
                            this.discardsPool.startRotate(getPBCardSuit(roundCards[roundCards.length - 1]), roundInfo.isReverse ? -1 : 1);
                            let nextP = this.dm.playersDm.getPlayerBySeatId(roundInfo.activeSeat);
                            if (nextP) {
                                if (nextP == selfInfo) {
                                    if (nextP.state === UnoUserState.DiscardOrPass) {
                                        this.discardOrPass.show(this.dm.getUserInDeskinfo(selfInfo.uid).round.drawCard);
                                        tableStatus.maskCards = UnoAlgHelper.getMaskCard(roundCards[roundCards.length - 1], this.dm.playersDm.selfInfo.handCards);
                                        this.handCardCtrl.setCanOutCard(false, tableStatus.maskCards);
                                    } else if (nextP.state === UnoUserState.WaitChallenge) {
                                        let preSeat = roundInfo.activeSeat - 1;
                                        if (preSeat <= 0) {
                                            preSeat += this.dm.playersDm.chair;
                                        }
                                        let preP = this.dm.playersDm.getPlayerBySeatId(preSeat);
                                        this.challenge.show(preP);
                                    } else {
                                        tableStatus.canOutCard = true;
                                        tableStatus.maskCards = UnoAlgHelper.getMaskCard(roundCards[roundCards.length - 1], this.dm.playersDm.selfInfo.handCards);
                                        this.handCardCtrl.setCanOutCard(true, tableStatus.maskCards);
                                    }
                                }
                                this.scheduleOnce(() => {
                                    let delayTime = roundInfo.delayTime || 6;
                                    this.playersCtrl.showTimer(nextP.position, delayTime);
                                    if (nextP == selfInfo) {
                                        this.showFingerTip(true);
                                    }
                                });
                            }
                        }

                        // 显示剩余手牌
                        for (let i = 0; i < players.length; i++) {
                            let pVo = players[i];
                            if (pVo) {
                                let pCtrl = this.playersCtrl.getPlayerByPosition(i);
                                pCtrl.setUnoVisible(pVo.uno);
                                if (pCtrl.hideCardCtrl) {
                                    if (i == 0) {
                                        if (this.dm.tableInfo.isViewer) {
                                            pCtrl.hideCardCtrl.showCardCnt(pVo.restCardLen, false);
                                        } else {
                                            pCtrl.hideCardCtrl.reset();
                                        }
                                    } else {
                                        pCtrl.hideCardCtrl.showCardCnt(pVo.restCardLen);
                                    }
                                }

                            }
                        }

                        break;
                    case PBTableState.GAMEOVER:
                        this.dm.tableStatus.flowState = PBFlowState.total_settlement;
                        break;
                }
            } else {
                if (this.dm.tableInfo.needSelfReady()) {
                    this.operate.showReady(!this.dm.playersDm.selfAbsInfo.isReady);
                    this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                    this.operate.showTableCode(true);
                } else {
                    // this.countdown.show(5);
                    if(this.dm.deskInfo.waitTime > 0){
                        this._showMathUIAni(true, this.dm.deskInfo.waitTime)
                    }
                }
            }
            this.changeSkin();
            // 开始播放命令
            this.scheduleOnce(() => {
                this.dm.msgHandler.startPlayCmd();
            }, 0.5)
        });
    }

    /**
     * 获取发牌玩家数组
     */
    _getDealables() {
        let dealerPosition = this.dm.playersDm.getPlayerByUid(this.dm.tableStatus.dealerUid).position;
        // 庄家下家开始发牌
        let startPosition = dealerPosition + 1;
        let dealableArr = [];
        if (this.dm.tableInfo.isViewer) {
            dealableArr = [...this.playersCtrl.players];
        } else {
            dealableArr = [this.handCardCtrl, ...this.playersCtrl.players.slice(1)];
        }
        return dealableArr.slice(startPosition, 4).concat(dealableArr.slice(0, startPosition));
    }

    /**
     * 发牌
     */
    async dealCards(dic: any) {
        this.operate.showChangeBtn(false);
        this.countDown.hide();
        this._showMathUIAni(false)
        this.dm.tableStatus.flowState = PBFlowState.playing;
        let cdtime = dic.delayTime || 8;
        let activeUid = dic.dealerUid;
        this.playersCtrl.ready(-1);
        this.dm.tableStatus.currRound += 1;
        let tableStatus = this.dm.tableStatus;
        if (this.dm.tableStatus.currRound == 1) {
            this.minusEntryCoin();
        }

        if (this.dm.tableInfo.isViewer) {
            this.viewerList.updateList(this.dm.playersDm.viewerList);
        } else {
            this.operate.showUnoBtn();
            this.viewerList.hide();
        }

        this.operate.reset();
        // await this.playersCtrl.showDealer(this.dm.playersDm.getPlayerByUid(this.dm.tableStatus.dealerUid).position);
        let dealables = this._getDealables();
        dealables.forEach(e => {
            e.dealedCardLen = 0;
        })
        if (!await PromiseLock.exe(this.cardStackCtrl.dealCards(dealables))) {
            return;
        }
        this.handCardCtrl.setCanOperate(true);

        tableStatus.tableCard = dic.firstCard;

        // 发公共牌
        if (!await PromiseLock.exe(this.cardStackCtrl.dealPublicCard(this.discardsPool, dic.firstCard))) {
            return;
        }

        this.discardsPool.startRotate(getPBCardSuit(dic.firstCard));

        let activeP = this.dm.playersDm.getPlayerByUid(activeUid);
        await this.playersCtrl.showTimer(activeP.position, cdtime);
        if (this.dm.playersDm.isSelf(activeUid)) {
            this.dm.tableStatus.canOutCard = true;
            this.dm.tableStatus.maskCards = UnoAlgHelper.getMaskCard(dic.firstCard, activeP.handCards);
            if (this.dm.tableStatus.maskCards.length === activeP.handCards.length) {
                (this.cardStackCtrl as UnoCardStack).setFingerVisible(true);
            }
        } else {
            this.dm.tableStatus.canOutCard = false;
            this.dm.tableStatus.maskCards = null;
        }
        this.handCardCtrl.setCanOutCard(tableStatus.canOutCard, tableStatus.maskCards);
        this.scheduleOnce(() => {
            this.dm.msgHandler.resumeCmd();
        }, 0.2)
    }

    /**
     * 摸牌
     * @param dic 
     */
    async drawCards(dic: any) {
        (this.cardStackCtrl as UnoCardStack).setFingerVisible(false);
        let cdtime = dic.delayTime || 8;
        let activeUid = dic.nextUid;
        let tableStatus = this.dm.tableStatus;

        let playerVo = this.dm.playersDm.getPlayerByUid(dic.uid);
        if (playerVo && dic.isSkip) {
            let player = this.playersCtrl.getPlayerByUid(playerVo.uid);
            (player as UnoPlayer).playSkip(dic.cards.length);
        }

        // 给玩家发牌
        let dealables = [];
        let player = this.playersCtrl.getPlayerByUid(dic.uid);
        if (this.dm.tableInfo.isViewer) {
            dealables = [player];
        } else {
            if (this.dm.playersDm.isSelf(dic.uid)) {
                dealables = [this.handCardCtrl];
            } else {
                dealables = [player];
            }
        }

        dealables.forEach(e => {
            e.dealedCardLen = 0;
        })
        if (!await PromiseLock.exe(this.cardStackCtrl.drawCards(dealables, dic.cards.length))) {
            return;
        }
        this.handCardCtrl.setCanOperate(true);
        let activeP = this.dm.playersDm.getPlayerByUid(activeUid);
        await this.playersCtrl.showTimer(activeP.position, cdtime);
        if (this.dm.playersDm.isSelf(activeUid)) {
            if (dic.nextState === UnoUserState.DiscardOrPass) {
                this.discardOrPass.show(dic.cards[0]);
            } else {
                tableStatus.canOutCard = true;
                tableStatus.maskCards = UnoAlgHelper.getMaskCard(tableStatus.tableCard, activeP.handCards);
                if (this.dm.tableStatus.maskCards.length === activeP.handCards.length) {
                    (this.cardStackCtrl as UnoCardStack).setFingerVisible(true);
                }
            }
        } else {
            tableStatus.canOutCard = false;
            tableStatus.maskCards = null;
        }

        if (dic.uid !== dic.nextUid) {
            if (this.dm.playersDm.isSelf(dic.uid)) {
                if (this.handCardCtrl.handCard.cards.length >= 2) {
                    (this.playersCtrl.getPlayerByUid(dic.uid) as UnoPlayer).setUnoVisible(false);
                    this.dm.tableStatus.canChallengeUno = false;
                }
            } else {
                let player = this.playersCtrl.getPlayerByUid(dic.uid);
                if (player.hideCardCtrl.showCnt() >= 2) {
                    (player as UnoPlayer).setUnoVisible(false);
                }
            }
        }

        this.handCardCtrl.setCanOutCard(tableStatus.canOutCard, tableStatus.maskCards);
        this.scheduleOnce(() => {
            this.dm.msgHandler.resumeCmd();
        }, 0.2)
    }

    async onKeep(dic: any) {
        this.discardOrPass.hide();
        this.playersCtrl.hideTimer();
        let timeOut = dic.delayTime || 8;
        let uid = dic.uid;
        let nextUid = dic.nextUid;
        let playerVo = this.dm.playersDm.getPlayerByUid(uid);
        let nextPlayerVo = this.dm.playersDm.getPlayerByUid(nextUid);
        let tableStatus = this.dm.tableStatus;

        if (!dic.isSkip) {
            let player = this.playersCtrl.getPlayerByUid(uid);
            player.playBidBubble("pass");
        }

        if (this.dm.playersDm.isSelf(uid)) {
            if (this.handCardCtrl.handCard.cards.length >= 2) {
                (this.playersCtrl.getPlayerByUid(uid) as UnoPlayer).setUnoVisible(false);
            }
        } else {
            let player = this.playersCtrl.getPlayerByUid(uid);
            if (player.hideCardCtrl.showCnt() >= 2) {
                (player as UnoPlayer).setUnoVisible(false);
            }
        }


        if (nextPlayerVo && dic.isSkip) {
            let player = this.playersCtrl.getPlayerByUid(uid);
            (player as UnoPlayer).playSkip(0);
        }

        if (!await PromiseLock.exe(this.playersCtrl.showTimer(nextPlayerVo.position, timeOut))) {
            return;
        }

        if (this.dm.playersDm.isSelf(nextUid)) {
            tableStatus.canOutCard = true;
            tableStatus.maskCards = UnoAlgHelper.getMaskCard(tableStatus.tableCard, nextPlayerVo.handCards);
            if (this.dm.tableStatus.maskCards.length === nextPlayerVo.handCards.length) {
                (this.cardStackCtrl as UnoCardStack).setFingerVisible(true);
            }
        } else {
            tableStatus.canOutCard = false;
            tableStatus.maskCards = null;
        }

        this.handCardCtrl.setCanOutCard(tableStatus.canOutCard, tableStatus.maskCards);
        this.dm.msgHandler.resumeCmd();
    }

    async onChallenge(dic: any) {
        this.challenge.hide();
        let player = this.playersCtrl.getPlayerByUid(dic.result.uid);
        let dealables = [];
        if (dic.success) {
            // 质疑成功
            let playerVo = this.dm.playersDm.getPlayerByUid(dic.result.uid);
            // 给玩家发牌
            (player as UnoPlayer).playAddCardNum(dic.result.cards.length);

            (player as UnoPlayer).playChallenge(true);
        } else {
            // 不质疑或者质疑失败
            (player as UnoPlayer).playSkip(dic.result.cards.length);
            if (dic.rtype === 1) {
                (player as UnoPlayer).playChallenge(false);
            }
        }

        if (this.dm.playersDm.isSelf(dic.result.uid)) {
            (player as UnoPlayer).setUnoVisible(false);
        } else {
            (player as UnoPlayer).setUnoVisible(false);
        }

        if (this.dm.tableInfo.isViewer) {
            dealables = [player];
        } else {
            if (this.dm.playersDm.isSelf(dic.result.uid)) {
                dealables = [this.handCardCtrl];
            } else {
                dealables = [player];
            }
        }

        dealables.forEach(e => {
            e.dealedCardLen = 0;
        })
        if (!await PromiseLock.exe(this.cardStackCtrl.drawCards(dealables, dic.result.cards.length))) {
            return;
        }

        let cdtime = dic.delayTime || 8;
        let activeUid = dic.nextUid;
        let activeP = this.dm.playersDm.getPlayerByUid(activeUid);
        let tableStatus = this.dm.tableStatus;
        await this.playersCtrl.showTimer(activeP.position, cdtime);
        if (this.dm.playersDm.isSelf(activeUid)) {
            tableStatus.canOutCard = true;
            tableStatus.maskCards = UnoAlgHelper.getMaskCard(tableStatus.tableCard, activeP.handCards);
            if (this.dm.tableStatus.maskCards.length === activeP.handCards.length) {
                (this.cardStackCtrl as UnoCardStack).setFingerVisible(true);
            }
        } else {
            tableStatus.canOutCard = false;
            tableStatus.maskCards = null;
        }

        this.handCardCtrl.setCanOutCard(tableStatus.canOutCard, tableStatus.maskCards);
        this.scheduleOnce(() => {
            this.dm.msgHandler.resumeCmd();
        }, 0.2)
    }

    async onUno(dic: any) {
        if (dic.success) {
            let player = this.playersCtrl.getPlayerByUid(dic.uid);
            (player as UnoPlayer).setUnoVisible(true);
        }

        this.scheduleOnce(() => {
            this.dm.msgHandler.resumeCmd();
        }, 0.2)
    }

    async onUnoChallenge(dic: any) {
        if (dic.success) {
            let player = this.playersCtrl.getPlayerByUid(dic.uid);
            player.playBidBubble("uno challenge");

            let oPlayer = this.playersCtrl.getPlayerByUid(dic.ouid);

            (oPlayer as UnoPlayer).playHammer(true);
            let dealables = [];
            if (this.dm.tableInfo.isViewer) {
                dealables = [oPlayer];
            } else {
                if (this.dm.playersDm.isSelf(dic.ouid)) {
                    dealables = [this.handCardCtrl];
                } else {
                    dealables = [oPlayer];
                }
            }

            dealables.forEach(e => {
                e.dealedCardLen = 0;
            })
            if (!await PromiseLock.exe(this.cardStackCtrl.drawCards(dealables, dic.cards.length))) {
                return;
            }
        }

        this.scheduleOnce(() => {
            this.dm.msgHandler.resumeCmd();
        }, 0.2)
    }

    /**
     * 玩家出牌
     */
    async userOutCard(dic: any) {
        this.discardOrPass.hide();
        this.playersCtrl.hideTimer();
        if (dic.actionInfo && dic.actionInfo.cardCnt === 4) {
            this.dm.tableStatus.challengeCard = this.dm.tableStatus.tableCard;
        }
        let timeOut = dic.delayTime || 8;
        let uid = dic.uid;
        let discardCard = dic.card;
        let roundCards = dic.roundCards;
        let nextUid = dic.nextUid;
        let isEnd = dic.isOver;
        let hintCards = dic.perfactCards;
        let playerVo = this.dm.playersDm.getPlayerByUid(uid);
        let nextPlayerVo = this.dm.playersDm.getPlayerByUid(nextUid);
        let tableStatus = this.dm.tableStatus;

        facade.dm.tableStatus.tableCard = discardCard;

        this.chooseColor.hide();

        this.discardsPool.changeSuit(getPBCardSuit(discardCard));

        if (this.dm.playersDm.isSelf(uid)) {

            this.showFingerTip(false);
            if ((getPBCardVal(discardCard) === 0xd) || (getPBCardVal(discardCard) === 0xe)) {
                this.dm.playersDm.removeCards(0, [getPBCardVal(discardCard) + 0x50]);
            } else {
                this.dm.playersDm.removeCards(0, [discardCard]);
            }

            // 服务器自动出牌
            if (tableStatus.canOutCard) {
                this.autoHost && this.autoHost.show();
                if (!await PromiseLock.exe(this.handCardCtrl.outCard(discardCard, false))) {
                    return;
                }
            }

            if (this.handCardCtrl.handCard.cards.length >= 2) {
                (this.playersCtrl.getPlayerByUid(uid) as UnoPlayer).setUnoVisible(false);
            }

            tableStatus.havePreDiscard = false;
            if (!await PromiseLock.exe(this.delayTime(0.2))) {
                return;
            }
        } else {
            // 其他玩家出牌
            if (!await PromiseLock.exe(this.playersCtrl.discardCard(playerVo.position, discardCard))) {
                return;
            }

            let player = this.playersCtrl.getPlayerByUid(uid);
            if (player.hideCardCtrl.showCnt() >= 2) {
                (player as UnoPlayer).setUnoVisible(false);
            }
        }
        if (isEnd) {
            this.lightCtrl.closeLight();
        }

        if (nextPlayerVo) {
            if (!isEnd) {
                if (!await PromiseLock.exe(this.playersCtrl.showTimer(nextPlayerVo.position, timeOut))) {
                    return;
                }
            }

            if (dic.actionInfo.isSkip) {
                if (dic.actionInfo.cardCnt === 4) {
                    // 需要看是否质疑
                    if (nextPlayerVo && nextPlayerVo === this.dm.playersDm.selfAbsInfo && !isEnd) {
                        // 弹出质疑框
                        this.challenge.show(playerVo);
                    } else {

                    }
                } else {
                    // 下家跳过，不在这里播消息，跳过不摸牌在pass里面播，跳过摸2张在抓牌里面播，跳过摸4张也在抓牌里面播
                }
            } else if (dic.actionInfo.isReverse) {
                this.discardsPool.changeDirection();
                if (!await PromiseLock.exe(this.delayTime(0.3))) {
                    return;
                }
                if (nextPlayerVo == this.dm.playersDm.selfAbsInfo) {
                    tableStatus.canOutCard = true;
                    tableStatus.maskCards = UnoAlgHelper.getMaskCard(discardCard, nextPlayerVo.handCards)
                    if (this.dm.tableStatus.maskCards.length === nextPlayerVo.handCards.length) {
                        (this.cardStackCtrl as UnoCardStack).setFingerVisible(true);
                    }
                } else {
                    tableStatus.canOutCard = false;
                    tableStatus.maskCards = null;
                }
            } else {
                if (nextPlayerVo == this.dm.playersDm.selfAbsInfo) {
                    tableStatus.canOutCard = true;
                    tableStatus.maskCards = UnoAlgHelper.getMaskCard(discardCard, nextPlayerVo.handCards)
                    if (this.dm.tableStatus.maskCards.length === nextPlayerVo.handCards.length) {
                        (this.cardStackCtrl as UnoCardStack).setFingerVisible(true);
                    }
                } else {
                    tableStatus.canOutCard = false;
                    tableStatus.maskCards = null;
                }
            }
        }

        if (isEnd) {
            tableStatus.canOutCard = false;
            tableStatus.maskCards = null;
        }

        this.handCardCtrl.setCanOutCard(tableStatus.canOutCard, tableStatus.maskCards);
        this.dm.msgHandler.resumeCmd();
    }


    /**
     * 结算
     */
    async roundSettlement(dic: any) {
        this.cardStackCtrl.setFingerVisible(false);
        this.dm.tableStatus.flowState = PBFlowState.round_settlement;
        this.autoHost.hide();
        this.playersCtrl.hideTimer();
        this.lightCtrl.closeLight();
        let settle: number[] = dic.settle;
        if (settle) {
            for (let i = 0; i < settle.length; i++) {
                let score = settle[i];
                let pvo = this.dm.playersDm.getPlayerBySeatId(i + 1);
                if (pvo && score) {
                    let player = this.playersCtrl.getPlayerByUid(pvo.uid);
                    player && player.playScoreChange(score);
                }
            }
        }
        if (!await PromiseLock.exe(this.delayTime(1))) {
            return;
        }

        cc.vv.FloatTip.show(___("round end"));
        if (!await PromiseLock.exe(this.delayTime(1))) {
            return;
        }
        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 大结算
     */
    async totalSettlement(dic: any) {
        this.cardStackCtrl.setFingerVisible(false);
        this.playersCtrl.hideTimer();
        this.autoHost.hide();
        this.operate.hideUnoBtn();
        this.totalSettlementCtrl.open(dic, (ret: { type: PBSettlementResultType, restTime: number }) => {
            if (ret && ret.type != PBSettlementResultType.GO_BACK && ret.restTime > 0) {
                let nextTime = ret.restTime;
                // this.countdown.show(nextTime);
                // this._showMathUIAni(true, nextTime);
                this.scheduleOnce(() => {
                    this.dm.msgHandler.resumeCmd();
                }, nextTime)
            } else {
                this.dm.msgHandler.resumeCmd();
            }
        });

        if (!await PromiseLock.exe(this.delayTime(2))) {
            return;
        }

        this.discardsPool.reset();
        this.dm.tableStatus.reset();
        this.cleanRound();
        this.operate.showChangeBtn(true);
        this.operate.showLeaveBtn(true)
        this.operate.showConfirmBtn(true);
        this.countDown.show(dic.delayTime-2);
        this.playersCtrl.updateCoin();
    }


    confirmBtnClick(){
        this.cleanRound();
        this.totalSettlementCtrl.close(PBSettlementResultType.MANUAL_NEXT);
        this.countDown.show(this.countDown.timelife);
    }

    /**
     * @override
     */
    autoHostChange(dic: any) {
        super.autoHostChange(dic);
        if (this.dm && this.dm.playersDm && this.dm.playersDm.selfInfo) {
            let pvo = this.dm.playersDm.getPlayerByUid(dic.uid);
            if (pvo && this.handCardCtrl) {
                if (pvo == this.dm.playersDm.selfAbsInfo) {
                    this.handCardCtrl && this.handCardCtrl.cancelSelect();
                }
            }
        }
    }


    ///////////////////////////////////////
    async outCard(rawVal: number, card: PBCardItem, needSendCmd = true) {
        await this.discardsPool.addACard(rawVal, null, card);
        this.discardsPool.changeSuit(getPBCardSuit(rawVal));
        if (needSendCmd) {
            if (rawVal === 0x5d || rawVal === 0x5e) {
                this.dm.msgWriter.sendPreDiscard(rawVal);
                // 需要弹选择颜色框
                this.chooseColor.show();
            } else {
                this.dm.msgWriter.sendDiscard(rawVal);
            }
        }
    }
}
