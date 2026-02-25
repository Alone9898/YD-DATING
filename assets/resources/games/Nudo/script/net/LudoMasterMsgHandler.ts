import { PBMsgHandler } from "../../../PokerBase/scripts/net/PBMsgHandler";
import LudoMasterGameData = require("../LudoMasterGameData");
import LudoMasterLogic = require("../LudoMasterLogic");

export default class LudoMasterMsgHandler extends PBMsgHandler {
    dm: LudoMasterGameData;
    gameCtrl: LudoMasterLogic;

    bindHandler() {
        super.bindHandler();
        this.registerHandler(this.dm.msgCmd.GAME_START, this.GAME_START.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.BROADCAST_PLAY_DICE, this.PLAY_DICE.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.BROADCAST_MOVE_DICE, this.MOVE_DICE.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.GAME_OVER, this.GAME_OVER.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.PLAYER_OVER_RESET_DICE, this.PLAYER_OVER_RESET_DICE.bind(this), 0);
        
        this.registerNoCacheHandler(this.dm.msgCmd.send_change, this.recSendChange.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.rec_change, this.recChange.bind(this));
    }
    GAME_START(msg: any) {
        if (msg.code == 200) {
            cc.vv.EventManager.emit("PB_GAME_START");

            this.pauseCmd();
            this.gameCtrl.GAME_START(msg)
        }
    }
    PLAY_DICE(msg: any) {
        if (msg.code == 200) {
            this.pauseCmd();
            this.gameCtrl.PLAY_DICE(msg)
        }
    }
    MOVE_DICE(msg: any) {
        if (msg.code == 200 && !msg.spcode) {
            this.pauseCmd();
            this.gameCtrl.MOVE_DICE(msg)
        }
    }
    GAME_OVER(msg: any) {
        if (msg.code == 200) {

            cc.vv.EventManager.emit("PB_GAME_SETTLEMENT");
            this.pauseCmd();
            this.gameCtrl.GAME_OVER(msg)
        }
    }

    PLAYER_OVER_RESET_DICE(msg: any) {
        if (msg.code == 200 && !msg.spcode) {
            this.pauseCmd();
            this.gameCtrl.PLAYER_OVER_RESET_DICE(msg)
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