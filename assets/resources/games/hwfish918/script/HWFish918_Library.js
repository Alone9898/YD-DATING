
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let mask = cc.find("mask", this.node);
        mask.on(cc.Node.EventType.TOUCH_END, (event)=>{
            this.node.active = false;
        }, this);
    },
});
