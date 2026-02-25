import { PBHideHandCard } from "../card/PBHideHandCard";
import {PBFlowState, PBRoomType, PBTableState} from "../PBCommonData";
import { PBEvent } from "../PBEvent";
import { facade } from "../PBLogic";
import { PBSettlementInfoChange } from "../settlement/PBSettlementInfoChange";
import { PBSettlementInfoChangeInPlayer } from "../settlement/PBSettlementInfoChangeInPlayer";
import { PBClock } from "../widgetplus/PBClock";
import { PBPlayer } from "./PBPlayer";
import { PBPlayerInfoVo } from "./PBPlayerData";
import { PBUserInfoCmp } from "./PBUserInfoCmp";

const { ccclass, property } = cc._decorator;

/**
 * 玩家控制
 */
@ccclass
export class PBPlayersCtrl extends cc.Component {
    allPlayers: PBPlayer[] = null;
    activePlayers: PBPlayer[] = null;
    emptySeats: cc.Node[] = null;
    coin_fly_ani_template: cc.Node = null; // 飞金币资源

    settlement_info_change: cc.Node = null; // 结算信息变更
    info_change_in_player: cc.Node = null;

    onLoad() {
        this.allPlayers = [];
        this.emptySeats = [];
        for (let i = 0; i < facade.dm.playersDm.chair; i++) {
            let playerNode = this.node.getChildByName("player_" + i);
            let player = playerNode.addComponent(this.getPlayerCmp());
            player.uiIndex = i;
            player.userInfoCmp = playerNode.getChildByName("user_info_node").addComponent(PBUserInfoCmp);
            player.userInfoCmp.isSelf = i == 0;
            let hide_hand_card = playerNode.getChildByName("hide_hand_card");
            if (hide_hand_card) {
                player.hideCardCtrl = hide_hand_card.getComponent(PBHideHandCard);
            }
            player.show();
            this.allPlayers.push(player);

            let emptySeat = this.node.getChildByName("empty_seat_" + i);
            if (emptySeat) {
                let friendRoomAni = cc.find("ani_match_friend", emptySeat);
                let normalRoomAni = cc.find("ani_match_normal", emptySeat);
                if (friendRoomAni && normalRoomAni) {
                    friendRoomAni.active = facade.dm.tableInfo.roomType == PBRoomType.friend;
                    normalRoomAni.active = !friendRoomAni.active;

                }
                emptySeat.on(cc.Node.EventType.TOUCH_END, () => {
                    // 暂时只支持domino观战玩家坐下
                    // if (facade.dm.tableInfo.gameId == 265) {
                    // let seatid = facade.dm.playersDm.caculateSeatIdByPosition(i);
                    let seatid = i + 1;
                    cc.log("caculateSeatIdByPosition = ", seatid);
                    facade.dm.msgWriter.sendSitDown(seatid);
                    // }
                })
                emptySeat.active = false;
            }
            this.emptySeats.push(emptySeat);
        }
        this.activePlayers = this.allPlayers;
        this.coin_fly_ani_template = cc.find("coin_fly_ani_template", this.node);

        this.settlement_info_change = cc.find("settlement_info_change", this.node);
        this.info_change_in_player = cc.find("player_0/info_change", this.node);
        if (this.info_change_in_player) {
            this.info_change_in_player.active = false;
        }

        this.addEventListener();
    }

    addEventListener() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent(PBEvent.USER_EXP_CHANGE, this.SELF_EXP_CHANGE, this);
        eventListener.registerEvent(PBEvent.USER_COIN_CHANGE, this.SELF_COIN_CHANGE, this);
        eventListener.registerEvent(PBEvent.USER_LEAGUE_CHANGE, this.SELF_LEAGUE_CHANGE, this);

