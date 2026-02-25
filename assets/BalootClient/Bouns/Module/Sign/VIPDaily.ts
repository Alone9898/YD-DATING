import RewardListCpt from "../../../../_FWExpand/UI/RewardListCpt";
import TimeDownCpt from "../../../../_FWExpand/UI/TimeDownCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VIPDaily extends cc.Component {

    @property(RewardListCpt)
    rewardList: RewardListCpt = null;

    @property(cc.Node)
    infoNode: cc.Node = null;

    @property(cc.Node)
    lockNode: cc.Node = null;

    @property(cc.Button)
    jumpBtn: cc.Button = null;
    @property(cc.Button)
    jumpBtn2: cc.Button = null;

    @property(cc.Button)
    getBtn: cc.Button = null;

    @property(TimeDownCpt)
    timeDown: TimeDownCpt = null;

    @property(cc.Prefab)
    vipShopPrefab: cc.Prefab = null;

    netListener: any;
    localData: any;
    eventListener: any;


    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");
        this.getBtn.node.on("click", this.onClickGet, this);
        this.jumpBtn.node.on("click", this.onClickJump, this);
        this.jumpBtn2.node.on("click", this.onClickJump, this);
        this.infoNode.active = false;
        this.lockNode.active = false;
        // 倒计时回调
        this.timeDown.setCallback(() => {
            cc.vv.NetManager.send({ c: MsgId.VIP_DAILY_VIEW });
        })

    }

    protected onEnable(): void {
        // 购买成功
        this.eventListener.registerEvent("PURCHASE_VIP_SUC", this.PURCHASE_VIP_SUC, this);
        this.netListener.registerMsg(MsgId.VIP_DAILY_VIEW, this.VIP_DAILY_VIEW, this);
        this.netListener.registerMsg(MsgId.REQU_GET_VIP_REWARD, this.REQU_GET_VIP_REWARD, this);
        cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_DAILY_VIEW });
    }

    protected onDisable(): void {
        this.netListener.clear();
        this.eventListener.clear();
    }

    VIP_DAILY_VIEW(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            return;
        }
        this.localData = msg;
        // 请求刷新
        this.updateView();
    }

    onClickGet() {
        cc.vv.NetManager.send({ c: MsgId.REQU_GET_VIP_REWARD, stype: 14 });
    }

    onClickJump() {
        // 判断是否过期
        if (cc.vv.UserManager.getVip() < 4) {
            // 打开VIP5直充礼包
            cc.vv.PopupManager.addPopup(this.vipShopPrefab, { scaleIn: true });
        } else {
            // 去开通vip
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 2 });
        }
    }

    // 领取vip每日奖励返回
    REQU_GET_VIP_REWARD(msg) {
        if (msg.code != 200) return;
        // 提示领取金币成功
        Global.RewardFly(msg.rewards, this.getBtn.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        // 修改本地数据
        this.localData.collect = 2;
        this.localData.timeout = msg.timeout;
        this.updateView();
    }
    // 购买直冲礼包成功
    PURCHASE_VIP_SUC() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_DAILY_VIEW });
    }

    updateView() {

        if (cc.vv.UserManager.svip > 0) {
            this.rewardList.node.scale = 1;
            this.rewardList.node.y = 52.5;
        } else {
            this.rewardList.node.scale = 0.8;
            this.rewardList.node.y = 81;
        }


        this.rewardList.updateView(this.localData.rewards)
        cc.vv.UserConfig.setVipFrame(cc.find('icon', this.node).getComponent(cc.Sprite), cc.vv.UserManager.svip);
        this.infoNode.active = false;
        this.lockNode.active = false;
        if (cc.vv.UserManager.svip > 0) {
            this.infoNode.active = true;
            cc.find('label', this.infoNode).getComponent(cc.Label).string = ___("VIP剩余时间{1}天", this.localData.leftdays)
            if (this.localData.collect == 1) {
                this.getBtn.node.active = true;
                this.timeDown.node.active = false;
            } else {
                this.getBtn.node.active = false;
                this.timeDown.node.active = true;
                this.timeDown.timelife = this.localData.timeout || 10000;
            }
            this.getBtn.node.active = this.localData.collect == 1;
            this.timeDown.node.active = this.localData.collect != 1;
        } else {
            this.lockNode.active = true;
        }
    }

}
