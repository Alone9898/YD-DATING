/**
 * @author Cui Guoyang
 * @date 2021/9/29
 * @description
 */

cc.Class({
    extends: cc.Component,
    properties: {
        wheel_node: cc.Node,
        wheel: cc.Node,
        lunpan: sp.Skeleton,
        btn_spin: cc.Node,
        spin_glow: sp.Skeleton,

        _successCallback: null,
        // _collectGame: null,
        _winCoin: 0,
    },

    async startWheel(mapInfo) {
        return new Promise((success) => {
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playBgm("fgbgm");
            this._successCallback = success;
            this.node.active = true;

            let cfg = mapInfo.wheel.items;
            for (let i = 1; i < cfg.length; i++) {
                let item = cfg[i];
                let node = cc.find("index_" + (i + 1), this.wheel);
                if (node) {
                    node.getComponent(cc.Label).string = Global.formatNumShort(item.coin, 0);
                }
            }

            this.wheel_node.active = true;
            this.wheel_node.scale = 0;
            cc.tween(this.wheel_node)
                .to(0.5, {scale:0.8}, {easing:"backOut"})
                .start();

            this.wheel.rotation = 0;
            this.lunpan.setAnimation(0, "lunpan_idle", true);
            this.spin_glow.setAnimation(0, "spin_idle", true);

            let func = async () => {
                Global.SlotsSoundMgr.playEffect("wheel_click");
                this.btn_spin.off(cc.Node.EventType.TOUCH_END);
                this.spin_glow.setAnimation(0, "spin_dianji", false);
                let reqdata = {rtype: 1};
                let result = await cc.vv.gameData.reqSubGame(reqdata);
                if (result.code === 200) {
                    cc.vv.gameData.getDeskInfo().mapInfo = result.data.mapInfo;
                    this._winCoin = result.data.winCoin;
                    this.lunpan.setAnimation(0, "lunpan_dianji", true);

                    Global.SlotsSoundMgr.playEffect("wheel");
                    await this._rotateWheel(result.data.itemId - 1);

                    this.lunpan.setAnimation(0, "lunpan_win", false);
                    Global.SlotsSoundMgr.playEffect("wheelend");
                    Global.SlotsSoundMgr.stopBgm();
                    await cc.vv.gameData.awaitTime(2);

                    cc.vv.gameData.AddCoin(this._winCoin);
                    if (this._successCallback) {
                        this._successCallback();
                    }
                }
            }
            cc.vv.gameData.checkAutoPlay(this.btn_spin, func);
            this.btn_spin.off(cc.Node.EventType.TOUCH_END);
            this.btn_spin.on(cc.Node.EventType.TOUCH_END, async () => {
                this.btn_spin.stopAllActions();
                func();
            });
        })
    },

    getWinCoin() {
        return this._winCoin;
    },

    async _rotateWheel(endIndex) {
        return new Promise((success) => {
            let angle = endIndex * 45 - 2160;
            cc.log(angle);

            let action = cc.rotateBy(8, angle).easing(cc.easeSineInOut());
            this.wheel.runAction(cc.sequence(action, cc.callFunc(() => {

                success();
            })));
        });
    },
});