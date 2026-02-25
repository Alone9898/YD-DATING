// 红点提示管理器
// 存储了 所有红点提示的数据,同时监听服务器的更新推送,如果服务器更新提示,则下发给所有红点组件进行更新
cc.Class({
    extends: cc.Component,
    properties: {
    },
    statics: {
        data: {},
        redHidList: [],
        filterKey: [],
        clickRecordList: [],
        init() {
            this.data = {};
            this.redHidList = [];
            this.clickRecordList = [];
            // 红点更新推送
            cc.vv.NetManager.registerMsg(MsgId.PULL_RED_NOTICE, this.PULL_RED_NOTICE, this);
        },
        // 注册红点组件
        register(redHitCmp) {
            if (this.redHidList.indexOf(redHitCmp) < 0) {
                this.redHidList.push(redHitCmp);
                redHitCmp.updateView();
            }
        },
        // 注销红点组件
        unregister(redHitCmp) {
            let index = this.redHidList.indexOf(redHitCmp);
            if (index >= 0) {
                this.redHidList.splice(index, 1);
            }
        },
        // 服务器推送的消息
        PULL_RED_NOTICE(msg) {
            if (msg.code != 200) return;
            // for (const key of keyArr) {
            //     if (msg[key] != undefined) this.data[key] = msg[key];
            // }
            this.data = msg;
            this.updateView();
        },
        updateView() {
            // 更新已经注册组件
            for (const redHitCmp of this.redHidList) {
                redHitCmp.updateView(this.data);
            }
        },
        // 设置红点统计过滤条件
        setFilterKeys(filterKey) {
            this.filterKey = filterKey;
            this.updateView();
        },

        //本地设置红点数据
        setKeyVal(key,val){
            this.data[key] = val
            this.updateView()
        },

        log() {
            cc.log("data =>", this.data)
            cc.log("redHidList =>", this.redHidList)
            cc.log("redHidList =>", this.clickRecordList)
        },
    },
});
