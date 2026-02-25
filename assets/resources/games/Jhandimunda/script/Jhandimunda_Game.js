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



    },

    async showResultStatu(){
        this._super()


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
            // //方位赢表现
            // await this._showAreanWin(resultMsg.result.winplace)


            //各自飞金币
            await this._flyWinCoin(resultMsg)

            this.updateGameRecord()
            this.doShowResultFinish()

        }
        else{
            //没结果，显示等待
            this._showWaitResult(true)
        }

    },

    _playResultAnim:function(result){
        return new Promise(async (res, rej) => {
            Global.TableSoundMgr.playEffect("touzi");
            let zhaoziSp = cc.find("node_result/zhaozi", this.node).getComponent(sp.Skeleton);
            zhaoziSp.setAnimation(0,"JhandiMunda_dice1",false);
            for (let i = 0; i < 3; i++){
                zhaoziSp.addAnimation(0,"JhandiMunda_dice2",false);
            }
            zhaoziSp.addAnimation(0,"JhandiMunda_dice3",false);

            await cc.vv.gameData.awaitTime(2.5);
            let list = cc.find("node_result/list", this.node);

            let sPos = list.convertToNodeSpaceAR(zhaoziSp.node.convertToWorldSpaceAR(cc.v2(30,680)));

            let areaList = [[],[],[],[],[],[]];
            for (let i = 0; i < list.childrenCount; i++){
                let item = list.children[i];
                let ePosX = i*100-Math.random()*50 - 200;
                let ePosY = (i*40-Math.random()*40 - 80) * (Math.random()>0.5 ? -1 : 1);
                item.active = true;
                item.scale = 0;
                item.position = sPos
                item.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`touzi_0${result.cards[i]}`);
                areaList[result.cards[i]-1].push(item);
                cc.tween(item)
                    .to(0.5, {position:cc.v2(ePosX, ePosY), scale:1})
                    .start();
            }

            await cc.vv.gameData.awaitTime(0.8);

            //方位赢表现
            this._showAreanWin(result.mults);
            await cc.vv.gameData.awaitTime(0.3);

            for (let i = 0; i < areaList.length; i++){
                let cnt = result.res[i];
                if(cnt > 0){
                    let poslist = this.getPosList(cnt);

                    // cc.log("骰子方位：",i, "骰子个数：", cnt);
                    let areaNode= this._getBetAreaScript().getBetAreaNode(i+1)
                    areaList[i].forEach((node, idx)=>{
                        let endPos = areaNode.convertToWorldSpaceAR(poslist[idx]);
                        cc.tween(node)
                            .to(0.5, {position:node.parent.convertToNodeSpaceAR(endPos)})
                            .start()
                    })
                }
            }

            await cc.vv.gameData.awaitTime(1);

            this._showAreaMults(result.mults);

            await cc.vv.gameData.awaitTime(1);



            res()
        })
    },

    getPosList(cnt){

        let list = [];
        if(cnt == 1 ){
            list = [cc.v2(0,0)];
        } else if(cnt == 2){
            list = [cc.v2(-50, 0), cc.v2(50,0)]
        } else if(cnt == 3){
            list = [cc.v2(-100,0), cc.v2(0,0), cc.v2(100,0)]
        } else if(cnt == 4){
            list = [cc.v2(-50,50),cc.v2(50,50),cc.v2(-50,-50),cc.v2(50,-50),]
        } else if(cnt == 5){
            list = [cc.v2(-50,50),cc.v2(50,50),cc.v2(-80,-50),cc.v2(0,-50),cc.v2(80,-50),]
        } else if(cnt == 6){
            list = [cc.v2(-100,50),cc.v2(0,50),cc.v2(100,50),cc.v2(-100,-50),cc.v2(0,-50),cc.v2(100,-50),]
        }

        return list;
    },

    //飞赢的金币
    _flyWinCoin:function(){
        return new Promise(async(res, rej) => {
            let resultMsg = cc.vv.gameData.getResultMsg();
            let result = resultMsg.result.res;
            let mults = resultMsg.result.mults;
            let area_scp = this._getBetAreaScript();
            let zhuang = cc.find("Canvas/safe_node/Bg/zhuang");
            let flyNode = cc.find("Canvas/safe_node/fly")

            let winIdxs = [];
            let win_aren = [];
            result.forEach((data,idx)=>{
                if(data >= 2){
                    winIdxs.push(idx+1);
                    win_aren.push(area_scp.getBetAreaNode(idx+1));
                }
            });

            // 输的方位飞到庄家
            let losechips = [];
            for(let i = 0; i < area_scp.AreaList.length; i++){
                let item = area_scp.AreaList[i];
                if(!winIdxs.includes(item.idx)){
                    let itemchips = area_scp.getAreaChips(item.idx);
                    for(let j = 0; j < itemchips.length; j++){
                        losechips.push(itemchips[j])
                    }
                }
            }
            for(let i = 0; i < losechips.length; i++){
                let item = losechips[i];
                let toOffSet = cc.v2(0,0);
                area_scp.moveChip(item.chipNode,item.chipNode,zhuang,null,true,toOffSet,flyNode)
            }

            await cc.vv.gameData.awaitTime(1);
            this.showCardMask();

            // 庄家飞到赢的方位
            for(let i = 0; i < winIdxs.length; i++){
                let idx = winIdxs[i];
                let totalbet = cc.vv.gameData.getAreaTotalBet(idx) * mults[idx-1];
                let chipList = cc.vv.gameData.formatVal2Chiplist(totalbet);

                chipList.forEach(bet=>{
                    let chip = area_scp._create_chip(cc.vv.gameData.getChipValByIdx(bet),null,idx);
                    chip.position = chip.parent.convertToNodeSpaceAR(zhuang.convertToWorldSpaceAR(cc.v2(0,0)));

                    let chipCon = cc.find("chip_container",area_scp.getBetAreaNode(idx))
                    let xPos = Global.random(-chipCon.width/2,chipCon.width/2)
                    let yPos = Global.random(-chipCon.height/2,chipCon.height/2)

                    chip.active = false;
                    cc.tween(chip)
                        .delay(Math.random()*0.6)
                        .call(()=>{
                            chip.active = true
                            area_scp.moveChip(chip, zhuang, chipCon, null, false,cc.v2(xPos, yPos),flyNode);
                        })
                        .start()

                })
            }

            await cc.vv.gameData.awaitTime(1)

            this._flyTableChips(resultMsg)

            res();
        })

    },

    //方位赢动画
    _showAreanWin:function(list){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            let area_scp = this._getBetAreaScript()
            list.forEach((cnt, idx)=>{
                if(cnt > 0){
                    let area_node = area_scp.getBetAreaNode(idx+1)
                    if(area_node){
                        let winFlag = cc.find("sel",area_node)
                        winFlag.active = true
                        Global.blinkAction(winFlag,0.2,0.2,3,endCall)
                    }
                }
            })
        })
    },

    //方位赢倍率
    _showAreaMults(mults){
        Global.TableSoundMgr.playEffect("win");
        let winNode = cc.find("node_result/win", this.node);
        mults.forEach((mult, idx) => {
            if(mult > 0){
                cc.find(`win${idx+1}`, winNode).active = true;
                cc.find(`win${idx+1}`, winNode).getComponent(sp.Skeleton).setAnimation(0,`win${Math.floor(mults[idx])}`,false);   //2.5的动画名改成了2
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

    //更新游戏记录
    updateGameRecord:function(){
        let record_node = cc.find("node_trend",this.node)
        record_node.getComponent("Jhandimunda_Trend").showRecord(true)
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
        let zhaoziSp = cc.find("node_result/zhaozi", this.node).getComponent(sp.Skeleton);
        zhaoziSp.setAnimation(0,"JhandiMunda_dice0",false);

        let list = cc.find("node_result/list", this.node);
        list.children.forEach(node=>{
            node.active = false;
        })

        let winNode = cc.find("node_result/win", this.node);
        winNode.children.forEach(node=>{
            node.active = false;
        })
    }




    // update (dt) {},
});
