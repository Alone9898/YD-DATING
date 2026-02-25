const { ccclass, property } = cc._decorator;

@ccclass
export default class HallFloatMenuCpt extends cc.Component {


    @property(cc.Vec2)
    hidePos: cc.Vec2 = null;
    @property(cc.Vec2)
    showPos: cc.Vec2 = null;

    @property(cc.Node)
    floatNode: cc.Node = null;
    @property(cc.Node)
    maskNode: cc.Node = null;
    // @property(cc.Node)
    // bgNode: cc.Node = null;

    // @property(cc.Button)
    // btn_menu: cc.Button = null;


    // 是否显示
    isShow: boolean = true;
    menuSpine: sp.Skeleton;



    onLoad() {
        // this.btn_menu.node.on("click", this.onClickMenu, this);
        this.maskNode.on("click", this.onClickMask, this);
        this.isShow = false;
        // this.menuSpine = this.btn_menu.getComponentInChildren(sp.Skeleton);

        // this.menuSpine.setCompleteListener((tck) => {
        //     if (tck.animation && tck.animation.name == "animation_3") {
        //         this.menuSpine.setAnimation(0, "animation_2", true);
        //     } else if (tck.animation && tck.animation.name == "animation_4") {
        //         this.menuSpine.setAnimation(0, "animation_1", true);
        //     }
        // });
        this.run();

        Global.btnClickEvent(cc.find("btns_node/float_node/layout/btn_rank", this.node),function () {
            cc.vv.PopupManager.addPopup("YD_Pro/rank/yd_rank", {
                onShow: (node) => {
                    node.getComponent("yd_rank").initPage(1);
                }
            })
        }, this )
        Global.btnClickEvent(cc.find("btns_node/float_node/layout/btn_record", this.node),function () {
            // cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_historical_record", {
                onShow: (node) => {
                    node.getComponent("yd_historical_record").init({page:1});
                }
            })
        }, this )
    }


    protected onDisable(): void {
        this.isShow = false;
        this.run();
    }


    onClickMenu() {
        this.isShow = !this.isShow;
        this.runAnim();
    }

    onClickMask() {
        this.isShow = false;
        this.runAnim();
    }

    run() {
        this.maskNode.stopAllActions();
        // this.bgNode.stopAllActions();
        this.floatNode.stopAllActions();
        this.maskNode.active = this.isShow;
        // this.bgNode.active = this.isShow;
        this.floatNode.position = this.isShow ? cc.v3(this.showPos) : cc.v3(this.hidePos);
        // this.menuSpine.setAnimation(0, this.isShow ? "animation_2" : "animation_1", true);
    }

    runAnim() {
        let animTime = 0.3;
        this.maskNode.stopAllActions();
        // this.bgNode.stopAllActions();
        this.floatNode.stopAllActions();
        if (this.isShow) {
            this.maskNode.active = true;
            // this.bgNode.active = true;
            this.maskNode.opacity = 0;
            // this.bgNode.opacity = 0;
            cc.tween(this.maskNode).to(animTime, { opacity: 120 }, { easing: "quadOut" }).start();
            // cc.tween(this.bgNode).to(animTime, { opacity: 255 }, { easing: "quadOut" }).start();
            cc.tween(this.floatNode).to(animTime, { position: this.showPos }, { easing: "quadOut" }).start();
            // this.menuSpine.setAnimation(0, "animation_3", false);
        } else {
            cc.tween(this.maskNode).to(animTime, { opacity: 0 }, { easing: "quadIn" }).call(() => {
                this.maskNode.active = false;
            }).start();
            // cc.tween(this.bgNode).to(animTime, { opacity: 0 }, { easing: "quadIn" }).call(() => {
            //     this.bgNode.active = false;
            // }).start();
            cc.tween(this.floatNode).to(animTime, { position: this.hidePos }, { easing: "quadIn" }).start();
            // this.menuSpine.setAnimation(0, "animation_4", false);
        }
    }


}
