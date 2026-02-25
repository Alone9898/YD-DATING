
cc.Class({
    extends: cc.Component,

    properties: {
        listView:require('List'),
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.netListener = this.node.addComponent("NetListenerCmp");
    },

    onEnable() {
        this.netListener.registerMsg(MsgId.EVENT_BONUS_RECORD, this.EVENT_BONUS_RECORD, this);  // bonus日志列表
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_BONUS_RECORD, rtype:0});
    },

    onDisable() {
        this.netListener.clear();
    },

    start () {
    },

    EVENT_BONUS_RECORD(msg){
        if(msg.code == 200){
            this.localData = msg.data;
            this.updateView();
        }
    },

    updateView() {
        this.listView.numItems = this.localData.length;
    },

    // 更新Item
    onUpdateItem: function (item, idx) {
        let data = this.localData[idx];

        Global.setLabelString("time",item,Global.getTimeStr(data.time));
        Global.setLabelString("type",item,this.getTypeStr(data.rtype));
        Global.setLabelString("coin",item,Global.FormatNumToComma(data.coin));
    },

    getTypeStr(type){
        let TYPE_CONF={
            1:"Register bonus",
            101:"Refer & earn bonus referral register",
            2:"Deposit bonus",
            201:"Refer & earn bonus referral deposit",
            3:"User Bet",
            301:"Refer & earn bonus referral bet",
            4:"Quest",
            5:"VIP level up bonus",//vip升级
            6:"Transfer out",
            9:"VIP weekly bonus",//vip周奖励
            10:"VIP monthly bonus",//vip月奖励
            11:"Task bonus deposit task", //充值任务
            22:"Task bonus game task", //游戏任务
            23:"Task bonus profit task",//盈利任务
            33:"Task bonus betting task",//下注任务
            34:"Transfer to Cash Balance",//转出到现金钱包
            35:"Login bonus",//签到
            36:"Share & spin bonus",//转盘分享
            37:"Betting Cash back bonus",//注册返水
            38:"Salon room tax bonus",//沙龙收益
            39:"Free Winnings transfer in", //cash balance转入
        }

        return TYPE_CONF[type] || "Lucky bonus";
    },

    // update (dt) {},
});
