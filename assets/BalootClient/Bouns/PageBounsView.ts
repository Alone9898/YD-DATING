const { ccclass, property } = cc._decorator;

@ccclass
export default class PageBonusView extends cc.Component {

    @property(cc.Node)
    tabbarNode: cc.Node = null;
    @property(cc.Node)
    touchNode: cc.Node = null;
    @property(cc.Button)
    switchBtn: cc.Button = null;
    @property(cc.Sprite)
    switchIcon: cc.Sprite = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Node)
    redNode: cc.Node = null;

    @property(cc.Node)
    newGuideTashTabbarNode: cc.Node = null;


    _isShowTabbar: boolean = false;


    onLoad() {
        // this.switchBtn.node.on("click", () => {
        //     this.isShowTabbar = !this.isShowTabbar;
        //     if (this.isShowTabbar) {
        //         cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        //     } else {
        //         cc.vv.EventManager.emit("EVENT_BTN_CLOSE_SOUNDS");
        //     }
        // })
        // this.touchNode.on("click", () => {
        //     if (this.isShowTabbar) {
        //         this.isShowTabbar = false;
        //     }
        // }, this);


        // let tabbarCpt = this.tabbarNode.getComponentInChildren("Tabbar");
        // if (tabbarCpt) {
        //     tabbarCpt.setChangeCallback(() => {
        //         this.isShowTabbar = false;
        //     })
        // }
        // cc.log("cc.vv.UserManager.newbiedone", cc.vv.UserManager.newbiedone);
        // if (this.newGuideTashTabbarNode) { this.newGuideTashTabbarNode.active = cc.vv.UserManager.newbiedone <= 0; }
    }

    protected onEnable(): void {
        this.isShowTabbar = false;
    }

    set isShowTabbar(value) {
        // this._isShowTabbar = value;
        // this.touchNode.active = value;
        // let endPos = value ? cc.v2(cc.winSize.width / 2, 0) : cc.v2(cc.winSize.width / 2 + 126, 0);
        // let iconAngle = value ? 0 : -180
        // // 设置TabbarNode的位置
        // this.tabbarNode.stopAllActions();
        // cc.tween(this.tabbarNode).to(0.2, { position: endPos }).start();
        // cc.tween(this.switchIcon.node).to(0.2, { angle: iconAngle }).start();

        // this.redNode.active = !value;

        // content的位置
        // let contentEndPosX = value ? -120 : 0;
        // this.content.stopAllActions();
        // cc.tween(this.content)
        //     .to(0.2, { x: contentEndPosX })
        //     .start();
    }

    get isShowTabbar() {
        return this._isShowTabbar;
    }
}
