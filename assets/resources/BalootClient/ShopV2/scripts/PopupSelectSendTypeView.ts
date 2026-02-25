import ShopFriendSendCoin from "./ShopFriendSendCoin";
import ShopSendCoin from "./ShopSendCoin";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSelectSendTypeView extends cc.Component {

    @property(cc.Button)
    uidBtn: cc.Button = null;
    @property(cc.Button)
    friendBtn: cc.Button = null;

    @property(cc.Prefab)
    friendPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    sendPrefab: cc.Prefab = null;

    private data: any;


    onInit(data) {
        this.data = data;
        // this.sendPriceLabel.string = Global.FormatNumToComma(data.amount);
        // this.giftPriceLabel.string = Global.FormatNumToComma(data.ocount);
        this.uidBtn.node.on("click", this.onClickUid, this);
        this.friendBtn.node.on("click", this.onClickFriend, this);
    }

    onClickUid() {
        // 发起赠送
        cc.vv.PopupManager.addPopup(this.sendPrefab, {
            opacityIn: true,
            onShow: (node: cc.Node) => {
                node.getComponent(ShopSendCoin).onInit(this.data);
            }
        })
        cc.vv.PopupManager.removePopup(this.node);
    }
    onClickFriend() {
        // 发起赠送
        cc.vv.PopupManager.addPopup(this.friendPrefab, {
            opacityIn: true,
            onShow: (node: cc.Node) => {
                node.getComponent(ShopFriendSendCoin).onInit(this.data);
            }
        })
        cc.vv.PopupManager.removePopup(this.node);
    }
}
