export interface ISyncReqestParam {
    c: number
}
export class SyncReqest {
    cmd = 0;
    timeOut = 10;
    timeOutId: any = null;
    _dataHandler: Function = null;

    constructor() {

    }

    /**
     * 模拟post请求
     */
    post(param: ISyncReqestParam, timeOut = 10, isNotShowShield = true) {
        this.cmd = param.c;
        this.timeOut = timeOut;

        cc.vv.NetManager.registerMsg(param.c, this._onMsg, this, false);
        cc.vv.NetManager.send(param, isNotShowShield);
        this._startTimeOut();
        return new Promise(res => {
            this._dataHandler = res;
        })
    }

    _startTimeOut() {
        this.timeOutId = setTimeout(() => {
            console.log("请求超时:", this.cmd);
            cc.vv.NetManager.unregisterMsg(this.cmd, this._onMsg, false, false);
            this._dataHandler && this._dataHandler(null);
            this.destroy();
        }, this.timeOut * 1000);
    }

    _onMsg(data: any) {
        clearTimeout(this.timeOutId);
        cc.vv.NetManager.unregisterMsg(this.cmd, this._onMsg, false, false);
        this._dataHandler && this._dataHandler(data);
        this.destroy();
    }

    destroy() {
        this._dataHandler = null;
    }
}