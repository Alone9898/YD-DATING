const { ccclass, property } = cc._decorator;


/**
 * 邀请弹窗
 */
@ccclass
export class PBRpFullScreenAni extends cc.Component {
    static PREFAB_PATH = "games/PokerBase/prefabs/rp_full_screen_ani";
    @property(cc.Node)
    panel:cc.Node = null;
    @property(sp.Skeleton)
    spine_bg:sp.Skeleton = null;
    @property(sp.Skeleton)
    spine_effct:sp.Skeleton = null;
    @property(cc.Label)
    label:cc.Label = null;
    @property(cc.Node)
    rpIcon:cc.Node = null;

    protected onLoad(): void {
        this.rpIcon.active = false;
        this.label.node.active = false;
    }

    _rpVal = 0;
    start() {
        this.label.string = `Rp${this._rpVal}`;
        this.spine_bg.setAnimation(0, "baojiang_d", false);
        this.spine_bg.addAnimation(0, "baojiang_loop_d", true);
        this.spine_effct.setAnimation(0, "baojiang_t", false);
        this.spine_effct.addAnimation(0, "baojiang_loop_t", true);
        this.rpIcon.active = true;
        this.rpIcon.scale = 0;
        cc.tween(this.rpIcon)
            .delay(0.3)
            .to(0.3, {scale:1}, {easing:"backOut"})
            .delay(0.5)
            .call(()=>{
                this.label.node.active = true;
                this.label.node.opacity = 1;
                cc.tween(this.label.node)
                        .to(0.3, {scale:1, opacity:0xff}, {easing:"backOut"})
                        .start();
                })
                .start();
        this.scheduleOnce(()=>{
            this.close();
        }, 2);
    }

    openParam(rpVal:number) {
        this._rpVal = rpVal;
    }

    close() {
        cc.tween(this.panel)
            .to(0.2, {scale:0})
            .call(()=>{
                cc.vv.PopupManager.removePopup(this.node);
            })
            .start();
    }

}