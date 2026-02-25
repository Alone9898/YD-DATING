import { PBMsgHandlerEx } from "../../PokerBase/scripts/net/PBMsgHandlerEx";

/**
 * delphi msghandler
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class DelphiMsgHandler extends PBMsgHandlerEx {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    // // LIFE-CYCLE CALLBACKS:

    // // onLoad () {}

    // start () {

    // }

    /**
    * 有玩家进入房间
    * overwrite 不需要暂停
    */
     playerEnterRoom(dic: any) {
        // this.pauseCmd();
        this.gameCtrl.otherPlayerEnter(dic);
    }

    // update (dt) {}
}
