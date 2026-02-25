/**
 * 多语言字体修改.可支持的cc.Label,cc.RichText
 */
cc.Class({
    extends: require("LanguageUIBase"),

    properties: {
        Font_en:{
            default:null,
            type:cc.Font,
            displayName:"英文的字体",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.EN)},
        },
        Font_zh:{
            default:null,
            type:cc.Font,
            displayName:"中文的字体",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.ZH)},
        },
        Font_ind:{
            default:null,
            type:cc.Font,
            displayName:"印度文的字体",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.IDA)},
        },
        Font_ar:{
            default:null,
            type:cc.Font,
            displayName:"阿拉伯文的字体",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.AR)},
        },
    },

    // LIFE-CYCLE CALLBACKS:

    updateLabel(){

        let labObj = this.getComponent(cc.Label);
        if(!labObj){
            labObj = this.getComponent(cc.RichText);
        }
        if(labObj){
            //如果有配置字体，设置字体
            if(Global.language === Global.LANGUAGE.EN && this.Font_en){
                labObj.font = this.Font_en 
            }
            //如果有配置的中文字体
            if(Global.language === Global.LANGUAGE.ZH && this.Font_zh){
                labObj.font = this.Font_zh
            }
            if(Global.language === Global.LANGUAGE.IDA && this.Font_ind){
                labObj.font = this.Font_ind
            }
            if(Global.language === Global.LANGUAGE.AR && this.Font_ar){
                labObj.font = this.Font_ar
            }
        }
    },

    start () {
        this.updateLabel();
    },

    display(){
        this._super()
        this.updateLabel()
    }

    // update (dt) {},
});
