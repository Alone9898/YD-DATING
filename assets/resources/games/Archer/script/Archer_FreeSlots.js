
cc.Class({
    extends: require('LMSlots_Slots_Base'),

    properties: {
        _kuangList:[],  //框框
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    //初始化
    Init:function(){
        this._node_free = this.node;//cc.find("safe_node/slots_free", this.node);
        // this._node_free.active = false;

        this._topScript = cc.vv.gameData.GetTopScript()
        this._bottomScript = cc.vv.gameData.GetBottomScript()

        this._cfg = cc.vv.gameData.getGameCfg()
        this._col = 5
        this._row = 9

        this._topAniNode = cc.find("top_ani",this._node_free)
        this._topKuangNode = cc.find("top_kuang_ani",this._node_free)
        this.createReels(this._col,this._row)

        // this._bottomScript.ShowBtnsByState("idle")

        // this.RegisterEvent()

        //断线重连的显示
        // this.ReconnectShow()

        //初始化奖池
        // this.CheckJoopLock()
    },

    //创建卷轴
    createReels:function(col,row){
        let reeel1 = cc.find("reels/reel1", this._node_free);
        let reel1Scp =  reeel1.addComponent("Archer_FreeReel");
        reel1Scp.Init(1, row, this._topAniNode, false);
        this._reels.push(reel1Scp);

        let reel6 = cc.find("reels/reel6", this._node_free);
        let reel6Scp = reel6.addComponent("Archer_FreeReel");
        reel6Scp.Init(2, 3, this._topAniNode, true);
        this._reels.push(reel6Scp);

        let reeel5 = cc.find("reels/reel5", this._node_free);
        let reel5Scp =  reeel5.addComponent("Archer_FreeReel");
        reel5Scp.Init(3, row, this._topAniNode, false);
        this._reels.push(reel5Scp);
    },

    //点击旋转按钮调用
    StartMove:function(){
        this._bStopRightnow = null
        this._gameInfo = null
        this.hideKuang();

        //top状态更新
        this._topScript.StartMove()

        //清理数据
        cc.vv.gameData.ClearOneRoundData()

        //每列转起来
        this.MoveReels(this._reels)

        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()
    },

    //点击停止按钮调用
    StopMove:function(){
        this._bStopRightnow = true
        this._bottomScript.ShowBtnsByState("moveing_1")

        this._stopTime = -1
        for(let i = 0; i < this._reels.length; i++ ){
            let item = this._reels[i]
            let reelStopInterv = 0 //立即停止
            item.StopMove(reelStopInterv)
            item.StopMoveRightNow()
        }
    },

    //收到旋转结果
    //gameData模块收到数据后，转发到此处
    onMsgSpine:function(msg){
        // cc.log(msg)

        this._gameInfo = msg
        let cards = msg.resultCards
        this.SetSlotsResult(cards)
        // this.SetReelStateInfo(cards)

    },

    SetSlotsResult:function(cards){
        //把结果按卷轴结果整理

        let acRow = cards.length / this._col
        let reelResults = []
        for(let i = 0;i < cards.length; i++){
            let row = Math.floor(i / acRow)
            let col = i % this._col
            //配置中有没有这个元素
            if(this._cfg.symbol[cards[i]]){
                let res = {}
                res.sid = cards[i] //符号id
                if(!reelResults[col]) reelResults[col] = []
                reelResults[col].unshift(res)
            }

        }
        this._reels[0].SetResult(reelResults[0])
        this._reels[1].SetResult([reelResults[1][0],reelResults[1][3],reelResults[1][6]])
        this._reels[2].SetResult(reelResults[4])
    },

    async OnSpinEnd(){
        // 显示中奖路线
        this.ShowWinTrace()
        // 显示底部赢钱
        let nWin = cc.vv.gameData.GetGameWin()
        let nTotal = cc.vv.gameData.getFreeWinCoin();
        await new Promise((sucess, failed)=>{
            this.ShowBottomWin(nWin,nTotal,false,sucess)
        });
    },

    ShowWinTrace:function(){
        let allWinIdx = []

        //中奖位置
        for(let i = 0; i < this._gameInfo.zjLuXian.length; i++){
            let item = this._gameInfo.zjLuXian[i]
            for(let idx = 0; idx < item.indexs.length; idx++){
                allWinIdx[item.indexs[idx]] = 1
            }
        }
        // if(this._gameInfo.scatterZJLuXian && this._gameInfo.scatterZJLuXian.indexs){
        //     for(let i = 0; i < this._gameInfo.scatterZJLuXian.indexs.length; i++){
        //         let val = this._gameInfo.scatterZJLuXian.indexs[i]
        //         allWinIdx[val] = 1
        //     }
        // }

        //总
        for (const key in allWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol){
                symbol.playWinAnimation()
                this.showKuangByIdx(Number(key))
            }
        }
    },


    //根据服务端序号获取本地的symbol
    GetSymbolByIdx:function(idx){
        let col = (idx - 1) % this._col //考虑到变行，所以行可能有变化
        let row = this._row - Math.floor((idx -1)/this._col) -1
        // return this._reels[col].GetSymbolByRow(row)

        if(col==0){
            return this._reels[col].GetSymbolByRow(row)
        }else if(col > 0 && col < 4){
            return this._reels[1].GetSymbolByRow(Math.floor(row/3))
        }else{
            return this._reels[2].GetSymbolByRow(row)
        }
    },

    hideKuang(){
        this._kuangList.forEach(kuang=>{
            kuang.active = false;
        })
    },

    showKuangByIdx(idx){
        let kuangWorldPos = this.getKuangPosByIdx(idx);
        if(this._cfg.kuang){
            if(!this._kuangList[idx]){
                let kuangPrefab = cc.vv.gameData.GetPrefabByName(this._cfg.kuang);
                let kuang = cc.instantiate(kuangPrefab);
                kuang.zIndex = idx + 100;
                kuang.parent = this._topKuangNode;
                kuang.position = this._topKuangNode.convertToNodeSpaceAR(kuangWorldPos);
                this._kuangList[idx] = kuang;
            }

            this._kuangList[idx].active = true;
        }
    },


    getKuangPosByIdx(idx){
        let col = (idx - 1) % this._col;
        let row = this._row - Math.floor((idx -1)/this._col) -1;

        let s_pos = cc.find("reels/s_pos", this._node_free);

        let offsetX = (col+0.5)*this._cfg.symbolSize.width;
        let offsetY = (row+0.5)*this._cfg.symbolSize.height;

        return s_pos.convertToWorldSpaceAR(cc.v2(offsetX, offsetY));
    },


    enterFreeGame(){
        Global.SlotsSoundMgr.playBgm("music_MagicLady_FreespinBG");

        this.hideKuang();
        for (let i = 0; i < this._col*this._row; i++){
            let symbol = this.GetSymbolByIdx(i+1);
            symbol.ClearState();
        }
    },

    exitFreeGame(){
        Global.SlotsSoundMgr.stopBgm();

        this.hideKuang();
        for (let i = 0; i < this._col*this._row; i++){
            let symbol = this.GetSymbolByIdx(i+1);
            symbol.ClearState();
        }
    },

    // update (dt) {},
});
