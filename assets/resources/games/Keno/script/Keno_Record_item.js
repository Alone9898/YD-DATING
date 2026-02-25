/**
 * 订单记录item
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let data = result
        let lay = cc.find("node_result/lay",this.node)
        for(let i = 0; i < 10; i++){
            let item = cc.find("item"+(i+1),lay)
            if(cc.js.isNumber(data.lottery_nums[i])){
                item.active = true
                Global.setLabelString("num",item,data.lottery_nums[i])
            }
            else{
                item.active = false
            }
        }
        
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let str = "--"
        let result = JSON.parse(this._itemdata.result)
        let isHit = function(val){
            for(let i = 0; i < result.lottery_nums.length; i++){
                if(val == result.lottery_nums[i]){
                    return true
                }
            }
            return false
        }
        let lay = cc.find("node_option/lay",this.node)
        for(let i = 0; i < 10; i++){
            let item = cc.find("item"+(i+1),lay)
            if(cc.js.isNumber(result.nums[i])){
                item.active = true
                let val = result.nums[i]
                Global.setLabelString("num",item,val)
                let spname = "ball_sel"
                if(isHit(val)){
                    spname = "ball_hit"
                }
                cc.find("icon",item).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(spname)
            }
            else{
                item.active = false
            }
        }
    },


    // update (dt) {},
});
