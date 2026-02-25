import { PBPlayer } from "../../../../PokerBase/scripts/player/PBPlayer";

export class DominoPlayer extends PBPlayer {
    icon_banker: cc.Node;
    restCntNode: cc.Node;
    restCntLabel: cc.Label;
    // passSpine: sp.Skeleton;
    restCnt: number = 0;

    // coinLable: cc.Label;
    coin: number;
    passNode: cc.Node;

    onLoad() {
        super.onLoad();

        this.icon_banker = cc.find("icon_banker", this.node);
        this.icon_banker.active = false;
        this.restCntNode = cc.find("rest_cnt", this.node);
        if (this.restCntNode) {
            this.restCntNode.active = false;
            this.restCntLabel = cc.find("label", this.restCntNode).getComponent(cc.Label);
        }

        // this.passSpine = cc.find("pass", this.node).getComponent(sp.Skeleton);
        // this.passSpine.node.active = false;

        // this.coinLable = cc.find("coin_node/coin", this.node).getComponent(cc.Label);
        this.passNode = cc.find("pass_node", this.node);
    }

    show() {
        super.show();
        if (this.playerInfoVo) {
            this.updateCoin(this.playerInfoVo.coin);
        }
    }

    // getNeedChangeChatBubbleUIIndex() {
    //     return [3];
    // }

    cleanRound() {
        this.icon_banker.active = false;
        if (this.restCntNode) {
            this.restCntNode.active = false;
        }
        // this.passSpine.node.active = false;
        this.addCoin.active = false;
        this.baodian.node.active = false;
        this.winSpine.node.active = false;
        this.restCnt = 0;
        if (this.passNode) {
            for (let i = 0; i < 7; i++) {
                cc.find("DG_game_icon_ds_" + i, this.passNode).active = false;
            }
        }
    }

    updateCoin(coin: number) {
        this.coin = coin;
        // this.coinLable.string = Global.formatNumShort(coin, 2);
    }

    showBanker(isOrNot: boolean) {
        this.icon_banker.active = isOrNot;
    }

    getRestCntNode() {
        return this.restCntNode;
    }

    setRestCnt(num: number) {
        if (num > 0 && this.restCntNode) {
            this.restCntNode.active = true;
            this.restCntNode.opacity = 255;
        }
        this.restCnt = num;
        this.restCntLabel.string = this.restCnt.toString();
    }

    addACard() {
        if (this.restCnt === 0) {
            this.restCntNode.active = true;
            this.restCntNode.opacity = 0;
            cc.tween(this.restCntNode)
                .to(0.3, { opacity: 255 })
                .start();
        }
        this.restCnt++;
        this.restCntLabel.string = this.restCnt.toString();
    }

    removeACard() {
        this.restCnt--;
        this.restCntLabel.string = this.restCnt.toString();
    }

    async playPass(cards: number[]) {
        this.playBidBubble("pass");
        if (this.passNode) {
            for (let i = 0; i < 7; i++) {
                cc.find("DG_game_icon_ds_" + i, this.passNode).active = cards.includes(i);
            }
        }
    }

    showPass(cards: number[]) {
        if (this.passNode && cards) {
            for (let i = 0; i < 7; i++) {
                cc.find("DG_game_icon_ds_" + i, this.passNode).active = cards.includes(i);
            }
        }
    }

    playKilledAnimation() {
        let node = cc.find("killed", this.node);
        if (node) {
            node.active = true;
            let script = node.getComponent(sp.Skeleton);
            script.setAnimation(0, "animation1", false);
            script.setCompleteListener(() => {
                script.setCompleteListener(null);
                node.active = false;
            });
        }
    }

    playBeKilledAnimation() {
        let node = cc.find("beKilled", this.node);
        if (node) {
            node.active = true;
            let script = node.getComponent(sp.Skeleton);
            script.setAnimation(0, "animation1", false);
            script.setCompleteListener(() => {
                script.setCompleteListener(null);
                node.active = false;
            });
        }
    }
}
