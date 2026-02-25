const { ccclass, property } = cc._decorator;

@ccclass
export default class MainSpriteTab extends cc.Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(cc.Label)
    value: cc.Label = null;

    @property(cc.Label)
    value2: cc.Label = null;

    @property
    skin: string = '1';


    onLoad() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        // 更新用户信息成功
        eventListener.registerEvent("USER_EXP_CHANGE", this.USER_EXP_CHANGE, this);
        this.USER_EXP_CHANGE();
    }

    protected onEnable(): void {
        this.USER_EXP_CHANGE();
    }

    USER_EXP_CHANGE() {
        let level = cc.vv.UserManager.svip;
        this.spine.setSkin(this.skin);
        this.spine.setAnimation(0, cc.vv.UserConfig.getLevelSpineName(level), true);
        this.value.string = "VIP" + level.toString();
        this.value2.string = "VIP" + level.toString();
    }

}
