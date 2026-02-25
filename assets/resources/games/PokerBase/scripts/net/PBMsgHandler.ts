import { BaseHandler } from "../../../../../BalootClient/game_common/net/BaseHandler";
import PBLogic, { facade } from "../PBLogic";
import { PBGameData } from "../PBGameData";
import { PBChatMsgVo } from "../chat/PBChatData";
import { PBPlayerInfoVo, PBUserInfoVo } from "../player/PBPlayerData";

export class PBMsgHandler extends BaseHandler {
    dm: PBGameData = null;      // 保存一个数据控制器的引用已便访问
    gameCtrl: PBLogic = null;   // 保存一个逻辑控制器的引用已便访问
    constructor() {
        super();
    }

    /**
     * @override
     */
    clear() {
        super.clear();
        this.dm = null;
        this.gameCtrl = null;
    }

    /**
     * need overwrite
     */
    bindHandler() {
        this.bindNoCacheHandler();
        this.registerHandler(this.dm.msgCmd.R_PLAYER_READY, this.playerReady.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_ENTER_ROOM, this.playerEnterRoom.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_EXIT_ROOM, this.playerExit.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.S_APPLY_DISMISS, this.S_APPLY_DISMISS.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_APPLY_DISMISS, this.R_PLAYER_APPLY_DISMISS.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_REPLY_DISMISS, this.R_PLAYER_REPLY_DISMISS.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_COUNTDOWN_START, this.R_COUNTDOWN_START.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_COUNTDOWN_STOP, this.R_COUNTDOWN_STOP.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_EXIT, this.R_PLAYER_EXIT.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_VOICE_CHANGE, this.onVoiceChanged.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_PLAYER_SITDOWN, this.R_PLAYER_SITDOWN.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.R_ENTER_VIEWER, this.R_ENTER_VIEWER.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.S_SITDOWN, this.S_SITDOWN.bind(this), 0);
    }

    /**
     * 注册非阻塞命令
     */
    bindNoCacheHandler() {
        this.registerNoCacheHandler(this.dm.msgCmd.R_ROOM_DISMISS, this.roomDismiss.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.S_EXIT, this.selfExit.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.R_CHAT_MSG, this.onChatMsg.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.R_AUTO_HOST, this.autoHostChange.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.S_CANCLE_AUTO_HOST, this.selfCancleAutoHost.bind(this));

        this.registerNoCacheHandler(this.dm.msgCmd.R_UPDATE_PLAYER_INFO, this.R_UPDATE_PLAYER_INFO.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.R_TIPS_COIN_RECHARDGE, this.R_TIPS_COIN_RECHARDGE.bind(this));

        this.registerNoCacheHandler(this.dm.msgCmd.R_GAME_DISMISS_CANCEL, this.R_GAME_DISMISS_CANCEL.bind(this));

        // this.registerNoCacheHandler(this.dm.msgCmd.R_GAME_DISMISS_CANCEL, this.R_GAME_DISMISS_CANCEL.bind(this));
    }

    //////////////////// 阻塞的公共命令 //////////////////////////

    R_COUNTDOWN_START(dic: any) {
        this.gameCtrl.countdownStart(dic);
    }

    R_COUNTDOWN_STOP(dic: any) {
        this.gameCtrl.countdownStop(dic);
    }

    /**
    * 有玩家进入房间
    */
    playerEnterRoom(dic: any) {
        this.pauseCmd();
        this.gameCtrl.otherPlayerEnter(dic);
    }
    // 有玩家退出
    R_PLAYER_EXIT(dic: any) {
        console.log("R_PLAYER_EXIT", dic);
        if (dic.seatid > 0) {
            this.gameCtrl.removeViewer(dic.uid);
            this.gameCtrl.playerExit(dic, false);
        } else {
            this.gameCtrl.removeViewer(dic.uid);
            if (this.dm.tableInfo.isViewer) {
                this.gameCtrl.viewerList && this.gameCtrl.viewerList.updateList(this.dm.playersDm.viewerList);
            }
        }

    }

