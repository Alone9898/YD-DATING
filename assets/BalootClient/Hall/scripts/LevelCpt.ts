const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelCpt extends cc.Component {

    @property(cc.Label)
    value: cc.Label = null;
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;


    level: number;

    setLevelExp(levelExp) {
        this.level = cc.vv.UserConfig.totalExp2Level(levelExp);
        this.updateView();
    }
    setLevel(level) {
        this.level = level;
        this.updateView();
    }

    updateView() {
        this.spine.setAnimation(0, cc.vv.UserConfig.getLevelSpineName(this.level), true);
        this.value.string = "Lv" + this.level.toString();
    }

    // update (dt) {}
}
