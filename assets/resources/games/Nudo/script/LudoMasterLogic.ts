import PBLogic from "../../PokerBase/scripts/PBLogic";
import LudoMasterGameData = require("./LudoMasterGameData");
import LudoMasterTable from "./game/LudoMasterTable";
import { LudoMasterSoundCtrl } from "./game/LudoMasterSoundCtrl";
import { LudoMasterPlayerCtrl } from "./game/LudoMasterPlayerCtrl";
import { NEXTGAME } from "./LudoMasterCommonData";
import { PromiseLock } from "../../../../BalootClient/game_common/PromiseLock";
import { PBSettlementResultType } from "../../PokerBase/scripts/settlement/PBTotalSettlement";
import { LudoMasterTotalSettlement } from "./game/LudoMasterTotalSettlement";
import { PBFlowState, PBRoomType, PBTableState } from "../../PokerBase/scripts/PBCommonData";
import LudoReplayCpt from "./game/LudoReplayCpt";

import GAME_ID = require("../../../../BalootClient/GameIdMgr");
import Table_CountDown from "../../../Table_Common/TableBase/Table_CountDown";


const { ccclass, property } = cc._decorator;

@ccclass
class LudoMasterLogic extends PBLogic {
    tableCtrl: LudoMasterTable;
    playersCtrl: LudoMasterPlayerCtrl;
    totalSettlementCtrl: LudoMasterTotalSettlement;
    dm: LudoMasterGameData;

    // url_rule = "games/Nudo/prefab/game_rule";
    replayCpt: LudoReplayCpt;
    countDown: Table_CountDown;

    /**
     * 初始化之前处理
     */
    beforeInit() {
        super.beforeInit();
        this.tableCtrl = this.panel.getComponent(LudoMasterTable);
        // 初始化棋子
        this.tableCtrl.initChess();
    }

    /**
     * 加载化控制器
     */
    loadCtrl() {
        super.loadCtrl();
        // this.url_rule = cc.vv.gameData.deskInfo.gameid === GAME_ID.POKER_LUDO_QUICK ? "games/Nudo/prefab/game_rule_quick" : "games/Nudo/prefab/game_rule";
        this.totalSettlementCtrl = this.loadTotalSettlementCtrl();
        this.replayCpt = this.panel.parent.getComponentInChildren(LudoReplayCpt);
        this.replayCpt.active = false;
        // 添加声音管理器
        this.panel.addComponent("Table_Sound");
        this.countDown = this.loadCountdown();
    }

    loadTotalSettlementCtrl() {
        return cc.find("total_settlement", this.panel).getComponent(LudoMasterTotalSettlement);
    }

    loadPlayersCtrl() {
        return this.panel.addComponent(LudoMasterPlayerCtrl);
    }

    // afterInit() {
    //     super.afterInit();
    //     this.dm.msgHandler.run();
    //     cc.vv.NetManager.send({ c: 3 });
    // }

    start(){
        this.dm.msgHandler.run();
        cc.vv.NetManager.send({ c: 4 });
        this.enterTable();
        this.enterTableLater();
    }
    

    /**
     * 音效播放组件
     */
    loadSoundCtrl() {
        return this.panel.addComponent(LudoMasterSoundCtrl);
    }

    /**
     * 加载倒计时
     */
    loadCountdown() {
        let node = cc.find("table_count_down", this.panel);
        if (node) {
            return node.getComponent("Table_CountDown");
        } else {
            return null;
        }
    }

    cleanRound() {
        this.dm.clearRound();
        this.playersCtrl.cleanRound();
        this.operate.showChangeBtn(false);
        this.operate.showLeaveBtn(false);
        this.operate.showConfirmBtn(false);
        this.operate.showTableCode(false);

        this.countDown.hide();
    }

    /**
     * 重置资源
     */
    reset() {
        this.dm.reset();
        this.dm.msgHandler.clearMsgQueue();
        this.playersCtrl.cleanRound();
    }

    reconnectInGameReset() {
        this.dm.msgHandler.clearMsgQueue();
        this.dm.clearRound();
        this.dm.reset();
    }

    // 换桌
    changeTable() {
        for (let i = 1; i <= 4; i++) {
            this.playersCtrl.standUp(i)
        }
        this.cleanRound();
    }


