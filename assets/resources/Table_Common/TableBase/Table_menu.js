import {CommonStyle} from "../../../BalootClient/game_common/CommonStyle";

/**
 * 桌游-菜单
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // let btn_exit = cc.find("btn_close",this.node)
        // Global.btnClickEvent(btn_exit,this.onClickBackLobby,this)
        let btn_menu = cc.find("btn_menu",this.node);
        Global.btnClickEvent(btn_menu,this.onClickMenuBtn,this);


        //退出
        Global.btnClickEvent(cc.find("btn_exit", this.node), this.onMenuExit, this);
    },

    start () {

    },

    onClickBackLobby:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        
        if(this._bClickBack) return
        this._bClickBack = true
        this.scheduleOnce(()=>{
            this._bClickBack = null
        },1)
        if (cc.vv.gameData) {
            cc.vv.gameData.ReqBackLobby()
        }
    },

    onClickMenuBtn(event){
        Global.TableSoundMgr.playCommonEff("com_click");
        StatisticsMgr.reqReport(ReportConfig.SG_BTN_SETTING);
        let self = this
        // this._showMenuAni(true)
        cc.loader.loadRes("Table_Common/TableRes/prefab/menu_detail",cc.Prefab, (err, prefab) => {
            if (!err && cc.isValid(self.node)) {
                let old = self.node.parent.getChildByName('menu_detail')
                if(!old){
                    let node = cc.instantiate(prefab)
                    Global.FixDesignScale(node)
                    node.name = 'menu_detail'
                    node.parent = self.node.parent //加到父节点
                    let oldScaleY = node.scaleY
                    let lvNode = event.target
                    if(lvNode){
                        let pos = lvNode.convertToWorldSpaceAR(cc.Vec2(0,0))
                        let tipPos = self.node.parent.convertToNodeSpaceAR(pos)
                        node.position = tipPos
                        CommonStyle.fastShow(node);
                        // node.scaleY = 0
                        // cc.tween(node)
                        //     .to(0.1,{scaleY:oldScaleY})
                        //     .start()
                    }
                    old = node
                    // let endCall = function(){
                    //     self._showMenuAni(false)
                    // }
                    // node.getComponent("Table_menu_detail").setCloseCall(endCall)
                }

            }
        })
    },

    //返回大厅
    onMenuExit:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        StatisticsMgr.reqReport(ReportConfig.SG_BTN_EXITGAME);

        if(this._bClickBack) return
        this._bClickBack = true
        this.scheduleOnce(()=>{
            this._bClickBack = null
        },1)
        if (cc.vv.gameData) {
            cc.vv.gameData.ReqBackLobby()
        }
    },

    // update (dt) {},
});
