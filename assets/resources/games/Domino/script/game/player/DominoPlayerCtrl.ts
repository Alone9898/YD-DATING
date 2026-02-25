import { PBFlowState, PBTableStatus } from "../../../../PokerBase/scripts/PBCommonData";
import { PBPlayerInfoVo } from "../../../../PokerBase/scripts/player/PBPlayerData";
import { PBPlayersCtrl } from "../../../../PokerBase/scripts/player/PBPlayersCtrl";
import { DominoPlayer } from "./DominoPlayer";
import { DominoPlayerInfoVO } from "./DominoPlayerData";

export class DominoPlayersCtrl extends PBPlayersCtrl {
    allPlayers: DominoPlayer[];
    activePlayers: DominoPlayer[];

    getPlayerCmp() {
        return DominoPlayer;
    }

    /** @override */
    initPlayers(pvos: DominoPlayerInfoVO[]) {
        super.initPlayers(pvos);
        if (facade.dm.tableInfo.needSelfReady()) {
            if (facade.dm.tableStatus.currStatus == PBFlowState.match) {
                this.activePlayers.forEach(p => {
                    if (p.playerInfoVo) {
                        p.userInfoCmp.showReadyTip(p.playerInfoVo.isReady);
                    }
                });
            }
        }
    }

    showBanker(bankerUid: number) {
        this.activePlayers.forEach(p => {
            p.showBanker(false);
        });
        let player = this.getPlayerByUid(bankerUid) as DominoPlayer;
        if (player) {
            player.showBanker(true);
        }
    }

    cleanRound() {
        this.hideTimer();
        this.activePlayers.forEach(p => {
            p.dealedCardLen = 0;
            p.userInfoCmp && p.userInfoCmp.showReadyTip(false);
            p.cleanRound();
        });
    }

    /**
     * 显示玩家cd倒计时
     * @param position 
     * @param clock 
     */
    async showTimer(position: number, time = 8) {
        this.hideTimer();
        if (time !== 0) {
            let p = this.activePlayers[position];
            p.showTimer(time);
            // this.showClock(position, facade.clock, time);
            await facade.delayTime(0.2);
        }
    }
}