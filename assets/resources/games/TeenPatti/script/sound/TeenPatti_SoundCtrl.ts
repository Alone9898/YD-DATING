import {PBSoundCtrl} from "../../../PokerBase/scripts/sound/PBSoundCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeenPattiSoundCtrl extends PBSoundCtrl {
    /**
     * @override
     */
    get soundPath() {
        return "games/TeenPatti/";
    }

    // 倒计时音效
    get countDownEff(){
        return "countdown"
    }

    /**
     * 播放背景音
     */
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
