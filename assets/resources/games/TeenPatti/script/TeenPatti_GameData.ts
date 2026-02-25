import { PBGameData } from "../../PokerBase/scripts/PBGameData";
import { TeenPattiCfg } from "./TeenPatti_Cfg";
import { facade } from "../../PokerBase/scripts/PBLogic";
import { PBMsgHandlerEx } from "../../PokerBase/scripts/net/PBMsgHandlerEx";

/**
 * 数据控制类
 */
class TeenPatti_GameData extends PBGameData {

    loadMsgHandler() {
        return new PBMsgHandlerEx();
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
        // 解析用户信息
        this.parsePlayersData(deskInfo.users);
        this.parseViewerList(deskInfo.views);
        let roundInfo = deskInfo.round;
        if (roundInfo) {
            tableStatus.activeSeat = roundInfo.activeSeat;
            tableStatus.dealerUid = (roundInfo.dealer && roundInfo.dealer.uid) || 0;
        }
    }

    /**
     * 解析观战玩家信息
     */
    parseViewerList(users: any[]) {
        this.playersDm.viewerList = [];
        if (!users) {
            return;
        }
        users.forEach(u => {
            if (u) {
                let pvo = this.parseAPlayer(u);
                this.playersDm.viewerList.push(pvo);
                if (pvo.seatId) { // 观战玩家在位子上的也要坐下
                    this.playersDm.seat(pvo);
                }
            }
        })
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

    // -------------------------------- 兼容 framework --------------------------------
    update(args: any) {
    }

    onExit() {
        super.onExit();
    }

    clear() {
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
        return 'games/TeenPatti/';
    }

    //退出游戏返回大厅
    ReqBackLobby() {
        if (facade.selfBetCoin > 0) {
            cc.vv.AlertView.show(___("You will lose {1}", Global.FormatNumToComma(facade.selfBetCoin)), () => {
                facade.dm.msgWriter.sendExit(); //退出游戏
            }, () => {
            }, false, null, ___("Leave Table"), null,
             ___("Leave"));
        } else {
            facade.dm.msgWriter.sendExit(); //退出游戏
        }
    }


    //获取游戏配置:就是配置了symbols的文件 一般命名 ***_Cfg.js
    getGameCfg() {
        return {
            bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
            helpItems: ["games/TeenPatti/prefab/help_item1"]
        }
    }
}


export = TeenPatti_GameData;