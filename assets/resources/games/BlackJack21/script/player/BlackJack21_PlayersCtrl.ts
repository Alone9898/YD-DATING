import {PBPlayersCtrl} from "../../../PokerBase/scripts/player/PBPlayersCtrl";
import {PBUserInfoCmp} from "../../../PokerBase/scripts/player/PBUserInfoCmp";
import BlackJack21HandCardCtrl from "../card/BlackJack21_HandCardCtrl";
import BlackJack21Player from "./BlackJack21_Player";
import {PBRoomType, PBTableState} from "../../../PokerBase/scripts/PBCommonData";
import BlackJack21JettonCtrl from "../jetton/BlackJack21_JettonCtrl";
import BlackJack21UserInfoCmp from "./BlackJack21_UserInfoCmp";
import {BlackJack21PlayerInfoVo} from "./BlackJack21_PlayerData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21PlayersCtrl extends PBPlayersCtrl {
    allPlayers: BlackJack21Player[] = null;
    activePlayers: BlackJack21Player[] = null;
    emptySeats: cc.Node[] = null;

    onLoad() {
        this.allPlayers = [];
        this.emptySeats = [];

        for (let i = 0; i < facade.dm.playersDm.totalChair; i++) {
            let playerNode = this.node.getChildByName("player_" + i);
            let player = playerNode.addComponent(this.getPlayerCmp());
            player.uiIndex = i;
            player.userInfoCmp = playerNode.getChildByName("user_info_node").addComponent(BlackJack21UserInfoCmp);
            player.userInfoCmp.isSelf = i == 0;

            let handcard =  playerNode.getChildByName("handcard");
            player.handCardCtrl = handcard.getComponent(BlackJack21HandCardCtrl);
            // player.handCardCtrl.init();
            let jetton =  playerNode.getChildByName("jetton");
            player.jettonCtrl = jetton.getComponent(BlackJack21JettonCtrl);
            if( player.jettonCtrl){
                player.jettonCtrl.init();
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

    /** @override */
    initPlayers(pvos: BlackJack21PlayerInfoVo[]) {
        super.initPlayers(pvos);
        if (facade.dm.tableInfo.needSelfReady()) {
            if (facade.dm.tableStatus.currState == PBTableState.MATCH) {
                this.activePlayers.forEach(p => {
                    if (p.playerInfoVo) {
                        p.userInfoCmp.showReadyTip(p.playerInfoVo.isReady);

                    }
                });
            }
        }
    }

    hideTimerBySeat(seatId) {
        let p = this.getPlayerBySeat(seatId);
        if (p) {
            p.userInfoCmp.stopTimeTip();
        }
    }

    /**
     * 通过服务器座位号获得
     * @param seatId
     */
    getPlayerBySeat(seatId){
        for (let i = 0; i < this.activePlayers.length; i++) {
            let p = this.activePlayers[i];
            if (p && p.playerInfoVo && p.playerInfoVo.seatId == seatId) {
                return p;
            }
        }
    }

    getPlayerCmp() {
        return BlackJack21Player;
    }

    /**
     * 设置玩家数
     */
    setChair(cnt = 4) {
        // if (cnt == 2) {
        //     this.activePlayers = [this.allPlayers[0], this.allPlayers[1]];
        // } else if (cnt == 3) {
        //     this.activePlayers = [this.allPlayers[0], this.allPlayers[1], this.allPlayers[2]];
        // } else {
            this.activePlayers = this.allPlayers;
        // }
    }

    /**
     * 加减金币
     * @param coin
     */
    changeCoin(coin, seatId){
        let player = this.getPlayerBySeat(seatId);
        if(player && player.userInfoCmp && player.playerInfoVo){
            player.playerInfoVo.coin = player.playerInfoVo.coin + coin;
            player.userInfoCmp.updateCoin(player.playerInfoVo);
        }
    }

    /**
     *
     * @param coin
     */
    setCoin(coin, seatId){
        let player = this.getPlayerBySeat(seatId);
        if(player && player.userInfoCmp && player.playerInfoVo){
            player.playerInfoVo.coin = coin;
            player.userInfoCmp.updateCoin(player.playerInfoVo);
        }
    }

    cleanRound() {
        super.cleanRound();

        this.allPlayers.forEach(p => {
            p.betCoin = 0;
            p.bSplit = false;
            p.handCardCtrl.cleanRound();
            p.jettonCtrl.cleanRound();
        })
    }


}
