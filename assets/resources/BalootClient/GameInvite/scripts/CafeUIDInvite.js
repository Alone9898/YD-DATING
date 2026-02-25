cc.Class({
    extends: cc.Component,

    properties: {
        hitLabel: cc.Label,
        contentLabel: cc.Label,
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.FRIEND_ROOM_INVITE, this.FRIEND_ROOM_INVITE, this);
    },
    onInit(gameid, deskid) {
        this.gameid = gameid;
        this.deskid = deskid;
    },
    // 邀请结果
    FRIEND_ROOM_INVITE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.FloatTip.show(___("邀请成功"));
        cc.vv.PopupManager.removePopup(this.node);
    },
    // 点击小键盘
    onClickKeyboard(event, key) {
        if (key == 're_enter') {
            let inputUid = this.contentLabel.string.trim();
            if (inputUid.length > 0) {
                cc.vv.NetManager.send({
                    c: MsgId.FRIEND_ROOM_INVITE,
                    frienduid: inputUid,
                    deskid: this.deskid,
                    gameid: this.gameid,
                });
            } else {
                cc.vv.FloatTip.show(___("请输入UID"));
            }
        } else if (key == 'delete') {
            this.contentLabel.string = this.contentLabel.string.substring(0, this.contentLabel.string.length - 1);
            if (this.contentLabel.string.length <= 0)
                this.hitLabel.node.active = true;
        } else {
            if (this.contentLabel.string.length < 8) {
                this.hitLabel.node.active = false;
                this.contentLabel.string += key;
            }
        }
    },

    onClickInvite(event) {

    },


});
