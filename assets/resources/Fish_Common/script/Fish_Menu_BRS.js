//鸟王争霸/雷电捕鱼/海绵宝宝公用菜单

cc.Class({
    extends: cc.Component,

    properties: {
        btnInfo: cc.Node,
        btnMuteOn: cc.Node,
        btnMuteOff: cc.Node,
        btnExit: cc.Node,
        btnExpend: cc.Node,
        _expend: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Global.btnClickEvent(this.btnExpend, this.onBtnExpend, this);
        Global.btnClickEvent(this.btnInfo, this.onBtnInfo, this);
        Global.btnClickEvent(this.btnMuteOn, this.onBtnMuteOn, this);
        Global.btnClickEvent(this.btnMuteOff, this.onBtnMuteOff, this);
        Global.btnClickEvent(this.btnExit, this.onBtnExit, this);
        this._originPos = this.node.position;

        let on = (cc.vv.AudioManager.getBgmVolume() > 0);
        this.btnMuteOn.active = on;
        this.btnMuteOff.active = !on;

    },

    onBtnExpend() {
        this._expend = !this._expend;
        this.node.stopAllActions();
        let bg_right = this.node.getChildByName("bg_right");
        if (bg_right) bg_right.active = this._expend;
        let bg_left = this.node.getChildByName("bg_left");
        if (bg_left) bg_left.active = !this._expend;
        if (this._expend) {
            this.btnExpend.x = 70;
            this.node.runAction(cc.moveBy(0.5, cc.v2(-120, 0)));
        } else {
            this.btnExpend.x = -70;
            this.node.runAction(cc.moveTo(0.5, this._originPos));
        }
    },

    onBtnInfo() {
        Global.dispatchEvent("show_library");
    },

    onBtnMuteOn() {
        this.btnMuteOn.active = false;
        this.btnMuteOff.active = true;
        cc.vv.AudioManager.setEffVolume(0);
        cc.vv.AudioManager.setBgmVolume(0);
    },

    onBtnMuteOff() {
        this.btnMuteOn.active = true;
        this.btnMuteOff.active = false;
        cc.vv.AudioManager.setEffVolume(1);
        cc.vv.AudioManager.setBgmVolume(1);
    },

    onBtnExit(){
        var msg = {c: MsgId.FISH_EXIT};
        cc.vv.NetManager.send(msg);
        this.onBtnExpend();
    },
});
