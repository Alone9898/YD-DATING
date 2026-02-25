import { PBOperate } from "../../../PokerBase/scripts/operate/PBOperate";
const { ccclass, property } = cc._decorator;

/**
 * 一些通用按钮的操作
 */
@ccclass
export class UnoOperate extends PBOperate {
    @property(cc.Button)
    btn_uno: cc.Button = null;
    @property(cc.Button)
    btn_uno_challenge: cc.Button = null;

    onLoad(): void {
        super.onLoad();

        this.btn_uno.node.on("click", () => {
            if ((facade.dm.playersDm.selfAbsInfo.handCards.length === 2 && facade.dm.tableStatus.canOutCard) || facade.dm.tableStatus.canChallengeUno) {
                facade.dm.msgWriter.sendUno();
            } else {
                cc.vv.FloatTip.show(___("You cannot announce UNO now!"));
            }
        });

        this.btn_uno_challenge.node.on("click", () => {
            if (facade.dm.tableStatus.canChallengeUno) {
                facade.dm.msgWriter.sendUnoChallenge();
            } else {
                cc.vv.FloatTip.show(___("No player forgot to announce UNO!"));
            }
        });
    }

    setBtnUnoInteractable(isOrNot: boolean) {
        this.btn_uno.interactable = isOrNot;
    }

    showUnoBtn() {
        if (facade.dm.tableInfo.isViewer) {
            return;
        }
        this.btn_uno.node.active = true;
        this.btn_uno_challenge.node.active = true;
    }

    hideUnoBtn() {
        this.btn_uno.node.active = false;
        this.btn_uno_challenge.node.active = false;
    }
}