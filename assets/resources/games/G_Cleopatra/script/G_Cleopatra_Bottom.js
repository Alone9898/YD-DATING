
cc.Class({
    extends: require('LMSlots_Bottom_Base'),
    properties: {

    },

    onLoad(){
        this._super();
        Global.registerEvent(cc.vv.gameData._EventId.G_CLEOPATRA_UNLOCK_ENERGY,this.unlockBetChange,this);
    },

    //重写点击旋转
    OnClickSpin:function(){
        if(cc.vv.gameData.isWaitOperate()){
            return;
        }
        this._super();
    },

    //重写可以进行下一轮
    CanDoNextRound:function(){
        this._bStartRound = false
        this.ShowBtnsByState("idle")

        let deskdata = cc.vv.gameData.getDeskInfo();
        if(deskdata.select&&deskdata.select.state){
            this.ShowBtnsByState("moveing_1")
            return;
        }

        //是否有免费游戏
        let restFree = cc.vv.gameData.GetFreeTime()
        if(restFree){
            //更新免费次数
            cc.vv.gameData.SetFreeTime(restFree-1)
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()
            this.ShowFreeModel(true,total-rest,total)
            //发起旋转请求
            this.SendSpinReq()
            return
        }

        if(cc.vv.gameData.isWaitOperate()){
            return;
        }
        let autoTime = cc.vv.gameData.GetAutoModelTime()
        if(autoTime){
            let cfg = cc.vv.gameData.getGameCfg()
            this.scheduleOnce(this.DoAutoSpine.bind(this),cfg.autoModelDelay)
            return
        }

        this.resetAllin()
    },

    //解锁押注额
    unlockBetChange(data){
        //参数为解锁值
        let val = data.detail;
        cc.vv.gameData.SetBetIdx(val)
        this.ShowBetCoin()
        //通知押注额修改
        let nTotal = cc.vv.gameData.GetTotalBet()
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,nTotal)
    },
});
