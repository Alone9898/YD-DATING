const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutDetailsInfoView extends cc.Component {
    @property(cc.Node)
    node_prize: cc.Node = null;
    @property(cc.Node)
    node_rule: cc.Node = null;

    @property(cc.Button)
    btn_get: cc.Button = null;

    private tn_id: number = 0;
    private netListener: any;
    localData: any;
    selfInfo: any;
    rewardsData: any[];


    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        // 获取信息
        this.netListener.registerMsg(MsgId.GET_KNOCKOUT_INFO, this.GET_KNOCKOUT_INFO, this);
        this.btn_get.node.on("click", this.onClickGet, this);
    }

    onInit(tn_id, tabIndex = 0) {
        this.tn_id = tn_id;
        this.reqConfig();
        this.node.getComponentInChildren("Tabbar").setPage(tabIndex);
    }
    reqConfig() {
        cc.vv.NetManager.send({ c: MsgId.GET_KNOCKOUT_INFO, tn_id: this.tn_id });
    }

    GET_KNOCKOUT_INFO(msg) {
        this.localData = msg;
        this.updateView();
    }

    updateView() {
        let tn_info = this.localData.tn_info;
        let currTime = Math.floor(new Date().getTime() / 1000);
        this.unscheduleAllCallbacks();
        // 规则更新
        cc.find("info/content/buyin/value", this.node_rule).getComponent(cc.Label).string = Global.FormatNumToComma(tn_info.buy_in);
        cc.find("info/content/pool/value", this.node_rule).getComponent(cc.Label).string = Global.FormatNumToComma(tn_info.init_coin);
        // 判断比赛是否开始
        if (currTime < tn_info.start_time) {
            // 游戏未开始
            // 显示没有开始
            cc.find("node_players", this.node_prize).getComponentInChildren("ListView").numItems = 0;
            cc.find("node_pool", this.node_prize).getComponentInChildren("ListView").numItems = 0;
            cc.find("node_pool/node_nodata", this.node_prize).active = true;
            cc.find("node_players/node_nodata", this.node_prize).active = true;
            cc.find("node_pool_total/layout/value", this.node_prize).getComponent(cc.Label).string = "";
            cc.find("node_player_total/layout/value", this.node_prize).getComponent(cc.Label).string = "";
            cc.find("node_time/layout/value", this.node_prize).getComponent(cc.Label).string = "";
        } else {
            // 游戏进行中
            cc.find("node_pool/node_nodata", this.node_prize).active = false;
            cc.find("node_players/node_nodata", this.node_prize).active = false;
            cc.find("node_pool_total/layout/value", this.node_prize).getComponent(cc.Label).string = Global.FormatNumToComma(tn_info.pool_prize);
            cc.find("node_player_total/layout/value", this.node_prize).getComponent(cc.Label).string = tn_info.join_cnt + "/" + tn_info.curr_cnt;
            // 游戏开始的时间
            // 判断是否结束
            if (currTime > tn_info.stop_time) {
                let alreadyTime = tn_info.stop_time - tn_info.start_time;
                cc.find("node_time/layout/value", this.node_prize).getComponent(cc.Label).string = Global.formatSecond(alreadyTime, "mm:ss");
            } else {
                let alreadyTime = currTime - tn_info.start_time;
                cc.find("node_time/layout/value", this.node_prize).getComponent(cc.Label).string = Global.formatSecond(alreadyTime, "mm:ss");
                this.schedule(() => {
                    cc.find("node_time/layout/value", this.node_prize).getComponent(cc.Label).string = Global.formatSecond(++alreadyTime, "mm:ss");
                }, 1)
            }
            // 报名的人列表
            cc.find("node_players", this.node_prize).getComponentInChildren("ListView").numItems = tn_info.players.length;
            // 奖池分成列表
            cc.find("node_pool", this.node_prize).getComponentInChildren("ListView").numItems = tn_info.win_ratio.length;
        }
        // 判断自己是否有奖励
        for (const info of this.localData.tn_info.players) {
            if (cc.vv.UserManager.uid == info.uid) {
                this.selfInfo = info;
            }
        }
        if (this.selfInfo && this.selfInfo.rewards && cc.director.getScene().name != Global.SCENE_NAME.HALL) {
            this.node_prize.height = 966;
            this.node_rule.height = 966;
            this.btn_get.node.active = true;
        } else {
            this.node_prize.height = 1030;
            this.node_rule.height = 1030;
            this.btn_get.node.active = false;
        }
    }

    onUpdateItemPool(item, index) {
        let ratio = this.localData.tn_info.win_ratio[index];
        let ord = index + 1;
        cc.find("icon_1", item).active = ord == 1;
        cc.find("icon_2", item).active = ord == 2;
        cc.find("icon_3", item).active = ord == 3;
        cc.find("ord", item).active = ord >= 4;
        cc.find("ord", item).getComponent(cc.Label).string = ord;
        // if (data.rewards) {
        cc.find("value", item).active = true;
        cc.find("value", item).getComponent(cc.Label).string = Global.FormatNumToComma(this.localData.tn_info.pool_prize * ratio / 100);
        // } else {
        //     cc.find("value", item).active = false;
        // }
    }

    onUpdateItemPlayer(item, index) {
        let data = this.localData.tn_info.players[index];
        data.ord = data.ord || index + 1;
        cc.find("icon_1", item).active = data.ord == 1;
        cc.find("icon_2", item).active = data.ord == 2;
        cc.find("icon_3", item).active = data.ord == 3;
        cc.find("ord", item).active = data.ord >= 4;
        cc.find("ord", item).getComponent(cc.Label).string = data.ord;
        if (data.rewards) {
            cc.find("layout/coin", item).active = true;
            cc.find("layout/coin", item).getComponent(cc.Label).string = data.rewards[0].count;
        } else {
            cc.find("layout/coin", item).active = false;
        }
        cc.find("layout/value", item).getComponent(cc.Label).string = data.playername || "";
        cc.find("bg_self", item).active = cc.vv.UserManager.uid == data.uid;
    }

    // 点击领取奖励
    onClickGet() {
        Global.RewardFly(this.selfInfo.rewards, this.btn_get.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        cc.vv.PopupManager.removePopup(this.node);
    }

}
