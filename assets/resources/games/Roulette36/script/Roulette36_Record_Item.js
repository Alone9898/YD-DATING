/**
 * 轮盘记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },


    //根据游戏显示自己的结果
    showGameResult:function(result){
        let val = result.res
        let node_big = cc.find("node_result",this.node)
        let node_ball = cc.find("ball",node_big)
        //球数字
        Global.setLabelString("val",node_ball,val)
        //球底板
        let key 
        if(val == 0){
            key = "end_lingbg"
        }
        else{
            let color = cc.vv.gameData._getBallColor(val)
            key = (color ==1)?"end_heibg":"end_hongbg"
        }
            
        
        
        
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas){
            node_ball.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(key)
        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        Global.setLabelString("node_option/lbl",this.node,opt)
    }

    // update (dt) {},
});
