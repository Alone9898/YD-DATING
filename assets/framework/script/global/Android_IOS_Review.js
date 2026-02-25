/**
 * 控制提审的显示
 */
cc.Class({
    extends: cc.Component,

    properties: {
        android_show:{
            default:true,
            displayName:"android提审是否显示"
        },
            
        ios_show:{
            default:true,
            displayName:"ios提审是否显示"
        },

        only_review_node:{
            default:false,
            displayName:"提审才需要显示，不提审就不显示"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        
        if((Global.isAndroidReview && Global.isAndroid())){
            this.node.active = this.android_show
            return
        }
        else{
            if(this.only_review_node){
                this.node.active = false
            }
            
        }
        if(Global.isIOSReview()){
            this.node.active = this.ios_show
            return
        }
        else{
            if(this.only_review_node){
                this.node.active = false
            }
        }
        
    },

    // update (dt) {},
});
