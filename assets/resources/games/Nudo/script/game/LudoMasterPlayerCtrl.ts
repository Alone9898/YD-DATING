import { PBTableState } from "../../../PokerBase/scripts/PBCommonData";
import { PBPlayersCtrl } from "../../../PokerBase/scripts/player/PBPlayersCtrl";
import LudoMasterLogic = require("../LudoMasterLogic");
// import LudoMasterLogic from "../LudoMasterLogic";
import LudoMasterPlayer from "./LudoMasterPlayer";
import { LudoMasterPlayerInfoVO } from "./LudoMasterPlayerData";

export class LudoMasterPlayerCtrl extends PBPlayersCtrl {
    allPlayers: LudoMasterPlayer[];
    activePlayers: LudoMasterPlayer[];
    emptySeats: cc.Node[] = null;


    get facade(): LudoMasterLogic {
        return facade as LudoMasterLogic;
    }


    getPlayerCmp() {
        return LudoMasterPlayer;
    }

    getPlayerByPosition(position: number) {
        return this.activePlayers[position];
    }

    getPlayerByUid(uid: number) {
        for (let i = 0; i < this.activePlayers.length; i++) {
            let p = this.activePlayers[i];
            if (p && p.playerInfoVo && p.playerInfoVo.uid == uid) {
                return p;
            }
        }
    }

    // 控制玩家骰子的显示与隐藏
    diceBtnCtrl(seatId: number) {
        this.activePlayers.forEach(p => {
            p.playerInfoVo && p.setDiceBtn(seatId == p.playerInfoVo.seatId)
        });
    }

    // 玩家坐下
    seat(pvo: LudoMasterPlayerInfoVO) {
        super.seat(pvo)
        // 初始化棋子
        let playerCpt = this.getPlayerByUid(pvo.uid)
        this.facade.tableCtrl.updateChess(pvo);
        this.facade.tableCtrl.updateTableAngle();
        // 初始化骰子按钮
        playerCpt.setDiceBtn(false);
    }

    // 玩家站起
    standUp(position: number) {
        super.standUp(position)
        this.facade.tableCtrl.closeChess(position);
    }


    initPlayers(pvos: LudoMasterPlayerInfoVO[]) {
        super.initPlayers(pvos);
        if (facade.dm.tableInfo.needSelfReady()) {
            if (facade.dm.tableStatus.currStatus == PBTableState.MATCH
                || facade.dm.tableStatus.currStatus == PBTableState.READY
                || facade.dm.tableStatus.currStatus == PBTableState.GAMEOVER) {
                this.activePlayers.forEach(p => {
                    if (p.playerInfoVo) {
                        p.userInfoCmp.showReadyTip(p.playerInfoVo.isReady);
                    }
                });
            }
        }
    }

    closeAllDiceList() {
        this.allPlayers.forEach(p => {
            p.setDiceList([]);
        });
        // facade.clock.hide();
    }
}
