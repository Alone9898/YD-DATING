/**
 * 押注提示框
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    /**
     * 
     * @param {number} nPer 
     */
    setBetPercent:function(nPer){
        let self = this 

        let betPro = cc.find('pro_bet',this.node)
        let proCmp = betPro.getComponent(cc.ProgressBar)
        // proCmp.progress = nPer
        cc.tween(proCmp)
        .to(0.2,{progress:nPer})
        .start()

        //指针
        let nodePoint = cc.find('spr_point',betPro)
        let toAngle = 55 + (-11)*(nPer/0.1)
        
        cc.tween(nodePoint)
        .to(0.2,{angle:toAngle})
        .start()

        this.node.stopAllActions()
        this.node.opacity = 255
        cc.tween(this.node)
        .delay(2.5)
        .call(() => {
            self.HideTips()
        })
        .start()

        // let betTxt = cc.find('bet_txt',this.node)
        // let curBetIdx = cc.vv.gameData.GetBetIdx()
        // let deskinfo = cc.vv.gameData.getDeskInfo()
        // if(curBetIdx == deskinfo.needbet){
        //     if(!betTxt.active){
        //         betTxt.opacity = 0
        //         betTxt.active = true
        //         betTxt.stopAllActions()
        //         cc.tween(betTxt)
        //         .to(0.2,{opacity:255})
        //         .start()
        //     }
            
        // }
        // else{
        //     if(betTxt.active){
        //         betTxt.stopAllActions()
        //         cc.tween(betTxt)
        //         .to(0.3,{opacity:0})
        //         .call(() => {
        //             betTxt.active = false
        //         })
        //         .start()
        //     }
            
            
        // }
    },

    HideTips:function(){
        let self = this
        this.node.stopAllActions()
        cc.tween(this.node)
        .to(0.3,{opacity:0})
        .call(() => {
            self.node.active = false
            // let betTxt = cc.find('bet_txt',self.node)
            // if(cc.isValid(betTxt)){
            //     betTxt.active = false
            // }
        })
        .start()
    }

    // update (dt) {},
});
