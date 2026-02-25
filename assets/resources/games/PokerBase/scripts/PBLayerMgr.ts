const { ccclass, property } = cc._decorator;

/**
 * 层管理器
 */
@ccclass
export class PBLayerMgr extends cc.Component {
    @property(cc.Node)
    top_layer: cc.Node = null; // 顶层

    @property(cc.Node)
    common_ani_layer: cc.Node = null; // 通用动画层

    protected onLoad(): void {
        if(!this.top_layer) {
            this.top_layer = cc.find("Canvas");
        }

        if(!this.common_ani_layer) {
            this.common_ani_layer = this.node;
        }
    }
}