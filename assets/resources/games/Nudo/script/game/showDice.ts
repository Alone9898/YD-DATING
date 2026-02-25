// import LudoMasterLogic from "../LudoMasterLogic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class showDice extends cc.Component {
    @property(cc.Sprite)
    diceSpr: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    diceAtlas: cc.SpriteAtlas = null;
    _diceNum: number = 1;

    onLoad() {
        this.diceSpr = this.node.getComponent(cc.Sprite)
        this.setDiceSkin(0)
    }

    setDiceNum(num: number) {
        this.setDiceSkin(num)
    }

    setDiceSkin(type: number) {
        this._diceNum = type
        this.diceSpr.spriteFrame = this.diceAtlas.getSpriteFrame("dice_0_" + this._diceNum)
    }

}
