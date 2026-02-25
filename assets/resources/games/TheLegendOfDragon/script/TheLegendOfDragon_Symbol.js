/**符号表 
 * 
*/
cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        _ingot: null,
    },

    ingot() {
        if (!this._ingot) {
            this._ingot = this.node.getChildByName("ingot");
        }
        return this._ingot;
    },

    ShowIngot(bshow) {
        this.ingot().active = bshow;
    },

    //overwrite
    //显示symbole
    ShowById:function(id,data){
        this._super(id, data);
        this.ShowIngot(data||false);
    },

    //获取元宝位置
    GetIngotWPos() {
        return this.ingot().convertToWorldSpaceAR(cc.v2(0,0));
    },

    Resume(backup) {
        this._super(backup);
        this.ShowIngot(false);
    },

    //即将停止
    StopMoveBefore(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if (id>=12 && id <=14) {
            if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].win_ani){
                if(this._showNode){
                    this._showNode.active = false
                }
                this._showNode = cc.find(cfg.symbol[id].win_node,this.node)
                this._showNode.active = true

                if(cfg.symbol[id].win_ani.name != ""){
                    this.node.zIndex = cfg.symbol[id].win_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                    let nodeSp = this._showNode.getComponent(sp.Skeleton)
                    if(nodeSp){
                        nodeSp.setAnimation(0,cfg.symbol[id].win_ani.name,false)
                    }
                }
            }
        }
    },
});
