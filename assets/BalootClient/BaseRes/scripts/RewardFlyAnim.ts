import RewardItemCpt from "../../../_FWExpand/UI/RewardItemCpt";
import UserCoinCpt from "../../Hall/scripts/UserCoinCpt";
// import UserDiamondCpt from "../../Hall/scripts/UserDiamondCpt";
import VipExpCpt from "../../Hall/scripts/VipExpCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RewardFlyAnim extends cc.Component {

    @property(cc.Prefab)
    hintPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    boomPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    // 聊天纹理
    @property(cc.SpriteAtlas)
    commonAtlas: cc.SpriteAtlas = null;
    // 聊天纹理
    @property(cc.SpriteAtlas)
    chatBoxAtlas: cc.SpriteAtlas = null;
    // 牌背纹理
    @property(cc.SpriteAtlas)
    pokerBackAtlas: cc.SpriteAtlas = null;
    // 纹理
    @property(cc.SpriteAtlas)
    skinShopAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    bagNode: cc.Node = null;

    @property(VipExpCpt)
    vipExpCpt: VipExpCpt = null;

    @property(UserCoinCpt)
    coinCpt: UserCoinCpt = null;
    // @property(UserDiamondCpt)
    // diamondCpt: UserDiamondCpt = null;

    hitNodePool: cc.NodePool;
    initBagScale: number;

    onLoad() {
        // this.scheduleOnce(() => {
        //     this.bagNode.active = false;
        // })
        this.bagNode.opacity = 0;
        this.initBagScale = this.bagNode.scale;

        this.vipExpCpt.node.active = false;
        // this.vipExpCpt.updateVipNoAnim();
        this.coinCpt.node.active = false;
        // this.diamondCpt.node.active = false;

        this.hitNodePool = new cc.NodePool();

        // USER_VIP_EXP_CHANGE_END
        // 更新VIP经验值
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("USER_VIP_EXP_CHANGE_END", () => {
            this.vipExpCpt.node.active = false;
        }, this);
    }

    protected onDestroy(): void {
        this.hitNodePool.clear();
    }

    filterData(rewards, type) {
        let itemList = [];
        for (const data of rewards) {
            if (data.type == type) {
                itemList.push(data)
            }
        }
        return itemList;
    }
    filterDataTypes(rewards, types) {
        let itemList = [];
        for (const data of rewards) {
            if (types.indexOf(data.type) >= 0) {
                itemList.push(data)
            }
        }
        return itemList;
    }
    hint(node, toWorldPos) {
        node.stopAllActions()
        node.parent = cc.find("Canvas")
        node.position = node.parent.convertToNodeSpaceAR(toWorldPos);
        node.zIndex = 1100
        node.scale = 1
        node.opacity = 255
        cc.tween(node)
            .to(0.2, { scale: 3, opacity: 100 })
            .call(() => {
                this.hitNodePool.put(node)
            })
            .start()
    }
    run(rewards, fromWorldPos) {
        fromWorldPos = fromWorldPos || cc.find("Canvas").convertToWorldSpaceAR(cc.v2(0, 0));
        cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'reward2', true);
        // // 钻石和expF
        // let diamondData = this.filterData(rewards, 25);
        //
        // if (diamondData.length > 0) {
        //     this.diamondCpt.node.active = true;
        //     // 数字跳动
        //     Global.doRoallNumEff(this.diamondCpt.label.node, Math.max(cc.vv.UserManager.getDiamond() - diamondData[0].count, 0), cc.vv.UserManager.getDiamond(), 2, () => {
        //         this.diamondCpt.node.active = false;
        //     }, null, 0, true)
        //     // 结束世界坐标
        //     let toWorldPos = this.diamondCpt.iconNode.convertToWorldSpaceAR(cc.v2(0, 0));
        //     let coinFrame = this.commonAtlas.getSpriteFrame("icon_diamond");
        //     Global.FlyAnimToPos(fromWorldPos, toWorldPos, {
        //         spriteFrame: coinFrame,
        //         scale: 0.75,
        //         count: 15,
        //         // delay: 0.3,
        //         onStart: () => {
        //             let node = cc.instantiate(this.boomPrefab);
        //             if (node) {
        //                 node.parent = cc.find("Canvas");
        //                 node.position = node.parent.convertToNodeSpaceAR(fromWorldPos);
        //                 node.zIndex = 900;
        //                 node.getComponent(sp.Skeleton).setCompleteListener((tck) => {
        //                     if (tck.animation && tck.animation.name == "animation") {
        //                         node.destroy()
        //                     }
        //                 })
        //             }
        //         },
        //         onEndOne: () => {
        //             let node = null;
        //             node = this.hitNodePool.get();
        //             if (node) {
        //                 this.hint(node, toWorldPos);
        //             } else {
        //                 node = cc.instantiate(this.hintPrefab);
        //                 this.hint(node, toWorldPos);
        //             }
        //             this.diamondCpt.node.stopAllActions()
        //             cc.tween(this.diamondCpt.node).to(0.03, { scale: 1.07 }).to(0.03, { scale: 1 }).start();
        //         },
        //         onEnd: () => {
        //             // this.diamondCpt.node.active = false;
        //         }
        //     });
        // }

        let vipExpData = this.filterData(rewards, 2);
        if (vipExpData.length > 0 && vipExpData[0].count > 0) {
            // this.vipExpCpt.node.active = true;
            // this.vipExpCpt.updateVipNoAnim();
            let vipExpFrame = this.commonAtlas.getSpriteFrame("icon_common_vipexp");
            let toWorldPos = this.vipExpCpt.icon.node.convertToWorldSpaceAR(cc.v2(0, 0));
            Global.FlyAnimToPos(fromWorldPos, toWorldPos, {
                spriteFrame: vipExpFrame,
                scale: 0.5,
                endScale: 0.6,
                count: 10,
                // delay: 0.3,
                onEndOne: () => {
                    let node = null;
                    node = this.hitNodePool.get();
                    if (node) {
                        this.hint(node, toWorldPos);
                    } else {
                        node = cc.instantiate(this.hintPrefab);
                        this.hint(node, toWorldPos);
                    }
                },
                onEnd: () => {
                    // 更新动画
                    // this.vipExpCpt.updateVipExp();
                    // 通知更新
                    Global.dispatchEvent("USER_VIP_EXP_CHANGE");
                }
            });
        }
        // 金币
        let coinData = this.filterData(rewards, 1);
        if (coinData.length > 0) {
            let coinFrame = this.commonAtlas.getSpriteFrame("icon_coin");
            let toWorldPos = this.coinCpt.iconNode.convertToWorldSpaceAR(cc.v2(0, 0));
            this.coinCpt.node.active = true;
            // 数字跳动
            Global.doRoallNumEff(this.coinCpt.label.node, Math.max(cc.vv.UserManager.coin - coinData[0].count, 0), cc.vv.UserManager.coin, 2, () => {
                this.coinCpt.node.active = false;
            }, null, 2, true)
            // 飞金币
            Global.FlyAnimToPos(fromWorldPos, toWorldPos, {
                spriteFrame: coinFrame,
                scale: 0.75,
                count: 15,
                // delay: 0.3,
                onStart: () => {
                    let node = cc.instantiate(this.boomPrefab);
                    if (node) {
                        node.parent = cc.find("Canvas");
                        node.position = node.parent.convertToNodeSpaceAR(fromWorldPos);
                        node.zIndex = 900;
                        node.getComponent(sp.Skeleton).setCompleteListener((tck) => {
                            if (tck.animation && tck.animation.name == "animation") {
                                node.destroy()
                            }
                        })
                    }
                },
                onEndOne: () => {
                    let node = null;
                    node = this.hitNodePool.get();
                    if (node) {
                        this.hint(node, toWorldPos);
                    } else {
                        node = cc.instantiate(this.hintPrefab);
                        this.hint(node, toWorldPos);
                    }
                    this.coinCpt.node.stopAllActions();
                    cc.tween(this.coinCpt.node).to(0.03, { scale: 1.07 }).to(0.03, { scale: 1 }).start();
                }
            });
        }

        //是否有Bonus金币
        let nBounscoin = this.filterData(rewards, 12);
        if(nBounscoin.length>0){
            let nStartVal = cc.vv.UserManager.cashbonus - nBounscoin[0].count
            let nEndVal = cc.vv.UserManager.cashbonus
            let toNode = cc.find("safeview/UserinfoBar/lay_coins/coin_bonus",this.node)
            this.flyCoin(toNode,fromWorldPos,nStartVal,nEndVal,8)
            
        }

        //是否有Withdraw金币
        let nDrawcoin = this.filterData(rewards, 11);
        if(nDrawcoin.length>0){
            let nStartVal = cc.vv.UserManager.dcoin - nDrawcoin[0].count
            let nEndVal = cc.vv.UserManager.dcoin
            let toNode = cc.find("safeview/UserinfoBar/lay_coins/coin_draw",this.node)
            this.flyCoin(toNode,fromWorldPos,nStartVal,nEndVal,8)
            
        }


        // 道具
        let itemDatas = this.filterDataTypes(rewards, [44, 40, 39, 53, 50, 43, 54, 55]);
        if (itemDatas.length > 0) {
            // 出现背包
            // this.bagNode.active = true;
            let toWorldPos = this.bagNode.convertToWorldSpaceAR(cc.v2(0, 0));
            Global.FlyAnimToPos(fromWorldPos, toWorldPos, {
                prefab: this.itemPrefab,
                scale: 0.75,
                endScale: 0.55,
                count: itemDatas.length,
                onInit: (index, node) => {
                    let data = itemDatas[index];
                    node.getComponent(RewardItemCpt).updateView(data);
                    let iconNode = cc.find("icon", node);
                    if (data.type == 40) {
                        iconNode.scale = 0.5;
                    } else if (data.type == 55) {
                        iconNode.scale = 0.65;
                    } else if (data.type == 53) {
                        iconNode.scale = 0.6;
                    } else if (data.type == 44) {
                        iconNode.scale = 1.2;
                    } else {
                        iconNode.scale = 1;
                    }
                },
                onStart: () => {
                    this.bagNode.stopAllActions();
                    cc.tween(this.bagNode).to(0.2, { opacity: 255 }).start();
                    let node = cc.instantiate(this.boomPrefab);
                    if (node) {
                        node.parent = cc.find("Canvas");
                        node.position = node.parent.convertToNodeSpaceAR(fromWorldPos);
                        node.zIndex = 900;
                        node.getComponent(sp.Skeleton).setCompleteListener((tck) => {
                            if (tck.animation && tck.animation.name == "animation") {
                                node.destroy()
                            }
                        })
                    }
                },
                onEndOne: () => {
                    let node = null;
                    node = this.hitNodePool.get();
                    if (node) {
                        this.hint(node, toWorldPos);
                    } else {
                        node = cc.instantiate(this.hintPrefab);
                        this.hint(node, toWorldPos);
                    }
                    cc.tween(this.bagNode).to(0.1, { scale: this.initBagScale * 1.1 }).to(0.1, { scale: this.initBagScale }).start();
                },
                onEnd: () => {
                    this.bagNode.stopAllActions();
                    cc.tween(this.bagNode).to(0.2, { opacity: 0 }).start();
                },
            });
        }
    }

    flyCoin(toNode,fromWorldPos,nStartVal,nEndVal,nNum){
        let coinFrame = this.commonAtlas.getSpriteFrame("icon_coin");
            // let toNode = cc.find("safeview/UserinfoBar/lay_coins/coin_bonus",this.node)
            let toWorldPos = toNode.convertToWorldSpaceAR(cc.v2(0, 0));
            toNode.active = true;
            // 数字跳动
            Global.doRoallNumEff(cc.find("lbl_val",toNode), Math.max(nStartVal, 0), nEndVal, 2, () => {
                toNode.active = false;
            }, null, 2, true)
            // 飞金币
            Global.FlyAnimToPos(fromWorldPos, toWorldPos, {
                spriteFrame: coinFrame,
                scale: 0.75,
                count: nNum,
                // delay: 0.3,
                onStart: () => {
                    let node = cc.instantiate(this.boomPrefab);
                    if (node) {
                        node.parent = cc.find("Canvas");
                        node.position = node.parent.convertToNodeSpaceAR(fromWorldPos);
                        node.zIndex = 900;
                        node.getComponent(sp.Skeleton).setCompleteListener((tck) => {
                            if (tck.animation && tck.animation.name == "animation") {
                                node.destroy()
                            }
                        })
                    }
                },
                onEndOne: () => {
                    let node = null;
                    node = this.hitNodePool.get();
                    if (node) {
                        this.hint(node, toWorldPos);
                    } else {
                        node = cc.instantiate(this.hintPrefab);
                        this.hint(node, toWorldPos);
                    }
                    this.coinCpt.node.stopAllActions();
                    cc.tween(this.coinCpt.node).to(0.03, { scale: 1.07 }).to(0.03, { scale: 1 }).start();
                }
            });
    }
}
