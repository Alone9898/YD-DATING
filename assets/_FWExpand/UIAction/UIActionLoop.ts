import { ActionType, EasingType } from "./ActionType";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("UI动作/持续")
export default class UIActionLoop extends cc.Component {
    @property
    auto = true;
    @property
    animTime: number = 0.3;

    @property({
        type: cc.Enum(ActionType),
        displayName: "动作",
    })
    actionType = ActionType.None;

    @property({
        type: cc.Enum(EasingType),
        displayName: "缓动",
    })
    easingType = EasingType.None;

    @property({
        type: cc.Vec3,
        displayName: "起始偏移位置",
        visible() {
            return this.actionType == ActionType.MOVE;
        },
    })
    offsetPos: cc.Vec3 = cc.Vec3.ZERO;


    private initPos: cc.Vec3 = null;

    onLoad() {
        let widget = this.getComponent(cc.Widget)
        if (widget) widget.updateAlignment();
        this.initPos = this.node.position;
        if (this.actionType == ActionType.MOVE) {
            this.node.position = this.initPos.add(this.offsetPos);
        }
    }

    start() {

    }

    protected onEnable(): void {


        if (this.auto) {
            this.run();
        }
    }

    protected onDisable(): void {

    }

    run() {
        this.node.stopAllActions();

        let easingName = undefined;
        if (this.easingType == EasingType.sineOut) {
            easingName = "sineOut";
        } else if (this.easingType == EasingType.quadOut) {
            easingName = "quadOut";
        } else if (this.easingType == EasingType.backOut) {
            easingName = "backOut";
        } else if (this.easingType == EasingType.backIn) {
            easingName = "backIn";
        }
        let tween = cc.tween(this.node);
        if (this.actionType == ActionType.SCALE) {
            this.node.scale = 0.2;
            tween.to(this.animTime, { scale: 1 }, { easing: easingName })
        } else if (this.actionType == ActionType.MOVE) {
            this.node.position = this.initPos.add(this.offsetPos);
            tween.to(this.animTime, { position: this.initPos }, { easing: easingName })
        }
        tween.repeatForever().start();
    }

}
