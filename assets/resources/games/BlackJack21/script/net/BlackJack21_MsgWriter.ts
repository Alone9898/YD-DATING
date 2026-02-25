import {PBMsgWriter} from "../../../PokerBase/scripts/net/PBMsgWriter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21MsgWriter extends PBMsgWriter {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    /**
     * 发送押注
     * @param bet
     */
    sendBet(bet:number){
        cc.log(">sendBet");
        let req = {
            c: facade.dm.msgCmd.send_bet,
            betcoin: bet
        };
        this.sendData(req);
    }

    /**
     * 发送分牌
     */
    sendSplit(){
        cc.log(">sendSplit");
        let req = {
            c: facade.dm.msgCmd.send_split,
        };
        this.sendData(req);
    }

    /**
     * 发送双倍下注
     */
    sendDouble(){
        cc.log(">sendDouble");
        let req = {
            c: facade.dm.msgCmd.send_double,
        };
        this.sendData(req);
    }

    /**
     * 发送抓牌
     */
    sendHit(){
        cc.log(">sendHit");
        let req = {
            c: facade.dm.msgCmd.send_hit,
        };
        this.sendData(req);
    }

    /**
     * 发送结束抓牌
     */
    sendStand(){
        cc.log(">sendStand");
        let req = {
            c: facade.dm.msgCmd.send_stand,
        };
        this.sendData(req);
    }

    /**
     * 发送拒绝投保
     */
    sendDont(){
        cc.log(">sendDont");
        let req = {
            c: facade.dm.msgCmd.send_insure,
            choice:0
        };
        this.sendData(req);
    }

    /**
     * 发送参与投保
     */
    sendInsurance(){
        cc.log(">sendInsurance");
        let req = {
            c: facade.dm.msgCmd.send_insure,
            choice:1
        };
        this.sendData(req);
    }

    /**
     * 换桌
     */
    sendChange(){
        cc.log(">sendCharge");
        let req = {
            c: facade.dm.msgCmd.send_change,
            uid:cc.vv.UserManager.uid,
        };
        this.sendData(req);
    }

    // update (dt) {}
}
