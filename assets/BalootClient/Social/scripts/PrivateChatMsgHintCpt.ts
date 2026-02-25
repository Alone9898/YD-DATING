const { ccclass, property } = cc._decorator;

@ccclass
export default class PrivateChatMsgHintCpt extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.Button)
    button2: cc.Button = null;

    private showPos: cc.Vec3;
    private hidePos: cc.Vec3;
    private data: any;

    protected onLoad(): void {
        this.button.node.on("click", this.onClickReply, this);
        this.button2.node.on("click", this.onClickReply, this);
        this.button.interactable = false;
        this.button2.interactable = false;
    }

    run(data) {

        this.data = data;
        this.updateView();

        let safeArea = cc.sys.getSafeAreaRect();
        let topY = cc.winSize.height / 2 - (cc.winSize.height - safeArea.height);
        this.showPos = cc.v3(0, topY - 240 / 2);
        this.hidePos = cc.v3(0, cc.winSize.height / 2 + 240 / 2);
        this.node.position = this.hidePos;
        cc.tween(this.node)
            .to(0.3, { position: this.showPos }, { easing: "quadOut" })
            .call(() => {
                this.button.interactable = true;
                this.button2.interactable = true;
            })
            .delay(2)
            .call(() => {
                this.button.interactable = false;
                this.button2.interactable = false;
            })
            .to(0.3, { position: this.hidePos }, { easing: "quadIn" })
            .call(() => { this.node.destroy(); })
            .start();
    }

    updateView() {
        let item = this.node;
        let data = this.data;
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        // cc.find("online/icon_online", item).active = data.isonline == 1;
        // cc.find("online/icon_offline", item).active = data.isonline == 0;
        // cc.find("time", item).getComponent(cc.Label).string = Global.formatTime("yyyy/MM/dd hh:mm:ss", data.create_time);
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
        let stype = data.type;
        let msgNode = cc.find("msg", item)
        let emojiNode = cc.find("emoji", item)
        msgNode.active = false
        emojiNode.active = false
        if (stype == 1) {
            msgNode.active = true
            let endMsg = data.msg;
            if (!!data.msg && data.msg.length > 15) {
                endMsg = __(data.msg.substring(0, 15), "...")
            }
            msgNode.getComponent(cc.Label).string = endMsg;
        } else if (stype == 2) {
            emojiNode.active = true
            cc.vv.UserConfig.setEmoji(emojiNode.getComponent(sp.Skeleton), data.msg, (skeletonCpt, emojiType) => {
                skeletonCpt.node.scale = 0.25;
                skeletonCpt.node.y = -63;
            });
        }
        if (cc.vv.UserManager.blockuids.indexOf(data.uid) >= 0) {
            msgNode.active = false
            emojiNode.active = false
        }
    }

    onClickReply() {
        cc.vv.EventManager.emit("OPEN_PRIVATE_CHAT_VIEW", { uid: this.data.uid });
        // 停止关闭倒计时
        this.node.stopAllActions();
        // 关闭
        cc.tween(this.node)
            .delay(0.5)
            .to(0.3, { position: this.hidePos }, { easing: "quadIn" })
            .call(() => { this.node.destroy(); })
            .start();
    }

}
