/**
 * 多语言SPINE动画显示
 * 同一个spine的多套皮肤，配置一下皮肤名称就好
 * 
 */

cc.Class({
    extends: require("LanguageUIBase"),

    properties: {
        en_sp:{
            default:"",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.EN)},
            displayName:"英文皮肤名"
        },
        ind_sp:{
            default:"",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.IDA)},
            tooltip:"没设置的话，就显示英文资源",
            displayName:"印度文皮肤名"
        },
        ar_sp:{
            default:"",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.AR)},
            tooltip:"阿拉伯文资源",
            displayName:"阿拉伯文皮肤名称"
        }
    },


    /**
     * 
     * 更新皮肤显示
     */
    updateSkin(){
        let spCmp = this.getComponent(sp.Skeleton);
        if(spCmp){
            let skinName
            if(Global.language === Global.LANGUAGE.EN && this.en_sp){
                skinName = this.en_sp
            }
            else if(Global.language === Global.LANGUAGE.IDA && this.ind_sp){
                skinName = this.ind_sp
            }
            else if(Global.language === Global.LANGUAGE.AR && this.ar_sp){
                skinName = this.ar_sp
            }
            if(skinName){
                spCmp.setSkin(skinName)
            }
            
        }
    },

    start () {
        this.updateSkin();
    },

    display(){
        this._super()
        this.updateSkin()
    }

    // update (dt) {},
});
