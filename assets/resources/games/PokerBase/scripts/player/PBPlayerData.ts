import { facade } from "../PBLogic";

/**
 * 玩家静态信息
 */
export class PBUserInfoVo {
    uname: string = "";  // 名称
    gender: number = 0;  // 性别 0女 1:男
    icon: string = "";   // 头像
}

/**
 * 玩家数据
 */
export class PBPlayerInfoVo {
    uid: number = 0;             // 玩家id
    uinfo: PBUserInfoVo = null;
    coin: number = 0;
    winCoinShow: number = 0;     // 输赢金币显示
    leagueLevel: number = 0;
    leaguePoints: number = 0;
    handCards: number[] = [];    // 手牌数据
    restCardLen: number = 0;    // 剩余手牌长度
    seatId: number = -1;          // 在服务器中的位置
    position: number = -1;       // 在客户端的位置
    isReady: boolean = false;
    isOnline: boolean = true;
    autoHost: boolean = false;   // 是否托管
    restTime: number = 0;        // 剩余时间
    currLevel: number = 0;       // 当前等级
    currExp: number = 0;         // 当前经验值
    avatarFrame: string = "avatarframe_0"; // 头像框
    chatSkin: string = "chat_free"; // 聊天泡泡框
    token: string = "";
    svip: number = 0;
    rpScore: number = 0;
    race_id: number = 0;        // 比赛ID
    mic: number = -1;
    joinChat: number = 0;       // 是否加入聊天室

    // 统计相关
    statisticsWinRate = 0; // 胜率
    statisticsWinPlayCnt = 0; // 玩牌局数


    get isRobot() {
        return this.token == "";
    }

    clearRound() {
        this.restCardLen = 0;
        this.handCards = [];
    }

    /**
     * 是否已经坐下
     */
    get isSeated() {
        return this.seatId >= 0;
    }
}

export class PBPlayersDm {
    seatedPlayersInfo: PBPlayerInfoVo[] = [];
    allUserMap: Map<number, PBPlayerInfoVo> = null;
    viewerList: PBPlayerInfoVo[] = []; // 旁观列表
    private _chair: number = 4;
    constructor() {
        this.reset();
    }

    reset() {
        this.seatedPlayersInfo = [];
        this.allUserMap = new Map();
        this.viewerList = [];
    }

    public get chair(): number {
        return this._chair;
    }
    public set chair(value: number) {
        this._chair = value;
    }

    /**
     * 获取自己绝对信息与selfInfo 不用的地方是在allUserMap找不到从观战列表里面找
     */
    get selfAbsInfo() {
        let info = this.selfInfo;
        if (!info) {
            for (let i = 0; i < this.viewerList.length; i++) {
                let viewer = this.viewerList[i];
                if (viewer.uid == cc.vv.UserManager.uid) {
                    info = viewer;;
                }
            }
        }
        return info;
    }

    get selfInfo() {
        return this.allUserMap.get(cc.vv.UserManager.uid);
    }

    set selfInfo(playerInfoVo: PBPlayerInfoVo) {
        this.seatedPlayersInfo[0] = playerInfoVo;
    }

    isSelf(uid: number) {
        if (!this.selfInfo) {
            return false;
        }
        return this.selfInfo.uid == uid;
    }

    getPlayesInfo() {
        return this.seatedPlayersInfo;
    }

    getPlayerCount() {
        let sum = 0;
        for (let i = 0; i < this.seatedPlayersInfo.length; i++) {
            if (this.seatedPlayersInfo[i] && !this.getPlayerInViewerList(this.seatedPlayersInfo[i].uid)) {
                sum++;
            }
        }
        return sum;
    }

    /**
     * 通过玩家id获取玩家对象
     * @param uid
     */
    getPlayerByUid(uid: number) {
        return this.allUserMap.get(uid);
    }

    /**
     * 通过本地位置获取玩家信息
     * @param position
     */
    getPlayerByPosition(position: number) {
        return this.seatedPlayersInfo[position];
    }

    /**
     * 通过seatId获取用户信息
     * @param seatId 在服务器所在的位置
     * @returns {poker.user.TableUserVo}
     */
    getPlayerBySeatId(seatId: number) {
        for (let i = 0; i < this.seatedPlayersInfo.length; i++) {
            let uInfo = this.seatedPlayersInfo[i];
            if (uInfo && uInfo.seatId == seatId) {
                return uInfo;
            }
        }
        return null;
    }

    /**
     * 在观战列表中寻找玩家
     * @param uid 
     * @returns 
     */
    getPlayerInViewerList(uid: number) {
        for (const viewer of this.viewerList) {
            if (viewer.uid === uid) {
                return viewer;
            }
        }
        return null;
    }

    removeSeatedPlayerInViewers() {
        for (const info of this.seatedPlayersInfo) {
            if (info && info.seatId > 0 && this.getPlayerInViewerList(info.uid)) {
                this.viewerList.splice(facade.dm.playersDm.viewerList.indexOf(this.getPlayerInViewerList(info.uid)), 1);
            }
        }
    }

    /**
     * 添加一个用户
     */
    addAUser(playerVo: PBPlayerInfoVo) {
        if (playerVo) {
            let uMap = this.allUserMap;
            if (!uMap.has(playerVo.uid)) {
                uMap.set(playerVo.uid, playerVo)
            } else {
                cc.log('Error, addAUser, but the user is in uMap..');
            }
        }
    }

