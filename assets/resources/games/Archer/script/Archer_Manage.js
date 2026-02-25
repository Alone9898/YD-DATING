cc.Class({
    extends: cc.Component,

    properties: {
        _isInFree:false,
        _isInBonus:false,
    },

    onLoad(){
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA,this.onRcvSubGameAction,this);
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA,this.onRcvSubGameAction,false,this);
    },

    start(){
        this.ReconnectShow()
    },

    /**
     * 请求子游戏数据51
     * @param gameType
     */
    reqSubGame(data) {
        return new Promise(res=>{
            let req = {
                c:MsgId.SLOT_SUBGAME_DATA,
                gameid:this._gameId,
                data:data
            };
            cc.vv.NetManager.send(req, true);

            this._subCallBack = res;
        });
    },

    onRcvSubGameAction(msg){
        if(this._subCallBack){
            this._subCallBack(msg);
            this._subCallBack = null;
        }
    },


    //断线重连的显示,重写
    //可根据自己断线逻辑重写
    async ReconnectShow(){
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1")
        let rest = cc.vv.gameData.GetFreeTime()
        if(rest){
            this.showCharacterActive(false);
            this.ShowGameview(true);
            cc.vv.gameData.getFreeScript().enterFreeGame();
        }
        else{
            // Global.SlotsSoundMgr.playEffect(Global.SlotsSoundMgr.music_Mermaid_enter)
            this.showCharacterActive(true);
            this.ShowGameview(false)
        }

        if(cc.vv.gameData.getBonusGame()){
            await cc.vv.gameData.getBonusScript().enterBonusGame();
        }


        cc.vv.gameData.GetSlotsScript().CanDoNextRound()
    },

    // 断网重连
    ReconnectNet(){
        if(cc.vv.gameData.GetSlotsScript()._stopTime > 0 && !cc.vv.gameData.GetSlotsScript()._gameInfo){  // 旋转中，未收到44返回
            this.ReconnectShow();
        }

        let bonusGame = cc.vv.gameData.getBonusGame();
        if(bonusGame){
            cc.vv.gameData.getBonusScript().ReconnectNet();
        }
    },

    async OnSpinEnd(){
        let _gameInfo = cc.vv.gameData.GetSlotsScript()._gameInfo
        if(!_gameInfo){
            return
        }
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1")

        //显示中奖路线
        cc.vv.gameData.GetSlotsScript().ShowWinTrace()
        //显示底部赢钱
        let nWin = cc.vv.gameData.GetGameWin()
        let nTotal = nWin
        let isNormalGame = true
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
            nTotal = cc.vv.gameData.getFreeWinCoin()
            isNormalGame = false
        }
        await new Promise((success, failed)=>{
            cc.vv.gameData.GetSlotsScript().ShowBottomWin(nWin,nTotal,isNormalGame,success)
        });


        // 触发免费
        let freeInfo = _gameInfo.freeResult.freeInfo;
        if (freeInfo && freeInfo.freeCnt > 0){
            await this.CheckEnterFreeGame();
        }

        // 结束免费
        if(_gameInfo.allFreeCnt > 0 && _gameInfo.freeCnt == 0){
            await this.CheckExitFreeGame();
        }

        let bonusGame = _gameInfo.bonusGame;
        if(bonusGame){
            await this.CheckEnterBonusGame();
        }

        cc.vv.gameData.GetSlotsScript().CanDoNextRound();
    },


    // 检查触发免费
    async CheckEnterFreeGame(){
        return new Promise(async (sucess,failed)=> {
            let _gameInfo = cc.vv.gameData.GetSlotsScript()._gameInfo
            let scatterIdx = _gameInfo.freeResult.freeInfo.scatterIdx;
            if(scatterIdx && scatterIdx.length > 0){
                for (let id of scatterIdx) {
                    let symbol = cc.vv.gameData.GetSlotsScript().GetSymbolByIdx(id);
                    if (symbol) {
                        symbol.playTriggerAnimation()
                    }
                }
            }

            let isFirst = _gameInfo.freeCnt == _gameInfo.allFreeCnt;
            Global.SlotsSoundMgr.playEffect("music_MagicLady_scatter_TriggerFreespin");
            if(isFirst){
                await cc.vv.gameData.awaitTime(1.5);
                await cc.vv.gameData.getPopupScript().playTriFreeAnim();

                this.showCharacterActive(false);
                cc.vv.gameData.getPopupScript().playQPAnim();
                await cc.vv.gameData.awaitTime(1.3);
                // await this.playTriQpAnim();
                this.ShowGameview(true);
                cc.vv.gameData.getFreeScript().enterFreeGame();
                await cc.vv.gameData.awaitTime(0.5);
            } else {
                await cc.vv.gameData.awaitTime(2);
            }

            sucess()
        });
    },

    // 检查结束免费
    async CheckExitFreeGame(){
        return new Promise(async (sucess,failed)=> {

            let winCoin = cc.vv.gameData.getFreeWinCoin();
            await cc.vv.gameData.getPopupScript().playWinFreeAnim(winCoin, cc.vv.gameData.GetTotalFree());

            // await this.playEndQpAnim();
            cc.vv.gameData.getPopupScript().playQPAnim();
            await cc.vv.gameData.awaitTime(1.3);
            this.ShowGameview(false);
            cc.vv.gameData.getFreeScript().exitFreeGame();
            await cc.vv.gameData.awaitTime(0.4);
            this.showCharacterActive(true);

            await new Promise((success, failed)=>{
                cc.vv.gameData.GetSlotsScript().ShowBottomWin(winCoin,winCoin,true,success)
            });

            // cc.vv.gameData.changeSlotsFree()
            sucess()
        });
    },

    // 检查触发小游戏
    async CheckEnterBonusGame(){
        return new Promise(async (sucess,failed)=> {
            await cc.vv.gameData.awaitTime(0.5);
            let _gameInfo = cc.vv.gameData.GetSlotsScript()._gameInfo;
            let bonusIdxs = _gameInfo.bonusIdxs;
            if(bonusIdxs && bonusIdxs.length > 0){
                for (let id of bonusIdxs) {
                    let symbol = cc.vv.gameData.GetSlotsScript().GetSymbolByIdx(id);
                    if (symbol) {
                        symbol.playBonusTriggerAnim()
                    }
                }
            }
            Global.SlotsSoundMgr.playEffect("music_MagicLady_scatter_TriggerRespin");
            await cc.vv.gameData.awaitTime(1.5);
            // 转场动画
            // await this.playTriQpAnim();
            this.showCharacterActive(false)
            cc.vv.gameData.getPopupScript().playQPAnim();
            await cc.vv.gameData.awaitTime(1.3);


            // this.showBonusView(true);
            await cc.vv.gameData.getBonusScript().enterBonusGame(true);


            sucess()
        });
    },

    showCharacterActive(bShow){
        cc.find("Canvas/safe_node/Archer").active = bShow;
    },

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree){
        if(bFree){
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()

            //显示免费次数
            cc.vv.gameData.GetBottomScript().ShowFreeModel(true,total-rest,total)
            let nTotal = cc.vv.gameData.getFreeWinCoin()
            cc.vv.gameData.GetBottomScript().SetWin(nTotal)

            cc.vv.gameData.changeSlotsFree()
        }
        else{
            cc.vv.gameData.GetBottomScript().ShowFreeModel(false)

            cc.vv.gameData.changeSlotsNormal()
        }

        //可能还需要显示免费背景图
        let normalBg = cc.find("Canvas/safe_node/spr_bg_normal")
        let normalFree = cc.find("Canvas/safe_node/spr_bg_free")
        if(normalFree){ //存在免费游戏背景才执行下面的逻辑
            if(normalBg){
                normalBg.active = !bFree
            }
            normalFree.active = bFree
        }

        cc.find("Canvas/safe_node/slots").active = !bFree;
        cc.find("Canvas/safe_node/slots_free").active = bFree;
        cc.find("Canvas/safe_node/LMSlots_PrizePool_1").active = !bFree;
        // cc.find("Canvas/safe_node/Archer",).active = !bFree;
        // this.showCharacterActive(!bFree)

        // if(bFree){
        //     // cc.find("Canvas/safe_node/character_ren",).active = false;
        //     // cc.find("Canvas/safe_node/character").active = false;
        //     cc.find("Canvas/safe_node/Archer",).active = false;
        // }
    },

    showBonusView(isBonus){
        cc.find("Canvas/safe_node/slots").active = !isBonus;
        cc.find("Canvas/safe_node/spr_bg_normal").active = !isBonus;
        cc.find("Canvas/safe_node/spr_bg_bonus").active = isBonus;
        // cc.find("Canvas/safe_node/Archer",).active = !isBonus;

        // if(isBonus){
        //     // cc.find("Canvas/safe_node/character_ren",).active = false;
        //     // cc.find("Canvas/safe_node/character").active = false;
        //     cc.find("Canvas/safe_node/Archer",).active = false;
        // }
    },



    //奖池锁定(停止滚动)
    lockJackpot(jackpotvalus){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.PausePool([{prizeType:0,pauseNum:jackpotvalus[0]},{prizeType:1,pauseNum:jackpotvalus[1]},
            {prizeType:2,pauseNum:jackpotvalus[2]},{prizeType:3,pauseNum:jackpotvalus[3]}]);
    },

    //恢复奖池
    unlockJackpot(){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.ResumePausePool();
    },


    // playTriQpAnim(){
    //     return new Promise(async (success, failed)=> {
    //         Global.SlotsSoundMgr.playEffect("music_MagicLady_changeToEffect");
    //
    //         // let ren = cc.find("Canvas/safe_node/character_ren");
    //         // let character = cc.find("Canvas/safe_node/character");
    //         // let qiu = cc.find("character_qiu", character);
    //         // let shou = cc.find("character_shou", character);
    //
    //         // ren.getComponent(sp.Skeleton).setAnimation(0, "actionframe2", false);
    //         // qiu.getComponent(sp.Skeleton).setAnimation(0, "actionframe2", false);
    //         // shou.getComponent(sp.Skeleton).setAnimation(0, "actionframe2", false);
    //
    //
    //         await cc.vv.gameData.awaitTime(1.5)
    //
    //         let bg_nor = cc.find("Canvas/safe_node/spr_bg_normal");
    //         let slots = cc.find("Canvas/safe_node/slots");
    //         cc.tween(bg_nor).to(1, {scale: 3}).start();
    //         cc.tween(slots).to(1, {scale: 2}).start();
    //
    //         await cc.vv.gameData.awaitTime(1)
    //         // ren.active = false;
    //         // character.active = false;
    //         cc.find("Canvas/safe_node/Archer").active = false;
    //         success()
    //     });
    // },


    // playEndQpAnim(){
    //     return new Promise(async (success, failed)=> {
    //         Global.SlotsSoundMgr.playEffect("music_MagicLady_changeToNormalEffect");
    //
    //         // let ren = cc.find("Canvas/safe_node/character_ren");
    //         // let character = cc.find("Canvas/safe_node/character");
    //         // let qiu = cc.find("character_qiu", character);
    //         // let shou = cc.find("character_shou", character);
    //
    //         // character.active = true;
    //         // ren.active = true;
    //         // qiu.getComponent(sp.Skeleton).setAnimation(0, "actionframe3", false);
    //         // qiu.getComponent(sp.Skeleton).addAnimation(0, "idleframe", true);
    //         // ren.getComponent(sp.Skeleton).setAnimation(0, "actionframe3", false);
    //         // ren.getComponent(sp.Skeleton).addAnimation(0, "idleframe", true);
    //         // shou.getComponent(sp.Skeleton).setAnimation(0, "actionframe3", false);
    //         // shou.getComponent(sp.Skeleton).addAnimation(0, "idleframe", true);
    //
    //         cc.find("Canvas/safe_node/Archer").active = true;
    //         await cc.vv.gameData.awaitTime(0.5);
    //
    //         // await cc.vv.gameData.awaitTime(1)
    //
    //         let bg_nor = cc.find("Canvas/safe_node/spr_bg_normal");
    //         let slots = cc.find("Canvas/safe_node/slots");
    //         cc.tween(bg_nor).to(1, {scale: 2}).start();
    //         cc.tween(slots).to(1, {scale: 1}).start();
    //
    //         await cc.vv.gameData.awaitTime(1)
    //
    //         success()
    //     })
    // },

    // update (dt) {},
});