import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { getPBCardSuit } from "../../../PokerBase/scripts/card/PBCardData";
import { UnoCardItem } from "../card/UnoCardItem";
import { UnoPlayerInfoVo } from "../player/Uno_PlayerData";

const { ccclass, property } = cc._decorator;

/**
 * 叫牌流程
 */
@ccclass
export class UnoChallenge extends cc.Component {
    @property(cc.Node)
    btn_challenge: cc.Node = null;
    @property(cc.Node)
    btn_draw_cards: cc.Node = null;
    @property(cc.RichText)
    desc: cc.RichText = null;

    protected onLoad(): void {
        this.btn_challenge.on("click", () => {
            this.hide();
            facade.dm.msgWriter.sendChallenge(1);
        });

        this.btn_draw_cards.on("click", () => {
            this.hide();
            facade.dm.msgWriter.sendChallenge(0);
        });

        this.node.active = false;
    }

    show(playerVo: UnoPlayerInfoVo) {
        let card = facade.dm.tableStatus.challengeCard;
        let suit = getPBCardSuit(card);
        let color = ["ce3e44", "f6ca5a", "72ab45", "4180be"];
        let name = [___("Red"),
        ___("Yellow"),
        ___("Green"),
        ___("Blue")];
        let str = playerVo.uinfo.uname +
            ___(" played a +4. If you think they have a ") + "<color=#" + color[suit - 1] + ">" + name[suit - 1] + "</c>" +
            ___(" card in their hand, you can challenge them for a change to make them draw cards instead!");
        this.desc.string = str;
        CommonStyle.fastShow(this.node);
    }

    hide() {
        CommonStyle.fastHide(this.node);
    }
}