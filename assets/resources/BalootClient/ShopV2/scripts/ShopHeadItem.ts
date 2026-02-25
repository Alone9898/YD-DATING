import NavigationPageItem from "../../../../_FWExpand/UI/NavigationPageItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopHeadItem extends cc.Component {

    @property(cc.Sprite)
    statusIcon: cc.Sprite = null;

    onLoad() {

    }

    // 回调
    onPageItemChange(pageItem: NavigationPageItem) {
        let angle = pageItem.isOpen ? -90 : 0;
        this.statusIcon.node.stopAllActions();
        cc.tween(this.statusIcon.node).to(0.1, { angle: angle }).start();
    }

}
