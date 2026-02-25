cc.Class({
    extends: cc.Component,

    properties: {
        list: require("ListView"),
        // button: cc.Button,
    },

    onLoad() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        // let netListener = this.node.addComponent("NetListenerCmp");
        // netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);
        this.list.numItems = cc.vv.UserConfig.countryConfig.length;
    },

    init(playerInfo) {

    },

    onRenderItem(item, index) {
        let countryData = cc.vv.UserConfig.countryConfig[index];
        // 设置图标
        cc.vv.UserConfig.setCountryFrame(cc.find("country/mask/icon", item).getComponent(cc.Sprite), index);
        // 设置选中
        cc.find("country/gou", item).active = countryData.id == cc.vv.UserManager.country
    },

    onClickItem(event) {
        let data = cc.vv.UserConfig.countryConfig[event.currentTarget._listId];
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, country: data.id });
    },

    USER_INFO_CHANGE() {
        // 关闭修改窗口
        this.list.numItems = cc.vv.UserConfig.countryConfig.length;
    },

});
