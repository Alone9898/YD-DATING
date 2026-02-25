/**
 * 7UpDown
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

        let timeEndCall = function(){

        }
        //显示倒计时
        this._showReTime(true,timeEndCall,"%s")
        // //显示龙虎斗开始动画,中途进来的不现实此动画
        // let nRemind = cc.vv.gameData.getStatusTime()

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

    // //倒计时 押注阶段倒计时，最后3秒有大的倒计时动画
    // _showReTime2:function(bShow,endCall,showFormat,perCall2){
    //     let nTime = cc.vv.gameData.getStatusTime()
    //     let node_retimer = cc.find("node_retimer",this.node)
    //     node_retimer.active = bShow
    //     let perCall = function(nTime){
    //         if(perCall){
    //             // if(nTime <=5){
    //             //     //押注阶段才倒计时
    //             //     if(cc.vv.gameData.getGameStatus() == 2){
    //             //         Global.TableSoundMgr.playCommonEff("com_timeAlarm")
    //             //     }
    //             // }
    //
    //             if(perCall2){
    //                 perCall2(nTime);
    //             }
    //         }
    //     }
    //     if(bShow){
    //         cc.find("val",node_retimer).getComponent("ReTimer").setReTimer(nTime,1,endCall,showFormat,perCall)
    //     }
    // },

    async showResultStatu(){
        this._super()
        this._showReTime(false)

        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //保存记录:看这个是否可以公用
            cc.vv.gameData.addGameRecord(resultMsg.result)

            //有结果，播放结果
            this._showWaitResult(false)

            // 骰子移到中间，播放摇骰子动画(区分金色骰子)
            await this._playResultAnim(resultMsg.result)
            // //先翻牌：龙到虎
            // await this._showCard("card_dragon",resultMsg.result.c1)
            // await cc.vv.gameData.awaitTime(0.5)
            // await this._showCard("card_tiger",resultMsg.result.c2)
            //方位赢表现
            await this._showAreanWin(resultMsg.result.res)
            //各自飞金币
            await this._flyWinCoin()
            this.doShowResultFinish()

        }
        else{
            //没结果，显示等待
            this._showWaitResult(true)
        }

    },

    // //显示牌结果
    // _showCard:function(cardName,cardVal){
    //     return new Promise((res, rej) => {
    //         let endCall = function(){
    //             res()
    //         }
    //         let card_dragon = cc.find("node_result/"+cardName,this.node)
    //         card_dragon.getComponent("Poker").doTurnAction(cardVal,endCall,0.2,0.9)
    //         Global.TableSoundMgr.playEffect("flipcard")
    //     })
    // },

    // 骰子移到中间，播放摇骰子动画(区分金色骰子)和结果
    _playResultAnim:function(result){
        return new Promise(async (res, rej) => {
            let cap = cc.find("node_result/cap", this.node);
            let nor = cc.find("node_result/cap_referNor", this.node);
            let win = cc.find("node_result/cap_referWin", this.node);

            cc.tween(cap)
                .parallel(
                    cc.tween().bezierTo(0.5, cc.v2(nor.x, nor.y), cc.v2((win.x - nor.x)/2, (win.y - nor.y)/2+100), cc.v2(win.x, win.y)),
                    cc.tween().to(0.5, {scale: win.scale}))
                .start();

            await cc.vv.gameData.awaitTime(0.5);

            Global.TableSoundMgr.playEffect("dice");
            // Global.TableSoundMgr.playEffect("win");

            let spr1 = cc.find("dice_1/spr",cap);
            let spr2 = cc.find("dice_2/spr",cap);
            spr1.active = false;
            spr2.active = false;
            let spine1 = result.gold ? cc.find("dice_1/jin",cap) : cc.find("dice_1/bai",cap);
            spine1.active = true;
            spine1.getComponent(sp.Skeleton).setAnimation(0, `point_${result.c1}`, false);
            let spine2 = result.gold ? cc.find("dice_2/jin",cap) : cc.find("dice_2/bai",cap);
            spine2.active = true;
            spine2.getComponent(sp.Skeleton).setAnimation(0,`point_${result.c2}`, false);

            await cc.vv.gameData.awaitTime(1);
            let atlas = result.gold ? cc.vv.gameData.getGoldDiceAtlas() : cc.vv.gameData.getNorDiceAtlas();
            let res_dice1 = cc.find("node_result/dice_1", this.node);
            res_dice1.active = true;
            res_dice1.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`dice_${result.c1}`);
            spr1.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getNorDiceAtlas().getSpriteFrame(`dice_${result.c1}`);
            let res_dice2 = cc.find("node_result/dice_2", this.node);
            res_dice2.active = true;
            res_dice2.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`dice_${result.c2}`);
            spr2.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getNorDiceAtlas().getSpriteFrame(`dice_${result.c2}`);

            let point = cc.find("node_result/point", this.node);
            point.active = true;
            point.getComponent(cc.Label).string = result.c1+result.c2;

            await cc.vv.gameData.awaitTime(0.5);
            res();
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
                winFlag.active = true
                Global.blinkAction(winFlag,0.2,0.2,3,endCall)
            }
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
                //
                // //赢的方位的金币飞往各自赢家，剩余的飞往观众
                // let winPlayer = 1 //默认一份给观众
                // let nMyWin = resultMsg.user.wincoin
                // if(nMyWin>0) winPlayer += 1
                // for(let i = 0; i < resultMsg.users.length; i++){
                //     let item = resultMsg.users[i]
                //     if(item.wincoin>0){
                //         winPlayer += 1
                //     }
                // }
                //
                // //将赢的区域的筹码数，平均分给赢的玩家
                // let winAreaChips = area_scp.getAllChips()
                // let perNum = Math.ceil(winAreaChips.length/winPlayer)
                // let obserNum = winAreaChips.length - (winPlayer-1) * perNum
                // let toNode = this.getMyNode()
                // if(nMyWin>0){
                //     for(let i = 0; i <perNum; i++){
                //         //先飞自己
                //
                //         let item = winAreaChips[i]
                //         let endCall = function(){
                //             item.chipNode.active = false
                //
                //         }
                //         area_scp.moveChip(item.chipNode,item.chipNode,toNode,endCall)
                //
                //         //然后飘分
                //         this.flyScroe(toNode,nMyWin)
                //     }
                // }
                // else{
                //     this.flyScroe(toNode,nMyWin)
                // }
                //
                //
                // //在飞桌上的
                // let tableWinIdx = -1
                // let starIdx = nMyWin>0?perNum:0
                // for(let i = 0; i < resultMsg.users.length; i++){
                //     let item = resultMsg.users[i]
                //     let itemWin = item.wincoin
                //     let itemNode = this._getPlayerNode(item.uid)
                //     if(itemWin>0){
                //         //winer
                //         tableWinIdx += 1
                //         for(let j = starIdx+tableWinIdx*perNum; j < (tableWinIdx*perNum+perNum); j++){
                //
                //             let chip = winAreaChips[j]
                //             let endCall = function(){
                //                 chip.chipNode.active = false
                //
                //             }
                //             area_scp.moveChip(chip.chipNode,chip.chipNode,itemNode,endCall)
                //         }
                //
                //
                //     }
                //     else{
                //         //loseer
                //
                //     }
                //
                //     //然后飘分
                //     this.flyScroe(itemNode,itemWin)
                // }
                //
                // //余下飞观众
                // for(let i= winAreaChips.length-obserNum; i < winAreaChips.length; i++){
                //     let chip = winAreaChips[i]
                //     let endCall = function(){
                //         chip.chipNode.active = false
                //
                //     }
                //     let toNode = this._getObserverNode()
                //     area_scp.moveChip(chip.chipNode,chip.chipNode,toNode,endCall)
                // }
                // Global.TableSoundMgr.playEffect("flywin")
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
        record_node.getComponent("SevenUpDown_Trend").showRecord(true)
    },

    //
    // //nType:1 开始下注 2结束下注
    // //TODO：动画形式
    // _showTextTipAni:function(bShow,nType){
    //     let node = cc.find("node_change_status",this.node)
    //     node.active = bShow
    //     if(bShow){
    //         node.stopAllActions()
    //         cc.tween(node)
    //             .delay(2)
    //             .call(()=>{
    //                 node.active = false
    //             })
    //             .start()
    //         Global.setLabelString("lbl",node,nType==1?"开始下注":"结束下注")
    //     }
    //     // if(nType ==1){
    //     //     Global.TableSoundMgr.playEffect("startbet")
    //     // }
    //     // else{
    //     //     Global.TableSoundMgr.playCommonEff("com_stopbet")
    //     // }
    // },

    showCardMask:function(){

        let cap = cc.find("node_result/cap", this.node);
        cap.scale =  cc.find("node_result/cap_referNor", this.node).scale;
        cap.position =  cc.find("node_result/cap_referNor", this.node).position;
        cc.find("dice_1/spr", cap).active = true;
        cc.find("dice_1/jin", cap).active = false;
        cc.find("dice_1/bai", cap).active = false;
        cc.find("dice_2/spr", cap).active = true;
        cc.find("dice_2/jin", cap).active = false;
        cc.find("dice_2/bai", cap).active = false;


        cc.find("node_result/dice_1", this.node).active = false;
        cc.find("node_result/dice_2", this.node).active = false;
        cc.find("node_result/point", this.node).active = false;

        // let card_dragon = cc.find("node_result/card_dragon",this.node)
        // let card_tiger = cc.find("node_result/card_tiger",this.node)
        //
        // card_dragon.getComponent("Poker").showPokerBg(0)
        // card_tiger.getComponent("Poker").showPokerBg(0)

    }




    // update (dt) {},
});
