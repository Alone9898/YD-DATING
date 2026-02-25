/**
 * 走势图弹窗
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_close = cc.find("btn_close",this.node)
        Global.btnClickEvent(btn_close, this.onClickClose, this)
    },

    showTrend(){
        this.node.active = true;

        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nShowNum = 50
        let cnt_hong = 0;
        let cnt_lan = 0;
        let cnt_huang = 0;
        for(let i = 0; i < nShowNum;i++ ){
            let item = nTotal > nShowNum? records[nTotal-(nShowNum-i)] : records[i];
            let node = cc.find("bg/layout/item"+(i+1),this.node);
            let spr = cc.find("spr",node);
            let last = cc.find("last",node);
            if(item >= 0){
                let frameN = "";
                if(item == 0 || item == 5){
                    cnt_hong += 1;
                    frameN = "x1";
                } else if(item < 5){
                    cnt_lan += 1;
                    frameN = "x5";
                } else if(item > 5){
                    cnt_huang += 1;
                    frameN = "x3";
                }

                spr.active = true;
                spr.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getBaseAtlas().getSpriteFrame(frameN);
                spr.getChildByName("lbl").getComponent(cc.Label).string = item;

                if((i+1) == nTotal || (i+1) == nShowNum){
                    last.active = true;
                } else {
                    last.active = false;
                }
            } else {
                spr.active = false;
                last.active = false;
            }
        }

        cc.find("bg/di_lan/lbl", this.node).getComponent(cc.Label).string = cnt_lan;
        cc.find("bg/di_hong/lbl", this.node).getComponent(cc.Label).string = cnt_hong;
        cc.find("bg/di_huang/lbl", this.node).getComponent(cc.Label).string = cnt_huang;

    },

    onClickClose:function(){
        this.node.active = false;
    }

    // update (dt) {},
});
