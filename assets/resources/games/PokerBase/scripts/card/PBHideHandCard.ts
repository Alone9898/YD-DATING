import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";

const { ccclass, property, executeInEditMode, disallowMultiple } = cc._decorator;

/**
 * 其他玩家手牌
 */
@ccclass
@executeInEditMode
@disallowMultiple
export class PBHideHandCard extends cc.Component {
    @property()
    _angle: number = 5; // 牌间夹角
    @property({
        type: cc.Integer,
        displayName: "牌间夹角"
    })
    get angle(): number {
        return this._angle;
    }
    set angle(val: number) {
        if (this.angle == val) {
            return;
        }
        this._angle = val;
        this.layoutCards(false);
    }

    @property()
    _radius = 300;  // 半径
    @property({
        type: cc.Integer,
        displayName: "半径"
    })
    get radius(): number {
        return this._radius;
    }
    set radius(val: number) {
        if (this.radius == val) {
            return;
        }
        this._radius = val;
        this.layoutCards(false);
    }

    @property({     // 牌数量
        type: cc.Integer,
        displayName: "牌数量"
    })
    totalCnt = 15;

    @property(cc.Node)
    rest_cnt: cc.Node = null; //剩余张数节点

    cards: cc.Node[] = [];
    _currShowCards: cc.Node[] = [];
    _skin = "";
    _cardItemTemplate: cc.Node = null;
    onLoad() {
        this._init();
    }

    _init() {
        if (this.rest_cnt) {
            this.rest_cnt.active = false;
        }
        this._currShowCards = [];
        for (let i = 0; i < this.totalCnt; i++) {
            let c = cc.find(`card${i}`, this.node);
            if (c) {
                c.active = false;
                c.scale = 0;
                this.cards.push(c);
            }
        }
        if (!CC_EDITOR) {
            this._cardItemTemplate = cc.instantiate(this.cards[0]);
            this._cardItemTemplate.name = "cardItemTemplate";
            this._cardItemTemplate.parent = this.node;
            this._cardItemTemplate.x = 0;
            this._cardItemTemplate.y = 0;
            this._cardItemTemplate.scale = 0;
            this._cardItemTemplate.active = false;
        }

        if (CC_EDITOR) {
            this.showCardCnt(this.totalCnt);
        }

        if (this._skin) {
            let cards = this.getAllCards();
            cards.forEach(c => {
                c.getComponent(NetImg).url = this._skin;
            })
        }
    }

    reset() {
        this.cards = this.getAllCards();
        let totalCnt = this.totalCnt || 10;
        this.cards.forEach(c => {
            c.active = false;
            c.scale = 0;
        });
        if (this.cards.length > totalCnt) {
            let cards = this.cards.splice(totalCnt);
            cards.forEach(c => {
                c.destroy();
            })
        }
        this._currShowCards = [];
        this.updateRestCnt();
    }

    /**
     * 生成一张牌背
     */
    gendACard() {
        let c = cc.instantiate(this._cardItemTemplate);
        c.parent = this.node;
        if (this._skin) {
            c.getComponent(NetImg).url = this._skin;
        }
        return c;
    }

    getAllCards() {
        return this.cards.concat(this._currShowCards);
    }

    /**
     * 添加一张卡牌
     */
    addACard() {
        let card = this.cards.pop();
        if (!card) {
            card = this.gendACard();
        }
        let index = Math.floor(Math.random() * this._currShowCards.length);
        this._currShowCards.splice(index, 0, card);
        this.layoutCards();
        return card;
    }

    /**
     * 移除一张牌
     */
    removeACard() {
        if (!this._currShowCards || this._currShowCards.length < 1) {
            return null;
        }
        let card = this._currShowCards.splice(Math.floor(Math.random() * this._currShowCards.length), 1)[0];
        card.active = false;
        this.cards.push(card);
        this.layoutCards();
        return card;
    }

    /**
     * 直接显示牌数量
     */
    showCardCnt(cnt: number, ani = true) {
        this.reset();
        this._currShowCards = this.cards.splice(0, cnt);
        this._currShowCards.forEach(c => {
            c.active = true;
            c.scale = 1;
        });
        if (this._currShowCards.length < cnt) {
            for (let i = this._currShowCards.length; i < cnt; i++) {
                let c = this.gendACard();
                c.active = true;
                c.scale = 1;
                this._currShowCards.push(c);
            }
        }
        this.layoutCards(ani);
    }

    layoutCards(ani = true) {
        let cnt = this._currShowCards.length;
        let angle = this.angle;
        let radius = this.radius;
        let delta = (cnt - 1) * angle / 2;
        let x1 = 0;
        let y1 = radius;
        let x2 = 0;
        let y2 = 0;
        this._currShowCards.forEach((node, i) => {
            node.zIndex = i;
            let angle2 = angle * i - delta;
            let sinX = Math.sin(angle2 / 180 * Math.PI);
            let cosX = Math.cos(angle2 / 180 * Math.PI);
            let endX = (x1 - x2) * cosX - (y1 - y2) * sinX + x2;
            let endY = (x1 - x2) * sinX + (y1 - y2) * cosX + y2;
            endY -= radius;
            let endAngle = angle2;
            if (node.active && ani) {
                cc.tween(node)
                    .to(0.3, { x: endX, y: endY, angle: endAngle })
                    .start();
            } else {
                node.x = endX;
                node.y = endY;
                node.angle = endAngle;
            }
        });

        this.updateRestCnt();
    }

    /**
     * 更新剩余排数
     */
    updateRestCnt() {
        if (this.rest_cnt) {
            // this.rest_cnt.zIndex = 100;
            let label = this.rest_cnt.getChildByName("label").getComponent(cc.Label);
            label.string = this._currShowCards.length + "";
            this.rest_cnt.active = this._currShowCards.length > 0;
        }
    }

    showCnt() {
        cc.log("show cnt = " + this._currShowCards.length);

        return this._currShowCards.length;
    }

    set skin(str: string) {
        if (this._skin != str) {
            this._skin = str;
        }
    }
}