const { ccclass, property } = cc._decorator;

@ccclass
export default class LongTouchCpt extends cc.Component {
    @property
    touchTime: number = 2;

    private callback: Function = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    setCallback(callback) {
        this.callback = callback;
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(this.onTimeOut, this.touchTime);
    }

    onTouchMove(event: cc.Event.EventTouch) {
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.unscheduleAllCallbacks();
    }

    onTimeOut() {
        this.callback && this.callback();
    }
}
