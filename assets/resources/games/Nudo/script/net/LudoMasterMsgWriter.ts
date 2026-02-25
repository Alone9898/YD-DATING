import { PBMsgWriter } from "../../../PokerBase/scripts/net/PBMsgWriter";
import LudoMasterLogic from "../LudoMasterLogic";

export default class LudoMasterMsgWriter extends PBMsgWriter {


    // 请求摇骰子
    sendDice(uid: number) {
        this.sendData({
            c: facade.dm.msgCmd.PLAY_DICE,
            uid: uid,
        });
    }

    // c:26902,
    // uid:100100,
    // chessid:1, --棋子id:1-4
    // step:1: ,--走的步数1-6
    // 移动骰子
    sendMoveDice(uid: number, chessid: number, step: number) {
        this.sendData({
            c: facade.dm.msgCmd.MOVE_DICE,
            uid: uid,
            chessid: chessid,
            step: step,
        });
    }



}
