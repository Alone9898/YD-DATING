cc.Class({
    extends: cc.Component,
    editor: {
        menu: '弹窗相关/关闭按钮',
        requireComponent: cc.Button,
    },
    properties: {
    },
    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                cc.vv.PopupManager.removeTop();
                // cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            })
        }
    },
});
