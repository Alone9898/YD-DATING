/**
 * roulette 历史记录详情
 */
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    showGameResult:function(result){
        let val = result.res
        let node_big = cc.find("ui/node_result",this.node)
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

    showGameType:function(result){
        let str = ""
        let winplace =result.winplace
        for(let i = 0; i < winplace.length; i++){
            str +=winplace[i]
            str += ":【"
            let cfg = cc.vv.gameData.getArenCfg(winplace[i])
            for(let j = 0; j < cfg.length; j++){
                str += cfg[j]
                if(j != cfg.length-1){
                    str += ","
                }
               
            }
            str += "】"
            if(i != winplace.length-1){
                str += ", "
            }
        }

        Global.setLabelString("ui/node_type/result_area",this.node,str)
    },

    // update (dt) {},
});
