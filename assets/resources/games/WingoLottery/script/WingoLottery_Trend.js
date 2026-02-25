/**
 * 21点趋势
 */
cc.Class({
    extends: cc.Component,

    properties: {
        // sprs:[cc.SpriteFrame] //按2~6,8~12,7,金骰子的顺序
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn = cc.find("btn_detail",this.node)
        Global.btnClickEvent(btn, this.onClickDetail, this)
    },

    start () {
        this.showRecord()
    },

    //显示记录
    async showRecord(bNewAni){
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nShowNum = 8
        for(let i = 0; i < nShowNum;i++ ){
            let item =  nTotal > nShowNum? records[nTotal-(nShowNum-i)] : records[i];
            let node = cc.find("bg/item"+(i+1),this.node)
            if(item >= 0){
                let nodeSp = node.getComponent(sp.Skeleton);
                nodeSp.setSkin(this.getSkinStr(item));
                let lbl = cc.find("lbl", node).getComponent(cc.Label);
                lbl.string = item;
                node.active = true;
                if(!bNewAni){
                    nodeSp.setAnimation(0,"animation2",false);
                    lbl.node.active = true;
                }
                else {
                    lbl.node.active = false;
                    nodeSp.setAnimation(0,"animation1",false);
                    nodeSp.addAnimation(0,"animation2",false);
                    // await cc.vv.gameData.awaitTime(1);
                    cc.tween(lbl.node)
                        .delay(0.6)
                        .call(()=>{
                            lbl.node.active = true;
                        })
                        .start()

                }
            }
            else{
                node.active = false
            }
        }
    },

    getSkinStr(res){
        if(res == 0 || res == 5){
            return "hong"
        } else if(res < 5){
            return  "lan"
        } else if(res > 5){
            return  "huang"
        }
    },

    onClickDetail:function(){

        let record_node = cc.find("Canvas/safe_node/pop_trend")
        record_node.getComponent("WingoLottery_Popup").showTrend()
    },

    // update (dt) {},
});
