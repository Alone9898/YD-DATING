
cc.Class({
    extends: cc.Component,

    properties: {
        listView:require('List'),
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    updateView(data, myInfo, type){
        this.localData = data;
        this.listView.numItems = this.localData.length;

        this.selfInfo = myInfo;
        this.updateSelfInfo();

        cc.find("ui/tit", this.node).getComponent("ImgSwitchCmp").setIndex(type-1);
    },

    // 更新Item
    onUpdateItem: function (item, idx) {
        let data = this.localData[idx];

        item.getComponent("yd_rank_item").updateView(data, false, 0);
    },

    updateSelfInfo(){
        let item = cc.find("ui/listview/self", this.node);
        item.getComponent("yd_rank_item").updateView(this.selfInfo, true, 0);
    },

    // update (dt) {},
});
