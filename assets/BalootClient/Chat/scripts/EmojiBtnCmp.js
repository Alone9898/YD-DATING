cc.Class({
    extends: cc.Component,
    editor: {
        requireComponent: cc.Button,
    },
    properties: {
        key: 0,
    },
    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                Global.dispatchEvent("REQ_CHAT_SEND", this.key);
            })
        }
    },


});
