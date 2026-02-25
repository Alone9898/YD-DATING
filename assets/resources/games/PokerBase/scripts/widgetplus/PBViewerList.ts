import UserAvatar from "../../../../../BalootClient/game_common/common_cmp/UserAvatar";
import { PBPlayerInfoVo } from "../player/PBPlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export class PBViewerList extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    head_icon: cc.Node = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    onLoad() {
        // this.panel.active = false;
        this.hide();
    }

    hide() {
        this.node.active = false;
        this.content.removeAllChildren();
    }

    show(viewerList: PBPlayerInfoVo[]) {
        this.node.active = true;
        this.content.removeAllChildren();
        for (const viewer of viewerList) {
            if (viewer.seatId > 0) {
                continue;
            }
            let node = cc.instantiate(this.head_icon);
            node.active = true;
            node.parent = this.content;
            node.y = 0;
            node.getComponent(UserAvatar).updataAvatar({ uid: viewer.uid, icon: viewer.uinfo.icon, avatarFrame: viewer.avatarFrame });
        }

        this.scheduleOnce(() => {
            this.scrollView.setContentPosition(cc.v2(0, 0))
        }, 0);
    }

    updateList(viewerList: PBPlayerInfoVo[]) {
        this.content.removeAllChildren();
        this.show(viewerList);
    }
}