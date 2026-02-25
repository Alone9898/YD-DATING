/**
 * @class sound
 */
cc.Class({
    extends: cc.Component,

    properties: {
        playingBgm:null, //正在播放的不循环BGM
        soundPath:"",
      
    },

    onLoad () {
        Global.SlotsSoundMgr = this;

        //如果没有配置路径，有框架来给出
        if(!this.soundPath){
            this.soundPath = cc.vv.gameData.getGameDir()
        }
    },

    onDestroy() {
        Global.SlotsSoundMgr = null
    },

    /**
     * 播放音效
     * @param audioName
     */
    playEffect(audioName, isLoop=false, callBack=null) {
        if (audioName && audioName != "") {
            return cc.vv.AudioManager.playEff(this.soundPath, audioName, true, isLoop,callBack);
        }
    },

    /**
     * 同步的方式播放音效。用来解决：有些音效因为加载时间。界面可能都已经关闭了，才播放音效
     * @param {*} audioName 
     * @param {*} isLoop 
     * @param {*} callBack 
     */
    playEffectByUnSync(audioName, isLoop=false, callBack=null){
        return new Promise((resolve,reject) => {
            let loadfinish = function(){
                resolve()
            }
            cc.vv.AudioManager.playEff(this.soundPath, audioName, true, isLoop,callBack,null,loadfinish);
        })
    },

    /**
     * 停止音效
     * @param audioName
     */
    stopEffectByName(audioName) {
        cc.vv.AudioManager.stopEffectByName(audioName);
    },

    //循环的bgm
    playBgm(audioName) {
        if (audioName && audioName != "") {
            this.stopBgm()
            this.playingBgm = audioName
            cc.vv.AudioManager.playBgm(this.soundPath, audioName, true);
        }
    },


    //主要是正常模式下的BGM
    //文件名称需要在cfg中配置
    //设置bgm音量：默认设置成1了。可根据自己的游戏来调整
    playNormalBgm(isReplay = false,volume=1){
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.normalBgm){
            this.playUnLoopBgm(cfg.normalBgm, isReplay,volume)
        }
        else{
            cc.log('cfg未配置normalBgm')
        }
    },


    stopBgm() {
        this.playingBgm = null
        cc.vv.AudioManager.setClearBgmCall()
        cc.vv.AudioManager.stopBgm();  
    },

    /**
     * 播放不循环的BGM，
     * 
     */
    playUnLoopBgm(audioName, isReplay,volume){
        let self = this
        if (isReplay || !this.playingBgm) {
            this.stopBgm()
            self.playingBgm = audioName
            let endCall = function(){
                self.playingBgm = null
                self.bCheckNext = true
            }
            cc.vv.AudioManager.playBgm(this.soundPath, audioName, true, volume,endCall,false);
        }
    },

    //公共路径下的音效
    playCommonEff(audioName){
        let compath = 'slots_common/SlotRes/'
        cc.vv.AudioManager.playEff(compath, audioName, true);
    },

    update(dt){
        if(this.bCheckNext){
            this.bCheckNext = null
            if(cc.vv.gameData && cc.vv.gameData.GetSlotState() != 'idle'){
                //还要继续播放
                this.playNormalBgm()
            }
        }
        
    }
});
