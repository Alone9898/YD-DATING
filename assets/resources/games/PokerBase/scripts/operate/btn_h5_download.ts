const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class btn_h5_download extends cc.Component {

    onLoad() {
        if (cc.vv.LoginData) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }

        this.node.on("click", () => {
            let h5_reqData = Global.getLocal("h5_reqData", '');
            if (!!h5_reqData)
                Global.webCopyString(h5_reqData)
            window["toDownload"] && window["toDownload"](cc.vv.UserManager.token, cc.vv.UserManager.subid);
        }, this)

    }

    start() {

    }

    // update (dt) {}
}
