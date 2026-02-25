/**
 * 消息命令号定义
 * 命令号变量命命名规则：
 *  R   --表示接收用
 *  S   --表示发送用
 *  SR  --表示发送接收公用
 */
export class PBMsgCmd {
    _R_ENTER_ROOM = 43;                // 进入房间
    get R_ENTER_ROOM() { return this._R_ENTER_ROOM };

    _R_ROOM_DISMISS = 126012;          // 房间已经解散
    get R_ROOM_DISMISS() { return this._R_ROOM_DISMISS };

    _S_APPLY_DISMISS = 25712;   // 发起解散
    get S_APPLY_DISMISS() { return this._S_APPLY_DISMISS };
    _R_PLAYER_APPLY_DISMISS = 126015;   // 玩家申请解散
    get R_PLAYER_APPLY_DISMISS() { return this._R_PLAYER_APPLY_DISMISS };

    _S_REPLY_DISMISS = 25713;   // 同意/拒绝 解散
    get S_REPLY_DISMISS() { return this._S_REPLY_DISMISS };
    _R_PLAYER_REPLY_DISMISS = 126016;   // 玩家选择(拒绝/同意)解散
    get R_PLAYER_REPLY_DISMISS() { return this._R_PLAYER_REPLY_DISMISS };

    _R_PLAYER_ENTER_ROOM = 126001;     // 玩家进入房间
    get R_PLAYER_ENTER_ROOM() { return this._R_PLAYER_ENTER_ROOM };

    _R_PLAYER_EXIT_ROOM = 126011;      // 玩家退出房间
    get R_PLAYER_EXIT_ROOM() { return this._R_PLAYER_EXIT_ROOM };

    _S_AUTO_HOST = 25718;              // 主动托管命令
    get S_AUTO_HOST() { return this._S_AUTO_HOST };

    _R_AUTO_HOST = 126004;             // 用户托管状态改变
    get R_AUTO_HOST() { return this._R_AUTO_HOST };

    _S_CANCLE_AUTO_HOST = 25707;       // 取消托管
    get S_CANCLE_AUTO_HOST() { return this._S_CANCLE_AUTO_HOST };

    _S_CHAT_MSG = 25705;               // 发送聊天消息
    get S_CHAT_MSG() { return this._S_CHAT_MSG };

    _R_CHAT_MSG = 100202;              // 收到聊天消息
    get R_CHAT_MSG() { return this._R_CHAT_MSG };

    _S_EXIT = 25706;                   // 发送退出房间
    get S_EXIT() { return this._S_EXIT };

    _R_PLAYER_READY = 126002;          // 玩家准备
    get R_PLAYER_READY() { return this._R_PLAYER_READY };

    _S_READY = 25708;                  // 发送准备
    get S_READY() { return this._S_READY };

    _R_COUNTDOWN_START = 126020;    // 开始倒计时
    get R_COUNTDOWN_START() { return this._R_COUNTDOWN_START };

    _R_COUNTDOWN_STOP = 126021;     // 停止倒计时
    get R_COUNTDOWN_STOP() { return this._R_COUNTDOWN_STOP };

    _S_VOICE_CHANGE = 25734;                   // 语音状态改变
    get S_VOICE_CHANGE() { return this._S_VOICE_CHANGE };

    _R_VOICE_CHANGE = 126043;                   // 广播语音改变
    get R_VOICE_CHANGE() { return this._R_VOICE_CHANGE };

    _S_SITDOWN = 25719;     // 坐下
    get S_SITDOWN() { return this._S_SITDOWN };

    _R_PLAYER_SITDOWN = 126026;     // 广播玩家坐下
    get R_PLAYER_SITDOWN() { return this._R_PLAYER_SITDOWN };

    _R_ENTER_VIEWER = 126028;       // 广播有观战玩家进入
    get R_ENTER_VIEWER() { return this._R_ENTER_VIEWER };

    _R_PLAYER_EXIT = 126029;        // 有玩家退出
    get R_PLAYER_EXIT() { return this._R_PLAYER_EXIT };

    _R_UPDATE_PLAYER_INFO = 126030;     // 更新玩家信息
    get R_UPDATE_PLAYER_INFO() { return this._R_UPDATE_PLAYER_INFO };

    _R_TIPS_COIN_RECHARDGE = 126032;     // 金币充值提示
    get R_TIPS_COIN_RECHARDGE() { return this._R_TIPS_COIN_RECHARDGE };

    _R_GAME_DISMISS_CANCEL = 126042;     // 房间解散取消
    get R_GAME_DISMISS_CANCEL() { return this._R_GAME_DISMISS_CANCEL };

    send_change = 52;   // 换桌
    rec_change = 1083;  // 换桌通知
}

/**
 * post选相关命令
 */
export let PBPostCmd = {
    USER_INTERACTIVE: 361, // 使用互动道具
    QUERY_TIMES_EMOTION_INFO: 414, // 查询次数道具信息
}