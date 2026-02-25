import { PBUserInfoVo } from "../../PokerBase/scripts/player/PBPlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeenPattiCompareCpt extends cc.Component {

    @property(cc.Node)
    content: cc.Node = null;

    // 倒计时时间
    private _time: number = 0;
    @property(cc.Label)
    label: cc.Label = null;

    // @property(cc.Label)
    // limitLabel: cc.Label = null;

    @property(cc.Button)
    refuseBtn: cc.Button = null;
    @property(cc.Button)
    acceptBtn: cc.Button = null;

    @property(cc.Node)
    user1: cc.Node = null;
    @property(cc.Node)
    user2: cc.Node = null;

    timeDown() {
        if (this.label) {
            this.label.string = (--this._time).toString();
        }
        if (this._time <= 0) {
            this.refuseBtn.node.emit(cc.Node.EventType.TOUCH_END)
            this.close()
        } else {
            cc.tween(this.label.node)
                .delay(1)
                .call(() => {
                    this.timeDown();
                }).start()
        }
    }

    open(time = 6, askData, beAskData) {
        this.label.node.scale = 1
        this._time = time + 1;
        if (this.label) {
            this.label.string = this._time.toString();
        }

        this.node.active = true;
        this.content.stopAllActions();
        this.content.scale = 0.1;
        cc.tween(this.content).to(0.3, { scale: 1 }, { easing: 'backOut' }).start();

        this.label.node.stopAllActions()
        this.timeDown()
        this.user1.getChildByName("node_head").getComponent("HeadCmp").setHead(askData.uid, askData.uinfo.icon);
        this.user1.getChildByName("node_head").getComponent("HeadCmp").setAvatarFrame(askData.avatarFrame);
        this.user1.getChildByName("name").getComponent(cc.Label).string = askData.uinfo.uname;
        this.user2.getChildByName("node_head").getComponent("HeadCmp").setHead(beAskData.uid, beAskData.uinfo.icon);
        this.user2.getChildByName("node_head").getComponent("HeadCmp").setAvatarFrame(beAskData.avatarFrame);
        this.user2.getChildByName("name").getComponent(cc.Label).string = beAskData.uinfo.uname;
        // this.limitLabel.string = refuseCount + "/" + maxRefuseCount;
        // if (refuseCount >= maxRefuseCount) {
        //     this.acceptBtn.interactable = false;
        // } else {
        //     this.acceptBtn.interactable = true;
        // }
    }

    close() {
        this.node.active = false;
        this._time = 0;
        this.label.node.stopAllActions()
    }
    // update (dt) {}
}
