
cc.Class({
    extends: require("Table_Observers"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    //点开玩家列表
    onClickWatchList:function(){
        Global.TableSoundMgr.playCommonEff("com_click")

        let url = "games/AladingWheel/prefab/rankOnlinePeoplelView";
        cc.vv.PopupManager.addPopup(url,{})
    },

    OnRcvNetObserList:function(msg){

    },

    // update (dt) {},
});
