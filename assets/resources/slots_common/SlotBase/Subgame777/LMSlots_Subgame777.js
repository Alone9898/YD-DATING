/**
 * 777小游戏
 */

let Game777Cfg={
    [1]:{normal:'theme160_s_104',win_node:'s104'}, //2x
    [2]:{normal:'theme160_s_103',win_node:'s103'}, //3x
    [3]:{normal:'theme160_s_102',win_node:'s102'}, //5x
    [4]:{normal:'theme160_s_105',win_node:'s105'}, //红7
    [5]:{normal:'theme160_s_106',win_node:'s106'}, //蓝7
    [6]:{normal:'theme160_s_107',win_node:'s107'}, //3bar
    [7]:{normal:'theme160_s_108',win_node:'s108'}, //2bar
    [8]:{normal:'theme160_s_109',win_node:'s109'}, //bar
}

let Game777Mul = {
    [1]: 3117,  //任意*X同类型元素,
    [2]: 25,    //3个红7 
    [3]: 9,     //3个蓝7
    [4]: 7.5,    //任意3个7，
    [5]: 9.4,   //3个3bar
    [6]: 7.5,   //2个2bar
    [7]: 5,     //3个1bar
    [8]: 2.5,   //任意3个bar

}

cc.Class({
    extends: require("LMSlots_PauseUI_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btnstart = cc.find('node_pop_ui/node_start/btn_start',this.node)
        Global.btnClickEvent(btnstart,function(){
            btnstart.stopAllActions();
            this.onClickStart();
        } ,this)
        let btnend = cc.find('node_pop_ui/node_end/btn_collect',this.node)
        Global.btnClickEvent(btnend,function() {
            btnend.stopAllActions();
            this.onClickCollect();
        },this)

        this._pop_win = cc.find('node_pop_ui',this.node)
        this._pop_win.active = false

        this.showInitReel()
        
        Global.registerEvent(cc.vv.gameData._EventId.REEL_STOP,this.recvReelStop,this);
        
        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;
    },

    onEnable(){
        
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
        
    },

    onDisable(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this); 
    },

    start () {

    },

    // 断网重连
    ReconnectNet:function(avgBet){
        if(this._subGameData){  // 收到了数据，不处理

        } else {
            this.showEnter(avgBet)
        }
    },

    //avgBet:收集游戏的平均押注，44协议服务端会下发的
    //用来显示中奖估算额度
    showEnter:function(avgBet){
        this.node.active = true
        this._bSendReq = false
        this._subGameData = null
        let bottomScp = cc.vv.gameData.GetBottomScript()
        if(bottomScp){
            bottomScp.ShowBtnsByState("moveing_1")
        }
        
        if(this._pop_win.active)
            return;
        this._pop_win.active = true
        let node_start = cc.find('node_start',this._pop_win)
        let node_end = cc.find('node_end',this._pop_win)
        node_end.active = false
        node_start.active = true
        this._startRound = 0;
        this.hideAllSubNode();
        this._showPopWinAction(this._pop_win)
        // this.scheduleOnce(()=>{
        //     this._showPopWinAction(this._pop_win)
        // },0.02);

        this.ShowAvgReward(avgBet)
        cc.vv.gameData.checkAutoPlay(node_start,this.onClickStart.bind(this));
    },

    showEnd:function(){
        let node_start = cc.find('node_start',this._pop_win)
        let node_end = cc.find('node_end',this._pop_win)
        node_end.active = true
        node_start.active = false
        //设置金币
        let coin = this._subGameData.wincoin
        let lbl_coin = cc.find('lbl_win',node_end)
        Global.doRoallNumEff(lbl_coin,0,coin,1.5,null,null,0,true)
        this._showPopWinAction(this._pop_win)
        cc.vv.gameData.checkAutoPlay(node_end,this.onClickCollect.bind(this));
            
    },

    //显示中奖期望
    ShowAvgReward:function(avgBet){
        if(!avgBet)avgBet = 0
        for(let i = 1 ; i <= 8; i++){
            let lblM = cc.find('spr_machine/node_mult/M'+i,this.node)
            if(lblM){
                lblM.getComponent(cc.Label).string = Global.formatNumShort(Game777Mul[i] * avgBet,1)
            }
        }
    },

    hidePopWin:function(){
        let self = this
        Global.showAlertAction(self._pop_win,false,1,0.1,()=>{
            self._pop_win.active = false
        })
    },

    //开始游戏
    onClickStart:function(){
        if(this._bSendReq){
            return
        }
        this._bSendReq = true
        let req = {c: MsgId.SLOT_SUBGAME_DATA};
        req.data = {}
        req.data.rtype = 1
        req.gameid = cc.vv.gameData.getGameId()
        cc.vv.NetManager.send(req,true);

        // //test
        // let msg = {"data":{"rtype":1,"wincoin":3211525,"cardsList":[[3,3,4],[4,4,4],[3,3,3]]},"uid":1728,"c":51,"code":200}
        // this.onRcvSubGameAction(msg)
        
        this.hidePopWin()
        Global.SlotsSoundMgr.playCommonEff('common_click');
    },

    onClickCollect:function(){
        let lbl_coin = cc.find('node_pop_ui/node_end/lbl_win',this.node)
        if(lbl_coin.getNumberOfRunningActions()>0){
            lbl_coin.stopAllActions()
            lbl_coin.getComponent(cc.Label).string = Global.FormatNumToComma(this._subGameData.wincoin)
            return
        }
        //刷新金币
        Global.SlotsSoundMgr.playCommonEff('common_click');
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_ENERGYGAME_OperationOVER,{isshow:false,etype:0});
        this._pop_win.active = false;
        

        this.showTranse()
    },

    //如果有转场动画，可以重写此函数，然后再转场完调用subwin
    showTranse(){
        //TODO transelation
        this.subWin()
    },

    //子游戏赢钱
    subWin(){
        this.node.active = false
        
        let coin = this._subGameData.wincoin
        cc.vv.gameData.AddCoin(coin)
        let totalWin = cc.vv.gameData.GetBottomScript().getCurrentWin() || 0
        totalWin += coin
        cc.vv.gameData.GetSlotsScript().ShowBottomWin(coin,totalWin,true,function () {
            cc.vv.gameData.GetSlotsScript().CanDoNextRound();
        })
    },

    onRcvSubGameAction:function(msg){
        AppLog.log("接收游戏动作数据");

        if(msg.code == 200){
            this._subGameData = msg.data
            //延时一秒开始
            this.scheduleOnce(()=>{
                this.startMoveReel()
            },1)

        }
    },

    showInitReel:function(){
        for(let i= 0; i < 3; i++){
            let reel = cc.find('spr_machine/node_content/reel'+(i+1),this.node)
            reel.getComponent('LMSlots_Subgame777_reel').createItems(Game777Cfg)
        }
    },

    startMoveReel:function(){
        this._stopReelNum = 0
        if(this._subGameData){
            for(let i= 0; i < 3; i++){
                let reelResult = [0,0,0]
                let roudData = this._subGameData.cardsList[this._startRound]
                reelResult[1] = roudData[i]
                let reel = cc.find('spr_machine/node_content/reel'+(i+1),this.node)
                reel.getComponent('LMSlots_Subgame777_reel').startMove(reelResult)
            }
        }
        Global.SlotsSoundMgr.playCommonEff('slot_spin');
        //显示一个stop按钮
        this.showBottomStop(true)
    },

    showBottomStop:function(){
        let stop = cc.vv.gameData.GetBottomScript().getStopBtnObj()
        let stop777 = cc.instantiate(stop)
        stop777.active = true
        stop777.getComponent(cc.Button).interactable = true
        this._stop77Btn = stop777
        stop777.parent = stop.parent
        stop777.on('click',this.stop777Call,this)
    },

    stop777Call:function(){
        this._stop77Btn.destroy()
        for(let i= 0; i < 3; i++){
            let reel = cc.find('spr_machine/node_content/reel'+(i+1),this.node)
            reel.getComponent('LMSlots_Subgame777_reel').stopMove()
        }
    },

    _showPopWinAction:function(node,endCall){
        node.active = true
        Global.showAlertAction(node,true,0.01,1,endCall)
        
        Global.SlotsSoundMgr.playCommonEff('slot_popup');
    },

    recvReelStop:function(){
        let self = this
        this._stopReelNum += 1 
        if(this._stopReelNum == 3){
            if(this._stop77Btn){
                this._stop77Btn.destroy()
            }
            

            //看是否是最终的结果
            let next = this._subGameData.cardsList[this._startRound]
            this._startRound += 1
            if(this._startRound < this._subGameData.cardsList.length){
                //还可以转
                let delaycall = function(){
                    self.startMoveReel()
                }
                this.scheduleOnce(delaycall,1)
            }else{
                //展示结果
                Global.SlotsSoundMgr.stopEffectByName('slot_spin');
                
                Global.SlotsSoundMgr.playCommonEff('slot_win');

                this.showResultAnimation(next);
                this.scheduleOnce(()=>{
                    this.showEnd()
                },3);
            }
        }
    },

    //显示结果的spine动画
    showResultAnimation(cardlist){
        this.ShowResultNode(true)
        for(let i= 0; i < cardlist.length; i++){
            let sname = this.getSpineAnimationName(cardlist[i]);
            let symbol = cc.find('spr_machine/node_content/winmask/Sp_Game777_Symbol'+i+'/'+sname,this.node)
            symbol.active = true;
            symbol.getComponent(sp.Skeleton).setAnimation(0,'animation',true);

            cc.tween(symbol).repeat(10,cc.sequence(cc.fadeIn(0.1),cc.delayTime(0.2),cc.fadeOut(0.1),cc.delayTime(0.2))).start();
        }
    },

    ShowResultNode(bShow){
        let winNode = cc.find('spr_machine/node_content/winmask',this.node)
        winNode.active = bShow
    },

        
     //结果显示spine
     getSpineAnimationName(id){
        let cfg = Game777Cfg;
        for(let i in cfg ){
            let item = cfg[i]
            if(i == id){
                return item.win_node;
            }
        }
    },

    //隐藏所有子symbol
    hideAllSubNode(){
        this.ShowResultNode(false)
        for(let i= 0; i < 3; i++){
            let symbolnode = cc.find('spr_machine/node_content/winmask/Sp_Game777_Symbol'+i,this.node)
            let children = symbolnode.children;
            for(let j=0;j<children.length;j++){
                children[j].active = false;
            }
        }
    }
    // update (dt) {},
});
