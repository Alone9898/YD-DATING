import DelphiSeatCpt from "./DelphiSeatCpt";

const { ccclass, property } = cc._decorator;

// 位置配置

let pos_x_1 = -190;
let pos_x_2 = 0;
let pos_x_3 = 190;

let pos_y_1 = -75;
let pos_y_2 = -150;
let pos_y_3 = -225;

let POT_POS_CONFIG = {
    [1]: [cc.v3(pos_x_2, pos_y_1)],
    [2]: [cc.v3(pos_x_1 / 2, pos_y_1), cc.v3(pos_x_3 / 2, pos_y_1)],
    [3]: [cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1)],

    [4]: [
        cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1),
        cc.v3(pos_x_2, pos_y_2),
    ],
    [5]: [
        cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1),
        cc.v3(pos_x_1 / 2, pos_y_2), cc.v3(pos_x_3 / 2, pos_y_2),
    ],
    [6]: [
        cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1),
        cc.v3(pos_x_1, pos_y_2), cc.v3(pos_x_2, pos_y_2), cc.v3(pos_x_3, pos_y_2),
    ],
    [7]: [
        cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1),
        cc.v3(pos_x_1, pos_y_2), cc.v3(pos_x_2, pos_y_2), cc.v3(pos_x_3, pos_y_2),
        cc.v3(pos_x_2, pos_y_3),
    ],
    [8]: [
        cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1),
        cc.v3(pos_x_1, pos_y_2), cc.v3(pos_x_2, pos_y_2), cc.v3(pos_x_3, pos_y_2),
        cc.v3(pos_x_1 / 2, pos_y_3), cc.v3(pos_x_3 / 2, pos_y_3),
    ],
    [9]: [
        cc.v3(pos_x_1, pos_y_1), cc.v3(pos_x_2, pos_y_1), cc.v3(pos_x_3, pos_y_1),
        cc.v3(pos_x_1, pos_y_2), cc.v3(pos_x_2, pos_y_2), cc.v3(pos_x_3, pos_y_2),
        cc.v3(pos_x_1, pos_y_3), cc.v3(pos_x_2, pos_y_3), cc.v3(pos_x_3, pos_y_3),
    ],
}


@ccclass
export default class DelphiPotCpt extends cc.Component {
    @property(cc.Node)
    amountNode: cc.Node = null;

    @property(cc.Node)
    potNodeItem: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    potList: cc.Node[] = [];

    private _amount = 0;
    set amount(value) {
        this._amount = value;
        if (this.amountNode) {
            this.amountNode.active = value > 0;
            this.amountNode.getComponentInChildren(cc.Label).string = ___("POT: {1}", Global.FormatNumToComma(value));
        }
    }
    get amount() {
        return this._amount;
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

    get animWorldPos() {
        let posConf = POT_POS_CONFIG[this.potList.length];
        if (!posConf) posConf = POT_POS_CONFIG[1];
        return this.amountNode.convertToWorldSpaceAR(posConf[posConf.length - 1]);
    }

    protected onLoad(): void {
        this.potNodeItem.active = false;
    }
    // 更新所有奖池
    updatePotView(pots, animTime = 0) {
        // 刷新对应的位置
        let posConf = POT_POS_CONFIG[pots.length];
        this.closePot();
        // 更新节点
        for (let i = 0; i < pots.length; i++) {
            let data = pots[i];
            let potNode = this.contentNode.children[i];
            if (!potNode) {
                potNode = cc.instantiate(this.potNodeItem);
                this.contentNode.addChild(potNode);
            }
            cc.find("value", potNode).getComponent(cc.Label).string = Global.FormatNumToComma(data.coin);
            this.potList.push(potNode);
            potNode.active = true;
            if (animTime <= 0) {
                potNode.position = posConf[i];
            } else {
                potNode.stopAllActions();
                potNode.position = posConf[i];
                potNode.scale = 0.1;
                cc.tween(potNode).to(0.05, { scale: 0.7 }).to(0.1, { scale: 0.8 }, { easing: "sineOut" }).start();
            }
        }
    }
    // 收取筹码
    betOver(pots, callback?) {
        let seatCpts: DelphiSeatCpt[] = [];
        for (const seatCpt of facade.getCpts(DelphiSeatCpt)) {
            if (seatCpt.betNode.active) {
                seatCpts.push(seatCpt);
            }
        }
        if (seatCpts.length > 0) {
            for (let i = 0; i < seatCpts.length; i++) {
                const betNode = seatCpts[i].betNode;
                betNode.stopAllActions();
                let endPos = betNode.parent.convertToNodeSpaceAR(this.animWorldPos);
                cc.tween(betNode).to(0.3, { position: endPos }, { easing: "sineOut" }).call(() => {
                    seatCpts[i].setBetChips(0);
                    this.updatePotView(pots, 0.15);
                    if (i >= seatCpts.length - 1) {
                        if (callback) callback();
                    }
                }).start();
            }
        } else {
            this.updatePotView(pots, 0);
        }
    }

    // 结算分筹码
    potChips2Seat(config, toWorldPos, callback) {
        let count = 0;
        if (config.length > 1) {
            // 多人分一个奖池,需要创建假的奖池
            for (const data of config) {
                let potItemNode = this.potList[data.potId];
                // 判断是否有余额
                if (data.remaining > 0) {
                    cc.find("value", potItemNode).getComponent(cc.Label).string = Global.FormatNumToComma(data.remaining);
                } else {
                    potItemNode.active = false;
                }
                // 执行动画
                let tempPotItemNode = cc.instantiate(potItemNode);
                tempPotItemNode.parent = potItemNode.parent;
                tempPotItemNode.active = true;
                cc.find("value", tempPotItemNode).getComponent(cc.Label).string = Global.FormatNumToComma(data.coin);
                cc.tween(tempPotItemNode)
                    .to(0.3, { position: tempPotItemNode.parent.convertToNodeSpaceAR(toWorldPos) }, { easing: 'sineOut' })
                    .call(() => {
                        tempPotItemNode.destroy();
                        if (++count >= config.length) {
                            callback && callback();
                        }
                    }).start();
            }
        } else {
            // 一个人拿完奖池
            for (const data of config) {
                let potItemNode = this.potList[data.potId];
                cc.tween(potItemNode)
                    .to(0.3, { position: potItemNode.parent.convertToNodeSpaceAR(toWorldPos) }, { easing: 'sineOut' })
                    .call(() => {
                        potItemNode.active = false;
                        if (++count >= config.length) {
                            callback && callback();
                        }
                    }).start();
            }
        }


    }

    closePot() {
        for (const _node of this.contentNode.children) {
            _node.active = false;
        }
        this.potList = [];
    }
}
