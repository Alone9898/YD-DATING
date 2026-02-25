// import { facade } from "../PBLogic";

import { getCmpLevelNeedExp, getLevelNeedExp, getLevelProgress, getLevelRemainingExp, totalExp2Level } from "../../../../../BalootClient/game_common/LevelCfg";
import { PBGameData } from "../PBGameData";

const { ccclass, property } = cc._decorator;

@ccclass
export class PBSettlementInfoChange extends cc.Component {
    @property(cc.Node)
    rp: cc.Node = null;
    @property(cc.Node)
    exp: cc.Node = null;
    @property(cc.Node)
    league: cc.Node = null;

    @property(cc.SpriteFrame)
    icon_rp: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    icon_exp: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    icon_league: cc.SpriteFrame = null;

    @property(cc.Node)
    end_Rp: cc.Node = null;
    @property(cc.Node)
    end_Exp: cc.Node = null;
    @property(cc.Node)
    end_League: cc.Node = null;

    playRpChange(rp: number, delayTime: number, callback: Function = null) {
        this.rp.active = true;
        let spine = cc.find("spine", this.rp).getComponent(sp.Skeleton);
        spine.node.active = false;

        let addNum = cc.find("add_num", this.rp);
        addNum.getComponent(cc.Label).string = "RP+" + Global.formatNumber(rp, { threshold: 10000 });
        addNum.scale = 0;

        cc.tween(this.rp)
            .delay(delayTime)
            .call(() => {
                spine.node.active = true;
                spine.setAnimation(0, "animation", false);
                spine.addAnimation(0, "animation3", true);
            })
            .delay(0.3)
            .call(() => {
                cc.tween(addNum)
                    .to(0.3, { scale: 1 }, { easing: "backOut" })
                    .start();
            })
            .delay(2.5 - delayTime - 0.3)
            .call(() => {
                spine.setAnimation(0, "animation2", false);
                cc.tween(addNum)
                    .to(0.3, { scale: 0 }, { easing: "backIn" })
                    .start();
            })
            .delay(0.1)
            .call(() => {
                let startPos = this.rp.convertToWorldSpaceAR(cc.v2(0, 0));
                let endPos = this.end_Rp.convertToWorldSpaceAR(cc.v2(0, 0));
                Global.FlyAnimToPos(startPos, endPos, {
                    spriteFrame: this.icon_rp,
                    scale: 1,
                    count: 15,
                    boom: true,
                    rangeX: 50,
                    rangeY: 50,
                    endScale: 0.8,
                    onEnd: () => {
                        this.rp.active = false;
                        if (callback) {
                            callback();
                        }
                    }
                });
            })
            .start();
    }

    playExpChange(exp: number, delayTime: number, midcallback: Function, callback: Function) {
        let pbGameData = this.getDm<PBGameData>();
        if (!pbGameData) return;
        if (!pbGameData.playersDm) return;
        if (!pbGameData.playersDm.selfInfo) return;
        let selfInfo = pbGameData.playersDm.selfInfo;

        this.exp.active = true;

        let spine = cc.find("spine", this.exp).getComponent(sp.Skeleton);
        spine.node.active = false;

        let addNum = cc.find("add_num", this.exp);
        addNum.getComponent(cc.Label).string = "EXP+" + Global.formatNumber(exp, { threshold: 10000 });
        addNum.scale = 0;

        cc.tween(this.exp)
            .delay(delayTime)
            .call(() => {
                spine.node.active = true;
                spine.setAnimation(0, "animation", false);
                spine.addAnimation(0, "animation3", true);
            })
            .delay(0.3)
            .call(() => {
                cc.tween(addNum)
                    .to(0.3, { scale: 1 }, { easing: "backOut" })
                    .start();
            })
            .delay(2.5 - delayTime - 0.3)
            .call(() => {
                if (midcallback) {
                    midcallback();
                }
                spine.setAnimation(0, "animation2", false);
                cc.tween(addNum)
                    .to(0.3, { scale: 0 }, { easing: "backOut" })
                    .start();
            })
            .delay(0.1)
            .call(() => {
                let startPos = this.exp.convertToWorldSpaceAR(cc.v2(0, 0));
                let endPos = this.end_Exp.convertToWorldSpaceAR(cc.v2(0, 0));
                Global.FlyAnimToPos(startPos, endPos, {
                    spriteFrame: this.icon_exp,
                    scale: 0.8,
                    count: 15,
                    boom: true,
                    rangeX: 50,
                    rangeY: 50,
                    endScale: 0.8,

                    onEnd: () => {
                        this.exp.active = false;
                        if (callback) {
                            callback();
                        }
                    }
                });
            })
            .start();
    }

    playLeagueChange(league: number, delayTime: number) {
        let pbGameData = this.getDm<PBGameData>();
        if (!pbGameData) return;
        if (!pbGameData.playersDm) return;
        if (!pbGameData.playersDm.selfInfo) return;
        let selfInfo = pbGameData.playersDm.selfInfo;

        this.league.active = true;

        let spine = cc.find("spine", this.league).getComponent(sp.Skeleton);
        spine.node.active = false;



        let addNum = cc.find("add_num", this.league);
        addNum.getComponent(cc.Label).string = "EXP+" + Global.formatNumber(league, { threshold: 10000 });
        addNum.scale = 0;

        cc.tween(this.league)
            .delay(delayTime)
            .call(() => {
                spine.node.active = true;
                // 设置皮肤
                let rankData = cc.vv.UserConfig.getRank(cc.vv.UserManager.leagueexp);
                if (rankData) {
                    spine.setSkin("league_" + rankData.stage);
                }
                spine.setAnimation(0, "animation", false);
                spine.addAnimation(0, "animation3", true);
            })
            .delay(0.3)
            .call(() => {
                cc.tween(addNum)
                    .to(0.3, { scale: 1 }, { easing: "backOut" })
                    .start();
            })
            .delay(2.5 - delayTime - 0.3)
            .call(() => {
                spine.setAnimation(0, "animation2", false);
                cc.tween(addNum)
                    .to(0.3, { scale: 0 }, { easing: "backOut" })
                    .start();
            })
            .delay(0.1)
            .call(() => {
                let startPos = this.league.convertToWorldSpaceAR(cc.v2(0, 0));
                let endPos = this.end_League.convertToWorldSpaceAR(cc.v2(0, 0));
                Global.FlyAnimToPos(startPos, endPos, {
                    spriteFrame: this.icon_league,
                    scale: 0.8,
                    count: 15,
                    boom: true,
                    rangeX: 50,
                    rangeY: 50,
                    endScale: 0.8,
                    onEnd: () => {
                        this.league.active = false;
                    }

                });
            })
            .start();
    }

    getDm<T>(): T {
        return facade.dm as T;
    }

    clear() {
        this.exp.stopAllActions();
        this.rp.stopAllActions();
        this.league.stopAllActions();
        this.exp.active = false;
        this.rp.active = false;
        this.league.active = false;
    }
}

