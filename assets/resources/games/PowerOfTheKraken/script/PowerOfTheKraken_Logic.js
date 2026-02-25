
cc.Class({
    extends: require('LMSlots_Logic_Base'),

    properties: {

    },

    InitCommComponent: function () {
        this._super();

        let scp_ui = this.node.addComponent('PowerOfTheKraken_Mgr');
        scp_ui.Init();
    },

});
