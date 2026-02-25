const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutScheduleView extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;

    private netListener: any;
    private localData: any;
    private listView: any;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.listView = this.listViewNode.getComponent("ListView");
        this.netListener.registerMsg(MsgId.GET_KNOCKOUT_CONFIG, this.GET_KNOCKOUT_CONFIG, this);
    }
    protected onEnable(): void {
        // 启用定时刷新界面
        this.schedule(this.updateView.bind(this), 1);
        this.reqConfig();
    }

    reqConfig() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.GET_KNOCKOUT_CONFIG }, true);
    }
    // 赛事配置
    GET_KNOCKOUT_CONFIG(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        this.localData = Global.deepClone(msg);
        this.updateView();
    }
    updateView() {
        // 进行排序
        let count = 0;
        let max = this.localData.list.length;
        while ([4, 5].indexOf(this.localData.list[0].state) >= 0 && count < max) {
            let fristItem = this.localData.list.shift();
            count++;
            if (fristItem) {
                this.localData.list.push(fristItem);
            }
        }
        // 更新列表
        this.listView.numItems = this.localData.list.length;
    }

    onUpdateItem(item, index) {
        let data = this.localData.list[index];
        // 开始时间
        cc.find("layout/start", item).getComponent(cc.Label).string = Global.formatTime("hh:mm", data.start_time);
        // 人数
        cc.find("layout/people", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.curr_cnt);
        // 奖池
        cc.find("layout/pool", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.pool_prize);
        // 门票
        cc.find("layout/buyin", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.buy_in);
        // 状态: 还未到时间,达到准备时间,已经进行
        let currTime = new Date().getTime() / 1000;
        cc.find("layout/layout/btn_deregister", item).active = false;
        cc.find("layout/layout/btn_register", item).active = false;
        cc.find("layout/layout/btn_play", item).active = false;
        cc.find("layout/layout/btn_play&register", item).active = false;
        cc.find("layout/layout/label_running", item).active = false;
        cc.find("layout/layout/label_end", item).active = false;
        cc.find("layout/layout/label_registered", item).active = false;

        let selfInfo = null;
        for (const info of data.players) {
            if (info.uid == cc.vv.UserManager.uid) {
                selfInfo = info;
            }
        }
        if ([4, 5].indexOf(data.state) >= 0) {
            // 显示已结束
            cc.find("layout/layout/label_end", item).active = true;
        } else if (selfInfo && [3].indexOf(selfInfo.state) >= 0) {
            // 如果自己被淘汰显示已结束
            cc.find("layout/layout/label_running", item).active = true;
        } else if ([3].indexOf(data.state) >= 0) {
            // 显示进行中
            cc.find("layout/layout/label_running", item).active = true;
        } else {
            if (currTime < (data.start_time - data.ahead_time)) {
                // 只能报名
                if (data.is_register == 1) {
                    if (Global.isYDApp()) {
                        cc.find("layout/layout/btn_deregister", item).active = true;
                    } else {
                        cc.find("layout/layout/label_registered", item).active = true;
                    }
                } else {
                    cc.find("layout/layout/btn_register", item).active = true;
                }
            } else if (currTime < (data.start_time + data.deadline_time)) {
                // 可以直接报名进入等待区
                if (data.is_register == 1) {
                    if (Global.isYDApp()) {
                        cc.find("layout/layout/btn_deregister", item).active = true;
                    } else {
                        cc.find("layout/layout/label_registered", item).active = true;
                    }
                } else {
                    cc.find("layout/layout/btn_play&register", item).active = true;
                }
            } else if (currTime < data.stop_time) {
                // 显示进行中
                cc.find("layout/layout/label_running", item).active = true;
            } else {
                // 显示已结束
                cc.find("layout/layout/label_end", item).active = true;
            }
        }
    }

    // 点击开始游戏
    onClickPlay(event) {
        let data = this.localData.list[event.currentTarget.parent.parent.parent._listId];
        Global.dispatchEvent("HALL_TO_GAME");
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_JOIN, tn_id: data.tn_id }, true);
    }
    // 点击报名并且开始
    onClickPlayRegister(event) {
        let data = this.localData.list[event.currentTarget.parent.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_REGISTER, tn_id: data.tn_id, undo: 0, is_auto: 1 });
    }
    // 点击报名
    onClickRegister(event) {
        let data = this.localData.list[event.currentTarget.parent.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_REGISTER, tn_id: data.tn_id, undo: 0, is_auto: 0 });
    }
    // 点击取消报名
    onClickDeregister(event) {
        let data = this.localData.list[event.currentTarget.parent.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_REGISTER, tn_id: data.tn_id, undo: 1, is_auto: 0 });
    }


}
