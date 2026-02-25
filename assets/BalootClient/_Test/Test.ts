import Table_CountDown from "../../resources/Table_Common/TableBase/Table_CountDown";
import NavigationPageView from "../../_FWExpand/UI/NavigationPageView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test extends cc.Component {

    @property(NavigationPageView)
    navView: NavigationPageView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    index: number = 0;

    onLoad() { }

    start() {
        // cc.director.getScene().getComponentInChildren(Table_CountDown).show(20);
    }

    test() {
        let node = cc.instantiate(this.itemPrefab);
        cc.find("Head", node).color = new cc.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        cc.find("Sort", node).getComponent(cc.Label).string = (this.index++).toString();
        this.navView.addNavPage(node);

    }

}
