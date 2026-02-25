/**
 * 多语言的按钮显示.cc.Button
 */

let BtnStruct = cc.Class({
    name:"btn_spritesList",
    properties:{
        normalSprite:{
            default:null,
            type:cc.SpriteFrame
        },
        pressedSprite:{
            default:null,
            type:cc.SpriteFrame
        },
        hoverSprite:{
            default:null,
            type:cc.SpriteFrame
        },

        disabledSprite:{
            default:null,
            type:cc.SpriteFrame
        }
    }
})

cc.Class({
    extends: require("LanguageUIBase"),

    properties: {
        zh_sprites: {
            displayName: "中文图片数组",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.ZH)},
            default:null,
            type:BtnStruct,
        },
        en_sprites: {
            default: null,
            displayName: "英文图片数组",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.EN)},
            type:BtnStruct
        },
        ind_sprites: {
            default: null,
            displayName: "印度文图片数组",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.IDA)},
            type:BtnStruct
        },
        ar_sprites: {
            default: null,
            displayName: "阿拉伯文图片数组",
            visible:function(){return this.isInLanguageList(Global.LANGUAGE.AR)},
            type:BtnStruct
        }
    },

    // LIFE-CYCLE CALLBACKS:

    start() {
        this.updateSpirte()
    },

    updateSpirte(){
        let releaseFunc = (list) => {
            // if(list.normalSprite) cc.loader.release(list.normalSprite);
            // if(list.pressedSprite) cc.loader.release(list.pressedSprite);
            // if(list.hoverSprite) cc.loader.release(list.hoverSprite);
            // if(list.disabledSprite) cc.loader.release(list.disabledSprite);
        };

        let btn = this.getComponent(cc.Button);
        let spritesList = null;
        
        if (Global.language === Global.LANGUAGE.ZH && this.zh_sprites) {
           
            spritesList = this.zh_sprites;
        }
        else if (Global.language === Global.LANGUAGE.EN && this.en_sprites) {
            spritesList = this.en_sprites;
        }
        else if (Global.language === Global.LANGUAGE.IDA && this.ind_sprites) {
            spritesList = this.ind_sprites;
        }
        else if (Global.language === Global.LANGUAGE.AR && this.ar_sprites) {
            spritesList = this.ar_sprites;
        }
        if (!spritesList) return;
        if(btn.transition == cc.Button.Transition.SPRITE){
            if(spritesList.normalSprite){
                btn.normalSprite = spritesList.normalSprite;
            }
            if(spritesList.pressedSprite){
                btn.pressedSprite = spritesList.pressedSprite;
            }
            if(spritesList.hoverSprite){
                btn.hoverSprite = spritesList.hoverSprite;
            }
            if(spritesList.disabledSprite){
                btn.disabledSprite = spritesList.disabledSprite;
            }
        }
        else if(btn.transition == cc.Button.Transition.SCALE){
            let sprCmp = btn.getComponent(cc.Sprite)
            if(sprCmp && spritesList.normalSprite){
                sprCmp.spriteFrame = spritesList.normalSprite;
            }
        }
    },

    display(){
        this._super()
        this.updateSpirte()
    }

    // update (dt) {},
});
