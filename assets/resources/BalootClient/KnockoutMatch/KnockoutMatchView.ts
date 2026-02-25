import KnockoutDetailsInfoView from "./scripts/KnockoutDetailsInfoView";
import KnockoutResultRegisterView from "./scripts/KnockoutResultRegisterView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutMatchView extends cc.Component {


    @property([cc.Node])
    headNodes: cc.Node[] = [];

    @property(cc.Node)
    infoNode: cc.Node = null;

    @property(cc.Node)
    listViewNode: cc.Node = null;

    @property(cc.Prefab)
    detailPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    registerHintPrefab: cc.Prefab = null;

    private netListener: any;
    private localData: any;
    private listView: any;

    get prizeUint() {
        return Global.isYDApp() ? "" : "@";
    }


    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.listView = this.listViewNode.getComponent("ListView");
    }

    protected onEnable(): void {
        this.netListener.registerMsg(MsgId.GET_KNOCKOUT_CONFIG, this.GET_KNOCKOUT_CONFIG, this);
        this.netListener.registerMsg(MsgId.REQ_KNOCKOUT_REGISTER, this.REQ_KNOCKOUT_REGISTER, this);
        // 启用定时刷新界面
        this.schedule(this.updateView.bind(this), 1);
        this.schedule(this.reqConfig.bind(this), 30);
        // 请求配置
        this.reqConfig();
    }
    protected onDisable(): void {
        this.netListener.clear();
        this.unscheduleAllCallbacks();
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

    // 报名结果
    REQ_KNOCKOUT_REGISTER(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        if (msg.is_auto) {
            // 自动发出进入房间请求
            Global.dispatchEvent("HALL_TO_GAME");
            cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_JOIN, tn_id: msg.tn_info.tn_id }, true);
        } else {
            // 提示取消或者报名成功
            cc.vv.PopupManager.addPopup(this.registerHintPrefab, {
                scaleIn: true,
                noCloseHit: true,
                onShow: (node) => {
                    node.getComponent(KnockoutResultRegisterView).onInit(msg.undo == 0, msg.tn_info);
                },
            })
        }
        // 更新数据
        this.reqConfig();
    }

    updateView() {
        if (!this.localData) return
        if (this.localData.his_winner) {
            // 更新上次前三名
            for (let i = 0; i < this.headNodes.length; i++) {
                const headNode = this.headNodes[i];
                let data = this.localData.his_winner.players[i];
                if (data) {
                    headNode.active = true;
                    cc.find("head", headNode).getComponent("HeadCmp").setHead(data.uid, data.usericon);
                    cc.find("head", headNode).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
                    cc.find("name/value", headNode).getComponent(cc.Label).string = data.playername;
                    cc.find("coin/value", headNode).getComponent(cc.Label).string = this.prizeUint + Global.FormatNumToComma(data.rewards[0].count);
                } else {
                    headNode.active = false;
                }
            }
            // 上局信息
            let lastInfo = this.localData.his_winner.tn_info;
            cc.find("label_time", this.infoNode).getComponent(cc.Label).string = Global.formatTime("hh:mm", lastInfo.start_time);
            cc.find("label_game", this.infoNode).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(lastInfo.gameid);
            cc.find("icon_pool/value", this.infoNode).getComponent(cc.Label).string = this.prizeUint + Global.FormatNumToComma(lastInfo.pool_prize);;
            cc.find("icon_buyin/value", this.infoNode).getComponent(cc.Label).string = Global.FormatNumToComma(lastInfo.buy_in);
        }
        // 排序
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
        // 游戏图标
        cc.vv.UserConfig.setGameCafeFrame(cc.find("game_icon", item).getComponent(cc.Sprite), data.gameid);
        cc.vv.UserConfig.setGameTitleFrame(cc.find("game_name", item).getComponent(cc.Sprite), data.gameid);
        // 开始时间
        cc.find("start_time/value", item).getComponent(cc.Label).string = Global.formatTime("hh:mm", data.start_time);
        // 人数
        cc.find("node_people/value", item).getComponent(cc.Label).string = ___("Players {1}/{2}", data.curr_cnt, data.max_cnt);
        // 奖池
        cc.find("icon_pool/value", item).getComponent(cc.Label).string = this.prizeUint + Global.FormatNumToComma(data.pool_prize);
        // 门票
        cc.find("icon_buyin/value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.buy_in);
        cc.find("icon_buyin", item).active = true;

        let currTime = Math.ceil(new Date().getTime() / 1000);
        cc.find("layout/btn_deregister", item).active = false;
        cc.find("layout/btn_register", item).active = false;
        cc.find("layout/btn_play", item).active = false;
        cc.find("layout/btn_play&register", item).active = false;
        cc.find("layout/label_running", item).active = false;
        cc.find("layout/label_end", item).active = false;
        cc.find("layout/label_registered", item).active = false;

        // 状态: 还未到时间,达到准备时间,已经进行
        let selfInfo = null;
        for (const info of data.players) {
            if (info.uid == cc.vv.UserManager.uid) {
                selfInfo = info;
            }
        }
        if (selfInfo && [2, 3].indexOf(selfInfo.state) >= 0) {
            cc.find("node_played", item).active = true;
        } else {
            cc.find("node_played", item).active = false;
        }

        // 判断是否参与过了
        if ([4, 5].indexOf(data.state) >= 0) {
            // 显示已结束
            cc.find("layout/label_end", item).active = true;
        } else if (selfInfo && [3].indexOf(selfInfo.state) >= 0) {
            // 如果自己被淘汰显示已结束
            cc.find("layout/label_running", item).active = true;
        } else if ([3].indexOf(data.state) >= 0) {
            // 显示进行中
            cc.find("layout/label_running", item).active = true;
        } else {
            if (currTime < (data.start_time - data.ahead_time)) {
                // 只能报名
                if (data.is_register == 1) {
                    if (Global.isYDApp()) {
                        cc.find("layout/btn_deregister", item).active = true;
                    } else {
                        cc.find("layout/label_registered", item).active = true;
                    }
                } else {
                    cc.find("layout/btn_register", item).active = true;
                }
            } else if (currTime < (data.start_time + data.deadline_time)) {
                // 可以直接报名进入等待区
                if (data.is_register == 1) {
                    if (Global.isYDApp()) {
                        cc.find("layout/btn_deregister", item).active = true;
                    }
                    cc.find("layout/btn_play", item).active = true;
                    cc.find("icon_buyin", item).active = false;
                } else {
                    cc.find("layout/btn_play&register", item).active = true;
                }
            } else if (currTime < data.stop_time) {
                // 显示进行中
                cc.find("layout/label_running", item).active = true;
            } else {
                // 显示已结束
                cc.find("layout/label_end", item).active = true;
            }
        }
    }

    onClickDetail(event) {
        let data = this.localData.list[event.currentTarget.parent._listId];
        cc.vv.PopupManager.addPopup(this.detailPrefab, {
            scaleIn: true,
            onShow: (node) => {
                node.getComponent(KnockoutDetailsInfoView).onInit(data.tn_id);
            }
        });
    }
    // 点击开始游戏
    onClickPlay(event) {
        Global.dispatchEvent("HALL_TO_GAME");
        let data = this.localData.list[event.currentTarget.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_JOIN, tn_id: data.tn_id }, true);
    }
    // 点击报名并且开始
    onClickPlayRegister(event) {
        let data = this.localData.list[event.currentTarget.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_REGISTER, tn_id: data.tn_id, undo: 0, is_auto: 1 });
    }
    // 点击报名
    onClickRegister(event) {
        let data = this.localData.list[event.currentTarget.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_REGISTER, tn_id: data.tn_id, undo: 0, is_auto: 0 });
    }
    // 点击取消报名
    onClickDeregister(event) {
        let data = this.localData.list[event.currentTarget.parent.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_REGISTER, tn_id: data.tn_id, undo: 1, is_auto: 0 });
    }

}