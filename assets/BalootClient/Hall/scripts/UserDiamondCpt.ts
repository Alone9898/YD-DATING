const { ccclass, property } = cc._decorator;

@ccclass
export default class UserDiamondCpt extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    iconNode: cc.Node = null;


    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
