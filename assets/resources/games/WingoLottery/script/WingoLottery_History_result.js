
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {

    },

    showGameResult:function(result){
        let ball = cc.find("ui/node_type/ball", this.node);
        ball.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getBaseAtlas().getSpriteFrame(`ball_${result.ball}`);
    },

    showGameType:function(result){
        let str = "";

        let optname = ["1","2","3","4","5","6","7","8","9","0","1-4","0/5","6-9"]
        result.res.forEach((data,idx)=>{
            if(idx > 0){
                str += ", "
            }
            str += optname[data-1]
        })

        cc.find("ui/node_result/lbl_result", this.node).getComponent(cc.Label).string = str;
    },

    // update (dt) {},
});