        Global.registerEvent(EventId.UPATE_COINS, this.updateSelfCoin, this);
    }

    SELF_EXP_CHANGE() {
        let p = this.getPlayerByPosition(0);
        if (p && p.userInfoCmp && p.playerInfoVo) {
            p.userInfoCmp.updateExp(p.playerInfoVo);
        }
    }

    updateSelfCoin(){
        let selfInfo = facade.dm.playersDm.selfAbsInfo
        if(selfInfo){
            selfInfo.coin = cc.vv.UserManager.coin;
            if (facade.dm.deskInfo.conf.roomtype != PBRoomType.match) {
                Global.dispatchEvent(PBEvent.USER_COIN_CHANGE, {uid: selfInfo.uid});
            }
        }
    }

    SELF_COIN_CHANGE(msg: any) {
        if (!msg || !msg.detail || !msg.detail.uid) {
            return;
        }
        let uid = msg.detail.uid;
        if (uid == -1) { // 更新说有玩家的金币显示
            this.activePlayers.forEach(p => {
                if (p && p.userInfoCmp && p.playerInfoVo) {
                    p.userInfoCmp.updateCoin(p.playerInfoVo);
                }
            });
        } else {
            let p = this.getPlayerByUid(uid);
            if (p && p.userInfoCmp && p.playerInfoVo) {
                p.userInfoCmp.updateCoin(p.playerInfoVo);
            }
        }
    }

    SELF_LEAGUE_CHANGE() {
        let p = this.getPlayerByPosition(0);
        if (p && p.userInfoCmp && p.playerInfoVo) {
            p.userInfoCmp.feature(p.playerInfoVo);
        }
    }

    getPlayerCmp() {
        return PBPlayer;
    }
    // 设置玩家数
    setChair(cnt = 4) {
        if (cnt == 2) {
            this.activePlayers = [this.allPlayers[0], this.allPlayers[2]];
        } else if (cnt == 3) {
            this.activePlayers = [this.allPlayers[0], this.allPlayers[1], this.allPlayers[3]];
        } else {
            this.activePlayers = this.allPlayers;
        }
    }

    // 通过位置获取
    getPlayerByPosition(position: number) {
        return this.activePlayers[position];
    }

    // 通过uid获取
    getPlayerByUid(uid: number) {
        let res
        for (let i = 0; i < this.activePlayers.length; i++) {
            let p = this.activePlayers[i];
            if (p && p.playerInfoVo && p.playerInfoVo.uid == uid) {
                res = p;
                break;
            }
        }
        if(!res){
            cc.log("未找到玩家:"+uid)
        }
        
        return res
    }
    // 玩家坐下
    seat(pvo: PBPlayerInfoVo) {
        let p = this.getPlayerByPosition(pvo.position);
        if (p) {
            p.playerInfoVo = pvo;
            p.setPlayerStandup(false)
            p.show();
            this.showEmptySeat(p.uiIndex, !pvo);
        }
        else{
            cc.log("未找到坐下的位置："+pvo.position)
        }
    }
    // 玩家坐下
    onSitDown(uid: number) {
        let pvo = facade.dm.playersDm.getPlayerByUid(uid);
        if (pvo) {
            this.seat(pvo);
        } else {
            pvo = facade.dm.playersDm.getPlayerInViewerList(uid);
            if (pvo) {
                this.seat(pvo);
            }
        }
        let selfPlayer = this.getPlayerByPosition(0);
        if (selfPlayer) {
            selfPlayer._userInfoCmp.stopTimeTip();
        }
    }

    /**
     * 玩家站起
     */
    standUp(position: number) {
        let p = this.getPlayerByPosition(position);
        if (p) {
            p.playerInfoVo = null;
            p.show();
            this.showEmptySeat(p.uiIndex, true);
        }
    }

    /**
     * 初始化用户
     * @param pvos 
     */
    initPlayers(pvos: PBPlayerInfoVo[]) {
        let seatedPosition: number[] = [];
        for (let i = 0; i < pvos.length; i++) {
            let vo = pvos[i];
            vo && seatedPosition.push(vo.position);
        };
        this.activePlayers.forEach(p => {
            if (seatedPosition.includes(p.uiIndex)) {
                this.showEmptySeat(p.uiIndex, false);
            } else {
                p.playerInfoVo = null;
                p.show();
                this.showEmptySeat(p.uiIndex, true);
            }
        })
        // 座位与数据关联
        pvos.forEach(vo => {
            this.seat(vo);
        });
    }

    /**
     * 显示空位置
     */
    showEmptySeat(uiIndex: number, boo: boolean) {
        let emptySeat = this.emptySeats[uiIndex];
        if (emptySeat) {
            emptySeat.active = boo;
            if (boo && facade.dm.tableInfo.roomType === PBRoomType.friend && facade.dm.tableStatus.flowState === PBFlowState.playing && facade.dm.playersDm.selfInfo) {
                emptySeat.active = false;
            }
        }
    }

    hideAllEmptySeat() {
        this.activePlayers.forEach(p => {
            if (p) {
                if (!p.playerInfoVo) {
                    this.showEmptySeat(p.uiIndex, false);
                }
            }
        })
    }

    hideTimer() {
        this.activePlayers.forEach(p => {
            p.userInfoCmp.stopTimeTip();
        });
        // facade.clock.hide();
    }

    hideTimerByPosition(position: number) {
        let p = this.getPlayerByPosition(position);
        if (p) {
            p.userInfoCmp.stopTimeTip();
        }
    }

    /**
     * 显示玩家cd倒计时
     * @param position 
     * @param clock 
     * @param hideTimer  是否隐藏其他显示的倒计时
     * @param changelight 改变光效
     */
    async showTimer(position: number, time = 8, hideTimer = true, changelight = true) {
        if (hideTimer) {
            this.hideTimer();
        }
        let p = this.activePlayers[position];
        p.showTimer(time, changelight);
        // this.showClock(position, facade.clock, time);
        await facade.delayTime(0.2);
    }


    /**
     * 显示闹钟倒计时
     * @param position 
     * @param clock 
     */
    async showClock(position: number, clock: PBClock, time = 15) {
        let p = this.activePlayers[position];
        p.showClock(clock, time);
    }

    /**
     * 玩家准备
     * position 如果 position = -1 隐藏所有准备提示
     */
    ready(position: number, ani = true, isShow = true) {
        if (position == -1) {
            this.activePlayers.forEach(p => {
                p.userInfoCmp && p.userInfoCmp.showReadyTip(false);
            })
        } else {
            let p = this.activePlayers[position];
            if(isShow && Global.isYDApp() && facade.dm.deskInfo.conf.roomtype == PBRoomType.normal){
                // 匹配房不需要显示准备提示
            } else {
                p.userInfoCmp.showReadyTip(isShow, ani);
            }

            p.playerInfoVo.isReady = true;
        }
    }

    hideAllReady() {
        this.activePlayers.forEach(p => {
            p.userInfoCmp && p.userInfoCmp.showReadyTip(false);
        })
    }

    /**
     * 更新玩家金币
     */
    updateCoin() {
        this.players.forEach(p => {
            p && p.userInfoCmp.updateCoin(p.playerInfoVo);
        })
    }

    public get players(): PBPlayer[] {
        return this.activePlayers;
    }

    cleanRound() {
        this.hideTimer();
        this.activePlayers.forEach(p => {
            p.dealedCardLen = 0;
            p.hideCardCtrl && p.hideCardCtrl.reset();
            p.userInfoCmp && p.userInfoCmp.showReadyTip(false);
        });
    }

    formatTeams(result: any) {
        let players = [];
        let coins = result.coins || [];
        for (let i = 0; i < coins.length; i++) {
            let seatId = i + 1;
            let pVo = facade.dm.playersDm.getPlayerBySeatId(seatId);
            if (!pVo) {
                continue;
            }
            let json = { uid: pVo.uid, addcoin: coins[i] };
            players.push(json);
        }
        return players;
    }

    playInfoChange(exp: number, rp: number = 0, league: number = 0) {
        if (facade.dm.tableInfo.isViewer === 1) {
            return;
        }
        if (!this.settlement_info_change) {
            return;
        }

        let expDelayTime = 0;
        let rpDelayTime = 0;
        let leagueDelayTime = 0;
        let kind = 1;
        if (exp > 0 && rp > 0 && league > 0) {
            rpDelayTime = 0.1;
            leagueDelayTime = 0.2;
            kind = 3;
        } else if (exp > 0 && rp > 0) {
            rpDelayTime = 0.1;
            kind = 2;
        }


        let script = this.settlement_info_change.getComponent(PBSettlementInfoChange);
        let sc = this.info_change_in_player.getComponent(PBSettlementInfoChangeInPlayer);
        if (exp > 0) {
            script.playExpChange(exp, expDelayTime, () => {
                this.info_change_in_player.active = true;
                sc.showDialogue(kind);
            }, () => {
                sc.addInfo(exp, rp, league);
                let p = this.getPlayerByPosition(0);
                if (p) {
                    p.playRpChange(rp);
                }
            });
        }
        if (rp > 0) {
            script.playRpChange(rp, rpDelayTime);
        }
        if (league > 0) {
            script.playLeagueChange(league, leagueDelayTime);
        }
    }

    async flyCoinByTeams(players: any) {
        let winnerNum = 0;
        let winners = [];
        let coins = [];
        for (const player of players) {
            let pbplayer = this.getPlayerByUid(player.uid);
            let addcoin = player.addcoin;
            if (addcoin < 0) {
                pbplayer._userInfoCmp.updateCoin(facade.dm.playersDm.getPlayerByUid(player.uid));
                let startPos = pbplayer.getGlobalPos("interactive_emotion_pos");
                startPos = this.node.convertToNodeSpaceAR(startPos);

                facade.soundMgr.playBaseEffect("coinfly");
                for (let i = 0; i < 6; i++) {
                    let coin = cc.instantiate(this.coin_fly_ani_template);
                    if(Global.isYDApp() && [265,269,287].indexOf(cc.vv.gameData.getGameId()) >= 0){
                        coin.scale = 1;
                    } else {
                        coin.scale = 0.3;
                    }
                    coin.active = true;
                    coin.parent = this.node;
                    let endX = Math.random() * 200 - 100;
                    let endY = Math.random() * 200;
                    let endPos = cc.v2(endX, endY);
                    coin.x = startPos.x;
                    coin.y = startPos.y;
                    // coin.getComponent(cc.Animation).play();
                    cc.tween(coin)
                        .delay(0.05 * i)
                        .to(0.3, { position: endPos })
                        // .call(()=>{
                        //     coin.getComponent(cc.Animation).stop();
                        //     coin.getComponent(cc.Animation).setCurrentTime()
                        // })
                        .start();
                    coins.push(coin);
                }
            } else {
                if (addcoin > 0) {
                    winnerNum++;
                    winners.push(player);
                }
            }
        }

        await facade.delayTime(0.9);
        if (winners.length > 0) {
            let index = 0;
            for (let coin of coins) {
                let winner = winners[index];
                let endPlayer = this.getPlayerByUid(winner.uid);
                if (!endPlayer) {
                    (coin as cc.Node).removeFromParent();
                } else {
                    let endPos = endPlayer.getGlobalPos("interactive_emotion_pos");
                    endPos = this.node.convertToNodeSpaceAR(endPos);
                    cc.tween(coin)
                        .delay(Math.random() * 0.2)
                        .to(0.5, { position: endPos })
                        .removeSelf()
                        .start();
                    index++;
                    if (index >= winners.length) {
                        index = 0;
                    }
                }
            }

            await facade.delayTime(0.5);
            for (let winner of winners) {
                let endPlayer = this.getPlayerByUid(winner.uid);
                if (endPlayer) {
                    endPlayer.playCoinChange(winner.addcoin, true);
                }
            }
        } else {
            for (let coin of coins) {
                (coin as cc.Node).removeFromParent();
            }
        }
        await facade.delayTime(0.5);
    }

    /**
     * 飞金币
     */
    async flyCoinByUid(startUid: number, endUid: number, startCoin = 0, endcoin = 0, playWinAni = false) {
        let startPlayer = this.getPlayerByUid(startUid);
        let toPlayer = this.getPlayerByUid(endUid);
        if (!startPlayer || !toPlayer) {
            return;
        }
        if (startCoin) {
            startPlayer.playCoinChange(startCoin);
        }
        let startPos = startPlayer.getGlobalPos("interactive_emotion_pos");
        startPos = this.node.convertToNodeSpaceAR(startPos);
        let endPos = toPlayer.getGlobalPos("interactive_emotion_pos");
        endPos = this.node.convertToNodeSpaceAR(endPos);
        facade.soundMgr.playBaseEffect("coinfly");
        for (let i = 0; i < 6; i++) {
            let coin = cc.instantiate(this.coin_fly_ani_template);
            coin.scale = 0.5;
            coin.active = true;
            coin.parent = this.node;
            coin.x = startPos.x;
            coin.y = startPos.y;
            coin.getComponent(cc.Animation).play();
            cc.tween(coin)
                .delay(i * 0.1)
                .to(1, { position: endPos })
                .removeSelf()
                .start();
        }
        await facade.delayTime(1);
        if (endcoin) {
            toPlayer.playCoinChange(endcoin, playWinAni);
        }
    }

    /**
     * 显示观战玩家等待提示
     */
    showViewerWatingStartTips() {
        this.activePlayers.forEach(p => {
            if (p && p.playerInfoVo) {
                let isViewer = facade.dm.playersDm.checkPlayerIsViewer(p.playerInfoVo.uid);
                p.showWatingStartTip(isViewer);
            }
        })
    }

    /**
     * 开始新的一局游戏，取消所有活动玩家的准备状态
     */
    cancelPlayerReady(pvos: PBPlayerInfoVo[]) {
        if (facade.dm.tableInfo.needSelfReady()) {
            this.activePlayers.forEach(p => {
                if (p.playerInfoVo) {
                    p.playerInfoVo.isReady = false;
                    p.userInfoCmp.showReadyTip(false, false)
                }
            });
        }
    }
}