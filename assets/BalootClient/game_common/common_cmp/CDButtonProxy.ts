const { ccclass, property, requireComponent, menu } = cc._decorator;

/**
 * button代理类 添加cd功能
 */

@ccclass
@requireComponent(cc.Button)
@menu("通用/CDButtonProxy")
export class CDButtonProxy extends cc.Component {
    @property()
    cdTime = 0.5;
    @property()
    autoInteractable = false; // 是否自动调用interactable

    button: cc.Button = null;

    _preTime: number = 0;    // 上一次点击的时间
    _clickHandler: Function = null;
    onLoad() {
        this.button = this.node.getComponent(cc.Button);
        this.button.node.on("click", () => {
            let t = new Date().getTime();
            if (t - this._preTime < this.cdTime * 1000) {
                return;
            }
            this._preTime = t;
            if (this._clickHandler) {
                this._clickHandler();
            }
            if (this.autoInteractable) {
                this.button.interactable = false;
                this.unscheduleAllCallbacks();
                this.scheduleOnce(() => {
                    this.button.interactable = true;
                }, this.cdTime);
            }
        })
    }

    onDestroy() {
        this._clickHandler = null;
    }

    /**
     * 添加点击监听
     */
    addClickHandler(clickHandler: (target?: CDButtonProxy) => void) {
        this._clickHandler = clickHandler;
    }
}