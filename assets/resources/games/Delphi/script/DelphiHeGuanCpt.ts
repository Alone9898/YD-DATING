
const { ccclass, property } = cc._decorator;

@ccclass
export default class DelphiHeGuanCpt extends cc.Component {

    @property(cc.Node)
    staticNode: cc.Node = null;

    @property(sp.Skeleton)
    skeCpt: sp.Skeleton = null;

    @property(cc.Node)
    dealerNode: cc.Node = null;

    get bankerPos() {
        return this.dealerNode.convertToWorldSpaceAR(cc.v3(0, 0));
    }

    onLoad() {
        this.skeCpt.setCompleteListener((event) => {
            let animName = event.animation.name;
            if (animName == "animation2" || animName == "animation3") {
                this.close();
            }
        });
    }

    //荷官动画 展示
    run(AnimType: number, loop = true) { // 1 发牌  2 开始游戏  3  一轮结束
        this.skeCpt.node.active = true;
        this.staticNode.active = false;
        this.skeCpt.setAnimation(0, "animation" + AnimType, loop);
    }

    close() {
        this.skeCpt.node.active = false;
        this.staticNode.active = true;
    }
}
