const { ccclass, property } = cc._decorator;

@ccclass
export default class HallSlotBtn extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null;
    // @property(cc.Node)
    // lockNode: cc.Node = null;
    // @property(cc.Node)
    // unlockAnimNode: cc.Node = null;
    // @property(cc.Prefab)
    // vipShopPrefab: cc.Prefab = null;

    private eventListener: any;
    private unlockAnimNode: cc.Node;
    isPlayAnim: boolean = false;

    onLoad() {
        this.node.on("click", this.onClick, this)
        // cc.find("lock", this.node).on("click", this.playUnlockAnim, this)
        this.eventListener = this.node.addComponent("EventListenerCmp");
        this.updateInfo();
        // this.unlockAnimNode.active = false;

        let countryHeartBtn = cc.find("CountryHeartBtn", this.node)
        if (countryHeartBtn) {
            let cpt = countryHeartBtn.getComponent("CountryHeartBtn")
            cpt.gameid = 100;
            cpt.countryId = cc.vv.UserManager.slotVoteCountry;
        }
    }

    // protected onEnable(): void {
    //     // 更新用户信息成功
    //     this.eventListener.registerEvent("USER_INFO_CHANGE", this.updateInfo, this);
    //     // 购买成功
    //     this.eventListener.registerEvent("PURCHASE_VIP_SUC", this.purchaseVipSuc, this);
    // }
    protected onDisable(): void {
        if(this.eventListener){
            this.eventListener.clear();
        }
        
    }


    onClick() {
        // if (cc.vv.UserManager.svip < 4) return;
        // if (Global.getLocal("UNLOCK_SLOTS_MODULE") != "1") {  // 没解锁
        //     this.playUnlockAnim();
        //     return;
        // }
        cc.vv.PopupManager.addPopup(this.prefab, {
            opacityIn: true,
        });
    }

    updateInfo() {
        if (cc.vv.UserManager.slotsList.length <= 0) {
            this.node.active = false;
            // this.lockNode.active = false;
        } else {
            this.node.active = true;
            // this.lockNode.active = cc.vv.UserManager.svip < 4 || Global.getLocal("UNLOCK_SLOTS_MODULE") != "1";
            // cc.find("CountryHeartBtn", this.node).active = !this.lockNode.active;
            // if (cc.vv.UserManager.svip < 4 || Global.getLocal("UNLOCK_SLOTS_MODULE") != "1") {
            //     cc.find("deng", this.lockNode).active = true;
            //     cc.find("spin", this.node).getComponent(sp.Skeleton).setAnimation(0, "Animation0", true);
            // } else {
            //     cc.find("deng", this.lockNode).active = false;
            //     cc.find("spin", this.node).getComponent(sp.Skeleton).setAnimation(0, "Animation1", true);
            // }
        }
    }

    // // 弹窗上购买vip成功
    // purchaseVipSuc() {
    //     cc.find("deng", this.lockNode).active = false;
    //     this.scheduleOnce(() => {
    //         this.playUnlockAnim();
    //     }, 0.5)
    // }

    // async playUnlockAnim() {
    //     // 判断是否满足vip4
    //     if (cc.vv.UserManager.svip < 4) {
    //         // 判断是否满了vip4的经验值
    //         if (cc.vv.UserManager.getVip() < 4) {
    //             // 打开VIP5直充礼包
    //             cc.vv.PopupManager.addPopup(this.vipShopPrefab, { scaleIn: true });
    //         } else {
    //             // 去开通vip
    //             cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 2 });
    //         }
    //         return
    //     }
    //     if (this.isPlayAnim) return;
    //     this.isPlayAnim = true;
    //     cc.log("playUnlockAnim loadAniPrefab")
    //     await this.loadAniPrefab()
    //     if (!this.unlockAnimNode) {
    //         return
    //     }
    //     this.unlockAnimNode.active = true;
    //     Global.saveLocal("UNLOCK_SLOTS_MODULE", "1");
    //     cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'slots_unlock_1', true);
    //     cc.find("deng", this.lockNode).active = false;
    //     let sPos = this.unlockAnimNode.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v3(0, 0, 0)));
    //     cc.find("zhuanpanyan", this.unlockAnimNode).position = sPos;
    //     cc.find("xiaoshiyan", this.unlockAnimNode).position = sPos;
    //     await this.playSpine(cc.find("zhuanpanyan", this.unlockAnimNode));
    //     cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'slots_unlock_2', true);
    //     await this.playSpine(cc.find("xiaoshiyan", this.unlockAnimNode), "animation1");
    //     await new Promise((success: Function) => {
    //         let alading = cc.find("aladingshendeng", this.unlockAnimNode);
    //         alading.active = true;
    //         alading.setScale(0.35);
    //         alading.opacity = 0;
    //         alading.position = cc.v3(sPos.x, sPos.y - 300, 0);
    //         this.playSpine(alading, "idle");
    //         cc.tween(alading)
    //             .parallel(
    //                 cc.tween().to(0.5, { position: this.unlockAnimNode.convertToNodeSpaceAR(cc.v3(cc.winSize.width / 2 - 60, cc.winSize.height / 2 - 900)), scale: 1.2, opacity: 255 }),
    //                 cc.tween().delay(0.4).call(() => {
    //                     this.playSpine(alading, "skill_1");
    //                 })
    //             )
    //             .delay(1.5)
    //             .call(() => {
    //                 this.updateInfo();
    //             })
    //             .to(0.5, { position: cc.v3(sPos.x + 200, sPos.y - 600, 0) })
    //             .call(() => {
    //                 success()
    //             })
    //             .start()
    //     })
    //     cc.log("playUnlockAnim destroy")
    //     this.unlockAnimNode.destroy()
    //     this.unlockAnimNode = null;
    //     this.isPlayAnim = false;
    // }

    // //播放Spine
    // playSpine(node, animationName = "animation", isLoop = false, endCall = null) {
    //     return new Promise((success: Function) => {
    //         if (node) {
    //             node.active = true;
    //             node.getComponent(sp.Skeleton).setAnimation(0, animationName, isLoop);
    //             if (!isLoop) {
    //                 node.getComponent(sp.Skeleton).setCompleteListener(() => {
    //                     if (endCall) endCall();
    //                     success(); //下一步
    //                 });
    //             }
    //             else {
    //                 node.active = false;
    //                 success(); //下一步
    //             }
    //         }
    //         else {
    //             if (endCall) endCall();
    //             success(); //下一步
    //         }
    //     });
    // }
}
