import { DominoCardInfoVO } from "./card/DominoCard";

export class DominoTableDataDm {
    tableCards: DominoCardInfoVO[] = [];
    frontPoint: number = -1;    // 头点
    lastPoint: number = -1;     // 尾点

    constructor() {
        this.reset();
    }

    reset() {
        this.tableCards = [];
        this.frontPoint = -1;
        this.lastPoint = -1;
    }

    /**
     * 解析桌面的牌
     * @param cards 
     */
    parseTableCards(cards: any[]) {
        this.tableCards = [];
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            let info = new DominoCardInfoVO();
            info.parse(card);
            this.tableCards.push(info);
        }
    }

    /**
     * 桌面上添加一张牌
     * @param card 
     * @param direction 1接到头，2接到尾
     */
    addTableCard(card: any, direction: number) {
        let info = new DominoCardInfoVO();
        info.parse(card);
        if (direction === 1) {
            this.tableCards.splice(0, 0, info);
        } else {
            this.tableCards.push(info);
        }
    }

    includeCard(id: number): boolean {
        for (const card of this.tableCards) {
            if (card.id === id) {
                return true;
            }
        }
        return false;
    }
}