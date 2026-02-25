const { ccclass, property } = cc._decorator;

@ccclass
export default class UIActionMove extends cc.Component {

    private initPos: cc.Vec3 = null;

    @property(cc.Vec3)
    offsetPos: cc.Vec3 = cc.Vec3.ZERO;
    @property
    animTime: number = 0.3;

    @property
    auto = false;


    onLoad() {
        this.initPos = this.node.position;
        this.node.position = this.initPos.add(this.offsetPos);
    }

    protected onEnable(): void {
        if (this.auto) {
            this.run();
        }
    }

    run() {
        this.node.stopAllActions();
        this.node.position = this.initPos.add(this.offsetPos);
        cc.tween(this.node).to(this.animTime, { position: this.initPos }, { easing: "sineOut" }).start();
    }

}
