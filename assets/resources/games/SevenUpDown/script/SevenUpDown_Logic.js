
cc.Class({
    extends: require("Table_Logic_Base"),

    properties: {
        nor_dice_atlas:cc.SpriteAtlas,
        gold_dice_atlas:cc.SpriteAtlas,
    },

    InitCommComponent(){
        this._super()

        let self = this;
        cc.vv.gameData.getNorDiceAtlas = function(){
            return self.nor_dice_atlas;
        };
        cc.vv.gameData.getGoldDiceAtlas = function(){
            return self.gold_dice_atlas;
        }
    }




    // update (dt) {},
});
