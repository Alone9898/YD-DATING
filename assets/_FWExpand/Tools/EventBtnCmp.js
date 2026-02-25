cc.Class({
    extends: cc.Component,

    editor: {
        menu: '通用/事件按钮',
        requireComponent: cc.Button,
    },

    properties: {
        key: "",
    },

    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                Global.dispatchEvent(this.key, this);
            })
        }
    },

});
