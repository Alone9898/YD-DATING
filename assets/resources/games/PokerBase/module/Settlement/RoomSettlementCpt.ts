import { PBPlayer } from "../../scripts/player/PBPlayer";
import { PBSettlementInfoChange } from "../../scripts/settlement/PBSettlementInfoChange";
import { PBSettlementInfoChangeInPlayer } from "../../scripts/settlement/PBSettlementInfoChangeInPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomSettlementCpt extends cc.Component {


    playerChangeCpt: PBSettlementInfoChangeInPlayer;
    infoChangeCpt: PBSettlementInfoChange;

    onLoad() {

    }

    // 执行获取 RP EXP LEAGUE 动画
    async run(parm) {
        let playerNode: cc.Node = null;
        if (facade.playersCtrl) {
            playerNode = facade.playersCtrl.getPlayerByUid(cc.vv.UserManager.uid).node;
        } else {
            let script = cc.vv.gameData.getScriptGame()
            if (script) {
                let playlist = script._getPlayerListScript()
                if (playlist) {
                    playerNode = playlist.getPlayerNode(cc.vv.UserManager.uid);
                }
            }
        }
        if (!playerNode) return;
        // 加载预制体 个人资料信息预制体
        // 加载预制体 奖励预制体
        // 执行动画
        if (!this.playerChangeCpt) {
            let playerChangePrefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/info_change");
            let playerChangeNode = cc.instantiate(playerChangePrefab);
            playerChangeNode.parent = facade.panel;
            playerChangeNode.position = facade.panel.convertToNodeSpaceAR(playerNode.convertToWorldSpaceAR(cc.v3(0, 50)));
            playerChangeNode.zIndex = 500;
            this.playerChangeCpt = playerChangeNode.getComponent(PBSettlementInfoChangeInPlayer);
            this.playerChangeCpt.clear();
        }
        if (!this.infoChangeCpt) {
            let infoChangePrefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/settlement_info_change");
            let infoChangeNode = cc.instantiate(infoChangePrefab);
            infoChangeNode.parent = facade.panel;
            infoChangeNode.zIndex = 500;
            this.infoChangeCpt = infoChangeNode.getComponent(PBSettlementInfoChange);
            this.infoChangeCpt.end_Exp = cc.find("rp/position", this.playerChangeCpt.node);
            this.infoChangeCpt.end_Rp = cc.find("exp/position", this.playerChangeCpt.node);
            this.infoChangeCpt.end_League = cc.find("league/position", this.playerChangeCpt.node);
            this.infoChangeCpt.clear();
        }

        let rp = parm.rp;
        let exp = parm.exp;
        let league = parm.league;

        let kind = 1;
        let rpDelayTime = 0.1;
        let leagueDelayTime = 0.1;
        if (exp > 0 && rp > 0 && league > 0) {
            rpDelayTime = 0.1;
            leagueDelayTime = 0.2;
            kind = 3;
        } else if (exp > 0 && rp > 0) {
            rpDelayTime = 0.1;
            kind = 2;
        }
        if (exp > 0) {
            this.infoChangeCpt.playExpChange(exp, 0, () => {
                this.playerChangeCpt.showDialogue(kind);
            }, () => {
                this.playerChangeCpt.addInfo(exp, rp, league);
                let pbPlayer = playerNode.getComponent(PBPlayer);
                if (pbPlayer) pbPlayer.playRpChange(rp);
            });
        }
        if (rp > 0) {
            this.infoChangeCpt.playRpChange(rp, rpDelayTime);
        }
        if (league > 0) {
            this.infoChangeCpt.playLeagueChange(league, leagueDelayTime);
        }
    }


    clear() {
        if (this.infoChangeCpt) this.infoChangeCpt.clear();
        if (this.playerChangeCpt) this.playerChangeCpt.clear();
    }

}
