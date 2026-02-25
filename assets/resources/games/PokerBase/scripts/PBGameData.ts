import { PromiseLock } from "../../../../BalootClient/game_common/PromiseLock";
import { PBMsgHandler } from "./net/PBMsgHandler";
import { PBMsgWriter } from "./net/PBMsgWriter";
import { PBRoomType, PBTableInfo, PBTableStatus } from "./PBCommonData";
import { PBMsgCmd } from "./net/PBMsgCmd";
import { PBPlayerInfoVo, PBPlayersDm, PBUserInfoVo } from "./player/PBPlayerData";

/**
 * 数据控制类
 */
export class PBGameData {
    deskInfo: any = null;                    // 登录原始数据
    tableInfo: PBTableInfo = null;           // 桌子静态信息
    tableStatus: PBTableStatus = null;       // 桌子状态
    playersDm: PBPlayersDm = null;           // 玩家数据
    msgCmd: PBMsgCmd = null;                 // 命令号
    msgHandler: PBMsgHandler = null;         // 消息处理
    msgWriter: PBMsgWriter = null;           // 消息发送

    tempData: any = {};                       // 临时保存的数据

    constructor() {
        this.initDataCtrl();
    }

    /**
     * 初始化数据控制器
     */
    initDataCtrl() {
        this.tableInfo = this.loadTableInfo();
        this.tableStatus = this.loadTableStatus();
        this.playersDm = this.loadPlayerDm();
        this.msgCmd = this.loadMsgCmd();
        this.msgHandler = this.loadMsgHandler();
        this.msgHandler.dm = this;
        this.msgHandler.reset();
        this.msgHandler.bindHandler();
        this.msgWriter = this.loadMsgWriter();
    }

    loadTableInfo() {
        return new PBTableInfo();
    }

    loadTableStatus() {
        return new PBTableStatus();
    }

    loadPlayerDm() {
        return new PBPlayersDm();
    }

    loadMsgCmd() {
        return new PBMsgCmd();
    }

    loadMsgHandler() {
        return new PBMsgHandler();
    }
    loadMsgWriter() {

        return new PBMsgWriter()
    }

    /**
     * 登录初始化数据
     */
    init(deskInfo: any, gameId?: number, jp?: any) {
        PromiseLock.resetLock();
        if (window.facade) {
            facade.reconnectInGameReset();
        }
        this.deskInfo = deskInfo;
        this.parseTableInfo(deskInfo);
        this.playersDm.chair = deskInfo.seat;
        // 解析43协议中的users 生成用户
        this.parsePlayersData(deskInfo.users);
        this.parseViewerList(deskInfo.views);
        if (deskInfo.deskFlag == 1) {
            deskInfo.isReconnect = true;
        }
        if (deskInfo.isReconnect) {
            this.reconnectLogin();
        } else {
            this.normalLogin();
        }
        if (window.facade) {
            facade.enterTable();
            facade.enterTableLater();
        }
    }



    /**
     * 解析桌子静态信息
     */
    parseTableInfo(deskInfo: any) {
        this.tableInfo.gameId = deskInfo.gameid;
        this.tableInfo.tableId = deskInfo.deskid;
        this.tableInfo.roomType = deskInfo.conf.roomtype;
        this.tableInfo.turnTime = deskInfo.conf.turntime || 10;
        this.tableInfo.entryCoin = deskInfo.bet;
        this.tableInfo.createTime = deskInfo.conf.create_time;
        this.tableInfo.prize = (deskInfo.panel && deskInfo.panel.prize) || 0;
        this.tableInfo.maxRound = deskInfo.maxRound || 1;
        this.tableInfo.isOpenVoice = deskInfo.conf.voice == 1;
        this.tableInfo.pwd = deskInfo.conf.pwd || "";
        this.tableInfo.maxScore = deskInfo.maxScore || 0;
        if (this.tableInfo.roomType == PBRoomType.normal) {
            this.tableInfo.isOpenVoice = true;
        }
        this.tableInfo.isViewer = deskInfo.isViewer || 0;
    }

