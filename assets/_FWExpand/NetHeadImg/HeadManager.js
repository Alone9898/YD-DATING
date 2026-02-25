cc.Class({
    extends: cc.Component,

    statics: {

        init() {
            this._downed_list = []  //已完成下载的列表
            this._downfail_list = []  //下载失败列表
            this._downing_list = []  //正在下载的列表
        },

        //移除监听
        removeObserver(observer, url) {
            if (url) {
                //删除url下的observer
                for (let i = this._downing_list.length - 1; i >= 0; i--) {
                    let item = this._downing_list[i]
                    if (item.url == url) {
                        let observers = item.observers
                        let index = observers.indexOf(observer)
                        if (index > -1) {
                            observers.splice(index, 1)
                            if (observers.length <= 0) {  //如果监听者被全部移除，则该下载项也移除
                                this._downing_list.splice(i, 1)
                            }
                        }
                        break
                    }
                }
            } else {
                //删除所有observer
                for (let i = this._downing_list.length - 1; i >= 0; i--) {
                    let observers = this._downing_list[i].observers
                    let index = observers.indexOf(observer)
                    if (index > -1) {
                        observers.splice(index, 1)
                        if (observers.length <= 0) {  //如果监听者被全部移除，则该下载项也移除
                            this._downing_list.splice(i, 1)
                        }
                    }
                }
            }
        },

        //是否已经下载过
        checkDownloaded(url) {
            return (this._downed_list.indexOf(url.trim()) > -1 || this._downfail_list.indexOf(url.trim()) > -1)
        },

        //下载
        download(observer, uid, url) {
            url = url.trim()
            let exist = false
            for (let item of this._downing_list) { //正在下载
                if (item.url == url) {
                    exist = true
                    //加入监听
                    if (item.observers.indexOf(observer) < 0) {
                        item.observers.push(observer)
                    }
                }
            }
            if (!exist) {
                //加入下载队列
                let item = {
                    uid: uid,
                    url: url,
                    observers: []
                }
                item.observers.push(observer)
                this._downing_list.push(item)

                //开始下载
                this._downloadImage(uid, url)
            }
        },

        downloadImmediate(uid, url) {
            this._downloadImage(uid, url)
        },

        _onDownloadSucc(url) {
            for (let i = this._downing_list.length - 1; i >= 0; i--) {
                let item = this._downing_list[i]
                if (item.url == url) {
                    for (let observer of item.observers) {
                        observer.onDownloaded(true, item.uid, item.url)
                    }
                    this._downing_list.splice(i, 1)
                    break
                }
            }
            cc.log("download succ: " + url)
        },

        _onDownloadFail(url) {
            let self = this
            for (let i = this._downing_list.length - 1; i >= 0; i--) {
                let item = this._downing_list[i]
                if (item.url == url) {
                    for (let observer of item.observers) {
                        observer.onDownloaded(false, item.uid, item.url)
                    }
                    this._downing_list.splice(i, 1)
                    // 记录下载失败
                    if (self._downfail_list.indexOf(url) < 0) {
                        self._downfail_list.push(url)
                    }
                    break
                }
            }

            cc.log("download fail: " + url)
        },

        _downloadImage(uid, url, redircturl) {
            let self = this
            //从远程下载(包括更新)
            let xhr = cc.loader.getXMLHttpRequest()
            xhr.open("GET", redircturl || url, true)
            //xhr.withCredentials = true
            xhr.timeout = 15000;
            xhr.responseType = 'arraybuffer'
            xhr.onreadystatechange = function () {
                console.log("download xhr.status " + xhr.status, xhr.readyState)
                if (xhr.readyState === 4) {
                    if ((xhr.status >= 200 && xhr.status < 300)) {
                        if (typeof xhr.response !== 'undefined') {
                            //保存到文件
                            if (self._saveFile(uid, url, xhr.response)) {
                                //下载完成
                                if (self._downed_list.indexOf(url) < 0) {
                                    self._downed_list.push(url)
                                }
                                //间隔一帧加载
                                self._onDownloadSucc(url)
                            } else {
                                console.log("save image file fail:" + url)
                                self._onDownloadFail(url)
                            }
                        } else {
                            cc.log("download image is null:" + url)
                            self._onDownloadFail(url)
                        }
                    } else if ((xhr.status >= 300 && xhr.status <= 303) || xhr.status == 307) {
                        //重定向（测试发现只有android会302重定向；h5,win,ios等其他平台都是200）
                        let location = xhr.getResponseHeader("Location")
                        if (location) {
                            console.log("redirect location: " + location)
                            self._downloadImage(uid, url, location)
                        } else {
                            cc.log("download image fail:" + url)
                            self._onDownloadFail(url)
                        }
                    } else {
                        cc.log("download image fail:" + url)
                        self._onDownloadFail(url)
                    }
                }
            }
            xhr.ontimeout = function () {
                self._onDownloadFail(url)
                cc.log("download image timeout:" + url)
            }
            xhr.onerror = function () {
                self._onDownloadFail(url)
                cc.log("download image error:" + url)
            }
            xhr.send()
        },

        _saveFile: function (uid, url, data) {
            if (CC_JSB) {
                let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
                let pathfile = path + md5(url) + ".jpg";
                cc.log("save file", pathfile)

                if (!jsb.fileUtils.isDirectoryExist(path)) {
                    jsb.fileUtils.createDirectory(path)
                }

                if (typeof data !== 'undefined') {
                    if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), pathfile)) {
                        return true
                    }
                }
                return false
            }
        },

    }

});
