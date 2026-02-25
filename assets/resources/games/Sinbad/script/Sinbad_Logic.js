
cc.Class({
    extends: require("LMSlots_Logic_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    InitCommComponent() {
        this._super();

        let script_popup = this.node.addComponent("Sinbad_Popup");
        cc.vv.gameData.setPopupScript(script_popup);
        script_popup.Init();

        let script_collect = this.node.addComponent("Sinbad_Collect");
        cc.vv.gameData.setCollectScript(script_collect);
        script_collect.Init();

        let script_map = this.node.addComponent("Sinbad_Map");
        cc.vv.gameData.setMapScript(script_map);
        script_map.Init();

        let script_wheel = this.node.addComponent("Sinbad_Wheel");
        cc.vv.gameData.setWheelScript(script_wheel);
        script_wheel.Init();

        let script_bonus = this.node.addComponent("Sinbad_BonusSlots");
        cc.vv.gameData.setBonusSlotsScript(script_bonus);
        script_bonus.Init();
    },

    // update (dt) {},
});
