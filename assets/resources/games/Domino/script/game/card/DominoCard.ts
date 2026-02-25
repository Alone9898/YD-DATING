import { PBFlowState } from "../../../../PokerBase/scripts/PBCommonData";
import { DominoLogic } from "../../DominoLogic";
import { DominoTableCard } from "./DominoTableCard";

const { ccclass, property } = cc._decorator;

export class DominoCardInfoVO {
    big: number;      // 较大值
    small: number;      // 较小值
    id: number;     // 唯一id

    parse(msg: any) {
        this.big = msg.u;
        this.small = msg.l;
        this.id = msg.id;
    }
}

@ccclass

export class DominoCard extends cc.Component {
    @property(cc.Node)
    card: cc.Node = null;
    @property(cc.Node)
    upPoint: cc.Node = null;
    @property(cc.Node)
    downPoint: cc.Node = null;
    @property(cc.Animation)
    flopAnimation: cc.Animation = null;
    @property(cc.Node)
    gray: cc.Node = null;

    info: DominoCardInfoVO;

    tempUpTableCard: cc.Node = null;
    tempDownTableCard: cc.Node = null;
    isMoved: boolean = false;

    canSelect: boolean = true;

    hasRaylout: boolean = false;

    touched: boolean = false;

    get facade(): DominoLogic {
        return facade as DominoLogic;
    }

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelled, this);
    }

    init(msg: any) {
        this.info = new DominoCardInfoVO();
        this.info.parse(msg);
        this.setPoint(this.info.big, this.info.small);
    }

    initByInfo(info: DominoCardInfoVO) {
        this.info = info;
        this.setPoint(this.info.big, this.info.small);
    }

    setPoint(down: number, up: number) {
        if (up >= 0 && up <= 6 && down >= 0 && down <= 6) {
            if (up >= 1) {
                this.upPoint.active = true;
                this.upPoint.getComponent("ImgSwitchCmpTS").setIndex(up - 1);
            } else {
                this.upPoint.active = false;
            }

            if (down >= 1) {
                this.downPoint.active = true;
                this.downPoint.getComponent("ImgSwitchCmpTS").setIndex(down - 1);
            } else {
                this.downPoint.active = false;
            }
        } else {
            cc.log("wrong point!!!");
        }
    }

    playFlopAnimation() {
        this.facade.soundMgr.playEffect("eff_shoot_comp");
        this.card.active = false;
        this.flopAnimation.node.active = true;
        this.flopAnimation.play();
        this.flopAnimation.on("finished", () => {
            this.card.active = true;
            this.flopAnimation.node.active = false;
        });
    }

    setGray(isOrNot: boolean) {
        this.gray.active = isOrNot;
        this.setCanSelect(!isOrNot);
    }

    setCanSelect(isOrNot: boolean) {
        this.canSelect = isOrNot;
    }

    onTouchBegan(evt: cc.Event.EventTouch) {
        if (!this.canSelect) {
            return;
        }

        if (!this.facade.tableCtrl.canSelectCard) {
            return;
        }

        if (this.facade.tableCtrl.selectCard) {
            return;
        }

        if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
            return;
        }

        this.touched = true;
        this.node.scale = 1.2;
        this.facade.tableCtrl.selectCard = this.node;
        cc.log("onTouchBegan==============", this.node.uuid);
        this.facade.soundMgr.playEffect("bonecardup");
        this.node.zIndex = 999;


        this.facade.tableCtrl.canSelectCard = false;

        if (this.facade.dm.tableStatus.canOutCard) {
            let upTableCardInfo = this.facade.tableCtrl.caclulateTableCardPosition(true, this.info);
            let endTableCardInfo = this.facade.tableCtrl.caclulateTableCardPosition(false, this.info);
            if (upTableCardInfo) {
                this.tempUpTableCard = this.facade.tableCtrl.generateGrayTableCard({ u: this.info.big, l: this.info.small }, true, upTableCardInfo);
            }

            if (endTableCardInfo) {
                this.tempDownTableCard = this.facade.tableCtrl.generateGrayTableCard({ u: this.info.big, l: this.info.small }, false, endTableCardInfo);
            }
        } else {

        }
    }

    onTouchMoved(evt: cc.Event.EventTouch) {
        if (!this.canSelect) {
            return;
        }

        if (this.facade.tableCtrl.selectCard !== this.node) {
            return;
        }

        if (!this.touched) {
            return;
        }

        if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
            return;
        }


        this.isMoved = true;
        this.facade.tableCtrl.removeHandCards(this.node);

        let pos = this.node.parent.convertToNodeSpaceAR(evt.getLocation());
        this.node.x = pos.x;
        this.node.y = pos.y;

        if (((this.node.y > this.node.parent.height / 2) || (this.node.y < -this.node.parent.height / 2)) && !this.hasRaylout) {
            // 已经出了上边界，牌要重新布局
            cc.log("relayout hand card");
            this.facade.tableCtrl.reLayoutHandCard(false);
            this.hasRaylout = true;
        }

        if (this.facade.dm.tableStatus.canOutCard) {
            if (!this.tempUpTableCard && !this.tempDownTableCard) {
                let upTableCardInfo = this.facade.tableCtrl.caclulateTableCardPosition(true, this.info);
                let endTableCardInfo = this.facade.tableCtrl.caclulateTableCardPosition(false, this.info);
                if (upTableCardInfo) {
                    this.tempUpTableCard = this.facade.tableCtrl.generateGrayTableCard({ u: this.info.big, l: this.info.small }, true, upTableCardInfo);
                }

                if (endTableCardInfo) {
                    this.tempDownTableCard = this.facade.tableCtrl.generateGrayTableCard({ u: this.info.big, l: this.info.small }, false, endTableCardInfo);
                }
            }
            if (this.tempUpTableCard) {
                this.tempUpTableCard.getComponent(DominoTableCard).showCard();
            }
            if (this.tempDownTableCard) {
                this.tempDownTableCard.getComponent(DominoTableCard).showCard();
            }

            let boundingPos = this.node.parent.parent.convertToNodeSpaceAR(evt.getLocation());
            if (this.node.parent.getBoundingBox().contains(boundingPos)) {

            } else {
                let tempPos = this.facade.tableCtrl.groundCardNode.convertToNodeSpaceAR(evt.getLocation());
                if (this.tempUpTableCard && this.tempDownTableCard) {
                    if (tempPos.y >= 0) {
                        if (this.tempDownTableCard.x > 0 && tempPos.x > 0) {
                            this.tempUpTableCard.getComponent(DominoTableCard).hideCard();
                            this.tempDownTableCard.getComponent(DominoTableCard).showCard();
                        } else {
                            this.tempUpTableCard.getComponent(DominoTableCard).showCard();
                            this.tempDownTableCard.getComponent(DominoTableCard).hideCard();
                        }
                    } else {
                        if (this.tempUpTableCard.x < 0 && tempPos.x < 0) {
                            this.tempUpTableCard.getComponent(DominoTableCard).showCard();
                            this.tempDownTableCard.getComponent(DominoTableCard).hideCard();
                        } else {
                            this.tempUpTableCard.getComponent(DominoTableCard).hideCard();
                            this.tempDownTableCard.getComponent(DominoTableCard).showCard();
                        }

                    }
                }
            }
        } else {

        }
    }

    onTouchEnded(evt: cc.Event.EventTouch) {
        // if (!this.canSelect) {
        //     return;
        // }

        cc.log("onTouchEnded==========", this.node.uuid)
        if (!this.touched) {
            return;
        }




        this.touched = false;
        if (this.facade.tableCtrl.selectCard !== this.node) {
            // cc.log("777777777777777777777777777", this.facade.tableCtrl.selectCard);
            // let pos = this.node.parent.convertToNodeSpaceAR(evt.getLocation());
            // this.facade.tableCtrl.reLayoutHandCard(true, pos.x, true, this.node);
            return;
        }

        if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
            return;
        }

        this.node.zIndex = 0;

        if (this.isMoved) {

            this.isMoved = false;
            let pos = this.node.parent.convertToNodeSpaceAR(evt.getLocation());
            let boundingbox = this.node.parent.getBoundingBox();
            let boundingPos = this.node.parent.parent.convertToNodeSpaceAR(evt.getLocation());
            if (this.facade.dm.tableStatus.canOutCard) {
                if (boundingbox.contains(boundingPos)) {
                    this.facade.tableCtrl.reLayoutHandCard(true, pos.x, true);
                    this.scheduleOnce(() => {
                        this.facade.soundMgr.playEffect("bonecarddown");
                    }, 0.3)
                    this.hasRaylout = false;
                    this.cleanGrayTableCard();
                }
                else {
                    if (this.facade.dm.tableStatus.canOutCard) {
                        // 出牌
                        // 如果只能接一边，那么直接出，如果可以接两边，还要判断是接哪一边
                        let tempPos = this.facade.tableCtrl.groundCardNode.convertToNodeSpaceAR(evt.getLocation());
                        if (this.tempUpTableCard && this.tempDownTableCard) {
                            if (tempPos.y >= 0) {
                                if (this.tempDownTableCard.x > 0 && tempPos.x > 0) {
                                    this.facade.userOutCard(this.info.id, 2);
                                } else {
                                    this.facade.userOutCard(this.info.id, 1);
                                }
                            } else {
                                if (this.tempUpTableCard.x < 0 && tempPos.x < 0) {
                                    this.facade.userOutCard(this.info.id, 1);
                                } else {
                                    this.facade.userOutCard(this.info.id, 2);
                                }
                            }
                            this.tempUpTableCard.removeFromParent();
                            this.tempUpTableCard = null;
                            this.tempDownTableCard.removeFromParent();
                            this.tempDownTableCard = null;
                        } else {
                            if (this.tempUpTableCard) {
                                this.facade.userOutCard(this.info.id, 1);
                                this.tempUpTableCard.removeFromParent();
                                this.tempUpTableCard = null;
                            } else if (this.tempDownTableCard) {
                                this.facade.userOutCard(this.info.id, 2);
                                this.tempDownTableCard.removeFromParent();
                                this.tempDownTableCard = null;
                            } else {

                                this.facade.tableCtrl.reLayoutHandCard(true, pos.x, true);
                                this.scheduleOnce(() => {
                                    this.facade.soundMgr.playEffect("bonecarddown");
                                }, 0.3)
                                this.hasRaylout = false;

                            }
                        }
                    } else {

                        this.facade.tableCtrl.reLayoutHandCard(true, pos.x, true);
                        this.scheduleOnce(() => {
                            this.facade.soundMgr.playEffect("bonecarddown");
                        }, 0.3)
                        this.hasRaylout = false;
                        this.cleanGrayTableCard();

                    }
                }
            } else {

                this.facade.tableCtrl.reLayoutHandCard(true, pos.x, true);
                this.scheduleOnce(() => {
                    this.facade.soundMgr.playEffect("bonecarddown");
                }, 0.3)
                this.hasRaylout = false;
            }
        } else {
            this.node.scale = 1;
            this.facade.tableCtrl.selectCard = null;
            cc.log("ended select card = null")
            this.facade.tableCtrl.canSelectCard = true;
            this.cleanGrayTableCard();
        }
    }

    onTouchCancelled(evt: cc.Event.EventTouch) {
        cc.log("_onTouchCancelled==========", this.node.uuid);
        if (!this.touched) {
            return;
        }
        this.touched = false;

        if (this.facade.dm.tableStatus.flowState !== PBFlowState.playing) {
            return;
        }
        //this._handCard.cancelSelect();
        if (this.isMoved) {

            this.isMoved = false;
            let pos = this.node.parent.convertToNodeSpaceAR(evt.getLocation());
            this.facade.tableCtrl.reLayoutHandCard(true, pos.x, true, this.node);
            this.cleanGrayTableCard();
            this.scheduleOnce(() => {
                this.facade.soundMgr.playEffect("bonecarddown");
            }, 0.3)
            this.hasRaylout = false;
        } else {

            this.node.scale = 1;
            this.facade.tableCtrl.selectCard = null;
            this.facade.tableCtrl.canSelectCard = true;
            this.cleanGrayTableCard();
        }
    }

    cleanGrayTableCard() {
        if (this.tempUpTableCard) {
            this.tempUpTableCard.removeFromParent();
            this.tempUpTableCard = null;
        }
        if (this.tempDownTableCard) {
            this.tempDownTableCard.removeFromParent();
            this.tempDownTableCard = null;
        }
    }
}