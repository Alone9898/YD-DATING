import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import { PBCardSuitType } from "./PBCardData";
import { PBCardItem } from "./PBCardItem";

const { ccclass, property } = cc._decorator;

/**
 * 一张牌简单的牌 只有数字和花色
 */
@ccclass
export class PBCardItemSimple extends PBCardItem {
    refreshView() {
        if(!this.isLoaded) {
            return;
        }
        if(!this.cardVo) {
            return;
        }

        if(this.cardVo.suit == PBCardSuitType.king) {
            this.iconVal && (this.iconVal.node.active = false);
            this.iconSuitSmall && (this.iconSuitSmall.node.active = false);
            if(this.special_suit) {
                this.special_suit.node.active = true;
                this.special_suit.url = `joker_${this.cardVo.value}`;
            }
        }else {
            this.special_suit && (this.special_suit.node.active = false);
            if(this.iconVal) {
                this.iconVal.node.active = true;
                this.iconVal.url = (this.cardVo.isRed() ? "num_red_" : "num_black_") + this.cardVo.value;
            }
            if(this.iconSuitSmall) {
                this.iconSuitSmall.node.active = true;
                this.iconSuitSmall.url = `suit_${this.cardVo.suit}`;
            }
        }
    }
}