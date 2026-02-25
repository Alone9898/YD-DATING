
cc.Class({
    extends: require("LMSlots_Logic_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    InitCommComponent(){
        this._super();

        let script_popup = this.node.addComponent("Sphinx_Popup");
        script_popup.Init();
        cc.vv.gameData.setPopupScript(script_popup);

        let script_collect = this.node.addComponent("Sphinx_Collect");
        script_collect.Init();
        cc.vv.gameData.setCollectScript(script_collect);

        let script_pick = this.node.addComponent("Sphinx_Pick");
        script_pick.Init();
        cc.vv.gameData.setPickScript(script_pick);
    },


    // update (dt) {},
});
