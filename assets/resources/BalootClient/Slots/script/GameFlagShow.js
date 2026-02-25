/**
 * slot的游戏标签状态，是否参与排行榜，是否参与反水
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setData:function(id){
        let sp_obj = cc.find("spine",this.node)
        if(sp_obj){
            let bLop = cc.vv.UserManager.isInLepGames(id) 
            let bCashBack = cc.vv.UserManager.isInRebateGames(id)
            let ani
            if(bLop && bCashBack){
                ani = "animation3"
            }
            else{
                if(bLop){
                    ani = "animation1"
                }
                if(bCashBack){
                    ani = "animation2"
                }
            }
            if(ani){
                sp_obj.active = true
                sp_obj.getComponent(sp.Skeleton).setAnimation(0,ani,true)
            }
            else{
                sp_obj.active = false
            }

        }
    }

    // update (dt) {},
});
