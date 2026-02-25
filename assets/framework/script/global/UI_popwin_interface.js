/**
 * 需要有弹出动作的，弹框类
 */
cc.Class({
    extends: cc.Component,

    properties: {
        btn_close:{
            default:null,
            type:cc.Node,
            tooltip:'关闭按钮延迟显示'
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable () {
        
        Global.FixDesignScale_V(this.node)
        let scale = this.node.scale
        Global.showAlertAction(this.node,true,0.01,scale,this.popWinEndCall.bind(this))

        this.showCloseBtnAni()
    },

    onDisable(){
        Global.showAlertAction(this.node,false,this.node.scale,0)
    },

    showCloseBtnAni:function(){
        if(this.btn_close){
            this.btn_close.opacity = 0
            cc.tween(this.btn_close)
            .delay(0.8)
            .to(0.5,{opacity:255})
            .start()
        }
    },

    //设计尺寸下的横向空白空间，方便控制节点不至于缩的太小(子类继承)
    getDesignSpaceX() {
        return 0;
    },

    getDegignSpaceY() {
        return 0;
    },

    //设置弹出动作结束的回调
    //有需要可以重写
    popWinEndCall:function(){
       
    }
    // update (dt) {},
});
