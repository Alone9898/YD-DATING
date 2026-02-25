const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomRankCpt extends cc.Component {

    @property([cc.Node])
    userNodes: cc.Node[] = [];

    private gameid: any;
    private netListener: any;

    onLoad() {
        this.netListener = this.addComponent("NetListenerCmp")
    }

    onInit(gameid) {
        this.gameid = gameid;
    }

    protected onOpen(): void {
        this.netListener.registerMsg(MsgId.RANK_THREE_DATA, this.RANK_THREE_DATA, this)
        cc.vv.NetManager.sendAndCache({ c: MsgId.RANK_THREE_DATA, type: 12, gameid: this.gameid });
    }

    protected onClose(): void {
        this.netListener.clear();
    }

    RANK_THREE_DATA(msg) {
        if (msg.code != 200) return;
        if (this.gameid != msg.gameid) return;
        // 设置数据
        let listData = msg.datalist || [];
        for (let i = 0; i < 3; i++) {
            let userNode = this.userNodes[i];
            let userData = listData[i];
            if (userData) {
                userNode.active = true;
                let headCmp = userNode.getComponentInChildren("HeadCmp")
                if (headCmp) {
                    headCmp.setHead(userData.uid, userData.usericon);
                    headCmp.setAvatarFrame(userData.avatarframe);
                }
                cc.find("name/value", userNode).getComponent(cc.Label).string = userData.playername;
                cc.find("coin/value", userNode).getComponent(cc.Label).string = Global.formatNumShort(Math.min(userData.coin, 9999999000000), 1);
            } else {
                userNode.active = false;
            }
        }
    }

}
