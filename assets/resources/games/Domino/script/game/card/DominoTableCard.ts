import { DominoCardInfoVO } from "./DominoCard";

const { ccclass, property } = cc._decorator;

@ccclass
export class DominoTableCard extends cc.Component {
    @property(cc.Node)
    card_h: cc.Node = null;
    @property(cc.Node)
    card_v: cc.Node = null;
    @property(cc.Node)
    kuang_h: cc.Node = null;
    @property(cc.Node)
    kuang_v: cc.Node = null;

    info: DominoCardInfoVO = null;
    direction: number;

    protected onLoad(): void {

    }

    /**
     * 
     * @param up 
     * @param down 
     * @param direction 0为纵向，1为横向
     */
    setPoint(card: any, direction: number = 0) {
        this.direction = direction;
        this.info = new DominoCardInfoVO();
        this.info.parse(card);
        let up = card.l;
        let down = card.u;
        let upPoint = cc.find("top", this.card_h);
        let downPoint = cc.find("bottom", this.card_h);
        this.card_h.active = direction === 0;
        this.card_v.active = direction === 1;
        if (direction === 1) {
            upPoint = cc.find("top", this.card_v);
            downPoint = cc.find("bottom", this.card_v);
        }
        if (up >= 0 && up <= 6 && down >= 0 && down <= 6) {
            if (up >= 1) {
                upPoint.active = true;
                upPoint.getComponent("ImgSwitchCmpTS").setIndex(up - 1);
            } else {
                upPoint.active = false;
            }

            if (down >= 1) {
                downPoint.active = true;
                downPoint.getComponent("ImgSwitchCmpTS").setIndex(down - 1);
            } else {
                downPoint.active = false;
            }
        } else {
            cc.log("wrong point!!!");
        }
    }

    exchange() {
        let upPoint = cc.find("top", this.card_h);
        let downPoint = cc.find("bottom", this.card_h);
        if (this.info.big >= 1) {
            upPoint.active = true;
        }
        if (this.info.small >= 1) {
            downPoint.active = true;
        }
        upPoint.getComponent("ImgSwitchCmpTS").setIndex(this.info.big - 1);
        downPoint.getComponent("ImgSwitchCmpTS").setIndex(this.info.small - 1);
    }

    setKuang(isOrNot: boolean, direction: number) {
        this.kuang_h.active = false;
        this.kuang_v.active = false;
        let kuang = this.kuang_h;
        if (direction === 1) {
            kuang = this.kuang_v;
        }
        kuang.active = isOrNot;
    }

    hideCard() {
        this.card_h.active = false;
        this.card_v.active = false;
    }

    showCard() {
        this.card_h.active = this.direction === 0;
        this.card_v.active = this.direction === 1;
    }
}