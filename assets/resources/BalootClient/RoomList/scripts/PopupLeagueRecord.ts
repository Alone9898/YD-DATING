const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupLeagueRecord extends cc.Component {

    @property(cc.Node)
    listNode: cc.Node = null;

    private listView: any;
    private listData: any;

    private gameid: number;

    onLoad() {
        let netListener = this.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.LEAGUE_RECORD, this.LEAGUE_RECORD, this);
        this.listView = this.listNode.getComponent("ListView");
    }

    onInit(gameid) {
        this.gameid = gameid;
        cc.vv.NetManager.sendAndCache({ c: MsgId.LEAGUE_RECORD, gameid: this.gameid });
    }


    LEAGUE_RECORD(msg) {
        if (msg.code != 200) return;
        this.listData = msg.datalist;
        this.listView.numItems = this.listData.length;
    }

    onUpdateItem(item, index) {
        let data = this.listData[index];
        cc.find("sort", item).getComponent(cc.Label).string = "s" + data.id;
        let user = data.users[0] || {};
        cc.find("info/name", item).getComponent(cc.Label).string = user.playername;
        // 设置头像
        cc.find("node_head", item).getComponent("HeadCmp").setHead(user.uid, user.avatar || user.usericon);
        cc.find("node_head", item).getComponent("HeadCmp").setAvatarFrame(user.avatarframe);
        // 排位
        let rankData = cc.vv.UserConfig.getRankByLevel(user.leaguelevel)
        cc.vv.UserConfig.setRankFrame(cc.find("valueNode/icon", item).getComponent(cc.Sprite), rankData.stage);
        cc.find("valueNode/label", item).getComponent(cc.Label).string = rankData.text;
    }
}
