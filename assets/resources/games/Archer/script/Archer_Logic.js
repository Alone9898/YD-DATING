
cc.Class({
    extends: require("LMSlots_Logic_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    InitCommComponent(){
        this._super();

        let script_popup = this.node.addComponent("Archer_Popup");
        script_popup.Init();
        cc.vv.gameData.setPopupScript(script_popup);

        let script_bonus = this.node.addComponent("Archer_BonusSlots");
        script_bonus.Init();
        cc.vv.gameData.setBonusScript(script_bonus);

        let node_slots = cc.find('Canvas/safe_node/slots');
        let script_slots = node_slots.getComponent("Archer_Slots");
        cc.vv.gameData.addSlotsScript(script_slots);

        let script_free = cc.find('Canvas/safe_node/slots_free').addComponent("Archer_FreeSlots");
        script_free.Init();
        cc.vv.gameData.setFreeScript(script_free);
        cc.vv.gameData.addSlotsScript(script_free);

        let script_manage = this.node.addComponent("Archer_Manage");
        // script_manage.Init();
        cc.vv.gameData.setManageScript(script_manage);

    },

    // update (dt) {},
});
