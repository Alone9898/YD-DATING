
const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21CardPool extends cc.Component {
    @property(cc.Node)
    stack_card: cc.Node = null;

    start () {
        this.stack_card.active = false;
    }


    /**
     *第一轮发牌  --每人发两张
     */
    dealCardsFirst(dealables, cards, aborts){
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 2; i++) {
                for (let p = 0; p < dealables.length; p++) {
                    let node = cc.instantiate(this.stack_card);
                    node.parent = this.stack_card.parent;
                    node.active = true;
                    node.x = 0;
                    node.y = 0;

                    let dealC = cards[p][0][i];

                    dealables[p].handCardCtrl.dealARoundCard(node, dealC, 0, i)
                    await facade.delayTime(0.15,facade.aborts);
                }
            }

            if(aborts){
                aborts.push(reject)
            }

            resolve();
        });
    }


    /**
     * 玩家要牌 --一次只会发一张牌
     * @param player
     * @param dealCard
     * @param h_idx
     * @param c_idx
     */
    dealCards(player,dealCard, h_idx, c_idx){
        this.stack_card.stopAllActions();
        this.stack_card.active = true;

        let node = cc.instantiate(this.stack_card);
        node.parent = this.stack_card.parent;
        node.active = true;
        player.handCardCtrl.dealARoundCard(node, dealCard, h_idx, c_idx);

        cc.tween(this.stack_card)
            .delay(0.3)
            .call(()=>{
                this.stack_card.active = false;
            })
            .start()
    }

    cleanRound(){
        this.stack_card.active = false;
        this.stack_card.stopAllActions();
    }

    // update (dt) {}
}
