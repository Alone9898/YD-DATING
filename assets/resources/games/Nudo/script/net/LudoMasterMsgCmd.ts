import { PBMsgCmd } from "../../../PokerBase/scripts/net/PBMsgCmd";

export class LudoMasterMsgCmd extends PBMsgCmd {
    PLAY_DICE = 26901;                  // 自己摇骰子回包
    BROADCAST_PLAY_DICE = 126901;       // 其他玩家摇骰子的数据

    MOVE_DICE = 26902;                  // 棋子移动
    BROADCAST_MOVE_DICE = 126902;       // 广播棋子移动的数据

    LUDO_RE_PLAY = 26904;               // 重新摇骰子

    GAME_OVER = 126006;                 // 游戏结算
    FRIENDS_ROOM = 26903;               // 好友房
    BROADCAST_FRIENDS_ROOM = 126002;    // 广播好友房状态
    GAME_START = 126003;                // 游戏开始

    PLAYER_OVER_RESET_DICE = 126044;        // Ludo玩家结束重置色子
}