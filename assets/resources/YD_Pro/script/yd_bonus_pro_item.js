/**
 * bonus促销item
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node,this.onClickItem,this);
    },

    start () {

    },

    inititem(data){
        //显示图片
        this._itemData = data
        let sprite = this.node
        sprite.getComponent("UserHead").setHead(data.banner,data.banner)
    },

    onClickItem(){
        let self = this
        cc.loader.loadRes("YD_Pro/prefab/bonus_prom_detail",cc.Prefab,(err,data)=>{
            if(!err){
                let par = cc.find("Canvas")
                let old = cc.find("bonus_prom_detail",par)
                if(!old){
                    old = cc.instantiate(data)
                    old.parent = par
                    old.getComponent("yd_bonus_pro_detail").setInfo(self._itemData.memo[0])
                }
            }
        })
    },

    // update (dt) {},
});
