/**
 * 启动动画
 */

cc.Class({
    extends: cc.Component,

    properties: {
        audio_clip: {
            default: null,
            type: cc.AudioClip
        },
        _nClickCount: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.sys.localStorage.removeItem('screen_log');
        let bg_btn = cc.find('DebugBtn', this.node)
        bg_btn.on("click", this.onClickBg, this)
    },

    onDestroy() {
        if (this.current) {
            cc.audioEngine.stop(this.current);
        }

    },

    start() {
        this.preloadLaunchScene()
        this.playLogoAni()
        
    },

    onClickBg: function () {
        this._nClickCount = this._nClickCount || 0
        this._nClickCount++
        if (this._nClickCount > 7) {
            let val = cc.sys.localStorage.getItem('screen_log');
            if (!val) {
                val = 1
                cc.sys.localStorage.setItem('screen_log', val);
            } else {
                val = 0
                cc.sys.localStorage.removeItem('screen_log');
            }
        }
    },

    preloadLaunchScene: function () {
        let self = this
        let name = "Launch_BC"
        cc.director.preloadScene(name, (err, scene) => {
            if (!err) {
                self._loadSceneSucc = true
            }
        })
    },

    playLogoAni: function () {
        this.current = cc.audioEngine.play(this.audio_clip, false, 1);
        cc.tween(this.node)
            .delay(2.8)
            .call(() => {
                this._playLogoAniSucc = true

            })
            .start()
    },

    startChangeScene() {
        let name = "Launch_BC"
        cc.director.loadScene(name)
    },

    _hideNativeSplash() {
        if (CC_JSB) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                // 反射调用原生的隐藏方法
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "hideSplash",
                    "()V"
                );
            }
        }
    },

    update(dt) {
        if (this._loadSceneSucc && this._playLogoAniSucc) {
            if (this._bStartChange) return
            this._bStartChange = true
            this.startChangeScene()
        }
    },
});
