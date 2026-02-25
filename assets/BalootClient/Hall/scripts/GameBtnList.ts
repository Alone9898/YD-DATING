const { ccclass, property } = cc._decorator;

@ccclass
export default class GameBtnList extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;
    @property(cc.Node)
    pokerTitleNode: cc.Node = null;
    @property(cc.Node)
    moreTitleNode: cc.Node = null;

    private listView: any;

    type: number = 0;
    listData: any[];

    onLoad() {
        this.listView = this.listViewNode.getComponent("ListView");
    }

    onInit(type) {
        this.type = type;
        // 获取
        this.listData = [];
        for (const item of cc.vv.UserManager.gameList) {
            if (item.ctype == this.type) {
                this.listData.push(item);
            }
        }
        this.listData.sort((a, b) => {
            return a.ord - b.ord;
        })
        this.updateView();
    }

    updateView() {
        this.pokerTitleNode.active = this.type == 2;
        this.moreTitleNode.active = this.type == 3;
        this.listView.numItems = this.listData.length;
    }

    onUpdateItem(item, index) {
        let data = this.listData[index];
        item.getComponent("RoomTypeBtn").gameid = data.id;
        item.getComponent("RoomTypeBtn").updateView();
    }

    // update (dt) {}
}
