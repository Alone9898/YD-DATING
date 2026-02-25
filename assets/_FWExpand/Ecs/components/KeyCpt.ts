const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('ECS/key')
export default class KeyCpt extends cc.Component {
    @property
    key: string = '';
}
