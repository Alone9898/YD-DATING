const { ccclass, property } = cc._decorator;

@ccclass
export default class LikeGameCpt extends cc.Component {
    @property(cc.Node)
    gameBtnNodes: cc.Node[] = [];
    onLoad() {
        this.node.active = cc.vv.UserManager.favorite_games.length > 0
        for (let i = 0; i < this.gameBtnNodes.length; i++) {
            const gameBtnNode = this.gameBtnNodes[i];
            let gameid = cc.vv.UserManager.favorite_games[i];
            let bOpen = cc.vv.UserManager.isGameOpen(gameid)
            if (gameid && bOpen) {
                gameid = Number(gameid);
                gameBtnNode.active = true;
                // cc.vv.UserConfig.setGameIconFrame(cc.find("icon", gameBtnNode).getComponent(cc.Sprite), gameid);
                // cc.vv.UserConfig.setGameTitleFrame(cc.find("label", gameBtnNode).getComponent(cc.Sprite), gameid);
                gameBtnNode.getComponent("RoomTypeBtn").gameid = gameid;
                gameBtnNode.getComponent("RoomTypeBtn").updateView()

            } else {
                gameBtnNode.active = false;
            }
        }
    }

    start() {

    }

    // update (dt) {}
}
