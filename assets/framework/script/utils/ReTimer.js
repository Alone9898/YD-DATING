/**
 * 倒计时组建
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _nInter:0
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    /**
     * 
     * @param {*} nTime 倒计时(单位s)
     * @param {*} nStep 步长（单位s）
     * @param formatStr 显示样式: "(%ss)"
     * @param perCall 每步的调用
     */
    setReTimer:function(nTime,nStep,endCall,formatStr,perCall){
        this._bStop = null
        this._nInter = 0
        this._nTime = nTime
        this._nStep = nStep
        this._endCall = endCall
        this._perCall = perCall
        this._formatStr = formatStr
        this._showTime(this._nTime)
    },

    _showTime:function(val){
        
        if(this._formatStr){
            this.node.getComponent(cc.Label).string = cc.js.formatStr(this._formatStr,val)
        }
        else{
            this.node.getComponent(cc.Label).string = Global.formatSec(val,null,true) 
        }
        
    },

    update (dt) {
        if(this._bStop) return
        
        this._nInter += dt;
        
        if(this._nInter>=this._nStep){
            this._nInter = 0
            this._nTime -= 1
            if(this._nTime < 0){
                this._nTime = 0
            }
            this._showTime(this._nTime)
            if(this._perCall) this._perCall(this._nTime)
            if(this._nTime<=0){
                this._bStop = true
                if(this._endCall){
                    this._endCall()
                }
            }
        }
    },
});
