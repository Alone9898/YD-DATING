/**
 * 匹配阶段表现
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {

    },

    show(nTime){
        if(nTime <= 0){
            this.showTimeEndCall()
            return
        } 
        this.node.active = true
        let lbl_time = cc.find("spr_time/lbl",this.node) 
        if(lbl_time){
            lbl_time.active = true
            lbl_time.getComponent("ReTimer").setReTimer(nTime,1,this.showTimeEndCall.bind(this),"%ss")
        }
        let spnode = this.node.getComponent(sp.Skeleton)
        spnode.setAnimation(0,"animation",true)
    },

    showTimeEndCall:function(){
        let lbl_time = cc.find("spr_time/lbl",this.node) 
        if(cc.isValid(lbl_time)){
            lbl_time.active = false
        }
    }

    // update (dt) {},
});
