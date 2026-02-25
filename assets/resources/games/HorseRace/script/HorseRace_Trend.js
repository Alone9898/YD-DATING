
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.showRecord()
    },

    showRecord(bNewAni) {
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nShowNum = 12
        for(let i = 0; i < nShowNum;i++ ){
            let item =  nTotal > nShowNum? records[nTotal-(nShowNum-i)] : records[i];
            let node = cc.find("bg/item"+(i+1),this.node)
            if(item >= 0){
                node.active = true;
                node.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame("paoma_result"+item);

            }
            else{
                node.active = false
            }
        }

    }


    // update (dt) {},
});
