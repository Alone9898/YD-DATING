const { ccclass, property } = cc._decorator;

/**
 * 倒计时组件
 */
@ccclass
export class PBCountdown extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
    _cb: Function = null;
    _time: number = 5;
    onLoad() {
        this.node.active = false;
    }

    hide() {
        this.stop();
        this.node.active = false;
    }

    stop() {
        this._cb = null;
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
    }

    /**
     * 显示倒计时
     * @param time 倒计时时间
     */
    show(time: number, cb: Function = null) {
        this.stop();
        this._cb = cb;
        this._time = time;
        this.label.string = "" + this._time;
        this.node.active = true;
        this._tick();
    }

    _tick() {
        this.scheduleOnce(() => {
            this._time--;
            if (this._time > 0) {
                facade.soundMgr.playBaseEffect("clock_warning");
                this._tick();
            } else {
                this._time = 0;
                if(this._cb) {
                    this._cb();
                }
                this.hide();
            }
            this.label.string = "" + this._time;
        }, 1);
    }
}