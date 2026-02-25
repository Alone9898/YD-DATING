cc.Class({
    extends: cc.Component,
    editor: {
        menu: '音效/弹窗',
    },
    properties: {
    },
    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
            }, this);
        }

        let toggle = this.node.getComponent(cc.Toggle)
        if (toggle) {
            this.node.on("toggle", () => {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
            }, this);
        }
    },
});
