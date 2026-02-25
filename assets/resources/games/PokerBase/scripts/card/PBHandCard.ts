import { PBCardItem } from "../../../PokerBase/scripts/card/PBCardItem";

const { ccclass, property } = cc._decorator;

/**
 * 操作类型
 */
export enum PBHandCardActionType {
    select_end = 1, // 选择完成
    card_count_change = 2, // 牌张改变
    out_card = 3, // 出牌
}

/**
 * 操作事件
 */
export class PBHandCardActionEvt {
    public action: PBHandCardActionType;
    public setAction(value: PBHandCardActionType) {
        this.action = value;
        return this;
    }
    public data: any;
    public setData(value: any) {
        this.data = value;
        return this;
    }
}

/**
 * 手牌布局配置
 */
let CardLayoutConfig = {
    maxAngle: 5, // 牌间距最大角度
    radius: 2100 // 弧形半径
}

/**
 * 手牌卡堆ui容器组件
 */
@ccclass
export class PBHandCard extends cc.Component {
    _evtHandler: Function;      // 回调
    _maxWidth: number = 720;
    _cards: PBCardItem[];       // 手牌
    _currSelectCard: PBCardItem;   // 当前选中的牌
    _canOperate: boolean;       // 是否可操作
    _canOutCard: boolean;       // 是否出牌
    _cardItemTemplate: cc.Node;  // 单张牌ui
    _cardSize: cc.Size;         // 单张牌的尺寸

    _scale: number = 1;         // 缩放值
    _canMove = false;           // 是否可以移动了
    _moveFlowDiffPos = null;   // 鼠标跟随位置差

    onLoad() {
        this.node.anchorX = 0;
        this.node.anchorY = 1;
        this.clearContainer();
    }

    init(evtHandler: Function, cardItemTemplate: cc.Node, maxWidth: number = 720) {
        this._evtHandler = evtHandler;
        this._cardItemTemplate = cardItemTemplate;
        this._maxWidth = maxWidth - 20;
        this._cardSize = this._cardItemTemplate.getContentSize();
        this._cards = [];
        this._currSelectCard = null;
        this._canOperate = false;
        this._canOutCard = false;
    }

    /**
     * 派发事件
     * @param evt 
     */
    _dispacher(evt: PBHandCardActionEvt) {
        if (this._evtHandler) {
            this._evtHandler(evt);
        }
    }

