/**
 * 龙虎趋势
 */
cc.Class({
    extends: cc.Component,

    properties: {
        sprs:[cc.SpriteFrame] //按龙，虎，和排序
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
    showRecord:function(bNewAni){
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nShowNum = 10
        for(let i = 0; i < nShowNum;i++ ){
            let item = records[nTotal-(nShowNum-i)]
            let node = cc.find("bg/item"+(i+1),this.node)
            if(item){
                node.active = true
                node.getComponent(cc.Sprite).spriteFrame = this.sprs[item.res-1]
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
    },

    onClickDetail:function(){
        let url = "games/lhdz/prefab/trend_detail"
        cc.loader.loadRes(url,cc.Prefab,(err,prefab)=>{
            let par = cc.find("Canvas")
            if(!par.getChildByName("trend_detail")){
                let node = cc.instantiate(prefab)
                node.parent = par
            }
        })
    },

    // update (dt) {},
});
