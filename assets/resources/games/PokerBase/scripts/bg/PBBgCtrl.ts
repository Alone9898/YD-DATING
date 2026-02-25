// import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";

const { ccclass, property } = cc._decorator;

/**
 * 背景控制
 */
@ccclass
export class PBBgCtrl extends cc.Component {
    // _bg:ImgSwitchCmpTS = null; // 这个地方不用NetImg组件是为了解决进入游戏时闪一下的问题
    _bgNode: cc.Node;
    _bgName = "";
    onLoad() {
        // this._bg = this.node.getChildByName("bg").getComponent(ImgSwitchCmpTS);
        this._bgNode = this.node.getChildByName("bg")
        let logo = this.node.getChildByName("logo");
        logo && (logo.active = false);
        this.updateBg();
    }

    changeSkin(bgName = "") {
        this._bgName = bgName;
        this.updateBg();
    }

    updateBg() {
        if (this._bgNode && this._bgName) {
            let deskFrameMap = cc.director.getScene().getComponentInChildren("DeskFrameMap");
            if (deskFrameMap && deskFrameMap[this._bgName]) {
                this._bgNode.getComponent(cc.Sprite).spriteFrame = deskFrameMap[this._bgName];
            } else {
                Global.comloadsprite("BalootClient/BaseRes/images/poker_desk/" + this._bgName, this._bgNode)
            }

        }
    }
}