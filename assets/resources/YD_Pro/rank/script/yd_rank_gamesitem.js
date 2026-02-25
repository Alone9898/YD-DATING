/**
 * 游戏榜item
 */

cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node, this.onClickItem, this);
    },

    start () {

    },

    updateView(data){
        //刷新icon
        this._gameid = data
        let bSlot = this._isSlot(data)
        let pIcon = cc.find("icon", this.node);
        let pSpine = cc.find("spine", this.node);
        pIcon.active = !bSlot
        pSpine.active = bSlot
        if(bSlot){
            let cfg = cc.vv.GameItemCfg[data];
            let skeletonCpt = pSpine.getComponent(sp.Skeleton);
            cc.vv.ResManager.setSkeleton(skeletonCpt,`BalootClient/Slots/icon/${cfg.action}/spine`,(skeletonCpt) => {
                skeletonCpt.setAnimation(0, "animation2", true)
            })
        }
        else{
            cc.vv.ResManager.setSpriteFrame(pIcon.getComponent(cc.Sprite), `BalootClient/GameIcon/${data}`, null, null);
        }
    },


    onClickItem(){
        //跳转游戏
        if(this._isSlot(this._gameid)){
            //
            cc.vv.PopupManager.addPopup("BalootClient/Slots/page_slots", {
                opacityIn: true,
            });
        }
        else{
            Global.dispatchEvent("GO_ROOMGAME_ID",this._gameid)
        }

        Global.dispatchEvent("Close_Rank_View")

    },

    _isSlot:function(id){
        let res = false
        let _listData = cc.vv.UserManager.slotsList;
        for(let i = 0;i < _listData.length; i++){
            let item = _listData[i]
            if(id == item.id){
                res = true
            }
        }
        return res
    }

    // update (dt) {},
});
