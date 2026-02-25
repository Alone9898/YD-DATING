/**
 * Jhandimunda 记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {

    },

    //根据游戏显示自己的结果
    showGameResult:function(result, id){
        let cfg = cc.vv.gameData.getGameCfg()
        let atlas = cc.vv.gameData.getAtlas(0)

        cc.find("node_result", this.node).children.forEach((node)=>{
            node.active = false;
        })

        if(atlas && result.res){
            let cnt = 0;
            for (let i = 0; i < result.res.length; i++){
                if(result.res[i]>=2){
                    cc.find(`node_result/item${cnt+1}`, this.node).active = true;
                    cc.find(`node_result/item${cnt+1}/spr`, this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`record${i+1}`);
                    cnt+=1;
                }
            }
        }
    },


    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        if(cc.vv.gameData.getAtlas(0).getSpriteFrame(`record${opt}`)){
            Global.setSpriteFrame("node_option/spr",this.node, cc.vv.gameData.getAtlas(0).getSpriteFrame(`record${opt}`))
        }
    },

    // update (dt) {},
});
