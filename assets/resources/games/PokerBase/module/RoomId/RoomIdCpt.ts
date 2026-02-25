const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomIdCpt extends cc.Component {

    @property(cc.Label)
    label_id: cc.Label = null;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.PULL_SWITCH_TABLE, this.PULL_SWITCH_TABLE, this);
    }

    PULL_SWITCH_TABLE(msg) {
        this.label_id.string = msg.deskinfo.deskid;
    }

    // update (dt) {}
}
