import PBLogic from "../../PokerBase/scripts/PBLogic";
import BlackJack21GameData from "./BlackJack21_GameData";
import BlackJack21Operate from "./BlackJack21_Operate";
import BlackJack21CardPool from "./card/BlackJack21_CardPool";
import BlackJack21PlayersCtrl from "./player/BlackJack21_PlayersCtrl";
import {BlackJack21PlayerState, BlackJack21TableState} from "./BlackJack21_CommonData";
import BlackJack21Banker from "./player/BlackJack21_Banker";
import BlackJack21SoundCtrl from "./sound/BlackJack21_SoundCtrl";
import Table_CountDown from "../../../Table_Common/TableBase/Table_CountDown";
import {PromiseLock} from "../../../../BalootClient/game_common/PromiseLock";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21Logic extends PBLogic {
    dm: BlackJack21GameData;     // 数据控制器
    operate: BlackJack21Operate;
    cardPoolCtrl: BlackJack21CardPool;
    playersCtrl: BlackJack21PlayersCtrl;
    bankerCtrl: BlackJack21Banker;
    soundMgr: BlackJack21SoundCtrl;   // 音效管理器
    countDown: Table_CountDown;

    minBet:null;
    maxBet:null;
    listBet:[];
    aborts: Function[] = [];

    loadCtrl(){
        super.loadCtrl();
        this.cardPoolCtrl = cc.find("cards_pool", this.panel).getComponent("BlackJack21_CardPool")
        this.bankerCtrl = this.panel.addComponent("BlackJack21_Banker");
        this.countDown = this.loadCountdown();

        let soundcmp = this.panel.addComponent("Table_Sound");
        // console.log(soundcmp);

        Global.btnClickEvent(cc.find("tableinfo", this.panel),function () {
            cc.vv.PopupManager.addPopup("games/BlackJack21/prefab/table_info",{
                onShow: (node) => {
                    node.getComponent("BlackJack21_Tableinfo").init();
                }
            })
        },this);
    }

    start() {
        // this.cleanRound();
        this.dm.msgHandler.run();
        cc.vv.NetManager.send({ c: 4 });
    }

    reset() {
        this.dm.reset();
        this.dm.msgHandler.clearMsgQueue();
        this.playersCtrl.cleanRound();
    }

    reconnectInGameReset() {
        this.dm.msgHandler.clearMsgQueue();
        this.dm.clearRound();
        this.dm.reset();
    }

    /**
     * 通用按钮操作
     */
    loadOperate() {
        let operateNode = cc.find("operate", this.panel);
        if (operateNode) {
            return operateNode.getComponent(BlackJack21Operate);
        } else {
            return null;
        }
    }

    /**
     * 音效播放组件
     */
    loadSoundCtrl() {
        return this.panel.addComponent(BlackJack21SoundCtrl);
    }

    /**
     * 背景控制组件
     */
    loadBgCtrl() {
        return null;//cc.find("bg_node", this.panel).getComponent(PBBgCtrl);
    }

    /**
     * 玩家控制组件
     */
    loadPlayersCtrl() {
        return this.panel.addComponent(BlackJack21PlayersCtrl);
    }

    /**
     * 加载倒计时
     */
    loadCountdown() {
        let node = cc.find("table_count_down", this.panel);
        if (node) {
            return node.getComponent("Table_CountDown");
        } else {
            return null;
        }
    }

    /**
     * 场景销毁时清理资源
     */
    onDestroy() {
        console.log("======**==  onDestroy")
        // window.facade = null;
        // facade = null;
        // this.dm.msgHandler && this.dm.msgHandler.clear();
        // // this.dm = null;
        // cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        // cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    /**
     * 返回大厅
     */
    gotoHall() {
        // 判断是不是H5版本
        if (cc.vv.LoginData) {
            window["toBack"] && window["toBack"]();
            return;
        }
        this.reset();
        if (Global.isSingle()) {
            PromiseLock.resetLock();
            cc.director.preloadScene(Global.SCENE_NAME.HALL, (err, data) => {
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL, (err, data) => { });
            });
            return;
        }
        PromiseLock.resetLock();
        // 停止大阶段 定时器

        let infoChangeCpt = cc.director.getScene().getComponentInChildren("PBSettlementInfoChange");
        if (infoChangeCpt) {
            infoChangeCpt.clear();
        }
        // cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD, null, Global.APP_ORIENTATION);
        cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/SceneTranslate", {
            noMask: true,
            noCloseHit: true,
            onShow: (node) => {
                node.getComponent("SceneTranslate").toHall();
            }
        })
        // if(cc.vv.gameData){
        //     cc.vv.gameData.clear();
        // }

    }

    onGameHide(){
        super.onGameHide();
        this.dm.msgHandler.stop();
    }

    onGameShow(){
        super.onGameHide();
        this.dm.msgHandler.run();
    }

    cleanRound(){
        this.dm.betcoin = 0;

        this.cardPoolCtrl.cleanRound();
        this.playersCtrl.cleanRound();
        this.bankerCtrl.cleanRound();
        this.operate.cleanRound();

        for (const abortFunc of this.aborts) {
            try {
                abortFunc();
            }catch(error){
                cc.log(error);
            }
        }

        this.countDown.hide();
        this._showMathUIAni(false);
    }

    /**
     * 桌面显示最低押注
     * @param minbet
     */
    showMinBet(minbet){
        let lbl = cc.find("zhuozi/betMin/lbl", this.panel).getComponent(cc.Label);
        lbl.string = `Ante:${minbet}`;
    }

    /**
     * 进入房间
     */
    async enterTable() {
        this.scheduleOnce(async () => {
            this.cleanRound();
            this.dm.msgHandler.startPlayCmd();
            this.minBet = this.dm.deskInfo.minBet;
            this.maxBet = this.dm.deskInfo.maxBet;
            this.listBet = this.dm.deskInfo.fixedBets;
            this.operate.setBtnCnt(this.minBet, this.maxBet, this.listBet);
            this.showMinBet(this.dm.deskInfo.minBet);

            let tableStatus = this.dm.tableStatus;
            this.playersCtrl.setChair(this.dm.playersDm.chair);

            let isReconnect = (this.dm.deskInfo.deskFlag == 1 || this.dm.deskInfo.isReconnect)
            this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);
            this.playersCtrl.updateCoin();
            let selfInfo = this.dm.playersDm.selfAbsInfo;
            if (isReconnect) {
                if (selfInfo.autoHost) {
                    this.autoHost.show();
                }

                let roundInfo = this.dm.deskInfo.round;
                if(roundInfo){
                    if(roundInfo.bankercard){
                        this.bankerCtrl.handCardCtrl.cardData = [roundInfo.bankercard]
                    }
                }
                let players = this.dm.playersDm.getPlayesInfo();
                players.forEach((info=>{
                    let player = this.playersCtrl.getPlayerBySeat(info.seatId);
                    let isSelf = this.dm.playersDm.isSelfBySeat(info.seatId);
                    if(info.round){
                        player.showSeatId(info.round.order);
                        player.betCoin = info.round.betcoin[0];
                        player.bSplit = info.round.handcard[1] && info.round.handcard[1].length > 0;
                        // player.handCardCtrl.cardData = info.round.handcard;
                        player.handCardCtrl.cardData = info.round.handcard;
                        player.handCardCtrl.cardType = info.round.cardtype;
                        player.jettonCtrl.reconnectJetton(info.round.betcoin);
                        // player.isOpr = false;

                        if(isSelf){
                            this.dm.betcoin = info.round.betcoin;
                        }
                    }

                    if(selfInfo.state == BlackJack21PlayerState.Wait && !isSelf){    // 自己在观战或者游戏还没开始
                        player.hideAvatarName(true);
                        player.showWather(true);
                        player.showSeatId(false);
                    } else {
                        player.hideAvatarName(false);
                        player.showWather(false);
                    }
                }))

                // 非好友房，自己是观战玩家，需要显示观战按钮
                if(!this.dm.tableInfo.needSelfReady() && selfInfo.state == BlackJack21PlayerState.Wait){
                    this.operate.showChangeBtn(true);
                }

                if(tableStatus.currState !== BlackJack21TableState.MATCH && selfInfo.state == BlackJack21PlayerState.Wait){
                    this.operate.showWatchTips(true);
                }

                let delayTime = Math.floor(roundInfo.delayTime);
                switch (tableStatus.currState) {
                    case BlackJack21TableState.MATCH:
                        if(this.dm.tableInfo.needSelfReady()){
                            // if(selfInfo.state == BlackJack21PlayerState.Wait) {
                                this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                                this.operate.showInvite(true);
                                this.operate.showTableCode(true);
                            // }
                        } else {
                            if(this.dm.deskInfo.waitTime > 0){
                                this._showMathUIAni(true, this.dm.deskInfo.waitTime)
                            }
                            this.operate.showChangeBtn(true);
                        }

                        break
                    case BlackJack21TableState.READY:
                        break
                    case BlackJack21TableState.PLAY: // 玩牌阶段
                        this.playersCtrl.hideAllEmptySeat();
                        players.forEach((info=>{
                            let state = info.state;
                            if(state ==  BlackJack21PlayerState.Play){
                                this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(info.seatId).position, delayTime);
                            }
                        }))

                        if(selfInfo.state == BlackJack21PlayerState.Play){
                            this.operate.updateOprView(selfInfo.state,delayTime,false);
                            // this.setOperateBtnByState(selfInfo.state, this.dm.deskInfo.delayTime, false);
                        }
                        break
                    case BlackJack21TableState.BET: // 下注阶段
                        this.playersCtrl.hideAllEmptySeat();
                        players.forEach((info=>{
                            let state = info.state;
                            if(state ==  BlackJack21PlayerState.Bet){
                                this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(info.seatId).position, delayTime, false);
                            }
                        }))

                        if(selfInfo.state == BlackJack21PlayerState.Bet){
                            this.operate.updateOprView(selfInfo.state, delayTime, false);
                        }
                        break
                    case BlackJack21TableState.INSURANCE:
                        this.playersCtrl.hideAllEmptySeat();
                        players.forEach((info=>{
                            let state = info.state;
                            if(state ==  BlackJack21PlayerState.Insurance){
                                this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(info.seatId).position, delayTime);
                            }
                        }))

                        if(selfInfo.state == BlackJack21PlayerState.Insurance){
                            this.operate.updateOprView(selfInfo.state, delayTime, false);
                        }

                        break
                    case BlackJack21TableState.SETTLE:
                        break
                }
            }
            else {
                if(this.dm.tableInfo.needSelfReady()){
                    if(tableStatus.currState == BlackJack21TableState.MATCH) {
                        this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                        this.operate.showInvite(true);
                        this.operate.showTableCode(true);
                    }
                } else {
                    if (this.dm.deskInfo.waitTime > 0) {
                        this._showMathUIAni(true,this.dm.deskInfo.waitTime)
                    }
                    this.operate.showChangeBtn(true);
                }
            }

            this.changeSkin();
            // 开始播放命令
            this.scheduleOnce(() => {
                this.dm.msgHandler.startPlayCmd();
            }, 0.5)
        })
    }

    // 换桌
    changeTable(){
        // this.playersCtrl.players

        for (let i = 1; i <= 4; i++){
            this.playersCtrl.standUp(i)
        }
        this.operate.showChangeBtn(false);
        this.cleanRound();
    }


    // 重连和进入场景后调用(非重新)
    enterTableLater() {
        // // 更新所有语聊组件
        // this.scheduleOnce(() => {
        //     this.voiceCtrl.updateAll();
        // })
    }

    async otherPlayerEnter(dic: any){

        if (dic.code === 200 && !dic.spcode) {
            let uinfo = dic.user;
            let p = this.dm.playersDm.getPlayerByUid(uinfo.uid);
            if (!p) {
                let uvo = this.dm.parseAPlayer(uinfo);
                this.dm.playersDm.seat(uvo);
                this.playersCtrl.seat(uvo);
            }

            let player = this.playersCtrl.getPlayerByUid(uinfo.uid);
            if(player){
                player.hideAvatarName(true);
                player.showWather(true);
                player.showSeatId(false);
            }
        }

        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 开始押注
     * @param dic
     */
    async recBetStart(dic){
        this.cleanRound();
        this.operate.showChangeBtn(false);
        this.operate.showReady(false);
        this.operate.showInvite(false);
        this.operate.showTableCode(false);
        this.playersCtrl.hideAllEmptySeat();
        // 所有玩家取消准备状态
        this.playersCtrl.cancelPlayerReady(this.dm.playersDm.seatedPlayersInfo);

        let orders = dic.orders;
        let hasself = false;
        let self = this;
        orders.forEach(info=>{
            if(this.dm.playersDm.isSelfBySeat(info.seatid)){
                hasself = true;
                self.turnSelfEff();
            }
        })
        for (let i = 0; i < orders.length; i++){
            let player = this.playersCtrl.getPlayerByUid(orders[i].uid);
            player.showSeatId(orders[i].order);
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(orders[i].seatid).position, dic.delayTime, false);

            if(hasself){
                player.hideAvatarName(false);
                player.showWather(false);
            } else {
                player.hideAvatarName(true);
                player.showWather(true);
                player.showSeatId(false)
            }
        }

        this.operate.setBtnCnt(this.minBet, this.maxBet, this.listBet);
        this.operate.updateOprView(BlackJack21PlayerState.Bet,dic.delayTime, true);

        this.soundMgr.playEffect("game_start");
        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 玩家押注
     * @param dic
     */
    async recBetMsg(dic){
        let seat = dic.seat;    // 操作玩家
        let userState = dic.userState;  // 操作玩家状态
        let betcoin = dic.betcoin;  // 下注金额

        this.playersCtrl.hideTimerBySeat(dic.seat);
        if(this.dm.playersDm.isSelfBySeat(seat)){
            this.operate.updateOprView(dic.userState);
            this.dm.betcoin = dic.betcoin;
        }

        let player = this.playersCtrl.getPlayerBySeat(seat);
        player.betCoin = betcoin;
        this.playersCtrl.changeCoin(-betcoin, seat);
        player.jettonCtrl.addJetton(betcoin, player.node.convertToWorldSpaceAR(cc.v2(0,0)));
    }

    /**
     * 获取发牌玩家数组
     */
    _getDealables(playerseats) {
        let dealableArr = [];
        dealableArr.push(this.bankerCtrl)
        for (let i = 0; i < playerseats.length; i++){
            let player = this.playersCtrl.getPlayerBySeat(playerseats[i]);
            dealableArr.push(player)
        }
        return dealableArr
    }

    /**
     * 收到发牌
     * @param dic
     */
    async dealCards(dic){
        let seats = dic.seats;  // 闲家座位号
        let handcards = dic.handcards;  // 闲家手牌
        let cardtypes = dic.cardtypes;  // 闲家手牌牌型
        let bankercard = dic.bankercard;    // 庄家手牌，0显示为牌背
        let activeSeat = dic.activeSeat;    // 活动玩家座位号
        let activeState = dic.activeState;  // 活动玩家状态
        let delayTime = dic.delayTime;      // 活动玩家倒计时

        let dealableArr = [];
        dealableArr.push(this.bankerCtrl);
        for (let i = 0; i < seats.length; i++){
            let player = this.playersCtrl.getPlayerBySeat(seats[i]);
            dealableArr.push(player)
        }
        let cardList = [[bankercard], ...handcards];
        await this.cardPoolCtrl.dealCardsFirst(dealableArr, cardList, this.aborts);

        dealableArr.forEach((player, idx)=>{
            player.handCardCtrl.cardData = cardList[idx];
            if(idx > 0){
                player.handCardCtrl.cardType = cardtypes[idx-1];
            }
        })

        this.playHeguanAnim("kaishi");
        await this.delayTime(0.3,this.aborts);

        if(dic.activeSeat>0){
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);

            let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            // activePlayer.handCardCtrl.playTips(activePlayer.bSplit, dic.activeTile == 2);
            activePlayer.handCardCtrl.activeTile = dic.activeTile;
        }
        if(this.dm.playersDm.isSelfBySeat(activeSeat)){
            this.operate.updateOprView(activeState, dic.delayTime, true);
            this.turnSelfEff();
            // this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(activeSeat).position, delayTime);     // todo 所有的倒计时
        }
        else {

        }

        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 玩家分牌
     * @param dic
     */
    async recSplitMsg(dic){
        let seat = dic.seat;
        let userState = dic.userState;  // 玩家状态
        let handcard = dic.handcard;
        let cardtype = dic.cardtype;  // 牌型
        let activeSeat = dic.activeSeat;  // 活动玩家座位号
        let activeState = dic.activeState;  // 活动玩家状态
        let activeTile = dic.activeTile;  // 活动牌堆
        let delayTime = dic.activeTile;  // 活动玩家倒计时

        if(this.dm.playersDm.isSelfBySeat(seat)){
            this.operate.updateOprView(dic.userState);
            this.dm.betcoin = this.dm.betcoin*2;
            if(cardtype[0] == 0 && !cardtype[1]){ // 两手牌都爆牌
                this.dm.betcoin = 0;
            }
        }

        let splitPlayer = this.playersCtrl.getPlayerBySeat(dic.seat);
        splitPlayer.bSplit = true;
        splitPlayer.handCardCtrl.splitCard(handcard);
        splitPlayer.jettonCtrl.splitJettonFirst(splitPlayer.betCoin);
        this.playersCtrl.changeCoin(-splitPlayer.betCoin, dic.seat);
        // todo 再发两张
        this.cardPoolCtrl.dealCards(splitPlayer, handcard[0][1], 0, handcard[0].length-1);
        await this.delayTime(0.5, this.aborts);
        this.cardPoolCtrl.dealCards(splitPlayer, handcard[1][1], 1, handcard[0].length-1);
        await this.delayTime(0.5, this.aborts);
        splitPlayer.handCardCtrl.cardData = handcard;
        splitPlayer.handCardCtrl.cardType = cardtype;

        if(dic.activeSeat>0){
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);

            let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            activePlayer.handCardCtrl.activeTile = activeTile;
            activePlayer.handCardCtrl.playTips(true);
        }
        if(this.dm.playersDm.isSelfBySeat(activeSeat)){
            this.operate.updateOprView(activeState, dic.delayTime, false);
            this.turnSelfEff();
            // let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            // activePlayer.handCardCtrl.activeTile = activeTile;
        } else {

        }
        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 玩家要牌
     * @param dic
     */
    async recHitMsg(dic){
        this.playersCtrl.hideTimerBySeat(dic.seat);
        let player = this.playersCtrl.getPlayerBySeat(dic.seat);  // 加牌玩家
        player.handCardCtrl.playTips(false);

        let handcard = dic.handcard;    // 玩家手牌(全部)
        let cardtype = dic.cardtype;    // 牌型
        let tileid = dic.tileid;    // 操作的牌堆（只有单堆牌的时候为1）

        let card = handcard[tileid-1].slice(-1)[0];
        this.cardPoolCtrl.dealCards(player, card, tileid-1,handcard[tileid-1].length-1);
        await this.delayTime(0.5, this.aborts);

        player.handCardCtrl.cardData = handcard;
        player.handCardCtrl.cardType = cardtype;
        if(this.dm.playersDm.isSelfBySeat(dic.seat)){
            this.operate.updateOprView(dic.userState);
            if(cardtype[0] == 0 && !cardtype[1]){ // 两手牌都爆牌
                this.dm.betcoin = 0;
            }
        }

        if(dic.activeSeat>0){
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);

            let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            activePlayer.handCardCtrl.activeTile = dic.activeTile;
            activePlayer.handCardCtrl.playTips(true);
        }
        if(this.dm.playersDm.isSelfBySeat(dic.activeSeat)){
            this.operate.updateOprView(dic.activeState, dic.delayTime, true);
            this.turnSelfEff();
            // let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            // activePlayer.handCardCtrl.activeTile = dic.activeTile;
        } else {

        }

        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 玩家stand
     * @param dic
     */
    recStandMsg(dic){
        this.playersCtrl.hideTimerBySeat(dic.seat);
        let player = this.playersCtrl.getPlayerBySeat(dic.seat);  // 停牌玩家
        if(this.dm.playersDm.isSelfBySeat(dic.seat)){
            this.operate.updateOprView(dic.userState);
        }
        player.handCardCtrl.playTips(false);

        if(dic.activeSeat>0){
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);

            let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            activePlayer.handCardCtrl.activeTile = dic.activeTile;
            activePlayer.handCardCtrl.playTips(true);
        }
        if(this.dm.playersDm.isSelfBySeat(dic.activeSeat)){
            this.operate.updateOprView(dic.activeState, dic.delayTime, true);
            this.turnSelfEff();
            // let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            // activePlayer.handCardCtrl.activeTile = dic.activeTile;
        } else {

        }
        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 玩家双倍押注 --下注额翻倍，并添加一张牌，然后停牌
     * @param dic
     */
    async recDoubleMsg(dic){
        let player = this.playersCtrl.getPlayerBySeat(dic.seat);  // 加倍玩家
        if(this.dm.playersDm.isSelfBySeat(dic.seat)){
            this.operate.updateOprView(dic.userState);
            if(dic.cardtype[0] == 0 && !dic.cardtype[1]){ // 两手牌都爆牌
                this.dm.betcoin = 0;
            } else {
                this.dm.betcoin = dic.betcoin[0] + (dic.betcoin[1]?dic.betcoin[1]:0);
            }
        }
        player.handCardCtrl.playTips(false);
        this.playersCtrl.changeCoin(-(dic.betcoin[dic.tileid-1]-player.betCoin), dic.seat);
        player.jettonCtrl.addJettonDouble(dic.betcoin[dic.tileid-1], player.node.convertToWorldSpaceAR(cc.v2(0,0)), dic.tileid);
        await this.delayTime(0.3, this.aborts);


        let card = dic.handcard[dic.tileid-1].slice(-1)[0];
        this.cardPoolCtrl.dealCards(player, card, dic.tileid-1, dic.handcard[dic.tileid-1].length-1);
        await this.delayTime(0.5, this.aborts);
        player.handCardCtrl.cardData = dic.handcard;
        player.handCardCtrl.cardType = dic.cardtype;

        if(dic.activeSeat>0){
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);

            let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            activePlayer.handCardCtrl.activeTile = dic.activeTile;
            activePlayer.handCardCtrl.playTips(true);
        }
        if(this.dm.playersDm.isSelfBySeat(dic.activeSeat)){
            this.operate.updateOprView(dic.activeState, dic.delayTime, true);
            this.turnSelfEff();
            // let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            // activePlayer.handCardCtrl.activeTile = dic.activeTile;
        } else {

        }
        this.dm.msgHandler.resumeCmd();
    }



    /**
     * 玩家投保
     * @param dic
     */
    async recInsureMsg(dic){
        this.playersCtrl.hideTimerBySeat(dic.seat);
        if(this.dm.playersDm.isSelfBySeat(dic.seat)){
            this.operate.updateOprView(dic.userState);
            this.dm.betcoin += dic.insurecoin;
        }

        let choice = dic.choice;    // 是否保险
        let insurecoin = dic.insurecoin;    // 保险金额

        let player = this.playersCtrl.getPlayerBySeat(dic.seat);  // 投保玩家
        if(choice){
            this.playersCtrl.changeCoin(-insurecoin, dic.seat);
            player.jettonCtrl.addExtraJetton(insurecoin, player.node.convertToWorldSpaceAR(cc.v2(0,0)));
            await this.delayTime(0.3, this.aborts);
        }

        if(dic.activeSeat>0){
            this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);
            let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            activePlayer.handCardCtrl.activeTile = dic.activeTile;
        }
        if(this.dm.playersDm.isSelfBySeat(dic.activeSeat)){
            this.operate.updateOprView(dic.activeState, dic.delayTime, true);
            this.turnSelfEff();
            // let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
            // activePlayer.handCardCtrl.activeTile = dic.activeTile;
        } else {

        }

        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 投保结算
     * @param dic
     */
    async recInsureEndMsg(dic){
        if(dic.res == 1){    // 庄家黑杰克
            this.playersCtrl.hideTimer();

            let bankercard = dic.bankercard;  // 庄家开牌
            let bankertype = dic.bankertype;  // 庄家牌型
            let bankerwin = dic.bankerwin;    // 专家赢分
            let settle = dic.settle;          // 闲家赢分
            let waitTime = dic.waitTime;
            let time1 = new Date().getTime();

            await this.bankerCtrl.showResultCards(bankercard, bankertype, this.aborts);
            this.dm.betcoin = 0;

            settle.sort((a,b)=>{
                let player_a = this.playersCtrl.getPlayerBySeat(a.seatid);
                let player_b = this.playersCtrl.getPlayerBySeat(b.seatid);

                return player_a.order-player_b.order;
            })

            for (let i = 0; i < settle.length; i++) {
                let player = this.playersCtrl.getPlayerBySeat(settle[i].seatid);
                this.playersCtrl.setCoin(settle[i].coin, settle[i].seatid);
                if (settle[i].wincoin > 0) {  // 赢钱(猜中)
                    let dt =  player.jettonCtrl.settlementInsure(settle[i].wincoin, true, player.node.convertToWorldSpaceAR(cc.v2(0, 0)));
                    await this.delayTime(dt, this.aborts);
                    player.playAddCoin(settle[i].wincoin);
                } else {    // (没猜)
                    let dt = player.jettonCtrl.settlementInsure(settle[i].wincoin, true, this.bankerCtrl.bankerPos);
                    await this.delayTime(dt, this.aborts);
                }
            }

            this.cleanRound();

            if(this.dm.tableInfo.needSelfReady()){
                this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
                this.operate.showInvite(true);
                this.operate.showTableCode(true);
            } else {
                this.operate.showChangeBtn(true);
                if(this.countDown && waitTime > 0){
                    let time2 = new Date().getTime();
                    this.countDown.show(waitTime - Math.floor((time2-time1)/1000));
                    // this._showMathUIAni(true,waitTime - Math.floor((time2-time1)/1000));
                }
            }
        }
        else {  // 庄家非黑杰克
            let allPlayer = this.playersCtrl.players;
            for (let i = 0; i < allPlayer.length; i++){
                let player = allPlayer[i];
                if(player && player.playerInfoVo && player.jettonCtrl){
                    let dt =  player.jettonCtrl.settlementInsure(0, false, this.bankerCtrl.bankerPos);
                    await this.delayTime(dt, this.aborts);
                }
            }

            if(dic.activeSeat>0){
                this.playersCtrl.showTimer(this.dm.playersDm.getPlayerBySeatId(dic.activeSeat).position, dic.delayTime);

                let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
                activePlayer.handCardCtrl.activeTile = dic.activeTile;
            }
            if(this.dm.playersDm.isSelfBySeat(dic.activeSeat)){
                this.operate.updateOprView(dic.activeState, dic.delayTime, true);
                this.turnSelfEff();
                // let activePlayer = this.playersCtrl.getPlayerBySeat(dic.activeSeat);
                // activePlayer.handCardCtrl.activeTile = dic.activeTile;
            } else {

            }
        }

        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 结算-一局结束
     * @param dic
     */
    async recRoundEnd(dic){
        this.playersCtrl.hideTimer();

        let bankercard = dic.bankercard;  // 庄家开牌
        let bankertype = dic.bankertype;  // 庄家牌型
        let bankerwin = dic.bankerwin;    // 专家赢分
        let settle = dic.settle;          // 闲家赢分
        let waitTime = dic.waitTime;

        let time1 = new Date().getTime();

        let player = this.bankerCtrl;
        await player.showResultCards(bankercard.slice(-1)[0], bankertype, this.aborts);
        this.dm.betcoin = 0;

        let selfWin;
        settle.sort((a,b)=>{
            let player_a = this.playersCtrl.getPlayerBySeat(a.seatid);
            let player_b = this.playersCtrl.getPlayerBySeat(b.seatid);

            return player_a.order-player_b.order;
        })
        for (let i = 0; i < settle.length; i++){
            let player = this.playersCtrl.getPlayerBySeat(settle[i].seatid);
            let dt =  player.jettonCtrl.settlement(settle[i].wincoin[0], player.node.convertToWorldSpaceAR(cc.v2(0,0)), this.bankerCtrl.bankerPos, false);
            await this.delayTime(dt, this.aborts);

            let total = settle[i].wincoin[0];
            if(settle[i].wincoin[1] >= 0){
                total += settle[i].wincoin[1];
                let dt2 =  player.jettonCtrl.settlement(settle[i].wincoin[1], player.node.convertToWorldSpaceAR(cc.v2(0,0)), this.bankerCtrl.bankerPos, true);
                await this.delayTime(dt2, this.aborts);
            }
            this.playersCtrl.setCoin(settle[i].coin, settle[i].seatid);
            if(total > 0 && total > player.jettonCtrl.betcoin1+player.jettonCtrl.betcoin2){
                player.playAddCoin(total);
            }
            if(this.dm.playersDm.isSelfBySeat(settle[i].seatid)){
                selfWin = total > 0;
            }
        }

        if(selfWin){
            this.soundMgr.playEffect("win_result");
        } else {
            this.soundMgr.playEffect("lose_result");
        }

        await this.delayTime(0.5,this.aborts);
        this.cleanRound();
        if (this.dm.tableInfo.needSelfReady()) {
            this.operate.showReady(!this.dm.playersDm.selfInfo.isReady);
            this.operate.showInvite(true);
            this.operate.showTableCode(true);
        } else {
            this.operate.showChangeBtn(true);
            if (this.countDown && waitTime > 0) {
                let time2 = new Date().getTime();
                this.countDown.show(waitTime - Math.floor((time2 - time1) / 1000));
                // this._showMathUIAni(true,waitTime - Math.floor((time2 - time1) / 1000));
            }
        }

        this.dm.msgHandler.resumeCmd();
    }

    playHeguanAnim(type){
        let hgSp = cc.find("safe_node/zhuozi/lihui", this.node).getComponent(sp.Skeleton);
        if(type == "fapai"){
            hgSp.setAnimation(0,"animation1",false);
        } else if(type == "kaishi"){
            hgSp.setAnimation(0,"animation2",false);
        }
    }

    /**
     * 轮到自己操作
     */
    turnSelfEff(){
        // this.soundMgr.playEffect("Current");
        cc.vv.PlatformApiMgr.deviceShock();
    }

    /**
     * 延时
     */
    delayTime(time: number, list?) {
        let promise = new Promise((res, rej) => {
            this.scheduleOnce(() => {
                res(true);
            }, time);

            if (list) {
                list.push(rej)
            }
        });
        return promise
    }
}
