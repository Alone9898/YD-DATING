
cc.Class({
    extends: require('LMSlots_Bottom_Base'),

    properties: {
     
    },

    //可以进行下一轮
    async CanDoNextRound(){
        if(cc.vv.gameData.isFinishFreeGames()){
            await cc.vv.gameData.GetUIMgr().showNormalCollectUI();
        }
        this._bStartRound = false
        this.ShowBtnsByState("idle")

        let cfg = cc.vv.gameData.getGameCfg()
        if(cc.vv.gameData.isBigMapFree()){
            // 这里只是打标记，需要更新免费次数。在SendSpinReq才刷新
            this._needRefushFreeTime = false
            this.scheduleOnce(this.DoEnergyFreeSpine,cfg.autoModelDelay)
            return
        }

        //是否有免费游戏
        let restFree = cc.vv.gameData.GetFreeTime()
        if(restFree > 0){
            
            // 这里只是打标记，需要更新免费次数。在SendSpinReq才刷新
            this._needRefushFreeTime = true
            this.scheduleOnce(this.DoFreeSpine,cfg.autoModelDelay)
            return
        }

        //自定义旋转次数。不花费金币
        let respinTime = cc.vv.gameData.GetRespinTime()
        if (respinTime>0) {
            this.scheduleOnce(this.SendSpinReq,cfg.autoModelDelay)
            cc.vv.gameData.SetRespinTime(respinTime-1)
            return
        }

        let autoTime = cc.vv.gameData.GetAutoModelTime()
        if(autoTime>0){
            this.scheduleOnce(this.DoAutoSpine,cfg.autoModelDelay)
            return
        }
    },

    //免费模式请求
    DoEnergyFreeSpine:function(isinit){
        let energydata = cc.vv.gameData.getEnergyData();
        if(energydata&&energydata.freeGame){
            let total = energydata.freeGame.all;
            let rest = energydata.freeGame.rest;
            if(total>0&&total!=rest||isinit&&rest>0){
                this.ShowFreeModel(true,total-rest+1,total)
                //发起旋转请求
                this.SendSpinReq()
            }
        }
    },
});
