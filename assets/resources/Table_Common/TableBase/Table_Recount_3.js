/**
 * 3s倒计时
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    

    setShow(bShow){
        let node = this.node
        node.active = bShow
        if(bShow){
            let spm = cc.find("spin",node).getComponent(sp.Skeleton)
            if(spm){
                spm.setAnimation(0,"animation",false)
                spm.setCompleteListener((tck) => {
                    node.active = false
                })

                cc.tween(node)
                .repeat(3,
                    cc.tween()
                    .call(()=>{
                        Global.TableSoundMgr.playCommonEff("com_timeAlarm")
                    })
                    .delay(0.8)
                )
                .start()
                
            }

        }
        else{
            node.stopAllActions()
        }
    }

    // update (dt) {},
});
