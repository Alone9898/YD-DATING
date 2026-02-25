// 用户头像框组件
cc.Class({
    extends: cc.Component,
    editor: {
        menu: '通用/头像',
    },
    properties: {
        spr_head: cc.Sprite,            //头像
        // spr_headFrame: cc.Sprite,       //头像框
        spine_headFrame: sp.Skeleton,   //头像框动画
        _uid: 0,
        _clickId: 0,
        isButton: false,
        // prefab: {
        //     default: null,
        //     type: cc.Prefab,
        //     visible: function () {
        //         return this.isButton;
        //     },
        // },
        _roomId: null,//房间号--暂时这么用，后面会修改
        strIcon: {
            get() {
                return this._strIcon || "";
            }
        }
    },
    onLoad() {
        cc.vv.EventManager.on(EventId.REFRESH_PLAYER_HEAD, this.onRcvEventRefeshHead, this);
        if (this.isButton) {
            let button = this.node.getComponent(cc.Button);
            if (button) {
                button.node.on("click", () => {
                    if (this._uid) {
                        if (this._clickId == 1) {
                            let url = "BalootClient/VoiceChat/V_UserInfoDlg"
                            cc.vv.PopupManager.addPopup(url, {
                                bottomIn: true,
                                multiple: true,
                                noCloseHit: true,
                                onShow: (node) => {
                                    let cpt = node.getComponent("V_UserInfoDlg");
                                    if (cpt) {
                                        cpt.refresh(this._uid)
                                    }
                                }
                            });
                        } else if (this._clickId == 2) {
                            //加入房间
                            Global.dispatchEvent("JOIN_VOICECHAT_ROOM_ONE", { roomId: this._roomId });
                        } else {
                            let url = "BalootClient/UserInfo/PopupPersonalInfo"
                            cc.vv.PopupManager.addPopup(url, {
                                opacityIn: true,
                                multiple: true,
                                // noMask: true,
                                // noCloseHit: true,
                                onShow: (node) => {
                                    let cpt = node.getComponent("PersonalInfo");
                                    if (cpt) {
                                        cpt.init(this._uid)
                                    }
                                }
                            })
                        }
                    }
                });
            }
        }
    },

    onDestroy() {
        cc.vv.EventManager.off(EventId.REFRESH_PLAYER_HEAD, this.onRcvEventRefeshHead, this);
    },
    // 刷新头像
    onRcvEventRefeshHead: function (user) {
        if (user && user.uid && user.usericon && this._uid == user.uid) {
            this.setHead(user.uid, user.usericon);
        }
    },

    // 设置头像
    // uid:用户uid 用来生成唯一的文件名
    // strIcon: 数组为默认头像 字符串是网络头像
    // 具有异步操作的时候, 取消前一次的异步操作, 在list复用情况才不会出现问题
    setHead: function (uid, strIcon, isforce) {
        this._uid = uid;
        if (!strIcon) { this.reset(); return; }
        if (strIcon == this._strIcon) {
            return;
        }
        this._strIcon = strIcon;
        // 重置头像数据
        this.reset(() => {
            // 开始加载头像
            if (this._isRealNum(strIcon)) {
                // 根据头像序号 设置默认头像数据
                cc.vv.UserConfig.setHeadFrame(this.spr_head, Number(strIcon));
            } else if (strIcon && strIcon.indexOf('http') > -1) { //网络头像
                // 如果存在请求 则取消上一次请求
                this.spr_head._reqHandle && this.spr_head._reqHandle.rejectFunc();
                let NetHeadImg = this.spr_head.node.getComponent("NetHeadImg");
                if (!NetHeadImg) {
                    NetHeadImg = this.spr_head.node.addComponent("NetHeadImg");
                }
                // 出现头像loading界面, 是本地 并且 没有缓存或者强制刷新
                if (Global.isNative() && (!cc.vv.HeadManager.checkDownloaded(strIcon) || isforce)) {
                    this.unscheduleAllCallbacks();
                    this.showLoading();
                    // 定时关闭loading界面
                    this.scheduleOnce(this.closeLoading, 3);
                }
                NetHeadImg.load(uid, strIcon, () => {
                    this.closeLoading();
                }, isforce);
            } else if (strIcon && Global.isNative() && jsb.fileUtils.isFileExist(strIcon)) {
                // 出现头像loading界面
                let url = { url: strIcon, ignoreMaxConcurrency: true }
                cc.loader.load(url, function (err, tex) {
                    if (err) return
                    let spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(tex);
                    this.spr_head.spriteFrame = spriteFrame;
                });
            }
        });
    },
    // 设置头像--语聊房大头像专用--去掉loading
    // uid:用户uid 用来生成唯一的文件名
    // strIcon: 数组为默认头像 字符串是网络头像
    // 具有异步操作的时候, 取消前一次的异步操作, 在list复用情况才不会出现问题
    setVchatHead: function (uid, strIcon, isforce) {
        this._uid = uid;
        if (!strIcon) { this.reset(); return; }
        if (strIcon == this._strIcon) {
            return;
        }
        this._strIcon = strIcon;
        // 重置头像数据
        this.reset(() => {
            // 开始加载头像
            if (this._isRealNum(strIcon)) {
                // 根据头像序号 设置默认头像数据
                cc.vv.UserConfig.setHeadFrame(this.spr_head, Number(strIcon));
            } else if (strIcon && strIcon.indexOf('http') > -1) { //网络头像
                // 如果存在请求 则取消上一次请求
                this.spr_head._reqHandle && this.spr_head._reqHandle.rejectFunc();
                let NetHeadImg = this.spr_head.node.getComponent("NetHeadImg");
                if (!NetHeadImg) {
                    NetHeadImg = this.spr_head.node.addComponent("NetHeadImg");
                }
                NetHeadImg.load(uid, strIcon, () => {
                    
                }, isforce);
            } else if (strIcon && Global.isNative() && jsb.fileUtils.isFileExist(strIcon)) {

            }
        });
    },

    //设置头像框
    //bgIdx: 背景框的序号。如果有新的背景框，添加到spr_headFrame即可
    setAvatarFrame: function (bgIdx) {
        if (this.spine_headFrame) {
            cc.vv.UserConfig.setAvatarFrame(this.spine_headFrame, bgIdx);
        }
    },
    //头像恢复到默认
    reset: function (callback) {
        cc.vv.UserConfig.setHeadFrame(this.spr_head, 1, callback);
    },
    // 显示loading
    showLoading() {
        this.loadingFlag = true;
        if (!this.loadingNode) {
            cc.vv.ResManager.loadLocalRes("BalootClient/BaseRes/prefabs/Headloading", cc.Prefab, (err, res) => {
                if (!!err) return;
                this.loadingNode = cc.instantiate(res);
                this.loadingNode.parent = this.spr_head.node.parent;
                this.loadingNode.width = this.spr_head.node.width;
                this.loadingNode.height = this.spr_head.node.height;
                this.updateLoading();
            })
        } else {
            this.updateLoading();
        }
    },
    // 关闭loading
    closeLoading() {
        this.loadingFlag = false;
        this.updateLoading();
    },

    updateLoading() {
        if (this.loadingNode) {
            this.loadingNode.active = this.loadingFlag;
        }
    },
    // 设置头像成灰态
    setHeadGray: function () {
        Global.showSpriteGray(this.spr_head, true)
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

    // 点击头像 
    onClickButton() {

    },

    //设置点击事件id
    setEventClickId(idx) {
        //0:默认玩家信息界面 1:语聊玩家信息界面
        this._clickId = idx;
    }
});
