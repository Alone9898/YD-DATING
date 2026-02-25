import { getCmpLevelNeedExp, getLevelNeedExp, getLevelProgress, getLevelRemainingExp, totalExp2Level } from "../../../../../BalootClient/game_common/LevelCfg";
import { PBEvent } from "../PBEvent";
import { PBGameData } from "../PBGameData";

const { ccclass, property } = cc._decorator;

/**
 * 倒计时组件
 */
@ccclass
export class PBSelfExpChange extends cc.Component {
    @property(cc.Label)
    labelLevel:cc.Label = null;
    @property(cc.ProgressBar)
    progressBar:cc.ProgressBar = null;
    @property(cc.Label)
    progressLabel:cc.Label = null;
    @property(cc.Label)
    label_exp_add:cc.Label = null;

    onLoad() {
        this.node.active = false;
    }

    hide() {
        if(!this.node.active) {
            return;
        }
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(0.2, {opacity:0})
            .call(()=>{
                this.node.active = false;
            })
            .start();
    }

    /**
     * 添加经验
     */
    async show(addExp:number, hideDelayTime = 2) {
        this.unscheduleAllCallbacks();
        let pbGameData = this.getDm<PBGameData>();
        if (!pbGameData) return;
        if (!pbGameData.playersDm) return;
        if (!pbGameData.playersDm.selfInfo) return;
        let selfInfo = pbGameData.playersDm.selfInfo;
        
        this.node.active = true;
        this.node.opacity = 0xff;

        // 显示等级
        let currExp = selfInfo.currExp
        let currLevel = totalExp2Level(currExp);
        this.labelLevel.string = `Lv.${currLevel}`;
        this.progressBar.progress = getLevelProgress(currExp);
        let needExp = getCmpLevelNeedExp(currLevel);
        let remainingExp = getLevelRemainingExp(currExp);
        if (remainingExp + addExp >= needExp) { // 升级
            // 完成当前等级经验
            this.progressLabel.string = `${needExp}/${needExp}`;
            await new Promise(res => {
                cc.tween(this.progressBar)
                    .to(0.5, { progress: 1 })
                    .call(() => {
                        res(true);
                    })
                    .delay(0.1)
                    .start();
            })
            // 显示下一等级经验
            this.labelLevel.string = `Lv.${currLevel + 1}`;
            let nextLevelneedExp = getLevelNeedExp(currLevel + 1);
            let cmpNextLevelNeedExp = getCmpLevelNeedExp(currLevel + 1);
            let extraExp = currExp + addExp - nextLevelneedExp;
            needExp = cmpNextLevelNeedExp;
            this.progressLabel.string = `${extraExp}/${needExp}`;
            this.progressBar.progress = 0;
            cc.tween(this.progressBar)
                .to(0.5, { progress: extraExp/needExp })
                .start();
        } else { // 没升级显示等级的逻辑
            this.progressLabel.string = `${remainingExp + addExp}/${needExp}`;
            cc.tween(this.progressBar)
                .to(0.5, { progress: (remainingExp + addExp) / needExp })
                .start();
        }
        this.label_exp_add.string = `+${addExp}`;
        selfInfo.currExp = currExp + addExp;
        selfInfo.currLevel = totalExp2Level(selfInfo.currExp);
        
        Global.dispatchEvent(PBEvent.USER_EXP_CHANGE);

        this.scheduleOnce(()=>{
            this.hide();
        }, hideDelayTime);
    }

    getDm<T>(): T {
        return facade.dm as T;
    }
}