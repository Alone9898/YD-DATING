// 头像和头像框管理
cc.Class({
    extends: cc.Component,
    properties: {
        headCmp: require("HeadCmp"),
        headList: require("List"),
        // buyPrebfa: cc.Prefab,
        // bindFBButton: cc.Button,
        // bindAppleButton: cc.Button,
        // rewardNode: cc.Node,
        // btnNode: cc.Node,
    },
    onLoad() {
        this.count = 0;
        let eventListener = this.node.addComponent("EventListenerCmp");
        // this.bindFBButton.node.on('click', this.onFbBind, this);
        // this.bindAppleButton.node.on('click', this.onAppleBind, this);
        let btn_upload = cc.find("btn_upload",this.node)
        btn_upload.on('click',this.onClickUploadHead,this)
        // 更新用户信息成功
        eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        // 监听绑定成功
        eventListener.registerEvent(EventId.FB_BIND_SUCCESS, this.FB_BIND_SUCCESS, this);
        // 设置头像
        this.headConfig = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];//[101, 100, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        if (cc.vv.UserManager.isbindfb > 0 && cc.vv.UserManager.fbicon) {
            this.headConfig.unshift(cc.vv.UserManager.fbicon)
        }
        this.headList.numItems = this.headConfig.length;
        // 设置预览状态
        this.headCmp.setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon, true);
        this.headCmp.setAvatarFrame(cc.vv.UserManager.avatarframe);
        // // 显示FB绑定奖励
        // let nodeMap = this.rewardNode.getComponentInChildren("RewardListCpt").updateView(cc.vv.UserManager.fbrewards);
        // if (nodeMap[1]) nodeMap[1].icon.scale = 0.4;
        // if (nodeMap[25]) nodeMap[25].icon.scale = 0.4;
        // if (nodeMap[53]) nodeMap[53].icon.scale = 0.3;
        // if (nodeMap[54]) nodeMap[54].icon.scale = 0.5;
        this.updateBindView();
    },
    init(data) {
    },
    // 刷新头像Item
    onRenderHeadItem(item, index) {
        // Item头像显示
        let userIcon = this.headConfig[index]
        let itemIconSprite = cc.find("radio_mask/spr_head", item).getComponent(cc.Sprite);
        if (this.isRealNum(userIcon)) {
            cc.vv.UserConfig.setHeadFrame(itemIconSprite, userIcon);
        } else if (userIcon && userIcon.indexOf('http') > -1) {
            itemIconSprite._reqHandle && itemIconSprite._reqHandle.rejectFunc();
            // 请求获取网络图片
            itemIconSprite._reqHandle = cc.vv.ResManager.loadImage(userIcon, (err, res) => {
                if (cc.isValid(itemIconSprite) && res) {
                    itemIconSprite.spriteFrame = new cc.SpriteFrame(res)
                }
                // 请求结束后删除请求句柄
                itemIconSprite._reqHandle = null;
            });
        }
        // 状态更新
        cc.find("select", item).active = cc.vv.UserManager.userIcon == this.headConfig[index];
    },

    onClickUploadHead:function(){
        this.onClickUp();
    },
    // 选择头像的Item
    onSelectHeadItem(event) {
        let selectId = event.currentTarget._listId;
        // if (selectId == 0) {
        //     this.onClickUp();
        //     return;
        // }
        let userIcon = this.headConfig[selectId]
        // 进行预览
        this.headCmp.setHead(cc.vv.UserManager.uid, userIcon, true);
        // 请求更新
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, usericon: this.headConfig[selectId] });
        // 打点请求
        StatisticsMgr.reqReport(ReportConfig.USERINFO_CHANGE_HEAD_DEFAULT, this.headConfig[selectId]);
    },
    // 数据更新后 刷新显示
    USER_INFO_CHANGE() {
        this.headList.numItems = this.headConfig.length;
    },
    isRealNum(val) {
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
    onClickUp() {
        let laseT = cc.vv.UserManager.lastChangeUHTime;
        let currT = new Date().getTime();
        if(laseT && currT-laseT < 5*60*1000){ // 5分钟内
            cc.vv.FloatTip.show("Please try again in five minutes");
            return
        }

        if (Global.isNative()) {
            // 选着头像框
            cc.vv.PlatformApiMgr.OpenTakephoto(JSON.stringify({ width: 200, height: 200, size: 1000000, from: 0 ,crop:1}), (data) => {
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
                                this.headCmp.setHead(cc.vv.UserManager.uid, data.url, true);
                                // 更新头像
                                cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, usericon: data.url });
                                StatisticsMgr.reqReport(ReportConfig.USERINFO_CHANGE_HEAD);
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
                    }, cc.vv.UserManager.uploadlink, "POST", true, 15000);
                    cc.vv.UserManager.lastChangeUHTime = new Date().getTime();
                } else if (result == -1) {
                    // 提示错误
                    cc.vv.FloatTip.show(___("取消选择图片"));
                } else {
                    // 提示错误
                    cc.vv.FloatTip.show(___("选择图片失败"));
                }
            });
        } else if (CC_DEBUG) {
            let url1 = `https://img0.baidu.com/it/u=3621700621,434206926&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500`;
            let url2 = `https://img0.baidu.com/it/u=2125945748,287691266&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500`;

            let targetUrl = this.count > 0 ? url1 : url2;
            this.count += 1;
            // 预览头像
            this.headCmp.setHead(cc.vv.UserManager.uid, targetUrl, true);
            // 更新头像
            cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, usericon: targetUrl });
            cc.vv.UserManager.lastChangeUHTime = new Date().getTime();
        }


    },
    onFbBind() {
        if (Global.isNative()) {
            StatisticsMgr.reqReport(ReportConfig.SETTING_BIND_FB);
            cc.vv.PlatformApiMgr.fbLogin((cbData) => {
                AppLog.log("=======LMSlots--FbAuth=========:  " + JSON.stringify(cbData));
                let result = parseInt(cbData.result);
                if (result == 1) {
                    let req = {
                        c: MsgId.REQ_BIND_FACEBOOK,
                        accesstoken: cbData.token,
                        token: cbData.token,
                        user: cbData.uid,
                        type: Global.LoginType.FB,
                    };
                    cc.vv.NetManager.send(req);
                } else {
                    cc.vv.FloatTip.show(___("FB账号绑定失败!"));
                }
            });
        } else if (CC_DEBUG) {
            let req = {
                c: 246,
                type: Global.LoginType.FB,
            };
            cc.vv.NetManager.send(req);
        }
    },
    onAppleBind() {
        if (Global.isNative()) {
            cc.vv.PlatformApiMgr.startAppleLogin((cbData) => {
                AppLog.log("=======LMSlots--AppleSignIn=========:  " + JSON.stringify(cbData));
                let result = parseInt(cbData.code);
                if (result) {
                    let req = {
                        c: MsgId.REQ_BIND_FACEBOOK,
                        accesstoken: cbData.authorizationCode,
                        token: cbData.identityToken,
                        user: cbData.user,
                        type: Global.LoginType.APPLE_LOGIN,
                    };
                    cc.vv.NetManager.send(req);
                }
                else {
                    cc.vv.FloatTip.show(___("Apple账号绑定失败"));
                }
            });
        } else if (CC_DEBUG) {
            let req = {
                c: 246,
                type: Global.LoginType.APPLE_LOGIN,
            };
            cc.vv.NetManager.send(req);
        }
    },

    // 绑定FB成功
    FB_BIND_SUCCESS(event) {
        let msg = event.detail || {};
        // Global.RewardFly(msg.rewards, this.bindFBButton.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        if (msg.type == Global.LoginType.FB) {
            // 设置预览状态
            this.headCmp.setHead(cc.vv.UserManager.uid, cc.vv.UserManager.fbicon, true);
            cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, usericon: cc.vv.UserManager.fbicon });
        }
        // 更新显示
        this.headConfig[1] = cc.vv.UserManager.fbicon;
        this.headList.numItems = this.headConfig.length;
        this.updateBindView();
    },

    updateBindView() {
        // if (cc.vv.UserManager.isbindfb > 0 || cc.vv.UserManager.isbindapple > 0 || cc.vv.UserManager.isbindgoogle > 0) {
        //     this.rewardNode.active = false;
        //     this.btnNode.x = 100;
        //     this.bindFBButton.node.scale = 1;
        // } else {
        //     this.rewardNode.active = true;
        //     this.btnNode.x = 300;
        //     this.bindFBButton.node.scale = 0.75;
        // }
        // this.bindFBButton.node.active = cc.vv.UserManager.isbindfb <= 0;
        // this.bindAppleButton.node.active = Global.isIOS() && cc.vv.UserManager.isbindapple <= 0;
    }

});
