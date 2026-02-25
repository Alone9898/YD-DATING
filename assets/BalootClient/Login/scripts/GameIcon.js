
//游戏logo图标

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        if (Global.isDurakApp()) {
            //华为包暂时隐藏，后续考虑换logo
            this.node.active = false
        }
    },

});
