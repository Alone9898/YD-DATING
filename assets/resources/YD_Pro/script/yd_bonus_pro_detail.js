/**
 * bonus prom detail
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(cc.find("btn_close",this.node),this.onClickClose,this);
    },

    start () {

    },

    //设置详情
    setInfo(url){
        let sprite = cc.find("scv/view/content/item",this.node)
        sprite.getComponent("UserHead").setHead(url,url)
    },

    
    onClickClose(){
        this.node.destroy()
    }

    // update (dt) {},
});
