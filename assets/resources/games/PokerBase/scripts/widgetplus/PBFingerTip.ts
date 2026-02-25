const { ccclass, property } = cc._decorator;

/**
 * 手指提示
 */
@ccclass
export class PBFingerTip extends cc.Component {
    @property(sp.Skeleton)
    fingerSpine:sp.Skeleton = null;

    onLoad() {
        this.hide();
    }

    hide() {
        this.unscheduleAllCallbacks();
        this.fingerSpine.node.active = false;
    }

    /**
     * 显示倒计时
     * @param time 倒计时时间
     */
    show(refPos:cc.Vec2|cc.Node, autoHideTime = 4) {
        if(!refPos) {
            this.hide();
            return;
        }
        let pos = refPos;
        if(refPos instanceof cc.Node) {
            pos = refPos.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        pos = this.node.parent.convertToNodeSpaceAR(pos as cc.Vec2);
        this.node.x = pos.x;
        this.node.y = pos.y;
        this.fingerSpine.node.active = true;
        this.fingerSpine.setAnimation(0, "animation4", true);
        this.unscheduleAllCallbacks();
        this.scheduleOnce(()=>{
            this.hide();
        }, autoHideTime);
    }
}