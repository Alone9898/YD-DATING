import NetImg from "../../../../BalootClient/game_common/common_cmp/NetImg";
import { PBCardVo } from "../../PokerBase/scripts/card/PBCardData";
import { PBCardItemSimple } from "../../PokerBase/scripts/card/PBCardItemSimple";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DelphiPossibleCpt extends cc.Component {

    @property(cc.Node)
    cardItem: cc.Node = null;
    @property(cc.Node)
    cardLayout: cc.Node = null;

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


    onLoad() {
        this.cardItem.active = false;
    }

    open(data) {
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

        this.node.active = true;
        // 设置牌型
        let cardType = data.ctype;
        this.typeNode5.active = cardType == 5;
        this.typeNode6.active = cardType == 6;
        this.typeNode7.active = cardType == 7;
        this.typeNode8.active = cardType == 8;
        this.typeNode9.active = cardType == 9;
        this.typeNode10.active = cardType == 10;

        let possibleConfig = [];
        // 设置可能性
        if ([5, 7].indexOf(cardType) >= 0) {
            // 顺子/葫芦 任意花色 指定牌值
            for (const uint of data.cards) {
                possibleConfig.push({ type: 1, uint: uint });
            }
        } else if ([6].indexOf(cardType) >= 0) {
            // 同花 任意牌值 指定花色
            possibleConfig.push({ type: 2, uint: data.cards[0] });
        } else if ([8, 9, 10].indexOf(cardType) >= 0) {
            // 四条/同花顺/皇家同花顺 完全指定
            for (const uint of data.cards) {
                possibleConfig.push({ type: 3, uint: uint });
            }
        }
        for (const _node of this.cardLayout.children) {
            _node.active = false;
        }
        for (let i = 0; i < possibleConfig.length; i++) {
            const data = possibleConfig[i];
            let itemNode = this.cardLayout.children[i];
            if (!itemNode) {
                itemNode = cc.instantiate(this.cardItem);
                itemNode.parent = this.cardLayout;
            }
            itemNode.active = true;
            let cardVo = new PBCardVo().initByRawValue(data.uint);
            // 更新
            cc.find("card_any", itemNode).active = false;
            cc.find("card_item_small", itemNode).active = false;
            if (data.type == 1) {
                cc.find("card_any", itemNode).active = true;
                cc.find("card_any/icon_suit_small", itemNode).active = false;
                cc.find("card_any/icon_number", itemNode).active = true;
                cc.find("card_any/icon_number", itemNode).getComponent(NetImg).url = (cardVo.isRed() ? "num_red_" : "num_black_") + cardVo.value;
            } else if (data.type == 2) {
                cc.find("card_any", itemNode).active = true;
                cc.find("card_any/icon_suit_small", itemNode).active = true;
                cc.find("card_any/icon_number", itemNode).active = false;
                cc.find("card_any/icon_suit_small", itemNode).getComponent(NetImg).url = `suit_${cardVo.suit}`;
            } else if (data.type == 3) {
                cc.find("card_item_small", itemNode).active = true;
                cc.find("card_item_small", itemNode).getComponent(PBCardItemSimple).bind(data.uint);
            }
        }


        this.cardLayout.getComponent(cc.Layout).spacingX = possibleConfig.length > 2 ? -15 : 10;

    }

    close() {
        this.node.stopAllActions();
        this.node.active = false;
        this.node.position = cc.v3(-2000, -2000);
        this.node.opacity = 255
    }

}
