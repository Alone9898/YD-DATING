import { type } from "os";

const { ccclass, property } = cc._decorator;

@ccclass('TeenPattiCardTypeFrameAttr')
export class TeenPattiCardTypeFrameAttr {
    @property({ type: cc.Integer, displayName: '范围' })
    cardType = 0;
    @property({ type: cc.SpriteFrame, displayName: '纹理' })
    frame: cc.SpriteFrame = null;
}

@ccclass
export default class TeenPattiCardTypeCpt extends cc.Component {
    @property(cc.Label)
    typeLabel: cc.Label = null;

    // @property(cc.Sprite)
    // typeSprite: cc.Sprite = null;

    @property([cc.Node])
    typeNodes: cc.Node[] = [];

    @property(cc.Node)
    typeJdt: cc.Node = null;

    // @property([TeenPattiCardTypeFrameAttr])
    // frameList: TeenPattiCardTypeFrameAttr[] = [];

    setCardType(cardType, showJdt = false) {
        let str = '';
        for (let i = 0; i < this.typeNodes.length; i++) {
            const tyNode = this.typeNodes[i];
            if (tyNode) tyNode.active = false;
        }
        if (this.typeNodes[cardType]) {
            this.typeNodes[cardType].active = true;
            this.node.active = true;
        }
        //我的牌型 0:无牌型 1:点牌 2:对子 3:同花 4:顺子 5:同花顺 6:豹子
        // let frame = null
        // for (const item of this.frameList) {
        //     if (item.cardType == cardType) {
        //         frame = item.frame;
        //     }
        // }
        // if (frame) {
        //     this.node.active = true;
        //     this.typeLabel.string = str
        //     this.typeSprite.spriteFrame = frame;
        // }


        // if (cardType == 1) {
        //     str = ___('点牌')
        // } else if (cardType == 2) {
        //     str = ___('对子')
        // } else if (cardType == 3) {
        //     str = ___('同花')
        // } else if (cardType == 4) {
        //     str = ___('顺子')
        // } else if (cardType == 5) {
        //     str = ___('同花顺')
        // } else if (cardType == 6) {
        //     str = ___('豹子')
        // }
        
        if (str) {
            this.node.active = true;
            this.typeLabel.string = str
        }

        if (this.typeJdt) {
            if (showJdt) {
                this.typeJdt.active = true;
                let perList = [0.1, 0.3, 0.5, 0.7, 0.8, 1]
                cc.find("mask", this.typeJdt).width = 358 * perList[cardType - 1]
            } else {
                this.typeJdt.active = false;
            }
        }
    }

    close() {
        this.node.active = false;
    }
}
