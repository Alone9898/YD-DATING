
cc.Class({
    extends: require("LMSlots_Logic_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    InitCommComponent() {
        this._super();

        let script_popup = this.node.addComponent("Xerxes_Popup");
        cc.vv.gameData.setPopupScript(script_popup);
        script_popup.Init();

        let script_bonus = this.node.addComponent("Xerxes_BonusSlots");
        cc.vv.gameData.setBonusSlots(script_bonus);
        script_bonus.Init();
    },

    // update (dt) {},
});
