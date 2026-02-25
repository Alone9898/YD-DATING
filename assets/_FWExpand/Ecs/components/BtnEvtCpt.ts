const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@menu('ECS/发射器/按钮发射器')
@requireComponent(cc.Button)
export default class BtnEvtCpt extends cc.Component {
    @property
    key: string = 'event_key';
    @property(cc.Boolean)
    isPress: boolean = false;
    @property({
        visible() { return this.isPress == true }
    })
    longPressKey: string = 'event_key';
    @property({
        visible() { return this.isPress == true }
    })
    longPressTime: number = 2;
    @property({
        type: cc.Prefab,
        visible() { return this.isPress == true }
    })
    longPressAnimPrefab: cc.Prefab = null;
    private _isPressTouch = false;

    private pressAnimNode: cc.Node;

    onLoad() {
        // 长按触发
        let touchCallback = () => {
            this.unschedule(pressAnimStart);
            this._isPressTouch = true
            if (cc.isValid(this.pressAnimNode)) {
                this.pressAnimNode.destroy()
            }
            Global.dispatchEvent(this.longPressKey, this.node.getComponent(cc.Button));
        }
        // 结束touch
        let touchEndback = () => {
            // 取消长按监听
            if (this.isPress) {
                this.unschedule(pressAnimStart);
                if (cc.isValid(this.pressAnimNode)) {
                    this.pressAnimNode.destroy()
                }
                this.unschedule(touchCallback);
            }
            // 判断是否还算点击
            if (!this._isPressTouch) {
                Global.dispatchEvent(this.key, this.node.getComponent(cc.Button));
            }
            this._isPressTouch = false;
        }
        // 取消touch
        let cancelCallback = () => {
            // 取消长按监听
            if (this.isPress) {
                this.unschedule(pressAnimStart);
                if (cc.isValid(this.pressAnimNode)) {
                    this.pressAnimNode.destroy()
                }
                this.unschedule(touchCallback);
            }
        }

        let pressAnimStart = () => {
            if (this.longPressAnimPrefab) {
                this.pressAnimNode = cc.instantiate(this.longPressAnimPrefab);
                this.pressAnimNode.parent = this.node;
            }
        }

        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.getComponent(cc.Button).interactable) return false;
            // 开始计时如果时间到了则发事件
            this._isPressTouch = false;
            if (this.isPress) {
                this.scheduleOnce(pressAnimStart, 0.2);
                this.scheduleOnce(touchCallback, this.longPressTime)
            }
        })
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.getComponent(cc.Button).interactable) return false;
            touchEndback()
        })
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            if (!this.getComponent(cc.Button).interactable) return false;
            cancelCallback()
        })
    }
}
