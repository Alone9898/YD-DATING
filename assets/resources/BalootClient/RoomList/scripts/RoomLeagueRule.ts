import RewardListCpt from "../../../../_FWExpand/UI/RewardListCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomLeagueRule extends cc.Component {
    @property(cc.Node)
    listViewNode: cc.Node = null;

    private listView: any;

    onLoad() {
        this.listView = this.listViewNode.getComponent("ListView");
        this.listView.numItems = cc.vv.UserConfig.leagueRewardConfig.length;
    }

    onUpdateItem(item, index) {
        let data = cc.vv.UserConfig.leagueRewardConfig[index];
        cc.find("name", item).getComponent(cc.Label).string = data.name;
        cc.vv.UserConfig.setRankBigFrame(cc.find("icon", item).getComponent(cc.Sprite), data.level);

        let nodeMap = item.getComponentInChildren(RewardListCpt).updateView(data.rewards);
        if (nodeMap[1]) nodeMap[1].icon.scale = 0.4;
        if (nodeMap[25]) nodeMap[25].icon.scale = 0.4;
        if (nodeMap[53]) nodeMap[53].icon.scale = 0.3;
        if (nodeMap[54]) nodeMap[54].icon.scale = 0.5;
        if (nodeMap[40]) nodeMap[40].icon.scale = 0.3;
        if (nodeMap[55]) nodeMap[55].icon.scale = 0.45;
    }

}
