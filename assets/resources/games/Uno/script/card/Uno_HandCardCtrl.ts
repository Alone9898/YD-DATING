import { getPBCardVal } from "../../../PokerBase/scripts/card/PBCardData";
import { PBHandCard, PBHandCardActionEvt, PBHandCardActionType } from "../../../PokerBase/scripts/card/PBHandCard";

const { ccclass, property } = cc._decorator;


/**
 * 玩家手牌控制器
 */
@ccclass
export class UnoHandCardCtrl extends cc.Component {
    cards_holder: cc.Node = null;
    touch_area: cc.Node = null;
    card_item: cc.Node = null;
    _size: cc.Size = null;
    handCard: PBHandCard = null;
    dealedCardLen: number = 0; // 当前已经发到了第几张牌
    changeHandler: Function = null;
    onLoad() {
        this.cards_holder = this.node.getChildByName("holder");
        this.touch_area = this.node.getChildByName("touch_area");
        this.touch_area.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        this.touch_area.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        this.touch_area.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        this.touch_area.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this);
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.handCard.cancelSelect();
        });
    }

    init(cardItem: cc.Node) {
        this.card_item = cardItem;
        this._size = this.node.getContentSize();
        this.handCard = this.cards_holder.addComponent(PBHandCard);
        this.handCard.init(this._cardGroupHandler.bind(this), this.card_item, this.node.width);
        this.handCard.scale = 1;
    }

    _cardGroupHandler(evt: PBHandCardActionEvt) {
        switch (evt.action) {
            case PBHandCardActionType.select_end:
                if (this.changeHandler) {
                    this.changeHandler();
                }
                break;
            case PBHandCardActionType.card_count_change:
                this._ajustCardGroupContanerPos(true);
                break;
            case PBHandCardActionType.out_card:
                this.outCard(evt.data);
                break;
        }
    }

    /**
     * 出牌
     */
    async outCard(rawVal: number, needSendCmd = true) {
        this.setCanOutCard(false);
        let card = null;
        if (facade.dm.tableStatus.havePreDiscard) {
            card = null;
            facade.dm.tableStatus.havePreDiscard = false;
            facade.discardsPool.showCard(rawVal);
        } else {
            card = this.handCard.getOutCard(rawVal);
            if (!needSendCmd && (getPBCardVal(rawVal) === 0x0d || getPBCardVal(rawVal) === 0x0e) && !card) {
                card = this.handCard.getCard(getPBCardVal(rawVal) + 0x50);
            }
            this.mask([]);
            this.handCard.clearHint();
            if (card) {
                await facade.outCard(rawVal, card, needSendCmd);
                this.handCard.layoutCards(true);
                this._ajustCardGroupContanerPos(true);
            } else {
                facade.dm.tableStatus.havePreDiscard = false;
                facade.discardsPool.showCard(rawVal);
            }
        }

    }

    /**
     * 调整卡堆容器位置
     * @param motionBoo 是否播放动画
     * @private
     */
    _ajustCardGroupContanerPos(motionBoo: boolean) {
        // let endP = cc.v2((this._size.width - this.handCard.w) / 2, this.touch_area.y);
        // if(motionBoo) {
        //     cc.tween(this.handCard.node)
        //         .to(0.2, {x:endP.x, y:endP.y})
        //         .start();
        // }else {
        //     this.handCard.node.x = endP.x;
        //     this.handCard.node.y = endP.y;
        // }
    }

    _onTouchBegan(evt: cc.Event.EventTouch) {
        if (!this.handCard) {
            return;
        }
        this.handCard.touchDown(evt);
    }

    _onTouchMoved(evt: cc.Event.EventTouch) {
        if (!this.handCard) {
            return;
        }
        this.handCard.touchMove(evt);
    }

    _onTouchEnded(evt: cc.Event.EventTouch) {
        if (!this.handCard) {
            return;
        }
        this.handCard.touchEnd(evt);
    }

    _onTouchCancelled(evt: cc.Event.EventTouch) {
        cc.log("_onTouchCancelled==========");
        //this._handCard.cancelSelect();
        this._onTouchEnded(evt);
    }

    //////////////////////////////////////////
    /**
     * 发牌
     */
    dealCards(cards: number[], dealAni: boolean = true, trumpSuit = 0) {
        // this.handCard.node.x = this._size.width/2;
        let cardArr = this.handCard.fillCards(cards, dealAni, trumpSuit);
        this._ajustCardGroupContanerPos(false);
        return cardArr;
    }

    async drawCards(nodes: cc.Node[]) {
        let length = facade.dm.playersDm.selfInfo.handCards.length;
        let cardsVal = facade.dm.playersDm.selfInfo.handCards.slice(length - nodes.length, length);
        cc.log(cardsVal);
        let cardArr = this.dealCards(cardsVal, true);
        for (let i = 0; i < cardArr.length; i++) {
            let card = cardArr[i];
            if (!card.node.parent) {
                return;
            }
            let originPos = card.node["originPos"];
            let pos = card.node.parent.convertToWorldSpaceAR(cc.v2(originPos.x, originPos.y));
            pos = nodes[i].parent.convertToNodeSpaceAR(pos);
            cc.tween(nodes[i])
                .delay(0.05 * i)
                .to(0.2, { x: pos.x, y: pos.y, scale: 1.16, angle: originPos.angle })
                .call(() => {
                    card.holder.active = true;
                    cc.tween(card.holder)
                        .to(0.3, { scale: 1 }, { easing: "backOut" })
                        .start()
                })
                .removeSelf()
                .start();
        }
        await facade.delayTime(0.1);
    }

    /**
     * 发一张牌 用于发牌动画CardStack调用
     * @param nodes 
     */
    async dealARoundCard(nodes: cc.Node[]) {
        let cardsVal = facade.dm.playersDm.selfInfo.handCards.slice(this.dealedCardLen, this.dealedCardLen + nodes.length);
        cc.log(cardsVal);
        this.dealedCardLen += nodes.length;
        let cardArr = this.dealCards(cardsVal, true);
        for (let i = 0; i < cardArr.length; i++) {
            let card = cardArr[i];
            if (!card.node.parent) {
                return;
            }
            let originPos = card.node["originPos"];
            let pos = card.node.parent.convertToWorldSpaceAR(cc.v2(originPos.x, originPos.y));
            pos = nodes[i].parent.convertToNodeSpaceAR(pos);
            cc.tween(nodes[i])
                .delay(0.05 * i)
                .to(0.2, { x: pos.x, y: pos.y, scale: 1.16, angle: originPos.angle })
                .call(() => {
                    card.holder.active = true;
                    cc.tween(card.holder)
                        .to(0.3, { scale: 1 }, { easing: "backOut" })
                        .start()
                })
                .removeSelf()
                .start();
        }
        await facade.delayTime(0.1);
    }

    /**
     * 移除牌
     * @param cards
     */
    // removeCards(cards: number[]) {
    //     if (!this.handCard) {
    //         return;
    //     }
    //     this.handCard.removeCards(cards);
    // }

    /**
     * 取消选择
     * @param resetHintTimes
     */
    cancelSelect() {
        if (!this.handCard) {
            return;
        }
        this.handCard.cancelSelect();
    }

    /**
     * 清空手牌
     */
    clear() {
        if (!this.handCard) {
            return;
        }
        this.handCard.canOutCard = false;
        this.handCard.canOperate = false;
        this.handCard.clearContainer();
    }

    /**
     * 获取选中的牌值
     */
    getSelectedCard() {
        if (!this.handCard) {
            return;
        }
        return this.handCard.getSelectedVal();
    }

    /**
     * 提示
     * @param cards 
     */
    mask(cards: number[]) {
        this.handCard.mask(cards);
    }

    setCanOperate(boo: boolean) {
        if (!this.handCard) {
            return;
        }
        this.handCard.canOperate = boo;
    }

    setCanOutCard(boo: boolean, maskCards: number[] = null) {
        if (!this.handCard) {
            return;
        }
        this.handCard.canOutCard = boo;
        this.handCard.mask(maskCards);

        if (boo && this.handCard.cards.length === 2 && maskCards && maskCards.length !== 2) {
            facade.dm.tableStatus.canChallengeUno = true;
        }
    }

    /**
     * 获取最后一张可打出的牌
     */
    getLastCanOutCard() {
        if (this.handCard) {
            let cards = this.handCard.cards;
            if (cards) {
                for (let i = cards.length - 1; i >= 0; i--) {
                    const c = cards[i];
                    if (!c) {
                        continue;
                    }
                    if (c.mask && !c.mask.active) {
                        let node = c.node;
                        return node.parent.convertToWorldSpace(cc.v2(node.x - node.width / 2 + 20, node.y));
                    }
                }
            }
        }
        return null;
    }
}