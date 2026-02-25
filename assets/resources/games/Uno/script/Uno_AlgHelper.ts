import { getPBCardRow, getPBCardSuit, getPBCardVal } from "../../PokerBase/scripts/card/PBCardData";

class _UnoAlgHelper {

    constructor() {

    }

    /**
     * 屏蔽手牌
     * @param showCard 
     * @param selfCards 
     * @returns 
     */
    getMaskCard(showCard: number, selfCards: number[]): number[] {
        let firstCard = showCard;
        let firstCardSuit = getPBCardSuit(firstCard); // 第一张牌的花色
        let firstCardVal = getPBCardVal(firstCard);
        let suitCards = [];     // 第一张牌同花色的牌
        let otherCards = [];    // 和第一张牌不同色的牌
        for (let i = 0; i < selfCards.length; i++) {
            let c = selfCards[i];
            let suit = getPBCardSuit(c);
            let val = getPBCardVal(c)
            if (suit == firstCardSuit || val === firstCardVal) {
                suitCards.push(c);
            } else {
                if (c !== 0x5d && c !== 0x5e) {
                    otherCards.push(c);
                }

            }

        }

        return otherCards;
    };

    sort(cards: number[]) {
        cards.sort((a, b) => {
            let aSuit = getPBCardSuit(a);
            let bSuit = getPBCardSuit(b);
            if (aSuit > bSuit) {
                return 1;
            } else if (aSuit == bSuit) {
                return getPBCardVal(a) - getPBCardVal(b);
            } else {
                return -1;
            }
        })
    }

    /**
     * 获取出牌提示
     */
    getHints(cards: number[]) {
        let arr = [];
        cards.forEach(c => {
            let suit = getPBCardSuit(c);
            if (!arr[suit]) {
                arr[suit] = [];
            }
            arr[suit].push(c);
        })

        let ret = [];
        arr.forEach(row => {
            if (row) {
                this.sort(row);
            }
            ret = ret.concat(row.slice(-2));
        })
        return ret;
    }
}

export let UnoAlgHelper = new _UnoAlgHelper();