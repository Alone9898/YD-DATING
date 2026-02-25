import { PBPlayerInfoVo, PBPlayersDm } from "../../../PokerBase/scripts/player/PBPlayerData";

/**
 * 玩家数据
 */
export class UnoPlayerInfoVo extends PBPlayerInfoVo {
    state: number = 1;           // 当前状态
    uno: boolean = false;
}


export class UnoPlayersDm extends PBPlayersDm {
    seatedPlayersInfo: UnoPlayerInfoVo[];
    allUserMap: Map<number, UnoPlayerInfoVo>;

    getPlayesInfo() {
        return this.seatedPlayersInfo;
    }

    get selfInfo() {
        return this.allUserMap.get(cc.vv.UserManager.uid)
    }

    getPlayerByUid(uid: number): UnoPlayerInfoVo {
        return super.getPlayerByUid(uid) as UnoPlayerInfoVo;
    }

    getPlayerBySeatId(seatId: number): UnoPlayerInfoVo {
        return super.getPlayerBySeatId(seatId) as UnoPlayerInfoVo;
    }
}