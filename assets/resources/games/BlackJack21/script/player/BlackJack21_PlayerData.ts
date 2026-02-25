import {PBPlayerInfoVo, PBPlayersDm} from "../../../PokerBase/scripts/player/PBPlayerData";
import {BlackJack21PlayerState} from "../BlackJack21_CommonData";

const {ccclass, property} = cc._decorator;

/**
 * 玩家数据
 */
export class BlackJack21PlayerInfoVo extends PBPlayerInfoVo {
    state : BlackJack21PlayerState;
    round : null;
}

@ccclass
export default class BlackJack21PlayersDm extends PBPlayersDm {
    seatedPlayersInfo: BlackJack21PlayerInfoVo[];
    private _totalChair: number = 5;    // 5个玩家+1个庄家

    public get totalChair(): number {
        return this._totalChair;
    }
    public set totalChair(value: number) {
        this._totalChair = value;
    }

    isSelfBySeat(seatid){
        if (!this.selfInfo) {
            return false;
        }
        return this.selfInfo.seatId == seatid;
    }

}
