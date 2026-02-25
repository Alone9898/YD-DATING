const { ccclass, property } = cc._decorator;

@ccclass
export class PBAutoHost extends cc.Component {

    show() {
        if (facade.dm.tableInfo.isViewer === 1) {
            return;
        }
        this.node.active = true;
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
        });
        cc.find("robot", this.node).getComponent(sp.Skeleton).setAnimation(0, "idle", true);

        facade.playersCtrl.getPlayerByPosition(0).userInfoCmp.showAutoHost(true);
    }

    hide() {
        if (this.node.active) {
            this.node.active = false;
            this.node.off(cc.Node.EventType.TOUCH_END);
            facade.dm.msgWriter.sendCancleAutoHost();
        }
        facade.playersCtrl.getPlayerByPosition(0).userInfoCmp.showAutoHost(false);
    }

}