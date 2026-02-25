// 控制活动入口
cc.Class({
    extends: cc.Component,

    properties: {
        id: 0,
        openBtn: cc.Button,
        popupPrfab: cc.Prefab,
        checkVip: false,
        noCloseHit: false,
        noTouchClose: false,
    },

    onLoad() {
        if (!this.openBtn) return;
        if (!this.popupPrfab) return;

        this.openBtn.node.on('click', () => {
            if (this.checkVip && cc.vv.UserManager.svip <= 0) {
                // 提示
                cc.vv.FloatTip.show(___("您还不是VIP,无法领取该奖励"));
                return;
            }
            cc.vv.PopupManager.addPopup(this.popupPrfab, { opacityIn: true, noTouchClose: this.noTouchClose, noCloseHit: this.noCloseHit });
        })
    },

});
