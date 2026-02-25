
// import UnoGameData from "../Uno_GameData";
import UnoLogic from "../Uno_Logic";
import { PBMsgHandler } from "../../../PokerBase/scripts/net/PBMsgHandler";
import UnoGameData = require("../Uno_GameData");
import { UnoPlayer } from "../player/Uno_Player";

export class UnoMsgHandler extends PBMsgHandler {
    dm: UnoGameData;
    gameCtrl: UnoLogic;
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
     * 发牌
     */
    dealCard(dic: any) {
        cc.vv.EventManager.emit("PB_GAME_START");

        this.pauseCmd();
        this.gameCtrl.cleanRound();
        console.log("收到服务器发牌", dic);
        let tableStateus = this.dm.tableStatus;
        tableStateus.dealerUid = dic.dealerUid;
        let cards = dic.cards.concat();
        this.dm.dealCards(cards, dic.activeUid);
        this.gameCtrl.dealCards(dic);
    }

    /**
     * 摸牌
     * @param dic 
     */
    onDraw(dic: any) {
        this.pauseCmd();
        console.log("摸牌", dic);
        if (!dic.spcode) {
            let cards = dic.cards;
            let nextPlayer = this.dm.playersDm.getPlayerByUid(dic.nextUid);
            nextPlayer.state = dic.nextState;
            if (this.dm.playersDm.isSelf(dic.uid)) {
                this.dm.dealCards(cards, dic.uid);
            }
            this.gameCtrl.drawCards(dic);
        } else {
            this.resumeCmd();
        }

    }

    /**
     * 保留牌
     * @param dic 
     */
    onKeep(dic: any) {
        this.pauseCmd();
        console.log("Keep", dic);
        this.gameCtrl.onKeep(dic);
    }

    /**
     * 0x5d 0x5e提前发送命令
     * @param dic 
     */
    preDiscard(dic: any) {
        console.log("preDiscard", dic);
        if (dic.spcode) {
            cc.vv.NetManager.reconnect();
        } else {
            facade.dm.tableStatus.havePreDiscard = true;
        }
    }

    /**
     * 玩家出牌
     */
    playerDiscard(dic: any) {
        this.pauseCmd();
        console.log("玩家出牌", dic);
        this.gameCtrl.userOutCard(dic);
    }

    /**
     * 自己出牌
     */
    selfDiscard(dic: any) {
        this.pauseCmd();
        console.log("自己出牌", dic);
        if (!dic.spcode) {
            this.gameCtrl.userOutCard(dic);
        } else {
            cc.vv.NetManager.reconnect();
        }
    }

    onChallenge(dic: any) {
        this.pauseCmd();
        console.log("质疑", dic);
        if (this.dm.playersDm.isSelf(dic.result.uid)) {
            this.dm.dealCards(dic.result.cards, dic.result.uid);
        }

        this.gameCtrl.onChallenge(dic);
    }

    onUno(dic: any) {
        this.pauseCmd();
        console.log("uno", dic);
        this.gameCtrl.onUno(dic);
    }

    onUnoChallenge(dic: any) {
        this.pauseCmd();
        console.log("uno challenge", dic);
        if (dic.success && this.dm.playersDm.isSelf(dic.ouid)) {
            this.dm.dealCards(dic.cards, dic.ouid);
        }
        this.gameCtrl.onUnoChallenge(dic);
    }

    canChallengeUno(dic: any) {
        console.log("uno", dic);
        this.dm.tableStatus.canChallengeUno = dic.rtype === 1;
        if (dic.rtype === 0) {
            let player = this.gameCtrl.playersCtrl.getPlayerByUid(dic.uid);
            (player as UnoPlayer).setUnoVisible(true);
        }
    }

    /**
     * 小结算
     */
    roundSettlement(dic: any) {
        this.pauseCmd();
        console.log("小结算", dic);
        // 解析记分牌数据

        this.gameCtrl.roundSettlement(dic);
    }

    /**
     * 总结算
     */
    totalSettlement(dic: any) {

        cc.vv.EventManager.emit("PB_GAME_SETTLEMENT");
        this.pauseCmd();
        console.log("总结算", dic);
        this.gameCtrl.totalSettlement(dic);
    }

    /**
     * overwrite
     */
    bindHandler() {
        super.bindHandler();
        this.registerHandler(this.dm.msgCmd.rec_deal, this.dealCard.bind(this), 0);

        this.registerHandler(this.dm.msgCmd.rec_player_discard, this.playerDiscard.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_discard, this.selfDiscard.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_little_settlement, this.roundSettlement.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_total_settlement, this.totalSettlement.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_draw, this.onDraw.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_uno, this.onUno.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_draw, this.onDraw.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_pass, this.onKeep.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_challenge, this.onChallenge.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_uno, this.onUno.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_uno_challenge, this.onUnoChallenge.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_can_uno_challenge, this.canChallengeUno.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.pre_send_discard, this.preDiscard.bind(this), 0);

        this.registerNoCacheHandler(this.dm.msgCmd.send_change, this.recSendChange.bind(this));
        this.registerNoCacheHandler(this.dm.msgCmd.rec_change, this.recChange.bind(this));
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