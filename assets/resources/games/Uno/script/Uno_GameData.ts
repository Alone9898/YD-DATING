import { PBGameData } from "../../PokerBase/scripts/PBGameData";
import { PBUserInfoVo } from "../../PokerBase/scripts/player/PBPlayerData";
import { UnoTableStatus, UnoUserState } from "./Uno_CommonData";
import { UnoMsgCmd } from "./net/Uno_MsgCmd";
import { UnoMsgHandler } from "./net/Uno_MsgHandler";
import { UnoMsgWriter } from "./net/Uno_MsgWriter";
import { UnoPlayerInfoVo, UnoPlayersDm } from "./player/Uno_PlayerData";
import { PBFlowState, PBTableState } from "../../PokerBase/scripts/PBCommonData";

/**
 * 数据控制类
 */
class UnoGameData extends PBGameData {
    tableStatus: UnoTableStatus;   // 桌子状态
    playersDm: UnoPlayersDm;       // 玩家数据
    msgCmd: UnoMsgCmd;
    msgHandler: UnoMsgHandler;     // 消息处理
    msgWriter: UnoMsgWriter;       // 消息发送

    initDataCtrl() {
        super.initDataCtrl();
    }

    loadTableStatus() {
        return new UnoTableStatus();
    }

    loadPlayerDm() {
        return new UnoPlayersDm();
    }

    loadMsgCmd() {
        return new UnoMsgCmd();
    }

    loadMsgHandler() {
        return new UnoMsgHandler();
    }

    loadMsgWriter() {
        return new UnoMsgWriter()
    }

    /**
     * 解析玩家信息
     */
    parsePlayersData(users: any[]) {
        // 用户信息
        for (let i = 0; i < users.length; i++) {
            let item = users[i];
            let uvo = this.parseAPlayer(item);
            this.playersDm.seat(uvo);
        }
    }

    /**
     * @override
     */
    parseAPlayer(item: any) {
        let uvo = this.genAPlayerInfoVo(UnoPlayerInfoVo, PBUserInfoVo, item);
        uvo.state = item.state || 1;
        if (item.round) {
            uvo.uno = item.round.uno;
        }
        return uvo;
    }

    reconnectLogin() {
        let deskInfo = this.deskInfo;
        // 桌子状态
        let tableStatus = this.tableStatus;
        tableStatus.currStatus = deskInfo.state;
        tableStatus.isReconnect = deskInfo.isReconnect;

        // 解析用户信息
        this.parsePlayersData(deskInfo.users);

        let selfInfo = this.playersDm.selfAbsInfo;
        // 设置对局信息
        for (let i = 0; i < deskInfo.users.length; i++) {
            let item = deskInfo.users[i];
            let uvo = this.playersDm.getPlayerByUid(item.uid);
            let roundScore = 0;
            let totalScore = 0;
            let round = item.round;
            if (round) {
                if (selfInfo == uvo) {
                    this.playersDm.fillCards(0, round.cards.concat(), true);
                    tableStatus.canOutCard = uvo.state == UnoUserState.Discard;
                } else {
                    uvo.restCardLen = round.cards.length || 0;
                }

                roundScore = round.score;
                totalScore = item.score;

            }
        }

        let roundInfo = deskInfo.round;
        if (roundInfo) {
            tableStatus.activeSeat = roundInfo.activeSeat;
            tableStatus.dealerUid = (roundInfo.dealer && roundInfo.dealer.uid) || 0;
        }
        this.markPlayerReadyState();
    }

    normalLogin() {
        let deskInfo = this.deskInfo;
        let tableStatus = this.tableStatus as UnoTableStatus;
        tableStatus.currStatus = deskInfo.state || 0;
        this.markPlayerReadyState();
    }

    markPlayerReadyState() {
        if (!this.tableInfo.needSelfReady()) {
            return;
        }
        if (this.tableStatus.currStatus == PBTableState.MATCH || this.tableStatus.currStatus == PBTableState.READY || this.tableStatus.currStatus == PBTableState.GAMEOVER) {
            let users = this.deskInfo.users;
            for (let i = 0; i < users.length; i++) {
                let item = users[i];
                let uvo = this.playersDm.getPlayerByUid(item.uid);
                uvo.isReady = item.state == 2;
            }
        }
    }

    reset() {
        this.tableStatus.reset();
        this.playersDm.reset();
    }

    /**
     * 清理单局数据
     */
    clearRound() {
        super.clearRound();
    }

    /////////////////////////
    /**
     * 发牌
     * @param cards 
     * @param isApend
     */
    dealCards(cards: number[], isApend: boolean) {
        // 玩家牌数据修改
        if (!isApend) {
            this.playersDm.seatedPlayersInfo.forEach(p => {
                p.handCards = [];
            });
        }
        this.playersDm.fillCards(0, cards);
    }

    /**
     * 收到玩家出牌
     * @param player 
     * @param cards 
     */
    // userOutCard(user: UnoPlayerInfoVo, cards: number[]) {
    //     if (user) {
    //         this.playersDm.removeCards(user.position, cards);
    //     }
    // }

    /**
     * 只用于重连时用到 获取上一轮出牌的信息
     */
    getLastTrickCards() {
        let cards: number[] = [];
        let endPosition = 0;
        let round = this.deskInfo.round;
        if (round) {
            let lastSeatid = round.lastSeatid;
            let roundCards: number[] = round.roundCards || [];
            let discardCards: number[] = round.discardCards || [];
            if (lastSeatid && discardCards.length - roundCards.length >= 4) {
                let endP = this.playersDm.getPlayerBySeatId(lastSeatid);
                endPosition = endP.position;
                if (roundCards.length > 0) {
                    cards = discardCards.slice(-4 - roundCards.length, -roundCards.length);
                } else {
                    cards = discardCards.slice(-4);
                }
            }
        }
        return { roundCards: cards, endPosition: endPosition };
    }

    /////////////////////////兼容 framework ///////////////////////
    update(args: any) {
    }

    onExit() {
        super.onExit();
    }

    clear() {
        // let data = cc.vv.GameDataCfg.getGameData(this._gameId);
        // if(cc.vv.gameData && cc.vv.gameData.resMgr) {
        //     cc.vv.gameData.resMgr.releaseRes();
        // }
        cc.vv.gameData = null;
    }

    getGameId() {
        return this.tableInfo.gameId;
    }

    SetBreakGrant(param: any) {

    }

    isBackgroundReConn() {
        return true;
    }

    getGameDir() {
        return 'games/Uno/';
    }

    //退出游戏返回大厅
    ReqBackLobby() {
        if (this.tableStatus.flowState == PBFlowState.playing) {
            cc.vv.FloatTip.show(___("Please complete the game before leaving the room"));
        } else {
            facade.dm.msgWriter.sendExit(); //退出游戏
        }
        // facade.dm.msgWriter.sendExit(); //退出游戏
    }


    //获取游戏配置:就是配置了symbols的文件 一般命名 ***_Cfg.js
    getGameCfg() {
        return {
            bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
            helpItems: [
                "games/Uno/prefabs/help_item1",
                "games/Uno/prefabs/help_item2",
                "games/Uno/prefabs/help_item3",
                "games/Uno/prefabs/help_item4",
            ],
        }
    }
}


export = UnoGameData;