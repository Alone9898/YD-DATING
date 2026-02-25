import { values } from "../../libs/runtime";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("UI/倒计时组件")
export default class TimeDownCpt extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.RichText)
    richText: cc.RichText = null;


    pause: boolean = false;

    private _timelife = 0;

    private callback: Function;
    private updateFunc: Function;
    private formatStr = "hh:mm:ss";

    set timelife(value) {
        this._timelife = value;
        if (this.label) {
            this.label.string = value > 0 ? Global.formatSecond(value, this.formatStr) : "";
            if (this.updateFunc) this.updateFunc(value, this.label);
        }
        if (this.richText) {
            this.richText.string = value > 0 ? Global.formatSecond(value, this.formatStr) : "";
            if (this.updateFunc) this.updateFunc(value, this.richText);
        }
    }
    get timelife() {
        return this._timelife;
    }

    onLoad() {
        this.schedule(() => {
            if (this.pause) return;
            if (this.timelife > 0) {
                this.timelife--;
                if (this.timelife <= 0 && this.callback) this.callback();
            }
        }, 1)
    }

    setUpdateFunc(updateFunc) {
        this.updateFunc = updateFunc;
    }
    setCallback(callback) {
        this.callback = callback;
    }
    setTimeFormatStr(formatStr) {
        this.formatStr = formatStr;
    }

}
