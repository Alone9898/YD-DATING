import { PBMsgCmd } from "../../../PokerBase/scripts/net/PBMsgCmd";

export class UnoMsgCmd extends PBMsgCmd {
    rec_deal = 126003;              // 收到服务器发牌
    send_discard = 25702;           // 发送出牌
    rec_player_discard = 126007;    // 广播玩家出牌
    rec_little_settlement = 126005; // 小结算
    rec_total_settlement = 126006;  // 大结算
    send_draw = 25703;              // 摸牌
    rec_draw = 126008;              // 广播摸牌
    send_uno = 25725;               // uno
    rec_uno = 127404;               // 广播uno
    send_challenge = 25727;          // 质疑
    rec_challenge = 127406;          // 广播质疑
    send_uno_challenge = 25726;         // uno challenge
    rec_uno_challenge = 127405;         // 广播challenge
    send_pass = 25715;              // pass
    rec_pass = 126031;              // 广播pass
    rec_can_uno_challenge = 127407; // 广播是否可以被挑战
    pre_send_discard = 25728;       // 0x5d 0x5e需要提前发送此命令
}
