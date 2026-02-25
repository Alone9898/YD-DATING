/**
 * 百家乐
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


    showIdleStatu:function(){
        let self = this
        this._super()


        //显示龙虎斗开始动画,中途进来的不现实此动画
        let nRemind = cc.vv.gameData.getStatusTime()
        this.showStartVsAni(nRemind>STATUS_TIME.FREE-2)

        this._clearAreaWin()



        //显示牌背
        this.showCardMask()
    },

    showBetStatu:function(doStatusChange){
        let self = this
        this._super(doStatusChange)

        

        //显示牌背
        this.showCardMask()
        //显示走势

        this._showAllSelActive(true);
    },

    async showResultStatu(){
        this._super()

        this._showAllSelActive(false);


        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //保存记录:看这个是否可以公用
            cc.vv.gameData.addGameRecord(resultMsg.result)

            //有结果，播放结果
            this._showWaitResult(false)

            await this._playResultAnim(resultMsg.result)
            // //先翻牌：龙到虎
            // await this._showCard("card_dragon",resultMsg.result.c1)
            // await cc.vv.gameData.awaitTime(0.5)
            // await this._showCard("card_tiger",resultMsg.result.c2)
            //方位赢表现
            await this._showAreanWin(resultMsg.result.winplace)
            //各自飞金币
            await this._flyWinCoin()

            this.doShowResultFinish()
        }
        else{
            //没结果，显示等待
            this._showWaitResult(true)
        }

    },

    _showAllSelActive(bShow){
        let areaList = this._getBetAreaScript().AreaList;
        areaList.forEach(area=>{
            area.node.getChildByName("sel").active = bShow;
        })
    },

    _playResultAnim:function(result){
        return new Promise(async (res, rej) => {
            let node_trend = cc.find("node_trend",this.node);
            node_trend.active = false;

            let node_result = cc.find("node_result", this.node);
            node_result.active = true;

            let p_db = cc.find("node_result/p_db", this.node);
            let b_db = cc.find("node_result/b_db", this.node);

            let total_p = 0;
            let total_b = 0;
            for (let i = 0; i < 3; i++){
                let cardsData_p = result.playercards;
                if(cardsData_p[i] >= 0){
                    let card = cc.find(`card${i+1}`,p_db);
                    card.active = true;
                    await this._showCard(card, cardsData_p[i]);

                    let value = Math.min(10, cc.vv.gameData.convert16PokertoDatavalue(cardsData_p[i]).value);
                    total_p = (total_p+value)%10;
                    cc.find("point", p_db).getComponent(cc.Label).string = total_p;
                }

                let cardsData_b = result.bankercards;
                if(cardsData_b[i] >= 0){
                    let card = cc.find(`card${i+1}`,b_db);
                    card.active = true;
                    await this._showCard(card, cardsData_b[i]);

                    let value = Math.min(10, cc.vv.gameData.convert16PokertoDatavalue(cardsData_b[i]).value);
                    total_b = (total_b+value)%10;
                    cc.find("point", b_db).getComponent(cc.Label).string = total_b;
                    await cc.vv.gameData.awaitTime(0.2)
                }
            }
            cc.find("point", p_db).getComponent(cc.Label).string = result.playerpoint;
            cc.find("point", b_db).getComponent(cc.Label).string = result.bankerpoint;

            await cc.vv.gameData.awaitTime(0.5)

            let winNode = cc.find("node_result/ysz_tie", this.node);
            if(result.res == 1) {
                winNode = cc.find("win", b_db);
            } else if(result.res == 2) {
                winNode = cc.find("win", p_db);
            }

            winNode.active = true;
            // await cc.vv.gameData.awaitTime();

            res()
        })
    },

    //显示牌结果
    _showCard:function(card,cardVal){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            card.getComponent("Poker").doTurnAction(cardVal,endCall,0.2,0.7)
            Global.TableSoundMgr.playCommonEff("flipcard")
        })
    },


    //方位赢动画
    _showAreanWin:function(idxs){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            let area_scp = this._getBetAreaScript()
            idxs.forEach(idx=>{
                let area_node = area_scp.getBetAreaNode(idx)
                if(area_node){
                    let winFlag = cc.find("sel",area_node)
                    winFlag.active = true
                    Global.blinkAction(winFlag,0.2,0.2,3,endCall)
                }
            })

            Global.TableSoundMgr.playEffect("win")
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
                res()
                //最后清理所有的
                //area_scp.clearTableBet()
            },1)

        })

    },

    //更新游戏记录
    updateGameRecord:function(){
        let record_node = cc.find("node_trend",this.node)
        record_node.getComponent("Baccarat_Trend").addARecord(true)
    },



    //开局动画
    showStartVsAni:function(bShow){
        // let node = cc.find("node_start_vs",this.node)
        // node.active = bShow
        // if(bShow){
        //     node.stopAllActions()
        //     cc.tween(node)
        //         .delay(2)
        //         .call(()=>{
        //             node.active = false
        //         })
        //         .start()
        // }
        // Global.TableSoundMgr.playEffect("pk")
    },




    showCardMask:function(){
        let node_trend = cc.find("node_trend",this.node);
        node_trend.active = true;

        let node_result = cc.find("node_result", this.node);
        node_result.active = false;

        cc.find("p_db/card1", node_result).getComponent("Poker").showPokerBg(0);
        cc.find("p_db/card2", node_result).getComponent("Poker").showPokerBg(0);
        cc.find("p_db/card3", node_result).getComponent("Poker").showPokerBg(0);
        cc.find("b_db/card1", node_result).getComponent("Poker").showPokerBg(0);
        cc.find("b_db/card2", node_result).getComponent("Poker").showPokerBg(0);
        cc.find("b_db/card3", node_result).getComponent("Poker").showPokerBg(0);
        cc.find("p_db/card1", node_result).active = false;
        cc.find("p_db/card2", node_result).active = false;
        cc.find("p_db/card3", node_result).active = false;
        cc.find("b_db/card1", node_result).active = false;
        cc.find("b_db/card2", node_result).active = false;
        cc.find("b_db/card3", node_result).active = false;

        cc.find("p_db/win", node_result).active = false;
        cc.find("b_db/win", node_result).active = false;

        cc.find("p_db/point", node_result).getComponent(cc.Label).string = 0;
        cc.find("b_db/point", node_result).getComponent(cc.Label).string = 0;

        cc.find("ysz_tie", node_result).active = false;
    }




    // update (dt) {},
});
