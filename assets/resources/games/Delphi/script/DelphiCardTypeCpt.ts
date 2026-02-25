const { ccclass, property } = cc._decorator;

@ccclass('DelphiCardTypeFrameAttr')
export class DelphiCardTypeFrameAttr {
    @property({ type: cc.Integer, displayName: '范围' })
    cardType = 0;
    @property({ type: cc.SpriteFrame, displayName: '纹理' })
    frame: cc.SpriteFrame = null;
}

@ccclass
export default class DelphiCardTypeCpt extends cc.Component {

    @property(sp.Skeleton)
    bgSke: sp.Skeleton = null;

    @property(cc.Node)
    cardTypeContent: cc.Node = null;

    @property(cc.Node)
    typeNode1: cc.Node = null;
    @property(cc.Node)
    typeNode2: cc.Node = null;
    @property(cc.Node)
    typeNode3: cc.Node = null;
    @property(cc.Node)
    typeNode4: cc.Node = null;
    @property(cc.Node)
    typeNode5: cc.Node = null;
    @property(cc.Node)
    typeNode6: cc.Node = null;
    @property(cc.Node)
    typeNode7: cc.Node = null;
    @property(cc.Node)
    typeNode8: cc.Node = null;
    @property(cc.Node)
    typeNode9: cc.Node = null;
    @property(cc.Node)
    typeNode10: cc.Node = null;

    get isShow() {
        return this.node.active;
    }

    setCardType(cardType) {
        // HighCard = 1,  -- 高牌
        // OnePair  = 2,  -- 一对
        // TwoPair  = 3,  -- 两对
        // ThreeKind = 4,  -- 三条
        // Straight = 5,  -- 顺子
        // Flush    = 6,  -- 同花
        // FullHouse = 7,  -- 葫芦
        // FourKind = 8,  -- 四条
        // StraightFlush = 9, -- 同花顺
        // RoyalFlush = 10,  -- 皇家同花顺
        if (cardType <= 0) {
            this.close();
            return;
        }
        this.cardTypeContent.scale = 1;
        this.typeNode1.active = cardType == 1;
        this.typeNode2.active = cardType == 2;
        this.typeNode3.active = cardType == 3;
        this.typeNode4.active = cardType == 4;
        this.typeNode5.active = cardType == 5;
        this.typeNode6.active = cardType == 6;
        this.typeNode7.active = cardType == 7;
        this.typeNode8.active = cardType == 8;
        this.typeNode9.active = cardType == 9;
        this.typeNode10.active = cardType == 10;
        this.setBgNode(true);
        if (cardType == 1) {
            this.bgSke.setSkin("A01");
        } else if (cardType == 2 || cardType == 3) {
            this.bgSke.setSkin("A02");
        } else if (cardType == 4 || cardType == 5) {
            this.bgSke.setSkin("A03");
        } else if (cardType == 6 || cardType == 7) {
            this.bgSke.setSkin("A04");
        } else if (cardType == 8 || cardType == 9 || cardType == 10) {
            this.bgSke.setSkin("A05");
        }
        this.bgSke.setAnimation(0, "animation1", true);
        this.node.active = true;
    }


    showLight() {
        this.cardTypeContent.stopAllActions();
        cc.tween(this.cardTypeContent).to(0.3, { scale: 1.3 }).start();
        this.bgSke.setAnimation(0, "animation2", true);
    }


    setBgNode(value) {
        this.bgSke.node.active = value;
    }


    close() {
        this.node.stopAllActions();
        this.cardTypeContent.stopAllActions();
        this.bgSke.setAnimation(0, "animation1", true);
        this.cardTypeContent.scale = 1;
        this.node.active = false;
    }

}
