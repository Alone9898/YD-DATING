import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { CDButtonProxy } from "../../../../../BalootClient/game_common/common_cmp/CDButtonProxy";
import { PBRoomType } from "../PBCommonData";
import { facade } from "../PBLogic";
import { PBInviteFriends } from "./PBInviteFriends";

const { ccclass, property } = cc._decorator;


let invite_in_chat_cnt_limit = 3;
let invite_in_chat_time_limit = 100;

/**
 * 邀请弹窗
 */
@ccclass
export class PBExitWarning extends cc.Component {
    static PREFAB_PATH = "games/PokerBase/prefabs/pb_exit_warning";

    start() {
        this.scheduleOnce(()=>{
            this.close();
        }, 3);
    }

    close() {
        cc.vv.PopupManager.removePopup(this.node);
    }

}