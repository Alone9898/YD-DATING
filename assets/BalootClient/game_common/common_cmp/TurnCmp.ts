const { ccclass, property } = cc._decorator;

export interface TurnCmpItemData {
    title: string;
    value: number;
}

@ccclass
export default class TurnCmp extends cc.Component {
    static EVT_CHANGE: string = "evt_change";

    @property(cc.Label)
    currSelectLabel: cc.Label = null;

    @property(cc.Button)
    preBtn: cc.Button = null;

    @property(cc.Button)
    nextBtn: cc.Button = null;

    _dataList: Array<TurnCmpItemData | string | number>; //数据列表
    _currSelectIndex = 0;
    private _callback: Function;
    onLoad() {
        this.preBtn.node.on("click", () => {
            this._changeIndex(-1);
        }, this);
        this.nextBtn.node.on("click", () => {
            this._changeIndex(1);
        }, this);
    }

    _changeIndex(val: number) {
        this._currSelectIndex += val;
        if (this._currSelectIndex < 0) {
            this._currSelectIndex = 0;
        } else if (this._currSelectIndex >= this._dataList.length) {
            this._currSelectIndex = this._dataList.length - 1;
        }

        this.preBtn.interactable = this._currSelectIndex != 0;
        this.nextBtn.interactable = this._currSelectIndex < this._dataList.length - 1;
        this._refreshView();
        this._sendChangeEvt();
    }

    _sendChangeEvt() {
        let selectData = this.getCurrSelectData();
        let d = selectData as TurnCmpItemData;
        let msg: any;
        if (d) {
            msg = { title: d.title, value: d.value };
        } else {
            msg = selectData;
        }
        let data = {
            currIndex: this._currSelectIndex,
            msg: msg
        }
        this.node.emit(TurnCmp.EVT_CHANGE, data);
    }

    _refreshView() {
        if (!this.currSelectLabel) {
            return;
        }
        if (!this._dataList || this._dataList.length < 1) {
            return;
        }
        let data = this._dataList[this._currSelectIndex];
        if (this._callback) this._callback(data, this._currSelectIndex);
        let str = "";
        if (typeof data === "number") {
            str = data + "";
        } else if (typeof data == "string") {
            str = data;
        } else {
            let itemData = data as TurnCmpItemData;
            if (itemData) {
                str = itemData.title;
            }
        }
        this.currSelectLabel.string = str;
    }

    setDataList(dataList: Array<TurnCmpItemData | string | number>, selectIndex: number = 0) {
        this._dataList = dataList;
        this.setIndex(selectIndex);
    }

    setIndex(index: number) {
        this._currSelectIndex = index;
        // this._refreshView();
        this._changeIndex(0);
    }

    getCurrSelectData(): TurnCmpItemData | string | number | any {
        return (this._dataList && this._dataList.length > 0 && this._currSelectIndex < this._dataList.length) ? this._dataList[this._currSelectIndex] : null;
    }


    setSelectCallback(callback: Function) {
        this._callback = callback;
    }
}
