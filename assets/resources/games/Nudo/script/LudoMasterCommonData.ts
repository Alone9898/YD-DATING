import { PBTableInfo } from "../../PokerBase/scripts/PBCommonData";

export let chessSkinColor = [0, 1, 2, 3, 0, 1, 2, 3]

export let NEXTGAME = {
    MOVE: 1,
    DICE: 2,
};

export let DICEBGLEN = 20;

export class playerRound {
    chess: number[] = [];
    dices: number[] = [];
    isWin: number = 0;
    steps: number[] = [];
    times: number = 0;
    kill: number = 0;
}

export let maxPlayer = 4

export let luckyNum = 6

export let moveDisTime = 0.1
export let diceScaleTime = 0.02
export let leaveHomeTime = 0.5
export let killedTime = 0.5
export let moveAllActDisTime = 0.25

export let finalMax = 3

export class moveStatueData {
    bMoveing: boolean = false;
    moveStep: number = 0;
}

export class commonPos {
    x: number = 0;
    y: number = 0;
}

export class overData {
    x: number = 0;
    y: number = 0;
    finalID: number = 0;
}

export class chessDateArrType {
    posID: number = 0;
    playerID: number = 0;
    statue: number = 0;
    x: number = 0;
    y: number = 0;
}

export let PLAYERTYPE = {
    FIRST: 1,
    SECOND: 2,
    THIRDLY: 3,
    FOURTH: 4,
};

export let CHESSSTATUE = {
    INHOME: 1,
    INROAD: 2,
    OVER: 3,
}

export let stepTotal = 57

//未出来位置
export let chessInHomePos = [
    { pos: [{ x: -385, y: -235 }] },
    { pos: [{ x: -385, y: 395 }] },
    { pos: [{ x: 245, y: 395 }] },
    { pos: [{ x: 245, y: -235 }] },
];

//移动间隔
export let chessMoveDis = 70;
export let chessMoveDisX = 0;
export let chessMoveDisY = -2;

// 处于同一个方格里显示
export let chessInCommonScale = 0.4;
export let chessInCommonDis = 20;
export let chessInCommonPosAdd = 10;
export let chessInCommonPos = [
    { pos: [{ x: -20, y: 0 }] },
    { pos: [{ x: 0, y: 0 }] },
    { pos: [{ x: 20, y: 0 }] },
    { pos: [{ x: -20, y: 20 }] },
    { pos: [{ x: 0, y: 20 }] },
    { pos: [{ x: 20, y: 20 }] },
    { pos: [{ x: -20, y: -20 }] },
    { pos: [{ x: 0, y: -20 }] },
    { pos: [{ x: 20, y: -20 }] },
];

//不同状态下棋子的大小
export let chessScaleCfg = {
    home: 1.3,
    move: 1,
    other: 0.7,
    overlay: 0.6
};
export let chessScaleDis = 0.2
export let chessScaleInit = 1

//到达终点的位置
export let chessSuccessDis = 32;
export let chessSuccessCfg = [
    { posX: 0, posY: 32, disX: 32, disY: 40 },
    { posX: 40, posY: 0, disX: 40, disY: 45 },
];

export let roadMaxSteps = 56

export class playerData {
    uid: number = 0;
    seatId: number = 0;
}

