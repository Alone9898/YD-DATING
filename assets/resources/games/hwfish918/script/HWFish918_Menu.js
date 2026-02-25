
cc.Class({
    extends: cc.Component,

    properties: {
        btnInfo: cc.Node,
        btnMuteOn: cc.Node,
        btnMuteOff: cc.Node,
        btnExit: cc.Node,
        btnExpend: cc.Node,
        _pos: null,
        _expend: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._pos = this.node.position;
        Global.btnClickEvent(this.btnExpend, this.onBtnExpend, this);
        Global.btnClickEvent(this.btnInfo, this.onBtnInfo, this);
        Global.btnClickEvent(this.btnMuteOn, this.onBtnMuteOn, this);
        Global.btnClickEvent(this.btnMuteOff, this.onBtnMuteOff, this);
        Global.btnClickEvent(this.btnExit, this.onBtnExit, this);

        if (cc.vv.AudioManager.getBgmVolume() <= 0) {
            this.btnMuteOn.active = true;
            this.btnMuteOff.active = false;
        }
    },

    onBtnExpend() {
        this._expend = !this._expend;
        this.node.stopAllActions();
        if (this._expend) {
            this.node.position = this._pos;
            this.node.runAction(cc.moveBy(0.5, cc.v2(160, 0)));
            this.btnExpend.getChildByName("img_icon").angle = -180;
        } else {
            this.node.runAction(cc.moveTo(0.5, this._pos));
            this.btnExpend.getChildByName("img_icon").angle = 0;
        }
    },

    onBtnInfo() {
        Global.dispatchEvent("show_library");
    },

    onBtnMuteOn() {
        this.btnMuteOn.active = false;
        this.btnMuteOff.active = true;
        cc.vv.AudioManager.setEffVolume(1);
        cc.vv.AudioManager.setBgmVolume(1);
    },

    onBtnMuteOff() {
        this.btnMuteOn.active = true;
        this.btnMuteOff.active = false;
        cc.vv.AudioManager.setEffVolume(0);
        cc.vv.AudioManager.setBgmVolume(0);
    },

    onBtnExit(){
        Global.dispatchEvent("fish_exit");
        this.onBtnExpend();
    },
});
