import { PBSoundCtrl } from "../../../PokerBase/scripts/sound/PBSoundCtrl";

const { ccclass, property } = cc._decorator;

/**
 * 背景控制
 */
@ccclass
export class LudoMasterSoundCtrl extends PBSoundCtrl {
    /**
     * @override
     */
    get soundPath() {
        return "games/Nudo/";
    }
}