import {PBCardItem} from "../../../PokerBase/scripts/card/PBCardItem";
import {BlackJack21AlignType} from "../BlackJack21_CommonData";
import {PokerLayoutType} from "../../../../../_FWExpand/Ecs/components/PokerLayoutCpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21HandCard extends cc.Component {

    @property([PBCardItem])
    cardsList:PBCardItem[] = [];
    @property(cc.Node)
    hideCard: cc.Node = null;
    @property(cc.Node)
    totalNode: cc.Node = null;
    @property(cc.Label)
    totalCnt: cc.Label = null;
    @property(cc.Node)
    specialNode: cc.Node = null;
    @property(cc.Node)
    tips: cc.Node = null;

    @property()
    _alignType : BlackJack21AlignType = BlackJack21AlignType.Left;
    @property({
        type: cc.Enum(BlackJack21AlignType),
        displayName: "手牌对齐方式",
    })
    get alignType(): number {
        return this._alignType;
    }
    set alignType(val: number) {
        this._alignType = val;
    }

    _cards=[];
    set cards(value){
        this._cards = value;
        this.layoutCards(value);
        this.updateShowPos(value);
    }
    get cards(){
        return this._cards;
    }

    _type=null;
    set type(type){
        this._type = type;
        this.updateTypeView(type)
    }
    get type(){
        return this._type;
    }

    start () {

    }

    /**
     * 发一张牌
     * @param idx 0-4
     * @param cardData 牌值
     */
    addCard(idx, cardData){
        this._cards[idx] = cardData;
        this.layoutCards(this._cards, true);
    }

    /**
     *
     * @param cardsData 一组牌的数据
     * @param bAnim 最后一张牌是否要翻牌-即新发一张牌的翻牌动画
     * 发牌时cardsData传当前手牌+新发一张牌的数据，bAnim传true
     */
    layoutCards(cardsData, bAnim=false){
        let allCnt = cardsData.length;
        for (let i = 0; i < 5; i++){
            let card = this.cardsList[i];
            card.node.position = cc.vv.gameData.getCardPos(i,allCnt,this.alignType);
            card.node.stopAllActions();
            card.node.scaleX = 1;

            if(cardsData[i] == 0){  // 庄家的第二张手牌
                this.hideCard.active = true;
                this.hideCard.position = cc.vv.gameData.getCardPos(i,allCnt,this.alignType);
                this.hideCard.scaleX = 1;
            } else {
                card.bind(cardsData[i]);
                if(bAnim){
                    card.node.active = i < allCnt-1;
                    if(i == allCnt-1){
                        this.hideCard.active = true;
                        this.hideCard.position = cc.vv.gameData.getCardPos(i,allCnt,this.alignType);
                        this.hideCard.scaleX = 1;
                        cc.tween(this.hideCard)
                            .to(0.2, {scaleX:0})
                            .start()
                        cc.tween(card.node)
                            .delay(0.2)
                            .call(()=>{
                                card.node.active = true;
                                card.node.scaleX = 0;
                            })
                            .to(0.2,{scaleX:1})
                            .start()
                    }
                } else {
                    card.node.active = i < allCnt;
                }
            }
        }
    }

    /**
     *
     * @param type 15 || 100 || [14,4]
     */
    updateTypeView(type){
        this.totalNode.active = false;
        this.specialNode.active = false;
        if(type > 0 && type <= 21){ // 正常点数
            this.totalNode.active = true;
            this.totalCnt.string = "" + type;
        } else if(type == 0 || type > 21){  // 特殊牌型
            this.specialNode.active = true;
            this.specialNode.children.forEach(node=>{node.active = false});
            if(type == 0) {  // 爆牌
                cc.find("boom", this.specialNode).active = true;
                cc.find("boom/spine", this.specialNode).getComponent(sp.Skeleton).setAnimation(0,"animation",false);
                cc.find("boom/spine", this.specialNode).getComponent(sp.Skeleton).addAnimation(0,"animation2",false);
                facade.soundMgr.playEffect("baopai");
            } else if(type == 100) { // 五张
                cc.find("five", this.specialNode).active = true;
                cc.find("five/spine", this.specialNode).getComponent(sp.Skeleton).setAnimation(0,"animation",false);
                cc.find("five/spine", this.specialNode).getComponent(sp.Skeleton).addAnimation(0,"animation2",false);
                facade.soundMgr.playEffect("qq_goodcard");
            } else if(type == 101) { // blackJack
                cc.find("blackJ", this.specialNode).active = true;
                cc.find("blackJ/spine", this.specialNode).getComponent(sp.Skeleton).setAnimation(0,"animation",false);
                cc.find("blackJ/spine", this.specialNode).getComponent(sp.Skeleton).addAnimation(0,"animation2",false);
                facade.soundMgr.playEffect("blackjack");
            }
        } else if(type && type.length == 2){  // 两种牌型
            this.totalNode.active = true;
            this.totalCnt.string = `${type[0]}/${type[1]}`;
        }
    }

    updateShowPos(cards){
        if(cards && cards.length){
            let cntPos = cc.vv.gameData.getCardPos(0, cards.length,this.alignType);
            this.totalNode.position = cc.v3(cntPos.x, -86.5);
            this.specialNode.position = cc.v3(cntPos.x, -86.5);

            let tipPos = cc.vv.gameData.getCardPos(cards.length-1, cards.length,this.alignType);
            this.tips.position = cc.v3(tipPos.x, 92);
        }
    }

    cleanRound() {
        this.type = null;
        this.cards = [];
        this.playTips(false);
        this.hideCard.active = false;
        this.hideCard.stopAllActions();
        this.cardsList.forEach((item)=>{
            item.node.stopAllActions()
        })
    }

    playTips(bAnim){
        if(bAnim){
            this.tips.active = true;
        } else {
            this.tips.active = false;
        }
    }

}
