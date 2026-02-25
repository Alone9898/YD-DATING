import { SubGameClickSoundName, SubGameClickSoundType } from "./SubGameClickSoundCmp";

const { ccclass, property } = cc._decorator;

/**
 * 背景控制
 */
@ccclass
export class PBSoundCtrl extends cc.Component {

    protected onLoad(): void {
        Global.registerEvent("SubgameClickSoundEvt", (msg: any) => {
            if (msg && msg.detail) {
                let soundInfo = msg.detail as { soundType: SubGameClickSoundType, soundName: SubGameClickSoundName };
                if (soundInfo) {
                    let soundName = "";
                    switch (soundInfo.soundName) {
                        case SubGameClickSoundName.CLICK:
                            soundName = "btn_click";
                            break;
                    }
                    if (soundName) {
                        if (soundInfo.soundType == SubGameClickSoundType.COMMON) {
                            this.playBaseEffect(soundName);
                        } else {
                            this.playEffect(soundName);
                        }
                    }
                }
            }
        }, this)
    }

    get basePath() {
        return "games/PokerBase/";
    }

    get soundPath() {
        return "games/PokerBase/";
    }

    // 倒计时音效
    get countDownEff() {
        return ""
    }

    getGenderStr(gender: number) {
        if (gender == 1) {
            return "male";
        } else {
            return "female";
        }
    }

    playEffect(audioName: string, loop = false) {
        if (cc.vv.LoginData) {
            let audiourl = `https://inter.sekiengame.com/fb/cardsgame/audio/${cc.vv.LoginData.gameid}/${audioName}.mp3`;
            cc.loader.load({ url: audiourl }, (err, audioClip) => {
                if (!err) {
                    cc.vv.AudioManager.playAudioClip(audioClip, false);
                } else {
                    cc.log(err)
                }
            })
            return;
        }
        return cc.vv.AudioManager.playEff(this.soundPath, audioName, true, loop, null, 0, null);
    }

    /**
     * 播放音效
     * @param audioName
     */
    playBaseEffect(audioName: string, loop = false) {
        if (cc.vv.LoginData) {
            let audiourl = `https://inter.sekiengame.com/fb/cardsgame/audio/${audioName}.mp3`;
            cc.loader.load({ url: audiourl }, (err, audioClip) => {
                if (!err) {
                    cc.vv.AudioManager.playAudioClip(audioClip, false);
                } else {
                    cc.log(err)
                }
            })
            return;
        }
        return cc.vv.AudioManager.playEff(this.basePath, audioName, true, loop, null, 0, null);
    }

    /**
     * 停止音效
     * @param audioName
     */
    stopEffectByName(audioName) {
        cc.vv.AudioManager.stopEffectByName(audioName);
    }

    /**
     * 区分性别播放音效
     */
    playEffectByGender(gender: number, name: string) {
        // name = this.getGenderStr(gender) + "_" + name;
        // this.playEffect(name);
    }

    /**
     * 播放背景音
     */
    playBgm(audioName: string = "bgm", loop = true) {
        if (cc.vv.LoginData) {
            let audiourl = `https://inter.sekiengame.com/fb/cardsgame/audio/${audioName}.mp3`;
            cc.loader.load({ url: audiourl }, (err, audioClip) => {
                if (!err) {
                    cc.vv.AudioManager.playBGMClip(audioClip, true, null, null);
                } else {
                    cc.log(err)
                }
            })
            return;
        }
        if (audioName) {
            cc.vv.AudioManager.playBgm(this.basePath, audioName, true, 0, null, loop);
        }
    }

    /**
     * 停止背景音
     */
    stopBgm() {
        cc.vv.AudioManager.stopBgm();
    }
}