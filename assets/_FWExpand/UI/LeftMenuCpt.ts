const { ccclass, property } = cc._decorator;

@ccclass
export default class LeftMenuCpt extends cc.Component {

    @property
    moveX: number = 200;
    @property(cc.Node)
    touchNode: cc.Node = null;
    @property(cc.Button)
    switchBtn: cc.Button = null;
    @property(cc.Sprite)
    switchIcon: cc.Sprite = null;

    @property(cc.Node)
    extNode: cc.Node = null;

    private callback;

    // 是否显示
    _show: boolean = true;
    set show(value) {
        this._show = value;
        if (this.touchNode) {
            this.touchNode.active = value;
        }
        let endY = value ? cc.winSize.width / 2 : cc.winSize.width / 2 + this.moveX
        let iconAngle = value ? 0 : -180
        // 设置TabbarNode的位置
        this.node.stopAllActions();
        cc.tween(this.node).to(0.2, { x: endY }).start();
        cc.tween(this.switchIcon.node).to(0.2, { angle: iconAngle }).start();
        if (this.extNode) {
            this.extNode.active = value;
        }
    }

    get show() {
        return this._show;
    }

    onLoad() {
        this.switchBtn.node.on("click", () => {
            this.show = !this.show;
            this.callback && this.callback(this.show)
            if (!this.show) {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            }
        })
        if (this.touchNode) {
            this.touchNode.on("click", () => {
                if (this.show) {
                    this.show = false;
                    cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                }
            }, this);
        }
    }

    setCallback(callback) {
        this.callback = callback;
    }


}
