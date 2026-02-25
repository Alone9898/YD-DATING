/**
 * @author Cui Guoyang
 * @date 2021/8/30
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

    onUpdateBet: function () {
        let deskInfo = cc.vv.gameData.getDeskInfo();
        let script = cc.find("safe_node/slots/collect_node/bonus_node/lock", this.node).getComponent(sp.Skeleton);
        if (deskInfo.needBet <= cc.vv.gameData.GetBetIdx() && this._lockBonus) {
            Global.SlotsSoundMgr.playEffect("unlock");
            script.setAnimation(0, "BetUp_Intro", false);
            this._lockBonus = false;
        } else if (deskInfo.needBet > cc.vv.gameData.GetBetIdx() && !this._lockBonus) {
            Global.SlotsSoundMgr.playEffect("lock");
            this._lockBonus = true;
            script.setAnimation(0, "BetUp_End", false);
            script.addAnimation(0, "BetUp_Loop", true);
        }
    },
});