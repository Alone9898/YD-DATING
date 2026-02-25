const { ccclass, property } = cc._decorator;

@ccclass
export default class UserExpRule extends cc.Component {

    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    titleLabel2: cc.Label = null;
    private type: string;
    @property(cc.Node)
    listViewNode: cc.Node = null;
    listView: any;
    @property(cc.Label)
    tipStr: cc.Label = null;

    protected onLoad(): void {
        this.listView = this.listViewNode.getComponent("ListView");
    }

    listData = [];

    setType(type, str?) {
        this.type = type;
        if(this.type == "coin"){
            this.titleLabel.node.active = false;
            this.titleLabel2.node.active = false;
            this.listViewNode.active = false;

            this.tipStr.node.active = true;
            this.tipStr.string = str
            return;
        }

        this.tipStr.node.active = false;

        if (this.type == "vip") {
            this.titleLabel.string = "VIP"
        } else if (this.type == "league") {
            this.titleLabel.string = ___("段位")
        } else if (this.type == "level") {
            this.titleLabel.string = ___("等级")
        }
        if (this.type == "vip") {
            this.listData = Global.deepClone(cc.vv.UserConfig.vipInfoConfig);
            this.listData.shift()
        } else if (this.type == "league") {
            this.listData = Global.deepClone(cc.vv.UserConfig.rankConfig);
            this.listData.shift()
        } else if (this.type == "level") {
            this.listData = Global.deepClone(cc.vv.UserConfig.exp_cfg);
            this.listData.shift()
            this.listData.pop()
        }
        this.listView.numItems = this.listData.length;
    }

    onUpdataItem(item, index) {
        let data = this.listData[index];
        if (this.type == "vip") {
            cc.find("name", item).getComponent(cc.Label).string = `VIP${index + 1}`
            cc.find("value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.expup);
        } else if (this.type == "league") {
            cc.find("name", item).getComponent(cc.Label).string = data.text;
            cc.find("value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.score);
        } else if (this.type == "level") {
            cc.find("name", item).getComponent(cc.Label).string = `Level${data[0]}`
            cc.find("value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data[1]);
        }
    }

    // update (dt) {}
}
