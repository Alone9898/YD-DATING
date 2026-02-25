import { PromiseLock } from "../../../../BalootClient/game_common/PromiseLock";
import { PBFlowState, PBTableState } from "../../PokerBase/scripts/PBCommonData";
import PBLogic from "../../PokerBase/scripts/PBLogic";
import { PBPlayersCtrl } from "../../PokerBase/scripts/player/PBPlayersCtrl";
import DominoGameData = require("./DominoGameData");
// import { DominoGameData } from "./DominoGameData";
import { DominoTable } from "./game/DominoTable";
import { DominoPlayer } from "./game/player/DominoPlayer";
import { DominoPlayersCtrl } from "./game/player/DominoPlayerCtrl";
import { DominoPlayerInfoVO } from "./game/player/DominoPlayerData";
import { DominoSoundCtrl } from "./sound/DominoSoundCtrl";
import Table_CountDown from "../../../Table_Common/TableBase/Table_CountDown";

const { ccclass, property } = cc._decorator;

@ccclass
export class DominoLogic extends PBLogic {
    tableCtrl: DominoTable;
    playersCtrl: DominoPlayersCtrl;
    dm: DominoGameData;
    url_rule = "games/Domino/prefab/game_rule";
    otherCardsLen: number = 0;
    countDown: Table_CountDown;


    /**
     * 初始化之前处理
     */
    loadCtrl() {
        super.loadCtrl();
        this.tableCtrl = this.panel.getComponent(DominoTable);
        // 添加声音管理器
        this.panel.addComponent("Table_Sound");
        this.countDown = this.loadCountdown();
    }

