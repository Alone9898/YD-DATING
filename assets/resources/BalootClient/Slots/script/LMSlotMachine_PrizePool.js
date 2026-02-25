
const UPDATE_INTERVAL = 0.1;
cc.Class({
    extends: cc.Component,

    properties: {
        _jackpotBase: 0,
        _jackpotNum: 0,
        _jackpotMax: 0,
        _updateTime: 0.1,
        _unlockBetNum: 0,
        // _jackpotLabel: { // 奖池整数
        //     default: null,
        //     type: cc.Label,
        // },
        jMult:{
            default:1,
            tooltip:'jackpt默认显示比例'
        },
        dataType:{
            default:0,
            tooltip:'-1随机,0 mini,1 minior,2 major,3 grand(mega)'
        },
        _bet: 10000,    //跟下注额关联
        _gameId: -1,
        _mult:1,            // 比列

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._jackpotLabel = cc.find("lbl_num", this.node).getComponent(cc.Label);

        //先取编辑器里的显示比例
        this._mult = this.jMult

        if(this._gameId == -1){
            this._gameId = cc.vv.AppData.getGameId();
        }

        if(cc.vv.gameData && this._gameId > 0 && cc.vv.gameData._EventId) { //游戏内
            this._bet = cc.vv.gameData.GetTotalBet();
            Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onEventTotalbetUpdated,this)
            let gameJackpot = cc.vv.gameData.getGameJackpot();
            if (gameJackpot && gameJackpot.unlock && this.dataType<gameJackpot.unlock.length) {
                this._unlockBetNum = gameJackpot.unlock[this.dataType];
            }
        }
        this.initData()

        Global.registerEvent(EventId.REFUSH_GAME_JP,this.onEventRefushJPData,this)

        this.updateJackPot();
    },

    start() {

    },

    GetPoolType(){
        return this.dataType
    },

    GetUnLockNum(){
        return this._unlockBetNum
    },

    // 奖池是否被锁定
    isLocked() {
        return this._bet < this._unlockBetNum;
    },

    // 只有大厅需要调用
    init(gameId, maxbet) {
        // this._jackpotNum = num;
        this._gameId = gameId;
        this._bet = maxbet;

        this.initData();
        this.updateJackPot();
    },

    // 押注额更新，只有游戏内
    onEventTotalbetUpdated(data,bInit) {
        this._bet = data.detail;
        let bInitCheck = bInit
        this.initData();
        if(this.isLocked() != this._bLock){
            this._bLock = this.isLocked()
            // 通知哪个奖池锁定
            //根据游戏自己去监听修改表现
            Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_JACKPOOL_LOCK_CHANGE,{poolIdx:this.dataType,val:this._bLock,unLockBet:this._unlockBetNum,bInit:bInitCheck})
        }
        
    },

    /**
     * 修改倍数
     * @param mult
     */
    setMult(mult) {
        this._mult = mult;
    },

    /**
     * 暂停将池滚动，并显示成pauseNum
     * @param {数字} pauseNum 
     */
    PausePrizePool(pauseNum){
        this._PauseNum = pauseNum;
        this._isPause = true;
        this.updateJackPot();
    },
    /**
     * 恢复奖池滚动
     */
    RestPrizePool(){
        this._PauseNum = null
        this._isPause = false;
    },

    initData(){
        this._jackpotBase = Math.floor((0.9+Math.random()*0.2)*100);
        let val = cc.vv.AppData.getGameJackpot(this._gameId)
        //val: 0:mini 1:minor 2:major 3:grand(mega) 4:self define
        if (this.dataType < val.length) {
            this._jackpotBase = val[this.dataType]
        }
        this._jackpotNum = this._bet * this._jackpotBase * (0.95+Math.random()*0.1);
        this._jackpotMax = this._jackpotNum * (1.05+Math.random()*0.05);
    },

    update(dt) {
        if (this._jackpotNum > 0 && !this._isPause) {
            this._updateTime += dt;
            if (this._updateTime < UPDATE_INTERVAL) return;
            this._updateTime = 0;

            let add = this._jackpotNum*(1+Math.random()*4)/10000;
            if (add > 10000000) add /= 2;
            this._jackpotNum += add;
            if (this._jackpotNum > this._jackpotMax) {
                this.initData();
            }
            this.updateJackPot();
        }
    },

    // 更新奖池
    updateJackPot() {
        if(this._jackpotLabel){
            if(this._PauseNum){
                //暂停的时候显示奖池固定值
                let str = Global.S2P(this._PauseNum*this._mult);
                this._jackpotLabel.string = Global.FormatNumToComma(str);
            }
            else{
                let str = Global.S2P(this._jackpotNum*this._mult);
                this._jackpotLabel.string = Global.FormatNumToComma(str);
            }
            
        }
    },

    onEventRefushJPData:function(){
        this.initData()
    },

    getJackpotLabel(){
        return this._jackpotLabel;
    },

});
