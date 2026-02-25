import {PBMsgHandler} from "../../../PokerBase/scripts/net/PBMsgHandler";
import BlackJack21GameData from "../BlackJack21_GameData";
import BlackJack21Logic from "../BlackJack21_Logic";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21MsgHandler extends PBMsgHandler {
    dm: BlackJack21GameData;
    gameCtrl: BlackJack21Logic;

    bindHandler() {
        super.bindHandler();

        this.registerHandler(this.dm.msgCmd.rec_bet_start, this.recBetStart.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_deal, this.recDealMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_round_end, this.recRoundEnd.bind(this), 0);

        this.registerHandler(this.dm.msgCmd.send_bet, this.recBetMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_split, this.recSplitMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_hit, this.recHitMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_stand, this.recStandMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_double, this.recDoubleMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.send_insure, this.recInsureMsg.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_insure_end, this.recInsureEndMsg.bind(this), 0);

        this.registerHandler(this.dm.msgCmd.send_change, this.recSendChange.bind(this), 0);
        this.registerHandler(this.dm.msgCmd.rec_change, this.recChange.bind(this), 0);

    }

    /**
     * 游戏开始下注
     * @param dic
     */
    recBetStart(dic){
        this.pauseCmd();
        console.log("开始下注", dic);
        this.gameCtrl.recBetStart(dic);
    }

    /**
     * 收到发牌
     * @param dic
     */
    recDealMsg(dic: any){
        this.pauseCmd();
        console.log("收到发牌", dic);
        this.gameCtrl.dealCards(dic);
    }

    /**
     * 玩家押注
     * @param dic
     */
    recBetMsg(dic: any){
        console.log("玩家押注", dic);
        if(dic.spcode==0) {
            this.gameCtrl.recBetMsg(dic);
        }
    }

    /**
     * 玩家分牌
     * @param dic
     */
    recSplitMsg(dic: any){
        this.pauseCmd();
        console.log("玩家分牌", dic);
        if(dic.spcode==0) {
            this.gameCtrl.recSplitMsg(dic);
        }
    }

    /**
     * 玩家要牌
     * @param dic
     */
    recHitMsg(dic: any){
        this.pauseCmd();
        console.log("玩家要牌", dic);
        if(dic.spcode==0) {
            this.gameCtrl.recHitMsg(dic);
        }
    }

    /**
     * 玩家结束抓牌
     * @param dic
     */
    recStandMsg(dic: any){
        this.pauseCmd();
        console.log("玩家停牌", dic);
        if(dic.spcode==0) {
            this.gameCtrl.recStandMsg(dic);
        }
    }

    /**
     * 玩家双倍押注
     * @param dic
     */
    recDoubleMsg(dic: any){
        this.pauseCmd();
        console.log("双倍押注", dic);
        if(dic.spcode==0) {
            this.gameCtrl.recDoubleMsg(dic);
        }
    }

    /**
     * 玩家投保
     * @param dic
     */
    recInsureMsg(dic: any){
        this.pauseCmd();
        console.log("投保", dic);
        if(dic.spcode==0) {
            this.gameCtrl.recInsureMsg(dic);
        }
    }

    /**
     * 保险结算
     * @param dic
     */
    recInsureEndMsg(dic: any){
        this.pauseCmd();
        console.log("保险结算", dic);
        this.gameCtrl.recInsureEndMsg(dic);
    }

    /**
     * 小结算
     * @param dic
     */
    recRoundEnd(dic: any){
        this.pauseCmd();
        console.log("小结算", dic);
        this.gameCtrl.recRoundEnd(dic);
    }


    /**
     * 语音状态改变
     * @param msg
     */
    onVoiceChanged(msg: any) {
        console.log("onVoiceChanged", msg);
        // if (this.gameCtrl.voiceCtrl) {
        //     this.gameCtrl.voiceCtrl.R_VOICE_CHANGE(msg);
        // }
    }

    /**
     * 玩家退出房间
     */
    playerExit(dic: any) {
        if(dic.spcode == 1104 && dic.uuid == cc.vv.UserManager.uid){ // 换桌退房 --自己不用退出房间

        } else {
            super.playerExit(dic);
        }
    }

    /**
     * 换桌
     * @param dic
     */
    recSendChange(dic){
        if(dic.spcode == 1){
            cc.vv.FloatTip.show("No more tables available now");
        } else if(dic.spcode == 2){
            cc.vv.FloatTip.show("Only matching rooms can be exchanged");
        } else if(dic.spcode == 3){
            cc.vv.FloatTip.show("The player is not in the room");
        } else {
            this.gameCtrl.changeTable();
        }
    }

    /**
     * 换桌
     * @param dic
     */
    recChange(dic){
        if(dic.code==200 && dic.gameid == 255) {
            // this.gameCtrl.changeTable(dic);
            dic.deskinfo.deskFlag = 1 //重新走断线重连的逻辑即可
            cc.vv.gameData.init(dic.deskinfo);
        }
        else {
            facade.gotoHall();
        }
    }

    // update (dt) {}
}
