import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import { MoveShapeChange } from "../../../../../BalootClient/game_common/common_cmp/MoveShapeChange";
import { PromiseLock } from "../../../../../BalootClient/game_common/PromiseLock";
import { PBCardItem } from "../../../PokerBase/scripts/card/PBCardItem";
import { UnoCardItem } from "./UnoCardItem";

const { ccclass, property } = cc._decorator;

/**
 * 牌池组件
 */
@ccclass
export class UnoDiscardsPool extends cc.Component {
    card_template: UnoCardItem = null;
    circle: cc.Node = null;
    arrow: cc.Node = null;
    _curDirection: number = 1;

    onLoad() {
        this.card_template = cc.find("card_template", this.node).getComponent(UnoCardItem);
        this.circle = cc.find("bg/circle", this.node);
        this.arrow = cc.find("bg/arrow", this.node);
        this.circle.active = false;
        this.arrow.active = false;
        this.reset();
    }

    reset() {
        this.card_template.node.active = false;
        this.circle.active = false;
        this.arrow.active = false;
    }

    /**
     * 开始旋转
     * @param suit 
     * @param direction 1:逆时针 -1:顺时针
     */
    startRotate(suit: number, direction: number = 1) {
        this._curDirection = direction;
        this.circle.active = true;
        this.arrow.active = true;
        this.circle.getComponent(ImgSwitchCmpTS).setIndex(suit - 1);
        this.arrow.getComponent(ImgSwitchCmpTS).setIndex(suit - 1);
        this.arrow.scaleX = direction;
        this.arrow.stopAllActions();
        cc.tween(this.arrow)
            .repeatForever(
                cc.tween().by(30, { angle: 360 * direction })
            )
            .start();
    }

    /**
     * 更改旋转方向
     * @param direction 
     */
    changeDirection() {
        let temp = this._curDirection;
        this._curDirection *= -1;
        this.arrow.stopAllActions();
        cc.tween(this.arrow)
            .by(0.3, { angle: 360 * temp })
            .call(() => {
                this.arrow.scaleX = this._curDirection;
            })
            .repeatForever(
                cc.tween().by(30, { angle: 360 * this._curDirection })
            )
            .start();
    }

    /**
     * 更改当前出牌花色
     * @param suit 
     */
    changeSuit(suit: number) {
        this.circle.getComponent(ImgSwitchCmpTS).setIndex(suit - 1);
        this.arrow.getComponent(ImgSwitchCmpTS).setIndex(suit - 1);
    }

    /**
     * 直接显示牌池的牌
     */
    showCard(card: number) {
        this.card_template.node.active = true;
        this.card_template.bind(card);
    }

    /**
     * 发公共牌
     */
    async deal(cardBack: cc.Node, rawVal: number) {
        this.reset();

        let back = cardBack;
        let cardPos = back.convertToWorldSpaceAR(cc.v2(0, 0));
        cardPos = this.node.convertToNodeSpaceAR(cardPos);

        let endPos = this.card_template.node.position;

        let card = this.genAcard(rawVal);
        card.node.x = cardPos.x;
        card.node.y = cardPos.y;
        card.node.scaleX = 0;

        cc.tween(back)
            .to(0.2, { scaleX: 0 })
            .call(() => {
                back.destroy();
                cc.tween(card.node)
                    .to(0.2, { scaleX: 1 })
                    .delay(0.1)
                    .to(0.3, { position: endPos }, { easing: "cubicIn" })
                    .call(() => {
                        this.card_template.node.active = true;
                        this.card_template.bind(rawVal);
                    })
                    .removeSelf()
                    .start();
            })
            .start();

        await facade.delayTime(0.8);
    }

    changeToCard(val: number) {
        this.card_template.bind(val);
    }

    /**
     * 生成一张牌
     */
    genAcard(val: number) {
        let node = cc.instantiate(this.card_template.node);
        node.active = true;
        node.parent = this.node;
        let cmp = node.getComponent(UnoCardItem);
        cmp.skin = this.card_template.getComponent(UnoCardItem).skin;
        cmp.bind(val);
        return cmp;
    }

    /**
     * 添加显示牌
     */
    async addACard(cardRawVal: number, globalPos: cc.Vec2 = null, handCard: PBCardItem = null) {
        facade.dm.tableStatus.tableCard = cardRawVal;

        let aniLayer: cc.Node = facade.layerMgr.common_ani_layer;
        let endPos = aniLayer.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        if (globalPos) {
            let card = cc.instantiate(this.card_template.node).getComponent(UnoCardItem);
            card.node.active = true;
            card.bind(cardRawVal);

            let startPos = aniLayer.convertToNodeSpaceAR(globalPos);
            card.node.parent = aniLayer;
            card.node.x = startPos.x;
            card.node.y = startPos.y;
            if (!await PromiseLock.exe(
                new Promise(res => {
                    card.node.scale = 0.6;
                    // facade.soundMgr.playBaseEffect("deal_a_card_1");
                    facade.soundMgr.playBaseEffect("discardl_a_card_1");
                    cc.tween(card.node)
                        .parallel(
                            cc.tween().to(0.1, { scale: 1.2 }).to(0.1, { scale: 1 }),
                            cc.tween().to(0.2, { x: endPos.x, y: endPos.y }, { easing: "cubicIn" })
                        )
                        .call(() => {
                            card.node.destroy();
                            this.card_template.bind(cardRawVal);
                            res(true);
                        })
                        .start();
                })
            )) {
                return;
            }

            if (!await PromiseLock.exe(facade.delayTime(0.11))) {
                return;
            }
        } else {
            if (handCard) {
                let handCardPos = aniLayer.convertToNodeSpaceAR(handCard.node.convertToWorldSpaceAR(cc.v2(0, 0)));
                handCard.node.stopAllActions();
                handCard.holder.stopAllActions();
                handCard.setSelect(false, false);
                handCard.node.parent = aniLayer;
                handCard.node.setPosition(handCardPos);
                if (!await PromiseLock.exe(
                    new Promise(res => {
                        let aniScaleStart = 1.2 / handCard.holder.scale;
                        let aniScaleEnd = 0.8 / handCard.holder.scale;
                        cc.tween(handCard.node)
                            .call(() => {
                                cc.tween(handCard.holder)
                                    .to(0.2, { y: handCard.holderY * handCard.holder.scale })
                                    .start();
                            })
                            .parallel(
                                cc.tween().to(0.1, { scale: aniScaleStart })
                                    .call(() => {
                                        // facade.soundMgr.playBaseEffect("deal_a_card_1");
                                        facade.soundMgr.playBaseEffect("discardl_a_card_1");
                                    })
                                    .to(0.1, { scale: aniScaleEnd }),
                                cc.tween().to(0.2, { x: endPos.x, y: endPos.y, angle: 0 })
                            )
                            .call(() => {
                                handCard.scheduleOnce(() => {
                                    // 延迟一帧执行解更新牌时闪一下的问题
                                    handCard.node.destroy();
                                })
                                this.card_template.bind(cardRawVal);
                                res(true);
                            })
                            .start();
                    })
                )) {
                    return;
                }
                if (!await PromiseLock.exe(facade.delayTime(0.11))) {
                    return;
                }
            } else {
                this.card_template.bind(cardRawVal);
            }
        }
    }
}