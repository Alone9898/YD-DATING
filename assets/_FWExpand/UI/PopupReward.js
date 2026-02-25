// 通用的获取奖励弹窗
cc.Class({
    extends: cc.Component,
    properties: {
        animSke: sp.Skeleton,
        boomPrefab: cc.Prefab,
        reawrdNode: cc.Node,
        chatSpriteFrames: cc.SpriteAtlas,
        vipExpFrame: cc.SpriteFrame,
    },
    onLoad() {
        this.rewardCpt = this.reawrdNode.getComponent("RewardListCpt");
        this.animSke.setCompleteListener((tck) => {
            if (tck.animation && tck.animation.name == "animation") {
                this.animSke.setAnimation(0, "animation2", true);
            }
        })
    },

    start() {
        this.animSke.setAnimation(0, "animation", true);
    },

    setData(config) {
        // 设置奖励
        let vipConfig = this.rewardCpt.updateView(config);
        this.scheduleOnce(() => {
            // 飞金币
            let coinConfig = vipConfig[1];
            let coinHallNode = cc.find("Canvas/UserinfoBar/coin/icon")
            if (coinConfig && coinHallNode) {
                if (coinConfig.data.count > 3000000) {
                    let sprite = coinConfig.node.getComponentInChildren(cc.Sprite);
                    if (sprite) {
                        Global.FlyAnimTo(coinConfig.node, coinHallNode, {
                            spriteFrame: sprite.spriteFrame,
                            scale: 0.75,
                            delay: 0.3,
                            onStart: () => {
                                coinConfig.node.active = false;
                                let node = cc.instantiate(this.boomPrefab);
                                if (node) {
                                    node.parent = cc.find("Canvas");
                                    let wPos = coinConfig.node.convertToWorldSpaceAR(cc.v2(0, 0));
                                    node.position = node.parent.convertToNodeSpaceAR(wPos);
                                    node.zIndex = 900;
                                    node.getComponent(sp.Skeleton).setCompleteListener((tck) => {
                                        if (tck.animation && tck.animation.name == "animation") {
                                            node.destroy()
                                        }
                                    })
                                }
                            },
                        });
                    }
                } else {
                    let rollData = {
                        lblCoin: cc.find("Canvas/UserinfoBar/coin/lbl_coin"),
                        addCoin: coinConfig.data.count,
                        begin: cc.vv.UserManager.coin - coinConfig.data.count
                    };
                    Global.FlyCoinV2(coinConfig.node, null, null, rollData, true);
                }
            }
            // 飞钻石
            let diamondConfig = vipConfig[25];
            let diamondHallNode = cc.find("Canvas/UserinfoBar/钻石/icon");
            if (diamondConfig && diamondHallNode) {
                if (diamondConfig.data.count > 3000) {
                    let sprite = diamondConfig.node.getComponentInChildren(cc.Sprite);
                    if (sprite) {
                        Global.FlyAnimTo(diamondConfig.node, diamondHallNode, {
                            spriteFrame: sprite.spriteFrame,
                            scale: 0.75,
                            delay: 0.3,
                            onStart: () => {
                                diamondConfig.node.active = false;
                                let node = cc.instantiate(this.boomPrefab);
                                if (node) {
                                    node.parent = cc.find("Canvas");
                                    let wPos = diamondConfig.node.convertToWorldSpaceAR(cc.v2(0, 0));
                                    node.position = node.parent.convertToNodeSpaceAR(wPos);
                                    node.zIndex = 900;
                                    node.getComponent(sp.Skeleton).setCompleteListener((tck) => {
                                        if (tck.animation && tck.animation.name == "animation") {
                                            node.destroy()
                                        }
                                    })
                                }
                            }
                        });
                    }
                } else {
                    let rollData = {
                        addCoin: diamondConfig.data.count,
                        begin: cc.vv.UserManager.getDiamond() - diamondConfig.data.count
                    };
                    Global.FlyDiamond(diamondConfig.node, null, null, rollData, true);
                }
                let expConfig = vipConfig[2];
                let vipHallNode = cc.find("Canvas/UserinfoBar/VIP/progress/icon")
                if (this.vipExpFrame && expConfig) {
                    Global.FlyAnimTo(diamondConfig.node, vipHallNode, {
                        spriteFrame: this.vipExpFrame,
                        scale: 0.5,
                        delay: 0.3,
                    });
                }
            }
        }, 0.5);
        // 飞经验值 TODO
        this.scheduleOnce(() => {
            cc.vv.PopupManager.removePopup(this.node);
        }, 2);
    },

    start() {
        cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'get_coins', true);
    },

});
