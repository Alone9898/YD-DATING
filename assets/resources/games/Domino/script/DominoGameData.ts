import { PBFlowState, PBTableInfo } from "../../PokerBase/scripts/PBCommonData";
import { PBGameData } from "../../PokerBase/scripts/PBGameData";
import { PBUserInfoVo } from "../../PokerBase/scripts/player/PBPlayerData";
import { DominoPlayerState, DominoTableInfo } from "./DominoCommonData";
import { DominoTableDataDm } from "./game/DominoTableData";
import { DominoPlayer } from "./game/player/DominoPlayer";
import { DominoPlayerInfoVO, DominoPlayersDm } from "./game/player/DominoPlayerData";
import { DominoMsgCmd } from "./net/DominoMsgCmd";
import DominoMsgHandler from "./net/DominoMsgHandler";
import DominoMsgWriter from "./net/DominoMsgWriter";

class DominoGameData extends PBGameData {
    tableDm: DominoTableDataDm;    // 桌面数据
    msgCmd: DominoMsgCmd;
    playersDm: DominoPlayersDm;
    msgWriter: DominoMsgWriter;
    tableInfo: DominoTableInfo;

    initDataCtrl() {
        super.initDataCtrl();
        this.tableDm = new DominoTableDataDm();
    }

    clearRound() {
        super.clearRound();
        this.tableDm.reset();
    }

    loadPlayerDm() {
        return new DominoPlayersDm();
    }

    loadTableInfo() {
        return new DominoTableInfo();
    }

    loadMsgCmd() {
        return new DominoMsgCmd();
    }

    loadMsgHandler() {
        return new DominoMsgHandler();
    }

    loadMsgWriter() {
        return new DominoMsgWriter();
    }

    /**
     * 解析玩家信息
     */
    parsePlayersData(users: any[]) {
        // 用户信息
        cc.log("44444444444444444444");
        for (let i = 0; i < users.length; i++) {
            let item = users[i];
            let uvo = this.parseAPlayer(item);
            if (uvo.seatId > 0) {
                this.playersDm.seat(uvo);
            }
        }
    }

    /**
     * 解析一个玩家的数据
     */
    parseAPlayer(item: any): DominoPlayerInfoVO {
        let uvo = this.genAPlayerInfoVo(DominoPlayerInfoVO, PBUserInfoVo, item);
        uvo.isNew = item.isnew;
        return uvo;
    }

    /**
     * 重连登录处理
     */
    reconnectLogin() {
        let deskInfo = this.deskInfo;
        // 桌子状态
        let tableStatus = this.tableStatus;
        tableStatus.dealerUid = deskInfo.dealer;
        tableStatus.currStatus = deskInfo.state;
        tableStatus.isReconnect = deskInfo.isReconnect;
        tableStatus.currRound = deskInfo.curround || 0;

        // 解析用户信息
        this.parsePlayersData(deskInfo.users);

        // 观战
        this.parseViewerList(deskInfo.views);
        for (let viewer of this.playersDm.viewerList) {
            if (viewer.seatId && viewer.seatId > 0) {
                this.playersDm.seat(viewer);
            }
        }

        // 设置手牌
        let selfInfo = this.playersDm.selfInfo;
        for (let i = 0; i < deskInfo.users.length; i++) {
            let item = deskInfo.users[i];
            let uvo = this.playersDm.getPlayerByUid(item.uid);
            if (selfInfo == uvo) {
                let roundInfo = item.round;
                if (roundInfo) {
                    this.playersDm.fillCards(0, roundInfo.cards.concat(), true);
                }

                tableStatus.canOutCard = item.seatid == deskInfo.round.activeSeat;
            } else {
                if (item.round) {
                    uvo.restCardLen = item.round.cards.length;
                }

            }
            if (item.round) {
                (uvo as DominoPlayerInfoVO).passCard = item.round.passCard;
            }

        }

        // 设置桌面牌
        this.tableDm.parseTableCards(deskInfo.round.roundCards);
        this.tableDm.frontPoint = deskInfo.round.connect[0] >= 0 ? deskInfo.round.connect[0] : -1;
        this.tableDm.lastPoint = deskInfo.round.connect[1] >= 0 ? deskInfo.round.connect[1] : -1;

        tableStatus.activeSeat = deskInfo.round.activeSeat;
        this.markPlayerReadyState();
    }

    /**
     * 普通登录处理
     */
    normalLogin() {
        let deskInfo = this.deskInfo;
        let tableStatus = this.tableStatus;
        tableStatus.currStatus = deskInfo.state;
        this.markPlayerReadyState();
    }

    markPlayerReadyState() {
        if (!this.tableInfo.needSelfReady()) {
            return;
        }
        // if(this.tableStatus.currStatus != HandTableState.Match) {
        //     return;
        // }
        let users = this.deskInfo.users;
        for (let i = 0; i < users.length; i++) {
            let item = users[i];
            let uvo = this.playersDm.getPlayerByUid(item.uid);
            uvo.isReady = item.state == 2;
        }
    }

    dealCards(cards: any) {
        this.playersDm.fillCards(0, cards, true);
    }

    getGameDir() {
        return 'games/Domino/';
    }

    //退出游戏返回大厅
    ReqBackLobby() {
        if (this.tableStatus.flowState == PBFlowState.playing) {
            cc.vv.FloatTip.show(___("Please complete the game before leaving the room"));
            return;
        }
        facade.dm.msgWriter.sendExit(); //退出游戏
        // if (facade.otherCardsLen > 0) {
        //     cc.vv.AlertView.show(___("lose {1} coins", Global.FormatNumToComma((facade.otherCardsLen + 5) * this.deskInfo.bet)), () => {
        //         facade.dm.msgWriter.sendExit(); //退出游戏
        //     }, () => {
        //     }, false, null, ___("Leave Table"), null, ___("Leave"));
        // } else {
        //     facade.dm.msgWriter.sendExit(); //退出游戏
        // }
    }


    //获取游戏配置:就是配置了symbols的文件 一般命名 ***_Cfg.js
    getGameCfg() {
        return {
            bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
            helpItems: [
                "games/Domino/prefab/help_item1",
            ],
        }
    }
}

export = DominoGameData;