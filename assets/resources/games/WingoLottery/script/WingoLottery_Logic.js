
cc.Class({
    extends: require("Table_Logic_Base"),

    properties: {
        base_atlas:cc.SpriteAtlas,
    },

    InitCommComponent(){
        this._super()

        let self = this;
        cc.vv.gameData.getBaseAtlas = function(){
            return self.base_atlas;
        };
    }




    // update (dt) {},
});
