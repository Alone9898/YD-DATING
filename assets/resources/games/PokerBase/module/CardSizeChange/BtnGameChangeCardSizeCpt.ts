const { ccclass, property } = cc._decorator;

@ccclass
export class BanakilMenu extends cc.Component {
    @property(cc.Button)
    card_change_btn: cc.Button = null;


    onLoad() {
        this.card_change_btn.node.on("click", () => {
            this.changeCard();
        }, this);
    }

    changeCard() {
        if (facade.dm.cardSizeType == 1) {
            facade.dm.cardSizeType = 0;
        } else {
            facade.dm.cardSizeType = 1;
        }
        Global.saveLocal("SAVE_CARD_SIZE_TYPE", facade.dm.cardSizeType);
        Global.dispatchEvent("EVENT_CARD_SIZE_CHANGE", facade.dm.cardSizeType);
    }

}