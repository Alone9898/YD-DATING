import { BaseHandler } from "../../../../../BalootClient/game_common/net/BaseHandler";
import PBLogic from "../PBLogic";
import { PBGameData } from "../PBGameData";
import { PBChatMsgVo } from "../chat/PBChatData";
import { PBPlayerInfoVo, PBUserInfoVo } from "../player/PBPlayerData";
import { PBMsgHandler } from "./PBMsgHandler";

export class PBMsgHandlerEx extends PBMsgHandler {

    bindHandler() {
        this.bindNoCacheHandler();
        this.registerHandler(this.dm.msgCmd.R_PLAYER_READY, this.playerReady.bind(this), 0);
        // this.registerHandler(this.dm.msgCmd.R_PLAYER_ENTER_ROOM, this.playerEnterRoom.bind(this), 0);
        // this.registerHandler(this.dm.msgCmd.R_PLAYER_EXIT_ROOM, this.playerExit.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.S_APPLY_DISMISS, this.S_APPLY_DISMISS.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_APPLY_DISMISS, this.R_PLAYER_APPLY_DISMISS.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_REPLY_DISMISS, this.R_PLAYER_REPLY_DISMISS.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_COUNTDOWN_START, this.R_COUNTDOWN_START.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_COUNTDOWN_STOP, this.R_COUNTDOWN_STOP.bind(this), 0);
        // this.registerHandler(this.dm.msgCmd.R_PLAYER_EXIT, this.R_PLAYER_EXIT.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_VOICE_CHANGE, this.onVoiceChanged.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_SITDOWN, this.R_PLAYER_SITDOWN.bind(this), 0);
        // this.registerHandler(this.dm.msgCmd.R_ENTER_VIEWER, this.R_ENTER_VIEWER.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.S_SITDOWN, this.S_SITDOWN.bind(this), 0);
    }

    /**
     * 观战玩家进入
     * @param msg 
     */
    R_ENTER_VIEWER(msg: any) {
        console.log("R_ENTER_VIEWER", msg);
        if (msg.code === 200 && !msg.spcode) {
            let pvo = this.dm.parseAPlayer(msg.user);
            this.dm.playersDm.viewerList.push(pvo);
            this.gameCtrl && this.gameCtrl.onEnterViewer(msg);
            if (this.dm.tableInfo.isViewer && this.dm.playersDm.selfAbsInfo.seatId < 1) {
                this.gameCtrl.viewerList && this.gameCtrl.viewerList.updateList(this.dm.playersDm.viewerList);
            }
        }
    }
    /**
     * dic
     */
    onData(pack: any) {
        if (!this._noCacheHandlerMap) return;
        let cmd = pack.c;
        if (this._noCacheHandlerMap.has(cmd)) {
            // cc.log(`#执行无缓冲命令${cmd}`);
            this._noCacheHandlerMap.get(cmd)(pack);
        } else {
            try {
                if (this._canPlayCmd) {
                    this._msgQueue.push(pack);
                    this.playCmd();
                } else {
                    this._msgQueue.push(pack);
                }
            } catch (e) {
                cc.log(e);
            }
        }
    }
}