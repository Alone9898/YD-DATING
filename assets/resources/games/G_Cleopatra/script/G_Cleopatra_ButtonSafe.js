
cc.Class({
    extends: cc.Component,

    properties: {
        safeTime: {
            default: 0.5,
            tooltip: "按钮保护时间，指定间隔内只能点击一次."
        }
    },

    onLoad() {
        let button = this.getComponent(cc.Button);
        if (!button) {
            return;
        }

        this.clickEvents = button.clickEvents;
        Global.btnClickEvent(this.node, function (buttton) {
            buttton.interactable = false
            let slotsSrc= cc.vv.gameData.GetSlotsScript()
            if(slotsSrc){
                slotsSrc.scheduleOnce(() => {
                    buttton.interactable = true
                }, this.safeTime)
            }

        }, this)

    }
});