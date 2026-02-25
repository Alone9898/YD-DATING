import BlackJack21HandCard from "./BlackJack21_HandCard";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21HandCardCtrl extends cc.Component {

    @property([BlackJack21HandCard])
    handcards: BlackJack21HandCard[] = [];

    @property([cc.Float])
    panelScale:number[] = [0.6,0.5];
    _moveCardList:cc.Node[] = [];

    _cardData:any[][] = [];
    set cardData(cardData){
        this._cardData = cardData;

        for (let i = 0; i < cardData.length; i++){
            if(cardData[i] && cardData[i].length > 0){
                this.handcards[i].cards = cardData[i];
            } else {
                this.handcards[i].cards = [];
            }
        }
        this.handcards[1].node.active = cardData[1] && cardData[1].length > 0;
        this.node.scale = cardData[1] && cardData[1].length > 0 ? this.panelScale[1] : this.panelScale[0];
    }
    get cardData(){
        return this._cardData
    }

    _cardType:number[][];
    set cardType(cardType){
        this._cardType = cardType;
        this.handcards.forEach((item,idx)=>{
            if(cardType){
                item.type = cardType[idx]
            } else {
                item.type = null;
            }
        })
    }
    get cardType(){
        return this._cardType
    }

    _activeTile: number = 1;    // (操作顺序先2后1，先右后左, ==1表示操作的是左边的牌堆，==2表示操作的是右边的牌堆, 单牌堆忽略该值)
    set activeTile(val){
        this._activeTile = val;
    }
    get activeTile(){
        return this._activeTile
    }

    cleanRound(){
        this.cardData = [];
        this.cardType = [];
        this.activeTile = 1;

        this.handcards.forEach((item,idx)=>{
            item.cleanRound();
        })
        this._moveCardList.forEach(node=>{
            if(node){
                node.stopAllActions();
                node.destroy();
            }
        })
        this._moveCardList = [];
        this.playTips(false);
    }

    playTips(bShow){
        this.handcards[0].playTips(bShow && this.activeTile == 1);
        this.handcards[1].playTips(bShow && this.activeTile == 2);
    }

    /**
     * 分牌
     * @param card
     * @param type
     */
    splitCard(card){
        let cards1 = [card[0][0]];
        let cards2 = [card[1][0]];

        this.cardData = [cards1, cards2];
    }

    /**
     * 发牌 用于发牌动画CardStack调用
     * @param mCard 移动的牌
     * @param card 发的单张牌的值
     * @param h_idx 0-第一摞牌 1-第二摞牌
     * @param c_idx 0-4 单张牌的idx
     */
    dealARoundCard(mCard, card, h_idx, c_idx) {
        facade.soundMgr.playEffect("qq_showcard");
        facade.playHeguanAnim("fapai");

        this._moveCardList.push(mCard);
        let endPos = mCard.parent.convertToNodeSpaceAR(this.handcards[h_idx].node.convertToWorldSpaceAR(cc.v2(0,0)));
        cc.tween(mCard)
            .delay(0.02)
            .to(0.2, { x: endPos.x, y: endPos.y , scale:1})
            .call(()=> {
                mCard.destroy();
                this._moveCardList.splice(this._moveCardList.indexOf(mCard),1);
                this.handcards[h_idx].addCard(c_idx,card);
            })
            .start()
    }

    /**
     * 庄家翻开牌
     * @param card
     * @param idx
     */
    flipHideCard(card, idx){
        this.handcards[0].addCard(idx, card);
    }

}
