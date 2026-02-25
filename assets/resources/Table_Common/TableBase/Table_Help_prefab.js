
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._laycontent = cc.find("scrollView/view/content",this.node)
        // this._itemWith = this._laycontent.width
        this.InitItems()

        let btn_close = cc.find("btn_close",this.node);
        Global.btnClickEvent(btn_close,this.onClickClose,this);
    },

    start () {

    },

    InitItems:function(){
        let self = this
        this.addIdx = 0
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.helpItems){
            for(let i = 0; i < cfg.helpItems.length; i++){
                let url = cfg.helpItems[i]
                cc.loader.loadRes(url, cc.Prefab,function(err, res){
                    if(!err){

                        let node = cc.instantiate(res)
                        node.parent = self._laycontent
                        node.setSiblingIndex(i)

                    }

                })
            }
        }
    },

    onClickClose:function(){
        this.node.destroy()
    }

    // update (dt) {},
});
