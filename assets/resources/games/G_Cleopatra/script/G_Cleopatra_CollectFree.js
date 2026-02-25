
   //##########################收集免费游戏##################################
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this._collectOverUI = cc.find('safe_node/freeGameUI/collectGameUI',this.node);
        this._collectUI = cc.find('safe_node/collectUI',this.node);
        this._collectbgspine = cc.find('safe_node/spine_character',this.node);
        this._collectspine = cc.find('safe_node/node_energy/collectcoin',this.node);
        this._energyUI = cc.find('safe_node/node_energy',this.node);

        let btncollect = cc.find('uinode/btn_collect',this._collectOverUI);
        Global.btnClickEvent(btncollect,this.onCollectEvent,this)

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_PLAY_LINE_FINISH, this.playLineOver,this);
    },

    onEnable(){
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    onDisable(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this); 
    },
    
    start(){
        this.reConnectCollectFree();
    },

    //断线重连进入
    reConnectCollectFree(){
        this._collectFree = cc.vv.gameData.getCollectFree();
        if(this._collectFree&&!this._collectFree.state)
            return;

        Global.SlotsSoundMgr.playBgm('superfg_bgm');
        this.showUI(true);
        this.updateTitle(this._collectFree.recv,cc.vv.gameData.GetTotalFree());
        cc.vv.gameData.GetBottomScript().CanDoNextRound();
    },

    //接收51消息返回
    onRcvSubGameAction:function(msg){
        if(msg.code == 200){
            this._subGameData = msg.data;
            if(this._subGameData.rtype == 5){
                AppLog.log("进入收集免费游戏");
                this.updateTitle(this._subGameData.recv,this._subGameData.freeCnt);
                this._totalFreeTimes = this._subGameData.freeCnt;
                cc.vv.gameData.GetSlotsScript().Backup();
                this.startCollectFreeGame();
                //显示平均下注金额
                // cc.log("---1this._collectFree",this._collectFree)
                let startPrize = cc.vv.gameData.getCollectFreeGameStartPrize()
                if(startPrize){
                    cc.find("Canvas/safe_node/LMSlots_Bottom/totalBetBg").active = false
                }
            }
        }
    },

    startCollectFreeGame(){
        this.playPyramidSpine(()=>{
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("idle");
            Global.SlotsSoundMgr.playBgm('superfg_bgm');
            cc.vv.gameData.clearLastWinCoin();
            this.showUI(true);
            this.sendSpin();
        });
    },

    //显示界面
    showUI(isshow){
        this._collectUI.active = isshow;
        this._energyUI.active = !isshow;
        this._collectspine.active = !isshow;
        if(isshow){
            this.playCollectbgAni('skill');
        }else{
            this.playCollectbgAni('idle');
        }
        //改变背景图片
        if(isshow){
            this.showJackpotUI(false);
            cc.vv.gameData.GetGameLogic().changeGameBg(4);
        }else{
            this.showJackpotUI(true);
            cc.vv.gameData.GetGameLogic().changeGameBg(5);
        }
    },

    //能量免费隐藏奖池
    showJackpotUI(isshow){
        cc.find('safe_node/LMSlots_PrizePool',this.node).active = isshow;
        
    },

    //开始旋转
    sendSpin(){
        //更新免费次数
        cc.vv.gameData.SetFreeTime(this._totalFreeTimes-1)
        cc.vv.gameData.GetBottomScript().ShowFreeModel(true,1,this._totalFreeTimes)
        cc.vv.gameData.GetBottomScript().SendSpinReq();
    },

    //播放金字塔spin
    playPyramidSpine(callback){
        Global.playHSEffect('transition1');
        let freestartspine = cc.find('safe_node/screenspine/collectstartspine',this.node);
        freestartspine.active = true;
        cc.vv.gameData.playSpine(freestartspine,'animation',false,()=>{
            freestartspine.active = false;
            if(callback){
                callback();
            }
        });
    },

    //播放线结束
    playLineOver(){
        this._collectFree = cc.vv.gameData.getCollectFree();
        if(this._collectFree&&this._collectFree.state){
            let restFree = cc.vv.gameData.GetFreeTime();
            if(restFree == 0){
                this.showCollectOverUI();
            }
        }
    },

    //显示结算界面
    showCollectOverUI(){
        cc.vv.gameData._collectFreeState = false;
        //显示收集的金币数量
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        Global.playHSEffect('dialog_sfg_collect');
        this._collectOverUI.active = true;
        let node = cc.find('uinode',this._collectOverUI);
        Global.showAlertAction(node,true,0.1,1,()=>{
            let wincoin = cc.vv.gameData.GetFreeWinCoin();
            let coinnode = cc.find('uinode/framebg/coinnum',this._collectOverUI);
            Global.doRoallNumEff(coinnode,0,wincoin,1.5,null,null,2,true);

            let btncollect = cc.find('uinode/btn_collect',this._collectOverUI);
            cc.vv.gameData.checkAutoPlay(btncollect,this.onCollectEvent.bind(this));
        })
    },

    //收集事件
    onCollectEvent(){
        Global.playHSEffect('btn_click');
        cc.find('uinode/btn_collect',this._collectOverUI).stopAllActions();
        let node = cc.find('uinode',this._collectOverUI);
        Global.showAlertAction(node,false,0.1,1,()=>{
            Global.SlotsSoundMgr.stopBgm();
            this._collectOverUI.active = false;
            this.playPyramidSpine(()=>{
                this.showUI(false);
                //cc.vv.gameData.GetSlotsScript().Resume();
                cc.vv.gameData.GetSlotsScript().clearWildShow();
                cc.vv.gameData.GetSlotsScript().clearData();
                cc.vv.gameData.GetBottomScript().ShowFreeModel(false);
                let wincoin = cc.vv.gameData.GetFreeWinCoin();
                cc.vv.gameData.GetSlotsScript().ShowBottomWin(wincoin,wincoin,true,()=>{
                    cc.vv.gameData.GetTopScript().SetBackLobby(true);
                    cc.vv.gameData.GetBottomScript().CanDoNextRound();
                });
                // cc.log("---1收集游戏结束")
                cc.find("Canvas/safe_node/LMSlots_Bottom/totalBetBg").active = true
                cc.vv.gameData.GetBottomScript().ShowBetCoin()
           })
        })
    },

    //更新收集界面titile显示
    updateTitle(recv,freecnt){
        let line = cc.find('title/titleline', this._collectUI);
        let singletitle = cc.find('title/items/singletitle', this._collectUI);
        let singletitle1 = cc.find('title/items/singletitle1', this._collectUI);
        let singletitle2 = cc.find('title/items/singletitle2', this._collectUI);
        let singletitle4 = cc.find('title/items/singletitle4', this._collectUI);
        let singletitle5 = cc.find('title/items/singletitle5', this._collectUI);

        singletitle.active = false;
        singletitle1.active = false;
        singletitle2.active = false;
        singletitle4.active = false;
        singletitle5.active = false;
        if(recv.other.length < 2){
            //单个
            line.active = false;
            if(recv.other.length == 1){
                this.showTitlebytype(recv.other[0].type,recv.other[0].idx,singletitle,singletitle2,singletitle4,singletitle5);
            }else{
                singletitle1.active = true;
                singletitle1.getChildByName('mult').getComponent(cc.Label).string = freecnt;
            }
        }else{
            line.active = true;
            recv.other.forEach(element => {
                this.showTitlebytype(element.type,element.idx,singletitle,singletitle2,singletitle4,singletitle5);
            });
            
        }
    },

    //通过类型显示title
    showTitlebytype(type,idx,singletitle,singletitle2,singletitle4,singletitle5){
        //服务器idx从1开始
        let pos = idx -1;
        let singleCfg = cc.vv.gameData.getGameCfg().SINGLE;
        if(type == 1||type==3){
            let atlas = cc.vv.gameData.GetAtlasByName("mapfree")
            let spname = this.getSpriteName(type);
            singletitle.active = true;
            singletitle.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(spname)
        }else if(type == 2){
            singletitle2.active = true;
            singletitle2.getChildByName('mult').getComponent(cc.Label).string = singleCfg.S2.value[pos];
        }else if(type == 4){
            //10 J Q K A显示
            singletitle4.active = true;
            let len = singleCfg.S4.symbolid[pos].length;
            for(let i=0;i<5;i++){
                if(i<len){
                    cc.find('symbols/symbol'+i,singletitle4).active = true;
                }else{
                    cc.find('symbols/symbol'+i,singletitle4).active = false;
                }
            }
        }else if(type == 5){
            singletitle5.active = true;
        }
    },

    //通过类型返回spritename
    getSpriteName(type){
        switch (type) {
            case 1:return 'theme186_mapfree_2';
            case 2:return 'theme186_mapfree_3';
            case 3:return 'theme186_mapfree_4';
            case 4:return 'theme186_mapfree_5';
            case 5:return 'theme186_mapfree_6';
        }
    },

    //播放收集背景spine动画
    playCollectbgAni(aniname){
        cc.vv.gameData.playSpine(this._collectbgspine,aniname,true);
    },
});
