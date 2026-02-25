import { PBMsgWriter } from "../../../PokerBase/scripts/net/PBMsgWriter";

export default class DominoMsgWriter extends PBMsgWriter {
    /**
     * 
     * @param cardId 
     * @param append 1接头 2接尾
     */
    sendDiscard(cardId: number, append: number) {
        facade.dm.tableStatus.canOutCard = false;
        cc.log(">sendDiscard", cardId);
        let req = {
            c: facade.dm.msgCmd.SEND_DISCARD_CARD,
            cardid: cardId,
            append: append
        };
        this.sendData(req);
    }
}