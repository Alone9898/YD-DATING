import { getCmpLevelNeedExp, getLevelNeedExp, getLevelProgress, getLevelRemainingExp, totalExp2Level } from "../../../../../BalootClient/game_common/LevelCfg";
import { PBEvent } from "../PBEvent";
import { PBGameData } from "../PBGameData";

const { ccclass, property } = cc._decorator;

@ccclass
export class PBSettlementInfoChangeInPlayer extends cc.Component {
    @property(cc.Node)
    rp: cc.Node = null;
    @property(cc.Node)
    exp: cc.Node = null;
    @property(cc.Node)
    league: cc.Node = null;

    @property(cc.Label)
    level: cc.Label = null;

    @property(cc.ProgressBar)
    expProgressbar: cc.ProgressBar = null;
    @property(cc.Label)
    expLabel: cc.Label = null;

    @property(cc.ProgressBar)
    leagueProgressbar: cc.ProgressBar = null;

    @property(cc.Label)
    addRp: cc.Label = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(cc.Prefab)
    light_prefab: cc.Prefab = null;

    reward_kind: number = 0;

    showDialogue(num: number) {
        let pbGameData = this.getDm<PBGameData>();
        if (!pbGameData) return;
        if (!pbGameData.playersDm) return;
        if (!pbGameData.playersDm.selfInfo) return;
        let selfInfo = pbGameData.playersDm.selfInfo;

        this.node.active = true;
        this.leagueProgressbar.node.opacity = 0;
        this.addRp.node.scale = 0;

        this.reward_kind = num;
        let rankData = cc.vv.UserConfig.getRank(selfInfo.leaguePoints)

        if (this.spine && cc.isValid(this.spine)) {
            this.spine.setSkin("dw" + rankData.stage);
            this.spine.setAnimation(0, "animation" + (4 - num) + "_1", false);
            this.spine.addAnimation(0, "animation" + (4 - num) + "_2", false);
        }

        let currExp = selfInfo.currExp
        let currLevel = totalExp2Level(currExp);
        this.level.string = currLevel.toString();
        let needExp = getCmpLevelNeedExp(currLevel);
        let exp = getLevelRemainingExp(currExp);
        this.expLabel.string = `${exp}/${needExp}`;

        // cc.log("cur exp = " + currExp + " progress = " + getLevelProgress(currExp));
        this.expProgressbar.progress = getLevelProgress(currExp);
        this.expProgressbar.node.opacity = 0;
        this.expProgressbar.node.stopAllActions();
        cc.tween(this.expProgressbar.node)
            .delay(0.4)
            .to(0.2, { opacity: 255 })
            .start();

        if (num === 3) {
            // 此時才有段位
            let rankData = cc.vv.UserConfig.getRank(selfInfo.leaguePoints)
            this.leagueProgressbar.progress = 0;
            this.leagueProgressbar.node.opacity = 255;
            let endProgress = 0;
            if (rankData.next) {
                let curExp = selfInfo.leaguePoints - rankData.score;
                let maxExp = rankData.next.score - rankData.score;
                endProgress = curExp / maxExp;
            } else {
                endProgress = 1;
            }

            this.leagueProgressbar.progress = endProgress;
            this.leagueProgressbar.node.opacity = 0;
            this.leagueProgressbar.node.stopAllActions();
            cc.tween(this.leagueProgressbar.node)
                .delay(0.4)
                .to(0.2, { opacity: 255 })
                .start();

            this.exp.y = 170;
        } else if (num === 2) {
            this.exp.y = 112;
        } else {
            this.exp.y = 52;
        }
    }

