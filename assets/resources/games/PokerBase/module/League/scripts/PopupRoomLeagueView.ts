const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupRoomLeagueView extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;

    @property(cc.SpriteFrame)
    frame_1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    frame_2: cc.SpriteFrame = null;

    private listView: any;
    gameId: number;
    localData: any;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        this.listView = this.listViewNode.getComponent("ListView");
        netListener.registerMsg(MsgId.GET_LEAGUE_INFO, this.GET_LEAGUE_INFO, this);
    }

    onInit(gameid) {
        this.gameId = gameid;
        cc.vv.NetManager.sendAndCache({ c: MsgId.GET_LEAGUE_INFO, gameid: this.gameId });
    }


    GET_LEAGUE_INFO(msg) {
        if (msg.code != 200) return;
        this.localData = msg;
        this.updateView();
    }

    updateView() {
        this.listView.numItems = this.localData.sideUser.length;
        // 找到自己的位置 跳转
        let selfIndex = 0;
        for (let i = 0; i < this.localData.sideUser.length; i++) {
            const data = this.localData.sideUser[i];
            if (data.uid == cc.vv.UserManager.uid) {
                selfIndex = i;
            }
        }
        this.listView.scrollTo(selfIndex, 0, 0.4);
    }

    onUpdateItem(item, index) {
        let data = this.localData.sideUser[index];
        item.getComponent(cc.Sprite).spriteFrame = data.uid == cc.vv.UserManager.uid ? this.frame_2 : this.frame_1;
        cc.find("label_rank", item).getComponent(cc.Label).string = data.rank;
        cc.find("label_name", item).getComponent(cc.Label).string = data.playername;
        cc.find("label_exp", item).getComponent(cc.Label).string = data.score;
    }


}
