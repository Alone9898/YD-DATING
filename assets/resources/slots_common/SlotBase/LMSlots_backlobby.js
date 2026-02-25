/**
 * 退回大厅
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.autoAdaptDevices(false);
    },

    start () {
        this.preloadHall();
        cc.vv.UserManager.syncHallInfo()
        let testIpad = false
        if(testIpad || cc.sys.platform == cc.sys.IPAD){
            let login = cc.find('common_bg/logo_ani',this.node)
            login.scale = 0.8
        }
    },

    preloadHall:function(){
        let self = this
        this._preLoadHallFinish = false

        cc.director.preloadScene(Global.SCENE_NAME.HALL,(err,data)=>{
            self._preLoadHallFinish = true
        })
    },

    update (dt) {
        if(this._preLoadHallFinish){
            if(!this._bSend){
                this._bSend = true
                cc.vv.EventManager.emit(EventId.ENTER_HALL);
            }
            
        }
    },
});
