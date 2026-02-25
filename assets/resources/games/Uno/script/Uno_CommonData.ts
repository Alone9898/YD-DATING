import { PBTableInfo, PBTableStatus } from "../../PokerBase/scripts/PBCommonData";

/**
 * 玩家状态
 */
export enum UnoUserState {
    Wait = 1,       // 等待状态
    Ready = 2,      // 准备阶段
    Bidding = 3,    // 叫牌阶段
    Discard = 4,    // 出牌阶段
    DiscardOrPass = 17, // pass或者打牌
    WaitChallenge = 18, // 质疑
}

/**
 * 桌子状态
 */
export class UnoTableStatus extends PBTableStatus {
    maskCards: number[] = null;      // 需要屏蔽的牌
    tableCard: number = 0;      // 当前桌面上的牌
    challengeCard: number = 0;      // 需要质疑的牌
    canChallengeUno: boolean = false;   // 是否可以挑战uno
    havePreDiscard: boolean = false;    // 是否已经提前发送命令

    reset() {
        this.dealerUid = 0;
        this.isReconnect = false;
        this.currStatus = 0;         // 当前服务器状态-用于重连
        this.currRound = 0;
        this.canOutCard = false;
        this.isStart = false;
        this.maskCards = null;
        this.tableCard = 0;
        this.challengeCard = 0;
        this.canChallengeUno = false;
        this.havePreDiscard = false;
    }

    /**
     * 重置单局数据
     * @override
     */
    resetRound() {
        super.resetRound();
        this.maskCards = null;
        this.tableCard = 0;
        this.challengeCard = 0;
        this.canChallengeUno = false;
        this.havePreDiscard = false;
    }
}
