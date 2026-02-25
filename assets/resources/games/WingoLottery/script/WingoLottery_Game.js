/**
 *
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



    },

    async showResultStatu(){
        this._super()

        this.showCardMask()
        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //保存记录:看这个是否可以公用
            cc.vv.gameData.addGameRecord(resultMsg.result.ball)

            //有结果，播放结果
            this._showWaitResult(false)

            await this._playResultAnim(resultMsg.result)
            // //先翻牌：龙到虎
            // await this._showCard("card_dragon",resultMsg.result.c1)
            // await cc.vv.gameData.awaitTime(0.5)
            // await this._showCard("card_tiger",resultMsg.result.c2)
            //方位赢表现
            await this._showAreanWin(resultMsg.result.res)
            //各自飞金币
            await this._flyWinCoin(resultMsg)

            // this.updateGameRecord()
            this.doShowResultFinish()

        }
        else{
            //没结果，显示等待
            this._showWaitResult(true)
        }

    },

    _playResultAnim:function(result){
        return new Promise(async (res, rej) => {
            Global.TableSoundMgr.playEffect("ball");
            let yiqiSp = cc.find("node_result/yiqi", this.node).getComponent(sp.Skeleton);
            let ball = cc.find("node_result/mask/ball", this.node)
            ball.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getBaseAtlas().getSpriteFrame(`ball_${result.ball}`);
            yiqiSp.setAnimation(0,"Colorball1",false);
            yiqiSp.addAnimation(0,"Colorball2",false);
            yiqiSp.addAnimation(0,"Colorball3",false);

            await cc.vv.gameData.awaitTime(2.8);

            Global.TableSoundMgr.playEffect("ballout");
            ball.active = true;
            ball.getComponent(cc.Animation).play("ball_show");

            await cc.vv.gameData.awaitTime(1.2);
            ball.getComponent(cc.Animation).play("ball_hide");

            await cc.vv.gameData.awaitTime(0.7);
            this.updateGameRecord();
            await cc.vv.gameData.awaitTime(0.3);
            res()
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

            Global.TableSoundMgr.playEffect("win");
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

    //更新游戏记录
    updateGameRecord:function(){
        let record_node = cc.find("node_trend",this.node)
        record_node.getComponent("WingoLottery_Trend").showRecord(true)
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

    //飞赢的金币
    _flyWinCoin:function(){
        return new Promise(async(res, rej) => {
            let resultMsg = cc.vv.gameData.getResultMsg();
            let result = resultMsg.result.res;
            let area_scp = this._getBetAreaScript();
            let zhuang = cc.find("Canvas/safe_node/node_result/zhuang");
            // let flyNode = cc.find("Canvas/safe_node/fly")

            // 输的方位飞到庄家
            Global.TableSoundMgr.playEffect("fly");
            let losechips = [];
            for(let i = 0; i < area_scp.AreaList.length; i++){
                let item = area_scp.AreaList[i];
                if(!result.includes(item.idx)){
                    let itemchips = area_scp.getAreaChips(item.idx);
                    for(let j = 0; j < itemchips.length; j++){
                        losechips.push(itemchips[j])
                    }
                }
            }
            for(let i = 0; i < losechips.length; i++){
                let item = losechips[i];
                let toOffSet = cc.v2(0,0);
                area_scp.moveChip(item.chipNode,item.chipNode,zhuang,null,true,toOffSet)
            }

            await cc.vv.gameData.awaitTime(1);
            this.showCardMask();

            let multLit = [9,9,9,9,9,9,9,9,9,9,2.3,4.5,2.3]
            // 庄家飞到赢的方位
            Global.TableSoundMgr.playEffect("fly");
            for(let i = 0; i < result.length; i++){
                let idx = result[i];
                let totalbet = cc.vv.gameData.getAreaTotalBet(idx) * multLit[idx-1];
                let chipList = cc.vv.gameData.formatVal2Chiplist(totalbet);

                chipList.forEach(bet=>{
                    let chip = area_scp._create_chip(cc.vv.gameData.getChipValByIdx(bet),null,idx);
                    chip.position = chip.parent.convertToNodeSpaceAR(zhuang.convertToWorldSpaceAR(cc.v2(0,0)));

                    let chipCon = cc.find("chip_container",area_scp.getBetAreaNode(idx))
                    let xPos = Global.random(-chipCon.width/2,chipCon.width/2)
                    let yPos = Global.random(-chipCon.height/2,chipCon.height/2)

                    cc.tween(chip)
                        .delay(Math.random()*0.7)
                        .call(()=>{
                            area_scp.moveChip(chip, zhuang, chipCon, null, false,cc.v2(xPos, yPos));
                        })
                        .start()

                })
            }

            await cc.vv.gameData.awaitTime(1)

            this._flyTableChips(resultMsg)

            res();
        })

    },


    showCardMask:function(){
        cc.find("node_result/yiqi", this.node).getComponent(sp.Skeleton).setAnimation(0,"Colorball0",false);
        cc.find("node_result/mask/ball", this.node).active = false;
    }




    // update (dt) {},
});
