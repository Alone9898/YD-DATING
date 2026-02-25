import { UnoPlayer } from "./Uno_Player";
import { PBPlayersCtrl } from "../../../PokerBase/scripts/player/PBPlayersCtrl";
import { UnoPlayerInfoVo } from "./Uno_PlayerData";
import { PBCardItem } from "../../../PokerBase/scripts/card/PBCardItem";
import { PBTableState } from "../../../PokerBase/scripts/PBCommonData";

const { ccclass, property } = cc._decorator;

/**
 * 玩家控制
 */
@ccclass
export class UnoPlayersCtrl extends PBPlayersCtrl {
    allPlayers: UnoPlayer[];
    activePlayers: UnoPlayer[];
    onLoad() {
        super.onLoad();
    }

    /**
     * @override
     */
    getPlayerCmp() {
        return UnoPlayer;
    }

    getPlayerByPosition(position: number) {
        return this.activePlayers[position];
    }

    /**
     * 玩家出牌
     * @param position 
     * @param pd 
     */
    async discardCard(position: number, card: number) {
        let p = this.activePlayers[position];
        let hideCard = p.hideCardCtrl.removeACard();
        let pos = p.getGlobalPos("discard_pos");
        await facade.discardsPool.addACard(card, pos);
    }


    cleanRound() {
        super.cleanRound();
        this.activePlayers.forEach(p => {
            p.setUnoVisible(false);
        });
    }

    /** @override */
    initPlayers(pvos: UnoPlayerInfoVo[]) {
        super.initPlayers(pvos);
        if (facade.dm.tableInfo.needSelfReady()) {
            if (facade.dm.tableStatus.currStatus == PBTableState.MATCH || facade.dm.tableStatus.currStatus == PBTableState.READY || facade.dm.tableStatus.currStatus == PBTableState.GAMEOVER) {
                this.activePlayers.forEach(p => {
                    if (p.playerInfoVo) {
                        p.userInfoCmp.showReadyTip(p.playerInfoVo.isReady);
                    }
                });
            }
        }
    }
}