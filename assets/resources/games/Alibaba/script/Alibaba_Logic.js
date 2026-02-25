/**
 * @author Cui Guoyang
 * @date 2021/9/24
 * @description
 */

cc.Class({
    extends: require("LMSlots_Logic_Base"),

    properties: {
        _lockBonus: false,
    },

    onLoad () {
        this._super();

        let deskInfo = cc.vv.gameData.getDeskInfo();
        this._lockBonus = deskInfo.needBet > deskInfo.currmult;

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED, this.onUpdateBet, this);
    },

    InitCommComponent:function() {
        this._super();

        let bonusuinode = cc.find('safe_node/bonusgame',this.node);
        let scp_bonus = bonusuinode.addComponent('Alibaba_BonusGameMgr');
        cc.vv.gameData.setBonusGameMgr(scp_bonus);
        scp_bonus.Init();
    },

    onUpdateBet: function () {
        let deskInfo = cc.vv.gameData.getDeskInfo();
        let script = cc.find("safe_node/slots/collect_node/bonus_node/lock", this.node).getComponent(sp.Skeleton);
        let double_fortune = cc.find("safe_node/LMSlots_PrizePool_1/double_fortune", this.node).getComponent(sp.Skeleton);
        // let box = cc.find("safe_node/slots/collect_node/box", this.node).getComponent(sp.Skeleton);
        let gold = cc.find("safe_node/slots/collect_node/gold", this.node).getComponent(sp.Skeleton);
        if (deskInfo.needBet <= cc.vv.gameData.GetBetIdx() && this._lockBonus) {
            Global.SlotsSoundMgr.playEffect("mapunlock");
            script.setAnimation(0, "Bet1_unlock", false);
            double_fortune.setAnimation(0, "bet2_unlock", false);
            // box.setAnimation(0, "box_idle", true);
            gold.setAnimation(0, "collect_gold_idle", true);
            this._lockBonus = false;
        } else if (deskInfo.needBet > cc.vv.gameData.GetBetIdx() && !this._lockBonus) {
            Global.SlotsSoundMgr.playEffect("lock");
            this._lockBonus = true;
            script.setAnimation(0, "Bet1_lock", false);
            script.addAnimation(0, "Bet1_lock_idle", true);
            double_fortune.setAnimation(0, "bet2_lock", false);
            double_fortune.addAnimation(0, "bet2_lock_idle", true);
            // box.setAnimation(0, "box", true);
            gold.setAnimation(0, "collect_gold", true);
        }
    },
});