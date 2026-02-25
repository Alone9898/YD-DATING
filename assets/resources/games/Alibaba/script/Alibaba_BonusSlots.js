
cc.Class({
    extends: require('LMSlots_Slots_Base'),

    properties: {
        _slotsIndex:1
    },

    onLoad() {
        this._super();

    },

    start () {

    },

    Init:function(type){
        this._slotsIndex = type;

        this._topScript = cc.vv.gameData.GetTopScript()
        this._bottomScript = cc.vv.gameData.GetBottomScript()

        this._cfg = cc.vv.gameData.getGameCfg()
        this._col = 15;
        this._row = 1;

        this._topAniNode = cc.find("top_ani",this.node)

        this.createReels(this._col,this._row)
    },

     //创建卷轴
     createReels:function(col,row){
        for (let i = 0; i < col; i++) {
            let node = cc.find("reels/reel" + (i+1),this.node)
            let scp = node.addComponent('Alibaba_BonusReel')
            scp.Init(i,row,this._topAniNode)
            scp.initReelType(this._slotsIndex);
            this._reels.push(scp)
        }
    },

      //重写 每列停止时间间隔 = 每列的停止间隔 + 每列的回弹时间
    //reelIdx:0开始
    GetReelStopInter:function(reelIdx){
        let nIter = this._cfg.reelStopInter || 0.6
        return (reelIdx%5 + 5 * (this._slotsIndex-1)) *nIter;
    },

    //重写spin end
    OnSpinEnd:function(){

    },

    //获取reel节点
    getReelNode(reelidx){
        if(reelidx >= this._reels.length)
            return null;
        return this._reels[reelidx].node;
    },

    //点击旋转按钮调用
    StartMove:function(bonusIdxs){
        this._bStopRightnow = null
        this._gameInfo = null

        //每列转起来
        let reels = [];
        let reelIdxs = [];
        this._reels.forEach(reel=>{
            if(!bonusIdxs.includes(reel.GetReelIdx()+1)){
                reels.push(reel)
                reelIdxs.push(reel.GetReelIdx())
            }
        })
        this.MoveReels(reels)
        this.setMoveLastIdx(reelIdxs);

        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()
    },

    //实际旋转起来的列，有时候需要1，2，4列转，
    //即最后停止下来的不是最后一列的序号，所以需要记录最后一列的序号
    //arry=[this._reels[0],this._reels[1],this._reels[4]]
    MoveReels:function(arry){
        // this.moveReelLastIdx = -1
        for(let i = 0; i < arry.length; i++){
            let item = arry[i]
            item.StartMove()
            // let idx = item.GetReelIdx()
            // if(idx> this.moveReelLastIdx){
            //     this.moveReelLastIdx = idx
            // }
        }
    },

    setMoveLastIdx(reelIdxs){
        cc.log(reelIdxs);
        let max = null;
        let reelMax= [];
        reelIdxs.forEach(idx=>{
            if(idx%5 > max%5 || (idx%5 === max%5 && idx/3 > max/3)){
                max = idx;
            }

            reelMax[idx%5] = reelMax[idx%5] ? Math.max(reelMax[idx%5], idx) : idx;
        });
        cc.log(reelMax);
        this.moveReelLastIdx = max;
        cc.log("StartMove：this.moveReelLastIdx:",this.moveReelLastIdx);
        this._reelMax = reelMax;
    },


    // 获取一竖排中最后的那个列
    getLastStopReel(){
        return this._reelMax
    },

    //设置旋转结果
    setSpinResult(bonusIdxs, bonusItems){
        let cfg = cc.vv.gameData.getGameCfg()
        let cards = [];
        for(let i = 1; i <= 15; i++){
            let randIdx = Global.random(1, cfg.bonusRandomSymbols.length)
            let randVal = cfg.bonusRandomSymbols[randIdx-1]
            cards.push(randVal)
        }

        this.SetSlotsResult(cards, bonusIdxs, bonusItems);
    },


    SetSlotsResult:function(cards, bonusIdxs, bonusItems){
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
                res.data = {}

                if(bonusIdxs && bonusIdxs.includes(i+1)){
                    res.sid = 3;
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


    CanStopSlot(){
        return cc.vv.gameData.getBonusGameMgr().getSubGameData()!=null;
    },

    getSlotsIndex(){
        return this._slotsIndex;
    },

    getReel(col){
        return this._reels[col]
    },

    // 设置所有节点为空节点
    initAllSymbol(){
        for (let col = 0; col < this._col; col++){
            this._reels[col].GetSymbolByRow(0).ShowById(14);
        }
    },
});
