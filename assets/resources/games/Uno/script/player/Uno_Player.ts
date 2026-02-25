
import { i18nSprite } from "../../../../../_FWExpand/i18n/i18nSprite";
import { PBPlayer } from "../../../PokerBase/scripts/player/PBPlayer";



const { ccclass, property } = cc._decorator;

/**
 * 玩家控制
 */
@ccclass
export class UnoPlayer extends PBPlayer {
    /**
     * 显示动作动画
     */
    async showActionAni(spName: string) {
        let actionImg = cc.find("action", this.node).getComponent(i18nSprite);
        actionImg.node.active = true;
        actionImg.node.scale = 0;
        actionImg.node.opacity = 0x1;
        actionImg.frameName = spName;
        cc.tween(actionImg.node)
            .to(0.3, { scale: 1, opacity: 0xff }, { easing: "backOut" })
            .delay(2)
            .to(0.2, { opacity: 0 })
            .call(() => {
                actionImg.node.active = false;
            })
            .start();
    }

    async drawCards(nodes: cc.Node[]) {
        this.dealARoundCard(nodes);
    }

    /**
     * 用于发牌动画CardStack调用
     * @param node 
     */
    async dealARoundCard(nodes: cc.Node[]) {
        this.dealedCardLen += nodes.length;
        let engle = -this.playerInfoVo.position * 90;
        let hideCards: cc.Node[] = [];
        for (let i = 0; i < nodes.length; i++) {
            hideCards.push(this.hideCardCtrl.addACard());
        }

        for (let i = 0; i < nodes.length; i++) {
            let c = nodes[i];
            let hideCard = hideCards[i];
            let endPos = hideCard.convertToWorldSpaceAR(cc.v2(0, 0));
            endPos = c.parent.convertToNodeSpaceAR(endPos);
            cc.tween(c)
                .delay(0.05 * i)
                .to(0.3, { x: endPos.x, y: endPos.y, scale: 0.75, angle: engle })
                .call(() => {
                    c.destroy();
                    hideCard.active = true;
                    cc.tween(hideCard)
                        .to(0.2, { scale: 1 }, { easing: "backOut" })
                        .start();
                })
                .start();
        }
        await facade.delayTime(0.1);
    }

    playAddCardNum(cardNum: number) {
        let addCardNum = cc.find("add_cardNum", this.node);
        addCardNum.active = true;
        addCardNum.opacity = 0;
        addCardNum.getComponent(cc.Label).string = "+" + cardNum;
        cc.tween(addCardNum)
            .parallel(
                cc.tween().to(0.2, { opacity: 255 }),
                cc.tween().by(0.7, { y: 100 })
            )
            .delay(1)
            .to(0.5, { opacity: 0 })
            .call(() => {
                addCardNum.y -= 100;
                addCardNum.active = false;
            })
            .start();
    }

    playSkip(cardNum: number = 0) {
        let icon = cc.find("icon_stop", this.node);
        let addCardNum = cc.find("add_cardNum", this.node);
        icon.active = true;
        icon.opacity = 0;
        cc.tween(icon)
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.5, { opacity: 0 })
            .call(() => {
                icon.active = false;
            })
            .start();

        if (cardNum > 0) {
            addCardNum.active = true;
            addCardNum.opacity = 0;
            addCardNum.getComponent(cc.Label).string = "+" + cardNum;
            cc.tween(addCardNum)
                .parallel(
                    cc.tween().to(0.2, { opacity: 255 }).to(0.5, { opacity: 0 }),
                    cc.tween().by(0.7, { y: 100 })
                )
                .call(() => {
                    addCardNum.y -= 100;
                    addCardNum.active = false;
                })
                .start();
        }
    }

    playChallenge(success: boolean) {
        let spine = cc.find("challenge", this.node).getComponent(sp.Skeleton);
        spine.node.active = true;
        spine.setAnimation(0, success ? "animation1" : "animation2", false);
        spine.setCompleteListener(() => {
            spine.setCompleteListener(null);
            spine.node.active = false;
        });

        this.playHammer(success);
    }

    setUnoVisible(isVisible: boolean) {
        cc.find("uno", this.node).active = isVisible;
        if (this.playerInfoVo && facade.dm.playersDm.isSelf(this.playerInfoVo.uid)) {
            facade.operate.setBtnUnoInteractable(!isVisible);
        }
    }

    isUnoVisible() {
        return cc.find("uno", this.node).active;
    }

    playHammer(success: boolean) {
        let hammer = cc.find("hammer", this.node);
        hammer.active = true;
        hammer.getComponent(sp.Skeleton).setAnimation(0, success ? "animation2" : "animation", false);
        hammer.getComponent(sp.Skeleton).setCompleteListener(() => {
            hammer.getComponent(sp.Skeleton).setCompleteListener(null);
            hammer.active = false;
        });
    }
}