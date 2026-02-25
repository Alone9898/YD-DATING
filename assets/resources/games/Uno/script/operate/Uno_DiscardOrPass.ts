import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { UnoCardItem } from "../card/UnoCardItem";

const { ccclass, property } = cc._decorator;

/**
 * 叫牌流程
 */
@ccclass
export class UnoDiscardOrPass extends cc.Component {
    @property(cc.Node)
    btn_play: cc.Node = null;
    @property(cc.Node)
    btn_keep: cc.Node = null;
    @property(cc.Node)
    card: cc.Node = null;

    _cardValue: number = 0;


    protected onLoad(): void {
        this.btn_play.on("click", () => {
            this.hide();
            facade.handCardCtrl.outCard(this._cardValue, true);
            // facade.dm.msgWriter.sendDiscard(this._cardValue);
            this._cardValue = 0;
            if (facade.dm.playersDm.selfAbsInfo.autoHost) {
                facade.dm.msgWriter.sendCancleAutoHost();
            }
        });

        this.btn_keep.on("click", () => {
            this.hide();
            facade.dm.msgWriter.sendKeep();
            if (facade.dm.playersDm.selfAbsInfo.autoHost) {
                facade.dm.msgWriter.sendCancleAutoHost();
            }
        });

        this.node.active = false;
    }

    show(rawVal: number) {
        this._cardValue = rawVal;
        this.card.getComponent(UnoCardItem).bind(rawVal);
        CommonStyle.fastShow(this.node);
    }

    hide() {
        CommonStyle.fastHide(this.node);
    }
}