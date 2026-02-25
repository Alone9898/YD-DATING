/**
 * 背景图适配
 * ios是原来的配置：小图放大2背
 * 针对ipad的话：背景图还是再大一点2.5
 */
cc.Class({
    extends: cc.Component,

    properties: {
        ipad_auto:{
            displayName:"ipad上的自动缩放",
            tooltip:"挂载了这个就不要再挂widget组建了",
            // type:cc.Boolean,
            default:true,
        },
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let testIPad = false 
        if(testIPad || cc.sys.platform == cc.sys.IPAD){
            if(this.ipad_auto){
                let xScale = cc.winSize.width/this.node.width
                let yScale = cc.winSize.height/this.node.height
                this.node.scale = xScale>yScale?xScale:yScale
            }
            
        }
        
    },

    // start () {

    // },

    // update (dt) {},
});
