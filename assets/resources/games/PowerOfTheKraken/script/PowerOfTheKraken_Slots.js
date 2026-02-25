
cc.Class({
    extends: require('LMSlots_Slots_Base'),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    //断线重连的显示
    //可根据自己断线逻辑重写
    ReconnectShow:function(){

    },

    //点击旋转按钮调用
    async StartMove(){


        this._bStopRightnow = null
        this._gameInfo = null

        //top状态更新
        this._topScript.StartMove()

        //清理数据
        cc.vv.gameData.ClearOneRoundData()

        if(cc.vv.gameData.IsSuper()){
            let superFree = cc.vv.gameData.GetSuperFree();
            let curIdxs = superFree.stickyIdxs;
            let curItems = superFree.stickyItems;

            if(curIdxs.length > 0){
                for (let i = 0; i < curIdxs.length; i++){
                    let symbol = this.GetSymbolByIdx(curIdxs[i]);
                    this.setSymbolSfReserve(symbol, curIdxs[i]);
                }
                // await cc.vv.gameData.awaitTime(0.8);
            }
        }

        //每列转起来
        this.MoveReels(this._reels)

        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()

        Global.SlotsSoundMgr.playNormalBgm()
    },

    // 断线重连恢复superfree所有bonus图标
    setSymbolSfBack(idxs, items){
        let top_sf = cc.find("top_sf", this.node);

        let cfg = cc.vv.gameData.getGameCfg();
        for (let i = 0; i < idxs.length; i++){
            let symbol = this.GetSymbolByIdx(idxs[i]);
            let node = cc.instantiate(symbol.node);
            node.active = true;
            node.parent = top_sf;
            node.name = ""+idxs[i];
            node.scale = 0.5;
            node.getComponent(cfg.scripts.Symbols).ShowById(items[i].c==2||items[i].c==1 ? 3 : 4, items[i]);
            let sPos = top_sf.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0,0)));
            node.position = cc.v2(sPos.x+cfg.symbolSize.width/4, sPos.y-cfg.symbolSize.height/4);
        }
    },

    // 保存superfree中bonus图标
    setSymbolSfReserve(symbol,idx){
        let top_sf = cc.find("top_sf", this.node);

        if(top_sf.getChildByName(""+idx) && top_sf.getChildByName(""+idx).active){
            return;
        }
        let cfg = cc.vv.gameData.getGameCfg();
        let node = cc.instantiate(symbol.node);
        node.active = true;
        node.parent = top_sf;
        node.name = ""+idx;
        node.position = top_sf.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0,0)));
        node.getComponent(cfg.scripts.Symbols).playBonusIdleAni(false);
        let ePos = cc.v2(node.x+cfg.symbolSize.width/4, node.y-cfg.symbolSize.height/4);
        cc.tween(node)
            .to(0.5, {scale:0.5, position:ePos})
            .start()
    },

    // 恢复superfree所有bonus图标
    setSymbolSfResume(){
        let top_sf = cc.find("top_sf", this.node);

        let cfg = cc.vv.gameData.getGameCfg();
        for (let i = 0; i < top_sf.childrenCount; i++){
            let node = top_sf.children[i];
            let ePos = cc.v2(node.x-cfg.symbolSize.width/4, node.y+cfg.symbolSize.height/4);
            cc.tween(node)
                .to(0.5, {scale:1, position:ePos})
                .start()
        }
    },

    // 销毁superfree所有bonus图标
    setSymbolSfDestroy(){
        let top_sf = cc.find("top_sf", this.node);
        for (let i = 0; i < top_sf.childrenCount; i++) {
            let node = top_sf.children[i];
            node.destroy();
        }
    },

    //收到旋转结果
    //gameData模块收到数据后，转发到此处
    onMsgSpine:function(msg){

        // msg.resultCards = [2,4,2,14,15,6,7,8,14,4,6,10,8,10,15,5,10,3,3,3];
        this._super(msg)
        krakenMgr.onMsgSpine(msg);
    },


    SetSlotsResult:function(cards){

        //把结果按卷轴结果整理
        let acRow = cards.length / this._col
        let reelResults = []

        let bonusIdxs = this._gameInfo.bonusIdxs;
        let bonusItems = this._gameInfo.bonusItems;

        for(let i = 0;i < cards.length; i++){
            let row = Math.floor(i / acRow)
            let col = i % this._col
            //配置中有没有这个元素
            if(this._cfg.symbol[cards[i]]){
                let res = {}
                res.sid = cards[i] //符号id
                res.data = {}

                if(bonusIdxs && bonusIdxs.includes(i+1)){
                    res.data = bonusItems[bonusIdxs.indexOf(i+1)];
                }

                if(!reelResults[col]) reelResults[col] = []
                reelResults[col].unshift(res)
            }

        }

        for(let i = 0; i < this._reels.length; i++){
            let item = this._reels[i]
            let reelRes = reelResults[i]
            item.SetResult(reelRes)
        }
    },

    //设置reel旋转的状态；
    //是否加速框；
    //是否加速旋转
    //是否停止音效；
    //是否播放背景特效
    SetReelStateInfo:function(cards){
        if (!this._cfg.reelStateInfo) {
            return;
        }
        let reelResults = []
        for(let i = 0;i < cards.length; i++){
            let id = cards[i]
            let col = i % this._col
            if(!reelResults[col]) reelResults[col] = []
            reelResults[col].push(id)
        }

        for (let info of this._cfg.reelStateInfo) {
            let stateInfo = Global.copy(info);
            stateInfo.isStop = false
            stateInfo.isAnt = false

            let triggerCount = stateInfo.mini
            let countsConfig = Global.copy(stateInfo.counts);
            let haveCount = 0
            let isContinuous = true
            for(let i = 0; i < reelResults.length; i++){
                let item = this._reels[i]
                let reelRes = reelResults[i]
                stateInfo.isStop = false
                stateInfo.isAnt = false
                if (haveCount >= triggerCount-1 && stateInfo.counts[i] > 0 && isContinuous) {  //满足条件 需要播放加速框
                    stateInfo.isAnt = true
                }
                let reelCountOfID = reelRes.reduce((a, v) => stateInfo.id.includes(v) ? a + 1 : a + 0, 0);
                haveCount +=  reelCountOfID
                countsConfig.shift()
                let remainingCount = (countsConfig.length > 0 ? countsConfig.reduce((x,y)=>x+y):0) + haveCount
                if (reelCountOfID > 0 /*&& remainingCount >= triggerCount && isContinuous*/) {  //满足条件 播放停止动画和停止音效
                    stateInfo.isStop = true
                }
                if (stateInfo.continuous && stateInfo.counts[i] > 0 && reelCountOfID == 0) {
                    isContinuous = false
                }
                item.AddReelStateInfo(Global.copy(stateInfo))
            }
        }
    },

    //回弹动作之后
    OnReelBounsActionEnd:function(colIdx){
        for(let row = 0; row < this._row; row++){
            let sym = this._reels[colIdx].GetSymbolByRow(row);
            if(sym.GetShowId() === 1){  // wild
                let idx = (this._row-row-1)*5 + colIdx+1;
                krakenMgr.playWildSjAnim(sym.node.convertToWorldSpaceAR(cc.v2(0,0)), idx);
            }
        }
    },

    OnSpinEnd(){
        krakenMgr.OnSpinEnd();
    },

    // update (dt) {},
});
