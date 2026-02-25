import { PBPlayerInfoVo, PBPlayersDm } from "../../../PokerBase/scripts/player/PBPlayerData";
import { PBUserInfoCmp } from "../../../PokerBase/scripts/player/PBUserInfoCmp";
import { playerRound } from "../LudoMasterCommonData";
import LudoMasterLogic = require("../LudoMasterLogic");
// import LudoMasterLogic from "../LudoMasterLogic";

export class LudoMasterPlayerInfoVO extends PBPlayerInfoVo {
    playername: string = "";
    usericon: string = "";
    round: playerRound = null;
    state: number = 0;
}

export class LudoMasterPlayersDm extends PBPlayersDm {

    seatedPlayersInfo: LudoMasterPlayerInfoVO[];
    allUserMap: Map<number, LudoMasterPlayerInfoVO>;
    viewerList: LudoMasterPlayerInfoVO[] = []; // 旁观列表

    get selfInfo() {
        return this.allUserMap.get(cc.vv.UserManager.uid);
    }

    get selfAbsInfo() {
        let info = this.selfInfo;
        if (!info) {
            for (let i = 0; i < this.viewerList.length; i++) {
                let viewer = this.viewerList[i];
                if (viewer.uid == cc.vv.UserManager.uid) {
                    info = viewer;;
                }
            }
        }
        return info;
    }

}

export class LudoMasterPBUserInfoCmp extends PBUserInfoCmp {
    get facade(): LudoMasterLogic {
        return facade as LudoMasterLogic;
    }



    onLoad() {
        super.onLoad()
    }
}