import { PBCardItem } from "../card/PBCardItem";

const { ccclass, property } = cc._decorator;

/**
 * 出牌记录
 */
@ccclass
export class PBTrickRoundCards extends cc.Component {
    @property(cc.Node)
    panel: cc.Node = null;
    @property([PBCardItem])
    cards: PBCardItem[] = [];

    onLoad() {
        this.hide();
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("SWITCH_ROOM_CARD_RECORD", this.SWITCH_ROOM_CARD_RECORD, this)
    }

    SWITCH_ROOM_CARD_RECORD(event) {
        this.node.active = event.detail;
    }

    hide() {
        this.cards && this.cards.forEach(c => {
            c && c.cardBack && (c.cardBack.node.active = true);
        })
    }

    getAllCards() {
        return this.cards;
    }

    show(cardsVals: number[], endPosition = 0) {
        if (!cardsVals || cardsVals.length < 1 || cardsVals.length != this.cards.length) {
            this.hide();
            return;
        }
        this.panel.active = true;
        let len = this.cards.length;
        for (let i = len - 1; i >= 0; i--) {
            if (endPosition < 0) {
                endPosition = len - 1;
            }
            let cardVal = cardsVals[i];
            let card = this.cards[endPosition];
            if (cardVal) {
                // card.node.active = true;
                if (cardVal === -1) {
                    card.node.active = false;
                    card.cardBack.node.active = false;
                } else {
                    card.node.active = true;
                    card.cardBack.node.active = false;
                    card.bind(cardVal)
                }

            } else {
                card.node.active = true;
                card.cardBack.node.active = true;

            }
            endPosition--;
        }
    }
}