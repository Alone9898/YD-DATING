import { PBPlayerInfoVo } from "../../../PokerBase/scripts/player/PBPlayerData";
import UserAvatar from "../../../../../BalootClient/game_common/common_cmp/UserAvatar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gameOverResult extends cc.Component {

    @property(cc.Label)
    atackLabel: cc.Label = null;

    @property(cc.Label)
    defeatLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.atackLabel = cc.find('gameInfo/atack/num', this.node).getComponent(cc.Label)
        this.defeatLabel = cc.find('gameInfo/defeat/num', this.node).getComponent(cc.Label)
    }

    start() {

    }

    initData(at: number, df: number) {
        this.atackLabel.string = (at).toString();
        this.defeatLabel.string = (df).toString();
    }

    updateHeadIcon(p: PBPlayerInfoVo) {
        if (p && p.uid && p.uinfo && p.avatarFrame) {
            cc.find('user_info_node/head_icon', this.node).getComponent(UserAvatar).updataAvatar({ uid: p.uid, icon: p.uinfo.icon, avatarFrame: p.avatarFrame });
            cc.find('user_info_node/label_name', this.node).getComponent(cc.Label).string = p.uinfo.uname
        }
    }

    // update (dt) {}
}
