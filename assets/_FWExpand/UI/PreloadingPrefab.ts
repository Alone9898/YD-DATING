const { ccclass, property, menu } = cc._decorator;

enum PreloadingType {
    Prefab = 1,
    Path = 2,
}

@ccclass
@menu("通用/预制体加载")
export class PreloadingPrefab extends cc.Component {

    @property({ type: cc.Enum(PreloadingType) })
    type: PreloadingType = PreloadingType.Prefab;
    @property({
        type: cc.Prefab,
        visible() {
            return this.type === PreloadingType.Prefab;
        },
    })
    prefab: cc.Prefab = null;

    @property({
        visible() {
            return this.type === PreloadingType.Path;
        },
    })
    path = "";

    @property
    isAndroidReview = false;
    @property
    isIOSReview = false;


    onLoad() {
        if (this.isAndroidReview && Global.isAndroidReview) {
            this.getComponent(cc.Sprite).enabled = false;
            return;
        }
        if (this.isIOSReview && Global.isIOSReview) {
            this.getComponent(cc.Sprite).enabled = false;
            return;
        }
        this.updateView();
    }

    async updateView() {
        this.getComponent(cc.Sprite).enabled = false;
        if (this.type == PreloadingType.Path) {
            this.prefab = await cc.vv.ResManager.loadPrefab(this.path);
        }
        if (!!this.prefab) {
            let node = cc.instantiate(this.prefab);
            node.parent = this.node;
            node.position = cc.v3(0, 0);
        }
    }
}