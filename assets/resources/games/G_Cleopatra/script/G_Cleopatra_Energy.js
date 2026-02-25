
cc.Class({
    extends: cc.Component,

    properties: {
        _playUnlockState:0, 
    },

    onLoad () {
        this._collectUI = cc.find('Canvas/safe_node/collectGameUI');
        this._lblPyramidnumNode = cc.find('collectnum',this.node);

        let btn_lock = cc.find('btn_unlock',this.node)
        Global.btnClickEvent(btn_lock,this.onClicklock,this)

        let collecthelop = cc.find('pyramidicon',this.node);
        Global.btnClickEvent(collecthelop,this.onStartFreeGameEvent,this);

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_REFUSH_ENERGY, this.updateEnergy,this);   
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onChangeBetValue,this)

        this.updatePyaramidLock();
    },

    onEnable(){
        this.updateEnergy();
    },

    //点击解锁
    onClicklock:function(){
        if(cc.vv.gameData.isReelMove())
            return;
        if(this._playUnlockState == 1)
            return;
        Global.playHSEffect('collect_unlock');
        //更新押注额
        Global.dispatchEvent(cc.vv.gameData._EventId.G_CLEOPATRA_UNLOCK_ENERGY,cc.vv.gameData.getMinBet());

        //然后播放解锁表现
        let btn_unlock = cc.find('btn_unlock',this.node)
        cc.vv.gameData.playSpine(btn_unlock,'animation1',false,()=>{
            btn_unlock.active = false;
        })
    },

    //初始化金字塔状态
    updatePyaramidLock(){
        let btn_unlock = cc.find('btn_unlock',this.node);
        if (cc.vv.gameData.isOpenCollectProgress()){
            //解锁
            if(this._playUnlockState != 1){
                this._playUnlockState = 1
                Global.playHSEffect('collect_unlock');
                cc.vv.gameData.playSpine(btn_unlock,'animation1',false,()=>{
                    btn_unlock.active = false;
                })
            }
        }else{
            //锁定
            if(this._playUnlockState != 2){
                this._playUnlockState = 2
                Global.playHSEffect('collect_lock');
                cc.vv.gameData.playSpine(btn_unlock,'animation2',false,()=>{
                })
            }
        }
    },

    updateEnergy(){
        let pyramid = cc.vv.gameData.getPyramidNum();
        this.updatePyramidNum(pyramid);
    },

    //更新金字塔收集数量
    updatePyramidNum(num){
        Global.doRoallNumEff(this._lblPyramidnumNode,num,num,0,null,null,2,true);
    },

    onStartFreeGameEvent(){
        if(cc.vv.gameData.isReelMove())
            return;
        let data = cc.vv.gameData.getSelectData()
        if(data.state)
            return;
        if(cc.vv.gameData._collectFreeState)return;

        Global.playHSEffect('btn_click');
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        this._collectUI.active = true;
        Global.showAlertAction(this._collectUI,true,0.1,1,null)
    },

    //押注额改变val
    onChangeBetValue(data){
        this.updatePyaramidLock();
    },
});
