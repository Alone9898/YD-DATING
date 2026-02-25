import { PBMsgCmd } from "../../../PokerBase/scripts/net/PBMsgCmd";

export class DominoMsgCmd extends PBMsgCmd {
    GAME_START = 126003;               // 游戏开始
    RECV_DISCARD_CARD = 126007;            // 收到出牌
    SEND_DISCARD_CARD = 25702;      // 出牌
    PASS = 25715;               // 跳过
    SETTLEMENT = 126005;        // 结算
    QUIT_HALL = 126006;   // 别的游戏的大结算，domino没有大结算所以收到这个消息直接退到大厅
    SITDOWN = 25719;       // 观战时坐下
}