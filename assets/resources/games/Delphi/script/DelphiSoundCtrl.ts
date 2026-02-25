import { PBSoundCtrl } from "../../PokerBase/scripts/sound/PBSoundCtrl";

const { ccclass, property } = cc._decorator;

/**
 * 背景控制
 */
@ccclass
export class DelphiSoundCtrl extends PBSoundCtrl {
    /**
     * @override
     */
    get soundPath() {
        return "games/Delphi/";
    }

    // 倒计时音效
    get countDownEff() {
        return "LastPokerHeart"
    }

    playBgm(audioName: string = "bgm", loop = true) {
        // if (cc.vv.LoginData) {
        //     let audiourl = `https://inter.sekiengame.com/fb/cardsgame/audio/${audioName}.mp3`;
        //     cc.loader.load({ url: audiourl }, (err, audioClip) => {
        //         if (!err) {
        //             cc.vv.AudioManager.playBGMClip(audioClip, true, null, null);
        //         } else {
        //             cc.log(err)
        //         }
        //     })
        //     return;
        // }
        if (audioName) {
            cc.vv.AudioManager.playBgm(this.soundPath, audioName, true, /*0, null, loop*/);
        }
    }

}