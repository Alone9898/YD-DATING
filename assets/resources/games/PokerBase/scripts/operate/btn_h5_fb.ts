const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class btn_h5_fb extends cc.Component {

    onLoad() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        if (cc.vv.LoginData) {
            this.node.active = cc.vv.UserManager.isbindfb <= 0;
        } else {
            this.node.active = false;
        }
        this.node.on("click", () => {
            if (CC_DEBUG) {
                let req = {
                    c: 246,
                    type: Global.LoginType.FB,
                };
                cc.vv.NetManager.send(req);
            } else {
                window["toLoginFB"] && window["toLoginFB"]();
            }
        }, this)
        eventListener.registerEvent(EventId.FB_BIND_SUCCESS, this.FB_BIND_SUCCESS, this);
    }

    protected onEnable(): void {
        window["toLoginFBComplete"] = (token, uid) => {
            cc.vv.NetManager.send({
                c: MsgId.REQ_BIND_FACEBOOK,
                accesstoken: token,
                token: token,
                user: uid,
                type: Global.LoginType.FB,
            });
        }
    }

    protected onDisable(): void {
        window["toLoginFBComplete"] = undefined;
    }

    FB_BIND_SUCCESS(event) {
        cc.vv.AlertView.showTips(___("绑定FB成功,推荐下载App可以体验到完整的游戏体验"));
        this.node.active = cc.vv.LoginData && cc.vv.UserManager.isbindfb <= 0;
    }

    // update (dt) {}
}
