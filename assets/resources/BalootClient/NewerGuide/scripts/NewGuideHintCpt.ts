const { ccclass, property } = cc._decorator;

@ccclass
export default class NewGuideHintCpt extends cc.Component {

    @property
    key: string = '';
    @property
    step: number = 0;



    @property([cc.Button])
    buttons: cc.Button[] = [];


    get localKet() {
        return "LOCAL_GUIDE_" + this.key;
    }

    protected onLoad(): void {
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("EVENT_CHANGE_NEW_GUIDE", this.updateView, this);
        for (const button of this.buttons) {
            if (button) {
                button.node.on("click", () => {
                    if (!this.node.activeInHierarchy) return;
                    let step = Global.getLocal(this.localKet, 0);
                    if (step == this.step) {
                        Global.saveLocal(this.localKet, this.step + 1);
                        Global.dispatchEvent("EVENT_CHANGE_NEW_GUIDE");
                    }
                })
            }
        }
    }

    protected onEnable(): void {
        this.updateView();
    }

    updateView() {
        // 判断自己是否应该出现
        let step = Global.getLocal(this.localKet, 0);
        this.node.active = step == this.step;
    }

}
