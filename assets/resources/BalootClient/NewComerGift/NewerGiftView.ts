const { ccclass, property } = cc._decorator;

@ccclass
export default class NewerGiftView extends cc.Component {

    @property(cc.Button)
    btn_get: cc.Button = null;
    @property(cc.Button)
    btn_rule:cc.Button = null;
    // private _bClick: boolean;
    coin:Number;


    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.GET_NEWER_GIFT_REWARDS, this.GET_NEWER_GIFT_REWARDS, this);
        // this._bClick = false
        this.btn_get.node.on("click", this.onGetRewards, this);
        this.btn_rule.node.on("click", this.onClickRule, this);
    }

    //设置初始送的金币
    setCoin(val){
        this.coin = val;
        cc.find("bg_newer_gift/lbl", this.node).getComponent(cc.Label).string = val
    }

    onGetRewards() {
        // if(this._bClick) return
        // this._bClick = true
        cc.vv.NetManager.send({ c: MsgId.GET_NEWER_GIFT_REWARDS });
    }

    GET_NEWER_GIFT_REWARDS(msg) {
        // this._bClick = true
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.UserManager.charmpack = 0;
        Global.RewardFly(msg.rewards, this.btn_get.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        cc.vv.PopupManager.removePopup(this.node);
    }

    onClickRule(){
        cc.vv.PopupManager.addPopup("YD_Pro/newergift/newergift_rule",{
            onShow: (node: cc.Node) => {
                node.getComponent("newergift_rule").init(this.coin);
            }
        })
    }

}
