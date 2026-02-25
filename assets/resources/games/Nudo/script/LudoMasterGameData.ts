import { PBGameData } from "../../PokerBase/scripts/PBGameData";
import { LudoMasterMsgCmd } from "./net/LudoMasterMsgCmd";
import LudoMasterMsgHandler from "./net/LudoMasterMsgHandler";
import LudoMasterMsgWriter from "./net/LudoMasterMsgWriter";
import { LudoMasterTableInfo } from "./LudoMasterCommonData";
import { LudoMasterPlayerInfoVO, LudoMasterPlayersDm } from "./game/LudoMasterPlayerData";
import { PBUserInfoVo } from "../../PokerBase/scripts/player/PBPlayerData";
import { PBFlowState, PBTableState } from "../../PokerBase/scripts/PBCommonData";


class LudoMasterGameData extends PBGameData {
    msgCmd: LudoMasterMsgCmd;
    tableInfo: LudoMasterTableInfo;
    playersDm: LudoMasterPlayersDm;
    msgWriter: LudoMasterMsgWriter;

    initDataCtrl() {
        super.initDataCtrl();
    }

    loadMsgCmd() {
        return new LudoMasterMsgCmd();
    }

    loadTableInfo() {
        return new LudoMasterTableInfo();
    }

    loadPlayerDm() {
        return new LudoMasterPlayersDm();
    }

    loadMsgHandler() {
        return new LudoMasterMsgHandler();
    }

    loadMsgWriter() {
        return new LudoMasterMsgWriter();
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
     * 解析一个玩家的数据
     */
    parseAPlayer(item: any): LudoMasterPlayerInfoVO {
        let uvo = this.genAPlayerInfoVo(LudoMasterPlayerInfoVO, PBUserInfoVo, item);
        uvo.round = item.round || 0;
        uvo.playername = item.playername;
        uvo.usericon = item.usericon;
        uvo.state = item.state
        if (item.round) {
            uvo.round.kill = item.round.kill || 0;
        }
        return uvo;
    }

    /**
     * 重连登录处理
     */
    reconnectLogin() {
        let deskInfo = this.deskInfo;
        // 桌子状态
        let tableStatus = this.tableStatus;
        tableStatus.currStatus = deskInfo.state;
        tableStatus.isReconnect = deskInfo.isReconnect;
        // 更新用户
        this.updatePalyersData();
        this.markPlayerReadyState();
    }
    // 更新用户
    updatePalyersData() {
        this.parsePlayersData(this.deskInfo.users);
        for (let viewer of this.playersDm.viewerList) {
            if (viewer.seatId && viewer.seatId > 0) {
                this.playersDm.seat(viewer);
            }
        }
    }


    normalLogin() {
        let deskInfo = this.deskInfo;
        let tableStatus = this.tableStatus;
        tableStatus.currStatus = deskInfo.state || 0;
        this.markPlayerReadyState();
    }


    markPlayerReadyState() {
        if (!this.tableInfo.needSelfReady()) {
            return;
        }
        if (this.tableStatus.currStatus == PBTableState.MATCH
            || this.tableStatus.currStatus == PBTableState.READY
            || this.tableStatus.currStatus == PBTableState.GAMEOVER) {
            let users = this.deskInfo.users;
            for (let i = 0; i < users.length; i++) {
                let item = users[i];
                let uvo = this.playersDm.getPlayerByUid(item.uid);
                uvo.isReady = item.state == 2;
            }
        }
    }

    getGameDir() {
        return 'games/Nudo/';
    }

    //退出游戏返回大厅
    ReqBackLobby() {
        if (this.tableStatus.flowState == PBFlowState.playing) {
            // cc.vv.AlertView.show(___("lose {1} coins", Global.FormatNumToComma(this.deskInfo.bet)), () => {
            //     facade.dm.msgWriter.sendExit(); //退出游戏
            // }, () => {
            // }, false, null, ___("Leave Table"), null, ___("Leave"));
            // cc.vv.FloatTip.show(___("Please complete the game before leaving the room"));
            // return;

            facade.dm.msgWriter.sendExit(); //退出游戏
        } else {
            facade.dm.msgWriter.sendExit(); //退出游戏
        }
    }


    //获取游戏配置:就是配置了symbols的文件 一般命名 ***_Cfg.js
    getGameCfg() {
        return {
            bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
            helpItems: ["games/Nudo/prefab/help_item1"], // 慢的
        }
    }

}

export = LudoMasterGameData;