
cc.Class({
    extends: cc.Component,

    properties: {
        contentEdit: cc.EditBox,
        mobileEdit: cc.EditBox,

        lanLabel: cc.Label,
        lanBtn:cc.Button,
        lanSelect: cc.Node,

        lanSelBtn1:cc.Button,
        lanSelBtn2:cc.Button,

        confirmBtn: cc.Button,
        photoBtn: cc.Button,
        imgListView:require("ListView"),

        _langType:2,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.imgUrlList = []

        // 设置语言
        this._langType = 2; // 默认英语
        this.updateLangView();

        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.EVENT_FEEDBACK, this.EVENT_FEEDBACK, this);

        Global.btnClickEvent(this.photoBtn.node, this.onClickSelect, this);
        Global.btnClickEvent(this.lanBtn.node, this.lanBtnClick, this);
        Global.btnClickEvent(this.lanSelBtn1.node, this.lanSelectHBtnClick, this);
        Global.btnClickEvent(this.lanSelBtn2.node, this.lanSelectEBtnClick, this);
        Global.btnClickEvent(this.confirmBtn.node, this.confirmBtnClick, this);
    },

    start () {
    },

    updateLangView(){
        this.lanLabel.string = this._langType == 1 ? "हिंदी" : "English";

        cc.find("item_hi/isSelect", this.lanSelect).active = this._langType == 1;
        cc.find("item_en/isSelect", this.lanSelect).active = this._langType == 2;
    },

    showLangSelect(){
        this.lanSelect.stopAllActions();
        if (this.lanSelect.active){
            this.lanSelect.active = false;
        } else {
            this.lanSelect.active = true;
            this.lanSelect.y = -36;
            this.lanSelect.opacity = 100;
            cc.tween(this.lanSelect).to(0.1, { y: -88, opacity: 255 }).start();
        }
    },

    lanBtnClick(){
        this.showLangSelect()
    },

    lanSelectHBtnClick(){
        this._langType = 1;
        this.updateLangView();
        this.showLangSelect();
    },
    lanSelectEBtnClick(){
        this._langType = 2;
        this.updateLangView();
        this.showLangSelect();
    },


    confirmBtnClick(){
        if(!this.contentEdit.string){
            cc.vv.FloatTip.show("Cannot send an empty message!");
            return
        }
        if(!this.mobileEdit.string){
            cc.vv.FloatTip.show("Cannot send an empty mobile number");
            return
        }

        // 发送请求
        cc.vv.NetManager.send({
            c: MsgId.EVENT_FEEDBACK,
            content: this.contentEdit.string,
            phone: this.mobileEdit.string,
            lang: (this._langType == 1 ? "हिंदी" : "English"),
            imgs: this.imgUrlList,
        });
    },

    EVENT_FEEDBACK(msg) {
        if (msg.code != 200) return;
        cc.vv.FloatTip.show("Send successfully");
        // 关闭修改窗口
        cc.vv.PopupManager.removePopup(this.node);
    },

    onClickSelect() {
        if (this.imgUrlList.length >= 3) {
            cc.vv.FloatTip.show(___("最多选取3张图片"));
            return;
        }
        // 选着头像框
        cc.vv.PlatformApiMgr.OpenTakephoto(JSON.stringify({ width: 2000, height: 2000, size: 10000000, from: 0, crop:0 }), (data) => {
            let result = data.result
            let data64 = data.data
            if (Number(result) == 1) {
                let baseStr = data64;
                if (cc.sys.isNative && jsb) {
                    baseStr = "data:image/png;base64," + data64;
                }
                // 成功 通过HTTP上传头像
                cc.vv.NetManager.requestHttp('/', {
                    uid: cc.vv.UserManager.uid,
                    img: baseStr,
                }, (state, data) => {
                    if (state) {
                        if (data.code == 200) {
                            // 预览头像
                            this.imgUrlList.push(data.url)
                            this.imgListView.numItems = this.imgUrlList.length;
                        } else {
                            // 提示错误
                            // code = 200, --错误码： 500 上传失败; 501 用户不在线; 502 图片格式错误
                            if (data.code == 500) {
                                cc.vv.FloatTip.show(___("上传失败"));
                            } else if (data.code == 501) {
                                cc.vv.FloatTip.show(___("用户不在线"));
                            } else if (data.code == 502) {
                                cc.vv.FloatTip.show(___("图片格式错误"));
                            }
                        }
                    }
                }, cc.vv.UserManager.uploadlink, "POST", true, 20000);
            } else if (result == -1) {
                // 提示错误
                cc.vv.FloatTip.show(___("取消选择图片"));
            } else {
                // 提示错误
                cc.vv.FloatTip.show(___("选择图片失败"));
            }
        });
    },

    onClickRemovePhoto(event) {
        let url = this.imgUrlList[event.currentTarget._listId];

        this.imgUrlList = this.imgUrlList.filter((_url) => { return _url != url })
        this.imgListView.numItems = this.imgUrlList.length;
    },

    onUpdateItem(item, index) {
        let url = this.imgUrlList[index];
        let iconSprite = cc.find("icon", item).getComponent(cc.Sprite)
        // 请求获取网络图片
        iconSprite["_reqHandle"] && iconSprite["_reqHandle"].rejectFunc();
        iconSprite["_reqHandle"] = cc.vv.ResManager.loadImage(url, (err, res) => {
            // cc.log("请求获取网络图片", url, res);
            if (cc.isValid(iconSprite) && cc.isValid(iconSprite.node)) {
                if (res) {
                    iconSprite.spriteFrame = new cc.SpriteFrame(res);
                }
            }
            // 请求结束后删除请求句柄
            iconSprite["_reqHandle"] = null;
        })
    }

    

    // update (dt) {},
});
