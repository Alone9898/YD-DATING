
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._super();

        this._node_random = cc.find("node_random", this.node);
        this._node_random.active = false;
    },

    ReconnectShow(){},

    StartMove(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusScript().StartMove();
        } else {
            this._super();

            Global.SlotsSoundMgr.playNormalBgm();
        }
    },

    StopMove(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusScript().StopMove();
        } else {
            this._super();
        }
    },

    onMsgSpine(msg) {
        this._super(msg);

        // 随机游戏
        let isTriFree = this._gameInfo.freeResult.freeInfo && this._gameInfo.freeResult.freeInfo.freeCnt > 0;
        let isTriBonus = this._gameInfo.bonusGame;
        if (Math.random() < 0.25 && (isTriFree || isTriBonus)) {
            this.SetStopTime(3);

            this.triggerRandomGame(isTriFree);
        }
    },

    OnSpinEnd(){},


    SetSlotsResult:function(cards){
        let bonusItems = this._gameInfo.bonusItems;
        let data = [];
        bonusItems.forEach(item=>{
            data[item.idx-1] = Global.copy(item);
        });

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
                res.data = data[i];
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

    //显示中奖路线
    //竞品中的显示线路是：先总，后单条循环。目前我们只显示总的
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
                symbol.ShowKuang()
            }
        }


    },

    async triggerRandomGame(isTriFree){
        if(isTriFree){
            Global.SlotsSoundMgr.playEffect("music_MagicLady_showTriggerEffect1");
        }else {
            Global.SlotsSoundMgr.playEffect("music_MagicLady_showTriggerEffect0");
        }

        this._node_random.active = true;

        await cc.vv.gameData.awaitTime(3);
        this._node_random.active = false;
    },


    // update (dt) {},
});
