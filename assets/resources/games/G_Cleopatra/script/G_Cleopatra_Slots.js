

function around(val=0.1) {
    return (1-val)+Math.random()*val*2;
}

cc.Class({
    extends: require('LMSlots_Slots_Base'),

    properties: {
        _collectSpineNode:cc.Node
    },

    //重写重连显示
    ReconnectShow:function(bReconnect){
        //是否是免费游戏  
        let operate = cc.vv.gameData.isOperateGame();
        if(operate == 4){
            //奖金游戏
            cc.vv.gameData.GetFreeGameScript().reConnectEnterRewardGame();
        }else{
            //免费游戏或者免费操作中
            if(cc.vv.gameData.isFreeGamesTime()||operate>0){
                // if(bReconnect){
                //     cc.vv.gameData.GetFreeGameScript().reConnectShowUIDate()
                // }else {
                    cc.vv.gameData.GetFreeGameScript().reConnectEnterFreeGame();
                    if(cc.vv.gameData.isFreeGamesTime()){
                        this.ShowGameview(true);
                    }
                // }

            } else {
                this.CanDoNextRound()
            }
        }     
    },

    // reconnectNet(){
    //     if(this._startMove && )
    //
    // },



     //重写：显示bonus中奖
     async OnSpinEnd () {
        cc.vv.gameData.setReelMove(false);
        this.showMask(false);
        //是否中奖,中奖了就不能开始下一局
        let bHit = this.CheckSpecialReward()
        if(bHit){ //所有按钮状态显示成灰太
            this._bottomScript.ShowBtnsByState("moveing_1")
        }
        await cc.vv.gameData.GetFreeGameScript().rewardDropdown();

        cc.log("11")
        //是否能收集能量
        if (cc.vv.gameData.isOpenCollectProgress()) {
            await this.CollectEnergy();
        }
         cc.log("12")
        //显示中奖路线
        this.ShowWinTrace()
        //增加wild中奖线路
        this.showWildWinTrace();

        //播放scatter动画
        if(cc.vv.gameData.isTriggerFree()){
            this.playScatterAnimation(true);
        }
        //显示底部赢钱
        await this.playBottomWin();
         cc.log("13")

        //检测是否触发免费游戏
        let rtype = cc.vv.gameData.isTriggerNormalFree()||cc.vv.gameData.isRewardGame();
        if(rtype > 0){
            let delaytime = rtype == 4?1:3;
            await this.awaitTime(delaytime);
            this.backupSymbolState();
            cc.vv.gameData.GetFreeGameScript().EnterFreeGame(rtype);
            return;
        }
        
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_PLAY_LINE_FINISH);
        if(cc.vv.gameData.isFreeToPlay()&& cc.vv.gameData.GetFreeTime()==0){
            //如果是免费结束
            return;
        }
        let collectfree = cc.vv.gameData.getCollectFree();
        if(collectfree&&collectfree.state){
            let restFree = cc.vv.gameData.GetFreeTime();
            if(restFree == 0){
                return;
            }
        }
        if(collectfree&&(collectfree.expandingWild||collectfree.stickyWilds)){
            await this.awaitTime(1.5);
        }else{
            // await this.awaitTime(0.5);
        }
        //下一局
        this.CanDoNextRound();
        cc.find('Canvas/safe_node/node_energy/pyramidicon').getComponent(cc.Button).interactable = true;

    },

    //收集能量
    async CollectEnergy(){
        //如果是收集游戏 返回
        let collectfree = cc.vv.gameData.getCollectFree();
        if(collectfree&&collectfree.state)
            return;
        let pyramiddata = cc.vv.gameData.getPyramidData();
        if(pyramiddata&&pyramiddata.info){
            let symbolArr = [];
            for(let key in pyramiddata.info){
                let idx = parseInt(key.replace('idx_',''));
                let col = (idx - 1)%5;
                let row = 4 - Math.floor((idx-1)/5)-1;
                let sys = this._reels[col]._symbols
                symbolArr[idx] = {symbol:sys[row],val:pyramiddata.info[key]};
            }
            if(symbolArr.length > 0){
                await this.PlaySymbolFly(symbolArr);
                Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_REFUSH_ENERGY);
            }
        }
    },

    async PlaySymbolFly(symbolArr){
        let promiseArr = [];
        Global.playHSEffect('collect_fly');
        let parentNode = cc.find('Canvas/safe_node')
        for(let key in symbolArr){
            let symbol = symbolArr[key].symbol;
            //同时实例化scatter对象 移动用s
            let collectnode = symbol.node.getChildByName('flyparticle');
            let flyNode = cc.instantiate(collectnode);
            collectnode.active = false;
            flyNode.parent = parentNode
            let beiginPos = parentNode.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0,0)))
            flyNode.position = beiginPos
            flyNode.getComponent(cc.ParticleSystem).resetSystem();

            //开始移动
            let targetNode = cc.vv.gameData.isFreeGamesTime()?cc.find('Canvas/safe_node/freeGameUI/bg_collectcoin'):cc.find('Canvas/safe_node/node_energy/pyramidicon');
            let tarPos = parentNode.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0,0)))
            promiseArr.push(new Promise((res)=>{
                cc.tween(flyNode).to(0.5,{position:tarPos},{scale:0.1})
                    .call(() => {
                        flyNode.destroy()
                        res();
                    }).start()
            }));
        }
        await Promise.all(promiseArr);
        if(promiseArr.length > 0){
            this.playCollectSpine();
        }
    },

    //播放收集金字塔结束播放spine动画
    playCollectSpine(){
        let jinzitajieshou = cc.find('Canvas/safe_node/freeGameUI/bg_collectcoin/jinzitajieshou')
        jinzitajieshou.getComponent(sp.Skeleton).setAnimation(0,'animation',false)
        if(!this._collectSpineNode){
            this._collectSpineNode = cc.find('Canvas/safe_node/node_energy/collectspine');
        }
        this._collectSpineNode.active = true;
        cc.vv.gameData.playSpine(this._collectSpineNode,'animation',false,()=>{
            this._collectSpineNode.active = false;
        });
    },

    //重写开始spine
    onMsgSpine(msg){
        this._super(msg);
        //收集游戏各种wild显示
        this.showCollectFreeWild();

        //判断免费游戏中的移动
        if(cc.vv.gameData.isFreeToPlay()){
            cc.vv.gameData.GetFreeGameScript().startMoveFreeGame();
        }
    },

    //重写
    StartMove:function(){
        this._super()
        //复位wild动画(从onMsgSpine移到此处)
        this.resetScatterShow();

        cc.vv.gameData.setReelMove(true);
        Global.SlotsSoundMgr.playNormalBgm();

        cc.find('Canvas/safe_node/node_energy/pyramidicon').getComponent(cc.Button).interactable = false;
        //测试
        //cc.vv.gameData.GetFreeGameScript().showLastSpinUI();
        // if()
    },

    //重写单列停止
    OnReelSpinEnd:function(colIdx){
        this._super(colIdx);
        this.collectWildEffect(colIdx);

        //添加收集数字
        let pyramid = cc.vv.gameData.getPyramidData();
        if(pyramid&&pyramid.info){
           this.showCollectNum(colIdx,pyramid.info);
        }
        //显示扩展wild
        this.showExpandingWild(colIdx);
        this.showScatterToTop(colIdx);
    },

    //单列停止显示scatter到上层
    showScatterToTop(colidx){
        let sys = this._reels[colidx]._symbols
        for(let j = 0; j < 4;j++){
            sys[j].scatterSymbolStop();
        }
    },

    //单列停止收集wild
    async collectWildEffect(colidx){
        let energynode = cc.find('Canvas/safe_node/node_energy');
        if(!energynode.active)
            return;
        let bgspinenode = cc.find('collectcoin',energynode);
        let wildani = cc.find('wildani',this.node);
        let parentNode = cc.find('Canvas/safe_node')
        let sys = this._reels[colidx]._symbols
        let promiseArr = [];
        let flycount = 6;
        let tarPos = parentNode.convertToNodeSpaceAR(bgspinenode.convertToWorldSpaceAR(cc.v2(0,0)))
        for(let j = 0; j < 4;j++){
            if(sys[j].GetShowId() == 1){
                let beiginPos = parentNode.convertToNodeSpaceAR(sys[j].node.convertToWorldSpaceAR(cc.v2(0,0)))
                for(let i=0;i<flycount;i++){
                    let flyNode = cc.instantiate(wildani);
                    flyNode.active = true;
                    flyNode.parent = parentNode
                    flyNode.position = beiginPos;
                    promiseArr.push(new Promise((success)=>{
                        let startmoveaim = this.getFlyStartPos(i,cc.v2(beiginPos.x,tarPos.y));
                        cc.vv.gameData.playSpine(flyNode,'animation',false,null);
                            cc.tween(flyNode).bezierTo(0.5,cc.v2(beiginPos.x,beiginPos.y), cc.v2(startmoveaim.x,startmoveaim.y), cc.v2(tarPos.x,tarPos.y)).call(() => {
                                let starnode = cc.find('wildstar',flyNode);
                                cc.vv.gameData.playSpine(starnode,'animation',false,()=>{
                                    flyNode.destroy();
                                })
                                success();
                            }).start()
                    }));
                }
            }
        }
        if(promiseArr.length > 0){
            Global.playHSEffect('wild_fly');
        }
        await Promise.all(promiseArr);
        if(promiseArr.length > 0){
            let spnode = cc.find('fullspine',bgspinenode);
            cc.vv.gameData.playSpine(spnode,'animation2',false,null);
        }
    },



    //获取金币飞开始位置
    getFlyStartPos(i,movepos){
        let pos;
        switch (i) {
            case 0:pos = cc.v2(-50,0);break;
            case 1:pos = cc.v2(-100,150);break;
            case 2:pos = cc.v2(-200,50);break;
            case 3:pos = cc.v2(50,0);break;
            case 4:pos = cc.v2(100,150);break;
            case 5:pos = cc.v2(200,50);break;
        }
        return cc.v2(movepos.x+pos.x,movepos.y+pos.y);
    },

    //获取金币飞结束位置
    getFlyEndPos(idx,endpos){
        return cc.v2(endpos.x+idx*30,endpos.y);
    },

    //收集免费游戏wild
    showCollectFreeWild(){
        let collectfree = cc.vv.gameData.getCollectFree();
        if(collectfree){
            //固定wild
            if(collectfree.stickyWilds.pos.length > 0){
                if(!this._stickywildspos){
                    this._stickywildspos = collectfree.stickyWilds.pos;
                    this.showStickyWilds(collectfree.stickyWilds);
                }
            }
            //随机wild
            if(collectfree.randomWilds.pos.length > 0){
                this.showMask(true);
                this.showRandomWilds(collectfree.randomWilds,collectfree.multiplerWilds);
            }
        }else{
            //this.clearWildShow();
        }
    },

    //随机wild显示蒙版
    showMask(isshow){
        cc.find("top_wild/mask",this.node).active = isshow;
    },

    //显示固定wild
    showStickyWilds(wilds){
        wilds.pos.forEach(element => {
            Global.playHSEffect('wild_out2');
            this.ShowWildSymbolTopAni(element);
        });
    },

    //显示随机wild
    showRandomWilds(wilds,mult){
        wilds.pos.forEach(element => {
            Global.playHSEffect('wild_out2');
            this.showRandomWildToTopAni(element,mult);
        });
    },

    //显示扩展wild
    showExpandingWild(colidx){
        let collectfree = cc.vv.gameData.getCollectFree();
        if(collectfree&&collectfree.expandingWild){
            collectfree.expandingWild.forEach(pos => {
                if(pos-1 == colidx){
                    Global.playHSEffect('wild_expand');
                    let sys = this._reels[colidx]._symbols
                    for(let j = 0; j < 4;j++){
                        if(sys[j].GetShowId() == 1){
                            //生成扩展符号
                            this.createExpandingWilds(colidx,j);
                            return;
                        }
                    }
                }
            });
            
        }
    },

    // //显示wild加倍
    // showMultiplerWilds(colidx){
    //     let collectfree = cc.vv.gameData.getCollectFree();
    //     if(collectfree&&collectfree.multiplerWilds > 0){
    //         let sys = this._reels[colidx]._symbols
    //         for(let j = 0; j < 4;j++){
    //             sys[j].setSymbolMulti(collectfree.multiplerWilds);
    //         }
    //     }
    // },

    //显示wild符号到top
    createExpandingWilds:function(col,initrow){
        let parNode = cc.find("top_wild",this.node)
        if(parNode){
            for(let row=0;row<4;row++){
                let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",row,col),parNode);
                if(!showNode){ //如果已经存在就直接显示
                    let wildsymbol = cc.find("collectfreewild",parNode);
                    showNode = cc.instantiate(wildsymbol)
                    showNode.parent = parNode
                    showNode.name = cc.js.formatStr("top_symbol_%s_%s",row,col)
                }
                if(!showNode.active){
                    showNode.active = true;
                    showNode.position = this.getWildPos(col,initrow);
                    let aimpos = this.getWildPos(col,row);
                    cc.tween(showNode).to(0.5,{position:aimpos}).call(()=>{
                        //整列出现wild隐藏reel
                        this._reels[col].node.active = false;
                    }).start();
                }
            }
        }
    },

    //显示随机wild到顶部(需要播放animation1/animation3)
    showRandomWildToTopAni(idx,mult){
        let col = (idx - 1)%5;
        let row = 4 - Math.floor((idx-1)/5)-1;
        let parNode = cc.find("top_wild",this.node)
        if(parNode){
            let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",row,col),parNode);
            if(!showNode){ //如果已经存在就直接显示
                let multname = mult?"multwild":"collectfreewild";
                let wildsymbol = cc.find(multname,parNode);
                showNode = cc.instantiate(wildsymbol)
                showNode.parent = parNode
                showNode.name = cc.js.formatStr("top_symbol_%s_%s",row,col)
                showNode.position = this.getWildPos(col,row);
            }
            showNode.active = true;
            if(mult){
                cc.vv.gameData.playSpine(showNode,cc.js.formatStr("animation%s_2",mult),false,()=>{
                    cc.vv.gameData.playSpine(showNode,cc.js.formatStr("animation%s_3",mult),true,null);
                });
            }else{
                cc.vv.gameData.playSpine(showNode,'animation1',false,()=>{
                    cc.vv.gameData.playSpine(showNode,'animation3',true,null);
                });
            }
        }
    },

    //显示wild符号到top
    ShowWildSymbolTopAni:function(idx){
        let col = (idx - 1)%5;
        let row = 4 - Math.floor((idx-1)/5)-1;
        let parNode = cc.find("top_wild",this.node)
        if(parNode){
            let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",row,col),parNode);
            if(!showNode){ //如果已经存在就直接显示
                let wildsymbol = cc.find("collectfreewild",parNode);
                showNode = cc.instantiate(wildsymbol)
                showNode.parent = parNode
                showNode.name = cc.js.formatStr("top_symbol_%s_%s",row,col)
                showNode.position = this.getWildPos(col,row);
            }
            showNode.active = true;
            showNode.getComponent(sp.Skeleton).setAnimation(0,'animation1',false);
        }
    },

    //显示wild中奖线路
    showWildWinTrace(){
        //中奖位置
        let parNode = cc.find("top_wild",this.node)
        for(let i = 0; i < this._gameInfo.zjLuXian.length; i++){
            let item = this._gameInfo.zjLuXian[i]
            for(let idx = 0; idx < 4; idx++){
                let itemidx = item.indexs[idx];
                let col = (itemidx - 1)%5;
                let row = 4 - Math.floor((itemidx-1)/5)-1;
                let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",row,col),parNode);
                if(showNode&&showNode.active){
                    //播放中奖spine
                    let mult = this._gameInfo.collectFree.multiplerWilds;
                    if(mult){
                        showNode.getComponent(sp.Skeleton).setAnimation(0,'animation'+mult,true);
                    }else{
                        showNode.getComponent(sp.Skeleton).setAnimation(0,'animation2',true);
                    }
                }

            }
        }
    },

    //强制隐藏金字塔数字符号
    hideCollectNum(){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                sys[j].hideCollectNum();
            }
        }
    },

    //显示单列收集的金字塔
    showCollectNum(colidx,info){
        for(let key in info){
            let idx = parseInt(key.replace('idx_',''));
            let col = (idx - 1)%5;
            let row = 4 - Math.floor((idx-1)/5)-1;
            if(col == colidx){
                let sys = this._reels[col]._symbols
                sys[row].showCollectNum(info[key]);
            }
        }
    },

    //播放scatter动画
    playScatterAnimation(isplay){
        Global.playHSEffect('bell');
        //进入免费
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                sys[j].playScatterAnimation(isplay);
            }
        }
    },

    //关闭scatter动画
    resetScatterShow(){
        for(let i = 0; i < 5; i++){
            //显示reel
            this._reels[i].node.active = true;
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                sys[j].resetScatterShow();
            }
        }
        this.resetWildShow();
    },

    //复位wild显示
    resetWildShow(){
        let parNode = cc.find("top_wild",this.node)
        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 5;j++){
                let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",j,i),parNode);
                if(showNode&&showNode.active){
                     //固定wild 不清除
                     if(this._stickywildspos&&this._stickywildspos.length > 0){
                        let needreset = true;
                        let idx = this.getRowColToIdx(20,j,i);
                        //找到需要固定wild的位置 不清除 恢复默认动作
                        this._stickywildspos.forEach(element => {
                             if(element == idx){
                                 needreset = false;
                             }
                         });
                         if(needreset){
                            showNode.active = false;
                         }else{
                             //图标残留问题2021.1.9
                            cc.vv.gameData.playSpine(showNode,'animation3',false,null);
                         }
                    }else{
                        showNode.active = false;
                    }
                }
            }
        }
    },

    //复位wild显示
    clearWildShow(){
        let parNode = cc.find("top_wild",this.node)
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            this._reels[i].node.active = true;
            for(let j = 0; j < 5;j++){
                let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",j,i),parNode);
                if(showNode){
                     showNode.destroy();
                }
                sys[j].showNode();
            }
        }
    },

    async playBottomWin () {
        return new Promise((success)=>{
            let nWin = cc.vv.gameData.GetGameWin()
            let nTotal = nWin
            let updateAllCoin = true;
            if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
                nTotal = cc.vv.gameData.GetGameTotalFreeWin()
                updateAllCoin = false;
            }

            this.ShowBottomWin(nWin,nTotal,updateAllCoin,()=>{
                success();
            });

        });
    },

    rewardGamePlayBottomWin (wincoin,callback) {
        let nWin = cc.vv.gameData.GetGameWin()
        let nTotal = nWin+wincoin
        this.ShowBottomWin(nTotal,nTotal,true,()=>{
            callback();
        });
    },

    //获取位置
    getWildPos(col,row){
        return cc.v2(61+123*col,40.5+81*row);
    },

    //清除数据(单独清除收集里一直使用的数据)
    clearData(){
        this._stickywildspos = null;
    },

    getRowColToIdx:function(cardslen,nRow,nCol){
        let acRow = cardslen / this._col //考虑到变行，所以行可能有变化
        let idx = this._col * (acRow - nRow - 1) + nCol
        return idx+1;
    },

    //进入免费时需要重新刷新符号
    freeReUpdateSymbol:function(){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                sys[j].ShowRandomSymbol();
            }
        }
    },

    //进入免费备份符号状态
    backupSymbolState(){
        for(let i = 0; i < 5; i++){
            this._reels[i].Backup();
        }
    },

    //退出免费还原符号状态
    resumeSymbolState(){
        for(let i = 0; i < 5; i++){
            this._reels[i].Resume();
        }
    },

    //获取所有狮子节点数组
    getLionNodeArr(){
        let lionNodeArr = []
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                let symbol = sys[j]
                if(symbol._id == 14){
                    lionNodeArr.push(symbol)
                }
            }
        }
        return lionNodeArr
    },

    awaitTime (time) {
        return new Promise((success)=>{
            this.scheduleOnce(()=>{
                success()
            },time);
        });
    },
});
