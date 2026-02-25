const { ccclass, property } = cc._decorator;

@ccclass
export default class FeedbackView extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;

    @property(cc.ToggleContainer)
    typeContainer: cc.ToggleContainer = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    // @property(cc.Button)
    // whatsAppBtn: cc.Button = null;

    @property(cc.Button)
    photoBtn: cc.Button = null;

    @property(cc.Button)
    upBtn: cc.Button = null;

    imgUrlList: any[];
    imgListView: any;

    get feedType() {
        for (let i = 0; i < this.typeContainer.toggleItems.length; i++) {
            const toggle = this.typeContainer.toggleItems[i];
            if (toggle.isChecked) {
                return i + 1;
            }
        }
    }

    onLoad() {
        this.imgListView = this.listViewNode.getComponent("ListView");
        this.imgUrlList = [];

        this.photoBtn.node.on("click", this.onClickSelect, this);
        // this.whatsAppBtn.node.on("click", this.onClickWhatsApp, this);
        this.upBtn.node.on("click", this.onClickSubmit, this);
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.USER_FEEDBAKC, this.USER_FEEDBAKC, this);
    }

    USER_FEEDBAKC(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.PopupManager.removePopup(this.node);
        cc.vv.FloatTip.show("Submitted successfully!");
    }

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

    // onClickWhatsApp() {
    //     cc.vv.PlatformApiMgr.openURL(cc.vv.UserManager.whatapplink);
    // }

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
    }

    onClickRemovePhoto(event) {
        let url = this.imgUrlList[event.currentTarget._listId];

        this.imgUrlList = this.imgUrlList.filter((_url) => { return _url != url })
        this.imgListView.numItems = this.imgUrlList.length;
    }

    onClickSubmit() {
        if (this.imgUrlList.length <= 0 && this.editBox.string.trim().length <= 0) {
            cc.vv.FloatTip.show(___("请选择图片或者进行文字描述"));
            return;
        }
        cc.vv.NetManager.send({ c: MsgId.USER_FEEDBAKC, stype: this.feedType, content: this.editBox.string.trim(), imgs: this.imgUrlList })
    }

}
