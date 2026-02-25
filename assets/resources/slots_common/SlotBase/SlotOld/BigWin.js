// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
cc.Class({
    extends: cc.Component,

    properties: {

        // _bigWinNode: null,
        // _hungeWinNode: null,
        _spEffect: 0,        // 0： 没特效 1： 大于45倍 Big Win 2： 大于90 Huge Win;
        _winNum: 0,
        _audioId: -1,
        _isShow: false,
        _mult: 1,            // 兑换倍率 在游戏的配置文件中设置
        _bigWinSprite: null,                 // bigwin标题
        _bigWinWitheSprite: null,            // bigwin动画文件
        _isWaitCloseFreeBalance: false,        // 是否有免费游戏结算面板 如果有等结算面板关闭才显示
        _playSoundIndex: 0,
        _playSound: false,
        _delayTime: 0,
        _autoClose: true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_STOP_MOVE, this.stopMove, this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_GAME_START, this.recvGameStart, this);
        Global.registerEvent(cc.vv.gameData._EventId.CLEAR_DESK, this.clearDesk, this);
        Global.registerEvent(cc.vv.gameData._EventId.HIDE_BIG_WIN, this.hideBigWin, this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_DELAY_PLAY_WIN_EFFECT, this.recvDelayPlayWinEffect, this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_DELAY_PLAY_BIGWIN_EFFECT, this.recvDelayPlayWinEffect, this);
        Global.registerEvent(cc.vv.gameData._EventId.CALL_BIGWIN_EFFECT, this.callPlayBigWinEffect, this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_CLOSE_FREE_BALANCE, this.onRecvCloseFreeBalance, this);
        // cc.vv.NetManager.registerMsg(MsgId.SLOT_EXIT_SUBGAME, this.onRcvExitSubGame, this);
        //
        // if(cc.vv.SlotGameCfg[cc.vv.gameData._gameId]){
        //     let cfg = require(cc.vv.SlotGameCfg[cc.vv.gameData._gameId].cfgCmp);
        //     if (cfg.mult) this._mult = cfg.mult;
        // }
        
        if(cc.vv.gameData.addBtnSoundToDebarList){
            cc.vv.gameData.addBtnSoundToDebarList("bigwin");
            cc.vv.gameData.addBtnSoundToDebarList("bwin3");
            cc.vv.gameData.addBtnSoundToDebarList("bwinefx");
    
            cc.vv.gameData.addBtnSoundToDebarList("emotion_sound_big_win");
            cc.vv.gameData.addBtnSoundToDebarList("emotion_sound_huge_win");
            cc.vv.gameData.addBtnSoundToDebarList("tnt_react");
    
        }
        StatisticsMgr.reqReport(StatisticsMgr.REQ_BIGWIN_POP)
    },

    // onRcvExitSubGame(msg) {
    //     if (msg.code === 200) {
    //         if (msg.spEffect && msg.spEffect.kind > 0) {
    //             this._spEffect = msg.spEffect.kind;
    //             this._winNum = msg.spEffect.wincoin;
    //             this._winNum *= this._mult;
    //             this._isShow = true;
    //             this.playEffect();
    //             this._isShow = false;
    //         }
    //     }
    // },

    onRecvCloseFreeBalance() {
        this._isWaitCloseFreeBalance = false;
        if (this._isShow) {
            this.playEffect();
            this._isShow = false;
        }
    },

    recvDelayPlayWinEffect(data) {
        this._isDelay = data.detail;

        if (!this._isDelay && this._isShow && !this._isWaitCloseFreeBalance) {
            this.playEffect();
            this._isShow = false;
        }
    },

    stopMove() {
        let self = this
        this._isShow = true;
        if (!this._isDelay && !this._isWaitCloseFreeBalance) {
        
            self.playEffect(0.5);
            self._isShow = false;
           
        }
    },


    //0 无 1 ：20倍 2:40倍 3：60倍 4：80倍 5 100倍
    initAction() {
        if(this.isInit) return;
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_PAUSE_AUTO)
        cc.loader.loadRes("slots_common/SlotRes/bigwin/prefab_bigwin", cc.Prefab, this.loadPrefabFinish.bind(this));
        this.isInit = true;
    },

    //加载
    loadPrefabFinish:function(err,prefab){
        let self = this
        if (err === null) {
            let old = this.node.getChildByName("BigWinNode")
            if(old) return //已经在显示了，就不显示多个了

            
            this._doingHideBigwin = null

            let index = this._spEffect > 5 ? 5 : this._spEffect;
            let nameSpin = ['bigwin','hugewin','Massivewin','Apocslypticwin','Apocslypticwin']
            let nameEff = ['win_bigwin_HD','win_hugewin_HD','win_massivewin_HD','win_apocalypticwin_HD','win_apocalypticwin_HD']
            this._soundEffName = nameEff[index-1]
            if(!this._soundEffName){
                //没有对应的bigwin
                console.log('===not found bigwin:'+index)
                return
            }
            
            //播放bigwin的背景音乐
            self.playEffStartCall();

            this._bigWinNode = cc.instantiate(prefab);
            Global.FixDesignScale_V(this._bigWinNode)
            this._bigWinNode.name = "BigWinNode";         
            this._bigWinNode.parent = this.node;
 
            let _urlSpin = 'slots_common/SlotRes/bigwin/'+nameSpin[index-1]
            let EffSpine = cc.find('ui/node_spin',this._bigWinNode).getComponent(sp.Skeleton)
            cc.loader.loadRes(_urlSpin,sp.SkeletonData,function(err,skeletonData){
                if(cc.isValid(self._bigWinNode) && cc.isValid(EffSpine)){
                    EffSpine.skeletonData = skeletonData;
                    EffSpine.setAnimation(0,"Animation1",false);
                    EffSpine.addAnimation(0,"Animation2",true)
                    self.showDropCoins()
                    self.processStage = 'startShow'
    
                    //开始显示金币数量
                    let delayCall = function(){
                        // //播放对应win声音
                        // self._playEffect(self._soundEffName)
                        
                        self.showCoins()
                    }
    
                    EffSpine.scheduleOnce(delayCall,0.3)
                }
                
            })

            cc.tween(this._bigWinNode)
            .delay(0.5)
            // .call(()=>{
            //     self.showCoins()
            // })
            .delay(0.2)
            .call(()=>{
                //播放对应win声音
                self._playEffect(self._soundEffName)
            })
            .start()
            // EffSpine.setEndListener(this._aniEndCall)
            EffSpine.setCompleteListener(this._aniCompCall.bind(this))

            //背景光圈
            
            cc.loader.loadRes('slots_common/SlotRes/bigwin/reward_g_01',sp.SkeletonData,function(err,bgskeletonData){
                if(cc.isValid(self._bigWinNode)){
                    let bgSpineNode = self._bigWinNode.getChildByName('node_spin_bg')
                    if(cc.isValid(bgSpineNode)){
                        let bgSpine = bgSpineNode.getComponent(sp.Skeleton)
                        bgSpine.skeletonData = bgskeletonData;
                        bgSpine.setAnimation(0,"animation1",false);
                        bgSpine.addAnimation(1,"animation2",true)
                    }
                }
                
                
            })

        }
        this.isInit = false;
    },

    //显示掉落金币的效果
    showDropCoins:function(){
        let bgParticle = cc.find('ui/bgParticle',this._bigWinNode)
        if(bgParticle){
            bgParticle.getComponent(cc.ParticleSystem).resetSystem()
        }
        let dropnode = cc.find('ui/node_coin',this._bigWinNode)
        if(dropnode){
            let script = dropnode.getComponent('DropCoins')
            script.setPlay()
        }
    },

    playEffStartCall:function(){
        let self = this
        this._autoClose = true
        
        let endCall = function(){
            if (self._autoClose) {
                self.hideBigWin()
            }
        }
        //降低音量
        Global.ChangeBgmVol(0.3)
        this._playEffect('common_win3_HD',endCall)
        // cc.vv.AudioManager.playEff(soundPath,'common_win3_HD',true,false,endCall)
    },

    //显示金币
    showCoins:function(){
        if (!this._bigWinNode) return;

        Global.btnClickEvent(cc.find('New Layout',this._bigWinNode), this.onBtnSkip, this);
        
        this.showCoinsRoll(0, this._winNum)

        let double_coins = cc.find("ui/double_coins",this._bigWinNode)
        double_coins.getComponent("DoubleWinCoins").show(this._winNum, this)

		this.isInit = false;
    },

    showCoinsRoll(startCoin, endCoin) {
        let self = this
        this.processStage = 'roallbegin'
        let sp_coin = cc.find('ui/spr_coin_bg',this._bigWinNode);
        sp_coin.active = true;
        let lbl_coin = sp_coin.getChildByName('lbl_coin');
        let finishCall = function(){
            self.processStage = 'roallfinish'
            self._playEffect('common_win3end_HD')
        }
        let perCall = function(){
            sp_coin.scale += 0.003
        }
        Global.doRoallNumEff(lbl_coin,startCoin,endCoin,2.5,finishCall,perCall,2,true);
    },

    showDoubleCoin() {
        this.showCoinsRoll(this._winNum, this._winNum*2)
    },

    hideBigWin:function(){
        let self = this
        if(this._bigWinNode){
            if(this._doingHideBigwin){
                cc.log("BigWin已经在关闭了！")
                return
            }
            this._doingHideBigwin = true
            //恢复音量
            Global.ChangeBgmVol(1)

            let actionEndCall = function(){
                self._doingHideBigwin = null

                if(self.bigWinPlayEndCall){
                    self.bigWinPlayEndCall()
                }
                self.bigWinPlayEndCall = null
    
                if(!self.callType){
                    Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_SHOW_OPEARATE);
                    Global.dispatchEvent(cc.vv.gameData._EventId.CLICK_HIDE_BIG_WIN);
                    Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_RESUME_AUTO);
                    
                }
                self.callType = null
                self.clearDesk();
                self._bigWinNode.destroy()
                
                self._bigWinNode = null
            }

            // //bigwin消失动画
            // let disNode = ['bgParticle','node_coin','node_spin_bg','node_spin']
            // for(let i = 0; i < disNode.length; i++){
            //     let nodeSpin = cc.find('ui/'+disNode[i],this._bigWinNode)
            //     cc.tween(nodeSpin)
            //     .to(0.1,{scale:1.1})
            //     .to(0.3,{scale:0})
            //     .start()
            // }
            

            // let coinBg = cc.find("ui/spr_coin_bg",this._bigWinNode)
            // let oldScale = coinBg.scale
            // cc.tween(coinBg)
            // .to(0.3,{scale:oldScale+0.1})
            // .to(0.35,{scale:0})
            // .call(()=>{
            //     actionEndCall()
            // })
            // .start()

            let double_coins = cc.find("ui/double_coins",this._bigWinNode)
            double_coins.getComponent("DoubleWinCoins").hide()
            let nodeUI = cc.find('ui',this._bigWinNode)
            cc.tween(nodeUI)
            .to(0.15,{scale:nodeUI.scale+0.1},{easing:'backOut'})
            .to(0.35,{scale:0})
            .call(()=>{
                actionEndCall()
            })
            .start()
        }
    },

    clearDesk:function(){
        this.stopAudio();
    },

    _aniCompCall:function(state,data){
        let self = this
        let ani = state.animation.name
        if(ani == 'animatino1'){

        }
        else if(ani == 'animation2'){

        }
    },

    stopAudio() {
        if (this._audioId > -1) {
            cc.vv.AudioManager.stopAudio(this._audioId);
            this._audioId = -1;
        }
        this._playSoundIndex = -1;
        this._playSound = false;
    },


    recvGameStart(data) {
        data = data.detail;
        this.clearDesk();
        this.hideBigWin();

        if (data && data.spEffect) {
            this._spEffect = data.spEffect.kind;
            this._winNum = data.spEffect.wincoin;
        }
        this._winNum *= this._mult;
        this._isWaitCloseFreeBalance = (data.freeCnt === 0 && data.allFreeCnt > 0 && this.getComponent("SlotMachine_FreeBalance"));
    },

    playEffect(nDelay) {
        let self = this
        //测试使用
        /* this._spEffect = 5;
        this._isShow = true;
        this._winNum = 10100;*/

        // if (Global.appId === Global.APPID.BigBang) {
        //     this.playBigWinEffect();
        // }
        // else {
            if (this._spEffect > 0 && this._isShow) {
                let delayCall = function(){
                    self._playSoundIndex = 0;
                    self.playBigWinSound();
                    self.initAction();
                }
                if(nDelay){
                    //需要延迟。主要是在stopmove的时候中大奖，需要延迟让玩家看清楚
                    self.scheduleOnce(delayCall,nDelay)
                }else{
                    delayCall()
                }
                
            }
        // }
    },

    playBigWinSound:function(){
        //不播放默认的音效
    },

    // 其它模块调用显示bigwin，如奖金熊的小游戏退出后显示一下
    // 参数 = {spEffect:0或 1或2, winNum: xxx}
    callPlayBigWinEffect(data) {
        // cc.warn(data.detail);
        let params = data.detail;
        this._spEffect = params.spEffect;
        if (this._spEffect > 0) {
            this._winNum = params.winNum;
            this._isShow = true;

            this.playEffect();
            this._isShow = false;
        }
    },

    //点击跳过
    onBtnSkip:function(){
        let self = this
        if(this.processStage == 'roallbegin'){
            //停止滚动
            let sp_coin = cc.find('ui/spr_coin_bg',this._bigWinNode);
            let lbl_coin = sp_coin.getChildByName('lbl_coin');
            lbl_coin.stopAllActions()
            lbl_coin.getComponent(cc.Label).string = Global.FormatNumToComma(this._winNum)
            
            let delayCall = function(){
                self.processStage = 'roallfinish'
            }
            this.scheduleOnce(delayCall,0.5)
        }
        else if(this.processStage == 'roallfinish'){
            //关闭
            cc.vv.AudioManager.stopEffectByName('common_win3_HD')
            
            this.hideBigWin()
        }
        StatisticsMgr.reqReport(StatisticsMgr.REQ_BIGWIN_CLOSE)
    },

    //直接调用显示
    //0 无 1 ：20倍 2:40倍 3：60倍 4：80倍 5 100倍
    ShowBigWin:function(nType,nCoin,endCall){
        this._spEffect = nType
        this._winNum = nCoin
        this.bigWinPlayEndCall = endCall
        this.callType = 1
        if(this.isInit) return;
        cc.loader.loadRes("slots_common/SlotRes/bigwin/prefab_bigwin", cc.Prefab, this.loadPrefabFinish.bind(this));
        this.isInit = true;
    },

    _playEffect:function(fileName,endCall){
        let soundPath = "slots_common/SlotRes/bigwin/";
        cc.vv.AudioManager.playEff(soundPath,fileName,true,false,endCall);
    },

    //设置是否自动关闭窗口
    setAutoClose(val) {
        this._autoClose = val
    },

    onDestroy() {
        // cc.vv.NetManager.unregisterMsg(MsgId.SLOT_EXIT_SUBGAME, this.onRcvExitSubGame, false, this);
      
    },

    update(dt) {
        if (this._playSound) {
            if (this._playSoundIndex < 2) this.playBigWinSound();
            else {
                this._delayTime += dt;
                if (this._delayTime >= 4) {
                    this._playSoundIndex = 0;
                    this.playBigWinSound();
                }
            }
        }
    },
});
