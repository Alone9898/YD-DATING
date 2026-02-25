import { PBPlayerInfoVo, PBPlayersDm } from "../../../../PokerBase/scripts/player/PBPlayerData";
import { DominoCard, DominoCardInfoVO } from "../card/DominoCard";

export class DominoPlayerInfoVO extends PBPlayerInfoVo {
    dominoHandCards: DominoCardInfoVO[] = [];
    passCard: number[] = [];
    isNew: number = 0;

    clearRound() {
        this.restCardLen = 0;
        this.dominoHandCards = [];
        this.passCard = [];
    }

    removeCard(id: number) {
        let index = this.dominoHandCards.findIndex((info: DominoCardInfoVO) => {
            return info.id === id;
        });
        if (index !== -1) {
            this.dominoHandCards.splice(index, 1);
        }
    }

    includeCard(id: number): boolean {
        for (const card of this.dominoHandCards) {
            if (card.id === id) {
                return true;
            }
        }
        return false;
    }
}

export class DominoPlayersDm extends PBPlayersDm {
    seatedPlayersInfo: DominoPlayerInfoVO[];
    viewerList: DominoPlayerInfoVO[];
    /**
     * 填充玩家手牌
     * @param position
     * @param cards
     * @param reset
     */
    fillCards(position: number, cards: any[], reset = false) {
        let pvo = this.seatedPlayersInfo[position];
        if (!pvo) {
            return;
        }
        if (reset) {
            pvo.dominoHandCards = [];
            pvo.restCardLen = 0;
        }
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            let info = new DominoCardInfoVO();
            info.parse(card);
            pvo.dominoHandCards.push(info);
        }
        this.seatedPlayersInfo[position].restCardLen += cards.length;
    }


}