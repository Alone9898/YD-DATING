import LeftMenuCpt from "../../_FWExpand/UI/LeftMenuCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PageSocialView extends cc.Component {

    @property(cc.Node)
    tabbarNode: cc.Node = null;
    @property(cc.Node)
    touchNode: cc.Node = null;
    @property(cc.Button)
    switchBtn: cc.Button = null;
    @property(cc.Sprite)
    switchIcon: cc.Sprite = null;
    @property(cc.Node)
    redNode: cc.Node = null;

    @property(cc.Node)
    tabbarCptNode: cc.Node = null;



    // 是否显示
    _isShowTabbar: boolean = false;
    set isShowTabbar(value) {
        this._isShowTabbar = value;
        this.touchNode.active = value;
        let endPos = value ? cc.v2(cc.winSize.width / 2, 0) : cc.v2(cc.winSize.width / 2 + 126, 0)
        let iconAngle = value ? 0 : -180
        // 设置TabbarNode的位置
        this.tabbarNode.stopAllActions();
        cc.tween(this.tabbarNode).to(0.2, { position: endPos }).start();
        cc.tween(this.switchIcon.node).to(0.2, { angle: iconAngle }).start();
        this.redNode.active = !value;
    }

    get isShowTabbar() {
        return this._isShowTabbar;
    }

    onLoad() {
        this.isShowTabbar = false;
        if (Global.isIOSAndroidReview()) {
            let taberNode = cc.find("TabbarContent/Tabbar", this.node)
            taberNode.getComponent("Tabbar").defaultIndex = 1
        }
        this.switchBtn.node.on("click", () => {
            this.isShowTabbar = !this.isShowTabbar;
            if (this.isShowTabbar) {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
            } else {
                cc.vv.EventManager.emit("EVENT_BTN_CLOSE_SOUNDS");
            }
        })
        this.touchNode.on("click", () => {
            if (this.isShowTabbar) {
                this.isShowTabbar = false;
                cc.vv.EventManager.emit("EVENT_BTN_CLOSE_SOUNDS");
            }
        }, this);


        this.tabbarCptNode.getComponent("Tabbar").setChangeCallback((index, item, items) => {
            this.isShowTabbar = false;
        });

    }

    protected onEnable(): void {
        this.isShowTabbar = false;
        // 关闭社交 沙龙界面的菜单
        let salonPageItem = this.tabbarCptNode.getComponent("Tabbar").tabs[2];
        let salonNode = salonPageItem && salonPageItem.pageNode;
        if (salonNode) {
            let cpt = salonNode.getComponentInChildren(LeftMenuCpt)
            if (cpt) {
                cpt.moveX = 600;
                cpt.show = false;
            }
        }
    }
}
