cc.Class({
    extends: cc.Component,

    properties: {
        _url: null
    },

    onDestroy() {
        cc.vv.HeadManager.removeObserver(this) //移除监听
    },

    load(uid, url, callback, force) {
        if (CC_JSB) {
            this._loadHeadImageLocal(uid, url, callback, force)
        } else {
            this._loadHeadImageWeb(uid, url, callback)
        }
    },

    checkHeadFileExist(uid) {
        let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
        let pathfile = path + uid + ".jpg";
        return jsb.fileUtils.isFileExist(pathfile)
    },

    //下载完成后的通知
    onDownloaded(result, uid, url) {
        cc.log("onDownloaded", result, uid, url)
        if (result) {
            let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
            let pathfile = path + md5(url) + ".jpg";
            cc.loader.removeItem(pathfile) //删除缓存
            this._loadHeadImageFromFile(pathfile, this._callback)
        } else {
            if (this._callback) this._callback(false)
            this._callback = null
        }
    },

    _loadHeadImageWeb(uid, url, callback) {
        let spr_head = this.node.getComponent(cc.Sprite)
        // 如果存在请求 则取消上一次请求
        spr_head._reqHandle && spr_head._reqHandle.rejectFunc();
        // 请求获取网络图片
        spr_head._reqHandle = cc.vv.ResManager.loadImage(url, (err, res) => {
            if (res) {
                if (cc.isValid(spr_head)) {
                    spr_head.spriteFrame = new cc.SpriteFrame(res);
                }
                if (callback) callback(true)
            } else {
                if (callback) callback(false)
            }
            // 请求结束后删除请求句柄
            spr_head._reqHandle = null;
        });
    },

    //从缓存文件加载(不在包里)
    _loadFromFile(url, callback) {
        let tempArgs = { url: url }
        new Promise((resolve, reject) => {
            tempArgs.rejectFunc = () => {
                reject(0, "主动取消加载");
            };
            cc.loader.load(url, (err, res) => {
                if (err) { reject(-1, err); return; }
                resolve(res);
            });
        }).then((res) => {
            callback(null, res);
        }).catch((code, err) => {
            if (code < 0) {
                cc.warn(err, tempArgs.url);
                callback(err);
            }
        });
        return tempArgs;
    },

    _loadHeadImageFromFile(pathfile, callback) {
        let self = this
        if (!cc.isValid(this.node)) return;
        let spr_head = this.node.getComponent(cc.Sprite)
        spr_head._reqHandle && spr_head._reqHandle.rejectFunc();
        spr_head._reqHandle = this._loadFromFile(pathfile, (err, texture2D) => {
            if (texture2D) {
                if (cc.isValid(spr_head) && texture2D) {
                    spr_head.spriteFrame = new cc.SpriteFrame(texture2D)
                }
                if (callback) callback(true)
            } else {
                if (callback) callback(false)
            }
            self._callback = null  //清空保存的回调
            spr_head._reqHandle = null;
        });
    },

    _loadHeadImageLocal(uid, url, callback, force) {
        let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
        let pathfile = path + md5(url) + ".jpg";

        let fileexist = false
        //先判断本地是否存在
        if (jsb.fileUtils.isFileExist(pathfile)) {
            this._loadHeadImageFromFile(pathfile, callback)
            cc.log("load image from file succ", pathfile)
            fileexist = true
            //不return，头像可能需要更新
        }

        if (fileexist && !force) {
            //存在，本次运行期间不再下载
            cc.log("no need download: " + uid)
            return
        }
        if (this._url) {
            //需要先移除就的绑定关系（List里的节点复用）
            cc.vv.HeadManager.removeObserver(this, this._url)
        }
        this._url = url
        //1,存在，但未更新; 2,不存在。 这两种情况都需要下载
        if (!fileexist) {//在_loadHeadImageFromFile里回调过，这里不二次回调
            this._callback = callback  //保存回调
        }
        cc.vv.HeadManager.download(this, uid, url)
    },
});
