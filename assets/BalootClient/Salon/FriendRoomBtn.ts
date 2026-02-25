const { ccclass, property } = cc._decorator;

@ccclass
export default class FriendRoomBtn extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null;
    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                Global.dispatchEvent("HALL_OPEN_LEAGUE");
            })
        }
    }

    start() {
    }

    // update (dt) {}
}
