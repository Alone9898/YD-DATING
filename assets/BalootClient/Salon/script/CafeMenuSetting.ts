const { ccclass, property } = cc._decorator;

@ccclass
export default class CafeMenuSetting extends cc.Component {

    @property(cc.Node)
    listNode: cc.Node = null;

    menuDataList: { gameid: number; salonImg: string; title: string; }[];
    callback: Function;
    listView: any;


    onLoad() {
        this.listView = this.listNode.getComponent("ListView")
    }

    onInit(unPinGameIds, selectGameIds) {
        // 配置菜单
        this.menuDataList = cc.vv.UserConfig.getCafeMenuConfig(unPinGameIds);
        this.listView.numItems = this.menuDataList.length;
        // 设置选中数据
        let sIds = [];
        for (let i = 0; i < this.menuDataList.length; i++) {
            const _item = this.menuDataList[i];
            if (selectGameIds.indexOf(_item.gameid) >= 0) {
                sIds.push(i);
            }
        }
        this.listView.setMultSelected(sIds, true);
    }

    onUpdateItem(item, index) {
        let data = this.menuDataList[index];
        cc.vv.UserConfig.setGameCafeFrame(cc.find("icon", item).getComponent(cc.Sprite), data.gameid);
        cc.find("name", item).getComponent(cc.Label).string = data.title;
    }

    onSelectItem(item, index, oldIndex) {

    }

    getSelectGameIds() {
        let selectIdList = this.listView.getMultSelected() || [];
        selectIdList.sort((a, b) => { return a - b; })
        let gameids = [];
        for (const index of selectIdList) {
            gameids.push(this.menuDataList[index].gameid);
        }
        return gameids;
    }


    // update (dt) {}
}
