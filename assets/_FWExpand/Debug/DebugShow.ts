const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugShow extends cc.Component {

    onLoad() {
        if (this.node.active)
            this.node.active = !CC_BUILD;
    }

}
