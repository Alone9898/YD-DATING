const { ccclass, property } = cc._decorator;

@ccclass
export default class LeagueSpriteTab extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Node)
    upNode: cc.Node = null;

    onLoad() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        // 更新用户信息成功
        eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        this.USER_INFO_CHANGE();
    }

    // 更新VIP进度条
    USER_INFO_CHANGE() {
        let rankData = cc.vv.UserConfig.getRank(cc.vv.UserManager.leagueexp)
        cc.vv.UserConfig.setRankBigFrame(this.icon, rankData.stage);
        if (rankData.next) {
            this.upNode.active = true;
        } else {
            this.upNode.active = false;
        }
    }

}
