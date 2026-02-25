const { ccclass, property } = cc._decorator;



let _R_TIPS_COIN_RECHARDGE = 126032;     // 金币充值提示

/**
 * 提示
 */
@ccclass
export class PBTipsCoinRecharge extends cc.Component {
    tempData: any;
    onLoad() {
        this.tempData = {};

        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.R_TIPS_COIN_RECHARDGE, this.R_TIPS_COIN_RECHARDGE, this);
        this.show(false);
        this.scheduleOnce(() => {
            let msg = this.tempData["R_TIPS_COIN_RECHARDGE_MSG"];
            if (msg) {
                this.R_TIPS_COIN_RECHARDGE(msg);
                this.tempData["R_TIPS_COIN_RECHARDGE_MSG"] = null;
            }
        })
    }

    R_TIPS_COIN_RECHARDGE(dic: any) {
        let dangerUids: number[] = dic.dangerUids;
        if (dangerUids && dangerUids.includes(cc.vv.UserManager.uid)) {
            this.show();
            this.unscheduleAllCallbacks();
            this.scheduleOnce(() => {
                this.show(false);
            }, 60);
        }
    }

    /**
     * 显示金币充值提示
     */
    show(boo = true) {
        if (Global.isSingle()) {
            this.node.active = false;
            return;
        }
        let tips_coin_recharge = this.node;
        if (!tips_coin_recharge) {
            return;
        }
        if (boo) {
            if (!tips_coin_recharge.active) {
                tips_coin_recharge.active = true;
                let spine = tips_coin_recharge.getChildByName("spine").getComponent(sp.Skeleton);
                spine.setAnimation(0, "animation", true);
            }
            cc.vv.FloatTip.show(___("You are about to run out of gold coins!"));
        } else {
            tips_coin_recharge.active = false;
        }
    }
}