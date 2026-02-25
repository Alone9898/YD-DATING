/**
 * CH 弹窗基类
 * 1 挂载节点如果有Animation节点 第一个是弹出，第二个是idle状态播放，第三个是关闭
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _cmpAni:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._cmpAni = this.node.getComponent(cc.Animation)
        this._cmpAni.on('finished',this.uiPlayFinish,this)
    },

    start () {
        if(this._cmpAni){
            let clipname = this._getClipName(0)
            if(clipname){
                this._cmpAni.play(clipname)
            }
            
        }
    },

    //设置外部执行函数，在弹出动画结束
    setShowEndCall:function(val){
        this._startCall = val
    },

    //开始动画显示完成
    startShowEnd:function(){
        let idle = this._getClipName(1)
        if(idle){
            this._cmpAni.play(idle)
        }
        if(this._startCall){
            this._startCall()
        }
    },

    uiPlayFinish:function(type,state){
        let name = state.name
        if(name == this._getClipName(0)){
            this.startShowEnd()
        }
    },

    _getClipName(idx){
        if(this._cmpAni){
            let clips = this._cmpAni.getClips()
            if (clips[idx]){
                return clips[idx]._name
            }
        }
    }

    // update (dt) {},
});
