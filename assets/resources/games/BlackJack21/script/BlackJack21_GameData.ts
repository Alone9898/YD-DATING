import {PBGameData} from "../../PokerBase/scripts/PBGameData";
import BlackJack21MsgWriter from "./net/BlackJack21_MsgWriter";
import BlackJack21MsgCmd from "./net/BlackJack21_MsgCmd";
import BlackJack21MsgHandler from "./net/BlackJack21_MsgHandler";
import BlackJack21TableStatus, {BlackJack21AlignType} from "./BlackJack21_CommonData";
import BlackJack21PlayersDm, {BlackJack21PlayerInfoVo} from "./player/BlackJack21_PlayerData";
import {PBPlayerInfoVo, PBUserInfoVo} from "../../PokerBase/scripts/player/PBPlayerData";
import {BlackJack21Cfg} from "./BlackJack21_Cfg";
import { facade } from "../../PokerBase/scripts/PBLogic";

const {ccclass, property} = cc._decorator;

@ccclass
class BlackJack21GameData extends PBGameData {
    tableStatus: BlackJack21TableStatus;        // 桌子状态
    playersDm: BlackJack21PlayersDm;            // 玩家数据
    msgCmd: BlackJack21MsgCmd;                  // 命令号
    msgHandler: BlackJack21MsgHandler;          // 消息处理
    msgWriter: BlackJack21MsgWriter;            // 消息发送

    private _betcoin:number=0;
    get betcoin(){
        return this._betcoin;
    }
    set betcoin(value){
        this._betcoin = value;
    }

    loadTableStatus() {
        return new BlackJack21TableStatus();
    }

    loadPlayerDm() {
        return new BlackJack21PlayersDm();
    }

    loadMsgCmd() {
        return new BlackJack21MsgCmd();
    }

    loadMsgHandler() {
        return new BlackJack21MsgHandler();
    }

    loadMsgWriter() {
        return new BlackJack21MsgWriter()
    }


    // /**
    //  * 解析玩家信息
    //  */
    // parsePlayersData(users: any[]) {
    //     // 用户信息
    //     for (let i = 0; i < users.length; i++) {
    //         let item = users[i];
    //         let uvo = this.parseAPlayer(item);
    //         this.playersDm.seat(uvo);
    //     }
    // }

    /**
     * 解析一个玩家的信息
     */
    parseAPlayer(item: any) {
        let uvo = this.genAPlayerInfoVo(BlackJack21PlayerInfoVo, PBUserInfoVo, item);
        // uvo.roundScore = item.score || 0;
        uvo.state = item.state;
        uvo.round = item.round;
        return uvo;
    }


    /**
     * 重连登录处理
     */
    reconnectLogin() {
        let deskInfo = this.deskInfo;
        // 桌子状态
        let tableStatus = this.tableStatus;
        tableStatus.currStatus = deskInfo.state;
        tableStatus.isReconnect = deskInfo.isReconnect;
        // 解析用户信息
        this.parsePlayersData(deskInfo.users);
        this.parseViewerList(deskInfo.views);
        let roundInfo = deskInfo.round;
        if (roundInfo) {
            tableStatus.activeSeat = roundInfo.activeSeat;
            tableStatus.dealerUid = (roundInfo.dealer && roundInfo.dealer.uid) || 0;
        }

        // let deskInfo = this.deskInfo;
        // // 桌子状态
        // let tableStatus = this.tableStatus as BlackJack21TableStatus;
        // tableStatus.currState = deskInfo.state;
        // tableStatus.isReconnect = deskInfo.isReconnect;
        // let cfgData = cc.vv.GameDataCfg.getGameData(this.getGameId())
        // cc.director.loadScene(cfgData.gameScene)
        //
        // // 解析用户信息
        // this.parsePlayersData(deskInfo.users);
        // for (let viewer of this.playersDm.viewerList) {
        //     if (viewer.seatId && viewer.seatId > 0) {
        //         this.playersDm.seat(viewer);
        //     }
        // }
    }

    clear(){
        this.msgHandler && this.msgHandler.clear();
        cc.game.off(cc.game.EVENT_HIDE, facade.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, facade.onGameShow, this);

        window.facade = null;
        facade = null;
        this.deskInfo = null
        cc.vv.gameData = null

        console.log("======***======,清除桌子")
    }

    parseTableInfo(deskInfo: any) {
        super.parseTableInfo(deskInfo);
        this.tableStatus.currState = deskInfo.state;
        this.tableStatus.isReconnect = deskInfo.isReconnect;
    }

    /**
     * 普通登录处理
     */
    normalLogin() {
        // let deskInfo = this.deskInfo;
        // // 解析用户信息
        // this.parsePlayersData(deskInfo.users);
        // for (let viewer of this.playersDm.viewerList) {
        //     if (viewer.seatId && viewer.seatId > 0) {
        //         this.playersDm.seat(viewer);
        //     }
        // }
    }

    /**
     *
     * @param idx  0-4
     * @param allCnt
     * @param alignType
     */
    getCardPos(idx, allCnt,alignType){
        let distance = 65;  // 两张牌之间的间隔

        let endX;
        if(alignType == BlackJack21AlignType.Left){
            endX = (idx-2)*distance;
        } else if(alignType == BlackJack21AlignType.Right){
            let t_idx = allCnt-idx-1;
            endX = (2-t_idx)*distance;
        } else if(alignType == BlackJack21AlignType.Center){
            if(allCnt %2 == 0){
                let t_idx = idx-allCnt/2;
                endX = (t_idx+0.5) * distance
            } else {
                let t_idx = idx-Math.floor(allCnt/2)
                endX = t_idx * distance;
            }
        }

        return cc.v3(endX, 0);
    }



    getGameDir(){
        return 'games/BlackJack21/';
    }

    //退出游戏返回大厅
    ReqBackLobby(){
        let betcoin = this.betcoin;
        let str = "";
        if(betcoin > 0){
            str += `You will lose ${Global.FormatNumToComma(betcoin)}`;
            cc.vv.AlertView.show(str, () => {
                facade.dm.msgWriter.sendExit(); //退出游戏
            }, () => {

            },false,null,___("Leave Table"),null,___("Leave"));
        }
        else {
            facade.dm.msgWriter.sendExit(); //退出游戏
        }
    }


    //获取游戏配置:就是配置了symbols的文件 一般命名 ***_Cfg.js
    getGameCfg(){
        return new BlackJack21Cfg()
    }
}

export = BlackJack21GameData;
