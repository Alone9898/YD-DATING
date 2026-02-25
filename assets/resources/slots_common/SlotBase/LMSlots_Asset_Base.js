/**
 * 需要动态获取的资源存放
 */
cc.Class({
    extends: cc.Component,

    properties: {
        prefabs:{
            default:[],
            type: [cc.Prefab]
        },
        atlas:{
            default:[],
            type: [cc.SpriteAtlas]
        },
        sprites:{
            default:[],
            type: [cc.SpriteFrame]
        },
        fonts:{
            default:[],
            type: [cc.Font]
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    onDestroy(){
        for(let i = 0; i < this.prefabs.length; i++){
            let deps = cc.loader.getDependsRecursively(this.prefabs[i])
            cc.loader.release(deps);
            // cc.loader.releaseAsset(this.prefabs[i])
        }
        for(let i = 0; i < this.atlas.length; i++){
            let deps = cc.loader.getDependsRecursively(this.atlas[i])
            cc.loader.release(deps);

            // cc.loader.releaseAsset(this.atlas[i])
        }
        for(let i = 0; i < this.sprites.length; i++){
            let deps = cc.loader.getDependsRecursively(this.sprites[i])
            cc.loader.release(deps);

            // cc.loader.releaseAsset(this.sprites[i])
        }
        for(let i = 0; i < this.fonts.length; i++){
            let deps = cc.loader.getDependsRecursively(this.fonts[i])
            cc.loader.release(deps);

            // cc.loader.releaseAsset(this.fonts[i])
        }
    },

    //更加名字获取预制
    GetPrefabByName:function(name){
        for(let i = 0; i < this.prefabs.length; i++){
            let item = this.prefabs[i]
            if(name == item.name){
                return item
                
            }
        }
    },

    //根据名字获取图集
    GetAtlasByName:function(name){
        for(let i = 0; i < this.atlas.length; i++){
            let item = this.atlas[i]
            if(name+".plist" == item.name){
                return item
                
            }
        }
    },

    //根据名字获取图片
    GetSpriteByName:function(name){
        for(let i = 0; i < this.sprites.length; i++){
            let item = this.sprites[i]
            if(name == item.name){
                return item
                
            }
        }
    },

    //根据名字获取文本
    GetFontByName:function(name){
        for(let i = 0; i < this.fonts.length; i++){
            let item = this.fonts[i]
            if(name == item.name){
                return item

            }
        }
    }

    // update (dt) {},
});
