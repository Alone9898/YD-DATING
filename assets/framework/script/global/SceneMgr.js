/**
 * 
 */
cc.Class({
    extends: cc.Component,

    statics: {
        params: null,


        enterScene(sceneName,callback,orientation){
            cc.director.resume()
            cc.vv.AudioManager.stopAllEffect(["btn_click","lobby_click","game_loading"]);
            if(cc.vv.FloatTip) cc.vv.FloatTip.clear();
            let curScene = cc.director.getScene();
            if(curScene.name === sceneName) return;
            AppLog.log("@@@@@@@@@@@@@@@@@@sceneName:" + sceneName);
            Global.dispatchEvent(EventId.HIDE_SHOP)
            
            if(curScene.name == Global.SCENE_NAME.HALL ){
                Global.dispatchEvent(EventId.HALL_RECYCLE_ITEM);
            }
            let enterSceneName = sceneName;
            if(sceneName === Global.SCENE_NAME.LOGIN){
                cc.vv.AudioManager.stopAll()
                cc.vv.AppData.clearGameId();
                orientation='portrait';
            }
            else if(sceneName === Global.SCENE_NAME.HOTUPDATE){
                cc.vv.AppData.clearGameId();
                orientation='portrait';
            }
            else if(sceneName === 'solt_loading'){

            }
            else if(sceneName === Global.SCENE_NAME.HALL ){
                cc.vv.AppData.clearGameId();
                if(cc.vv.gameData) cc.vv.gameData.onExit();
                orientation='portrait';
            }
            else if(sceneName === Global.SCENE_NAME.HALL_PRELOAD || sceneName == Global.SCENE_NAME.SLOT_BACKLOBBY){
                orientation='portrait';
            }
            if (orientation) {
                
            }
            else{ //没有配置的就是就是横版
                
                orientation = "landscape"
            }
            cc.vv.PlatformApiMgr.setOrientation(orientation);
            if(cc.vv.BroadcastManager){
                cc.vv.BroadcastManager.stop()
            }
            cc.director.loadScene(sceneName,(err,targScene)=>{
                
                if(enterSceneName === Global.SCENE_NAME.HALL || enterSceneName === Global.SCENE_NAME.LOGIN || enterSceneName == Global.SCENE_NAME.QUEST) {
                    
                    if(cc.vv.gameData) cc.vv.gameData.clear();
                }
                //大厅就不自动释放了
                if(!err && targScene){
                    targScene.autoReleaseAssets  = true //自动释放资源
                }
                    
                if(cc.vv.BroadcastManager){
                    cc.vv.BroadcastManager.run()
                }
                if(callback) callback(err,targScene);
            });
        },

        GetCurSceneName(){
            return cc.director.getScene().name
        },

        //是否再大厅场景
        isInHallScene(){
            let self = this
            let curScene = cc.director.getScene();
            if(curScene.name === Global.SCENE_NAME.HALL ) {
                return true
            }
            return false
        },

        //是否在登录场景
        isInLoginScene(){
            let self = this
            let curScene = cc.director.getScene();
            if(curScene.name === Global.SCENE_NAME.LOGIN) {
                return true
            }
            return false
        },

        //是否可以显示大厅预加载场景
        CanShowHallPreLoading(){
            let curScene = cc.director.getScene();
            if(curScene.name === Global.SCENE_NAME.LOGIN || curScene.name === Global.SCENE_NAME.HOTUPDATE || curScene.name == Global.SCENE_NAME.LAUNCH) {
                return true
            }
            return false
        },

        setParams(params) {
            this.params = params;
        },

        getParams(clean=true) {
            let params = this.params;
            if (clean) this.params = null;
            return params;
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},


    // update (dt) {},
});
