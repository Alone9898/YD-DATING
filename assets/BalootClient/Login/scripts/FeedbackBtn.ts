const { ccclass, property } = cc._decorator;

@ccclass
export default class FeedbackBtn extends cc.Component {


    onLoad() {
        this.node.on("click", this.onClick, this)
    }

    onClick() {
        cc.vv.PlatformApiMgr.openURL("https://wa.me/message/YK2DR45JCJBDO1");
    }
}
