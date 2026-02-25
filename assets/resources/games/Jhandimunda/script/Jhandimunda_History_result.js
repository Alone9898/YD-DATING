
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {

    },

    showGameResult:function(result){
        let cards = result.cards;
        let atlas = cc.vv.gameData.getAtlas(0)

        let list = cc.find("ui/node_type/list", this.node);
        list.children.forEach((node,idx)=>{
            node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`touzi_0${cards[idx]}`);
        })

    },

    showGameType:function(result){
        let res = result.res;
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas && result.res){
            let cnt = 0;
            let node_result = cc.find("ui/node_result/result", this.node);
            node_result.children.forEach((node)=>{
                node.active = false;
            })
            for (let i = 0; i < res.length; i++){
                if(res[i]>=2){
                    cc.find(`item${cnt+1}`, node_result).active = true;
                    cc.find(`item${cnt+1}/spr`, node_result).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`record${i+1}`);
                    cc.find(`item${cnt+1}/lbl`, node_result).getComponent(cc.Label).string = `×${res[i]}`;
                    cnt+=1;
                } else {
                    // cc.find(`item${cnt+1}`, node_result).active = false;
                }
            }
        }
    },

    // update (dt) {},
});
