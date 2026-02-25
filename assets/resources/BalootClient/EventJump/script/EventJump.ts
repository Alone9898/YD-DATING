const { ccclass, property } = cc._decorator;

/**
 * 跳转指引
 */
@ccclass
export class EventJump extends cc.Component {
    setNodePosition(node: cc.Node) {
        let position = node.convertToWorldSpaceAR(cc.v2(0, 0));
        position = this.node.parent.convertToNodeSpaceAR(position);
        this.node.x = position.x;
        this.node.y = position.y;
        cc.log("jump position", position);
        this.scheduleOnce(() => {
            cc.vv.PopupManager.removeTop();
        }, 3);
    }
}