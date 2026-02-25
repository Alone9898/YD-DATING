/**
 * 生命周期函数监听回调
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _destroyCall:null,
        _startCall:null,
        _disableCall:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {
        if(cc.isValid(this._startCall)){
            this._startCall()
        }
    },

    onDestroy(){
        if(cc.isValid(this._destroyCall)){
            this._destroyCall()
        }
    },

    onDisable(){
        if(cc.isValid(this._disableCall)){
            this._disableCall()
        }
    },

    /**
     * start时执行的回调
     * @param {*} callback 
     */
    setStartCall:function(callback){
        this._startCall = callback
    },

    /**
     * 销毁时执行的回调
     * @param {*} callback 
     */
    setDestroyCall:function(callback){
        this._destroyCall = callback
    },

    setDisableCall:function(callback){
        this._disableCall = callback
    }

    // update (dt) {},
});
