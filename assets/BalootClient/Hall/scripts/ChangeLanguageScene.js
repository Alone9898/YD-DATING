cc.Class({
    extends: cc.Component,

    properties: {
    },

    start() {
        cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL);
    },

});
