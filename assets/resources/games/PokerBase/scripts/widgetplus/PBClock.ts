const { ccclass, property } = cc._decorator;

/**
 * 倒计时组件
 */
@ccclass
export class PBClock extends cc.Component {
    _label:cc.Label = null;
    _time:number = 15;
    onLoad() {
        this._label = this.node.getChildByName("label").getComponent(cc.Label);
        this.hide();
    }

    hide() {
        this.stop();
        this.node.active = false;
    }

    stop() {
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
    }

    /**
     * 显示倒计时
     * @param time 倒计时时间
     * @param globalPos 全局坐标
     */
    show(time:number, globalPos:cc.Vec2, moveTo:boolean = false) {
        this.stop();
        this._time = time;
        this._label.string = "" + this._time;
        this.node.active = true;
        let p = this.node.parent.convertToNodeSpaceAR(globalPos);
        if(moveTo) {
            this.node.stopAllActions();
            this.node.scale = 1;
            cc.tween(this.node)
                .to(0.3, {x:p.x, y:p.y})
                .start();
        }else {
            this.node.stopAllActions();
            this.node.scale = 0.7;
            this.node.x = p.x;
            this.node.y = p.y;
            cc.tween(this.node)
                .to(0.5, {scale:1}, {easing:"backOut"})
                .start();
        }
        this._tick();
    }

    _tick() {
        this.scheduleOnce(()=>{
            this._time--;
            if(this._time>0) {
                this._tick();
            }else {
                this._time = 0;
            }
            this._label.string = "" + this._time;
        }, 1);
    }
}