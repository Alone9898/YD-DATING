/**
 * 用遮罩实现的进度条
 */
const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class MaskProgress extends cc.Component {
    @property(cc.Node)
    bar: cc.Node = null;

    @property()
    _percent = 0;
    @property({
        type: cc.Float,
        range: [0, 1, 0.1],
        slide: true
    })
    set percent(val: number) {
        if (this._percent == val) {
            return;
        }
        this._percent = val;
        this.updateView();
    }
    get percent() {
        return this._percent;
    }

    onLoad() {
        this.updateView();
    }

    updateView(ani = false, aniTime = 0.5) {
        if (this.bar) {
            let x = this.percent * this.bar.width;
            if (ani) {
                cc.tween(this.bar)
                    .to(aniTime, { x: x })
                    .start();
            } else {
                this.bar.x = x;
            }
        } else {
            cc.log("未绑定bar节点")
        }
    }

    /**
     * 设置进度带动画
     */
    toPercent(val: number, aniTime = 0.5) {
        this._percent = val;
        this.updateView(true);
    }
}