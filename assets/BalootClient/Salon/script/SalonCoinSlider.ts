const { ccclass, property } = cc._decorator;

@ccclass
export default class SalonCoinSlider extends cc.Component {
    @property(cc.Slider)
    slider: cc.Slider = null;

    @property(cc.Node)
    valueLayout: cc.Node = null;

    levelConfig: number[] = [0.13, 0.41, 0.7, 0.97];
    config: number[];
    callback: Function;

    _lastProgress:0;

    protected onLoad(): void {
        this.slider.node.on("slide", this.onSliderChange, this);
        this.slider.handle.node.on(cc.Node.EventType.TOUCH_END, this.onToucheEnd, this);
        this.slider.handle.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onToucheEnd, this);
    }

    onToucheEnd() {
        this.updateView();
    }

    updateView() {
        let endProgress = this.slider.progress;
        for (const item of this.levelConfig) {
            if (this.slider.progress >= Math.max(item - 0.15, 0)) {
                endProgress = item;
            }
        }
        if(this._lastProgress && this._lastProgress !== endProgress){
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        }

        this.slider.progress = endProgress;
        cc.find("fg", this.node).getComponent(cc.Sprite).fillRange = endProgress;

        let index = this.levelConfig.indexOf(this.slider.progress);
        this.callback && this.callback(this.levelConfig[index], index);
        this._lastProgress = endProgress;
    }


    onSliderChange(slider: cc.Slider) {
        cc.find("fg", this.node).getComponent(cc.Sprite).fillRange = slider.progress;
        this.updateView();
    }

    // 设置数据
    setDataList(config: number[]) {
        this.config = config;
        for (let i = 0; i < this.valueLayout.children.length; i++) {
            const node = this.valueLayout.children[i];
            let data = config[i];
            node.active = !!data;
            if (node.active) {
                node.getComponent(cc.Label).string = Global.FormatNumToComma(data);
            }
        }
        this.slider.progress = this.levelConfig[0];
        this.updateView();
    }

    // 获取当前选中的数据
    getCurrSelectData(): number {
        return this.config[this.levelConfig.indexOf(this.slider.progress)];
    }
    // 设置当前选中的数据
    setSelectCallback(callback: Function) {
        this.callback = callback;
    }

}
