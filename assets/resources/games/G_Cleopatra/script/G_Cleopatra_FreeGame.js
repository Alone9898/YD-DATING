
// 处理普通免费游戏/奖金游戏
cc.Class({
    extends: cc.Component,

    properties: {
        _freeGameType:0,//type 1spine(蓝) 2 prizes(绿) 3 win(红) 4 wilds(紫)
    },

    onLoad () {
        this._totalFreeTimes = 7;

        this._rewardGameRollUI = cc.find('safe_node/rewardsGameRollUI',this.node);
        this._freeGameRollUI = cc.find('safe_node/freeGameRollUI',this.node);
        this._freeGameUI = cc.find('safe_node/freeGameUI',this.node);
        this._pyramidNumNode = cc.find('bg_collectcoin/lbl_collectcoin',this._freeGameUI);
        let rewardstartnode = cc.find('startspine',this._rewardGameRollUI);
        Global.btnClickEvent(rewardstartnode,this.onStartBonusFreeGameEvent,this)

        let startnode = cc.find('startspine',this._freeGameRollUI);
        Global.btnClickEvent(startnode,this.onStartFreeGameEvent,this)

        let collectnode = cc.find('gameEndUI/btn_collect',this._freeGameUI);
        Global.btnClickEvent(collectnode,this.onCollectEvent,this)

        let startgamenode2 = cc.find('pressStartUI_2/btn_start',this._freeGameUI);
        Global.btnClickEvent(startgamenode2,this.onStartFreeGame24,this)

        let startgamenode4 = cc.find('pressStartUI_4/btn_start',this._freeGameUI);
        Global.btnClickEvent(startgamenode4,this.onStartFreeGame24,this)

        let collectreward = cc.find('rewardCollectUI/btn_collect',this._freeGameUI);
        Global.btnClickEvent(collectreward,this.onRewardCollectEvent,this);

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_PLAY_LINE_FINISH, this.playLineOver,this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_REFUSH_ENERGY, this.updateEnergy,this);
    },

    onEnable(){
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    onDisable(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this); 
    },

    //断线重连进入免费游戏
    reConnectEnterFreeGame(){
        let deskdata = cc.vv.gameData.getDeskInfo();
        this._subGameData = deskdata.freeGameData;
        this._freeGameType = this._subGameData.rtype;
        if(deskdata.select&&deskdata.select.state){
            if(deskdata.select.rtype == 1){
                cc.vv.gameData.GetFreeGameScript().EnterFreeGame(1);
            }else{
                //如果需要选择
                if(deskdata.select.rtype !=4){
                    //显示免费游戏操作
                    let choicemult = cc.find('choicemultiplier',this._freeGameUI);
                    choicemult.active = true;
                    let freeinfo = this._subGameData.triFreeData.freeInfo;
                    choicemult.getComponent('G_Cleopatra_ChoicMultiplier').init(freeinfo);
                }
                //显示免费界面
                this.enterFreeGameBytype(this._freeGameType);
                //配置界面数据
                this.reConnectShowUIDate();
            }
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        }else{
            if(cc.vv.gameData.getCollectFree().state){
                cc.vv.gameData.GetCollectFreeScript().reConnectCollectFree();
                return;
            }
            //显示免费界面
            this.enterFreeGameBytype(this._freeGameType);
            //配置界面数据
            this.reConnectShowUIDate();
        }
    },

    //断线重连进入奖金游戏
    reConnectEnterRewardGame(){
        //显示奖金游戏
        this.lockJackpot();
        this.setJackPotSize(true);
        this._rewardGameRollUI.active = true;
        let startnode = cc.find('startspine',this._rewardGameRollUI);
        cc.vv.gameData.playSpine(startnode,'animation1',false,null);
        cc.vv.gameData.checkAutoPlay(startnode,this.onStartBonusFreeGameEvent.bind(this))
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
    },

    //断线重连显示界面数据
    reConnectShowUIDate(){
        Global.SlotsSoundMgr.playBgm('free_bgm');
        let atlas = cc.vv.gameData.GetAtlasByName("free")
        let index = 1;
        this._subGameData.boxs.forEach(val => {
            if(index <= this._subGameData.allFreeCount-this._subGameData.restFreeCount){
                this.setItemGray(index,true);
            }
            var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,index)
            let item = cc.find(path,this._freeGameUI);
            if(this._freeGameType == 1||this._freeGameType == 3){
                item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('theme186_free_text_muti_'+val);
            }else if(this._freeGameType == 2){
                item.getComponent(cc.Label).string = Global.convertNumToShort(val);
            }
            index++;
        });
        cc.vv.gameData.GetBottomScript().CanDoNextRound();
    },

    //进入类型1的免费游戏 rtype表示操作类型
    EnterFreeGame(rtype){
        AppLog.log("##freeGameType:"+rtype);
        if(rtype == 4){
            this.playRenwuRewardAni(()=>{
                this.playSanjinbiSpine(()=>{
                    this.lockJackpot();
                    cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
                    this.setJackPotSize(true);
                    this._rewardGameRollUI.active = true;
                    let startnode = cc.find('startspine',this._rewardGameRollUI);
                    cc.vv.gameData.playSpine(startnode,'animation1',true,null);
                    cc.vv.gameData.checkAutoPlay(startnode,this.onStartBonusFreeGameEvent.bind(this))
                })
            })
        }else if(rtype == 1){
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
            this.setJackPotSize(true);
            this._freeGameRollUI.active = true;
            this.playStartClickSpine();
        }
    },
    
    //播放进入奖金游戏人物动作(进入金币游戏时)
    async playRenwuRewardAni(callback){
        let renwunode = cc.find('safe_node/spine_character',this.node);
        cc.vv.gameData.playSpine(renwunode,'skill1',false,()=>{
            cc.vv.gameData.playSpine(renwunode,'idle',true);
        });

        await cc.vv.gameData.awaitTime(2);
        if(callback){
            callback();
        }
    },

    //普通免费游戏点击开始
    onStartFreeGameEvent(){
        Global.playHSEffect('press');
        let startnode = cc.find('startspine',this._freeGameRollUI);
        startnode.stopAllActions()
        startnode.getComponent(cc.Button).interactable = false;
        this.sendEnterFreeeGame(1);
        cc.vv.gameData.playSpine(startnode,'animation2',false,()=>{
            startnode.active = false;
            startnode.getComponent(cc.Button).interactable = true;
        });
    },

    //奖励游戏点击开始
    onStartBonusFreeGameEvent(btn){
        Global.playHSEffect('press');
        let startnode = cc.find('startspine',this._rewardGameRollUI);
        startnode.stopAllActions()
        startnode.getComponent(cc.Button).interactable = false;
        this.sendEnterFreeeGame(4);
        cc.vv.gameData.playSpine(startnode,'animation2',false,()=>{
            startnode.active = false;
            startnode.getComponent(cc.Button).interactable = true;
        });
    },

    // 设置奖池大小
    setJackPotSize(bWheel){
        let prizepool = cc.find('safe_node/LMSlots_PrizePool',this.node);
        if(bWheel){
            prizepool.setScale(cc.v2(1.1,1.2))
        } else {
            prizepool.setScale(cc.v2(1,1))
        }
    },

    //奖池锁定(停止滚动)
    lockJackpot(){
        let poollist = cc.vv.gameData.getPoolList();
        if(poollist){
            let prizepool = cc.find('safe_node/LMSlots_PrizePool',this.node).getComponent("LMSlots_PrizePool_Base");
            prizepool.PausePool([{prizeType:0,pauseNum:poollist[0]},{prizeType:1,pauseNum:poollist[1]},
                {prizeType:2,pauseNum:poollist[2]},{prizeType:3,pauseNum:poollist[3]},{prizeType:4,pauseNum:poollist[4]}]);
        }
    },

    //复位奖池(继续滚动)
    resetJackpot(){
        let prizepool = cc.find('safe_node/LMSlots_PrizePool',this.node).getComponent("LMSlots_PrizePool_Base");
        prizepool.ResumePausePool();
    },

    //播放开始点击动画
    playStartClickSpine(){
        let startnode = cc.find('startspine',this._freeGameRollUI);
        startnode.active = true;
        cc.vv.gameData.playSpine(startnode,'animation1',true,null);

        cc.vv.gameData.checkAutoPlay(startnode, this.onStartFreeGameEvent.bind(this));
    },

    //播放进入rtype类型为1的免费游戏过场动画
    async playFreeSpine(callback){
        Global.SlotsSoundMgr.stopBgm();
        Global.playHSEffect('transition3');
        let freestartspine = cc.find('safe_node/screenspine/qp_aijiyanhou',this.node);
        freestartspine.active = true;
        cc.vv.gameData.playSpine(cc.find("aijiyanhou",freestartspine),'skill2',false,()=>{
            freestartspine.active = false;
        });

        await cc.vv.gameData.awaitTime(1.5);
        if(callback){
            callback();
        }
    },

    //播放rtype类型为4的奖金游戏过场动画(结束)
    playBonusGameSpine(callback){
        Global.playHSEffect('transition1');
        let freestartspine = cc.find('safe_node/screenspine/bonusgamespine',this.node);
        freestartspine.active = true;
        cc.vv.gameData.playSpine(freestartspine,'animation',false,()=>{
            freestartspine.active = false;
            if(callback){
                callback();
            }
        });
    },

    //rtype类型为4奖金游戏开场动画(进入)
    playSanjinbiSpine(callback){
        Global.playHSEffect('transition2');
        let freestartspine = cc.find('safe_node/screenspine/sanjinbispine',this.node);
        freestartspine.active = true;
        cc.vv.gameData.playSpine(freestartspine,'animation',false,()=>{
            freestartspine.active = false;
            if(callback){
                callback();
            }
        });
    },

    //接收51消息返回
    onRcvSubGameAction:function(msg){
        if(msg.code == 200){
            if(msg.data.rtype == 5)
                return;
            this._subGameData = msg.data;
            if(this._subGameData.rtype == 4){
                this._freeGameType = undefined;
                this._rewardGameRollUI.getComponent('G_Cleopatra_Roll').startMove(this._subGameData);
            }else{
                this._freeGameType = msg.data.type;
                if(this._subGameData.rtype == 1){
                    this._freeGameRollUI.getComponent('G_Cleopatra_Roll').startMove(this._subGameData);
                }
            }
            
        }
    },

    //发送进入小游戏 51消息头
    sendEnterFreeeGame(type){
        let req = {c: MsgId.SLOT_SUBGAME_DATA};
        req.data = {}
        req.data.rtype = type
        req.gameid = cc.vv.gameData.getGameId()
        cc.vv.NetManager.send(req,true);
    },

    //roll结束处理
    rollEndHandle(subdata){
        if(subdata.rtype&&subdata.rtype == 4){
            //奖金游戏
            this.showRewardCollectUI(subdata);
        }else{
            //调整进入免费游戏顺序(先播放spine/再出现界面)
            this.playFreeSpine(()=>{
                this._freeGameType = subdata.type;
                AppLog.log('####freegametype:'+this._freeGameType);
                if(subdata.select&&subdata.select.state){
                    //如果需要选择
                    let choicemult = cc.find('choicemultiplier',this._freeGameUI);
                    choicemult.active = true;
                    choicemult.getComponent('G_Cleopatra_ChoicMultiplier').init(subdata);
                }else{
                    //直接开始游戏
                    if(this._freeGameType == 2){
                        cc.find('pressStartUI_2',this._freeGameUI).active = true;
                        let startgamenode2 = cc.find('pressStartUI_2/btn_start',this._freeGameUI);
                        cc.vv.gameData.checkAutoPlay(startgamenode2, this.onStartFreeGame24.bind(this));
                    }else if(this._freeGameType == 4){
                        cc.find('pressStartUI_4',this._freeGameUI).active = true;
                        let startgamenode4 = cc.find('pressStartUI_4/btn_start',this._freeGameUI);
                        cc.vv.gameData.checkAutoPlay(startgamenode4, this.onStartFreeGame24.bind(this));
                    }else{
                        this.startFreeGame();
                    }
                }
                //显示免费界面
                this.enterFreeGameBytype(this._freeGameType);
                this.setJackPotSize(false)
                this._freeGameRollUI.active = false;
            });
            this.scheduleOnce(() => {
                cc.vv.gameData.GetSlotsScript().freeReUpdateSymbol();
            }, 0.3);
        }
    },

    //免费类型2 4 点击开始
    onStartFreeGame24(){
        Global.playHSEffect('btn_click');
        cc.find('pressStartUI_2',this._freeGameUI).active = false;
        cc.find('pressStartUI_2',this._freeGameUI).stopAllActions();
        cc.find('pressStartUI_4',this._freeGameUI).active = false;
        cc.find('pressStartUI_4',this._freeGameUI).stopAllActions();
        this.startFreeGame();
    },

    //免费游戏开始移动
    startMoveFreeGame(){
        if(this._freeGameType){
            let restFree = cc.vv.gameData.GetFreeTime();
            AppLog.log("####开始移动 RestFree:"+restFree);
            //播放初始边框特效
            this.setFrameSpineShow(this._totalFreeTimes-restFree);
        }
    },

    //正式开始免费游戏(播放动画/开始旋转)
    async startFreeGame(){
        Global.SlotsSoundMgr.playBgm('free_bgm');
            //增加倍率/icon展示
            if(this._freeGameType == 1){
            this.freeType1ShowMult();
            }else if(this._freeGameType == 2){
            this.freeType2ShowMult();
            }else if(this._freeGameType == 3){
            this.freeType3ShowMult();
            }else{
                //4类型直接开始旋转 7 wilds
                for(let i=1;i<8;i++){
                this.setItemGray(i,false);
                }
            this.sendSpin();
            }
    },

    //免费类型1展示 7 Spins
    freeType1ShowMult(){
        let atlas = cc.vv.gameData.GetAtlasByName("free")
        let index = 1;
        this._subGameData.boxs.forEach(val => {
            this.setItemGray(index,false);
            var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,index)
            let mult = cc.find(path,this._freeGameUI);
            mult.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('theme186_free_text_muti_'+val);
            index++;
        });
        
        //播放动画展示 
        for(let j=4;j<8;j++){
            var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,j);
            let mult = cc.find(path,this._freeGameUI);
            mult.runAction(cc.sequence(cc.scaleTo(0, 0), cc.scaleTo(0.5, 1).easing(cc.easeBackInOut())));
        }
        this.scheduleOnce(()=>{
            this.sendSpin();
        },1);
    },

    //免费类型2展示 7 Prizes
    freeType2ShowMult(){
        let index = 1;
        this._subGameData.boxs.forEach(val => {
            this.setItemGray(index,false);
            var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,index)
            let item = cc.find(path,this._freeGameUI);
            item.getComponent(cc.Label).string = Global.convertNumToShort(val);
            index++;
        });
        this.sendSpin();
    },

    //免费类型3展示 7Wins
    freeType3ShowMult(){
        let atlas = cc.vv.gameData.GetAtlasByName("free")
        let index = 1;
        this._subGameData.boxs.forEach(val => {
            this.setItemGray(index,false);
            var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,index)
            let mult = cc.find(path,this._freeGameUI);
            mult.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('theme186_free_text_muti_'+val);
            index++;
        });
        //播放动画展示
        var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,7)
        let mult7 = cc.find(path,this._freeGameUI);
        mult7.runAction(cc.sequence(cc.scaleTo(0, 0), cc.scaleTo(0.5, 1).easing(cc.easeBackInOut())));
        this.scheduleOnce(()=>{
            this.sendSpin();
        },1);
    },

    //开始旋转
    sendSpin(){
        //更新免费次数
        cc.vv.gameData.SetFreeTime(this._totalFreeTimes-1)
        cc.vv.gameData.GetBottomScript().ShowFreeModel(true,1,this._totalFreeTimes)
        cc.vv.gameData.GetBottomScript().SendSpinReq();
    },

    //免费last spin界面
    showLastSpinUI(){
        cc.vv.gameData.GetSlotsScript().showMask(true);
        Global.playHSEffect('dialog_lastspin');
        let atlas = cc.vv.gameData.GetAtlasByName("dialog")
        let spname = this.getLastSpinSpNameByType(this._freeGameType);
        let lastui = cc.find('lastspin',this._freeGameUI);
        lastui.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(spname)
        //移动效果
        lastui.active = true;
        cc.tween(lastui)
        .to(0.5,{position:cc.v2(0,-431)},{easing:'backIn'}).call(()=>{
            let movetop = cc.moveTo(0.5,cc.v2(0,-401)).easing(cc.easeBackOut());
            let movebottom = cc.moveTo(0.5,cc.v2(0,-461)).easing(cc.easeBackOut());
            lastui.runAction(cc.repeat(cc.sequence(movetop,movebottom),2));
        })

        .delay(2)
        .to(0.5,{position:cc.v2(0,-1000)})
        .call(()=>{
            lastui.active = false;
            cc.vv.gameData.GetSlotsScript().showMask(false);
        }).start()
    },

    //免费游戏收集界面显示
    showFreeOverCollectUI(){  
        Global.playHSEffect('fg_end');
        cc.vv.gameData.GetSlotsScript().showMask(true);
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1")
        let self = this;
        this.scheduleOnce(()=>{
            let atlas = cc.vv.gameData.GetAtlasByName("dialog")
            let winbgname = this.getWinnerBgSpNameByType(this._freeGameType);
            let winspname = this.getWinnerSpNameByType(this._freeGameType);
            //动态改变界面背景
            let endui = cc.find('gameEndUI',this._freeGameUI);
            let btnnode = cc.find('btn_collect',endui);
            let winner = cc.find('gameEndUI/winner',this._freeGameUI);
            let coinnode = cc.find('gameEndUI/collectnum',this._freeGameUI);
            endui.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(winbgname)
            winner.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(winspname)

            //显示收集的金币数量
            let wincoin = cc.vv.gameData.GetFreeWinCoin();
            Global.doRoallNumEff(coinnode,0,wincoin,1.5,null,null,2,true);

            //移动效果
            btnnode.scale = 0;
            endui.active = true;
            Global.playHSEffect('popup_out');
            cc.tween(endui)
                .to(0.3,{position:cc.v2(0,-422)},{easing:'backOut'})
                .call(()=>{
                    cc.tween(btnnode).to(0.5,{scale:1},{easing:'backOut'})
                        .call(()=>{
                            cc.vv.gameData.checkAutoPlay(btnnode, this.onCollectEvent.bind(self));
                        })
                        .start();
                })
                .start()
        },0.3)
    },

    //点击收集按钮(播放动画/恢复界面)
    onCollectEvent(){
        Global.playHSEffect('btn_click');
        let collectnode = cc.find('gameEndUI/btn_collect',this._freeGameUI);
        collectnode.stopAllActions()
        let endui = cc.find('gameEndUI',this._freeGameUI);
        cc.tween(endui)
        .to(0.5,{position:cc.v2(0,-1000)})
        .call(()=>{
            //复原界面
            cc.vv.gameData.GetSlotsScript().showMask(false);
            cc.vv.gameData.GetGameLogic().changeGameBg(5);
            this.playFreeSpine(()=>{
                this.exitFreeGame();
                cc.vv.gameData.GetBottomScript().ShowFreeModel(false);
                cc.vv.gameData.GetTopScript().SetBackLobby(true);
                endui.active = false;
           });
        }).start()
    },

    //播放线结束
    playLineOver(){
        let isfree = cc.vv.gameData.isFreeToPlay();
        if(isfree){
            let restFree = cc.vv.gameData.GetFreeTime();
            if(restFree == 0){
                cc.vv.gameData.setWaitOperate(true);
                this.showFreeOverCollectUI();
            }else if(restFree == 1){
                //最后一次旋转
                // this.showLastSpinUI();
            }
            //播放item飞效果 置灰item
            this.setItemGray(this._totalFreeTimes-restFree,true);
        }
    },

    //置灰item对象
    setItemGray(index,isgray){
        var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s',this._freeGameType,index)
        let item = cc.find(path,this._freeGameUI);
        let children = item.children;
        for (let i = 0, count=children.length; i < count; i++) {
            if(isgray){
                children[i].color = cc.color(90,90,90);
            }else{
                children[i].color = cc.color(255,255,255);
            }
        }  
        //item本身置灰
        if(isgray){
            item.color = cc.color(90,90,90);
        }else{
            item.color = cc.color(255,255,255);
        }
        //隐藏特效框
        this.hideFrameSpine();
    },

    //设置边框spine显示
    setFrameSpineShow(index){
        Global.playHSEffect('kuang');
        var path = cc.js.formatStr('gameUI_%s/bottomnode/framespine',this._freeGameType);
        let frame = cc.find(path,this._freeGameUI);
        if(frame){
            frame.active = true;
            var itempath = cc.js.formatStr('gameUI_%s/bottomnode/item%s',this._freeGameType,index)
            let item = cc.find(itempath,this._freeGameUI);
            frame.position = item.position;
        }
    },

    //隐藏边框spine
    hideFrameSpine(){
        var path = cc.js.formatStr('gameUI_%s/bottomnode/framespine',this._freeGameType);
        let frame = cc.find(path,this._freeGameUI);
        if(frame){
            frame.active = false;
        }
    },


    //按免费类型显示界面
    enterFreeGameBytype(type){
        cc.find('gameUI_'+type,this._freeGameUI).active = true;
        cc.find('bg_collectcoin',this._freeGameUI).active = true;

        cc.find('safe_node/LMSlots_PrizePool',this.node).active = false;
        cc.find('safe_node/spine_character',this.node).active = false;
        cc.find('safe_node/node_energy',this.node).active = false;

        //初始化显示能量
        this.updateEnergy();
        //改变背景图片
        cc.vv.gameData.GetGameLogic().changeGameBg(type-1);
    },

    updateEnergy(){
        let pyramnum = cc.vv.gameData.getPyramidNum();
        if(pyramnum){
            Global.doRoallNumEff(this._pyramidNumNode,pyramnum,pyramnum,0,null,null,2,true);
        }
    },

    //奖励/倍率开始掉落
    async rewardDropdown(){
        if(!cc.vv.gameData.isFreeToPlay())
            return;
        let nWin = cc.vv.gameData.GetGameWin();
        if(nWin == 0)
            return;
        let restFree = cc.vv.gameData.GetFreeTime();
        AppLog.log("####RestFree:"+restFree);
        if(this._freeGameType == 4){
            await this.wildFlyToReels(this._totalFreeTimes-restFree);
        }else if(this._freeGameType == 2){
            await this.iconFlyToLionSymbol(this._totalFreeTimes-restFree);
        } 
        else{
            await this.iconFlyToBottom(this._totalFreeTimes-restFree);
        } 
    },

    //wild飞入
    async wildFlyToReels(index){
        let basefree = cc.vv.gameData.GetBaseFree();
        let arr = basefree.free7Wilds.idxs;
        if(arr.length == 0)
            return;
        let promiseArr = [];
        var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/bg_icon',this._freeGameType,index)
        let wild = cc.find(path,this._freeGameUI);
        let topaninode = cc.find('safe_node/slots/top_wild',this.node);
        arr.forEach(val => {
            //同时实例化scatter对象 移动用
            let flyNode = cc.instantiate(wild);
            let parentNode = cc.find('Canvas/safe_node')
            flyNode.parent = parentNode
            let beiginPos = parentNode.convertToNodeSpaceAR(wild.convertToWorldSpaceAR(cc.v2(0,-16)))
            flyNode.position = beiginPos

            //目标节点
            let col = (val - 1)%5;
            let row = 4 - Math.floor((val-1)/5)-1;
            let tarPos = this.getWildPos(col,row);
            let aimpos = parentNode.convertToNodeSpaceAR(topaninode.convertToWorldSpaceAR(tarPos))
            let self = this;
            Global.playHSEffect('wild_out');
            promiseArr.push(new Promise((success)=>{
                cc.tween(flyNode).bezierTo(0.5,cc.v2(beiginPos.x,beiginPos.y),cc.v2(aimpos.x,beiginPos.y),cc.v2(aimpos.x,aimpos.y),{scale:2})
                .call(() => {
                    //还要播放spine
                    self.playWildSpine(tarPos);
                    flyNode.destroy()
                    success();
                }).start()

            }));
        });

        await Promise.all(promiseArr);
    },

    //播放wildspine
    playWildSpine(tarpos){
        let wildspine = cc.find('safe_node/slots/top_wild/wildspine',this.node);
        let wildnode = cc.instantiate(wildspine);
        wildnode.active = true;
        wildnode.parent = wildspine.parent;
        wildnode.position = tarpos;
        cc.vv.gameData.playSpine(wildnode,'animation',false,()=>{
            wildnode.destroy();
        });
    },

    //获取位置
    getWildPos(col,row){
        return cc.v2(61+123*col,40.5+81*row);
    },

    
    //免费中奖后图标飞入bottom效果
    async iconFlyToLionSymbol(index){
        let lionNodeArr = cc.vv.gameData.GetSlotsScript().getLionNodeArr()
        if(lionNodeArr.length == 0)return;

        var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,index)
        let item = cc.find(path,this._freeGameUI);
        if(!item)return;
        console.log("lionNodeArr",lionNodeArr);
        for (const key in lionNodeArr) {
            let lionSrc = lionNodeArr[key]
            let lionNode = lionSrc.node

            //同时实例化scatter对象 移动用
            let multparticle = cc.find('multparticle',this._freeGameUI);
            let flyNode = cc.instantiate(item);
            let particlenode = cc.instantiate(multparticle);
            let parentNode = cc.find('Canvas/safe_node')
            flyNode.parent = parentNode
            let beiginPos = parentNode.convertToNodeSpaceAR(item.convertToWorldSpaceAR(cc.v2(0,0)))
            flyNode.position = beiginPos
            particlenode.parent = parentNode;
            particlenode.active = true;
            particlenode.position = beiginPos;
    
            //目标节点
            let tarPos = parentNode.convertToNodeSpaceAR(lionNode.convertToWorldSpaceAR(cc.v2(0,0)))
            Global.playHSEffect('mul_fly');
            cc.tween(particlenode)
            .delay(key * 1)
            .to(0.5,{position:tarPos})
            .call(()=>{
                lionSrc.playLionAni(this._subGameData.boxs[index - 1])
                particlenode.destroy()
            }).start();

            cc.tween(flyNode)
            .delay(key * 1)
            .to(0.5,{position:tarPos})
            .call(()=>{
                flyNode.destroy()
            }).start();

        }
        await this.awaitTime(lionNodeArr.length * 1)
    },


    //免费中奖后图标飞入bottom效果
    async iconFlyToBottom(index){
        //1~3为1倍 不用掉落
        if(index < 4)
            return;
        var path = cc.js.formatStr('gameUI_%s/bottomnode/item%s/mult',this._freeGameType,index)
        let item = cc.find(path,this._freeGameUI);
        if(!item)return;

        //同时实例化scatter对象 移动用
        let multparticle = cc.find('multparticle',this._freeGameUI);
        let flyNode = cc.instantiate(item);
        let particlenode = cc.instantiate(multparticle);
        let parentNode = cc.find('Canvas/safe_node')
        flyNode.parent = parentNode
        let beiginPos = parentNode.convertToNodeSpaceAR(item.convertToWorldSpaceAR(cc.v2(0,0)))
        flyNode.position = beiginPos
        particlenode.parent = parentNode;
        particlenode.active = true;
        particlenode.position = beiginPos;

        //目标节点
        let winbgnode = cc.find('safe_node/LMSlots_Bottom/winBg',this.node);
        let tarPos = parentNode.convertToNodeSpaceAR(winbgnode.convertToWorldSpaceAR(cc.v2(0,0)))
        Global.playHSEffect('mul_fly');
        return new Promise((success)=>{
            cc.tween(particlenode).to(0.5,{position:tarPos}).call(()=>{
                particlenode.destroy()
            }).start();
            cc.tween(flyNode).to(0.5,{position:tarPos}).call(()=>{
                flyNode.destroy()
                success();
            }).start();
        });
    },

    //退出免费显示普通界面
    async exitFreeGame(){
        for(let i=1;i<5;i++){
            cc.find('gameUI_'+i,this._freeGameUI).active = false;
        }
        cc.find('bg_collectcoin',this._freeGameUI).active = false;
        cc.find('safe_node/LMSlots_PrizePool',this.node).active = true;
        cc.find('safe_node/spine_character',this.node).active = true;
        cc.find('safe_node/node_energy',this.node).active = true;
        this._freeGameType = 0;
        cc.vv.gameData.setWaitOperate(false);
        cc.vv.gameData.GetSlotsScript().resumeSymbolState();
        cc.vv.gameData.GetSlotsScript().playScatterAnimation(true);
        await cc.vv.gameData.awaitTime(1);
        let nWin = cc.vv.gameData.GetGameTotalFreeWin()
        cc.vv.gameData.GetSlotsScript().ShowBottomWin(nWin,nWin,true,()=>{
            cc.vv.gameData.GetBottomScript().CanDoNextRound();
        });
    },

    //#####################收集游戏结算界面 按中奖类型修改界面#################

    //隐藏jackpot特效
    hideJackpotSpine(){
        let jackpotnode = cc.find('Canvas/safe_node/LMSlots_PrizePool');
        cc.find('prizePool_Mini/rewardspine',jackpotnode).active = false;
        cc.find('prizePool_Minor/rewardspine',jackpotnode).active = false;
        cc.find('prizePool_Major/rewardspine',jackpotnode).active = false;
        cc.find('prizePool_Mega/rewardspine',jackpotnode).active = false;
        cc.find('prizePool_Grand/rewardspine',jackpotnode).active = false;
    },
    //显示奖金游戏收集界面
    showRewardCollectUI(subdata){
        Global.playHSEffect('dialog_jackpot_collect');
        this.updateCollectUI(subdata.result.type);
        cc.find('rewardCollectUI',this._freeGameUI).active = true;
        let headsp = cc.find('rewardCollectUI/head/sp',this._freeGameUI);
        let haeadspname = this.getRewardHeadSpName(subdata.result.type);
        cc.vv.gameData.playSpine(headsp,haeadspname,true);

        this._rewardCoin = subdata.coin;
        let collectnode = cc.find('rewardCollectUI/collectnum',this._freeGameUI);
         Global.doRoallNumEff(collectnode,0,subdata.coin,1.5,null,null,2,true);

        let collectreward = cc.find('rewardCollectUI/btn_collect',this._freeGameUI);
        cc.vv.gameData.checkAutoPlay(collectreward, this.onRewardCollectEvent.bind(this));
    },

    //奖金游戏点击收集界面
    onRewardCollectEvent(){
        Global.playHSEffect('btn_click');
        cc.find('rewardCollectUI/btn_collect',this._freeGameUI).stopAllActions();
        cc.find('rewardCollectUI',this._freeGameUI).active = false;
        this.hideJackpotSpine();
        this.playBonusGameSpine(()=>{
        })
        this.scheduleOnce(()=>{
            this.resetJackpot();
            this.setJackPotSize(false);
            this._rewardGameRollUI.active = false;
            cc.vv.gameData.clearSelectState();
            cc.vv.gameData.AddCoin(this._rewardCoin);
            cc.vv.gameData.GetSlotsScript().rewardGamePlayBottomWin(this._rewardCoin,()=>{
                cc.vv.gameData.GetTopScript().SetBackLobby(true);
                cc.vv.gameData.GetBottomScript().CanDoNextRound();
            });

        },1.5)
    },

    //1 mini 2 minor 3 major 4 mega 5 grand
    updateCollectUI(type){
        let atlas = cc.vv.gameData.GetAtlasByName("dialog")
        let bgspname = this.getRewardUIBgSpName(type);
        let headspname = this.getRewardUIHeadSpName(type);
        let framespname = this.getRewardUIFrameSpName(type);

        let bg1 = cc.find('rewardCollectUI/bg_left',this._freeGameUI);
        let bg2 = cc.find('rewardCollectUI/bg_left/bg_right',this._freeGameUI);
        let frame1 = cc.find('rewardCollectUI/textbg',this._freeGameUI);
        let frame2 = cc.find('rewardCollectUI/textbg/textbg2',this._freeGameUI);
        let head = cc.find('rewardCollectUI/head',this._freeGameUI);

        bg1.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(bgspname)
        bg2.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(bgspname)
        frame1.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(framespname)
        frame2.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(framespname)
        head.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(headspname)
    },

    //奖励头特效名
    getRewardHeadSpName(type){
        switch (type) {
            case 1:return 'animation5';
            case 2:return 'animation4';
            case 3:return 'animation3';
            case 4:return 'animation2';
            case 5:return 'animation1';
        }
    },

    //奖励游戏收集界面头文字
    getRewardUIHeadSpName(type){
        switch (type) {
            case 1:return 'theme186_d_text_jp5';
            case 2:return 'theme186_d_text_jp4';
            case 3:return 'theme186_d_text_jp3';
            case 4:return 'theme186_d_text_jp2';
            case 5:return 'theme186_d_text_jp1';
        }
    },

    //奖励游戏收集界面背景
    getRewardUIBgSpName(type){
        switch (type) {
            case 1:return 'theme186_d_bg1_5';
            case 2:return 'theme186_d_bg1_4';
            case 3:return 'theme186_d_bg1_3';
            case 4:return 'theme186_d_bg1_2';
            case 5:return 'theme186_d_bg1_1';
        }
    },

    //奖励游戏收集获得框背景
    getRewardUIFrameSpName(type){
        switch (type) {
            case 1:return 'theme186_d_bg3_5';
            case 2:return 'theme186_d_bg3_4';
            case 3:return 'theme186_d_bg3_3';
            case 4:return 'theme186_d_bg3_2';
            case 5:return 'theme186_d_bg3_1';
        }
    },
    //#########################################################################
    //server type 1spine(蓝) 2 prizes(绿) 3 win(红) 4 wilds(紫)
    //服务器类型转换为winner背景颜色
    getWinnerBgSpNameByType(type){
        switch (type) {
            case 1:return 'theme186_d_bg2_3';
            case 2:return 'theme186_d_bg2_4';
            case 3:return 'theme186_d_bg2_1';
            case 4:return 'theme186_d_bg2_2';
        }
    },

    //服务器类型转换为lastspin背景颜色
    getLastSpinSpNameByType(type){
        switch (type) {
            case 1:return 'theme186_d_bg4_3';
            case 2:return 'theme186_d_bg4_4';
            case 3:return 'theme186_d_bg4_1';
            case 4:return 'theme186_d_bg4_2';
        }
    },

    //服务器类型转换为winner文字颜色
    getWinnerSpNameByType(type){
        switch (type) {
            case 1:return 'theme186_d_text_win3';
            case 2:return 'theme186_d_text_win4';
            case 3:return 'theme186_d_text_win1';
            case 4:return 'theme186_d_text_win2';
        }
    },

    awaitTime (time) {
        return new Promise((success)=>{
            this.scheduleOnce(()=>{
                success()
            },time);
        });
    },

});
