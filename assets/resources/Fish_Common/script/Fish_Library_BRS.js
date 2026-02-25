////鸟王争霸/雷电捕鱼/海绵宝宝公用帮助界面
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let mask = cc.find("mask", this.node);
        if (mask) {
            mask.on(cc.Node.EventType.TOUCH_END, (event)=>{
                //this.node.destroy();
                this.node.active = false;
            }, this);
        }

        let btnClose = cc.find("img_bg/btn_close", this.node);
        Global.btnClickEvent(btnClose, this.onBtnClose, this);

    },

    onBtnClose(event) {
        //this.node.destroy();
        this.node.active = false;
    },
});