    // 自己坐下
    S_SITDOWN(dic: any) {
        if (dic.spcode) {
            switch (dic.spcode) {
                case 804:
                    cc.vv.FloatTip.show(___("您的金币不足"));
                    if (!Global.isYDApp()) {
                        cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COINS);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * 玩家退出房间
     */
    playerExit(dic: any) {
        console.log("玩家退出", dic);
        this.gameCtrl.playerExit(dic);
    }

    /**
     * 玩家准备
     */
    playerReady(dic: any) {
        console.log("玩家准备", dic);
        this.gameCtrl.playerReady(dic);
    }

    /**
     * 房间解散
     */
    roomDismiss(dic: any) {
        console.log("房间解散", dic);
        this.gameCtrl.roomDismiss();
    }

    /**
     * 自己发起解散
     */
    S_APPLY_DISMISS(dic: any) {
        cc.log("自己发起解散", dic);
        if (!dic.spcode) {
            this.gameCtrl.playerApplyDismiss(dic.dismiss);
        }
    }

    /**
     * 玩家发起解散
     */
    R_PLAYER_APPLY_DISMISS(dic: any) {
        cc.log("玩家发起解散", dic);
        if (!dic.spcode) {
            this.gameCtrl.playerApplyDismiss(dic.dismiss);
        }
    }

    /**
     * 玩家选择(拒绝/同意)解散房间
     */
    R_PLAYER_REPLY_DISMISS(dic: any) {
        cc.log("玩家选择(拒绝/同意)解散房间", dic);
        if (!dic.spcode) {
            this.pauseCmd();
            this.gameCtrl.playerReplyDismiss(dic);
        }
    }

    //////////////////// 非阻塞的公共命令 //////////////////////////
    /**
     * 自己中途退出房间
     */
    selfExit(dic: any) {
        console.log("自己中途退出房间", dic);
        if (dic.code == 200) {
            if (dic.spcode == 101015) {
                cc.vv.FloatTip.show(___("Please complete the game before leaving the room"));
                return
            }
            this.gameCtrl.exitTable();
        }
    }

    /**
     * 托管状态改变
     */
    autoHostChange(dic: any) {
        console.log("托管状态改变", dic);
        if (this.gameCtrl) {
            this.gameCtrl.autoHostChange(dic);
        }
    }

    /**
    * 自己取消托管
    */
    selfCancleAutoHost(dic: any) {
        console.log("自己取消托管账户", dic);
        if (!dic.spcode && this.dm && this.dm.playersDm && this.dm.playersDm.selfInfo) {
            if (this.gameCtrl) {
                this.gameCtrl.autoHostChange({
                    uid: this.dm.playersDm.selfInfo.uid,
                    auto: 0
                });
            }
        }
    }

    /**
     * 收到聊天消息
     */
    onChatMsg(msg: any) {
        console.log("聊天消息", msg);
        if (this.gameCtrl) {
            let msgVo = new PBChatMsgVo().parse(msg.msg);
            let fcoin = msg.coin || 0;
            if (fcoin) {
                msgVo.fcoin = fcoin;
            }
            this.gameCtrl.onChatMsg(msgVo);
        }
    }

    /**
     * 语音状态改变
     * @param msg 
     */
    onVoiceChanged(msg: any) {
        console.log("onVoiceChanged", msg);
        if (this.gameCtrl.voiceCtrl) {
            this.gameCtrl.voiceCtrl.R_VOICE_CHANGE(msg);
        }
    }

    R_PLAYER_SITDOWN(msg: any) {
        console.log("R_PLAYER_SITDOWN", msg);
        if (this.gameCtrl && msg.code === 200) {
            this.gameCtrl.onSitDown(msg);
            if (this.dm.tableInfo.isViewer && this.dm.playersDm.selfAbsInfo.seatId < 1) {
                this.gameCtrl.viewerList && this.gameCtrl.viewerList.updateList(this.dm.playersDm.viewerList);
            }
        }
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
            if (pvo.seatId > 0) { // 如果加入的人带seatid 则坐下
                this.dm.playersDm.seat(pvo);
                facade.playersCtrl.seat(pvo);
            }
        }
    }

    /**
     * 更新玩家信息
     * @param msg 
     */
    R_UPDATE_PLAYER_INFO(msg: any) {
        console.log("R_ENTER_VIEWER", msg);
        if (this.gameCtrl && msg.code === 200) {
            this.gameCtrl.onUpdatePlayerInfo(msg);
        }
    }

    /**
     * 金币不足
     */
    R_TIPS_COIN_RECHARDGE(msg: any) {
        if (this.dm.tempData) {
            this.dm.tempData["R_TIPS_COIN_RECHARDGE_MSG"] = msg;
        }
    }

    R_GAME_DISMISS_CANCEL(msg: any) {
        if (!msg.spcode) {
            this.gameCtrl.dismissCancel();
        }
    }
}