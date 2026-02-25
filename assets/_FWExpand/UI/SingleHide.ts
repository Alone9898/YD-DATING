const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("UI/SingleHide")
export default class SingleHide extends cc.Component {

    onLoad() {
        this.node.active = !Global.isSingle();
    }

}
