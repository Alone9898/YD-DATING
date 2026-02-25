import { PBMsgWriter } from "../../../PokerBase/scripts/net/PBMsgWriter";

export class UnoMsgWriter extends PBMsgWriter {
    /**
     * 出牌
     */
    sendDiscard(cardVal: number) {
        facade.dm.tableStatus.canOutCard = false;
        cc.log(">sendDiscard", cardVal.toString(16));
        let req = {
            c: facade.dm.msgCmd.send_discard,
            card: cardVal
        };
        this.sendData(req);
    }

    /**
     * 摸牌
     */
    sendDraw() {
        cc.log(">sendDraw");
        let req = {
            c: facade.dm.msgCmd.send_draw
        };
        this.sendData(req);
    }

    /**
     * 不出牌
     */
    sendKeep() {
        cc.log(">sendKeep");
        let req = {
            c: facade.dm.msgCmd.send_pass
        };
        this.sendData(req);
    }

    /**
     * 0x5d 0x5e 提前发送此命令
     * @param card 
     */
    sendPreDiscard(card: number) {
        let req = {
            c: facade.dm.msgCmd.pre_send_discard,
            card: card
        };
        this.sendData(req);
    }

    /**
     * 质疑
     * @param rtype 0不质疑  1质疑
     */
    sendChallenge(rtype: number) {
        cc.log(">sendChallenge");
        let req = {
            c: facade.dm.msgCmd.send_challenge,
            rtype: rtype
        };
        this.sendData(req);
    }

    /**
     * uno
     */
    sendUno() {
        cc.log(">sendUno");
        let req = {
            c: facade.dm.msgCmd.send_uno
        };
        this.sendData(req);
    }

    /**
     * uno challenge
     */
    sendUnoChallenge() {
        cc.log(">sendUnoChallenge");
        let req = {
            c: facade.dm.msgCmd.send_uno_challenge
        };
        this.sendData(req);
    }
}