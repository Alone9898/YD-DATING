cc.Class({
    extends: cc.Component,

    properties: {
        _bgs: null,

        _isFreeTime: false,
        _freeCnt: 0,         // 免费游戏次数
        _allFreeCnt: -1,     // 总次数
        _freeWinCoin:0,
    },


    // LIFE-CYCLE CALLBACKS:

    // init(bgs) {

    //     this._bgs = bgs;
    // },

    // onLoad(){

    //     this._soundCfg = require(cc.vv.SlotGameCfg[cc.vv.gameData._gameId].cfgCmp).soundCfg;
    // },

    // start () {


    //     if(cc.vv.gameData.triggerEngerGame())
    //         return;
    //     this.initEnterFreeGame();
    // },

    // //初始化游戏进入免费
    // initEnterFreeGame(){
    //     let deskInfo = cc.vv.gameData.getDeskInfo();
    //     if (deskInfo.restFreeCount > 0) {
    //         let bonusData = cc.vv.gameData.getBonusData();
    //         if(!bonusData){
    //             this._freeCnt = deskInfo.restFreeCount;
    //             this._isFreeTime = true;
    //             this._freeWinCoin = deskInfo.freeWinCoin;
    //             this.scheduleOnce(()=>{ //直接开始免费游戏
    //                 this.showFreeUI(true,true);
    //                 Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_ENTER_FREE_GAME);
    //                 Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOUCH_MOVE);
    //             },1.0);
    //         }else{
    //             //初始化进入bonus
    //             this.node.getComponent('RegalTiger_ItemsNode').initBonusData();
    //         }
    //     }
    // },

    // onRecvGameStart(data) {
    //     this._super(data);
    //     data = data.detail;
    //     this._freeWinCoin = data.freeWinCoin;
    //     this._winCoin = data.wincoin;
    //     this._freeCnt = data.freeCnt;
    //     this._allFreeCnt = data.allFreeCnt;
    //     this._resultCards = data.resultCards;
    // },

    // // 播放线路完成
    // onRecvPlayLineFinish (){
    //     AppLog.log("###线路播放完成 onRecvPlayLineFinish");
    //     if(cc.vv.gameData.triggerEngerGame())
    //         return;

    //     let bonusData = cc.vv.gameData.getBonusData();
    //     if(bonusData){
    //         return;
    //     }
    //     AppLog.log("免费总次数2:"+this._allFreeCnt+" 当前剩余次数2:"+this._freeCnt);
    //     if (this._freeCnt > 0) {
    //         this._isFreeTime = true;
    //          if (this._freeCnt == this._allFreeCnt) { //开始免费游戏 
    //             Global.playHSEffect(this._soundCfg.scatter_trigger);
    //             Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_PAUSE_AUTO);
    //             AppLog.log("#显示 showEnterFreeAni");
    //             this.showEnterFreeAni();
    //          }else{
    //             if(cc.vv.gameData.isTrigFree()){
    //                 AppLog.log("###免费触发免费");
    //                this.scheduleOnce(()=>{
    //                    this.node.getComponent("Tiger_Operate").freeOpenFreeGame();
    //                },1);
    //             }
    //          }
    //     }else{
    //         AppLog.log("是否免费:"+this._isFreeTime);
    //         if(this._isFreeTime){
    //             cc.vv.gameData.setIsFreeGameUI(true);
    //             this.showFreeUI(false);
    //             this._isFreeTime = false;
    //         }
    //     }

    //     //this._super();
    // },

    // //免费游戏完成
    // showFreeUI(bShow,initshow = false){
    //     AppLog.log("#显示 showFreeUI"+bShow);
    //     let bg = cc.find("safe_node/bg", this.node).getComponent(cc.Sprite);
    //     if (bShow) {
    //         //显示mian
    //         bg.spriteFrame = this._bgs[1];

    //         if (!initshow&&(this._freeCnt == this._allFreeCnt)){
    //             let freeGame = cc.find('Canvas/safe_node/node_free_start')
    //             freeGame.active = true
    //             let scp = freeGame.getComponent('RegalTiger_free_start')
    //             scp.showEnter(1,0,this._allFreeCnt)
    //         }
    //         cc.vv.gameData.setFreeTime(true);

    //     } else {
    //         this.node.getComponent("Tiger_Operate").setOpeaterBtnEnbale(false);
    //         this.scheduleOnce(()=>{
    //             this.showFreeGameResult(this._freeWinCoin);
    //             cc.vv.AudioManager.stopBgm();
    //             bg.spriteFrame = this._bgs[0];
    //         },1);
    //     }
    // },

    // showEnterFreeAni() { 
    //     this.scheduleOnce(()=>{
    //         AppLog.log("#显示 scheduleOnce");
    //         //展示进入免费界面
    //         this.showFreeUI(true);
    //     },1);
    // },

    // //显示免费游戏结算
    // showFreeGameResult(coin) {
    //     let freeGame = cc.find('Canvas/safe_node/node_free_start')
    //     freeGame.active = true
    //     let scp = freeGame.getComponent('RegalTiger_free_start')
    //     scp.showFreeWin(1,coin)
    // },

    // //播放进入免费游戏的spine动画 type 0结束 1开始
    // playFreeSpine(type){
    //     let spineeff = cc.find("safe_node/freegamestartspine",this.node);
    //     this.node.runAction(cc.sequence(cc.callFunc(()=>{
    //         spineeff.active = true;
    //         Global.playHSEffect(this._soundCfg.transition1);
    //         spineeff.getComponent(sp.Skeleton).setAnimation(0,"animation",false)
    //     }),cc.delayTime(3),cc.callFunc(()=>{
    //         spineeff.active = false
    //         if(type == 1){
    //             //展示免费次数
    //             AppLog.log('##展示免费游戏');
    //             this.showFreeGame(true);
    //             this.node.getComponent("Tiger_Operate").enterFree();
    //             //Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOUCH_MOVE);
    //         }else{
    //             cc.find("Canvas").getComponent("Tiger_Operate").setOpeaterBtnEnbale(true);
    //             Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_RESUME_AUTO);
    //         }
    //     })));
    // },
});
