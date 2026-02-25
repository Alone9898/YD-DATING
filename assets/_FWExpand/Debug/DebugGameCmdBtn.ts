const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class DebugGameCmdBtn extends cc.Component {

    @property
    cmd = "";

    onLoad() {
        this.node.on("click", () => {
            cc.vv.EventManager.emit("DEBUG_GAME_CMD", this.cmd);
        });
    }

}
