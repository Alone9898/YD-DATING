const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupVipUpgrade extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Button)
    goBtn: cc.Button = null;

    @property(cc.Button)
    noBtn: cc.Button = null;


    onLoad() {
        this.goBtn.node.on("click", () => {
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 2 });
            Global.dispatchEvent("VIP_GET_REWARD");
        })
    }

    onInit(parm: any) {
        parm = parm || {};
        this.noBtn.node.active = parm.wait;
        cc.vv.UserConfig.setVipFrame(this.icon, parm.svip);
    }

}