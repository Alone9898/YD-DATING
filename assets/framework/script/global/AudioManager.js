/*
** 声音资源管理器
** 播放背景音乐，音效的封装
** 切换语言的处理
*/

let BGM_VOL_MAX = 1.0

cc.Class({
    extends: cc.Component,

    statics: {
        bgmVolume:BGM_VOL_MAX,
        effVolume:1.0,

        bgmAudioId: -1, //背景音乐Id
        //背保存景音乐临时子目录url，用于切换语言时使用
        tempBgmCfg: JSON.stringify({suburl: '',iscommon: false}), 

        //语言类型
        languageType: 0,
        //枚举具体类型
        CHINESE: 0,
        ENGLISH: 1,
        soundEffectList:null,
        bgmUrl:"",

        init: function () {
            var tBgm = Global.getLocal('bgmVolume', this.bgmVolume);
            if(cc.js.isNumber(Number(tBgm))){
                this.bgmVolume = parseFloat(tBgm)
            }

            var tEff = Global.getLocal('effVolume', this.effVolume);
            if(cc.js.isNumber(Number(tEff))){
                this.effVolume = parseFloat(tEff)
            }

            var t = Global.getLocal('languageType', this.languageType);
            this.languageType = parseInt(t);

            this.tempBgmCfg = {suburl: '',iscommon: false};

            cc.game.on(cc.game.EVENT_HIDE, this.onBackGround.bind(this));
            cc.game.on(cc.game.EVENT_SHOW, this.onEnterFront.bind(this));
            this.soundEffectList = new Map();
        },

        //进入后台
        onBackGround: function () {
            this.pauseAll();
        },
        
        //进入前台
        onEnterFront: function () {
            this.resumeAll();
        },

        //获取声音资源路径（这里可以用来处理国际化音效）
        //iscommon 是否共用
        getSoundURL: function (subpath, filename, iscommon) {
            var path = '';
            path += subpath;
            path += 'audio/'

            if (!iscommon) {
                if (this.languageType == this.ENGLISH || Global.language == 'en') {
                    path += 'english/';
                }
                else {
                    path += 'chinese/'; //默认中文
                }
            }

            //如果扩展名不是.mp3和.ogg那么就设置成.mp3 如果是.ogg就直接播放
            // let fileExType = '';
            // if (filename.length > 4){
            //     fileExType = filename.substring(filename.length - 4, filename.length)
            // }
            // if (fileExType != '.mp3' && fileExType != '.ogg'){
            //     filename += '.mp3';
            // }
            //引擎升级后用load的形式了，所以不需要后缀
            let file =filename
            // if (fileExType == '.mp3' && fileExType == '.ogg'){
            //     file = filename.substring(0,filename.length - 4)
            // }
            var fullpath = path + file
            // cc.log("---------fullpath:",fullpath);
            return fullpath
        },

        //iscommon 是否共用
        //curVolum 当前这个背景音乐的音量,如果有设置的话，就不使用默认的音量
        playBgm: function (subpath, filename, iscommon,curVolum, cb, loop=true) {
            let self = this
            cc.log('play Bgm music: ', subpath, " file:", filename);
            this._cb = null
            this.tempBgmCfg.subpath = subpath;
            this.tempBgmCfg.filename = filename;
            this.tempBgmCfg.iscommon = iscommon;

            var audiourl = this.getSoundURL(subpath, filename, iscommon);
            if(this.bgmUrl!== audiourl){
                if (this.bgmAudioId >= 0) {
                    cc.audioEngine.stop(this.bgmAudioId);
                }
                let bgmVol = this.bgmVolume
                if(curVolum && this.bgmVolume > 0){ //如果bgmVolume=0表示已经静音了
                    bgmVol = curVolum
                }
                cc.loader.loadRes(audiourl,cc.AudioClip, (err, audioClip) => {
                    if(!err){
                        cc.audioEngine.setMusicVolume(bgmVol)
                        self.bgmAudioId = cc.audioEngine.playMusic(audioClip, loop );
                        if (cb) {
                            self._cb = cb;
                            cc.audioEngine.setFinishCallback(self.bgmAudioId, function(){
                                if(self._cb){
                                    self._cb();
                                    self._cb = null;
                                }
                                
                            });
                        }
                    }
                    else{
                        cc.log(err)
                    }
                })
                
                this.bgmUrl = audiourl;
            }
            return this.bgmAudioId;

        },

        stopBgm: function() {
            if (this.bgmAudioId >= 0) {
                cc.audioEngine.stop(this.bgmAudioId);
                if(this._cb){
                    this._cb();
                    this._cb = null;
                }
                this.bgmAudioId = -1;
                this.bgmUrl = "";
            }
        },


        setClearBgmCall:function(){
            this._cb = null
        },

        playAudioClip: function (audioClip, loop, callback, volume) {
            let soundId = null;
            let playVol = volume?volume:this.effVolume;
            soundId = cc.audioEngine.play(audioClip, loop, playVol);
            this.soundEffectList.set(soundId,audioClip.name);
            cc.audioEngine.setFinishCallback(soundId,(event)=>{
                this.soundEffectList.delete(soundId);
                if(callback) callback();
            });
            return soundId;
        },

        playBGMClip: function (audioClip, loop = true, callback, curVolum) {
            if (this.bgmAudioId >= 0) {
                cc.audioEngine.stop(this.bgmAudioId);
            }
            let bgmVol = this.bgmVolume
            if(curVolum && this.bgmVolume > 0){ //如果bgmVolume=0表示已经静音了
                bgmVol = curVolum
            }
            cc.audioEngine.setMusicVolume(bgmVol)
            this.bgmAudioId = cc.audioEngine.playMusic(audioClip, loop );
            if (callback) {
                this._cb = callback;
                cc.audioEngine.setFinishCallback(this.bgmAudioId, ()=>{
                    if(this._cb){
                        this._cb();
                        this._cb = null;
                    }
                });
            }
            return this.bgmAudioId;
        },

        //iscommon 是否共用
        playEff: function (subpath, filename, iscommon,loop = false,callback,volume,loadFinishCall) {
            let self = this
            if(filename){
                cc.log('Effect:'+filename)
                var audiourl = this.getSoundURL(subpath, filename, iscommon);
                let playVol = volume?volume:this.effVolume
                let soundId //= cc.audioEngine.play(audiourl, loop, volume?volume:this.effVolume);
                cc.loader.loadRes(audiourl,cc.AudioClip, (err, audioClip) => {
                    if(!err){
                        cc.audioEngine.setEffectsVolume(playVol)
                        soundId = cc.audioEngine.playEffect(audioClip, loop);
                        if(loadFinishCall){
                            loadFinishCall(soundId)
                        }
                        self.soundEffectList.set(soundId,audioClip.name);
                        cc.audioEngine.setFinishCallback(soundId,(event)=>{
                            self.soundEffectList.delete(soundId);
                            if(callback) callback();
                        });
                    }
                    else{
                        cc.log(err)
                    }
                })
                // this.soundEffectList.set(soundId,audiourl);
                // cc.audioEngine.setFinishCallback(soundId,(event)=>{
                //     this.soundEffectList.delete(soundId);
                //     if(callback) callback();
                // });
                // return soundId;
            }
            
        },

        playSimpleEff: function(pathfile) {
            let self = this;
            cc.loader.loadRes(pathfile, cc.AudioClip, (err, audioClip) => {
                if (!err) {
                    cc.audioEngine.setEffectsVolume(this.effVolume);
                    let soundId = cc.audioEngine.playEffect(audioClip, false);
                    self.soundEffectList.set(soundId,audioClip.name);
                    cc.audioEngine.setFinishCallback(soundId, (event)=>{
                        self.soundEffectList.delete(soundId);
                    });
                }
            });
        },

        setEffVolume: function (volume) {
            if (this.effVolume != volume) {
                this.effVolume = volume
                Global.saveLocal('effVolume', this.effVolume);
            }
            for (let [key, value] of this.soundEffectList.entries()) {
                cc.audioEngine.setVolume(key,volume);
            }
        },

        setBgmVolume: function (volume) {
            if(volume > BGM_VOL_MAX){
                volume = BGM_VOL_MAX
            }
            if (this.bgmVolume != volume) {
                this.bgmVolume = volume;
                Global.saveLocal('bgmVolume', this.bgmVolume);
                
            }  
            cc.audioEngine.setMusicVolume(volume);
        },

        setLanguage: function ( languageType) {
            if (this.languageType != languageType) {
                if (languageType != this.CHINESE && languageType != this.ENGLISH) return;

                Global.saveLocal('languageType', languageType);
                this.languageType = languageType;

                if (!this.tempBgmCfg.iscommon) { //共用资源，音乐文件目录不变，不需要重播背景音乐
                    this.playBgm(this.tempBgmCfg.suburl, this.tempBgmCfg.filename,this.tempBgmCfg.iscommon)
                }
            }
        },

        getLanguage: function () {
            return this.languageType;  
        },

        getBgmVolume: function () {
            let val = cc.audioEngine.getMusicVolume()
            return val//this.bgmVolume  
        },

        getEffVolume: function () {
            return this.effVolume;
        },

        pauseBgm(){
            cc.audioEngine.pauseMusic()
        },

        resumeBgm(){
            cc.audioEngine.resumeMusic()
        },

        //暂停
        pauseAll: function () {
            cc.audioEngine.pauseAll();
        },

        //恢复
        resumeAll: function () {
            cc.audioEngine.resumeAll();
        },

        //停止播放
        stopAudio:function(audioId){
            for (let [key, value] of this.soundEffectList.entries()) {
                let isFind =false;
                if(key == audioId){
                    isFind = true
                }
                if(isFind){
                    cc.audioEngine.stop(key);
                    this.soundEffectList.delete(key);
                }
            }
        },

        // 停止所有音效 ，debarList排除
        stopAllEffect(debarList=[]){
            AppLog.log("!!!!!!!!!!!!!!stop all effect");
            for (let [key, value] of this.soundEffectList.entries()) {
                let isFind =false;
                for(let i=0;i<debarList.length;++i){
                    if(value.indexOf(debarList[i])>=0){
                        isFind = true;
                        break;
                    }
                }
                if(!isFind){
                    cc.audioEngine.stop(key);
                    this.soundEffectList.delete(key);
                }
            }
            if(debarList.length===0)this.soundEffectList.clear();
        },

        pauseAllEffect(){
            cc.audioEngine.pauseAllEffects()
        },

        resumeAllEffect(){
            cc.audioEngine.resumeAllEffects()
        },

        //停止某个音效
        stopEffectByName:function(effName){
            let isStop = false;
            for (let [key, value] of this.soundEffectList.entries()) {
                let isFind =false;
                if(value.indexOf(effName)>=0){
                    isFind = true
                }
                if(isFind){
                    cc.audioEngine.stop(key);
                    this.soundEffectList.delete(key);
                    isStop = true;
                }
            }
            return isStop;
        },

        stopAll:function(){
            this.bgmUrl = null
            cc.audioEngine.stopAll()
        }
    },
});