    /**
     * 观战玩家主动坐下
     * @param uvo 
     */
    sitdown(uid: number, seatid: number) {
        let info = this.viewerList.find((viewer) => {
            if (viewer.uid === uid) {
                return viewer;
            }
            return null;
        })
        if (!info) {
            return;
        }

        info.seatId = seatid;
        this.addAUser(info);
        if (this.selfInfo) {
            this.selfInfo.position = 0;
            this.allUserMap.forEach((p, k) => {
                let diff = p.seatId - this.selfInfo.seatId;
                if (diff < 0) {
                    diff = this.chair + diff;
                }
                p.position = diff;
                this.seatedPlayersInfo[p.position] = p;
            });
        } else {
            info.position = info.seatId - 1;
            this.seatedPlayersInfo[info.position] = info;
        }
        this.cacheUinfo(uid);
    }

    /**
     * 按照客户端逻辑存储用户数据
     * @param uvo
     */
    seat(uvo: PBPlayerInfoVo) {
        // 添加在用户map内数据
        this.addAUser(uvo);
        // 用户数据数组,全量更新!!!!!!
        this.seatedPlayersInfo = [];
        if (this.selfInfo) {
            this.selfInfo.position = 0;
            this.allUserMap.forEach((p, k) => {
                let diff = p.seatId - this.selfInfo.seatId;
                if (diff < 0) {
                    diff = this.chair + diff;
                }
                p.position = diff;
                this.seatedPlayersInfo[p.position] = p;
            });
        } else {
            this.allUserMap.forEach((p, k) => {
                p.position = p.seatId - 1;
                this.seatedPlayersInfo[p.position] = p;
            });
        }
        this.cacheUinfo(uvo.uid);
    }

    async cacheUinfo(uid: number) {
        if (cc.vv.LoginData) return;
        try {
            // @ts-ignore
            cc.vv.NetManager.cache({ c: MsgId.PERSIONAL_INFO, otheruid: uid }, true);
        } catch (error) {
            cc.log("#请求用户缓存信息错误#");
        }
    }

    /**
     * 座位是否已满
     */
    seatIsFull() {
        return this.allUserMap.size == this.chair;
    }

    /**
     * 移除一个用户
     * @param uid
     */
    removeAUser(uid: number) {
        this.allUserMap.delete(uid);
        for (let i = 0; i < this.seatedPlayersInfo.length; i++) {
            let p = this.seatedPlayersInfo[i];
            if (p && p.uid == uid) {
                this.seatedPlayersInfo[i] = null;
                break;
            }
        }
    }

    /**
     * 获取玩家手牌长度
     * @param position
     */
    getPlayerHandCardsCnt(position: number) {
        let p = this.getPlayerByPosition(position);
        return p.restCardLen;
    }

    /**
     * 获得玩家手牌
     * @param position
     */
    getPlayerHandCards(position: number) {
        let p = this.getPlayerByPosition(position);
        return p.handCards;
    }

    /**
     * 用户准备
     * @param uid
     */
    userReady(uid: number) {
        let p = this.getPlayerByUid(uid);
        p.isReady = true;
    }

    /**
     * 填充玩家手牌
     * @param position
     * @param cards
     * @param reset
     */
    fillCards(position: number, cards: number[], reset = false) {
        let pvo = this.seatedPlayersInfo[position];
        if (reset) {
            pvo.handCards = [];
            pvo.restCardLen = 0;
        }
        pvo.handCards.push(...cards);
        this.seatedPlayersInfo[position].restCardLen += cards.length;
    }

    /**
     * 移除打出的牌
     * @param position
     * @param cards
     */
    removeCards(position: number, cards: number[]) {
        let p = this.getPlayerByPosition(position);
        if (position == 0) {
            let handCards = p.handCards;
            for (let i = 0; i < cards.length; i++) {
                let index = handCards.indexOf(cards[i]);
                if (index !== -1) {
                    handCards.splice(index, 1);
                }
            }
        }
        if (cards) {
            p.restCardLen -= cards.length;
        }
    }

    /**
     * 判断玩家是否在房间内
     */
    checkPlayerInTable(uid: number) {
        if (!uid) {
            return;
        }
        if (this.allUserMap.has(uid)) {
            return true;
        }
        if (this.viewerList) {
            for (let i = 0; i < this.viewerList.length; i++) {
                let p = this.viewerList[i];
                if (p && p.uid == uid) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 获取房间内所有玩家的uid
     */
    getAllPlayerIdsInTable() {
        let uids: number[] = [];
        this.seatedPlayersInfo.forEach(p => {
            if (p && !uids.includes(p.uid)) {
                uids.push(p.uid);
            }
        })
        this.viewerList && this.viewerList.forEach(p => {
            if (p && !uids.includes(p.uid)) {
                uids.push(p.uid);
            }
        });
        return uids;
    }

    /**
     * 检测玩家是否在观战列表中
     */
    checkPlayerIsViewer(uid: number) {
        if (!this.viewerList) {
            return false;
        }
        for (let i = 0; i < this.viewerList.length; i++) {
            if (this.viewerList[i].uid == uid) {
                return true;
            }
        }
        return false;
    }

    /**
     * 把坐下的玩家从观战列表中移除
     */
    clearSeatedFromViewer() {
        for (let i = 0; i < this.viewerList.length; i++) {
            let p = this.viewerList[i];
            if (p.isSeated) {
                this.viewerList.splice(i, 1);
                i--;
            }
        }
    }


    caculateSeatIdByPosition(position: number) {
        let target = -1;
        for (let i = 0; i < this.seatedPlayersInfo.length; i++) {
            let info = this.seatedPlayersInfo[i];
            if (info) {
                let seatid = info.seatId;
                let pos = info.position;
                let diff = position - info.position;
                target = info.seatId + diff;
                if (target > this.chair) {
                    target -= this.chair;
                } else if (target < 0) {
                    target += this.chair;
                }
                break;
            }
        }
        return target;
    }
}