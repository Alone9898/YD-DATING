const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("兼容/YDApp")
export default class YDAppShow extends cc.Component {
    @property
    reverse = false;

    onLoad() {
        if (!this.reverse) {
            this.node.active = Global.isYDApp();
        } else {
            this.node.active = !Global.isYDApp();
        }
    }
    protected start(): void {
        if (!this.reverse) {
            this.node.active = Global.isYDApp();
        } else {
            this.node.active = !Global.isYDApp();
        }
    }
}
