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
        _bRun : false,
        _nT : 0,
    },

    StartGame() {
        this._super()

        this._getBetAreaScript().setOdds(cc.vv.gameData.getOdds());
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
        //odds
        this._getBetAreaScript().setOdds(cc.vv.gameData.getOdds());

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
            cc.vv.gameData.addGameRecord(resultMsg.result.res)

            //有结果，播放结果
            this._showWaitResult(false)

            await this._playResultAnim(resultMsg.result)
            // //先翻牌：龙到虎
            // await this._showCard("card_dragon",resultMsg.result.c1)
            // await cc.vv.gameData.awaitTime(0.5)
            // await this._showCard("card_tiger",resultMsg.result.c2)
            //方位赢表现
            // await this._showAreanWin(resultMsg.result.res)


            //各自飞金币
            await this._flyWinCoin()

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
            Global.TableSoundMgr.stopBgm();
            Global.TableSoundMgr.playEffect("start_sm");
            let startSp = cc.find("node_result/ani_ludo_start", this.node).getComponent(sp.Skeleton);
            startSp.node.active = true;
            startSp.setAnimation(0,"start",false);
            await cc.vv.gameData.awaitTime(1);
            startSp.node.active = false;

            Global.TableSoundMgr.playBgm("saipao_sm");

            this._bRun = true;
            this._nT = 0;

            // 开始到结束全程总共16+2秒
            this.playLuAnim();
            this.playMaAnim(result.res);

            await cc.vv.gameData.awaitTime(16+2);
            this._bRun = false;
            this._nT = 0;

            Global.TableSoundMgr.stopBgm();
            await cc.vv.gameData.awaitTime(0.5);
            Global.TableSoundMgr.playEffect("other_win_sm");
            let pop = cc.find("pop", this.node);
            pop.active = true;
            cc.find("spine", pop).getComponent(sp.Skeleton).setAnimation(0, "jiesuan", false);
            cc.find("spr", pop).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`paoma_js_horse${result.res}`);
            cc.find("lbl", pop).getComponent(cc.Label).string = `Horse ${result.res}`;

            await cc.vv.gameData.awaitTime(2.5);
            pop.active = false;

            Global.TableSoundMgr.playNormalBgm();
            res()
        })
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

    // //显示牌结果
    // _showCard:function(card,cardVal){
    //     return new Promise((res, rej) => {
    //         let endCall = function(){
    //             res()
    //         }
    //         card.getComponent("Poker").doTurnAction(cardVal,endCall,0.2,0.9)
    //         Global.TableSoundMgr.playCommonEff("flipcard")
    //     })
    // },


    //方位赢动画
    _showAreanWin:function(result){
        let area_scp = this._getBetAreaScript()
        for(let i= 0; i < area_scp.AreaList.length; i++){
            let sel = cc.find("sel",area_scp.AreaList[i].node);
            let jiangbei = area_scp.jiangbeiList[i];
            if(result == i+1){
                sel.active = true;
                jiangbei.active = true;
            } else {
                sel.active = false;
                jiangbei.active = false;
            }

        }
    },

    //清理赢的表现
    _clearAreaWin:function(){
        let area_scp = this._getBetAreaScript()
        for(let i= 0; i < area_scp.AreaList.length; i++){
            let item= area_scp.AreaList[i]
            let winFlag = cc.find("sel",item.node)
            winFlag.active = false
            let jiangbei = area_scp.jiangbeiList[i];
            jiangbei.active = false
        }
    },

    //更新游戏记录
    updateGameRecord:function(){
        let record_node = cc.find("node_trend",this.node)
        record_node.getComponent("HorseRace_Trend").showRecord(true)
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
        cc.find("node_result/mask/paoma_saidao1/paoma_endline", this.node).active = false;
        cc.find("node_result/jindu/biaoji", this.node).active = false;
    },

    playLuAnim(){
        let mask = cc.find("node_result/mask", this.node);

        let tk1 = cc.find("paoma_tiankong1", mask);
        let tk2 = cc.find("paoma_tiankong2", mask);
        let sd1 = cc.find("paoma_saidao1", mask);
        let sd2 = cc.find("paoma_saidao2", mask);
        let endline = cc.find("paoma_saidao1/paoma_endline", mask);

        let sX = -mask.width/2;

        tk1.x = sX;
        cc.tween(tk1)
            .repeat(2,
                cc.tween()
                    .to(4, {x: sX-tk1.width})
                    .call(() => {
                        tk1.x = tk1.width+sX;
                    })
                    .to(4, {x: sX})
            )
            .start()
        tk2.x = tk1.width+sX;
        cc.tween(tk2)
            .repeat(2,
                cc.tween()
                    .to(8, {x: sX-tk1.width})
                    .call(() => {
                        tk2.x = tk1.width+sX
                    })
            )
            .start()


        sd1.x = sX;
        cc.tween(sd1)
            .repeat(16,
                cc.tween()
                    .to(0.5, {x: sX-sd1.width})
                    .call(() => {
                        sd1.x = sd1.width+sX
                    })
                    .to(0.5, {x: sX})
            )
            .start()
        sd2.x = sd1.width+sX;
        cc.tween(sd2)
            .repeat(16,
                cc.tween()
                    .to(1, {x: sX-sd1.width})
                    .call(() => {
                        sd2.x = sd1.width+sX
                    })
            )
            .start()

        endline.active = false;
        cc.tween(endline)
            .delay(15.5)
            .call(()=>{ endline.active = true;})
            .start()
    },

    playMaAnim(res){
        console.log("res：", res);
        let s_zong = 825;   // 起点到终点的距离(136+689)
        let endX = 720;   // 终点到出框位置
        let t = 16; // 第一名到终点的时间

        let ma_sx = -689; // 马的初始位置
        let max1 = Math.floor(Math.random()*6+1);
        let max2 = Math.floor(Math.random()*6+1);
        let max3 = res//Math.floor(Math.random()*6+1);
        let max4 = Math.floor(Math.random()*6+1);
        let max5 = res;
        for (let i = 0; i < 6; i++){
            let ma = cc.find("node_result/mask/ma_"+(i+1), this.node);
            ma.x = ma_sx

            let n_x_1 = (max1== i+1) ? (ma_sx+s_zong/5) : (ma_sx+s_zong/5*(1 - Math.random()))
            let n_x_2 = (max2== i+1) ? (ma_sx+s_zong*2/5) : (n_x_1+s_zong/5*(1 - Math.random()))
            let n_x_3 = (max3== i+1) ? (ma_sx+s_zong*3/5) : (n_x_2+s_zong/5*(1 - Math.random()))
            let n_x_4 = (max4== i+1) ? (ma_sx+s_zong*4/5) : (n_x_3+s_zong/5*(1 - Math.random()))
            let n_x_5 = (max5== i+1) ? (ma_sx+s_zong) : (n_x_4+s_zong/5*(1 - Math.random()))
            cc.tween(ma)
                .to(t/5, {x:n_x_1})
                .to(t/5,{x:n_x_2})
                .to(t/5, {x:n_x_3})
                .to(t/5,{x: n_x_4})
                .to(t/5,{x:n_x_5})
                .call(()=>{
                    ma.getComponent(sp.Skeleton).paused = true;
                })
                .delay(1)
                .call(()=>{
                    Global.TableSoundMgr.playEffect("runend_sm");

                })
                .delay(1)
                .call(()=>{
                    ma.getComponent(sp.Skeleton).paused = false;
                })
                .to(0.5,{x:endX})
                .start()
        }

        let biaoji = cc.find("node_result/jindu/biaoji", this.node);
        biaoji.active = true;
        biaoji.x = -biaoji.parent.width / 2;
        cc.tween(biaoji)
            .to(16, {x: biaoji.parent.width / 2 - 38}).to(0.5,{x: biaoji.parent.width / 2})
            .start()
    },

    getFirstIdx(){
        let maxX = -689;
        let idx;
        for (let i = 0; i < 6; i++) {
            let ma = cc.find("node_result/mask/ma_" + (i + 1), this.node);
            if(maxX < ma.x){
                maxX = ma.x;
                idx = i+1
            }
        }
        return idx;
    },

    update (dt) {
        if(this._bRun){
            this._nT += dt;
            if(this._nT > 0.1){
                this._nT = 0;
                let idx = this.getFirstIdx();
                cc.find("node_result/jindu/biaoji", this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`paoma_rank${idx}`);
                this._showAreanWin(idx)
            }
        }

    },
});
