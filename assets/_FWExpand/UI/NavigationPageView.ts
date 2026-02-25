import NavigationPageItem from "./NavigationPageItem";

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.ScrollView)
@menu("UI/NavigationPageView")
export default class NavigationPageView extends cc.Component {
    @property
    openPages: string = "";

    addNavPage(node: cc.Node) {
        let itemCpt = node.getComponent(NavigationPageItem)
        if (!itemCpt) return;
        itemCpt.onInit();
        itemCpt.reset();
        node.parent = this.getComponent(cc.ScrollView).content;
    }

    onLoad() {
        cc.log("NavigationPageView", "onLoad")
        let cpts = this.getComponentsInChildren(NavigationPageItem);
        for (const cpt of cpts) {
            cpt.onInit();
        }
        this.scheduleOnce(() => {
            let pages = this.openPages.split(",");
            for (const index of pages) {
                let cpt = cpts[parseInt(index)];
                if (cpt) {
                    cpt.setSwitch(true, 0);
                }
            }
        });
    }

    showPage(index = -1) {
        let cpts = this.getComponentsInChildren(NavigationPageItem);
        let indexCpt = cpts[index];
        // 移动到对应位置
        if (indexCpt) {
            let scrollCpt = this.getComponent(cc.ScrollView);
            let layout = scrollCpt.content.getComponent(cc.Layout)
            layout.updateLayout();

            scrollCpt.stopAutoScroll();
            scrollCpt.scrollToOffset(cc.v2(0, 0), 0.1);

            // let callback = () => {
            //     scrollCpt.stopAutoScroll();
            //     scrollCpt.scrollToOffset(cc.v2(0, Math.abs(indexCpt.node.position.y)), 0.1);
            //     scrollCpt.content.off(cc.Node.EventType.SIZE_CHANGED, callback, this);
            // }
            // callback();
            // scrollCpt.content.off(cc.Node.EventType.SIZE_CHANGED, callback, this);
            // scrollCpt.content.on(cc.Node.EventType.SIZE_CHANGED, callback, this);
        }
        for (let i = 0; i < cpts.length; i++) {
            if (i == index) {
                cpts[i].setSwitch(true, 0);
            } else {
                cpts[i].setSwitch(false, 0);
            }
        }
    }

}
