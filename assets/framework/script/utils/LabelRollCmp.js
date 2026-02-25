/**
 * 数字滚动组件
 * @class LabelRollCmp
 */
cc.Class({
    extends:cc.Component,

    properties: {
        label:cc.Label,
        formatCurrency:true,
        template:"",
        _value:0,   // 数字值
        value:{
            type:cc.Integer,
            get() {
                return this._value;
            },
            set(v) {
                this._value = v;
                if(!this.label) {
                    this.label = this.node.getComponent(cc.Label);
                }
                if(this.formatCurrency) {
                    if(this.template) {
                        this.label.string = this.template.replace("{0}", Global.FormatNumToComma(Math.floor(v)));
                    }else {
                        this.label.string = Global.FormatNumToComma(Math.floor(v));
                    }
                }else {
                    this.label.string = value.toString();
                }
            }
        }
    },

    onLoad() {
        
    },

    /**
     * 开始滚动数字
     * @param {number} startV 开始滚动的值
     * @param {number} endV 结束滚动的值
     * @param {number} time 滚动事件
     */
    startRoll(startV, endV, time, cb) {
        startV = startV || 0;
        endV = endV || 0;
        time = time || 1.5;
        this.value = startV;
        this._tweenObj = cc.tween(this)
            .to(time, {value:endV})
            .call(()=>{
                if(cb) {
                    cb();
                }
            })
            .start();
    },

    stopRoll(){
        if(this._tweenObj){
            this._tweenObj.stop()
        }
        
    }
});