// import World from "./World";

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass('PrefabCfgItem')
export class PrefabCfgItem {
    // key
    @property({ displayName: 'Key' })
    key: string = '';
    // 范围
    @property({ type: cc.Prefab, displayName: '预制体' })
    prefab: cc.Prefab = null;
}

@ccclass
@menu('ECS/配置/预制体配置')
// @requireComponent(World)
export default class PrefabCfgCpt extends cc.Component {
    @property({
        type: [PrefabCfgItem],
    })
    config: PrefabCfgItem[] = [];
}
