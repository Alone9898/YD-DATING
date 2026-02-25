
cc.Class({
    extends: cc.Component,

    properties: {
        _playUnlockState:0,     
    },
    onLoad () {
        let btn_lock = cc.find('btn_lock',this.node)
        Global.btnClickEvent(btn_lock,this.onClicklock,this)

        let btn_juanzhou = cc.find('btn_juanzhou',this.node)
        Global.btnClickEvent(btn_juanzhou,this.onClickJuanzhou,this)

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onChangeBetValue,this)

    },

    start(){
        this.initShow();
        let energyData = cc.vv.gameData.getEnergyData();
        if(energyData){
            this.updateNextAimIcon(energyData);
            //初始化刷新能量值
            this.updateEnergyGame(energyData);
        }
    },

     //初始化显示
     initShow:function(){
        //当前押注是否足够解锁
         let energyData = cc.vv.gameData.getEnergyData();
         if(!energyData)
             return;


        //解锁节点的显示/隐藏
        this.UNLOCKVAL = cc.vv.gameData.getNeedBet();
        let betIdx = cc.vv.gameData.GetBetIdx()
        let btn_lock = cc.find('btn_lock',this.node)
        let ani_node = btn_lock.getChildByName('node_spine')
        this.updateCoinProgress(energyData)

        if(betIdx >= this.UNLOCKVAL){
            //解锁
            if(this._playUnlockState != 1){
                this._playUnlockState = 1
                Global.SlotsSoundMgr.playEffect('collect_unlock');
                cc.vv.gameData.playSpine(ani_node,'animation3',false,()=>{
                    btn_lock.active = false;
                 })
            }
        }
        else{
            //锁定
            if(this._playUnlockState != 2){
                this._playUnlockState = 2
                btn_lock.active = true
                Global.SlotsSoundMgr.playEffect('collect_lock');
                cc.vv.gameData.playSpine(ani_node,'animation1',false,()=>{
                    cc.vv.gameData.playSpine(ani_node,'animation2',false,null);
                 }) 
            }
        }

    },

    //刷新下一个目标图标
    updateNextAimIcon(energyData){
        //下一个目标
        let bigGate = {2:'theme115_map_buliding4',7:'theme115_map_buliding3',13:'theme115_map_buliding2',20:'theme115_map_buliding1'}
        let filename = bigGate[energyData.map_idx+1]
        let atlas = cc.vv.gameData.GetAtlasByName("map")
        let spr_bg = cc.find('spr_yb',this.node)
        if(filename){
            spr_bg.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(filename)
        }else{
            spr_bg.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('theme115_map_yuanbao_light');
        }
    },

    //进入能量游戏
    updateEnergyGame(energyData){
        AppLog.log("###更新能量:"+energyData.next_game);
        if(energyData.next_game > 0){
            if(cc.vv.gameData.isTriggerMap()){
                //如果是触发能量大关游戏
                cc.log("延时进入地图1");
                this.scheduleOnce(() => {
                    cc.log("延时进入地图2");
                    let node = cc.find('Canvas/safe_node/map_game')
                    node.active = true
                    node.getComponent('RegalTiger_map').enterMap(true)
                }, 2);
            }else{
                this.energyGameOver();
                cc.vv.gameData.GetUIMgr().showEnergyFreeUI(energyData.freeGame.rest,energyData.freeGame.all);
                cc.vv.gameData.GetBottomScript().CanDoNextRound();
            }
        }
    },

    //点击解锁
    onClicklock:function(){
        if(cc.vv.gameData.isReelMove())
            return;
        if(this._playUnlockState == 1)
            return;
        if(cc.vv.gameData.GetFreeTime()>0){
            return;
        }
        cc.vv.gameData.GetBottomScript().SetBetIdx(this.UNLOCKVAL)
        Global.SlotsSoundMgr.playEffect('collect_unlock');
        //然后播放解锁表现
        let btn_lock = cc.find('btn_lock',this.node)
        let ani_node = btn_lock.getChildByName('node_spine')
        cc.vv.gameData.playSpine(ani_node,'animation3',false,()=>{
            btn_lock.active = false;
        })
    },

    //点击卷轴
    onClickJuanzhou:function(){
        if(cc.vv.gameData.isReelMove())
            return;
        if(cc.vv.gameData.GetFreeTime()>0){
            return;
        }
        Global.SlotsSoundMgr.playEffect('btn_click');
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1")
        let node = cc.find('Canvas/safe_node/map_game')
        node.active = true
        node.getComponent('RegalTiger_map').enterMap(false)
    },

    updateCoinProgress:function(energyData){
        if(energyData){
            this._lastnum = energyData.totalCoin;
            let per = energyData.totalCoin/energyData.needCoins
            this.showEnergyProgress(per);
        }
    },

    //能量大关/小关游戏结束
    energyGameOver:function(){
        this.showEnergyProgress(0);
        //能量触发关卡游戏
        let energyData = cc.vv.gameData.getEnergyData();
        if(energyData){
            this.updateNextAimIcon(energyData);
        }
    },

    showEnergyProgress:function(per){
        let pro = cc.find('coin_progress',this.node)
        pro.getComponent(cc.ProgressBar).progress = per
    },

    //押注额改变val
    onChangeBetValue(data){
        let val = data.detail;
        this.initShow();
    },

    //刷新能量事件
    onEventRefushEnergy:function(){
        //播放能量改变spine
        AppLog.log("###刷新能量:");
        let energyData = cc.vv.gameData.getEnergyData();
        if(this._lastnum == energyData.totalCoin)
            return;
        this._lastnum = energyData.totalCoin;
        this.updateCoinProgress(energyData);  
        this.updateEnergyGame(energyData);
        Global.SlotsSoundMgr.playEffect('collect_coin_full');
        //金币上动画
        let collectspine = cc.find('spr_left/spin_collect',this.node);
        collectspine.active = true;
        collectspine.getComponent(sp.Skeleton).setAnimation(0,'animation1',false);
        //进度动画
        let progressbarnode = cc.find('coin_progress/bar/spin_pro',this.node);
        cc.vv.gameData.playSpine(progressbarnode,'animation1',false,()=>{
            cc.vv.gameData.playSpine(progressbarnode,'animation2',false,null);
        })
    },
});
