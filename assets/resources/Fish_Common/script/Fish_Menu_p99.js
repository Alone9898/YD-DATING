
cc.Class({
    extends: cc.Component,

    properties: {
        btnInfo: cc.Node,
        btnMuteOn: cc.Node,
        btnMuteOff: cc.Node,
        btnExit: cc.Node,
        btnExpend: cc.Node,
        imgExpand: [cc.SpriteFrame],
        _pos: null,
        _expend: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let widget = this.node.getComponent(cc.Widget);
        if (widget) {
            widget.right = -94;
            widget.updateAlignment();
        }
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
            this.node.runAction(cc.moveBy(0.5, cc.v2(-94, 0)));
            this.btnExpend.getChildByName("img_icon").getComponent(cc.Sprite).spriteFrame = this.imgExpand[0];
        } else {
            this.node.runAction(cc.moveTo(0.5, this._pos));
            this.btnExpend.getChildByName("img_icon").getComponent(cc.Sprite).spriteFrame = this.imgExpand[1];
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
        var msg = {c: MsgId.FISH_EXIT};
        cc.vv.NetManager.send(msg);
        this.onBtnExpend();
    },
});
