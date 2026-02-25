import BlackJack21HandCardCtrl from "../card/BlackJack21_HandCardCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21Banker extends cc.Component {
    handCardCtrl:BlackJack21HandCardCtrl;
    _bankerPos:cc.Vec2;
    get bankerPos(){
        return this._bankerPos;
    }

    onLoad(){
        let playerNode = this.node.getChildByName("banker");

        let handcard =  playerNode.getChildByName("handcard");
        this.handCardCtrl = handcard.getComponent(BlackJack21HandCardCtrl);
        // this.handCardCtrl.init();

        this._bankerPos = playerNode.convertToWorldSpaceAR(cc.v2(0,0));
    }


    /**
     * 庄家翻牌
     * @param bankercard
     * @param bankertype
     */
    showResultCards(bankercard, bankertype,aborts){
        return new Promise(async (resolve, reject) => {
            for (let i = 1; i < bankercard.length; i++) {
                let card = bankercard[i];
                if (i == 1) {
                    facade.soundMgr.playEffect("qq_showcard");
                    this.handCardCtrl.flipHideCard(card, i)
                    await facade.delayTime(0.3, facade.aborts)
                } else {
                    facade.cardPoolCtrl.dealCards(this, card, 0, i)
                    await facade.delayTime(0.5, facade.aborts)
                }
                this.handCardCtrl.cardType = [bankertype[i - 1]];
            }

            aborts.push(reject);
            resolve();
        });
    }

    cleanRound(){
        this.handCardCtrl.cleanRound();
    }

    // update (dt) {}
}
