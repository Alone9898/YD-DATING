const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomFriendPwd extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null;

    private pwd = "";
    private callback: Function;

    setPwd(pwd) {
        this.pwd = pwd;
        this.upadteView();
    }

    setCallback(callback) {
        this.callback = callback;
    }

    // 点击小键盘
    onClickKeyboard(event, key) {
        if (key == 're_enter') {
            // this.pwd = "";
            // this.upadteView();
            this.callback && this.callback(this.pwd.trim(), this.closeFunc.bind(this));
        } else if (key == 'delete') {
            this.pwd = this.pwd.substring(0, this.pwd.length - 1);
            this.upadteView();
        } else {
            if (this.pwd.length < 4) {
                this.pwd += key;
                this.upadteView();
                // 判断是否输入完成
                if (this.pwd.length >= 4) {
                    this.callback && this.callback(this.pwd.trim(), this.closeFunc.bind(this));
                }
            }
        }
    }

    upadteView() {
        for (let i = 0; i < this.contentNode.children.length; i++) {
            let node = this.contentNode.children[i]
            const num = this.pwd[i];
            if (num != undefined || num != null) {
                cc.find("value", node).getComponent(cc.Label).string = num;
            } else {
                cc.find("value", node).getComponent(cc.Label).string = "-";
            }
        }
    }

    closeFunc() {
        cc.vv.PopupManager.removePopup(this.node);
    }

    protected onDestroy(): void {
        this.callback && this.callback(this.pwd.trim(), () => { });
    }

}