    /**
     * 通过坐标 映射出 当前所在 牌数组中的下标
     * @param pos 
     */
    chooseCardByPos(pos: cc.Vec2) {
        for (let i = this._cards.length - 1; i >= 0; i--) {
            let card = this._cards[i];
            let node = card.node;
            let nodeAngle = node.angle;
            let sin = Math.sin(-nodeAngle / 180 * Math.PI);
            let cos = Math.cos(-nodeAngle / 180 * Math.PI);
            let x = (pos.x - node.x) * cos - (pos.y - node.y) * sin + node.x;
            let y = (pos.x - node.x) * sin + (pos.y - node.y) * cos + node.y;
            node.angle = 0;
            if (node.getBoundingBox().contains(cc.v2(x, y))) {
                node.angle = nodeAngle;
                return card;
            } else {
                let tempPos = node.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(x, y)));
                if (card.holder.getBoundingBox().contains(tempPos)) {
                    node.angle = nodeAngle;
                    return card;
                }
            }
            node.angle = nodeAngle;
        }
        return null;
    }

    /**
     * 移动手牌手牌向上偏移的距离
     */
    get touchOffsetDistance() {
        // return this.cardSize.height / 2 * 1 / 4;
        return 0;
    }

    touchDown(evt: cc.Event.EventTouch) {
        if (!this._canOperate) {
            return;
        }
        if (this._cards.length < 1) {
            return;
        }
        let pos = this.node.convertToNodeSpaceAR(evt.getLocation());
        let card: PBCardItem = this.chooseCardByPos(pos);
        if (!card) {
            this.cancelSelect();
            return;
        }
        if (this._currSelectCard && this._currSelectCard != card) {
            this.cancelSelect();
        }
        this._canMove = false;
        if (card.mask.active) {
            return;
        }
        this._currSelectCard = card;
        card.toTouchState(true);
        card.setSelect(true, true, false);
    }

    touchMove(evt: cc.Event.EventTouch) {
        if (!this._canOperate) {
            return false;
        }
        if (!this._currSelectCard) {
            return;
        }
        let startPos = this.node.convertToNodeSpaceAR(evt.getStartLocation());
        let pos = this.node.convertToNodeSpaceAR(evt.getLocation());
        if (this._canMove) {
            this._currSelectCard.node.x = pos.x - this._moveFlowDiffPos.x + this._currSelectCard.touchOffsetX;
            this._currSelectCard.node.y = pos.y - this._moveFlowDiffPos.y + this._currSelectCard.touchOffsetY;
            let posCard = this.mapingCardByPos(cc.v2(this._currSelectCard.node.x, pos.y));
            if (posCard && posCard != this._currSelectCard) {
                this._swapCard(posCard, this._currSelectCard);
                this.layoutCards(true);
            }
            if (this._currSelectCard) {
                if (this._currSelectCard.node["inHand"]) {
                    if (this._currSelectCard.node.y > this._cardSize.height) {
                        let angleTw = this._currSelectCard.node["angleTw"];
                        angleTw && angleTw.stop();
                        this._currSelectCard.node["inHand"] = false;
                        angleTw = cc.tween(this._currSelectCard.node)
                            .to(0.2, { angle: 0 })
                            .start();
                        this._currSelectCard.node["angleTw"] = angleTw;
                    }
                } else {
                    if (this._currSelectCard.node.y < this._cardSize.height / 2) {
                        let angleTw = this._currSelectCard.node["angleTw"];
                        angleTw && angleTw.stop();
                        this._currSelectCard.node["inHand"] = true;
                        let originPos = this._currSelectCard.node["originPos"];
                        angleTw = cc.tween(this._currSelectCard.node)
                            .to(0.2, { angle: originPos.angle })
                            .start();
                        this._currSelectCard.node["angleTw"] = angleTw;
                    }
                }
                this._swapClosestCardIndex();
            }
        } else {
            let dis = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
            if (dis >= 5) {
                this._canMove = true;
                this._moveFlowDiffPos = this._currSelectCard.node.convertToNodeSpaceAR(evt.getLocation());
                this._currSelectCard.node.stopAllActions();
                this._currSelectCard.touchOffsetX = 0;
                this._currSelectCard.touchOffsetY = 0;
                cc.tween(this._currSelectCard)
                    .to(0.1, { touchOffsetX: this._moveFlowDiffPos.x, touchOffsetY: this._moveFlowDiffPos.y + this.touchOffsetDistance })
                    .start();
            }
        }
    }

    touchEnd(evt: cc.Event.EventTouch) {
        if (!this._canOperate) {
            return false;
        }
        if (!this._currSelectCard) {
            return;
        }
        let endPos = this.node.convertToNodeSpaceAR(evt.getLocation());
        if (this._canOutCard) {
            if (endPos.y > this._cardSize.height / 2 || (this._currSelectCard.selected && !this._canMove)) {
                let actionEvt = new PBHandCardActionEvt();
                actionEvt.action = PBHandCardActionType.out_card;
                actionEvt.data = this._currSelectCard.cardVo.raw;
                this._dispacher(actionEvt);
            } else {
                if (!this._currSelectCard.selected && !this._canMove) {
                    this._currSelectCard.setSelect(true, false, true);
                    let originPos = this._currSelectCard.node["originPos"];
                    cc.tween(this._currSelectCard.node)
                        .to(0.2, { y: originPos.y })
                        .start();
                } else {
                    this.cancelSelect();
                }
            }
        } else {
            if (!this._currSelectCard.selected && !this._canMove) {
                this._currSelectCard.setSelect(true, false, true);
                let originPos = this._currSelectCard.node["originPos"];
                cc.tween(this._currSelectCard.node)
                    .to(0.2, { y: originPos.y })
                    .start();
            } else {
                this.cancelSelect();
            }
        }

        facade.soundMgr.playBaseEffect("select");
        let actionEvt = new PBHandCardActionEvt();
        actionEvt.action = PBHandCardActionType.select_end;
        this._dispacher(actionEvt);
    }

    /**
     * 交换卡牌
     */
    _swapCard(comparisonOfCard: PBCardItem, selectedCard: PBCardItem) {
        let comparisonOfCardIndex = this._cards.indexOf(comparisonOfCard);
        let selectedCardIndex = this._cards.indexOf(selectedCard);
        this._cards.splice(selectedCardIndex, 1);
        this._cards.splice(comparisonOfCardIndex, 0, selectedCard);
        facade.soundMgr.playBaseEffect("card_swap");
    }

    /**
     * 把选中的牌放到离它最近的牌的上面
     */
    _swapClosestCardIndex() {
        if (!this._currSelectCard) {
            return;
        }
        let rightEdgeAngle = -Math.atan2(this._maxWidth / 2 - this.cardSize.width / 2, CardLayoutConfig.radius + this.cardSize.height / 2) * 180 / Math.PI;
        let leftEdgeAngle = -rightEdgeAngle;
        let cnt = this._cards.length;
        let maxAngleRange = leftEdgeAngle - rightEdgeAngle;
        let angleSpace = 0;
        let angleRange = 0;
        if (cnt > 1) {
            angleSpace = Math.min(maxAngleRange / (cnt - 1), CardLayoutConfig.maxAngle);
            angleRange = angleSpace * (cnt - 1);
        }
        let tempPos = { x: this._currSelectCard.node.x, y: this._currSelectCard.node.y + CardLayoutConfig.radius };
        let currSelectCardAngle = -Math.atan2(tempPos.x, tempPos.y) * 180 / Math.PI;
        if (Math.abs(Math.abs(currSelectCardAngle) - Math.abs(this._currSelectCard.node["originPos"].angle)) < angleSpace / 4) {
            let index = this._cards.indexOf(this._currSelectCard);
            this._currSelectCard.node.zIndex = (index + 1) * 10;
            let nextCard = this._cards[index + 1];
            if (nextCard) {
                nextCard.node.zIndex = (index + 2) * 10;
            }
            return;
        }
        let tempCard: PBCardItem = null;
        let tempDiffAngle = 0;
        for (let i = 0; i < this._cards.length; i++) {
            let card = this._cards[i];
            if (card == this._currSelectCard) {
                continue;
            }
            let diffAngle = Math.abs(currSelectCardAngle - card.node["originPos"].angle);
            if (tempCard) {
                if (diffAngle < tempDiffAngle) {
                    tempCard = card;
                    tempDiffAngle = diffAngle;
                }
            } else {
                tempCard = card;
                tempDiffAngle = diffAngle;
            }
        }
        if (tempCard) {
            if (tempCard.node.zIndex > this._currSelectCard.node.zIndex) {
                this._currSelectCard.node.zIndex = tempCard.node.zIndex + 1;
            }
        }
    }

    /**
     * 获取要出的牌
     */
    getOutCard(raw: number) {
        let card: PBCardItem = null;
        cc.log(this.cards);
        if (this._currSelectCard && this._currSelectCard.cardVo.raw === raw) {
            card = this._currSelectCard;
            this._cards.splice(this._cards.indexOf(card), 1);
        } else {
            for (let i = 0; i < this.cards.length; i++) {
                if (raw == this.cards[i].cardVo.raw) {
                    card = this.cards[i];
                    this._cards.splice(i, 1);
                    break;
                }
            }
        }

        if (this._currSelectCard) {
            if (this._currSelectCard == card) {
                this._currSelectCard.setSelect(false);
                this._currSelectCard = null;
            } else {
                this.cancelSelect();
            }
        }
        cc.log(this.cards);
        return card;
    }

    getCard(raw: number) {
        let card: PBCardItem = null;
        for (let i = 0; i < this.cards.length; i++) {
            if (raw == this.cards[i].cardVo.raw) {
                card = this.cards[i];
                this._cards.splice(i, 1);
                break;
            }
        }
        return card;
    }

    /**
     * 重置选择
     */
    cancelSelect(ani = true) {
        if (this._currSelectCard) {
            this._currSelectCard.toTouchState(false);
            this._currSelectCard.setSelect(false);
            let originPos = this._currSelectCard.node["originPos"];
            if (originPos) {
                if (ani) {
                    cc.tween(this._currSelectCard.node)
                        .to(0.2, { x: originPos.x, y: originPos.y, angle: originPos.angle }, { easing: "quartIn" })
                        .start();
                } else {
                    this._currSelectCard.node.x = originPos.x;
                    this._currSelectCard.node.y = originPos.y;
                    this._currSelectCard.node.angle = originPos.angle;
                }
                this._currSelectCard = null;
            }
        }
        this.updateCardZIndex();
    }

    /**
     * 更新卡牌z坐标
     */
    updateCardZIndex() {
        if (!this._cards) {
            return;
        }
        for (let i = 0; i < this._cards.length; i++) {
            let card = this._cards[i];
            if (!card) {
                continue;
            }
            card.node.zIndex = (i + 1) * 10;
        }
    }

    /**
     * 获取选择的牌值
     */
    getSelectedVal() {
        if (!this._currSelectCard) {
            return 0;
        }
        return this._currSelectCard.cardVo.raw;
    }

    /**
     * 设置牌的mask
     * @param rawCards
     */
    mask(rawCards: number[]) {
        rawCards = rawCards || [];
        let len = this._cards.length;
        for (let i = 0; i < len; i++) {
            let card = this._cards[i];
            card.showMask(rawCards.includes(card.cardVo.raw));
        }
        if (this._currSelectCard && rawCards.includes(this._currSelectCard.cardVo.raw)) {
            this.cancelSelect();
        }
    }

    /**
     * 直接移除手牌
     * @param cards
     */
    removeCards(rawCards: number[], callback?: Function) {
        cc.log(this._cards);
        this.cancelSelect();
        let cardsList = rawCards.concat();
        let cardsRemove: PBCardItem[] = [];
        for (let i = 0; i < this._cards.length; i++) {
            let card = this._cards[i];
            let index = cardsList.indexOf(card.cardVo.raw);
            if (index != -1) {
                cardsList.splice(index, 1);
                cardsRemove.push(this._cards[i]);
                this._cards.splice(i, 1);
                i--;
            }
        }
        if (cardsRemove.length > 0) {
            let endFunc = () => {
                cardsRemove.forEach(element => {
                    element.node.destroy();
                });
                this.layoutCards();
                this._dispacher(new PBHandCardActionEvt().setAction(PBHandCardActionType.card_count_change));
            }
            if (callback) {
                callback(cardsRemove, endFunc);
            } else {
                endFunc();
            }
        }
        cc.log(this._cards);
    }

    /**
     * 提取卡牌的原始值
     * @param cardUiArr
     * @private
     */
    getCardsRawValue(cards: PBCardItem[]) {
        let ret = [];
        for (let i = 0; i < cards.length; i++) {
            ret.push(cards[i].cardVo.raw);
        }
        return ret;
    }

    /**
     * 初始化手牌
     * @param cards 
     * @param ani
     */
    fillCards(cards: number[], ani: boolean, param: any = null) {
        let cardArr: PBCardItem[] = [];
        let len = cards.length;
        for (let i = 0; i < len; i++) {
            let cardUi = cc.instantiate(this._cardItemTemplate);
            cardUi.active = true;
            cardUi.parent = this.node;
            cardUi["inHand"] = true;
            let card = cardUi.getComponent(PBCardItem);
            card.skin = this._cardItemTemplate.getComponent(PBCardItem).skin;
            card.bind(cards[i]);
            if (ani) {
                card.holder.scale = 0;
            }
            cardArr.push(card);
        }
        this._cards = this._cards.concat(cardArr);
        this.sortCard(this._cards, param);
        this.layoutCards(ani);
        return cardArr;
    }

    /**
     * 排序卡牌
     */
    sortCard(cardArr: PBCardItem[], param: any = null) {
        cardArr.sort((a, b) => {
            if (a.cardVo.suit > b.cardVo.suit) {
                return -1;
            } else if (a.cardVo.suit == b.cardVo.suit) {
                return a.cardVo.value - b.cardVo.value;
            } else {
                return 1;
            }
        })
    }

    /**
     * 坐标映射到牌
     */
    mapingCardByPos(pos: cc.Vec2) {
        let rightEdgeAngle = -Math.atan2(this._maxWidth / 2 - this.cardSize.width / 2, CardLayoutConfig.radius + this.cardSize.height / 2) * 180 / Math.PI;
        let leftEdgeAngle = -rightEdgeAngle;
        let cnt = this._cards.length;
        let maxAngleRange = leftEdgeAngle - rightEdgeAngle;
        let angleSpace = 0;
        let angleRange = 0;
        let delta = 0;
        if (cnt > 1) {
            angleSpace = Math.min(maxAngleRange / (cnt - 1), CardLayoutConfig.maxAngle);
            angleRange = angleSpace * (cnt - 1);
        }
        if (angleRange < maxAngleRange) {
            delta = (maxAngleRange - angleRange) / 2;
        }
        let tempPos = { x: pos.x, y: pos.y + CardLayoutConfig.radius }
        let posAngle = -Math.atan2(tempPos.x, tempPos.y) * 180 / Math.PI;
        cc.log("#点击角度#", posAngle);
        let distance = Math.sqrt(Math.pow(tempPos.x, 2) + Math.pow(tempPos.y, 2));
        if (distance < CardLayoutConfig.radius + this.cardSize.height / 2 && distance > CardLayoutConfig.radius - this.cardSize.height / 2) {
            let leftAngle = leftEdgeAngle - delta;
            let rightAngle = rightEdgeAngle + delta;
            if (posAngle > leftAngle + angleSpace / 2) {
                cc.log("#0#");
                return this._cards[0];
            } else if (posAngle <= rightAngle - angleSpace / 2) {
                cc.log(`#${this._cards.length - 1}#`);
                return this._cards[this._cards.length - 1];
            } else {
                cc.log(`#${Math.floor(posAngle / angleSpace)}#`);
                // let index = Math.floor(posAngle / angleSpace);
                // if (index < 0) {
                //     index = 0;
                // }
                for (let i = 0; i < cnt; i++) {
                    let angle = leftEdgeAngle - delta - angleSpace * i;
                    if (posAngle <= angle + angleSpace / 2 && posAngle > angle - angleSpace / 2) {
                        return this._cards[i];
                    }
                }
            }
        } else {
            cc.log("#不在有效区域#");
        }
        return null;
    }

    /**
     * 调整每张卡牌位置
     */
    layoutCards(ani = false) {
        let cards = this._cards;
        let cnt = cards.length;
        if (cnt < 1) {
            return;
        }
        let rightEdgeAngle = -Math.atan2(this._maxWidth / 2 - this.cardSize.width / 2, CardLayoutConfig.radius + this.cardSize.height / 2) * 180 / Math.PI;
        let leftEdgeAngle = -rightEdgeAngle;
        let maxAngleRange = leftEdgeAngle - rightEdgeAngle;
        let angleSpace = 0;
        let angleRange = 0;
        let delta = 0;
        if (cnt > 1) {
            angleSpace = Math.min(maxAngleRange / (cnt - 1), CardLayoutConfig.maxAngle);
            angleRange = angleSpace * (cnt - 1);
        }
        if (angleRange < maxAngleRange) {
            delta = (maxAngleRange - angleRange) / 2;
        }
        let x1 = 0;
        let y1 = CardLayoutConfig.radius;
        let x2 = 0;
        let y2 = 0;
        for (let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            let node = card.node;
            node.zIndex = (i + 1) * 10;
            let angle = leftEdgeAngle - delta - angleSpace * i;
            let sinX = Math.sin(angle / 180 * Math.PI);
            let cosX = Math.cos(angle / 180 * Math.PI);
            let endX = (x1 - x2) * cosX - (y1 - y2) * sinX + x2;
            let endY = (x1 - x2) * sinX + (y1 - y2) * cosX + y2;
            endY -= CardLayoutConfig.radius;
            let originPos = card.node["originPos"] || { x: 0, y: 0, angle: 0 };
            originPos.x = endX;
            originPos.y = endY;
            originPos.angle = angle;
            card.node["originPos"] = originPos;
            let angleTw = node["angleTw"];
            angleTw && angleTw.stop();
            if (card == this._currSelectCard) {
                let angleTw = cc.tween(node)
                    .to(0.3, { angle: angle }, { easing: "cubicOut" })
                    .start();
                node["angleTw"] = angleTw;
                continue;
            }
            if (node.active && ani) {
                cc.tween(node)
                    .to(0.3, { x: endX, y: endY, angle: angle }, { easing: "cubicOut" })
                    .start();
            } else {
                node.x = endX;
                node.y = endY;
                node.angle = angle;
            }
        }
    }

    /**
     * 提示弹起卡牌
     */
    hint(cardsVal: number[]) {
        if (!cardsVal || !this._cards) {
            return;
        }
        this.cancelSelect(false);
        let cards = this._cards.concat();
        cards.forEach(c => {
            if (c) {
                if (cardsVal.includes(c.cardVo.raw)) {
                    c.holder.y += c.selectSpace * 2;
                }
            }
        })
    }

    /**
     * 清除hint提示
     */
    clearHint() {
        this.cards.forEach(c => {
            c.setSelect(false);
        });
    }

    /**
     * 清除牌数据
     */
    clearContainer() {
        this._cards = [];
        this._currSelectCard = null;
        this.node.removeAllChildren();
    }

    public get cards(): PBCardItem[] {
        return this._cards;
    }
    public get canOperate(): boolean {
        return this._canOperate;
    }
    public set canOperate(value: boolean) {
        this._canOperate = value;
    }
    public get cardSize(): cc.Size {
        return this._cardSize;
    }
    public get scale(): number {
        return this._scale;
    }
    public set scale(value: number) {
        this._scale = value;
        this.node.scale = this._scale;
        this._maxWidth = this._maxWidth / this._scale;
    }
    public get canOutCard(): boolean {
        return this._canOutCard;
    }
    public set canOutCard(value: boolean) {
        this._canOutCard = value;
    }
    public get currSelectCard(): PBCardItem {
        return this._currSelectCard
    }
    public set currSelectCard(value: PBCardItem) {
        this._currSelectCard = value
    }
    public get canMove(): boolean {
        return this._canMove
    }
    public set canMove(value: boolean) {
        this._canMove = value
    }
    public get moveFlowDiffPos() {
        return this._moveFlowDiffPos
    }
    public set moveFlowDiffPos(value) {
        this._moveFlowDiffPos = value
    }
    public get evtHandler(): Function {
        return this._evtHandler
    }
    public set evtHandler(value: Function) {
        this._evtHandler = value
    }

}