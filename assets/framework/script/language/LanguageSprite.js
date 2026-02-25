/**
 * 多语言图片显示：支持cc.Sprite
 * 图片的话，尽量背景和文字拆分开来
 */
cc.Class({
    extends: require("LanguageUIBase"),

    properties: {
     
        zh_sprite:{
            default:null,
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.ZH)},
            type:cc.SpriteFrame,
            displayName:"中文翻译图片"
        },
        en_sprite:{
            default:null,
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.EN)},
            type:cc.SpriteFrame,
            displayName:"英文翻译图片"
        },
        ind_sprite:{
            default:null,
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.IDA)},
            type:cc.SpriteFrame,
            tooltip:"没设置的话，就显示英文资源",
            displayName:"印度文翻译图片"
        },
        ar_sprite:{
            default:null,
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.AR)},
            type:cc.SpriteFrame,
            tooltip:"阿拉伯文资源",
            displayName:"阿拉伯文翻译图片"
        },

        _changeCall:null,
    },

    // LIFE-CYCLE CALLBACKS:

    updateSpirte(){
        if(Global.language === Global.LANGUAGE.ZH)  {
            if (this.zh_sprite) {
                this.getComponent(cc.Sprite).spriteFrame = this.zh_sprite;
            }
            else{
                if(this._changeCall){
                    this._changeCall()
                }
            }
        }
        else if(Global.language === Global.LANGUAGE.EN) {
            if (this.en_sprite) {
                this.getComponent(cc.Sprite).spriteFrame = this.en_sprite;
            }
            else{
                if(this._changeCall){
                    this._changeCall()
                }
            }
            
        }
        else if(Global.language === Global.LANGUAGE.IDA){
            if(this.ind_sprite){//印度语没配置的话，就显示英文
                this.getComponent(cc.Sprite).spriteFrame = this.ind_sprite;
            }else if(this.en_sprite){
                this.getComponent(cc.Sprite).spriteFrame = this.en_sprite;
            }
            else{
                if(this._changeCall){
                    this._changeCall()
                }
            }
            
        }
        else if(Global.language === Global.LANGUAGE.AR){
            if(this.ar_sprite){
                this.getComponent(cc.Sprite).spriteFrame = this.ar_sprite;
            }
            else{
                if(this._changeCall){
                    this._changeCall()
                }
            }
            
        }
    },

    /**
     * 外部设置多语言图片
     * @param {*} layType 
     * @param {*} val 
     */
    setSptite(layType,val){
        if(layType === Global.LANGUAGE.ZH)  {
            this.zh_sprite = val
        }
        else if(layType === Global.LANGUAGE.EN) {
            this.en_sprite = val
        }
        else if(layType === Global.LANGUAGE.IDA){
            this.ind_sprite = val
        }
        else if(layType === Global.LANGUAGE.AR){
            this.ar_sprite = val
        }
    },

    /**
     * 外部自己根据语言控制多语言图片的显示
     * @param {*} changeCall 
     */
    setSpriteChangeCall(changeCall){
        this._changeCall = changeCall
        this.updateSpirte()
    },

    start () {
        this.updateSpirte();
    },

    display(){
        this._super()
        this.updateSpirte()
    }

    // update (dt) {},
});
