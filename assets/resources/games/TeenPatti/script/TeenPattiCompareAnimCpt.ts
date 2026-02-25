import PokerCpt from "../../../../_FWExpand/Ecs/components/PokerCpt";
import PokerLayoutCpt from "../../../../_FWExpand/Ecs/components/PokerLayoutCpt";
import PokerSystem from "../../../../_FWExpand/Ecs/systems/PokerSystem";
import TeenPattiCardTypeCpt from "./TeenPattiCardTypeCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeenPattiCompareAnimCpt extends cc.Component {

    @property(sp.Skeleton)
    skeCpt: sp.Skeleton = null;

    @property(sp.Skeleton)
    winlostSke1: sp.Skeleton = null;
    @property(sp.Skeleton)
    winlostSke2: sp.Skeleton = null;

    @property(cc.Node)
    headCpt1: cc.Node = null;
    @property(cc.Node)
    headCpt2: cc.Node = null;

    @property(cc.Label)
    nameLabel1: cc.Label = null;
    @property(cc.Label)
    nameLabel2: cc.Label = null;

    @property(PokerLayoutCpt)
    pokerLayout1: PokerLayoutCpt = null;
    @property(PokerLayoutCpt)
    pokerLayout2: PokerLayoutCpt = null;

    @property(TeenPattiCardTypeCpt)
    cardType1: TeenPattiCardTypeCpt = null;
    @property(TeenPattiCardTypeCpt)
    cardType2: TeenPattiCardTypeCpt = null;

    onLoad() {
        this.winlostSke1.setCompleteListener((tck) => {
            if (tck.animation) {
                this.winlostSke1.node.active = false;
            }
        })
        this.winlostSke2.setCompleteListener((tck) => {
            if (tck.animation) {
                this.winlostSke2.node.active = false;
            }
        })
        this.skeCpt.setCompleteListener((tck) => {
            if (tck.animation && tck.animation.name == "animation2") {
                this.close();
            }
        })
    }

    run(info1, info2, winUid) {
        // let pokerSystem = cc.find("Canvas").getComponent(PokerSystem);
        facade.soundMgr.playEffect("pk");

        this.node.stopAllActions();
        this.node.active = true;
        this.skeCpt.setAnimation(0, "animation1", false);

        this.winlostSke1.node.active = false;
        this.winlostSke2.node.active = false;

        this.scheduleOnce(() => {
            this.headCpt1.active = true;
            this.headCpt2.active = true;
            this.nameLabel1.node.active = true;
            this.nameLabel2.node.active = true;
            this.headCpt1.getComponent("HeadCmp").setHead(info1.userinfo.uid, info1.userinfo.uinfo.icon);
            this.headCpt1.getComponent("HeadCmp").setAvatarFrame(info1.userinfo.avatarFrame);
            this.headCpt2.getComponent("HeadCmp").setHead(info2.userinfo.uid, info2.userinfo.uinfo.icon);
            this.headCpt2.getComponent("HeadCmp").setAvatarFrame(info2.userinfo.avatarFrame);
            this.nameLabel1.string = info1.userinfo.uinfo.uname;
            this.nameLabel2.string = info2.userinfo.uinfo.uname;
            // 刷新牌
            facade.pokerSystem.forceUpdateLayout(this.pokerLayout1, info1.cards, this.pokerLayout1.node);
            facade.pokerSystem.updateLayout(this.pokerLayout1);
            facade.pokerSystem.forceUpdateLayout(this.pokerLayout2, info2.cards, this.pokerLayout1.node);
            facade.pokerSystem.updateLayout(this.pokerLayout2);
        }, 0.3);

        this.scheduleOnce(() => {
            // 有牌值就开牌
            if (info1.cards[0] > 0) {
                this.openCards(this.pokerLayout1, this.cardType1, info1);
            }
            if (info2.cards[0] > 0) {
                this.openCards(this.pokerLayout2, this.cardType2, info2);
            }
            // 输赢取动画
            this.winlostSke1.node.active = true;
            this.winlostSke2.node.active = true;
            if (winUid == info1.userinfo.uid) {
                this.winlostSke1.setAnimation(0, "animation2", false);
                this.winlostSke2.setAnimation(0, "animation1", false);
                if (info1.userinfo.uid == cc.vv.UserManager.uid) {
                    facade.soundMgr.playEffect("pkWin");
                }
            } else {
                this.winlostSke1.setAnimation(0, "animation1", false);
                this.winlostSke2.setAnimation(0, "animation2", false);
                if (info2.userinfo.uid == cc.vv.UserManager.uid) {
                    facade.soundMgr.playEffect("pkFail");
                }
            }
        }, 0.5);

        this.scheduleOnce(() => {
            this.headCpt1.active = false;
            this.headCpt2.active = false;
            this.nameLabel1.node.active = false;
            this.nameLabel2.node.active = false;
            // 开牌
            facade.pokerSystem.destroyPoker(this.pokerLayout1);
            facade.pokerSystem.destroyPoker(this.pokerLayout2);
            this.cardType1.close();
            this.cardType2.close();
            this.skeCpt.setAnimation(0, "animation2", false);
        }, 3);

        this.scheduleOnce(() => {
            this.close();
        }, 3.2);

    }

    close() {
        this.node.stopAllActions();
        this.node.active = false;
    }

    // 进行开牌
    openCards(layout: PokerLayoutCpt, cardTypeCpt: TeenPattiCardTypeCpt, data) {
        // 开牌
        for (const pokerCpt of layout.pokerList) {
            if (!pokerCpt.isFront) {
                pokerCpt.flip = true;
            }
        }
        if (layout.pokerList[0] && layout.pokerList[0].uint > 0) {
            // 显示牌型
            cardTypeCpt.setCardType(data.cardType);
        } else {
            cardTypeCpt.close();
        }
    }

}
