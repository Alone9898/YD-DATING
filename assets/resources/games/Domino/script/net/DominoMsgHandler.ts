import { PBMsgHandler } from "../../../PokerBase/scripts/net/PBMsgHandler";
import PBLogic, { facade } from "../../../PokerBase/scripts/PBLogic";
import DominoGameData = require("../DominoGameData");
// import { DominoGameData } from "../DominoGameData";
import { DominoLogic } from "../DominoLogic";
import { DominoPlayerInfoVO } from "../game/player/DominoPlayerData";

export default class DominoMsgHandler extends PBMsgHandler {
    dm: DominoGameData;
    gameCtrl: DominoLogic;

    /**
         * overwrite
         */
    bindHandler() {
        super.bindHandler();
        this.registerHandler(this.dm.msgCmd.GAME_START, this.recvStartGame.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.RECV_DISCARD_CARD, this.recvDiscardCard.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.PASS, this.recvPass.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.SETTLEMENT, this.recvSettlement.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.QUIT_HALL, this.recvQuitHall.bind(this), 0);

        this.registerNoCacheHandler(this.dm.msgCmd.send_change, this.recSendChange.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.rec_change, this.recChange.bind(this));

    }

    recvStartGame(msg: any) {
        cc.vv.EventManager.emit("PB_GAME_START");

        this.pauseCmd();
        cc.log("start game", msg);
        this.gameCtrl.cleanRound();
        let tableStateus = this.dm.tableStatus;
        tableStateus.dealerUid = msg.dealerUid;
        if (this.dm.tableInfo.isViewer === 0) {
            this.gameCtrl.viewerList.hide();
            tableStateus.canOutCard = msg.activeUid == this.dm.playersDm.selfInfo.uid;
        } else {
            tableStateus.canOutCard = false;
        }

        this.dm.playersDm.clearSeatedFromViewer();
        let cards = msg.cards.concat();
        this.dm.dealCards(cards);
        this.gameCtrl.dealCards(msg);
    }

    recvDiscardCard(msg: any) {
        this.pauseCmd();
        cc.log("discard card", msg);
        if (msg.code === 200) {
            if (msg.spcode) {
                cc.vv.NetManager.reconnect();
                return;
            }
            if (msg.uid === cc.vv.UserManager.uid) {
                (this.dm.playersDm.selfInfo as DominoPlayerInfoVO).removeCard(msg.card.id);
            }
            this.dm.tableDm.addTableCard(msg.card, msg.append);
            this.gameCtrl.outCard(msg);
        } else {
            cc.log("discard card failed");
        }
    }

    recvPass(msg: any) {
        this.pauseCmd();
        cc.log("pass", msg);
        if (msg.code === 200) {
            this.gameCtrl.pass(msg);
        } else {
            cc.log("pass failed");
        }
    }

    recvSettlement(msg: any) {
        cc.vv.EventManager.emit("PB_GAME_SETTLEMENT");
        this.pauseCmd();
        cc.log("settlement ", msg);
        if (msg.code === 200) {

            this.gameCtrl.gameFinish(msg);
        } else {
            cc.log("settlement failed");
        }
    }

    recvQuitHall(msg: any) {
        cc.log("quit hall ", msg);
        if (msg.code === 200) {
            facade.gotoHall();
        } else {
            cc.log("quit hall failed");
        }
    }

    /**
     * 换桌
     * @param dic
     */
    recSendChange(dic) {
        if (dic.spcode == 1) {
            cc.vv.FloatTip.show("No more tables available now");
        } else if (dic.spcode == 2) {
            cc.vv.FloatTip.show("Only matching rooms can be exchanged");
        } else if (dic.spcode == 3) {
            cc.vv.FloatTip.show("The player is not in the room");
        } else {
            this.gameCtrl.changeTable();
        }
    }

    /**
     * 换桌
     * @param dic
     */
    recChange(dic) {
        if (dic.code == 200 && dic.gameid == this.dm.deskInfo.gameid) {
            facade.dm.init(dic.deskinfo);
        } else {
            facade.gotoHall();
        }
    }
}