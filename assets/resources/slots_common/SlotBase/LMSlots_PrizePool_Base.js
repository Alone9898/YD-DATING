/**
 * 奖池解锁相关逻辑
 * 将此组建挂载到奖池总的节点上
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _poolList:null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_JACKPOOL_LOCK_CHANGE,this.OnEventJackPoolLockChange,this)

        this.InItPoolList()
    },

    start () {
        this.CheckJoopLock(true)
    },

    //初始化所以奖池
    InItPoolList:function(){
        this._poolList = this.node.getComponentsInChildren("LMSlotMachine_PrizePool");
        for(let i = 0; i < this._poolList.length; i++){
            let item = this._poolList[i].node
            let btn = item.getComponent(cc.Button)
            if(!btn){
                btn = item.addComponent(cc.Button)
            }
            Global.btnClickEvent(item,this._OnClickPool,this)
        }
    },

    GetPoolList:function(){
        return this._poolList
    },

    //点击奖池
    _OnClickPool:function(event){
        let target = event.node.getComponent("LMSlotMachine_PrizePool")
        if(target){
            if(target.isLocked() && this.isCanClickJP()){//当前是锁的状态
                this.OnClickUnLookPoolItem(target.GetPoolType(),target.GetUnLockNum())
            }
            
        }
    },

    //根据奖池类型，获取奖池节点
    _GetPoolNodeByType:function(poolType){
        let tar = null
        let datas = this.GetPoolList()
        for(let i = 0; i < datas.length; i++){
            if(datas[i].GetPoolType() == poolType){
                tar = datas[i].node
                break
            }
        }
        return tar
    },


    

    //初始化检查奖池状态
    CheckJoopLock:function(bInit){
        let curBet = cc.vv.gameData.GetTotalBet()
        let jpNodes = this.GetPoolList()
        for(let i = 0; i < jpNodes.length; i++){
            let item = jpNodes[i]
            item.onEventTotalbetUpdated({detail:curBet},bInit)
        }
    },

    //点击某个奖池
    OnClickUnLookPoolItem:function(poolType,unLockBet){
        
        // 设置当前押注额
        let unLockLv = cc.vv.gameData.BetToIdx(unLockBet)
        if(unLockLv){
            let bottom = cc.vv.gameData.GetBottomScript()
            bottom.SetBetIdx(unLockLv)
        }
        
    },

    //奖池锁的状态改变通知
    //{poolIdx:奖池类型,val:是否锁定true/false,unLockBet:解锁押注额,bInit:是否是进入游戏的时候调用的}
    OnEventJackPoolLockChange:function(param){
        let data = param.detail
        let poolType = data.poolIdx
        let lock = data.val
        let unLockBet = data.unLockBet
        let bInit = data.bInit
        let tarNode = this._GetPoolNodeByType(poolType)

        this.ShowNodeLockByNode(tarNode,lock,unLockBet,poolType,bInit)
    },

    //是否可以点击奖池
    //免费游戏，和小游戏中,旋转状态。可能不能点击
    isCanClickJP:function(){
        let res = true
        let bFree = cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() > 0
        if(bFree){
            res = false
        }
        //旋转状态
        let bottomScript = cc.vv.gameData.GetBottomScript()
        if(bottomScript){
            if(!bottomScript.GetSpinBtnState()){
                res = false
            }
        }
        return res
    },

    //暂停奖池显示
    //pauseDatas:[{prizeType:val,pauseNum:val}...]
    PausePool:function(pauseDatas){
        this._poolList = this.node.getComponentsInChildren("LMSlotMachine_PrizePool");
        for(let i = 0; i < this._poolList.length; i++){
            let poolType = this._poolList[i].GetPoolType()
            for(let kIdx = 0; kIdx < pauseDatas.length; kIdx++){
                if(poolType == pauseDatas[kIdx].prizeType){
                    this._poolList[i].PausePrizePool(pauseDatas[kIdx].pauseNum)
                }
            }
        }
    },
    //恢复暂停
    ResumePausePool:function(){
        this._poolList = this.node.getComponentsInChildren("LMSlotMachine_PrizePool");
        for(let i = 0; i < this._poolList.length; i++){
            this._poolList[i].RestPrizePool()
        }
    },

    //各个节点上的解锁/锁定表现
    //bInit:是否是初始化阶段调用
    ShowNodeLockByNode:function(node,bLock,unLockBet,poolType,bInit){
        cc.log('补充奖池解锁表现')
    }

    // update (dt) {},
});