    /**
     * 观战玩家主动坐下
     * @param dic 
     */
    onSitDown(dic: any) {
        super.onSitDown(dic);
        if (dic.uid === cc.vv.UserManager.uid) {
            this.dm.tableInfo.isViewer = 0;
        }
    }
    /**
     * 进入房间
     */
    async enterTable() {
        this.replayCpt.unscheduleAllCallbacks();
        //初始化
        this.scheduleOnce(() => {
            // 初始化玩家
            this.playersCtrl.setChair(this.dm.deskInfo.seat);
            this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);
            // 恢复所有棋子
            this.tableCtrl.updateAllChess(this.dm.playersDm.seatedPlayersInfo);
            // 遍历所有座位
            for (const seatInfo of this.dm.playersDm.seatedPlayersInfo) {
                if (!seatInfo) continue;
                let playerCpt = this.playersCtrl.getPlayerByUid(seatInfo.uid);
                // 正在操作的玩家
                if (this.dm.deskInfo.round.activeSeat == seatInfo.seatId) {
                    // 倒计时
                    this.playersCtrl.showTimer(seatInfo.position, this.dm.deskInfo.round.delayTime);
                    // 处于摇骰子阶段
                    if (seatInfo.state == 6) {
                        this.playersCtrl.diceBtnCtrl(seatInfo.seatId);
                        playerCpt.showAni();
                        if (seatInfo.uid == cc.vv.UserManager.uid) {
                            if (!Global.isSingle()) {
                                this.replayCpt.active = false;
                            }
                        }
                    }
                    // 设置剩余塞子
                    playerCpt.setDiceList(seatInfo.round.dices);
                    // 如果是自己在操作
                    if (seatInfo.uid == cc.vv.UserManager.uid) {
                        if (seatInfo.state == 4) {
                            this.tableCtrl.lightChessCtrl(seatInfo.round.dices) // 高亮骰子
                        }
                    }
                } else {
                    // 其余玩家
                    playerCpt.setDiceList([]);
                }
            }
            // 是否观战
            if (this.dm.tableInfo.isViewer && !this.dm.playersDm.selfAbsInfo.isSeated) {
                this.viewerList.show(this.dm.playersDm.viewerList);
            } else {
                this.viewerList.hide();
            }
            if (this.dm.playersDm.selfAbsInfo.isSeated) {
                if (this.dm.playersDm.selfAbsInfo.autoHost) {
                    this.autoHost.show();
                }
            }

            // 解散
            if (this.dm.deskInfo.dismiss) {
                this.playerApplyDismiss(this.dm.deskInfo.dismiss);
            }


            if (this.dm.tableStatus.currStatus === PBTableState.PLAY) {
                this.operate.showChangeBtn(false);
            } else {
                this.operate.showChangeBtn(true);
            }

            if (this.dm.tableStatus.isReconnect) {

                if ((this.dm.tableStatus.currStatus === PBTableState.PLAY) || (this.dm.tableStatus.currStatus === PBTableState.SETTLE) || (this.dm.tableStatus.currStatus === PBTableState.READY)) {
                    if (this.dm.tableInfo.isViewer === 0) {
                        this.playersCtrl.hideAllEmptySeat();
                    }
                }

                // 如果是好友房
                switch (this.dm.tableStatus.currStatus) {
                    case PBTableState.MATCH:
                    case PBTableState.READY:
                    case PBTableState.SETTLE:
                    case PBTableState.GAMEOVER:
                        if (this.dm.tableInfo.roomType == PBRoomType.friend) {
                            let countdownTime = this.dm.countdownTime;
                            if (countdownTime > 0) {
                                this.dm.tableStatus.flowState = PBFlowState.countdown;
                                // this.countdown.show(countdownTime);
                                this._showMathUIAni(true, countdownTime)
                                this.operate.showReady(false);
                                this.operate.showInvite(false);
                                this.operate.showTableCode(false);
                            } else {
                                this.operate.showReady(!this.dm.playersDm.selfAbsInfo.isReady);
                                this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                                this.operate.showTableCode(true);
                            }
                        }
                        break;
                    default:
                        this.dm.tableStatus.flowState = PBFlowState.playing;
                }
            } else {
                if (this.dm.tableInfo.needSelfReady()) {
                    this.operate.showReady(!this.dm.playersDm.selfAbsInfo.isReady);
                    this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                    this.operate.showTableCode(true);
                } else {
                    // this.countdown.show(5);
                    if(this.dm.deskInfo.waitTime > 0){
                        this._showMathUIAni(true, this.dm.deskInfo.waitTime)
                    }
                }
            }

            // 设置房间类型
            // this.tableCtrl.showGameType(this.dm.deskInfo.conf.gametype)
            if (this.dm.deskInfo.gameid === GAME_ID.POKER_LUDOMASTER) {
                this.tableCtrl.showGameType(2);
            } else if (this.dm.deskInfo.gameid === GAME_ID.POKER_LUDO_QUICK) {
                this.tableCtrl.showGameType(1);
            }
            // 设置房间号
            // cc.find("top_left_layout/score_board/room_id/label", this.panel).getComponent(cc.Label).string = this.dm.tableInfo.tableId.toString();
            //
            // if (this.dm.tableInfo.roomType == PBRoomType.friend) {
            //     cc.find("top_left_layout/score_board", this.panel).active = true;
            //     cc.find("top_left_layout/title_node", this.panel).active = false;
            // } else {
            //     cc.find("top_left_layout/score_board", this.panel).active = false;
            //     cc.find("top_left_layout/title_node", this.panel).active = true;
            // }
            //
            // if (this.dm.deskInfo.gameid === GAME_ID.POKER_LUDOMASTER) {
            //     cc.find("top_left_layout/title_node/label", this.panel).getComponent(cc.Label).string = ___("Ludo");
            // } else {
            //     cc.find("top_left_layout/title_node/label", this.panel).getComponent(cc.Label).string = ___("Ludo Quick");
            // }

            this.changeSkin();
            this.playersCtrl.showViewerWatingStartTips();
            this.dm.msgHandler.resumeCmd();
        })
    }
    // 游戏开始
    async GAME_START(msg: any) {
        this.dm.tableStatus.flowState = PBFlowState.playing;
        this.operate.showChangeBtn(false);
        this.operate.showLeaveBtn(false)
        this.operate.showConfirmBtn(false)
        // 更新用户数据
        if (!!msg.users) {
            this.dm.deskInfo.users = msg.users;
            this.dm.playersDm.allUserMap = new Map();
            this.dm.updatePalyersData();
            this.playersCtrl.initPlayers(this.dm.playersDm.seatedPlayersInfo);
        }
        // this.countdown.hide();
        this.countDown.hide();
        this._showMathUIAni(false);
        this.operate.showReady(false);
        this.operate.showInvite(false);
        this.operate.showTableCode(false);
        // 更新观战列表
        if (this.dm.tableInfo.isViewer && !this.dm.playersDm.selfAbsInfo.isSeated) {
            this.viewerList.show(this.dm.playersDm.viewerList);
        } else {
            this.viewerList.hide();
        }
        // 重置所有玩家棋子
        for (const userInfo of this.dm.playersDm.seatedPlayersInfo) {
            if (!userInfo) continue;
            if (userInfo.round) {
                if (this.dm.deskInfo.gameid === GAME_ID.POKER_LUDO_QUICK) {
                    userInfo.round.steps = [1, 0, 0, 0];
                } else {
                    userInfo.round.steps = [0, 0, 0, 0];
                }
                userInfo.round.kill = 0;
            }
        }
        // 关闭所有准备图标
        this.playersCtrl.hideAllReady();
        // 如果自己已经坐下 不显示空位置
        if (this.dm.playersDm.selfAbsInfo.isSeated) {
            this.playersCtrl.hideAllEmptySeat();
        }
        // 更新观战列表
        this.dm.playersDm.clearSeatedFromViewer();
        // 更新waiting
        this.playersCtrl.showViewerWatingStartTips();
        // 更新所有棋子
        this.tableCtrl.updateAllChess(this.dm.playersDm.seatedPlayersInfo);
        // 判断是否属于托管
        if (this.dm.playersDm.selfAbsInfo.isSeated) {
            if (this.dm.playersDm.selfAbsInfo.autoHost) {
                this.autoHost.show();
            } else {
                this.autoHost.hide();
            }
        }
        this.soundMgr.playEffect("gameStart");
        this.showNextPlayer(this.dm.playersDm.getPlayerByUid(msg.activeUid).seatId, msg.delayTime);
        this.dm.msgHandler.resumeCmd();
    }
    // 某玩家摇骰子结果
    async PLAY_DICE(msg: any) {
        // 关闭所有提示
        this.tableCtrl.closeAllLight();
        let playerCpt = this.playersCtrl.getPlayerByUid(msg.uid);
        playerCpt.showAniRs()
        // 音效处理
        this.soundMgr.stopEffectByName("DiceNorRoll");
        if (msg.uid != cc.vv.UserManager.uid) {
            this.soundMgr.playEffect("otherTurn")
        }
        if (!await PromiseLock.exe(this.delayTime(0.7))) return;
        this.soundMgr.playEffect("DiceNorRoll", true);
        // 显示结果
        playerCpt.showDice(msg.dot);
        if (msg.dot === 6) {
            playerCpt.playSixEffect();
        }
        if (!await PromiseLock.exe(this.delayTime(0.2))) return;
        // 更新骰子列表
        playerCpt.setDiceList(msg.dices);
        this.soundMgr.stopEffectByName("DiceNorRoll");



        this.playersCtrl.hideTimerByPosition(playerCpt.playerInfoVo.position);

        // 获取下一个人的uid TODO
        let nextSeatInfo = this.dm.playersDm.getPlayerBySeatId(msg.nextSeat);
        if (nextSeatInfo && nextSeatInfo.uid != msg.uid) {
            playerCpt.setDiceList([]);
        }
        // 恢复通信
        this.dm.msgHandler.resumeCmd();
        // 开启重新摇骰子流程
        if (msg.nextgametype == NEXTGAME.MOVE || msg.pass) {
            // 启用倒计时
            this.playersCtrl.showTimer(playerCpt.playerInfoVo.position, msg.delayTime);
            // 高亮棋子
            if (msg.uid == cc.vv.UserManager.uid) {
                this.tableCtrl.lightChessCtrl(msg.dices)
            }
            if (msg.canreset && msg.canreset == 1 && msg.uid == cc.vv.UserManager.uid) {
                this.replayCpt.active = false;
                let isRePlay = await this.replayCpt.waitOpr(msg.diamond || "", 3);
                if (isRePlay) {
                    // 重置成功
                    this.replayCpt.active = false;
                    this.playersCtrl.showTimer(this.dm.playersDm.selfAbsInfo.position, msg.delayTime);
                    return;
                }
            }
            this.replayCpt.active = false;
            this.playersCtrl.diceBtnCtrl(1000);// 关闭所有骰子按钮
        }

        if (msg.nextgametype == NEXTGAME.DICE) {
            // 轮到下一位
            this.showNextPlayer(msg.nextSeat, msg.delayTime);
        } else if (msg.nextgametype == NEXTGAME.MOVE) {
            // if (msg.automove != 1) { // 需要玩家选择移动
            // } else { // 棋子自动移动
            // }
        }
        if (msg.pass) {
            // pass 
            playerCpt.playBidBubble("pass");
            // 清除自己的骰子结果
            playerCpt.setDiceList([]);
            this.tableCtrl.closeAllLight();
        }

    }

    PLAYER_OVER_RESET_DICE(msg: any) {
        if (msg.code === 200 && !msg.spcode) {
            let playerCpt = this.playersCtrl.getPlayerByUid(msg.uid);
            // if (msg.pass) {
            // pass 
            playerCpt.playBidBubble("pass");
            // 清除自己的骰子结果
            playerCpt.setDiceList([]);
            this.tableCtrl.closeAllLight();
            // }

            this.playersCtrl.diceBtnCtrl(1000);// 关闭所有骰子按钮
            this.showNextPlayer(msg.nextSeat, msg.delayTime);
            this.dm.msgHandler.resumeCmd();
        }
    }

    // 自己移动棋子结果
    async MOVE_DICE(msg: any) {
        this.replayCpt.active = false;
        this.playersCtrl.diceBtnCtrl(1000);// 关闭所有骰子按钮
        // 移动棋子前 关闭所有提示
        this.tableCtrl.closeAllLight();
        let playerCpt = this.playersCtrl.getPlayerByUid(msg.uid)
        this.playersCtrl.hideTimerByPosition(playerCpt.playerInfoVo.position);
        // 更新骰子结果
        playerCpt.setDiceList(msg.dices);
        // 移动棋子
        await this.tableCtrl.moveChessAct(msg);
        // 判断游戏是否结束
        if (!msg.isOver) {
            if (msg.nextgametype == NEXTGAME.DICE) {
                // 轮到下一位倒计时,打开骰子动画
                this.showNextPlayer(msg.nextSeat, msg.delayTime)
            } else if (msg.nextgametype == NEXTGAME.MOVE) {
                // 重新启用倒计时
                this.playersCtrl.showTimer(playerCpt.playerInfoVo.position, msg.delayTime || this.dm.deskInfo.delayTime);
                // 高亮棋子
                if (msg.uid == cc.vv.UserManager.uid) {
                    this.tableCtrl.lightChessCtrl(msg.dices)
                }
            }
        }
        this.dm.msgHandler.resumeCmd();
    }
    // 游戏结束回包
    async GAME_OVER(dic: any) {
        this.dm.tableStatus.flowState = PBFlowState.match;
        this.soundMgr.playEffect("gameOver");
        this.playersCtrl.hideTimer();
        // this.autoHost.hide();
        // 关闭所有骰子结果
        this.playersCtrl.closeAllDiceList();
        this.totalSettlementCtrl.open(dic, (ret: { type: PBSettlementResultType, restTime: number }) => {
            if (ret && ret.type != PBSettlementResultType.GO_BACK && ret.restTime > 0) {
                let nextTime = ret.restTime;
                // this.countdown.show(nextTime);
                // this._showMathUIAni(true, nextTime)
                this.scheduleOnce(() => {
                    this.dm.msgHandler.resumeCmd();
                }, nextTime)
            } else {
                this.dm.msgHandler.resumeCmd();
            }
        });
        if (!await PromiseLock.exe(this.delayTime(1))) return;
        // 重置所有玩家棋子
        for (const userInfo of this.dm.playersDm.seatedPlayersInfo) {
            if (!userInfo) continue;
            if (userInfo.round && userInfo.round.steps) {
                if (this.dm.deskInfo.gameid === GAME_ID.POKER_LUDO_QUICK) {
                    userInfo.round.steps = [1, 0, 0, 0];
                } else {
                    userInfo.round.steps = [0, 0, 0, 0];
                }

                userInfo.round.kill = 0;
            }
        }
        this.tableCtrl.updateAllChess(this.dm.playersDm.seatedPlayersInfo);
        if (!await PromiseLock.exe(this.delayTime(1))) return;
        this.playersCtrl.updateCoin();
        this.countDown.show(dic.delayTime-2);
        // 更新观战列表
        this.dm.playersDm.clearSeatedFromViewer();
    }
    // 显示下一个人操作并且打开摇骰子动画
    showNextPlayer(seatId: number, delayTime: number) {
        // dice按钮可以点击
        this.playersCtrl.diceBtnCtrl(seatId)
        let playerInfo = this.dm.playersDm.getPlayerBySeatId(seatId)
        playerInfo && this.playersCtrl.getPlayerByUid(playerInfo.uid).showAni();
        playerInfo && this.playersCtrl.showTimer(playerInfo.position, delayTime ? delayTime : this.dm.deskInfo.delayTime);
    }

    confirmBtnClick(){
        this.cleanRound();
        this.totalSettlementCtrl.close(PBSettlementResultType.MANUAL_NEXT);
        this.countDown.show(this.countDown.timelife);
    }

    // 测试游戏结束
    testGameOver() {
        let test = {
            "isDismiss": 0,
            "c": 126006,
            "code": 200,
            "wincoins": [
                {
                    "wincoinshow": 26000,
                    "uid": 10121
                },
                {
                    "wincoinshow": -10000,
                    "uid": 207
                },
                {
                    "wincoinshow": -10000,
                    "uid": 1176
                },
                {
                    "wincoinshow": -10000,
                    "uid": 762
                }
            ],
            "delayTime": 6,
            "settle": {
                "fcoins": [
                    130000,
                    875000,
                    890000,
                    1190000
                ],
                "scores": [
                    0,
                    0,
                    0,
                    0
                ],
                "pannel": [
                    [
                        125,
                        6,
                        5
                    ],
                    [
                        99,
                        2,
                        5
                    ],
                    [
                        120,
                        10,
                        6
                    ],
                    [
                        108,
                        4,
                        6
                    ]
                ],
                "league": [
                    0,
                    0,
                    0,
                    0
                ],
                "levelexps": [
                    80,
                    50,
                    50,
                    50
                ],
                "uids": [
                    10121,
                    1176,
                    207,
                    762
                ],
                "rps": [
                    30,
                    0,
                    0,
                    0
                ],
                "coins": [
                    26000,
                    -10000,
                    -10000,
                    -10000
                ]
            },
            "fbshare": {
                "10121": {
                    type: 2,
                    times: 3,
                }
            }
        }
        this.GAME_OVER(test);
    }

    testGameStart() {
        let test = {
            "c": 126003,
            "code": 200,
            "delayTime": 10,
            "users": [
                {
                    "isexit": 0,
                    "score": 0,
                    "frontskin": "font_color_4",
                    "avatarframe": "avatarframe_1000",
                    "usericon": "9",
                    "wincoin": 0,
                    "playername": "12306",
                    "leaguelevel": 1,
                    "levelexp": 100,
                    "coin": 73000,
                    "rp": 0,
                    "level": 2,
                    "uid": 10199,
                    "settlewin": 0,
                    "isnew": 0,
                    "leagueexp": 0,
                    "auto": 0,
                    "chatskin": "chat_000",
                    "create_time": 1652688798,
                    "leavetime": 1652782425,
                    "winTimes": 0,
                    "round": {
                        "chess": [
                            1,
                            2,
                            3,
                            4
                        ],
                        "isWin": 0,
                        "steps": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "dices": [],
                        "times": 0
                    },
                    "state": 1,
                    "seatid": 1,
                    "token": "006c91030f6f2bc4ac39748f72ad5fdf1aaIACveAzAI2BlxepSCekY5ejLXT9ZMN63ukBCiBVHpfG/nsuBXwCfFGDeIgDD9wAALLiEYgQAAQC8dINiAwC8dINiAgC8dINiBAC8dINi",
                    "wincoinshow": 0,
                    "offline": 0,
                    "svip": 0,
                    "oldseatid": 1
                },
                {
                    "isexit": 0,
                    "score": 0,
                    "frontskin": "font_color_4",
                    "avatarframe": "avatarframe_1000",
                    "usericon": "10",
                    "wincoin": 0,
                    "playername": "阿斯顿发",
                    "leaguelevel": 1,
                    "levelexp": 150,
                    "coin": 104000,
                    "rp": 0,
                    "level": 3,
                    "uid": 10122,
                    "settlewin": 0,
                    "isnew": 0,
                    "leagueexp": 0,
                    "auto": 0,
                    "chatskin": "chat_000",
                    "create_time": 1652237682,
                    "leavetime": 1652783622,
                    "winTimes": 0,
                    "round": {
                        "chess": [
                            1,
                            2,
                            3,
                            4
                        ],
                        "isWin": 0,
                        "steps": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "dices": [],
                        "times": 0
                    },
                    "state": 1,
                    "seatid": 3,
                    "token": "006c91030f6f2bc4ac39748f72ad5fdf1aaIADB4/DgSWW9oZz8fs+Vm9VV7F8W5+aJzC+xhwlY+W6XgsuBXwDcFEaqIgClEgAANLiEYgQAAQDEdINiAwDEdINiAgDEdINiBADEdINi",
                    "wincoinshow": 0,
                    "offline": 0,
                    "svip": 6,
                    "oldseatid": 2
                }
            ],
            "dealerUid": 10122,
            "activeUid": 10122
        }
        this.GAME_START(test);
    }
}

export = LudoMasterLogic;