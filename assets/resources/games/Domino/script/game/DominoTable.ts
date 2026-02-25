
import { PromiseLock } from "../../../../../BalootClient/game_common/PromiseLock";
import { PBFlowState, PBRoomType } from "../../../PokerBase/scripts/PBCommonData";
import { PBMenu } from "../../../PokerBase/scripts/widgetplus/PBMenu";
import { card_width, column_offset, cornor_offset, DominoCardCfg, DominoCardRecorderCfg, h_offset, h_to_h, h_to_v, v_to_h, v_to_v } from "../DominoCommonData";
import { DominoLogic } from "../DominoLogic";
import { DominoCard, DominoCardInfoVO } from "./card/DominoCard";
import { DominoTableCard } from "./card/DominoTableCard";
import { DominoPlayer } from "./player/DominoPlayer";
import { DominoPlayerInfoVO } from "./player/DominoPlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export class DominoTable extends cc.Component {
    @property(cc.Node)
    groundCardNode: cc.Node = null;

    @property(cc.Node)
    handCardNode: cc.Node = null;

    @property(cc.Node)
    handCardTemplate: cc.Node = null;

    @property(cc.Node)
    dealCardNode: cc.Node = null;
    @property(cc.Node)
    dealCardTemplate: cc.Node = null;

    @property(cc.Node)
    tableCardTemplate: cc.Node = null;

    @property(cc.Node)
    flyCoinTemplate: cc.Node = null;

    @property(sp.Skeleton)
    paixing: sp.Skeleton = null;

    @property(cc.Node)
    cardRecorder: cc.Node = null;
    @property(cc.Node)
    recorderTips: cc.Node = null;
    @property(cc.Node)
    recorderArrow: cc.Node = null;
    @property(cc.Node)
    recorderLight: cc.Node = null;

    @property(cc.Button)
    btnGoHall: cc.Button = null;
    @property(cc.Button)
    btn_next: cc.Button = null;

    @property(sp.Skeleton)
    fingerSpine: sp.Skeleton = null;

    @property(cc.Node)
    roomInfo: cc.Node = null;
    @property(cc.Label)
    roomId: cc.Label = null;

    // @property(cc.Node)
    // passTips: cc.Node = null;

    @property(cc.Node)
    countDown: cc.Node = null;
    @property(cc.Node)
    countDownCircle: cc.Node = null;
    @property(cc.Label)
    countDownTimer: cc.Label = null;

    @property(sp.Skeleton)
    winSpine: sp.Skeleton = null;

    @property(sp.Skeleton)
    loseSpine: sp.Skeleton = null;

    canOutCard: boolean = false;
    handCards: cc.Node[] = [];
    selectCard: cc.Node = null;

    upCard: cc.Node = null;
    downCard: cc.Node = null;
    upPoint: number = -1;
    downPoint: number = -1;

    canSelectCard: boolean = true;

    _autoNextRoundTime = 6;

    _countDownTimer = 8;

    _dealCardsArray: cc.Node[] = [];

    get facade(): DominoLogic {
        return facade as DominoLogic;
    }

    onLoad() {
        for (let i = 0; i < 7; i++) {
            let node = cc.find("layout/ds_" + i, this.cardRecorder);
            node.on(cc.Node.EventType.TOUCH_START, () => {
                if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
                    return;
                }

                if (this.facade.dm.tableInfo.isViewer) {
                    return;
                }

                this.recorderTips.active = true;
                let pos = node.convertToWorldSpaceAR(cc.v2(0, 0));
                pos = this.recorderArrow.parent.convertToNodeSpaceAR(pos);
                this.recorderArrow.x = pos.x;
                this.recorderLight.x = pos.x;
                for (let j = 0; j < 7; j++) {
                    let card = cc.find("layout/card_" + j, this.recorderTips);
                    let id = DominoCardRecorderCfg[i][j];
                    let info = DominoCardCfg[DominoCardRecorderCfg[i][j] - 1];
                    cc.log("cfg", id, info)
                    cc.find("gray", card).active = (this.facade.dm.tableDm.includeCard(id) || (this.facade.dm.playersDm.selfInfo as DominoPlayerInfoVO).includeCard(id));
                    if (info.l > 0) {
                        cc.find("top", card).active = true;
                        cc.find("top", card).getComponent("ImgSwitchCmpTS").setIndex(info.l - 1);
                    } else {
                        cc.find("top", card).active = false;
                    }

                    if (info.u > 0) {
                        cc.find("bottom", card).active = true;
                        cc.find("bottom", card).getComponent("ImgSwitchCmpTS").setIndex(info.u - 1);
                    } else {
                        cc.find("bottom", card).active = false;
                    }


                }
            });

            node.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
                    return;
                }
                this.recorderTips.active = false;
            });

            node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
                if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
                    return;
                }
                this.recorderTips.active = false;
            });
        }
    }

    showRoomInfo(isVisible: boolean, roomid: number = 0) {
        this.roomInfo.active = isVisible;
        this.roomId.string = roomid.toString();
    }

    init() {

    }

    viewerHide() {
        cc.find("btn_skin", this.node).active = false;
        cc.find("chat", this.node).active = false;
    }

    viewerShow() {
        cc.find("btn_skin", this.node).active = true;
        cc.find("chat", this.node).active = true;
    }

    cleanRound() {
        cc.find("layout", this.handCardNode).removeAllChildren();
        this.groundCardNode.removeAllChildren();
        for (let child of this.dealCardNode.getChildByName("layout").children) {
            child.stopAllActions();
        }
        this.dealCardNode.getChildByName("layout").removeAllChildren();
        this.clearCardRecorder();
        this.handCards = [];
        delete this._dealCardsArray;
        this._dealCardsArray = [];
        this.selectCard = null;
        cc.log("clean round select card = null")
        this.upCard = null;
        this.downCard = null;
        this.upPoint = -1;
        this.downPoint = -1;
        this.groundCardNode.x = 0;
        this.paixing.node.active = false;
    }

    reconnectInitHandCards(handCards: DominoCardInfoVO[]) {
        for (let i = 0; i < handCards.length; i++) {
            let info = handCards[i];
            let handCard = cc.instantiate(this.handCardTemplate);
            handCard.active = true;
            handCard.parent = cc.find("layout", this.handCardNode);
            handCard.x = -handCards.length * card_width / 2 + card_width / 2 + i * card_width;
            handCard.y = 0;
            let script = handCard.getComponent(DominoCard);
            script.initByInfo(info);
            this.handCards.push(handCard);
        }
        if (this.facade.dm.tableStatus.canOutCard) {
            this.getCanOutCard();
        }
    }

    reconnectInitTableCard(tableCards: DominoCardInfoVO[], firstCardId: number) {
        let firstCardIndex = tableCards.findIndex((info: DominoCardInfoVO) => {
            return info.id === firstCardId;
        });
        if (firstCardIndex === -1) {
            return;
        }
        let firstCard = tableCards[firstCardIndex];
        let firstNode = this.getTargetTableCard({ u: firstCard.big, l: firstCard.small, id: firstCard.id }, true).card;
        firstNode.active = true;
        this.upPoint = firstCard.small;
        this.downPoint = firstCard.big;
        for (let i = firstCardIndex - 1; i >= 0; i--) {
            let info = tableCards[i];
            let card = this.getTargetTableCard({ u: info.big, l: info.small, id: info.id }, true).card;
            card.active = true;
            if (card.x < -2 * column_offset && this.groundCardNode.x === 0) {
                this.groundCardNode.x = column_offset;
            }
        }
        for (let i = firstCardIndex + 1; i < tableCards.length; i++) {
            let info = tableCards[i];
            let card = this.getTargetTableCard({ u: info.big, l: info.small, id: info.id }, false).card;
            card.active = true;
            if (card.x > 2 * column_offset && this.groundCardNode.x === 0) {
                this.groundCardNode.x = -column_offset;
            }
        }
    }

    addAHandCard(card: any) {
        let handCard = cc.instantiate(this.handCardTemplate);
        handCard.active = true;
        handCard.parent = cc.find("layout", this.handCardNode);
        handCard.x = -3 * card_width + (cc.find("layout", this.handCardNode).childrenCount - 1) * card_width;
        handCard.y = 0;
        let script = handCard.getComponent(DominoCard);
        script.init(card);
        script.playFlopAnimation();
        this.handCards.push(handCard);
    }

    async dealCards(msg: any) {
        // 发牌动画
        this.recorderTips.active = false;
        cc.find("layout/btn_invite", this.node).active = false;
        this.facade.countdownStop(null);
        // if (this.facade.dm.tableInfo.isViewer === 0) {

        // }
        this.unscheduleAllCallbacks();
        this.countDown && (this.countDown.active = false);
        this.paixing.node.active = false;
        this.btnGoHall.node.active = false;
        this.btn_next.node.active = false;
        this.facade.soundMgr.playEffect("game_start");
        let layout = cc.find("layout", this.dealCardNode);
        layout.removeAllChildren();
        this._dealCardsArray = [];
        for (let i = 0; i < 7 * this.facade.dm.playersDm.getPlayerCount(); i++) {
            let card = cc.instantiate(this.dealCardTemplate);
            card.active = true;
            card.parent = layout;
            card.opacity = 0;
            let endPos = cc.v2(-171 + Math.floor((i > 13 ? i - 14 : i) / 2) * 57 - ((i % 2) === 0 ? 0 : 1),
                (i > 13 ? -65 : 65) + ((i % 2) === 0 ? 0 : 5));
            cc.log(endPos);

            cc.tween(card)
                .delay(0.05 * i)
                .to(0.3, { position: endPos, opacity: 255 })
                .start();
            this._dealCardsArray.push(card);
        }

        await facade.delayTime(1.8);

        this.facade.soundMgr.playEffect("qq_fangqi");
        let banker = this.facade.playersCtrl.getPlayerByUid(msg.dealerUid);
        let seats = [];
        for (let i = 0; i < this.facade.playersCtrl.activePlayers.length; i++) {
            const player = this.facade.playersCtrl.activePlayers[i];
            if (player && player.playerInfoVo) {
                seats.push(player.playerInfoVo.position);
            }
        }
        cc.log(seats);
        let localSeat = banker.playerInfoVo.position;
        let seatIndex = seats.indexOf(localSeat);
        let handCardNum = 0;
        for (let i = this._dealCardsArray.length - 1; i >= 0; i--) {
            let card = this._dealCardsArray[i];
            let endPos;
            let player = this.facade.playersCtrl.getPlayerByPosition(localSeat) as DominoPlayer;
            let copySeat = localSeat;
            let handCardInfo = msg.cards[handCardNum];
            if (localSeat === 0 && this.facade.dm.tableInfo.isViewer === 0) {
                // 飞到手牌
                endPos = cc.find("card_" + (handCardNum + 1), this.handCardNode).convertToWorldSpaceAR(cc.v2(0, 0));
                endPos = card.parent.convertToNodeSpaceAR(endPos);
                handCardNum++;
            } else {
                // 飞到其他玩家
                let restCntNode = player.getRestCntNode();
                endPos = restCntNode.convertToWorldSpaceAR(cc.v2(0, 0));
                endPos = card.parent.convertToNodeSpaceAR(endPos);
            }
            cc.tween(card)
                .delay(0.05 * i)
                .to(0.3, { position: endPos, opacity: 0 })
                .call(() => {
                    if (copySeat === 0 && this.facade.dm.tableInfo.isViewer === 0) {
                        // 展示手牌
                        this.addAHandCard(handCardInfo);
                    } else {
                        // 添加其他玩家的手牌数量
                        player.addACard();
                    }
                })
                .removeSelf()
                .start();
            seatIndex++;
            if (seatIndex > seats.length - 1) {
                seatIndex = 0;
            }
            localSeat = seats[seatIndex];
        }

        await facade.delayTime(1.8);
        this.updateCardRecorder();
        this.facade.dm.tableStatus.canOutCard = msg.dealerUid === cc.vv.UserManager.uid;
    }

    /**
     * 获取能出的牌
     */
    getCanOutCard() {
        let hasCanOutCard = false;
        if (this.facade.dm.tableDm.frontPoint === -1 && this.facade.dm.tableDm.lastPoint === -1) {
            for (let card of this.handCards) {
                card.getComponent(DominoCard).setGray(false);
            }
        } else {
            for (let card of this.handCards) {
                let script = card.getComponent(DominoCard);
                if (script.info.big === facade.dm.tableDm.frontPoint ||
                    script.info.small === facade.dm.tableDm.frontPoint ||
                    script.info.big === facade.dm.tableDm.lastPoint ||
                    script.info.small === facade.dm.tableDm.lastPoint) {
                    script.setGray(false);
                    cc.tween(card)
                        .to(0.1, { scale: 1.1 })
                        .to(0.1, { scale: 1 })
                        .start();
                    hasCanOutCard = true;
                } else {
                    script.setGray(true);
                }
            }

            if (this.selectCard) {
                let script = this.selectCard.getComponent(DominoCard);
                if (script.info.big === facade.dm.tableDm.frontPoint ||
                    script.info.small === facade.dm.tableDm.frontPoint ||
                    script.info.big === facade.dm.tableDm.lastPoint ||
                    script.info.small === facade.dm.tableDm.lastPoint) {
                    script.setGray(false);
                    hasCanOutCard = true;
                } else {
                    cc.log("set gray select card");
                    script.setGray(true);
                }
            }
        }

        if (!hasCanOutCard) {
            for (let card of this.handCards) {
                card.getComponent(DominoCard).setGray(false);
            }
            if (this.selectCard) {
                let script = this.selectCard.getComponent(DominoCard);
                script.setGray(false);
            }
        }
    }

    clearHandCardState() {
        // this.passTips.active = false;
        for (let card of this.handCards) {
            if (card && card.getComponent(DominoCard)) {
                card.getComponent(DominoCard).setGray(false);
            }
        }
    }

    /**
     * 重新布局手牌
     * @param isAdd
     * @param x
     */
    reLayoutHandCard(isAdd: boolean, x: number = 0, needReset: boolean = false, addNode: cc.Node = null) {
        if (isAdd) {
            // 如果是插入手牌，插入的是选中的手牌，要判断插入位置
            let insertIndex = Math.ceil((x - card_width / 2 + this.handCards.length * card_width / 2) / card_width);
            if (insertIndex < 0) {
                insertIndex = 0;
            } else if (insertIndex > this.handCards.length) {
                insertIndex = this.handCards.length;
            }

            if (addNode) {
                if (!this.handCards.includes(addNode) && addNode) {
                    this.handCards.splice(insertIndex, 0, addNode);
                }
            } else {
                if (!this.handCards.includes(this.selectCard) && this.selectCard) {
                    this.handCards.splice(insertIndex, 0, this.selectCard);
                }
            }

            cc.log(this.handCards);

            for (let i = 0; i < this.handCards.length; i++) {
                let card = this.handCards[i];
                cc.tween(card)
                    .to(0.3, { x: -this.handCards.length * card_width / 2 + card_width / 2 + i * card_width, y: 0, scale: 1 })
                    .call(() => {
                        if (needReset) {
                            this.selectCard = null;
                            this.canSelectCard = true;
                            cc.log("tween select card = null")
                        }


                        // card.getComponent(DominoCard).canSelect = true;
                    })
                    .start();
            }
        } else {
            // 移除手牌，所有后面的往前移
            cc.log(this.handCards);
            for (let i = 0; i < this.handCards.length; i++) {
                let card = this.handCards[i];
                cc.tween(card)
                    .to(0.3, { x: -this.handCards.length * card_width / 2 + card_width / 2 + i * card_width, y: 0, scale: 1 })
                    .start();
            }
        }
    }

    removeHandCards(node: cc.Node) {
        if (this.handCards.includes(node)) {
            cc.log("remove hand card", node.uuid, this.handCards);
            this.handCards.splice(this.handCards.indexOf(node), 1);
        }
    }

    outCard(msg: any) {
        return new Promise<void>((success) => {
            // this.facade.soundMgr.playEffect("send_card");
            let outPlayer = facade.playersCtrl.getPlayerByUid(msg.uid);
            if (!outPlayer) {
                success();
                return;
            }
            outPlayer.removeACard();
            let startPos = outPlayer.userInfoCmp.node.convertToWorldSpaceAR(cc.v2(0, 0));
            startPos = this.node.convertToNodeSpaceAR(startPos);
            let tableCard = cc.instantiate(this.tableCardTemplate);
            tableCard.active = true;
            tableCard.parent = this.node;
            tableCard.position = startPos;
            let endInfo = this.getTargetTableCard(msg.card, msg.append === 1);
            if (!endInfo) {
                cc.vv.NetManager.reconnect();
                return;
            }
            tableCard.opacity = 0;
            tableCard.getComponent(DominoTableCard).setPoint(msg.card, 0);
            let endPos = endInfo.card.convertToWorldSpaceAR(cc.v2(0, 0));
            endPos = this.node.convertToNodeSpaceAR(endPos);
            if (endInfo.card.x < -2 * column_offset && this.groundCardNode.x === 0) {
                cc.tween(this.groundCardNode)
                    .by(0.3, { x: column_offset })
                    .start();

                endPos.x += column_offset;
            } else if (endInfo.card.x > 2 * column_offset && this.groundCardNode.x === 0) {
                cc.tween(this.groundCardNode)
                    .by(0.3, { x: -column_offset })
                    .start();

                endPos.x -= column_offset;
            }
            cc.tween(tableCard)
                .parallel(
                    cc.tween().to(0.1, { opacity: 255 }),
                    cc.tween().to(0.3, { position: endPos, angle: endInfo.angle })
                )
                .call(() => {
                    this.facade.soundMgr.playEffect("bonecardtable");
                    endInfo.card.active = true;
                    this.updateCardRecorder();
                    success();
                })
                .removeSelf()
                .start();
        });

    }

    getTargetTableCard(outCard: any, isUp: boolean): any {
        if (!this.upCard && !this.downCard) {
            // 第一张牌
            let card = cc.instantiate(this.tableCardTemplate);
            card.active = false;
            card.parent = this.groundCardNode;
            card.x = 0;
            card.y = 0;
            card.zIndex = -card.y;
            let direction = 0;
            let angle = 0;
            if (outCard.u === outCard.l) {
                direction = 1;
            }
            card.getComponent(DominoTableCard).setPoint(outCard, direction);

            this.upCard = card;
            this.downCard = card;
            // this.facade.dm.tableDm.frontPoint = outCard.l;
            // this.facade.dm.tableDm.lastPoint = outCard.u;
            this.upPoint = outCard.l;
            this.downPoint = outCard.u;
            return { card: card, angle: angle };
        } else {
            // 不是第一张牌，就要判断可以往哪里添加
            if ((outCard.u === this.upPoint || outCard.l === this.upPoint) && (isUp)) {
                // 可以往上接
                let card = cc.instantiate(this.tableCardTemplate);
                card.active = false;
                card.parent = this.groundCardNode;
                let direction = 0;
                if (outCard.u === outCard.l) {
                    direction = 1;
                }
                card.getComponent(DominoTableCard).setPoint(outCard, direction);
                let cardInfo = new DominoCardInfoVO();
                cardInfo.parse(outCard);
                let posInfo = this.caclulateTableCardPosition(true, cardInfo);
                cc.log(posInfo);
                card.x = posInfo.x;
                card.y = posInfo.y;
                card.zIndex = -card.y;
                if (posInfo.angle === 180) {
                    card.getComponent(DominoTableCard).exchange();
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                } else if (posInfo.angle === 90) {
                    card.getComponent(DominoTableCard).setPoint(outCard, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                } else if (posInfo.angle === -90) {
                    card.getComponent(DominoTableCard).setPoint({ u: outCard.l, l: outCard.u, id: outCard.id }, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                } else if (posInfo.angle === 0) {
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                }

                this.upCard = card;
                // this.facade.dm.tableDm.frontPoint = outCard.u === this.upPoint ? outCard.l : outCard.u;
                this.upPoint = outCard.u === this.upPoint ? outCard.l : outCard.u;
                return { card: card, angle: posInfo.angle };
            }

            if (((outCard.u === this.downPoint || outCard.l === this.downPoint)) && !isUp) {
                // 可以往下接
                let card = cc.instantiate(this.tableCardTemplate);
                card.active = false;
                card.parent = this.groundCardNode;
                let direction = 0;
                if (outCard.u === outCard.l) {
                    direction = 1;
                }
                card.getComponent(DominoTableCard).setPoint(outCard, direction);
                let cardInfo = new DominoCardInfoVO();
                cardInfo.parse(outCard);
                let posInfo = this.caclulateTableCardPosition(false, cardInfo);
                cc.log(posInfo);
                card.x = posInfo.x;
                card.y = posInfo.y;
                card.zIndex = -card.y;
                if (posInfo.angle === 180) {
                    card.getComponent(DominoTableCard).exchange();
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                } else if (posInfo.angle === 90) {
                    card.getComponent(DominoTableCard).setPoint(outCard, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                } else if (posInfo.angle === -90) {
                    card.getComponent(DominoTableCard).setPoint({ u: outCard.l, l: outCard.u, id: outCard.id }, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                } else if (posInfo.angle === 0) {
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                    }
                }
                this.downCard = card;
                // this.facade.dm.tableDm.lastPoint = outCard.u === this.downPoint ? outCard.l : outCard.u;
                this.downPoint = outCard.u === this.downPoint ? outCard.l : outCard.u;
                return { card: card, angle: posInfo.angle };
            }
        }
        return null;
    }

    caclulateTableCardPosition(isUp: boolean, info: DominoCardInfoVO): any {
        let x = 0;
        let y = 0;
        let angle = 0;
        let forceVertical = false;
        if (!this.upCard && !this.downCard) {
            return { x: 0, y: 0, angle: info.big === info.small ? 90 : 0 };
        }
        if (isUp) {
            // 往上接，就要判断leftCard的位置
            let upCardInfo = this.upCard.getComponent(DominoTableCard).info;
            if (info.big !== this.upPoint && info.small !== this.upPoint) {
                return null;
            }
            // 上一张牌是同点数牌
            if (upCardInfo.big === upCardInfo.small) {
                // 先判断上一张牌的位置
                if (this.upCard.x % column_offset === 0) {
                    // 是列上的牌，那么就判断是往上还是往下，是否超出了边缘
                    // 大于上边缘
                    if ((this.upCard.y + h_to_v + this.upCard.height / 2 > this.groundCardNode.height / 2) && (Math.abs(this.upCard.x / column_offset) % 2 === 0)) {
                        x = this.upCard.x - cornor_offset;
                        y = this.upCard.y + h_offset;
                        if (info.big === info.small) {
                            angle = 90;
                        } else {
                            if (info.small === upCardInfo.big) {
                                angle = -90;
                            } else {
                                angle = 90;
                            }
                        }
                    } else if ((this.upCard.y - h_to_v - this.upCard.height / 2 < -this.groundCardNode.height / 2) && (Math.abs(this.upCard.x / column_offset) % 2 === 1)) {
                        x = this.upCard.x - cornor_offset;
                        y = this.upCard.y - h_offset;
                        if (info.big === info.small) {
                            angle = 90;
                        } else {
                            if (info.small === upCardInfo.big) {
                                angle = -90;
                            } else {
                                angle = 90;
                            }
                        }
                    } else {
                        x = this.upCard.x;
                        let offset = this.upCard.getComponent(DominoTableCard).direction === 0 ? v_to_v : h_to_v;
                        y = this.upCard.y + (Math.abs(this.upCard.x / column_offset) % 2 === 1 ? (-offset) : offset);
                        if (info.big === upCardInfo.big) {
                            if (Math.abs(this.upCard.x / column_offset) % 2 === 1) {
                                angle = 180;
                            } else {
                                angle = 0;
                            }
                        } else {
                            if (Math.abs(this.upCard.x / column_offset) % 2 === 1) {
                                angle = 0;
                            } else {
                                angle = 180;
                            }
                        }
                    }
                } else {
                    // 拐角的那张牌
                    if (this.upCard.x === -cornor_offset || (this.upCard.x === (-cornor_offset - 2 * column_offset))) {
                        x = this.upCard.x - h_offset;
                        y = this.upCard.y - h_to_v;
                    } else {
                        x = this.upCard.x - h_offset;
                        y = this.upCard.y + h_to_v;
                    }
                    if (info.small === upCardInfo.big) {
                        if (this.upCard.x === -cornor_offset || (this.upCard.x === (-cornor_offset - 2 * column_offset))) {
                            angle = 0;
                        } else {
                            angle = 180;
                        }
                    } else {
                        if (this.upCard.x === -cornor_offset || (this.upCard.x === (-cornor_offset - 2 * column_offset))) {
                            angle = 180;
                        } else {
                            angle = 0;
                        }
                    }
                    forceVertical = true;
                }
            } else {
                // 是不同点数的牌
                if (this.upCard.x % column_offset === 0) {
                    // 是列上的牌，那么就判断是往上还是往下，是否超出了边缘
                    if (info.big === info.small) {
                        // 加的那张牌是同点数牌，还要判断是横着放还是竖着放
                        if ((this.upCard.y + v_to_h + h_to_v + this.upCard.height / 2 > this.groundCardNode.height / 2) && (Math.abs(this.upCard.x / column_offset) % 2 === 0)) {
                            // 超出了上边界
                            x = this.upCard.x - cornor_offset;
                            y = this.upCard.y + h_offset;
                        } else if ((this.upCard.y - v_to_h - h_to_v - this.upCard.height / 2 < -this.groundCardNode.height / 2) && (Math.abs(this.upCard.x / column_offset) % 2 === 1)) {
                            // 超出了下边界
                            x = this.upCard.x - cornor_offset;
                            y = this.upCard.y - h_offset;
                        } else {
                            x = this.upCard.x;
                            y = this.upCard.y + (Math.abs(this.upCard.x / column_offset) % 2 === 1 ? (-h_to_v) : h_to_v);
                        }
                        angle = 90;
                    } else {
                        // 加的是竖的牌就只需要判断是否超边界
                        if ((this.upCard.y + v_to_v + this.upCard.height / 2 > this.groundCardNode.height / 2) && (Math.abs(this.upCard.x / column_offset) % 2 === 0)) {
                            // 超出了上边界
                            x = this.upCard.x - cornor_offset;
                            y = this.upCard.y + h_offset;
                            if (info.big === this.upPoint) {
                                angle = 90;
                            } else {
                                angle = -90;
                            }
                        } else if ((this.upCard.y - v_to_v - this.upCard.height / 2 < -this.groundCardNode.height / 2) && (Math.abs(this.upCard.x / column_offset) % 2 === 1)) {
                            // 超出了下边界
                            x = this.upCard.x - cornor_offset;
                            y = this.upCard.y - h_offset;
                            if (info.big === this.upPoint) {
                                angle = 90;
                            } else {
                                angle = -90;
                            }
                        } else {
                            x = this.upCard.x;
                            y = this.upCard.y + (Math.abs(this.upCard.x / column_offset) % 2 === 1 ? (-v_to_v) : v_to_v);
                            if (info.big === this.upPoint) {
                                angle = (Math.abs(this.upCard.x / column_offset) % 2 === 0 ? 0 : 180);
                            } else {
                                angle = (Math.abs(this.upCard.x / column_offset) % 2 === 0 ? 180 : 0);
                            }
                        }
                    }
                } else {
                    // 拐角的那张牌
                    if (this.upCard.x === -cornor_offset || (this.upCard.x === (-cornor_offset - 2 * column_offset))) {
                        x = this.upCard.x - h_offset;
                        y = this.upCard.y - h_to_v;
                        if (info.big === this.upPoint) {
                            if (this.upCard.x === -cornor_offset || (this.upCard.x === (-cornor_offset - 2 * column_offset))) {
                                angle = 180;
                            } else {
                                angle = 0;
                            }
                        } else {
                            if (this.upCard.x === -cornor_offset || (this.upCard.x === (-cornor_offset - 2 * column_offset))) {
                                angle = 0;
                            } else {
                                angle = 180;
                            }
                        }
                    } else {
                        x = this.upCard.x - h_offset;
                        y = this.upCard.y + h_to_v;
                        if (info.big === this.upPoint) {
                            angle = 0;
                        } else {
                            angle = 180;
                        }
                    }
                    forceVertical = true;
                }
            }
        } else {
            // 往下接，就要判断leftCard的位置
            let downCardInfo = this.downCard.getComponent(DominoTableCard).info;
            if (info.big !== this.downPoint && info.small !== this.downPoint) {
                return null;
            }
            // 上一张牌是同点数牌
            if (downCardInfo.big === downCardInfo.small) {
                // 先判断上一张牌的位置
                if (this.downCard.x % column_offset === 0) {
                    // 是列上的牌，那么就判断是往上还是往下，是否超出了边缘
                    // 大于上边缘
                    if ((this.downCard.y + h_to_v + this.downCard.height / 2 > this.groundCardNode.height / 2) && (Math.abs(this.downCard.x / column_offset) % 2 === 1)) {
                        x = this.downCard.x + cornor_offset;
                        y = this.downCard.y + h_offset;
                        if (info.big === this.downPoint) {
                            angle = -90;
                        } else {
                            angle = 90;
                        }
                    } else if ((this.downCard.y - h_to_v - this.downCard.height / 2 < -this.groundCardNode.height / 2) && (Math.abs(this.downCard.x / column_offset) % 2 === 0)) {
                        x = this.downCard.x + cornor_offset;
                        y = this.downCard.y - h_offset;
                        if (info.big === this.downPoint) {
                            angle = -90;
                        } else {
                            angle = 90;
                        }
                    } else {
                        x = this.downCard.x;
                        let offset = this.downCard.getComponent(DominoTableCard).direction === 0 ? v_to_v : h_to_v;
                        y = this.downCard.y + (Math.abs(this.downCard.x / column_offset) % 2 === 1 ? offset : -offset);
                        if (info.big === this.downPoint) {
                            if (Math.abs(this.downCard.x / column_offset) % 2 === 1) {
                                angle = 0
                            } else {
                                angle = 180;
                            }
                        } else {
                            if (Math.abs(this.downCard.x / column_offset) % 2 === 1) {
                                angle = 180
                            } else {
                                angle = 0;
                            }
                        }
                    }
                } else {
                    // 拐角的那张牌
                    if (this.downCard.x === cornor_offset || (this.downCard.x === (cornor_offset + 2 * column_offset))) {
                        x = this.downCard.x + h_offset;
                        y = this.downCard.y + h_to_v;
                        if (info.big === this.downPoint || (this.downCard.x === (cornor_offset + 2 * column_offset))) {
                            angle = 0;
                        } else {
                            angle = 180;
                        }
                    } else {
                        x = this.downCard.x + h_offset;
                        y = this.downCard.y - h_to_v;
                        if (info.big === this.downPoint || (this.downCard.x === (cornor_offset + 2 * column_offset))) {
                            angle = 180;
                        } else {
                            angle = 0;
                        }
                    }
                    forceVertical = true;
                }
            } else {
                // 是不同点数的牌
                if (this.downCard.x % column_offset === 0) {
                    // 是列上的牌，那么就判断是往上还是往下，是否超出了边缘
                    if (info.big === info.small) {
                        // 加的那张牌是同点数牌，还要判断是横着放还是竖着放
                        if ((this.downCard.y + v_to_h + h_to_v + this.downCard.height / 2 > this.groundCardNode.height / 2) && (Math.abs(this.downCard.x / column_offset) % 2 === 1)) {
                            // 超出了上边界
                            x = this.downCard.x + cornor_offset;
                            y = this.downCard.y + h_offset;
                            angle = 0;
                        } else if ((this.downCard.y - v_to_h - h_to_v - this.downCard.height / 2 < -this.groundCardNode.height / 2) && (Math.abs(this.downCard.x / column_offset) % 2 === 0)) {
                            // 超出了下边界
                            x = this.downCard.x + cornor_offset;
                            y = this.downCard.y - h_offset;
                            angle = 0;
                        } else {
                            x = this.downCard.x;
                            y = this.downCard.y + (Math.abs(this.downCard.x / column_offset) % 2 === 1 ? h_to_v : -h_to_v);
                            angle = 90;
                        }
                    } else {
                        // 加的是竖的牌就只需要判断是否超边界
                        if ((this.downCard.y + v_to_v + this.downCard.height / 2 > this.groundCardNode.height / 2) && (Math.abs(this.downCard.x / column_offset) % 2 === 1)) {
                            // 超出了上边界
                            x = this.downCard.x + cornor_offset;
                            y = this.downCard.y + h_offset;
                            if (info.big === this.downPoint) {
                                angle = -90;
                            } else {
                                angle = 90;
                            }
                        } else if ((this.downCard.y - v_to_v - this.downCard.height / 2 < -this.groundCardNode.height / 2) && (Math.abs(this.downCard.x / column_offset) % 2 === 0)) {
                            // 超出了下边界
                            x = this.downCard.x + cornor_offset;
                            y = this.downCard.y - h_offset;
                            if (info.big === this.downPoint) {
                                angle = -90;
                            } else {
                                angle = 90;
                            }
                        } else {
                            x = this.downCard.x;
                            y = this.downCard.y + (Math.abs(this.downCard.x / column_offset) % 2 === 1 ? v_to_v : -v_to_v);
                            if (info.big === this.downPoint) {
                                if (Math.abs(this.downCard.x / column_offset) % 2 === 1) {
                                    angle = 0;
                                } else {
                                    angle = 180;
                                }
                            } else {
                                if (Math.abs(this.downCard.x / column_offset) % 2 === 1) {
                                    angle = 180;
                                } else {
                                    angle = 0;
                                }
                            }
                        }
                    }
                } else {
                    // 拐角的那张牌
                    if (this.downCard.x === cornor_offset || (this.downCard.x === (cornor_offset + 2 * column_offset))) {
                        x = this.downCard.x + h_offset;
                        y = this.downCard.y + h_to_v;
                        if (info.big === this.downPoint || (this.downCard.x === (cornor_offset + 2 * column_offset))) {
                            angle = 0;
                        } else {
                            angle = 180;
                        }
                    } else {
                        x = this.downCard.x + h_offset;
                        y = this.downCard.y - h_to_v;
                        if (info.big === this.downPoint || (this.downCard.x === (cornor_offset + 2 * column_offset))) {
                            angle = 180;
                        } else {
                            angle = 0;
                        }
                    }
                    forceVertical = true;
                }
            }
        }
        return { x: x, y: y, angle: angle, forceVertical: forceVertical };
    }

    generateGrayTableCard(outCard: any, isUp: boolean, posInfo: any): cc.Node {
        if (!this.upCard && !this.downCard) {
            // 第一张牌
            let card = cc.instantiate(this.tableCardTemplate);
            card.active = true;
            card.parent = this.groundCardNode;
            card.x = 0;
            card.y = 0;
            let direction = 0;
            if (outCard.u === outCard.l) {
                direction = 1;
            }
            card.getComponent(DominoTableCard).setPoint(outCard, direction);
            card.getComponent(DominoTableCard).setKuang(true, direction);
            return card;
        } else {
            // 不是第一张牌，就要判断可以往哪里添加
            if ((outCard.u === this.upPoint || outCard.l === this.upPoint) && (isUp)) {
                // 可以往上接
                let card = cc.instantiate(this.tableCardTemplate);
                card.active = true;
                card.parent = this.groundCardNode;
                let direction = 0;
                if (outCard.u === outCard.l) {
                    direction = 1;
                }
                card.getComponent(DominoTableCard).setPoint(outCard, direction);
                let cardInfo = new DominoCardInfoVO();
                cardInfo.parse(outCard);
                card.x = posInfo.x;
                card.y = posInfo.y;
                card.getComponent(DominoTableCard).setKuang(true, direction);
                if (posInfo.angle === 180) {
                    card.getComponent(DominoTableCard).exchange();
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                } else if (posInfo.angle === 90) {
                    card.getComponent(DominoTableCard).setPoint(outCard, 1);
                    card.getComponent(DominoTableCard).setKuang(true, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                } else if (posInfo.angle === -90) {
                    card.getComponent(DominoTableCard).setPoint({ u: outCard.l, l: outCard.u, id: outCard.id }, 1);
                    card.getComponent(DominoTableCard).setKuang(true, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                } else if (posInfo.angle === 0) {
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                }


                return card;
            }

            if (((outCard.u === this.downPoint || outCard.l === this.downPoint)) && !isUp) {
                // 可以往下接
                let card = cc.instantiate(this.tableCardTemplate);
                card.active = true;
                card.parent = this.groundCardNode;
                let direction = 0;
                if (outCard.u === outCard.l) {
                    direction = 1;
                }
                card.getComponent(DominoTableCard).setPoint(outCard, direction);
                let cardInfo = new DominoCardInfoVO();
                cardInfo.parse(outCard);
                card.x = posInfo.x;
                card.y = posInfo.y;
                card.getComponent(DominoTableCard).setKuang(true, direction);
                if (posInfo.angle === 180) {
                    card.getComponent(DominoTableCard).exchange();
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                } else if (posInfo.angle === 90) {
                    card.getComponent(DominoTableCard).setPoint(outCard, 1);
                    card.getComponent(DominoTableCard).setKuang(true, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                } else if (posInfo.angle === -90) {
                    card.getComponent(DominoTableCard).setPoint({ u: outCard.l, l: outCard.u, id: outCard.id }, 1);
                    card.getComponent(DominoTableCard).setKuang(true, 1);
                    if (posInfo.forceVertical) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                } else if (posInfo.angle === 0) {
                    if (posInfo.forceVertical && direction === 1) {
                        card.getComponent(DominoTableCard).setPoint(outCard, 0);
                        card.getComponent(DominoTableCard).setKuang(true, 0);
                    }
                }

                return card;
            }
        }
        return null;
    }

    async userOutCard(append: number) {
        // this.facade.soundMgr.playEffect("send_card");
        this.fingerSpine.node.active = false;
        let info = this.selectCard.getComponent(DominoCard).info;
        let posInfo = this.caclulateTableCardPosition(append === 1, info);
        let card = append === 1 ? this.selectCard.getComponent(DominoCard).tempUpTableCard : this.selectCard.getComponent(DominoCard).tempDownTableCard;
        let endPos = card.convertToWorldSpaceAR(cc.v2(0, 0));
        endPos = this.selectCard.parent.convertToNodeSpaceAR(endPos);
        if (card.x < -2 * column_offset && this.groundCardNode.x === 0) {
            cc.tween(this.groundCardNode)
                .by(0.3, { x: column_offset })
                .start();

            endPos.x += column_offset;
        } else if (card.x > 2 * column_offset && this.groundCardNode.x === 0) {
            cc.tween(this.groundCardNode)
                .by(0.3, { x: -column_offset })
                .start();

            endPos.x -= column_offset;
        }
        cc.tween(this.selectCard)
            .to(0.3, { position: endPos, angle: posInfo.angle, scale: 0.5 })
            .removeSelf()
            .start();
        let tableCard = this.getTargetTableCard({ u: info.big, l: info.small, id: info.id }, append === 1).card;

        await this.facade.delayTime(0.3);
        tableCard.active = true;
        this.facade.soundMgr.playEffect("bonecardtable");
        cc.log("out card select card = null")
        this.selectCard = null;
        this.canSelectCard = true;
        await this.facade.delayTime(0.2);
        this.clearHandCardState();
    }

    async userOutCardAuto(msg: any) {
        return new Promise<void>((success) => {
            // this.facade.soundMgr.playEffect("send_card");
            this.fingerSpine.node.active = false;

            if (this.selectCard) {
                this.selectCard.getComponent(DominoCard).cleanGrayTableCard();
            }

            let card = null;
            for (let node of this.handCards) {
                if (node.getComponent(DominoCard).info.id === msg.card.id) {
                    card = node;
                    break;
                }
            }
            if (card === null && this.selectCard && this.selectCard.getComponent(DominoCard).info.id === msg.card.id) {
                card = this.selectCard;
            }
            if (card === null) {
                success();
                return;
            }



            let endInfo = this.getTargetTableCard(msg.card, msg.append === 1);
            if (!endInfo) {
                cc.vv.NetManager.reconnect();
                success();
                return;
            }
            let endPos = endInfo.card.convertToWorldSpaceAR(cc.v2(0, 0));
            endPos = card.parent.convertToNodeSpaceAR(endPos);
            if (endInfo.card.x < -2 * column_offset && this.groundCardNode.x === 0) {
                cc.tween(this.groundCardNode)
                    .by(0.3, { x: column_offset })
                    .start();

                endPos.x += column_offset;
            } else if (endInfo.card.x > 2 * column_offset && this.groundCardNode.x === 0) {
                cc.tween(this.groundCardNode)
                    .by(0.3, { x: -column_offset })
                    .start();

                endPos.x -= column_offset;
            }

            cc.tween(card)
                .parallel(
                    cc.tween().to(0.1, { opacity: 255 }),
                    cc.tween().to(0.3, { position: endPos, angle: endInfo.angle })
                )
                .call(() => {
                    if (this.handCards.includes(card)) {
                        this.handCards.splice(this.handCards.indexOf(card), 1);
                    }
                    this.reLayoutHandCard(false);
                    endInfo.card.active = true;
                    this.facade.soundMgr.playEffect("bonecardtable");
                    this.updateCardRecorder();
                    this.selectCard = null;
                    this.canSelectCard = true;
                    this.clearHandCardState();
                    success();
                })
                .removeSelf()
                .start();
        });
    }

    async pass(msg: any) {
        let startPlayerUid = msg.uid;
        let endPlayerUid = msg.receive.uid;
        if (startPlayerUid === cc.vv.UserManager.uid) {
            Global.dispatchEvent("USER_PIGGY_BANK_HINT");
        }
        let coin = msg.coin;
        let usercoin = msg.usercoin;
        let winnercoin = msg.receive.coin;
        let startPlayer = this.facade.playersCtrl.getPlayerByUid(startPlayerUid) as DominoPlayer;
        let endPlayer = this.facade.playersCtrl.getPlayerByUid(endPlayerUid) as DominoPlayer;
        startPlayer.playerInfoVo.coin = usercoin;
        endPlayer.playerInfoVo.coin = winnercoin;
        startPlayer.playPass(msg.passCard);
        let startPlayerInfo = startPlayer.playerInfoVo;
        this.facade.soundMgr.playEffect("pass");

        startPlayer.playBeKilledAnimation();
        endPlayer.playKilledAnimation();
        // if (startPlayerInfo.uinfo.gender === 1) {
        //     // 男
        //     this.facade.soundMgr.playEffect("male_pass");
        // } else {
        //     this.facade.soundMgr.playEffect("female_pass");
        // }
        let startPos = startPlayer.addCoin.convertToWorldSpaceAR(cc.v2(0, 0));
        startPos = this.node.convertToNodeSpaceAR(startPos);
        let endPos = endPlayer.addCoin.convertToWorldSpaceAR(cc.v2(0, 0));
        endPos = this.node.convertToNodeSpaceAR(endPos);
        await this.facade.delayTime(1);
        this.facade.soundMgr.playEffect("Ckk_coinfly");
        // startPlayer.updateCoin(usercoin);
        for (let i = 0; i < 6; i++) {
            let coin = cc.instantiate(this.flyCoinTemplate);
            coin.active = true;
            coin.parent = this.node;

            coin.x = startPos.x;
            coin.y = startPos.y;
            coin.getComponent(cc.Animation).play();
            cc.tween(coin)
                .delay(i * 0.1)
                .to(0.5, { position: endPos })
                .removeSelf()
                .start();
        }
        await this.facade.delayTime(0.5);
        endPlayer.playCoinChange(coin, false);
        this.facade.playersCtrl.updateCoin();
        // endPlayer.updateCoin(winnercoin);
        await this.facade.delayTime(1.5);
    }

    async gameFinish(msg: any) {
        let players = msg.settle;
        if (!await PromiseLock.exe(this.facade.playersCtrl.flyCoinByTeams(players))) {
            return;
        }

        let rp = 0;
        let exp = 0;
        let league = 0;
        let settle = msg.settle;
        for (let i = 0; i < settle.length; i++) {
            let result = settle[i];
            if (result.uid === cc.vv.UserManager.uid) {
                rp = result.addrp;
                exp = result.addexp;
                league = result.leagueexp;
                break;
            }
        }

        if (!await PromiseLock.exe(this.facade.delayTime(1.5))) {
            return;
        }

        this.facade.soundMgr.playEffect("Dam_win");
        let animationNames = ["single_dead", "single", "double", "triple", "quartet", "qunitet"];
        this.paixing.node.active = true;
        this.paixing.setAnimation(0, "eff_paixing_" + animationNames[msg.mult], false);



        if (!await PromiseLock.exe(this.facade.delayTime(1))) {
            return;
        }

        // this.facade.playersCtrl.playInfoChange(exp, rp, league);

        if (this.facade.dm.tableInfo.isViewer === 0) {
            // this.btnGoHall.node.active = true;
            // this.btn_next.node.active = true;
            // this.btnGoHall.node.off("click");
            // this.btnGoHall.node.on("click", () => {
            //     this.btnGoHall.node.off("click");
            //     cc.find("menu", this.node).getComponent(PBMenu).askExit();
            // });
            // this.btn_next.node.off("click");
            // this.btn_next.node.on("click", () => {
            //     this.btn_next.node.off("click");
            //     this.btnGoHall.node.active = false;
            //     this.btn_next.node.active = false;
            //     this.facade.cleanRound();
            //     this.paixing.node.active = false;
            //     if (this.facade.dm.tableInfo.roomType == PBRoomType.friend && this.facade.dm.tableStatus.isPlaying) {
            //         this.facade.dm.msgWriter.sendReady();
            //     }
            // });
            // this._showAutoNextRoundTip(msg.delayTime - 4);
            // this.gameStartCountDown();
        } else {
            this.facade.cleanRound();
            this.paixing.node.active = false;
        }

        if (!await PromiseLock.exe(this.facade.delayTime(2))) {
            return;
        }
    }

    gameStartCountDown() {
        cc.find("parent", this.countDown).active = false;
        this.unscheduleAllCallbacks();
        this._gameStartTick();
    }

    _gameStartTick() {
        this.countDownTimer.string = this._countDownTimer.toString();
        if (this._countDownTimer > 0) {
            cc.log("timer = ", this._countDownTimer);
            if (this._countDownTimer <= 3) {
                cc.find("parent", this.countDown).active = true;
            }
            if (this._countDownTimer === 3) {
                cc.tween(this.countDownCircle)
                    .repeatForever(cc.tween().by(1, { angle: 360 }))
                    .start();
            }
            this.scheduleOnce(() => {
                this._countDownTimer--;
                this._gameStartTick();
            }, 1)
        } else {
            cc.find("parent", this.countDown).active = false;
        }
    }

    /**
     * 显示自动开始提示
     */
    _showAutoNextRoundTip(time = 6) {
        this._autoNextRoundTime = time;
        this._countDownTimer = time;
        let label = cc.find("title", this.btn_next.node).getComponent(cc.Label);
        label.unscheduleAllCallbacks();
        this._tick();
    }

    _tick() {
        let label = cc.find("title", this.btn_next.node).getComponent(cc.Label);
        label.string = ___("NEXT({1})", this._autoNextRoundTime);
        if (this._autoNextRoundTime > 0) {
            label.scheduleOnce(() => {
                this._autoNextRoundTime--;
                this._tick();
            }, 1);
        } else {
            this.btnGoHall.node.off("click");
            this.btn_next.node.off("click");
            this.btnGoHall.node.active = false;
            this.btn_next.node.active = false;
            this.paixing.node.active = false;
            let roomType = this.facade.dm.tableInfo.roomType;
            if (roomType == PBRoomType.friend) {
                this.facade.dm.msgWriter.sendReady();
            }
        }
    }

    updateCardRecorder() {
        let num = [8, 8, 8, 8, 8, 8, 8];
        for (let card of this.facade.dm.tableDm.tableCards) {
            num[card.big]--;
            num[card.small]--;
        }

        if (this.facade.dm.tableInfo.isViewer === 0 && (this.facade.dm.playersDm.selfInfo as DominoPlayerInfoVO).dominoHandCards) {
            for (let card of (this.facade.dm.playersDm.selfInfo as DominoPlayerInfoVO).dominoHandCards) {
                num[card.big]--;
                num[card.small]--;
            }
        }

        for (let i = 0; i < num.length; i++) {
            let count = num[i];
            if (count < 0) {
                count = 0;
            }
            cc.find("layout/ds_" + i + "/num", this.cardRecorder).getComponent(cc.Label).string = count.toString();
        }
    }

    clearCardRecorder() {
        for (let i = 0; i < 7; i++) {
            cc.find("layout/ds_" + i + "/num", this.cardRecorder).getComponent(cc.Label).string = "0";
        }
    }

    showFinger() {
        let playerInfo = this.facade.dm.playersDm.selfInfo as DominoPlayerInfoVO;
        let firstCard = null;
        for (let card of this.handCards) {
            let script = card.getComponent(DominoCard);
            if (!script.gray.active) {
                firstCard = card;
                break;
            }
        }

        if (playerInfo.isNew === 1 && firstCard) {
            let times = cc.sys.localStorage.getItem("DominoFingerTimes");
            let pos = firstCard.convertToWorldSpaceAR(cc.v2(0, 0));
            cc.log("pos");
            pos = this.fingerSpine.node.parent.convertToNodeSpaceAR(pos);
            if (times !== null) {
                if (times < 3) {
                    this.fingerSpine.node.active = true;
                    this.fingerSpine.setAnimation(0, "animation4", true);
                    this.fingerSpine.node.x = pos.x;
                    times++;
                    cc.sys.localStorage.setItem("DominoFingerTimes", times);
                } else {
                    this.fingerSpine.node.active = false;
                }
            } else {
                times = 1;
                this.fingerSpine.node.active = true;
                this.fingerSpine.node.x = pos.x;
                this.fingerSpine.setAnimation(0, "animation4", true);
                cc.sys.localStorage.setItem("DominoFingerTimes", times);
            }
        } else {
            this.fingerSpine.node.active = false;
        }
    }
}