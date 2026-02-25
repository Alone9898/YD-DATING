
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {

    },

    showGameResult:function(result){

        let atlas = result.gold ? cc.vv.gameData.getGoldDiceAtlas() : cc.vv.gameData.getNorDiceAtlas();
        let res_dice1 = cc.find("ui/node_type/dice_1", this.node);
        res_dice1.active = true;
        res_dice1.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`dice_${result.c1}`);
        let res_dice2 = cc.find("ui/node_type/dice_2", this.node);
        res_dice2.active = true;
        res_dice2.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`dice_${result.c2}`);
        let point = cc.find("ui/node_type/point", this.node);
        point.active = true;
        point.getComponent(cc.Label).string = result.c1+result.c2;

    },

    showGameType:function(result){
        // let atlas = cc.vv.gameData.getAtlas(0)
        // let item = cc.find("ui/node_result/item", this.node);

        let optname = ["2-6","8-12","7"]
        Global.setLabelString("ui/node_result/item/lbl",this.node,optname[result.res-1])

        // if(result.gold){
        //     item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("r_h");
        // } else {
        //     let list = ["r_hong","r_lv","r_lan"]; //2~6,8~12,7,
        //     item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(list[result.res-1])
        // }
        // cc.find("lbl", item).getComponent(cc.Label).string = result.point;
    },

    // update (dt) {},
});
