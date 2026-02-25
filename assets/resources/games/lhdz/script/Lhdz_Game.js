/**
 * 龙虎斗
 */
let STATUS_TIME = {
    FREE:5,
    BET:15,
    RESULT:10
}
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    showIdleStatu:function(){
        let self = this
        this._super()
       
        
        //显示龙虎斗开始动画,中途进来的不现实此动画
        let nRemind = cc.vv.gameData.getStatusTime()
        this.showStartVsAni(nRemind>=STATUS_TIME.FREE-2)

        this._clearAreaWin()
        
        

        //显示牌背
        this.showCardMask()
    },

    showBetStatu:function(doStatusChange){
        let self = this
        this._super(doStatusChange)
        
        

        //显示牌背
        this.showCardMask()

        

        
    },

    async showResultStatu(){
        this._super()
        
        
        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //保存记录:看这个是否可以公用
            cc.vv.gameData.addGameRecord(resultMsg.result)

            //有结果，播放结果
            this._showWaitResult(false)
            //先翻牌：龙到虎
            this.showFire(false)
            await this._showCard("card_dragon",resultMsg.result.c1)
            await cc.vv.gameData.awaitTime(0.5)
            await this._showCard("card_tiger",resultMsg.result.c2)
            //方位赢表现
            await this._showAreanWin(resultMsg.result.res)
            //各自飞金币
            await this._flyWinCoin()

            
        }
        else{
            //没结果，显示等待
            this._showWaitResult(true)
        }
        
    },

    //显示牌结果
    _showCard:function(cardName,cardVal){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            let card_dragon = cc.find("node_result/"+cardName,this.node)
            card_dragon.getComponent("Poker").doTurnAction(cardVal,endCall,0.2,0.3)
            Global.TableSoundMgr.playEffect("flipcard")
        })
    },

    
    //方位赢动画
    _showAreanWin:function(idx){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            let area_scp = this._getBetAreaScript()
            let area_node = area_scp.getBetAreaNode(idx)
            if(area_node){
                let winFlag = cc.find("sel",area_node)
                winFlag.active = false
                Global.blinkAction(winFlag,0.2,0.2,3,endCall)
               
                //播放动画
                let winName
                if(idx == 1){
                    winName = "long"
                }
                else if(idx == 2){
                    winName = "hu"
                }
                if(winName){
                    let node = cc.find(winName,area_scp.node)
                    node.active = true
                    node.getComponent(sp.Skeleton).setAnimation(0,winName,false)
                    Global.TableSoundMgr.playEffect(winName+"_win")
                }
                endCall()
            }

            
        })
    },

    //清理赢的表现
    _clearAreaWin:function(){
        let area_scp = this._getBetAreaScript()
        for(let i= 0; i < area_scp.AreaList.length; i++){
            let item= area_scp.AreaList[i]
            let winFlag = cc.find("sel",item.node)
            winFlag.active = false
        }
    },

    //飞赢的金币
    _flyWinCoin:function(){
        return new Promise((res, rej) => {
            let resultMsg = cc.vv.gameData.getResultMsg()
            if(!resultMsg){//如果结果数据都没有了，就直接跳过
                res()
            }
            let winIdx = resultMsg.result.res
            let area_scp = this._getBetAreaScript()
            let win_aren = area_scp.getBetAreaNode(winIdx)

            //输的方位金币飞到赢的方位消失
            let losechips = []
            for(let i = 0; i < area_scp.AreaList.length; i++){
                let item = area_scp.AreaList[i]
                if(item.idx !== winIdx){
                    let itemchips = area_scp.getAreaChips(item.idx)
                    for(let j = 0; j < itemchips.length; j++){
                        losechips.push(itemchips[j])
                    }
                }
            }

            let chipCon = cc.find("chip_container",win_aren)
            for(let i = 0; i < losechips.length; i++){
                let item = losechips[i]
                
                let xPos = Global.random(-chipCon.width/2,chipCon.width/2)
                let yPos = Global.random(-chipCon.height/2,chipCon.height/2)

                let toOffSet = cc.v2(xPos,yPos)
                area_scp.moveChip(item.chipNode,item.chipNode,win_aren,null,false,toOffSet)

            }
            
            losechips = null
            this.scheduleOnce(()=>{
                this._flyTableChips(resultMsg)
                
                
                this.updateGameRecord()
                this.doShowResultFinish()
                res()
                //最后清理所有的
                //area_scp.clearTableBet()
            },1)
            
        })
        
    },

    //更新游戏记录
    updateGameRecord:function(){
        let record_node = cc.find("node_trend",this.node)
        record_node.getComponent("Lhdz_Trend").showRecord(true)
    },

    

    //开局动画
    showStartVsAni:function(bShow){
        let node = cc.find("node_start_vs",this.node)
        node.active = bShow
        if(bShow){
            let spcmp = cc.find("longvshu",node).getComponent(sp.Skeleton)
            spcmp.setAnimation(0,"animation",false)
            spcmp.setCompleteListener((tck) => {
                node.active = false
            })
        }
        Global.TableSoundMgr.playEffect("pk")
    },

    
    

    showCardMask:function(){
        let card_dragon = cc.find("node_result/card_dragon",this.node)
        let card_tiger = cc.find("node_result/card_tiger",this.node)

        card_dragon.getComponent("Poker").showPokerBg(0)
        card_tiger.getComponent("Poker").showPokerBg(0)
        
        this.showFire(true)
    },

    showFire:function(bShow){
        let fire_left = cc.find("node_result/fire_left",this.node)
        fire_left.active = bShow
        let fire_right = cc.find("node_result/fire_right",this.node)
        fire_right.active = bShow
    }

    


    // update (dt) {},
});
