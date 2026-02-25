/**
 * 游戏类型
 */
export enum PBRoomType {
    normal = 1,      // 普通匹配房
    vip = 2,        // vip房
    league = 3,     // 排位房
    club = 4,       // 俱乐部房间
    friend = 5,     // 好友房
    match = 6,      // 比赛房
}

/**
 * 桌子状态
 */
export enum PBTableState {
    OTHER = 0,   // 过度状态，无法操作
    MATCH = 1,   // 匹配状态
    READY = 2,   // 准备阶段
    PLAY = 3,    // 玩牌阶段
    SETTLE = 4,  // 小结算状态
    GAMEOVER = 5,// 游戏结束
    BIDDING = 6, // 叫牌阶段
    SHOWCARD = 7, // 亮牌阶段
    ChooseGameRule = 8, // 庄家选择游戏规则阶段
    SWITCH_CARD = 9, // 换牌阶段
    CHOOSE_INIT_SCORE = 10,     // 选择分数阶段
}

/**
 * 桌子状态
 */
export enum PBUserState {
    Wait = 1,  // 等待状态
    Ready = 2,  // 准备阶段
    Bidding = 3,  // 叫牌阶段
    Discard = 4,  // 出牌阶段(ludo:走棋子)
    ChooseSuit = 5,  // 选择花色阶段
    Draw = 6,  // 摸牌阶段 (ludo:摇骰子状态)
    ChooseMethod = 7,  // 选择玩法阶段
    ChooseShowCard = 8,  // 选择亮牌
    DashCall = 9,  // dash call 阶段
    ChooseScore = 10,  // 选择期望分数
    ChooseRule = 11,  // 选择游戏规则
    SwitchCard = 12,  // 换牌
    ChooseInitScore = 13,  // 选择初始化分数
    GoDown = 14,  // hand类似游戏中摸了上家牌，必须godown
    ConCan = 15,  // 选择concan阶段
    Response = 19,  // 玩家响应操作
    ChooseCard = 20,        // 选择卡牌操作
    ChooseUser = 21,        // 选择玩家操作
}



/**
 * 游戏流程状态 客户端自己定义的
 */
export enum PBFlowState {
    init = 0,               // 初始化
    match = 1,              // 匹配阶段
    ready = 2,              // 准备阶段 非匹配房用到
    playing = 3,            // 游戏进行中
    round_settlement = 4,   // 小结算
    total_settlement = 5,   // 大结算
    countdown = 6,          // 倒计时阶段
}

/**
 * 桌子静态信息
 */
export class PBTableInfo {
    gameId = 0;             // 游戏id
    tableId = 0;            // 桌子id
    entryCoin = 500;        // 进入金币
    prize = 900;            // 胜利获得的奖励
    roomType = 3;           // 游戏类型
    createTime = 0;         // 创建时间
    maxRound = 1;           // 最大局数
    isOpenVoice = false;    // 是否打开语音
    turnTime = 10;          // 单轮操作时间
    pwd = "";               // 牌桌密码
    isViewer = 0;           // 是否是观战 0:非观战 1:观战
    maxScore = 0;           // 结束分

    /**
     * 俱乐部房和好友房需要自己准备
     */
    needSelfReady() {
        return this.roomType == PBRoomType.club || this.roomType == PBRoomType.friend;
    }

    /**
     * 是否需要在游戏内匹配
     */
    needMatchInGame() {
        return !this.needSelfReady();
    }
}

/**
 * 桌子状态
 */
export class PBTableStatus {
    dealerUid: number = 0;           // 庄家id
    isReconnect: boolean = false;    // 是否是重连状态
    isStart = false;                 // 游戏是否开始
    isCmp: boolean = false;          // 是否打完
    currRound: number = 0;           // 当前局数
    canDrawCard: boolean = false;    // 是否可抓牌
    canOutCard: boolean = false;     // 是否可出牌
    currStatus: PBTableState = 0;    // 当前服务器状态-用于重连
    activeSeat = 0;                  // 当前活坐位 重连时用到
    _flowState: PBFlowState = 0;     // 游戏流程状态
    isDismiss = false;               // 是否已经解散

    reset() {
        this.dealerUid = 0;
        this.isReconnect = false;
        this.currStatus = 0;         // 当前服务器状态-用于重连
        this.currRound = 0;
        this.canDrawCard = false;
        this.canOutCard = false;
        this.isStart = false;
        this._flowState = PBFlowState.init;
    }

    /**
     * 牌局是否已经开始
     */
    get isPlaying() {
        return this._flowState == PBFlowState.playing || this._flowState === PBFlowState.round_settlement || this._flowState == PBFlowState.countdown;
    }

    get flowState() {
        return this._flowState;
    }
    set flowState(state: PBFlowState) {
        if (this._flowState != state) {
            this._flowState = state;
            Global.dispatchEvent("EVENT_FLOW_STATE_CHANGE", this._flowState);
        }
    }

    /**
     * 重置单局数据
     */
    resetRound() {
        this.canOutCard = false;
        this.canDrawCard = false;

    }
}
