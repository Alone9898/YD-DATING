const { ccclass, property } = cc._decorator;

@ccclass
export default class UserCoinCpt extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    iconNode: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
