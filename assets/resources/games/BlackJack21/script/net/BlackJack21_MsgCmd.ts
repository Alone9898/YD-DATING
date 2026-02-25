import {PBMsgCmd} from "../../../PokerBase/scripts/net/PBMsgCmd";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21MsgCmd extends PBMsgCmd {

    rec_bet_start = 126045; // 游戏开始下注
    rec_deal = 126003;      // 游戏开始发牌
    rec_round_end = 126005; // 回合结束

    send_bet = 25501;       // 下注
    send_stand = 25502;     // 停牌
    send_hit = 25503;       // 要牌
    send_double = 25504;    // 加倍
    send_split = 25505;     // 拆牌
    send_insure = 25506;    // 投保
    rec_insure_end = 126046; //  保险结束

    send_change = 52;   // 换桌
    rec_change = 1083;  // 换桌通知

}
