/**
 * slots
 */

 let SCATTER = 11;

cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _ingot: null,
        _ingotEndPos: null,
        _result:[],
    },

    SetSlotsResult:function(cards){
        let collect = this._gameInfo.collect;
        //把结果按卷轴结果整理
        let acRow = cards.length / this._col
        let reelResults = []
        this._result = []
        for(let i = 0;i < cards.length; i++){
            let row = Math.floor(i / acRow)
            let col = i % this._col
            //配置中有没有这个元素
            if(this._cfg.symbol[cards[i]]){
                let res = {}
                res.sid = cards[i]
                res.data = false;
                if (collect && collect.pos.indexOf(i+1) != -1) {
                    res.data = true;
                }
                if(!reelResults[col]) reelResults[col] = []
                reelResults[col].unshift(res)
                if(!this._result[col]) this._result[col] = []
                this._result[col].unshift(cards[i])
            }
        }
        for(let j = 0; j < this._reels.length; j++){
            let item = this._reels[j]
            let reelRes = reelResults[j]
            item.SetResult(reelRes)
        }
    },

    async Sleep(time) {
        return new Promise((resolve, reject) => {
            this.scheduleOnce(()=>{resolve()}, time);
        });
    },

    async AfterSpinEnd() {
        //显示元宝
        let collect = this._gameInfo.collect;
        if (collect) {
            for (let idx of collect.pos) {
                let symbol = this.GetSymbolByIdx(idx);
                if (symbol) {
                    this.ShowIngotFly(symbol.GetIngotWPos());
                    symbol.ShowIngot(false);
                }
            }
            Global.TheLegendOfDragon.playEffect("base/collect");
            await this.Sleep(0.7);
            let spine = cc.find("collect_progress/bg/icon/spine", this.node);
            spine.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
            cc.vv.gameData.setIngot(collect.num);
            Global.TheLegendOfDragon.Collect.refreshIngotNum();
        }

        // 显示免费特殊玩法
        if (this._gameInfo.spFree) {
            await this.ShowSpecialFree(this._gameInfo.spFree);
        }

        // 显示中奖路线
        this.ShowWinTrace();

        // 更新金币
        let nWin = cc.vv.gameData.GetGameWin()
        let nTotal = nWin
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
            nTotal = cc.vv.gameData.GetGameTotalFreeWin()
        }
        await new Promise(resolve=>{
           this.ShowBottomWin(nWin,nTotal,true, resolve);
        });

        let can_spin = true;
        //触发免费游戏
        if (cc.vv.gameData.isFirstTriggerFree()) {
            can_spin = false;
            this._bottomScript.ShowBtnsByState("moveing_1");
            Global.TheLegendOfDragon.Pop.showFreeStart(cc.vv.gameData.GetFreeTime(), false, false);
            Global.TheLegendOfDragon.playEffect("base/bell");
            this.Backup();
        }
        //结束免费游戏
        if (cc.vv.gameData.isLastEndFree()) {
            can_spin = false;
            this._bottomScript.ShowBtnsByState("moveing_1");
            Global.TheLegendOfDragon.Pop.showFreeEnd(cc.vv.gameData.GetGameTotalFreeWin());
        }
        //触发抽卡游戏
        if (cc.vv.gameData.getPickState()==1) {
            can_spin = false;
            this._bottomScript.ShowBtnsByState("moveing_1");
            Global.TheLegendOfDragon.Pop.showPickStart(this._gameInfo.pick);
        }
        //触发bonus小游戏
        if (this._gameInfo.bonus) {
            can_spin = false;
            this._bottomScript.ShowBtnsByState("moveing_1");
            this.OnBonusEnd(this._gameInfo.bonus);
        }

        if (can_spin) {
            this.CanDoNextRound()
        }
    },

    //重写，开始旋转
    StartMove:function(){
        this._super();
        //开始播放背景音乐
        Global.SlotsSoundMgr.playNormalBgm()
        //隐藏wheel
        Global.TheLegendOfDragon.Wheel.showEnd();
        //显示宝珠动画
        let bonus_tw = this.node.getChildByName("bonus_tw");
        this.scheduleOnce(()=>{
            bonus_tw.active = true;
            bonus_tw.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        }, 0.55);
    },

    //重写，收到服务端数据
    onMsgSpine:function(msg){
        this._super(msg)
        //wheel小游戏必须从这里开始处理
        if (msg.bonus) {
            this.OnBonusStart(msg.bonus);
        }
        //道具掉落
        if (msg.item) {
            Global.TheLegendOfDragon.Collect.onDropItem(msg.item.id, msg.item.didx)
        }
    },

    //重写
    OnReelSpinEnd:function(colIdx){
        this._super(colIdx);
    },

    //重写：显示bonus中奖
    OnSpinEnd:function(){
        this.AfterSpinEnd();
    },

    //重写
    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree){
        if(bFree){
            Global.SlotsSoundMgr.playBgm('free/free_bgm')
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()
        
            //显示免费次数
            this._bottomScript.ShowFreeModel(true,total-rest,total)
            let nTotal = cc.vv.gameData.GetTotalFreeWin()
            this._bottomScript.SetWin(nTotal)
        }
        else{
            this._bottomScript.ShowFreeModel(false);
            this.node.getChildByName("free_multi").active = false;
        }

        //可能还需要显示免费背景图
        let normalBg = cc.find("Canvas/safe_node/bg_base")
        let freeBg = cc.find("Canvas/safe_node/bg_free")
        if(freeBg){ //存在免费游戏背景才执行下面的逻辑
            if(normalBg){
                normalBg.active = !bFree
            }
            freeBg.active = bFree
        }
    },

    async ShowSpecialFree(spFree) {
        if (spFree.total_cnt) {  //免费次数+1
            await new Promise(resolve=>{
                Global.TheLegendOfDragon.Pop.showAddFreeCnt(resolve);
            });
            let total = cc.vv.gameData.GetTotalFree();
            let rest = cc.vv.gameData.GetFreeTime();
            this._bottomScript.ShowFreeModel(true,total-rest,total);
        }
        if (spFree.total_mul) {  //免费奖励倍数
            await new Promise(resolve=>{
                Global.TheLegendOfDragon.Pop.showAddFreeMulti(spFree.total_mul, resolve);
            });
            let free_multi = this.node.getChildByName("free_multi");
            let atlas_base = cc.vv.gameData.GetAtlasByName("base");
            free_multi.getChildByName("num").getComponent(cc.Sprite).spriteFrame
                = atlas_base.getSpriteFrame("theme177_free_ui_num"+spFree.total_mul);
            if (!free_multi.active) {
                free_multi.opacity = 0;
                free_multi.active = true;
                free_multi.runAction(cc.fadeIn(0.2));
            }
        }
    },

    //显示元宝收集
    ShowIngotFly(fromWp) {
        if (!this._ingot) {
            this._ingot = cc.instantiate(this.node.getChildByName("ingot"));
        }
        if (!this._ingotEndPos) {
            let icon = cc.find("collect_progress/bg/icon", this.node);
            this._ingotEndPos = this.node.convertToNodeSpaceAR(icon.convertToWorldSpaceAR(cc.v2(0,0)));
        }
        let ingot = cc.instantiate(this._ingot);
        ingot.active = true;
        ingot.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
        let pos = this.node.convertToNodeSpaceAR(fromWp);
        ingot.position = pos;
        ingot.parent = this.node;
        ingot.runAction(cc.sequence(cc.moveTo(0.7, this._ingotEndPos), cc.destroySelf()));
    },

    //显示bonus游戏增加的wild
    ShowBonusWild(pos, visible) {
        let layout = cc.find("bonus_wilds/layout", this.node);
        for (let idx of pos) {
            layout.getChildByName("w"+idx).active = visible;
        }
    },

    async OnBonusStart(bonus) {
        this._bottomScript.ShowBtnsByState("moveing_1");
        this.SetStopTime(20);
        //shake
        Global.shakeNode(cc.find("Canvas/safe_node"), 8, 1);
        //大龙动画
        let idx = cc.vv.gameData.getDragonIdx();
        let role = cc.find("Canvas/safe_node/roles/role"+idx);
        role.getComponent(sp.Skeleton).setAnimation(0, "attack", false);
        role.getComponent(sp.Skeleton).addAnimation(0, "idle", true);
        await this.Sleep(1.2);
        //显示小游戏开始的弹框
        Global.TheLegendOfDragon.Pop.showWheelStart();
        await this.Sleep(1);
        //转盘开始
        cc.find("bonus_wilds", this.node).active = true;
        await new Promise(resolve=>{
            Global.TheLegendOfDragon.Wheel.showSpin(bonus, resolve);
        });
        await this.Sleep(1);
        //显示bonus结果
        if (bonus.idx == 1) {  //随机wild
            this.ShowBonusWild(bonus.pos, true);
        } else {
            cc.find("bonus_wilds", this.node).active = false;
        }
        //停止转动
        this.SetStopTime(3);
    },

    async OnBonusEnd(bonus) {
        if (bonus.idx == 1) {
            this.ShowBonusWild(bonus.pos, false);
            cc.find("bonus_wilds", this.node).active = false;
        }

        //显示结束
        await this.Sleep(1);
        //可以spin
        this.CanDoNextRound();
    }

});
