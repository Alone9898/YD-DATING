/**
 * Jhandimunda趋势
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

        for (let i = 1; i <= 6; i++){
            cc.find(`list${i}`, this.node).children.forEach(node=>{
                node.active = false;
            })
        }

        this.showRecord()
    },

    async showRecord(bNewAni){
        let records = cc.vv.gameData.getGameRecords();
        let nTotal = records.length
        let nShowNum = 12

        if(bNewAni && records.length > nShowNum){
            for (let m = 1; m <= 6; m++) {
                cc.find(`list${m}/item1`, this.node).active = false;
            }
            await cc.vv.gameData.awaitTime(0.3);
        }

        for(let i = 0; i < nShowNum; i++) {
            let  record = nTotal > nShowNum ? records[nTotal-(nShowNum-i)] : records[i];

            if(record){
                let res = record.res;
                for (let idx = 0; idx < 6; idx++){
                    let item = cc.find(`list${idx+1}/item${i+1}`, this.node);
                    item.active = true;
                    if(res[idx] > 1){
                        item.getChildByName("spr").active = true;
                        item.getChildByName("spr").getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`zoushi_0${res[idx]+1}`)
                    } else {
                        item.getChildByName("spr").active = false;
                    }
                }
            } else {

            }

        }

    }

    // update (dt) {},
});