    /**
     * 解析玩家信息
     */
    parsePlayersData(users: any[]) {
        for (let i = 0; i < users.length; i++) {
            this.playersDm.seat(this.parseAPlayer(users[i]));
        }
    }

    /**
     * 解析观战玩家信息
     */
    parseViewerList(users: any[]) {
        this.playersDm.viewerList = [];
        if (!users) {
            return;
        }
        users.forEach(u => {
            if (u) {
                let pvo = this.parseAPlayer(u);
                this.playersDm.viewerList.push(pvo);
            }
        })
    }

    /**
     * 生成一个玩家的数据
     */
    parseAPlayer(item: any) {
        // todo override
        return this.genAPlayerInfoVo(PBPlayerInfoVo, PBUserInfoVo, item);
    }

    /**
     * 生成一个通用用户数据对象
     */
    genAPlayerInfoVo<A extends PBPlayerInfoVo, B extends PBUserInfoVo>(CA: new () => A, CB: new () => B, item: any): A {
        let uvo = new CA();
        uvo.uid = item.uid;
        uvo.seatId = item.seatid;
        uvo.isOnline = item.offline == 0;
        uvo.coin = item.coin;
        uvo.rpScore = item.rp || 0;
        uvo.winCoinShow = item.wincoinshow || 0;
        uvo.leagueLevel = item.leaguelevel || 0;
        uvo.leaguePoints = item.leagueexp || 0;
        uvo.autoHost = item.auto == 1;
        uvo.currLevel = item.level;
        uvo.currExp = item.levelexp;
        uvo.avatarFrame = item.avatarframe || "avatarframe_0";
        uvo.chatSkin = item.chatskin || "chat_free"
        uvo.token = item.token || "";
        uvo.svip = item.svip || 0;
        if (item.state != undefined) uvo.isReady = item.state == 2;
        if (item.mic != undefined) uvo.mic = item.mic;
        if (item.joinChat != undefined) uvo.joinChat = item.joinChat;
        uvo.race_id = item.race_id || 0;
        uvo.uinfo = new CB();
        uvo.uinfo.uname = item.playername || item.nick;
        uvo.uinfo.icon = item.usericon || item.icon;
        uvo.uinfo.gender = item.sex || 0;
        return uvo;
    }

    /**
     * 重连登录处理
     */
    reconnectLogin() {

    }

    /**
     * 普通登录处理
     */
    normalLogin() {

    }

    /**
     * 重置数据
     */
    reset() {
        this.tableStatus.reset();
        this.playersDm.reset();
    }

    /**
     * 清理单局数据
     */
    clearRound() {
        this.tableStatus.resetRound();
        let playersVos = this.playersDm.getPlayesInfo();
        playersVos.forEach(vo => {
            vo && vo.clearRound();
        })
    }

    /**
     * 倒数开始时间 重连时用到如果有值说明在倒数开始阶段
     */
    get countdownTime() {
        if (this.deskInfo.autoStart && this.deskInfo.autoStart.delayTime) {
            return this.deskInfo.autoStart.delayTime;
        }
        return 0;
    }

    /////////////////////////兼容 framework ///////////////////////
    update(args: any) {
    }

    onExit() {
        this.msgHandler && this.msgHandler.clear();
        this.tableStatus = null;
        this.playersDm = null;
        this.msgHandler = null;
        this.msgWriter = null;
        this.tempData = null;
    }

    clear() {
        cc.vv.gameData = null;
    }

    getGameId() {
        return this.tableInfo.gameId;
    }

    SetBreakGrant(param: any) {

    }

    isBackgroundReConn() {
        return true;
    }

    /**
     * 获取deskinfo里的user
     * @param uid 
     * @returns 
     */
    getUserInDeskinfo(uid: number) {
        for (const user of this.deskInfo.users) {
            if (user.uid === uid) {
                return user;
            }
        }
        return null;
    }
}
