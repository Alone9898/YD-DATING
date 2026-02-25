import {PBUserInfoCmp} from "../../../PokerBase/scripts/player/PBUserInfoCmp";
import {PBPlayerInfoVo} from "../../../PokerBase/scripts/player/PBPlayerData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21UserInfoCmp extends PBUserInfoCmp {

    uname = "";

    show(p: PBPlayerInfoVo) {
        super.show(p);
        if (p) {
            this.uname = p.uinfo.uname;

            if (p.uid === cc.vv.UserManager.uid) {
                cc.find("label_bg", this.node).height = 90;
            }
        }
    }

    /**
     * 更新金币
     */
    updateCoin(p: PBPlayerInfoVo) {
        if (p && this.coin_node) {
            let label = cc.find("label", this.coin_node).getComponent(cc.Label);
            label.string = Global.FormatNumToComma(p.coin);
        }
    }

    /**
     * 显示玩家特征
     */
    feature(p: PBPlayerInfoVo) {

    }

    /**
     * 加金币动画
     */
    playAddCoin(val){
        if(val != 0){
            let fly_score = cc.find("fly_score",this.node)
            fly_score.getComponent("Table_FlyScore").setScore(val)
        }

        if(val > 0){
            this.playWinHit()
        }
    }

    playWinHit(){
        let node = cc.find("win_hit",this.node)
        node.active = true
        let spcmp = node.getComponent(sp.Skeleton)
        spcmp.setAnimation(0,"animation",false)
        spcmp.setCompleteListener((tck) => {
            node.active = false
        })
    }

    // 隐藏头像昵称
    hideAvatarName(bHide){
        // this.userAvatar.hideAvatar(bHide);
        this.label_name.string = bHide?"unknown":this.uname;
        let default_icon = cc.find("default_icon",this.node);
        if(default_icon) default_icon.active = bHide;

        this.coin_node.active = !bHide;
        cc.find("label_bg", this.node).height = bHide?45:90;
        cc.find("head_icon", this.node).active = !bHide;
    }

    // 设置观战时玩家头像状态
    showWather(bShow) {
        let watcher_head = cc.find("node_watcher_head", this.node);
        if(watcher_head) watcher_head.active = bShow;

        if(this.coin_node) this.coin_node.active = !bShow;
        if(this.label_name) this.label_name.node.active = !bShow;
        cc.find("label_bg", this.node).active = !bShow;
    }

    // update (dt) {}
}
