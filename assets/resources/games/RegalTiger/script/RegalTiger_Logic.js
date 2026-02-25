
cc.Class({
    extends: require('LMSlots_Logic_Base'),

    properties: {
        
    },

    onLoad () {
        
        //免费游戏脚本
        let script_freegame = this.node.addComponent('RegalTiger_FreeGame');
        cc.vv.gameData.SetGameScript(script_freegame);

        let uinode = cc.find('safe_node/gameui',this.node);
        let uimgr = uinode.addComponent('RegalTiger_UIMgr');
        cc.vv.gameData.SetUIMgrScript(uimgr);
        
        this._super();
    },

});
