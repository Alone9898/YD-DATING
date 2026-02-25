import { PromiseLock } from "../../../../../BalootClient/game_common/PromiseLock";
import { PBFlowState } from "../../../PokerBase/scripts/PBCommonData";

const { ccclass, property } = cc._decorator;

/**
 * 
 */
@ccclass
export class UnoCardStack extends cc.Component {
    spaceTime = 0.5;
    panel: cc.Node = null;
    stack_card_template: cc.Node = null;
    onLoad() {
        this.panel = cc.find("panel", this.node);
        this.stack_card_template = cc.find("card_back_template", this.node);

        this.stack_card_template.on(cc.Node.EventType.TOUCH_END, () => {
            if (!facade.dm.tableStatus.canOutCard) {
                return;
            }

            if (facade.dm.tableStatus.flowState !== PBFlowState.playing) {
                return;
            }


            // if (facade.playersCtrl.getPlayerByPosition(0).isUnoVisible()) {
            //     return;
            // }

            this.setFingerVisible(false);
            facade.dm.msgWriter.sendDraw();
        })
    }

    reset() {
        this.panel.removeAllChildren();
    }

    setFingerVisible(isVisible: boolean) {
        cc.find("finger", this.node).active = isVisible;
    }

    /**
     * 发公共牌
     */
    async dealPublicCard(dealAble: { deal: (cardBack: cc.Node, rawVal: number) => Promise<any> }, cardsRawVal: number) {
        this.node.active = true;

        let node = cc.instantiate(this.stack_card_template);
        node.active = true;
        node.parent = this.panel;

        await PromiseLock.exe(dealAble.deal(node, cardsRawVal));
    }

    async drawCards(dealables: { drawCards: (cards: cc.Node[]) => Promise<any> }[], cardsNum: number) {
        if (!dealables || dealables.length < 1) {
            return;
        }
        this.node.active = true;

        this.stack_card_template.active = true;

        for (let i = 0; i < dealables.length; i++) {
            facade.soundMgr.playBaseEffect("deal_a_card_1");
            let cardsBack: cc.Node[] = [];
            for (let j = 0; j < cardsNum; j++) {
                let node = cc.instantiate(this.stack_card_template);
                node.parent = this.panel;
                node.active = true;
                cardsBack.push(node);
            }
            if (!await PromiseLock.exe(dealables[i].drawCards(cardsBack))) {
                return;
            }
        }
    }


    /**
     * 发牌
     * @param dealables 
     */
    async dealCards(dealables: { dealARoundCard: (card: cc.Node[]) => Promise<any> }[]) {
        if (!dealables || dealables.length < 1) {
            return;
        }
        this.node.active = true;

        this.stack_card_template.active = true;
        for (let round = 0; round < 3; round++) {
            for (let i = 0; i < dealables.length; i++) {
                facade.soundMgr.playBaseEffect("deal_a_card_1");
                let cardsBack: cc.Node[] = [];
                let roundCnt = round == 2 ? 3 : 2;
                for (let j = 0; j < roundCnt; j++) {
                    let node = cc.instantiate(this.stack_card_template);
                    node.parent = this.panel;
                    node.active = true;
                    cardsBack.push(node);
                }
                if (!await PromiseLock.exe(dealables[i].dealARoundCard(cardsBack))) {
                    return;
                }
            }
        }
    }
}