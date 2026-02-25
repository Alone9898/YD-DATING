const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupGameRecordCpt extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;
    @property(cc.Node)
    noDataNode: cc.Node = null;
    // @property(cc.Sprite)
    // gameIcon: cc.Sprite = null;
    // @property(cc.Label)
    // gameName: cc.Label = null;

    // @property(cc.SpriteAtlas)
    // textureAtlas: cc.SpriteAtlas = null;

    private listView: any;
    private listData: any[] = [];
    onLoad() {
        this.listView = this.listViewNode.getComponent("ListView");
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.GAME_RECORD, this.GAME_RECORD, this);
    }

    onInit(uid, gameid): void {
        cc.vv.NetManager.send({ c: MsgId.GAME_RECORD, ouid: uid, gameid: gameid }, true);

        // cc.vv.UserConfig.setGameCafeFrame(this.gameIcon, gameid);
        // this.gameName.string = cc.vv.UserConfig.getGameName(gameid);

    }


    GAME_RECORD(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        this.listData = msg.records;
        this.updateView();
    }

    updateView() {
        if (this.listData.length <= 0) {
            this.noDataNode.active = true;
        } else {
            this.noDataNode.active = false;
        }
        this.listView.numItems = this.listData.length;
    }

    onUpdateItem(item, index) {
        let recordData = this.listData[index];
        cc.find("roomid/value", item).getComponent(cc.Label).string = recordData.deskid;
        cc.find("time", item).getComponent(cc.Label).string = Global.formatTime("yyyy/MM/dd hh:mm:ss", recordData.create_time + recordData.cost_time);;
        if (recordData.players.length == 4) {
            cc.find("userNodes", item).getComponent(cc.Layout).spacingX = 90
        } else {
            cc.find("userNodes", item).getComponent(cc.Layout).spacingX = 45
        }
        for (let i = 0; i < cc.find("userNodes", item).children.length; i++) {
            const userNode = cc.find("userNodes", item).children[i];
            let playerData = recordData.players[i];
            if (playerData) {
                userNode.active = true;
                if (playerData.uid) {
                    cc.find("none_seat", userNode).active = false;
                    cc.find("node_head", userNode).active = true;
                    cc.find("name", userNode).active = true;
                    cc.find("coin", userNode).active = true;
                    cc.find("node_head", userNode).getComponent('HeadCmp').setHead(playerData.uid, playerData.usericon);
                    cc.find("node_head", userNode).getComponent('HeadCmp').setAvatarFrame(playerData.avatarframe);
                    cc.find("name", userNode).getComponent(cc.Label).string = playerData.playername;
                    let fh = playerData.coin > 0 ? "+" : "";
                    cc.find("coin/value", userNode).getComponent(cc.Label).string = fh + Global.formatNumber(playerData.coin, { threshold: 100000 });
                    if (playerData.coin > 0) {
                        cc.find("coin/value", userNode).color = new cc.Color(180, 253, 207);
                    } else if (playerData.coin < 0) {
                        cc.find("coin/value", userNode).color = new cc.Color(255, 132, 104);
                    } else {
                        cc.find("coin/value", userNode).color = new cc.Color(180, 253, 207);
                    }
                } else {
                    cc.find("none_seat", userNode).active = true;
                    cc.find("node_head", userNode).active = false;
                    cc.find("name", userNode).active = false;
                    cc.find("coin", userNode).active = false;
                }
            } else {
                userNode.active = false;
            }
        }
    }

}
