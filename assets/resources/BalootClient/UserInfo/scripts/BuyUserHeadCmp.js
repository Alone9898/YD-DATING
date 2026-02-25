cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Label,
        frame: cc.Sprite,
        okButton: cc.Button,
        cancelButton: cc.Button,
    },

    onLoad() {
        this.okButton.node.on('click', () => {
            // 请求购买
            cc.vv.NetManager.send({
                c: MsgId.BUY_USER_FRAME,
                frameid: this.data.id
            });
            cc.vv.PopupManager.removePopup(this.node)
        })
        this.cancelButton.node.on('click', () => {
            cc.vv.PopupManager.removePopup(this.node)
        })
    },

    setData(data) {
        this.data = data;
    }

    // update (dt) {},
});
