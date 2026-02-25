// ################################
// 3~15代表扑克牌的3到2 
// 牌用于计算的存储结构
// [
//    0,0,0,
//    0,0,0,0,0,0,0,0,0,0,0,0,0,
// ]
// ################################
/**
 * 获取花色s
 * @param rawCardValue 
 */
export function getPBCardSuit(rawCardValue: number) {
    return rawCardValue >> 4;
}

/**
 * 获取牌值
 * @param rawCardValue 
 */
export function getPBCardVal(rawCardValue: number) {
    return rawCardValue & 0xf;
}

/**
 * 获取牌原始值
 * @param suit 
 * @param value 
 */
export function getPBCardRow(suit: number, value: number) {
    return (suit << 4) | value;
}

/**
 * 花色类型
 */
export enum PBCardSuitType {
    none = 0,    // 无花色
    diamond = 1,    // 方片
    club = 2,    // 梅芳
    heart = 3,    // 红桃
    spade = 4,    // 黑桃
    king = 5,    // king
}

/**
 * 牌的名字
 */
export let PBCardNameMap = {
    1: "A",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
}

/**
 * 牌值转字符串
 */
export function cardsToString(rawVals: number[], needSort = true) {
    rawVals = rawVals.concat();
    if (needSort) {
        rawVals.sort((a, b) => {
            let valA = getPBCardVal(a);
            let valB = getPBCardVal(b);
            if (valA > valB) {
                return -1;
            } else if (valA == valB) {
                return getPBCardSuit(b) - getPBCardSuit(a);
            } else {
                return 1;
            }
        })
    }
    let cardsName: string[] = [];
    rawVals.forEach(v => {
        cardsName.push(PBCardNameMap[getPBCardVal(v)]);
    })
    return cardsName.join("");
}


/**
 * 牌值对象
 */
export class PBCardVo {
    suit: PBCardSuitType = 0; // 花色
    value = 0; // 牌值
    raw = 0; // 原始值
    wildAs: PBCardVo = null; // 癞子变成的牌
    aceAsOne = false; // A 当1用

    /**·
     * 通过原始值初始化
     * @param rawValue 
     */
    initByRawValue(rawValue: number) {
        this.suit = getPBCardSuit(rawValue);
        this.value = getPBCardVal(rawValue);
        this.raw = rawValue;
        return this;
    }

    /**
     * 通过花色排值初始化
     * @param suit 花色
     * @param value 牌值
     */
    initBySuitAndValue(suit: number, value: number) {
        this.suit = suit;
        this.value = value;
        this.raw = getPBCardRow(suit, value);
        return this;
    }

    /**
     * 花色是否是红色
     */
    isRed() {
        return this.suit == PBCardSuitType.diamond || this.suit == PBCardSuitType.heart;
    }

    /**
     * 获取牌值
     */
    getResultVal() {
        if (this.aceAsOne) {
            return 1;
        }
        if (this.wildAs) {
            return this.wildAs.value;
        }
        return this.value;
    }

    /**
     * 获取花色值
     */
    getResultSuit() {
        if (this.wildAs) {
            return this.wildAs.suit;
        }
        return this.suit;
    }
}
