/**
 * 网络资源请求工具 支持重试
 */
export class NetResLoader {
    _reqParam:any = null;    // 请求参数
    _cmpHandler:Function = null;     // 回调
    _retryCnt = 1;           // 重试次数
    request(reqParam:any, cb:Function, retryCnt=1) {
        this._reqParam = reqParam;
        this._cmpHandler = cb;
        this._retryCnt = retryCnt;

        this._startLoad();
    }

    _startLoad() {
        cc.loader.load(this._reqParam, (err, res) => {
            if (!err) {
                if(cc.isValid(this._cmpHandler)) {
                    this._cmpHandler(err, res);
                }else {
                    cc.log("#资源加载成功--请求已经被停止#")
                }
                this.clear();
            } else {
                cc.log("图像加载失败出错");
                cc.log(err);
                if(this._retryCnt > 0) {
                    this._retryCnt--;
                    cc.log("开始重试");
                    this._startLoad();
                }else {
                    if(cc.isValid(this._cmpHandler)) {
                        this._cmpHandler(err, res);
                    }else {
                        cc.log("#资源加载失败---请求已经被停止#")
                    }
                    this.clear();
                }
            }
        });
    }

    break() {
        this.clear();
    }

    clear() {
        this._retryCnt = 0;
        this._reqParam = null;
        this._cmpHandler = null;
    }
}