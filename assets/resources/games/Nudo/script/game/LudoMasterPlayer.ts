import showDice from "./showDice";
import { PBPlayer } from "../../../PokerBase/scripts/player/PBPlayer";
import { LudoMasterPlayerInfoVO, LudoMasterPBUserInfoCmp } from "./LudoMasterPlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LudoMasterPlayer extends PBPlayer {
    playerInfoVo: LudoMasterPlayerInfoVO;
    diceList: cc.Node = null;
    dice: cc.Node = null;
    btn_dice: cc.Button = null;
    ani_dice: cc.Node = null;

    six_dice_effect: sp.Skeleton = null;

    arrow: cc.Node = null;

    //dice
    diceChild: cc.Node[] = [];
    diceListArr: number[] = [];

    isReq = false;

    onLoad() {
        super.onLoad();
        // 骰子动画
        this.ani_dice = cc.find('dice/spine', this.node)
        // 按钮
        this.btn_dice = cc.find('dice', this.node).getComponent(cc.Button)
        this.btn_dice.interactable = true;
        // 结果
        this.dice = cc.find('dice/dice', this.node)
        // 骰子列表
        this.diceList = cc.find('dictList', this.node)

        this.six_dice_effect = cc.find("dice/six", this.node).getComponent(sp.Skeleton);
        this.six_dice_effect.node.active = false;

        this.arrow = cc.find("arrow", this.node);

        for (let i = 0; i < this.diceList.children.length; i++) {
            this.diceChild.push(this.diceList.children[i])
            this.diceList.children[i].active = false
        }
        this.btn_dice.node.on('click', this.onClickDice, this);
        this.setDiceBtn(false);
    }

    onClickDice() {
        if (this.playerInfoVo.uid != cc.vv.UserManager.uid) return;
        if (this.isReq) return;
        this.isReq = true;
        facade.dm.msgWriter.sendDice(this.playerInfoVo.uid);
    }

    async playBidBubble(aniName: string) {
        if (!this.bidBubbleSpine || !aniName) {
            return;
        }
        let spineAniName = `eff_${aniName}_`;
        this.bidBubbleSpine.node.active = true;
        if (this.uiIndex == 2 || this.uiIndex == 3) {
            spineAniName += "y";
            this.bidBubbleSpine.setAnimation(0, spineAniName, false);
        } else {
            spineAniName += "z";
            this.bidBubbleSpine.setAnimation(0, spineAniName, false);
        }
        this.bidBubbleSpine.setCompleteListener(() => {
            this.bidBubbleSpine.setCompleteListener(null);
            this.bidBubbleSpine.node.active = false;
        });
    }

    getNeedChangeChatBubbleUIIndex() {
        return [1, 2];
    }

    // 骰子按钮的 显示控制
    setDiceBtn(bEnable: boolean) {
        // if (this.playerInfoVo && facade.dm.playersDm.isSelf(this.playerInfoVo.uid)) {
        //     cc.log("1111111111111111111111111111111", bEnable);
        // }
        this.isReq = false;
        this.btn_dice.node.active = bEnable;
        this.setArrowVisible(bEnable);
    }
    // 设置骰子结果
    setDiceList(dices: number[] = []) {
        this.diceListArr = dices;
        for (let i = 0; i < this.diceChild.length; i++) {
            this.diceChild[i].active = i < dices.length
            dices[i] && this.diceChild[i].getComponent(showDice).setDiceNum(dices[i])
        }
    }

    showDice(dot) {
        this.ani_dice.active = false;
        this.dice.getComponent(showDice).setDiceNum(dot);
        this.dice.active = true;
    }

    showAni() {
        this.ani_dice.active = true;
        this.ani_dice.getComponent(sp.Skeleton).setAnimation(0, "Z1", true)
        this.dice.active = false
    }

    showAniRs() {
        this.ani_dice.active = true;
        this.ani_dice.getComponent(sp.Skeleton).setAnimation(0, "A1", true)
        this.dice.active = false
    }


    playSixEffect() {
        this.six_dice_effect.node.active = true;
        this.six_dice_effect.setAnimation(0, "animation", false);
        this.six_dice_effect.setCompleteListener(() => {
            this.six_dice_effect.setCompleteListener(null);
            this.six_dice_effect.node.active = false;
        })
    }

    setArrowVisible(isVisible: boolean) {
        if (this.arrow) {
            this.arrow.active = isVisible;
        }
    }
}
