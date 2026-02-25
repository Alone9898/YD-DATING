const { ccclass, property } = cc._decorator;

@ccclass
export default class Table_CountDown extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    lightNode: cc.Node = null;


    @property(cc.Font)
    greenFnt: cc.Font = null;
    @property(cc.Font)
    redFnt: cc.Font = null;
    @property(cc.Font)
    yellowFnt: cc.Font = null;

    private _timelife = 0;
    private callback: Function;


    private colorMap = [
        [246, 72, 77], //红色
        [246, 72, 77], //红色
        [246, 72, 77], //红色
        [246, 72, 77], //红色

        [255, 168, 0], //黄色
        [255, 168, 0], //黄色
        [255, 168, 0], //黄色

        [57, 233, 182], //绿色
        [57, 233, 182], //绿色
        [57, 233, 182], //绿色
        [57, 233, 182], //绿色
    ]

    set timelife(value) {
        this._timelife = value;
        this.label.string = value.toString();
        cc.tween(this.label.node).to(0.1, { scale: 1.3 }).to(0.1, { scale: 1 }).start();
        this.updateColor();
    }
    get timelife() {
        return this._timelife;
    }

    onLoad() {
        cc.tween(this.lightNode).by(0.5, { angle: 180 }).repeatForever().start();
    }

    show(time) {
        if (time <= 0) return;
        this.node.active = true;
        this.timelife = time;
        this.schedule(this.tick, 1);
    }

    hide() {
        this.unschedule(this.tick);
        this.node.active = false;
    }

    tick() {
        if (this.timelife > 0) {
            this.timelife--;
            if (this.timelife >= 0) {
                this.playRecountEffect()
            }
            if (this.timelife <= 0) {
                this.hide();
                if (this.callback) this.callback();
            }
        }
    }

    updateColor() {
        let index = Math.max(this.timelife, 0);
        index = Math.min(this.timelife, 10);
        let data = this.colorMap[index]
        this.lightNode.color = new cc.Color(data[0], data[1], data[2])
        if (this.timelife >= 7) {
            this.label.font = this.greenFnt;
        } else if (this.timelife >= 4) {
            this.label.font = this.yellowFnt;
        } else {
            this.label.font = this.redFnt;
        }
    }
    playRecountEffect() {
        let compath = 'Table_Common/TableRes/'
        cc.vv.AudioManager.playEff(compath, "com_timeAlarm", true);
    }
}
