
const { ccclass, property } = cc._decorator;

@ccclass
export default class DeskLightCpt extends cc.Component {

    @property(cc.Node)
    lightNode: cc.Node = null;


    trunTo(pos: cc.Vec3, animTime = 0.1) {
        this.lightNode.active = true;
        let endAngle = cc.Vec3.UP.signAngle(pos.sub(this.node.position)) * 180 / Math.PI;
        if (animTime > 0) {
            this.lightNode.stopAllActions();
            cc.tween(this.lightNode).to(animTime, { angle: endAngle }).start();
        } else {
            this.lightNode.angle = endAngle;
        }

    }

    close() {
        this.lightNode.angle = 0;
        this.lightNode.active = false;
    }

}
