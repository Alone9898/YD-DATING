/**
 * 能量收集
 */
// let UNLOCKVAL = 10000
cc.Class({
    extends: cc.Component,

    properties: {
        _isCollectState:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_lock = cc.find('btn_lock',this.node)
        Global.btnClickEvent(btn_lock,this.onClicklock,this)

        let btn_juanzhou = cc.find('btn_juanzhou',this.node)
        Global.btnClickEvent(btn_juanzhou,this.onClickJuanzhou,this)

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onEventChangeBetIdx,this)
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_REFUSH_ENERGY,this.onEventRefushEnergy,this)

        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;
    },

    start () {
        this.scheduleOnce(()=>{
            this.initShow(false);
        })
    },

    //初始化显示
    initShow:function(){
        //当前押注是否足够解锁
        let collectData = cc.vv.gameData.getCollectData();
        if(!collectData) return;

        //解锁节点的显示/隐藏
        let btn_lock = cc.find('btn_lock',this.node)
        let ani_node = btn_lock.getChildByName('node_spine')

        let boo = cc.vv.gameData.isOpenCollectProgress();
        if (this._isCollectState != boo) {
            if(boo){
                Global.SlotsSoundMgr.playEffect(this._soundCfg.unlock);

                btn_lock.getComponent(cc.Button).enabled = false;

                let chaAni = ani_node.getComponent(sp.Skeleton)
                chaAni.setAnimation(0,'animation2',false)
                chaAni.setCompleteListener(()=>{
                    this.updateCollectProgress(collectData)
                    chaAni.setCompleteListener(null);
                })
            }
            else {
                Global.SlotsSoundMgr.playEffect(this._soundCfg.lock);

                btn_lock.getComponent(cc.Button).enabled = true;

                let chaAni = ani_node.getComponent(sp.Skeleton)
                chaAni.setAnimation(0,'animation1',false)
            }
        }
        this._isCollectState = boo;
        
        //初始化刷新能量值
        this.updateNextAimIcon(collectData);
    },

    //点击解锁
    onClicklock:function(){
        if (cc.vv.gameData.GetFreeTime() > 0) return;
        if (cc.vv.gameData.GetSlotState() !== "idle") {
            return;
        }

        let collectData = cc.vv.gameData.getCollectData();
        if(!collectData) return;

        //更新押注额
        cc.vv.gameData._serverRawMult = collectData.min+1;
        cc.vv.UserManager.setEnterSelectBet(null);
        cc.vv.gameData.SetBetIdx(collectData.min+1);
        cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBetCoin();
        //通知押注额修改
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED, cc.vv.gameData.GetTotalBet());

        //然后播放解锁表现
        this.initShow();
    },

    //点击卷轴
    onClickJuanzhou:function(){
        // 如果在免费中 返回
        if(SlotsFacade.dm.GetFreeTime() > 0) {
            return;
        }
        // 如果spin不可点击 返回
        if(!SlotsFacade.bottomCmp.GetSpinBtnState()) {
            return;
        }
        // 自动旋转模式 返回
        if(SlotsFacade.dm.GetAutoModelTime() > 0) {
            return;
        }
        let node = cc.find('Canvas/safe_node/map_game')
        node.active = true
        node.getComponent('LampOfAladdin_Map').enterMap(false)
        Global.SlotsSoundMgr.playEffect(this._soundCfg.click);
    },

    lockAniEndCall:function(trackEntry,data2){
        let name = trackEntry.animation ? trackEntry.animation.name : '';
        if(name == 'animation3'){
            let btn_lock = cc.find('btn_lock',this.node)
            btn_lock.active = false
        }
    },

    onEventChangeBetIdx:function(){
        this.initShow()
    },

    updateCollectProgress:function(collectData){
        if(collectData){
            let per = collectData.num/collectData.total
            per = Math.min(per,1)
            this.showEnergyProgress(per);
        }
    },

    showEnergyProgress:function(per){
        let maskNode = this.node.getChildByName("masknode");
        let bar = maskNode.getChildByName("bar");
        // bar.x = -maskNode.width + maskNode.width*per;
        let spine_prgAdd = bar.getChildByName("spine_prgAdd");
        if(per > 0){
            spine_prgAdd.active = true;
            cc.tween(bar)
                .to(0.3, {x:-maskNode.width + maskNode.width*per})
                .start();
            this._playNodeSpine(spine_prgAdd,'animation', false);
        }else {
            bar.x = -maskNode.width;
            spine_prgAdd.active = false;
        }
    },

    onEventRefushEnergy:function(){
        AppLog.log("刷新能量");

        //进度条动画
        let collectData = cc.vv.gameData.getCollectData();
        this.updateCollectProgress(collectData);  
        this.updateNextAimIcon(collectData);
        //Global.SlotsSoundMgr.playEffect('collect_coin_full')
    },

    //刷新下一个目标图标
    updateNextAimIcon(collectData){
        //更新下一个目标图标
        let bigGate = {3:'collect_building4',7:'collect_building3',12:'collect_building2',19:'collect_building1'};
        let curMapIdx = collectData.idx
        let spr_next = cc.find('spr_collect_building',this.node);
        let fileName = bigGate[curMapIdx+1];
        let atlasName = "base";
        if (!fileName) {
            atlasName = "map";
            fileName = "theme175_map_yuanbao_light";
        }
        spr_next.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.GetAtlasByName(atlasName).getSpriteFrame(fileName);
    },
    
    _playNodeSpine:function(node,aniName,loop){
        let ske = sp.Skeleton
        if(node){
            node.active = true
            let sp = node.getComponent(ske)
            sp.setAnimation(0,aniName,loop)
        }
    }
});
