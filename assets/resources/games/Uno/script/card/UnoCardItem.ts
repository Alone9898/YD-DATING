import { PBCardItem } from "../../../PokerBase/scripts/card/PBCardItem";

const { ccclass, property } = cc._decorator;


@ccclass
export class UnoCardItem extends PBCardItem {
    refreshView() {
        if (!this.isLoaded) {
            return;
        }
        if (!this.cardVo) {
            return;
        }
        if (this.fullCard) {
            this.fullCard.url = "uno_" + this.cardVo.raw;
        }
    }
}