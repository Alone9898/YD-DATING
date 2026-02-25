import { PBSettlementResultType, PBTotalSettlement } from "../../../PokerBase/scripts/settlement/PBTotalSettlement";
import { PromiseLock } from "../../../../../BalootClient/game_common/PromiseLock";
import LudoMasterLogic = require("../LudoMasterLogic");
// import LudoMasterLogic from "../LudoMasterLogic";

const { ccclass, property } = cc._decorator;

/**
 * 玩家信息相关
 */
@ccclass
export class LudoMasterTotalSettlement extends PBTotalSettlement {


    /**
     * @override
     */
    async updateView() {
        let facade = this.getFacade<LudoMasterLogic>();
        let dm = facade.dm;

        // 累计输赢分数
        let wincoins = this.settlementData.wincoins;
        if (wincoins) {
            wincoins.forEach(item => {
                let p = dm.playersDm.getPlayerByUid(item.uid);
                p && (p.winCoinShow = (item.wincoinshow || 0));
            });
        }

        // 解析数据
        let settle = this.settlementData.settle;
        let playersSettleInfos: { uid: number, seatId: number, addcoin: number, exp: number, score: number, league?: number }[] = [];
        let selfSettleInfo: { uid: number, seatId: number, addcoin: number, exp: number, score: number, league?: number, rp: number } = null;
        let isWin = false;
        for (let i = 0; i < settle.coins.length; i++) {
            let seatId = i + 1;
            let pVo = facade.dm.playersDm.getPlayerBySeatId(seatId);
            if (!pVo) {
                continue;
            }
            let info = {
                uid: pVo.uid,
                seatId: seatId,
                fcoin: settle.fcoins[i],
                addcoin: settle.coins[i] || 0,
                exp: settle.levelexps[i],
                score: settle.scores[i],
                league: (settle.league && settle.league[i]) || 0,
                rp: 0
            }
            pVo.coin = info.fcoin;
            // pVo.leaguePoints += info.addcoin;
            if (settle.rps) {
                info.rp = settle.rps[i] || 0;
            }
            if (info.seatId == facade.dm.playersDm.selfAbsInfo.seatId) {
                selfSettleInfo = info;
                isWin = info.addcoin > 0;
            }
            playersSettleInfos.push(info);
        }
        // 飞金币
        if (!await PromiseLock.exe(facade.playersCtrl.flyCoinByTeams(playersSettleInfos))) {
            return;
        }
        // 显示换桌按钮
        facade.operate.showChangeBtn(true);
        facade.operate.showLeaveBtn(true)
        facade.operate.showConfirmBtn(true)
        if (dm.tableInfo.isViewer) {
            this.autoNextRoundTime = 6;
            this.close(PBSettlementResultType.MANUAL_NEXT);
        } else {
            this.showWinOrLoseFlag(isWin);
            // this.showButton();
            let timeout = 6;
            if (this.settlementData.timeout) {
                timeout = this.settlementData.timeout - 6;
            }
            timeout = timeout > 0 ? timeout : 5;
            this.showAutoNextRoundTip(timeout);
        }

        // 结算exp rp league值
        // if (selfSettleInfo) {
        //     facade.playersCtrl.playInfoChange(selfSettleInfo.exp, selfSettleInfo.rp, selfSettleInfo.league);
        // }
    }
}