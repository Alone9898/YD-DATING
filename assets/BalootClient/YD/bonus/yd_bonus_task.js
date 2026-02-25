
cc.Class({
    extends: cc.Component,

    properties: {
        list: require('List'),
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");

        Global.btnClickEvent(cc.find("tog_task/toggle1",this.node),this.onClickToggle1,this);
        Global.btnClickEvent(cc.find("tog_task/toggle2",this.node),this.onClickToggle2,this);
        Global.btnClickEvent(cc.find("tog_task/toggle3",this.node),this.onClickToggle3,this);
        Global.btnClickEvent(cc.find("tog_task/toggle4",this.node),this.onClickToggle4,this);

        this.btn_help = cc.find("btn_help",this.node);
        Global.btnClickEvent(this.btn_help,this.onClickHelp,this);

        this.list.node.on("scrolling", this._onScrolling, this, true);
    },

    onEnable() {
        this.netListener.registerMsg(MsgId.EVENT_TASK_MAIN_CONFIG, this.EVENT_TASK_MAIN_CONFIG, this);  // 获取主线任务
        this.netListener.registerMsg(MsgId.EVENT_TASK_MAIN_REWARD, this.EVENT_TASK_MAIN_REWARD, this);  // 领取奖励
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_TASK_MAIN_CONFIG });
    },

    onDisable() {
        this.netListener.clear();
    },

    start () {

    },

    // 获取列表
    EVENT_TASK_MAIN_CONFIG(msg) {
        if (msg.code != 200) return;
        this.localData = msg.tasks

        this.updateView();
        this.updateRedHit();
    },
    // 领取结果
    EVENT_TASK_MAIN_REWARD(msg) {
        if(msg.spcode > 0){
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
        }
        if (msg.code != 200) return;
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_TASK_MAIN_CONFIG });

        if (this._curItem) {
            if(msg.rewards){
                Global.RewardFly(msg.rewards, this._curItem.convertToWorldSpaceAR(cc.v2(0, 0)));
            }
            // for (const reward of msg.rewards) {
            //     if (reward.type === 1) {
            //         Global.RewardFly(msg.rewards, this._curItem.convertToWorldSpaceAR(cc.v2(0, 0)));
            //         break;
            //     }
            // }
        }
        this.updateView();
    },
    // 更新界面
    updateView() {
        this._rtype = this._rtype || 11;
        this.showData = this.localData.filter((value, index)=>{
            return value.type == this._rtype;
        })

        this.showData.sort((a, b) => {
            if (a.state == 2) {
                return -1;
            }
            if (b.state == 2) {
                return 1;
            }
            return b.state - a.state;
        })

        this.list.numItems = this.showData.length;
        // // 更新一键领取按钮
        // let canCollectItem = [];
        // for (const _item of this.showData) {
        //     if (_item.state == 2) {
        //         canCollectItem.push(_item);
        //     }
        // }
        // this.collectAllBtn.getComponent("ButtonGrayCmp").interactable = canCollectItem.length > 0;
        // this.collectAllBtn.node.active = canCollectItem.length > 0;

        this.btn_help.active = this._rtype == 23 || this._rtype == 33
    },
    // 更新Item
    onUpdateItem: function (item, idx) {
        let data = this.showData[idx];

        cc.find("btn_jump", item).active = false;
        cc.find("btn_get", item).active = data.state !== 3;
        cc.find("RedHitAnim", item).active = data.state === 2;
        cc.find("btn_get", item).getComponent(cc.Button).interactable = data.state === 2;
        cc.find("btn_get/New Label", item).getComponent(cc.Label).setMaterial(0, cc.Material.getBuiltinMaterial(data.state === 2 ? '2d-sprite' : '2d-gray-sprite'));
        cc.find("icon_ok", item).active = data.state == 3;
        cc.find("info", item).getComponent(cc.Label).string = data.desc;
        if (data.need && data.need > 1) {
            cc.find("progress", item).active = true;
            cc.find("info", item).y = 28;
            //当前进度
            let curPre = this.getCurPreStr(data.type)
            cc.find("progress/label", item).getComponent(cc.Label).string = curPre + Global.FormatNumToComma(data.count) ;
            cc.find("progress", item).getComponent(cc.ProgressBar).progress = data.count / data.need;
        } else {
            cc.find("info", item).y = 0;
            cc.find("progress", item).active = false;
        }

        cc.find("layout/coin", item).active = false;
        cc.find("layout/diamond", item).active = false;
        for (const reward of data.rewards) {
            if (reward.type === 1) {
                cc.find("layout/coin", item).active = true;
                cc.find("layout/coin/value", item).getComponent(cc.Label).string = Global.formatNumber(reward.count, { threshold: 100000 });
            }

            if (reward.type === 25) {
                cc.find("layout/diamond", item).active = true;
                cc.find("layout/diamond/value", item).getComponent(cc.Label).string = Global.formatNumber(reward.count, { threshold: 100000 });
            }
        }
    },
    getCurPreStr(type){
        let str = "Current:"
        switch (type) {
            case 11:
                str = "Current Deposit:"
                break;
            case 22:
                str = "Current Play:"
                break;
            case 33:
                str = "Current Betting:"
                break;
            case 23:
                str = "Current Profit:"
                break;
            default:
                break;
        }
        return str
    },
    // 点击领取
    onClickItem(event) {
        this._curItem = event.currentTarget;
        let data = this.showData[event.currentTarget.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.EVENT_TASK_MAIN_REWARD, taskid: data.taskid, type: data.type });
        StatisticsMgr.reqReport(ReportConfig.EVENT_REWARD_GET, data.taskid);
    },
    // 点击去完成 TODO
    onClickJump(event) {
        let data = this.showData[event.currentTarget.parent._listId];
        cc.log("onClickJump", data);
        // cc.vv.PopupManager.removeAll();
        // cc.vv.PopupManager.addPopup("BalootClient/RoomList/RoomListView", {
        //     opacityIn: true,
        //     onShow: (node) => {
        //         let cpt = node.getComponent("RoomListView")
        //         if (cpt) {
        //             cpt.onInit(257);
        //         }
        //     }
        // });
    },
    // // 一键领取
    // onClickCollectAll() {
    //     this._curItem = this.collectAllBtn.node;
    //     this.collectAllBtn.getComponent("ButtonGrayCmp").interactable = false;
    //     cc.vv.NetManager.send({ c: MsgId.EVENT_TASK_MAIN_REWARD, all: 1 });
    // },


    // 跳转到充值
    onClickToggle1(){
        this._rtype = 11;
        this.updateView();
        // this.list.scrollTo(0)
    },

    // 跳转到累计游戏次数
    onClickToggle2(){
        this._rtype = 22;
        this.updateView();

        // let idx = this.localData.indexOf()
        // let idx= 0;
        // for (let i = 0; i < this.localData.length; i++){
        //     if(this.localData[i].type == 22){
        //         idx = i;
        //         break;
        //     }
        // }

        // this.list.scrollTo(idx)
    },

    // 跳转到累计下注
    onClickToggle3(){
        this._rtype = 33;
        this.updateView();
        // let idx= 0;
        // for (let i = 0; i < this.localData.length; i++){
        //     if(this.localData[i].type == 33){
        //         idx = i;
        //         break;
        //     }
        // }
        //
        // this.list.scrollTo(idx)
    },

    // 跳转到累计赢得金币
    onClickToggle4(){
        this._rtype = 23;
        this.updateView();
        // let idx= 0;
        // for (let i = 0; i < this.localData.length; i++){
        //     if(this.localData[i].type == 23){
        //         idx = i;
        //         break;
        //     }
        // }
        //
        // this.list.scrollTo(idx)
    },

    _onScrolling(){
        // cc.log("++++++")
    },

    updateRedHit(){
        this.setRedByType( cc.find("tog_task/toggle1/RedHitAnim",this.node), 11);
        this.setRedByType( cc.find("tog_task/toggle2/RedHitAnim",this.node), 22);
        this.setRedByType( cc.find("tog_task/toggle3/RedHitAnim",this.node), 33);
        this.setRedByType( cc.find("tog_task/toggle4/RedHitAnim",this.node), 23);
    },

    setRedByType(node,type){
        let list =  this.localData.filter((value, index)=>{
            return value.type == type && value.state==2;
        });

        node.active = list.length >　0;
        if(list.length >　0){
           node.getChildByName("value").active = true;
           Global.setLabelString("value",node,list.length);
        }
    },

    onClickHelp(){
        let url = "";
        if(this._rtype == 33){
            url = "YD_Pro/prefab/yd_task_betting_rule";
        } else if(this._rtype == 23){
            url = "YD_Pro/prefab/yd_task_profit_rule";
        }

        if(url){
            cc.vv.PopupManager.addPopup(url);
        }
    },

    // update (dt) {},
});
