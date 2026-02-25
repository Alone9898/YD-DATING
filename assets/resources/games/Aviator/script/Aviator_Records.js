/**
 * 游戏记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _bExpand:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_arrow = cc.find("top/btn_arrow",this.node)
        Global.btnClickEvent(btn_arrow, this.onClickArrow, this)
    },

    start () {
        this.showRecords()
        this._showUIModel(this._bExpand)
    },

    onClickArrow:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        // this._bExpand = !this._bExpand
        this._showUIModel(true)
    },

    showRecords:function(bShowHint){
        let res = cc.vv.gameData.getGameRecords()
        let nTotal = res.length
        let nShowNum = 5
        for(let i = 0; i < nShowNum; i++){
            let data = res[nTotal-1-i]
            let item = cc.find("bg/lay/item"+(i+1),this.node)
            let lbl = cc.find("val",item)
            lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
            lbl.color = data>1.5?cc.color().fromHEX("#8C3EF7"):cc.color().fromHEX("#04A1E6")

            let newFlag = cc.find("new",item)
            if(newFlag){
                
                if(bShowHint){
                    newFlag.active = true
                    let endCall = function(){
                        if(cc.isValid(newFlag)) newFlag.active = false
                    }
                    Global.blinkAction(newFlag,0.2,0.2,3,endCall)
                }
            }

        }
    },

    _showUIModel:function(val){
        let self = this
        if(!val){
            return
        }
        cc.loader.loadRes("games/Aviator/prefab/record_more",cc.Prefab,(err,data)=>{
            let parNode = cc.vv.gameData.getScriptGame().node
            if(cc.isValid(parNode) && !cc.find("record_more",parNode)){
                let more_node = cc.instantiate(data)
                more_node.active = val
                more_node.parent = parNode
                if(val){
                    more_node.getComponent("Aviator_History_More").showMore(true)
                }
            }
            
        })
        
        // let bg = cc.find("bg",this.node)
        // for(let i = 6; i<=10; i++){
        //     let item =cc.find("lay/item"+i,bg)
        //     item.active = val
        // }
        // bg.height = this._bExpand?700:460
        // let arrow = cc.find("btn_arrow/dir",bg)
        // arrow.scaleX = val?-2:2
    }

    // update (dt) {},
});
