/**
 * 轮盘记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        red_spr:cc.SpriteFrame,
        black_spr:cc.SpriteFrame,
        green_spr:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.showRecord()
    },

    showRecord:function(bNewAni){
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nShowNum = 6
        for(let i = 0; i < nShowNum;i++ ){
            let item = records[nTotal-(nShowNum-i)] //往前取到后
            let node = cc.find("bg/item"+(i+1),this.node)
            if(cc.js.isNumber(item)){
                node.active = true
                let ball_val = item
                Global.setLabelString("lbl",node,ball_val)
                let show_spr
                if(ball_val == 0){
                    show_spr = this.green_spr
                }
                let color = cc.vv.gameData._getBallColor(ball_val)
                show_spr = (color == 1)?this.black_spr:this.red_spr
                node.getComponent(cc.Sprite).spriteFrame = show_spr
            }
            else{
                node.active = false
            }
            
            //new
            let node_new = cc.find("new",node)
            if(node_new){
                node_new.active = true
                if(bNewAni){
                    Global.blinkAction(node_new,0.2,0.2,3)
                }
            }

        }
    }

    // update (dt) {},
});