    loadPlayersCtrl() {
        return this.panel.addComponent(DominoPlayersCtrl);
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

    /**
     * 音效播放组件
     */
    loadSoundCtrl() {
        return this.panel.addComponent(DominoSoundCtrl);
    }

    cleanRound(bCleanDt=true) {
        this.dm.clearRound();
        this.playersCtrl.cleanRound();
        this.tableCtrl.cleanRound();
        // this.operate.showChangeBtn(false);
        // this.operate.showLeaveBtn(false);
        // this.operate.showConfirmBtn(false);
        this.otherCardsLen = 0;
        if(bCleanDt){   // 结算清桌面不清倒计时、换桌、离桌按钮
            this.countDown.hide();
            this._showMathUIAni(false);
            this.operate.showChangeBtn(false);
            this.operate.showLeaveBtn(false);
            this.operate.showConfirmBtn(false);
        }
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
        this.otherCardsLen = 0;
        this.scheduleOnce(async () => {
            cc.log("entertable domino---------------------------------");
            // cc.find("safe_node/bg_node_yd", this.node).active = Global.isYDApp();

            // 清理数据
            this.playersCtrl.cleanRound();
            this.tableCtrl.cleanRound();


            // 初始化玩家
            let tableStatus = this.dm.tableStatus;
            this.playersCtrl.setChair(this.dm.playersDm.chair);
            this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);

            if (this.dm.tableInfo.needSelfReady()) {
                this.tableCtrl.showRoomInfo(true, this.dm.tableInfo.tableId);
            } else {
                this.tableCtrl.showRoomInfo(false);
            }

            if (this.dm.tableInfo.isViewer === 1 && this.dm.playersDm.selfAbsInfo.seatId < 1) {
                this.viewerList.show(this.dm.playersDm.viewerList);
            } else {
                this.viewerList.hide();
            }

            if (this.dm.deskInfo.dismiss) {
                this.playerApplyDismiss(this.dm.deskInfo.dismiss);
            }

            if (this.dm.playersDm.selfAbsInfo.race_id > 0) {
                cc.vv.NetManager.send({ c: MsgId.GET_MATCH_INFO, race_id: this.dm.playersDm.selfAbsInfo.race_id });
            }

            // 
            let isReconnect = tableStatus.isReconnect;
            // if (isReconnect && this.dm.tableInfo.needSelfReady()) {
            //     isReconnect = tableStatus.currStatus != HandTableState.Match;
            // }
            if (isReconnect) {
                if (this.dm.tableInfo.isViewer === 0) {
                    if (this.dm.playersDm.selfInfo.autoHost) {
                        this.autoHost.show();
                    }
                }
                if (this.dm.tableStatus.currStatus === PBTableState.PLAY) {
                    this.operate.showChangeBtn(false);
                } else {
                    this.operate.showChangeBtn(true);
                }

                cc.log("reconnect state =", this.dm.tableStatus.currStatus);
                if ((this.dm.tableStatus.currStatus === PBTableState.PLAY) || (this.dm.tableStatus.currStatus === PBTableState.SETTLE) || (this.dm.tableStatus.currStatus === PBTableState.READY)) {
                    if (this.dm.tableInfo.isViewer === 0) {
                        this.playersCtrl.hideAllEmptySeat();
                    }

                    if (this.dm.tableStatus.currStatus === PBTableState.PLAY) {
                        this.dm.tableStatus.flowState = PBFlowState.playing;
                    } else if (this.dm.tableStatus.currStatus === PBTableState.SETTLE) {
                        this.dm.tableStatus.flowState = PBFlowState.round_settlement;
                    } else if (this.dm.tableStatus.currStatus === PBTableState.READY) {
                        this.dm.tableStatus.flowState = PBFlowState.ready;
                    }

                    if (this.dm.tableInfo.isViewer === 0) {
                        let dominoHandCards = (this.dm.playersDm.selfInfo as DominoPlayerInfoVO).dominoHandCards;
                        this.tableCtrl.reconnectInitHandCards(dominoHandCards);

                        if (this.dm.playersDm.selfInfo.autoHost) {
                            this.autoHost.show();
                        }
                    }

                    let players = this.dm.playersDm.getPlayesInfo();
                    // 显示剩余手牌 显示godown 的牌
                    for (let i = 0; i < players.length; i++) {
                        let pVo = players[i];
                        let pCtrl = this.playersCtrl.getPlayerByPosition(i) as DominoPlayer;
                        if (pVo && pCtrl && pVo.uid !== cc.vv.UserManager.uid) {
                            pCtrl.setRestCnt(pVo.restCardLen);
                            this.otherCardsLen += pVo.restCardLen;
                            pCtrl.showPass((pVo as DominoPlayerInfoVO).passCard);
                        }
                        // pCtrl.updateCoin(pVo.coin);
                    }

                    if (this.dm.deskInfo.round.dealer) {
                        this.playersCtrl.showBanker(this.dm.deskInfo.round.dealer.uid);
                    }


                    this.tableCtrl.reconnectInitTableCard(this.dm.tableDm.tableCards, this.dm.deskInfo.round.firstCardId);



                    this.scheduleOnce(() => {
                        this.tableCtrl.updateCardRecorder();
                        if (tableStatus.activeSeat) {
                            let delayTime = Math.floor(this.dm.deskInfo.round.delayTime);
                            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(tableStatus.activeSeat).position, delayTime);
                        }

                    });
                } else {
                    if (this.dm.tableInfo.needSelfReady() && this.dm.tableInfo.isViewer === 0) {
                        this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                        this.operate.showInvite(this.dm.playersDm.getPlayerCount() === 1);
                        this.operate.showTableCode(true);
                    }
                }

            } else {
                if (!this.dm.playersDm.seatIsFull()) {
                    cc.log("人数未满进房间");
                }
                if (this.dm.tableInfo.isViewer === 0) {
                    if (this.dm.tableInfo.needSelfReady()) {
                        this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                        this.operate.showInvite(this.dm.playersDm.getPlayerCount() === 1);
                        this.operate.showTableCode(true);

                    } else {
                        // this.countdownStart(null);
                        // if(this.dm.deskInfo.waitTime > 0){
                        //     this._showMathUIAni(true, this.dm.deskInfo.waitTime)
                        // }
                        this.operate.showReady(false);
                        this.operate.showInvite(false);
                        this.dm.tableStatus.flowState = PBFlowState.countdown;
                    }
                }
                this.operate.showChangeBtn(true);
            }

            if (this.dm.tableInfo.isViewer === 0) {
                if (this.dm.tableInfo.needSelfReady()) {
                } else {
                    if(this.dm.deskInfo.waitTime > 0){
                        this._showMathUIAni(true, this.dm.deskInfo.waitTime)
                    }
                }
            }

            this.playersCtrl.showViewerWatingStartTips();
            this.changeSkin();
            // 开始播放命令
            this.scheduleOnce(() => {
                this.dm.msgHandler.startPlayCmd();
            }, 0.5)
        });
    }

    async dealCards(msg: any) {
        this.countDown.hide();
        this._showMathUIAni(false);
        this.operate.showChangeBtn(false);
        this.operate.showConfirmBtn(false);
        this.operate.showLeaveBtn(false);
        
        let cdtime = msg.delayTime >= 0 ? msg.delayTime : 8;
        let activeUid = msg.activeUid;
        this.playersCtrl.ready(-1);
        this.dm.tableStatus.currRound += 1;
        // if (this.dm.tableStatus.currRound === 1) {
            this.minusEntryCoin();
        // }
        this.playersCtrl.showBanker(msg.dealerUid);
        this.operate.showReady(false);
        this.operate.showInvite(false);
        this.operate.showTableCode(false);
        this.dm.tableStatus.flowState = PBFlowState.playing;
        if (this.dm.playersDm.selfAbsInfo.isSeated) {
            this.dm.tableInfo.isViewer = 0;
        }
        this.playersCtrl.showViewerWatingStartTips();
        if (this.dm.tableInfo.isViewer === 0) {
            this.playersCtrl.hideAllEmptySeat();
        } else {
            this.viewerList.updateList(this.dm.playersDm.viewerList);
        }
        // 记录其他玩家的牌
        this.otherCardsLen = 7 * this.dm.playersDm.getPlayerCount();
        await this.tableCtrl.dealCards(msg);
        let activePlayer = this.dm.playersDm.getPlayerByUid(activeUid);
        await this.playersCtrl.showTimer(activePlayer.position, cdtime);
        await this.delayTime(0.2);
        this.dm.msgHandler.resumeCmd();
    }

    async outCard(msg: any) {
        this.playersCtrl.hideTimer();
        let cdtime = msg.delayTime >= 0 ? msg.delayTime : 8;
        let nextUid = msg.nextUid;
        let nextPlayerVo = this.dm.playersDm.getPlayerByUid(nextUid);
        let tableStatus = this.dm.tableStatus;
        this.dm.tableDm.frontPoint = msg.connect[0];
        this.dm.tableDm.lastPoint = msg.connect[1];

        if (msg.uid === cc.vv.UserManager.uid) {
            tableStatus.canOutCard = false;
            this.playersCtrl.getPlayerByUid(msg.uid).userInfoCmp.cleanWarningCallback();
            this.tableCtrl.fingerSpine.node.active = false;
            if (!msg.fight) {
                this.autoHost.show();
                await this.tableCtrl.userOutCardAuto(msg);
            }
            if (!msg.isOver) {
                await this.playersCtrl.showTimer(nextPlayerVo.position, cdtime);
            }
            // await this.delayTime(0.2);
            this.dm.msgHandler.resumeCmd();
            return;
        } else {
            await this.tableCtrl.outCard(msg);
            if (!msg.isOver) {
                await this.playersCtrl.showTimer(nextPlayerVo.position, cdtime);
                if (cc.vv.UserManager.uid === nextUid) {
                    tableStatus.canOutCard = true;
                    this.tableCtrl.getCanOutCard();
                    this.playersCtrl.getPlayerByUid(nextUid).userInfoCmp.setWarningCallback(() => {
                        this.tableCtrl.showFinger();
                    }
                    );
                    // this.tableCtrl.showFinger();
                }
            }
            // await this.delayTime(0.2);
            this.dm.msgHandler.resumeCmd();
        }
    }

    /**
     * 玩家出牌
     */
    async userOutCard(cardId: number, append: number) {
        this.dm.msgHandler.pauseCmd();
        this.dm.msgWriter.sendDiscard(cardId, append);
        await this.tableCtrl.userOutCard(append);
        await this.delayTime(0.2);
        this.dm.msgHandler.resumeCmd();
    }

    async pass(msg: any) {
        let cdtime = msg.delayTime >= 0 ? msg.delayTime : 8;
        let nextUid = msg.nextUid;
        let nextPlayerVo = this.dm.playersDm.getPlayerByUid(nextUid);
        let tableStatus = this.dm.tableStatus;
        for (let i = 0; i < msg.wincoins.length; i++) {
            const wincoin = msg.wincoins[i];
            let pVo = this.dm.playersDm.getPlayerByUid(wincoin.uid);
            pVo.winCoinShow = wincoin.wincoinshow;
        }
        await this.tableCtrl.pass(msg);
        if (msg.uid === cc.vv.UserManager.uid) {
            this.tableCtrl.clearHandCardState();
            this.playersCtrl.getPlayerByUid(msg.uid).userInfoCmp.cleanWarningCallback();
            this.tableCtrl.fingerSpine.node.active = false;
        }
        if (nextUid === cc.vv.UserManager.uid) {
            tableStatus.canOutCard = true;
            await this.playersCtrl.showTimer(nextPlayerVo.position, cdtime);
            this.tableCtrl.getCanOutCard();
            // this.tableCtrl.showFinger();
            this.playersCtrl.getPlayerByUid(nextUid).userInfoCmp.setWarningCallback(() => {
                this.tableCtrl.showFinger();
            });
            await this.delayTime(0.2);
            this.dm.msgHandler.resumeCmd();
        } else {
            await this.playersCtrl.showTimer(nextPlayerVo.position, cdtime);
            tableStatus.canOutCard = false;
            await this.delayTime(0.2);
            this.dm.msgHandler.resumeCmd();
        }
    }

    async gameFinish(msg: any) {
        // this.autoHost.hide();
        // if (!this.dm.tableInfo.isViewer) {
        //     facade.dm.msgWriter.sendCancleAutoHost();
        // }
        this.otherCardsLen = 0;
        this.dm.tableStatus.flowState = PBFlowState.round_settlement;
        if (msg.wincoins) {
            for (let i = 0; i < msg.wincoins.length; i++) {
                const wincoin = msg.wincoins[i];
                let pVo = this.dm.playersDm.getPlayerByUid(wincoin.uid);
                pVo.winCoinShow = wincoin.wincoinshow;
            }
        }
        for (let i = 0; i < msg.settle.length; i++) {
            const settle = msg.settle[i];
            let pVo = this.dm.playersDm.getPlayerByUid(settle.uid);
            pVo.coin = settle.coin;
        }
        this.operate.showChangeBtn(true);
        this.operate.showLeaveBtn(true);
        this.operate.showConfirmBtn(true);
        this.countDown.show(msg.delayTime);
        // this._showMathUIAni(true, msg.delayTime);
        if (!await PromiseLock.exe(this.tableCtrl.gameFinish(msg))) {
            return;
        }

        this.dm.playersDm.clearSeatedFromViewer();
        if (this.dm.playersDm.selfAbsInfo.seatId > 0) {
            this.dm.tableInfo.isViewer = 0;
            this.dm.playersDm.selfInfo = this.dm.playersDm.selfAbsInfo;
            this.viewerList.hide();
        }

        this.cleanRound(false);
        this.dm.msgHandler.resumeCmd();
        this.operate.showConfirmBtn(false);
    }

    confirmBtnClick(){
        PromiseLock.resetLock();
        this.dm.playersDm.clearSeatedFromViewer();
        if (this.dm.playersDm.selfAbsInfo.seatId > 0) {
            this.dm.tableInfo.isViewer = 0;
            this.dm.playersDm.selfInfo = this.dm.playersDm.selfAbsInfo;
            this.viewerList.hide();
        }

        this.cleanRound(false);
        this.tableCtrl.cleanRound();
        this.dm.msgHandler.resumeCmd();
        this.operate.showChangeBtn(false);
        this.operate.showLeaveBtn(false);
        this.operate.showConfirmBtn(false);
        // this.countDown.show(this.countDown.timelife);
    }
}