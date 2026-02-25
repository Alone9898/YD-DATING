/**
 * 游戏状态
 */
import {PBTableStatus} from "../../PokerBase/scripts/PBCommonData";

export enum BlackJack21TableState {
    OTHER = 0,   // 过度状态，无法操作
    MATCH = 1,      // 匹配
    READY = 2,      // 准备
    PLAY = 3,       // 玩牌
    BET = 5,        // 下注
    INSURANCE = 6,  // 选择保险阶段
    SETTLE = 4,     // 结算阶段
}

export enum BlackJack21PlayerState {
    Wait = 1,       //等待状态
    Ready = 2,      //就绪状态(还没轮到操作)
    Bet = 3,        //下注状态
    Insurance = 4,  //选择保险状态（该状态必须选择投保还是拒保）
    Play = 5,       //玩牌状态(该状态可以选择停牌/要牌/加倍/拆牌)
    Stand = 6,      //停牌状态(操作已完成)
}

// 手牌对齐方式
export enum BlackJack21AlignType{
    Left = 0,
    Center = 1,
    Right = 2,
}


export default class BlackJack21TableStatus extends PBTableStatus {
    currState: BlackJack21TableState = 0;    // 当前服务器状态-用于重连

}