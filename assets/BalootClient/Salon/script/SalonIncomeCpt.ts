const { ccclass, property } = cc._decorator;

@ccclass
export default class SalonIncomeCpt extends cc.Component {

    @property(cc.Node)
    listNode: cc.Node = null;
    @property(cc.Node)
    noDataNode: cc.Node = null;
    @property(cc.Node)
    titleNode: cc.Node = null;
    @property(cc.Node)
    incomeNode: cc.Node = null;
    @property(cc.Label)
    incomeLabel: cc.Label = null;

    private listView: any;
    private localData: any;

    onLoad() {
        this.listView = this.listNode.getComponent("ListView");
        // 监听请求数据
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SALON_INCOME_RECORD, this.SALON_INCOME_RECORD, this);
        cc.vv.NetManager.sendAndCache({ c: MsgId.SALON_INCOME_RECORD }, true);
    }

    SALON_INCOME_RECORD(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        this.localData = msg;
        this.updateView();
    }


    updateView() {
        // 请求数据
        if (this.localData.data.length <= 0) {
            this.noDataNode.active = true;
            this.incomeNode.active = false;
            this.titleNode.active = false;
        } else {
            this.noDataNode.active = false;
            this.incomeNode.active = true;
            this.titleNode.active = true;
            // 总收益
            this.incomeLabel.string = Global.FormatNumToComma(this.localData.income.coin);
        }
        this.listView.numItems = this.localData.data.length;
    }


    onUpdateItem(item, index) {
        let data = this.localData.data[index];
        cc.find("time", item).getComponent(cc.Label).string = Global.formatTime("MM/dd hh:mm", data[4]);
        cc.find("game", item).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(data[1]);
        cc.find("coin", item).getComponent(cc.Label).string = Global.FormatNumToComma(data[2]);
        cc.find("exp", item).getComponent(cc.Label).string = Global.FormatNumToComma(data[3]);
    }

}
