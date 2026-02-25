/**
 * 比赛
 */

import KnockoutDeskInfoCpt from "../../../BalootClient/KnockoutMatch/scripts/KnockoutDeskInfoCpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class KnockoutDeskInfoCpt_ex extends KnockoutDeskInfoCpt {

    //overwrite
    updateAllMathRank(){
        if(!this.localData) return
        let tn_info = this.localData.tn_info;
        // 遍历所有排名组件
        for (let rankCpt of cc.director.getScene().getComponentsInChildren("KnockoutRankCpt")) {
            rankCpt.node.active = false;
            let pbPlayerCpt = rankCpt.node.parent.getComponent("Rummy_Player");
            let pInfo = pbPlayerCpt.getPlayerInfo()
            if (pInfo) {
                rankCpt.node.active = true;
                for (let info of tn_info.players) {
                    if (pInfo.uid == info.uid) {
                        rankCpt.rank = info.ord;
                    }
                }
            }
        }
    }

    doGoToHall(){
        cc.vv.gameData.doExitRoom()
    }
}