    async addInfo(exp: number, rp: number = 0, league: number = 0) {
        let pbGameData = this.getDm<PBGameData>();
        if (!pbGameData) return;
        if (!pbGameData.playersDm) return;
        if (!pbGameData.playersDm.selfInfo) return;
        let selfInfo = pbGameData.playersDm.selfInfo;
        // exp
        let currExp = selfInfo.currExp
        let currLevel = totalExp2Level(currExp);
        let needExp = getCmpLevelNeedExp(currLevel);


        let hintLevel = 0;
        let hintLeague = 0;

        if (needExp === 0) {
            // max level
            this.expProgressbar.progress = 1;
            this.expLabel.string = "";
        } else {
            let remainingExp = getLevelRemainingExp(currExp);
            let endProgress = 0;
            let targetLevel = totalExp2Level(currExp + exp);
            this.expProgressbar.progress = remainingExp / needExp;
            if (targetLevel > currLevel) {
                // 升级
                for (let i = 0; i < targetLevel - currLevel; i++) {
                    needExp = getCmpLevelNeedExp(currLevel + i);
                    this.expLabel.string = `${needExp}/${needExp}`;
                    await new Promise((success) => {
                        cc.tween(this.expProgressbar)
                            .to(0.5 / (targetLevel - currLevel), { progress: 1 })
                            .call(() => {
                                success(true);
                            })
                            .start();
                        this.addLight(this.expProgressbar.node, remainingExp / needExp, 1, 0.5 / (targetLevel - currLevel));
                    });
                    remainingExp = 0;
                    this.expProgressbar.progress = 0;
                }

                let nextLevelneedExp = getLevelNeedExp(targetLevel);
                let cmpNextLevelNeedExp = getCmpLevelNeedExp(targetLevel);
                let extraExp = currExp + exp - nextLevelneedExp;
                if (extraExp < 0) {
                    extraExp = 0;
                }
                needExp = cmpNextLevelNeedExp;
                endProgress = extraExp / needExp;
                selfInfo.currLevel = targetLevel;
                selfInfo.currExp = currExp + exp;

                this.level.string = targetLevel.toString();
                this.expLabel.string = `${extraExp}/${needExp}`;
                if (endProgress > 0) {
                    cc.tween(this.expProgressbar)
                        .to(0.5, { progress: endProgress })
                        .call(() => {
                            Global.dispatchEvent(PBEvent.USER_EXP_CHANGE);
                        })
                        .start();
                    this.addLight(this.expProgressbar.node, 0, endProgress, 0.5);
                } else {
                    Global.dispatchEvent(PBEvent.USER_EXP_CHANGE);
                }
                // 等级升级提示
                hintLevel = targetLevel;
                //打点
                let eventVal = {
                    "$LevelId": targetLevel,
                    "$RoleName": cc.vv.UserManager.getNickName(),
                    "$LevelBefore": targetLevel - 1,
                    "$IsTopLevel": 0,
                    "$RoleCombat": "0",
                }
                cc.vv.PlatformApiMgr.KoSDKTrackEvent("$UpgradeLevel", JSON.stringify(eventVal))

            } else {
                this.expLabel.string = `${remainingExp + exp}/${needExp}`;
                endProgress = (remainingExp + exp) / needExp;
                this.addLight(this.expProgressbar.node, remainingExp / needExp, endProgress, 1);
                cc.tween(this.expProgressbar)
                    .to(1, { progress: endProgress })
                    .call(() => {
                        selfInfo.currExp = currExp + exp;
                        selfInfo.currLevel = totalExp2Level(selfInfo.currExp);

                        Global.dispatchEvent(PBEvent.USER_EXP_CHANGE);
                    })
                    .start();
            }
        }


        // rp
        if (rp > 0) {

            this.addRp.string = "+" + rp;
            this.addRp.node.scale = 0;
            this.addRp.node.stopAllActions();
            cc.tween(this.addRp.node)
                .to(0.3, { scale: 1 }, { easing: "backOut" })
                .start();
        }

        // league
        if (league > 0) {
            let rankData = cc.vv.UserConfig.getRank(selfInfo.leaguePoints)
            let newRankData = cc.vv.UserConfig.getRank(selfInfo.leaguePoints + league);
            let endProgress = 0;
            let curExp = selfInfo.leaguePoints - rankData.score;

            if (rankData.next) {
                let maxExp = rankData.next.score - rankData.score;
                endProgress = (curExp + league) / maxExp;
                this.addLight(this.leagueProgressbar.node, curExp / maxExp, endProgress, 1);
                cc.tween(this.leagueProgressbar)
                    .to(1, { progress: endProgress })
                    .start();
            } else {
                endProgress = 1;
            }
            selfInfo.leaguePoints += league;
            Global.dispatchEvent(PBEvent.USER_LEAGUE_CHANGE);
            // 提示段位升级
            if (newRankData.stage > rankData.stage) {
                hintLeague = newRankData.stage;
            }
        }
        // 根据计算 进行升级动画
        if (!Global.isSingle()) {
            this.handleUpgradeHint(hintLevel, hintLeague);
        }
        await facade.delayTime(2);

        cc.tween(this.expProgressbar.node)
            .to(0.2, { opacity: 0 })
            .start();
        cc.tween(this.leagueProgressbar.node)
            .to(0.2, { opacity: 0 })
            .start();
        cc.tween(this.addRp.node)
            .to(0.2, { scale: 0 }, { easing: "backIn" })
            .start();
        this.spine.setAnimation(0, "animation" + (4 - this.reward_kind) + "_3", false);
        this.spine.setCompleteListener(() => {
            this.spine.setCompleteListener(null);
            this.node.active = false;
        });
    }

    addLight(progressbar: cc.Node, curProgress: number, endProgress: number, duration: number) {
        if (endProgress >= 1) {
            endProgress = 1;
        }
        let light = cc.instantiate(this.light_prefab);
        light.active = true;
        light.parent = progressbar;
        light.x = -progressbar.width / 2 + curProgress * progressbar.width;
        cc.tween(light)
            .to(duration, { x: -progressbar.width / 2 + endProgress * progressbar.width })
            .removeSelf()
            .start();
    }

    getDm<T>(): T {
        return facade.dm as T;
    }

    handleUpgradeHint(level, league) {
        let levelShowPos = cc.v2(0, 0);
        let leagueShowPos = cc.v2(0, 0);
        if (!!level && !!league) {
            levelShowPos = levelShowPos.add(cc.v2(-170, -300));
            leagueShowPos = leagueShowPos.add(cc.v2(170, -300));
        }
        if (!!level) {
            cc.loader.loadRes("BalootClient/UpgradeHint/LevelUpHint", cc.Prefab, (err, prefab) => {
                if (!!err) return;
                let node = cc.instantiate(prefab);
                node.parent = cc.find("Canvas")
                // node.zIndex = 1000;
                node.position = levelShowPos;
                node.scale = 0.3;
                let levelUpHint = node.getComponent("LevelUpHint");
                levelUpHint.run(level || 1);
            });
        }
        if (!!league) {
            cc.loader.loadRes("BalootClient/UpgradeHint/LeagueUpHint", cc.Prefab, (err, prefab) => {
                if (!!err) return;
                let node = cc.instantiate(prefab);
                node.parent = cc.find("Canvas")
                // node.zIndex = 1000;
                node.position = leagueShowPos;
                node.scale = 0.5;
                node.getComponent("LeagueUpHint").run(league || 1);
            });
        }
    }

    clear() {
        this.expProgressbar.node.stopAllActions();
        this.leagueProgressbar.node.stopAllActions();
        this.addRp.node.stopAllActions();
        this.node.active = false;
    }
}

