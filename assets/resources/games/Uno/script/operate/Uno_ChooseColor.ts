import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { getPBCardVal } from "../../../PokerBase/scripts/card/PBCardData";

const { ccclass, property } = cc._decorator;

/**
 * 叫牌流程
 */
@ccclass
export class UnoChooseColor extends cc.Component {
    @property(cc.Node)
    layout: cc.Node = null;

    protected onLoad(): void {
        for (let i = 0; i < this.layout.childrenCount; i++) {
            cc.find("btn" + (i + 1), this.layout).on("click", () => {
                CommonStyle.fastHide(this.node);
                let targetCard = getPBCardVal(facade.dm.tableStatus.tableCard) + (i + 1) * 16;
                facade.discardsPool.changeToCard(targetCard);
                facade.dm.msgWriter.sendDiscard(targetCard);
                if (facade.dm.playersDm.selfAbsInfo.autoHost) {
                    facade.dm.msgWriter.sendCancleAutoHost();
                }
            });
        }
        this.node.active = false;
    }

    show() {
        CommonStyle.fastShow(this.node);
    }

    hide() {
        CommonStyle.fastHide(this.node);
    }
}