const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutRankCpt extends cc.Component {

    @property(cc.Label)
    label_value: cc.Label = null;
    set rank(value) {
        if (!!value) {
            this.label_value.string = ___("No.{1}", value);
        } else {
            this.label_value.string = "";
        }
    }
    // update (dt) {}
}
