// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        frame_head: {  //头像数据
            default: [],
            type: cc.SpriteFrame
        },
        frame_headBg: {  //头像框
            default: [],
            type: cc.SpriteFrame,
        },
        default_head: cc.SpriteFrame,

        spr_head_bg: cc.Sprite,    //头像背景
        spr_head: cc.Sprite,    //头像
        spr_headFrame: cc.Sprite,  //头像框
        _curUrl: null,

        _pClickCall: null,  //点击回调函数

        _uid: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.vv.EventManager.on(EventId.REFRESH_PLAYER_HEAD, this.onRcvEventRefeshHead, this);
    },

    // start () {},
    // update (dt) {},

    //
    onDestroy() {
        cc.vv.EventManager.off(EventId.REFRESH_PLAYER_HEAD, this.onRcvEventRefeshHead, this);
    },

    onRcvEventRefeshHead: function (parm) {
        if (this._uid == parm.uid) {
            cc.log("onRcvEventRefeshHead", parm.uid)
            let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
            let pathfile = path + md5(parm.url) + ".jpg";
            this._loadHeadImageFromFile(parm.uid, pathfile)
        }
    },

    //设置头像
    //uid:用户uid。用来生成唯一的文件名
    //strIcon: 如果是数字，说明是机器人的头像，直接取本地，反之去网络下载
    //setHeadCall: 有些情况，设置头像的时候需要判断节点是否已经刷新成其他人的数据了。多在list中节点复用会出现，此时需要自己结合外部数据来设置
    setHead: function (uid, strIcon, setHeadCall) {
        this._uid = uid;
        if (this._curUrl == strIcon) {
            return
        }
        // strIcon = "https://graph.facebook.com/10164532601415481/picture?type=normal"
        var self = this
        self.reset()
        var nRetry = 1 //头像下载失败

        if (self._isRealNum(strIcon)) {
            //机器人头像
            var idx = Number(strIcon)
            if (idx < 1000) {   // 基础头像
                var targetFrame = self.frame_head[idx - 1]
                if (targetFrame) {
                    if (setHeadCall) {
                        setHeadCall(self._uid, targetFrame)
                    }
                    else {
                        self.spr_head.spriteFrame = targetFrame
                    }

                }
            } else {    // 卡牌头像
                let cardcfg = cc.vv.HerocardManager.getCardCfg(idx);
                cc.vv.HerocardManager.loadHeroCircleHead(self.spr_head, idx);
                cc.vv.HerocardManager.loadHeroHeadBg(self.spr_head_bg, "bg_" + cardcfg.campid);
            }
        }
        else if (strIcon && strIcon.indexOf('http') > -1) { //网络头像
            this.loadHeadImage(uid, strIcon, setHeadCall)

        }
        else {
            if (strIcon && Global.isNative() && jsb.fileUtils.isFileExist(strIcon)) {
                let url = { url: strIcon, ignoreMaxConcurrency: true }
                cc.loader.load(url, function (err, tex) {
                    if (err) return
                    let spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(tex);
                    if (setHeadCall) {
                        setHeadCall(self._uid, spriteFrame)
                    }
                    else {
                        self.spr_head.spriteFrame = spriteFrame;
                    }

                });
            }
        }
    },

    //设置头像框
    //bgIdx: 背景框的序号。如果有新的背景框，添加到spr_headFrame即可
    setHeadMask: function (bgIdx) {
        var self = this
        var targetFrame = self.frame_headBg[bgIdx]
        if (targetFrame && self.spr_headFrame) {
            self.spr_headFrame.spriteFrame = targetFrame
        }
    },

    // 设置头像成灰态
    setHeadGray: function () {
        Global.showSpriteGray(this.spr_head, true)
    },

    //设置缩放
    setScale: function (nScale) {
        var self = this
        self.node.scale = nScale
    },

    //设置点击回调
    //pCall 回调有设置的话可以点击，不设置的话，不能点击。默认关闭点击
    setClickCall: function (pCall) {
        var self = this
        self._pClickCall = pCall

        var bEnable = false
        if (pCall) {
            bEnable = true
        }
        var btn = self.node.getComponent(cc.Button)
        if (btn) {
            btn.enabled = bEnable
        }
    },

    //头像恢复到默认
    reset: function () {
        var self = this
        if (self.default_head) {
            self.spr_head.spriteFrame = self.default_head
        }
        else {
        }
    },

    //获取头像精灵
    getHeadSpr: function () {
        return this.spr_head;
    },

    onClickHead: function () {
        var self = this
        if (self._pClickCall) {
            self._pClickCall()
        }
    },

    _isRealNum(val) {
        // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
        if (val === "" || val == null) {
            return false;
        }
        if (!isNaN(val)) {
            return true;
        } else {
            return false;
        }
    },

    _loadHeadImageWeb(uid, url, callback) {
        let self = this
        let spr_head = this.spr_head
        let fixurl = url
        let arrStr = url.split('/')
        let filename = arrStr[arrStr.length - 1]
        if (filename.indexOf('.') < 0) {
            fixurl = { url: url, type: 'jpg', ignoreMaxConcurrency: true }
        }
        Global._downing_list = Global._downing_list || []
        Global._downing_list.push(uid)
        this._startDownloadImage()
        cc.loader.load(fixurl, (err, texture2D) => {
            if (!err) {
                if (cc.isValid(spr_head) && texture2D) {
                    let spriteFrame = new cc.SpriteFrame(texture2D)
                    if (callback) {
                        callback(uid, spriteFrame)
                    } else {
                        spr_head.spriteFrame = spriteFrame
                    }
                }
                self._removeFromDowningList(uid)
                self._finishDownloadImage()
            } else {
                cc.log("download head image fail", url, err)
            }
        })
    },

    _loadHeadImageFromFile(uid, pathfile, callback) {
        let spr_head = this.spr_head
        cc.loader.load(pathfile, function (err, texture2D) {
            if (!err) {
                if (cc.isValid(spr_head) && texture2D) {
                    let spriteFrame = new cc.SpriteFrame(texture2D)
                    if (callback) {
                        callback(uid, spriteFrame)
                    } else {
                        spr_head.spriteFrame = spriteFrame
                    }
                }
            } else {
                cc.log("load image from file fail: " + pathfile)
            }
        });
    },

    _removeFromDowningList(uid) {
        if (Global._downing_list) {
            let index = Global._downing_list.indexOf(uid)
            if (index > -1) {
                Global._downing_list.splice(index, 1)
            }
        }
    },

    _downloadImage(uid, url) {
        let self = this
        //从远程下载(包括更新)
        let xhr = cc.loader.getXMLHttpRequest()
        xhr.open("GET", url, true)
        //xhr.withCredentials = true
        xhr.responseType = 'arraybuffer'
        xhr.onreadystatechange = function () {
            console.log("download xhr.status " + xhr.status, xhr.readyState)
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300)) {
                    if (typeof xhr.response !== 'undefined') {
                        //保存到文件
                        if (self._saveFile(uid, url, xhr.response)) {
                            //下载完成
                            if (Global._downed_list.indexOf(uid) < 0) {
                                Global._downed_list.push(uid)
                            }
                            //通知完成
                            cc.vv.EventManager.emit(EventId.REFRESH_PLAYER_HEAD, { uid: uid, url: url })
                            self._removeFromDowningList(uid)
                        } else {
                            console.log("save image file fail:" + url)
                            self._removeFromDowningList(uid)
                        }
                        self._finishDownloadImage()
                    } else {
                        cc.log("download image is null:" + url)
                        self._removeFromDowningList(uid)
                    }
                } else if ((xhr.status >= 300 && xhr.status <= 303) || xhr.status == 307) {
                    //重定向（测试发现只有android会302重定向；h5,win,ios等其他平台都是200）
                    let location = xhr.getResponseHeader("Location")
                    if (location) {
                        console.log("redirect location: " + location)
                        self._downloadImage(uid, location)
                    } else {
                        cc.log("download image fail:" + url)
                        self._removeFromDowningList(uid)
                    }
                } else {
                    cc.log("download image fail:" + url)
                    self._removeFromDowningList(uid)
                }
            }
        }
        xhr.onerror = function () {
            self._removeFromDowningList(uid)
            cc.log("download image error:" + url)
        }
        xhr.send()
    },

    _loadHeadImageLocal(uid, url, callback) {
        let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
        let pathfile = path + md5(url) + ".jpg";

        let fileexist = false
        //先判断本地是否存在
        if (jsb.fileUtils.isFileExist(pathfile)) {
            this._loadHeadImageFromFile(uid, pathfile, callback)
            cc.log("load image from file succ", pathfile)
            fileexist = true
            //不return，头像可能需要更新
        }

        Global._downed_list = Global._downed_list || [] //下载完成的头像
        Global._downing_list = Global._downing_list || []   //正在下载的头像

        if (fileexist && Global._downed_list.indexOf(uid) > -1) {
            //存在，本次登录期间不再下载
            //1,存在，但未更新; 2,不存在。 这两种情况都需要下载
            cc.log("no need download: " + uid)
            return
        }

        if (Global._downing_list.indexOf(uid) > -1) {
            //如果正在下载
            cc.log("image is downing:" + uid)
            return
        }

        Global._downing_list.push(uid)
        cc.log("begin down load image", uid, url)

        //start download
        this._startDownloadImage()
        this._downloadImage(uid, url)
    },

    _saveFile: function (uid, url, data) {
        if (CC_JSB) {
            let path = jsb.fileUtils.getWritablePath() + 'headimgs/'
            let pathfile = path + md5(url) + ".jpg";

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

    loadHeadImage(uid, url, callback) {
        if (CC_JSB) {
            this._loadHeadImageLocal(uid, url, callback)
        } else {
            this._loadHeadImageWeb(uid, url, callback)
        }
    },

    //开始下载,供项目拓展.
    _startDownloadImage() {

    },

    //结束下载
    _finishDownloadImage() {

    },

});
