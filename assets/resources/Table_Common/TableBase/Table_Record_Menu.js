/**
 * 游戏投注记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_menu = cc.find("btn_record",this.node);
        Global.btnClickEvent(btn_menu,this.onClickMenuRecord,this);
    },

    start () {

    },

    onClickMenuRecord:function(){
        StatisticsMgr.reqReport(ReportConfig.SG_BTN_RECORD);
        if(Global.TableSoundMgr){                 
            Global.TableSoundMgr.playCommonEff("com_click");
        } else {
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        }
        let cfg = cc.vv.gameData.getGameCfg()
        let url = cfg.bet_records
        cc.loader.loadRes(url,cc.Prefab, (err, prefab) => {
            let parNode = cc.find("Canvas")
            if(cc.isValid(parNode)){
                if(!parNode.getChildByName("record_pannel")){
                    let node = cc.instantiate(prefab)
                    node.parent = parNode
                    node.name = "record_pannel"
                    
                }
            }
        })
    },

    // update (dt) {},
});
