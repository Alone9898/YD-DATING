/**
 * WingoLottery 记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {

    },

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let cfg = cc.vv.gameData.getGameCfg()
        let atlas = cc.vv.gameData.getBaseAtlas()
        if(atlas && result.ball >= 0){

            let frameN = "";
            if(result.ball == 0 || result.ball == 5){
                frameN = "x1";
            } else if(result.ball < 5){
                frameN = "x5";
            } else if(result.ball > 5){
                frameN = "x3";
            }
            let spr = cc.find("node_result/spr", this.node);
            spr.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getBaseAtlas().getSpriteFrame(frameN);
            spr.getChildByName("lbl").getComponent(cc.Label).string = result.ball;

        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let optname = ["1","2","3","4","5","6","7","8","9","0","1-4","0/5","6-9"]
        Global.setLabelString("node_option/lbl",this.node,optname[opt-1])
    },

    // update (dt) {},
});
