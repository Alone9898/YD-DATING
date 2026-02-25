const { ccclass, property, menu, requireComponent } = cc._decorator;
@ccclass
@requireComponent(cc.Button)
@menu("UI/按钮时间锁")
export default class ButtonClickLimitCmp extends cc.Component {
    // 上次点击的时间
    @property
    lockTime: number = 0.5;
    onLoad() {
        let button = this.getComponent(cc.Button);
        let buttonGrayCmp = this.getComponent("ButtonGrayCmp");
        // 给按钮添加一个点击时间
        this.node.on("click", () => {
            if (buttonGrayCmp) {
                buttonGrayCmp.interactable = false
            } else {
                button.interactable = false;
            }
            // 定时解开
            this.scheduleOnce(() => {
                if (buttonGrayCmp) {
                    buttonGrayCmp.interactable = true
                } else {
                    button.interactable = true;
                }
            }, this.lockTime);
        }, this);
    }
}
