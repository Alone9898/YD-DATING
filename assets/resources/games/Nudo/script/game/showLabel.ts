import LudoMasterLogic from "../LudoMasterLogic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class showDice extends cc.Component {
    @property(cc.Node)
    diceLabel: cc.Node = null;

    id: number = 0;
    _dice: number = 1;

    set dice(value) {
        this._dice = value;
        this.updateView();
    }
    get dice() {
        return this._dice;
    }

    btn_dice: cc.Button = null;

    get facade(): LudoMasterLogic {
        return facade as LudoMasterLogic;
    }

    onLoad() {
        this.diceLabel = cc.find('label', this.node)
        let bBtn = this.node.getComponent(cc.Button)
        if (bBtn) {
            this.node.on('click', this.onClickDice, this)
        }
        this.updateView();
    }

    updateView() {
        this.node.active = this.dice > 0;
        this.diceLabel.getComponent(cc.Label).string = this.dice.toString();
    }

    onClickDice() {
        this.facade.dm.msgWriter.sendMoveDice(cc.vv.UserManager.uid, this.id, this.dice);
        this.facade.tableCtrl.closeAllLight();

    }

    // update (dt) {}
}
