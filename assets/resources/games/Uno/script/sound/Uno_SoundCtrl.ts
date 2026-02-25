import { PBSoundCtrl } from "../../../PokerBase/scripts/sound/PBSoundCtrl";

const { ccclass, property } = cc._decorator;

/**
 * 背景控制
 */
@ccclass
export class UnoSoundCtrl extends PBSoundCtrl {

    /**
     * @override
     */
    get soundPath() {
        return "games/Uno/";
    }
}