//棋子移动路径
export let chessRoadData1 = [
    { x: -1, y: -6 },
    { x: -1, y: -5 },
    { x: -1, y: -4 },
    { x: -1, y: -3 },
    { x: -1, y: -2 }, //5

    { x: -2, y: -1 },
    { x: -3, y: -1 },
    { x: -4, y: -1 },
    { x: -5, y: -1 },
    { x: -6, y: -1 },
    { x: -7, y: -1 }, //11

    { x: -7, y: 0 }, //12

    { x: -7, y: 1 },
    { x: -6, y: 1 },
    { x: -5, y: 1 },
    { x: -4, y: 1 },
    { x: -3, y: 1 },
    { x: -2, y: 1 }, //18

    { x: -1, y: 2 },
    { x: -1, y: 3 },
    { x: -1, y: 4 },
    { x: -1, y: 5 },
    { x: -1, y: 6 },
    { x: -1, y: 7 }, //24

    { x: 0, y: 7 }, //25

    { x: 1, y: 7 },
    { x: 1, y: 6 },
    { x: 1, y: 5 },
    { x: 1, y: 4 },
    { x: 1, y: 3 },
    { x: 1, y: 2 }, //31

    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 7, y: 1 }, //37

    { x: 7, y: 0 }, //38

    { x: 7, y: -1 },
    { x: 6, y: -1 },
    { x: 5, y: -1 },
    { x: 4, y: -1 },
    { x: 3, y: -1 },
    { x: 2, y: -1 }, //44

    { x: 1, y: -2 },
    { x: 1, y: -3 },
    { x: 1, y: -4 },
    { x: 1, y: -5 },
    { x: 1, y: -6 },
    { x: 1, y: -7 }, //50

    { x: 0, y: -7 }, //51

    { x: 0, y: -6 },
    { x: 0, y: -5 },
    { x: 0, y: -4 },
    { x: 0, y: -3 },
    { x: 0, y: -2 }, //56

    { x: 0, y: 0 },        // 空点
    { x: -1, y: -7 }
];
export let chessRoadData2 = [
    { x: -6, y: 1 },
    { x: -5, y: 1 },
    { x: -4, y: 1 },
    { x: -3, y: 1 },
    { x: -2, y: 1 }, //5

    { x: -1, y: 2 },
    { x: -1, y: 3 },
    { x: -1, y: 4 },
    { x: -1, y: 5 },
    { x: -1, y: 6 },
    { x: -1, y: 7 }, //11

    { x: 0, y: 7 }, //12

    { x: 1, y: 7 },
    { x: 1, y: 6 },
    { x: 1, y: 5 },
    { x: 1, y: 4 },
    { x: 1, y: 3 },
    { x: 1, y: 2 }, //18

    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 7, y: 1 }, //24

    { x: 7, y: 0 }, //25

    { x: 7, y: -1 },
    { x: 6, y: -1 },
    { x: 5, y: -1 },
    { x: 4, y: -1 },
    { x: 3, y: -1 },
    { x: 2, y: -1 }, //31

    { x: 1, y: -2 },
    { x: 1, y: -3 },
    { x: 1, y: -4 },
    { x: 1, y: -5 },
    { x: 1, y: -6 },
    { x: 1, y: -7 }, //37

    { x: 0, y: -7 }, //38

    { x: -1, y: -7 },
    { x: -1, y: -6 },
    { x: -1, y: -5 },
    { x: -1, y: -4 },
    { x: -1, y: -3 },
    { x: -1, y: -2 }, //44

    { x: -2, y: -1 },
    { x: -3, y: -1 },
    { x: -4, y: -1 },
    { x: -5, y: -1 },
    { x: -6, y: -1 },
    { x: -7, y: -1 }, //50

    { x: -7, y: 0 }, //51

    { x: -6, y: 0 },
    { x: -5, y: 0 },
    { x: -4, y: 0 },
    { x: -3, y: 0 },
    { x: -2, y: 0 }, //56

    { x: 0, y: 0 },        // 终点
    { x: -7, y: 1 }
];

//棋子安全坐标对应棋牌位置
export let chessSafePos = [
    { x: -1, y: -6 },
    { x: -5, y: -1 },
    { x: -6, y: 1 },
    { x: -1, y: 5 },
    { x: 1, y: 6 },
    { x: 5, y: 1 },
    { x: 6, y: -1 },
    { x: 1, y: -5 },
];

/**
 * 桌子静态信息
 */
export class LudoMasterTableInfo extends PBTableInfo {
    /**
     * 是否需要在游戏内匹配
     */
    needMatchInGame() {
        return false;
    }
}