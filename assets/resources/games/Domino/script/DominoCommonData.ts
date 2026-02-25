import { PBTableInfo } from "../../PokerBase/scripts/PBCommonData";

export enum DominoPlayerState {
    Wait = 1,
    Ready = 2,
    Discard = 4
}

export let v_to_h: number = 103;     // 纵向接横向的偏移量
export let v_to_v: number = 137;     // 纵向接纵向的偏移量
export let h_to_v: number = 103;     // 横向接纵向的偏移量
export let h_offset: number = 34;   // 转新列的x偏移量
export let column_offset = 135;      // 列偏移量
export let cornor_offset = 101;      // 转角横牌的x偏移量
export let card_width = 140;         // 牌的宽度
export let h_to_h = 69;             //横向接横向

export let DominoCardCfg = [
    { id: 1, u: 6, l: 6 },
    { id: 2, u: 6, l: 5 },
    { id: 3, u: 6, l: 4 },
    { id: 4, u: 6, l: 3 },
    { id: 5, u: 6, l: 2 },
    { id: 6, u: 6, l: 1 },
    { id: 7, u: 6, l: 0 },
    { id: 8, u: 5, l: 5 },
    { id: 9, u: 5, l: 4 },
    { id: 10, u: 5, l: 3 },
    { id: 11, u: 5, l: 2 },
    { id: 12, u: 5, l: 1 },
    { id: 13, u: 5, l: 0 },
    { id: 14, u: 4, l: 4 },
    { id: 15, u: 4, l: 3 },
    { id: 16, u: 4, l: 2 },
    { id: 17, u: 4, l: 1 },
    { id: 18, u: 4, l: 0 },
    { id: 19, u: 3, l: 3 },
    { id: 20, u: 3, l: 2 },
    { id: 21, u: 3, l: 1 },
    { id: 22, u: 3, l: 0 },
    { id: 23, u: 2, l: 2 },
    { id: 24, u: 2, l: 1 },
    { id: 25, u: 2, l: 0 },
    { id: 26, u: 1, l: 1 },
    { id: 27, u: 1, l: 0 },
    { id: 28, u: 0, l: 0 },
];

export let DominoCardRecorderCfg = [
    [7, 13, 18, 22, 25, 27, 28],
    [6, 12, 17, 21, 24, 26, 27],
    [5, 11, 16, 20, 23, 24, 25],
    [4, 10, 15, 19, 20, 21, 22],
    [3, 9, 14, 15, 16, 17, 18],
    [2, 8, 9, 10, 11, 12, 13],
    [1, 2, 3, 4, 5, 6, 7]
];


/**
 * 桌子静态信息
 */
export class DominoTableInfo extends PBTableInfo {
    /**
     * 是否需要在游戏内匹配
     */
    needMatchInGame() {
        return false;
    }
}