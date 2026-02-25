import TeenPattiSeatCpt from "./TeenPattiSeatCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeenPattiPotCpt extends cc.Component {
    @property(cc.Node)
    betNode: cc.Node = null;

    private _betChips = 0;
    set betChips(value) {
        this._betChips = value;
        let seatCpts: TeenPattiSeatCpt[] = [];
        for (const seatCpt of facade.getCpts(TeenPattiSeatCpt)) {
            if (seatCpt.betNode.active) {
                seatCpts.push(seatCpt);
            }
        }
        if (seatCpts.length > 0) {
            for (let i = 0; i < seatCpts.length; i++) {
                const betNode = seatCpts[i].betNode;
                betNode.stopAllActions();
                let endPos = betNode.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0, 0)));
                cc.tween(betNode).to(0.3, { position: endPos }, { easing: "sineOut" }).call(() => {
                    seatCpts[i].setBetChips(0);
                    if (i == seatCpts.length - 1) {
                        this.betNode.active = value > 0;
                        if (this.betNode.active) {
                            cc.tween(this.betNode).to(0.05, { scale: 0.9 }).to(0.1, { scale: 1 }).start();
                            this.betNode.getComponentInChildren(cc.Label).string = Global.FormatNumToComma(value);
                        }
                    }
                }).start();
            }
        } else {
            this.betNode.active = value > 0;
            if (this.betNode.active) {
                this.betNode.getComponentInChildren(cc.Label).string = Global.FormatNumToComma(value);
            }
        }
    }
    get betChips() {
        return this._betChips;
    }

    @property(cc.Label)
    roundLabel: cc.Label = null;
    maxRound = 0;
    private _round = 0;
    set round(value) {
        this._round = value;
        if (this.roundLabel) {
            this.roundLabel.string = "Round " + value + '/100';
        }
    }
    get round() {
        return this._round;
    }

    setBetChips(value, anim = true) {

    }

}
