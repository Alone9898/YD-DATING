cc.Class({
    extends: cc.Component,
    statics: {
        // 游戏名称 与沙龙图标配置
        gameMap: [
            { gameid: 265, get title() { return ___("Domino") }, bBetSelect: true,bDownload:true },
            { gameid: 269, get title() { return ___("Ludo") }, bBetSelect: true,bDownload:true  },
            { gameid: 287, get title() { return ___("UNO") }, bBetSelect: true,bDownload:true  }, //选择押注场次的游戏(Poker)
            { gameid: 11, get title() { return "Andar Bahar" }, bTableSelect: true,bDownload:true  },//选择游戏房间的游戏
            { gameid: 12, get title() { return "Crash" }, bTableSelect: true,bDownload:true  },
            { gameid: 13, get title() { return "Jhandi Munda" }, bTableSelect: true,bDownload:true  },
            { gameid: 14, get title() { return "Horse Racing" }, bTableSelect: true,bDownload:true  },
            { gameid: 15, get title() { return "Wingo Lottery" }, bTableSelect: true,bDownload:true  },
            { gameid: 16, get title() { return "Fortune Wheel" }, bTableSelect: true,bDownload:true  },
            { gameid: 17, get title() { return "Dragon VS Tiger" }, bTableSelect: true,bDownload:true  },
            { gameid: 18, get title() { return "Roulette" }, bTableSelect: true,bDownload:true  },
            { gameid: 19, get title() { return "Baccarat" }, bTableSelect: true,bDownload:true  },
            { gameid: 20, get title() { return "7 Up Down" }, bTableSelect: true,bDownload:true  },
            { gameid: 21, get title() { return "Aladdin's Blessing" }, bTableSelect: true,bDownload:true  },
            { gameid: 22, get title() { return "Aviator" }, bTableSelect: true,bDownload:true  },
            { gameid: 23, get title() { return "Aviatrix" }, bTableSelect: true,bDownload:true  },
            { gameid: 24, get title() { return "CrashX" }, bTableSelect: true,bDownload:true  },
            { gameid: 25, get title() { return "CricketX" }, bTableSelect: true,bDownload:true  },
            { gameid: 26, get title() { return "JetX" }, bTableSelect: true,bDownload:true  },
            { gameid: 27, get title() { return "Zeppelin" }, bTableSelect: true,bDownload:true  },
            { gameid: 28, get title() { return "Dice" }, bTableSelect: true,bDownload:true  },
            { gameid: 29, get title() { return "Limbo" }, bTableSelect: true,bDownload:true  },
            { gameid: 30, get title() { return "PLinko" }, bTableSelect: true,bDownload:true  },
            { gameid: 31, get title() { return "Keno" }, bTableSelect: true,bDownload:true  },
            { gameid: 32, get title() { return "Mines" }, bTableSelect: true,bDownload:true  },
            { gameid: 33, get title() { return "Hilo" }, bTableSelect: true,bDownload:true  },
            { gameid: 34, get title() { return "Towers" }, bTableSelect: true,bDownload:true  },
            { gameid: 35, get title() { return "DoubleRoll" }, bTableSelect: true,bDownload:true  },
            { gameid: 36, get title() { return "Coins" }, bTableSelect: true,bDownload:true  },
            { gameid: 37, get title() { return "Crypto" }, bTableSelect: true,bDownload:true  },
            { gameid: 38, get title() { return "Triple" }, bTableSelect: true,bDownload:true  },
            { gameid: 39, get title() { return "Cappadocia" }, bTableSelect: true,bDownload:true  },
            { gameid: 255, get title() { return "Black Jack" }, bBetSelect: true,bDownload:true  },
            { gameid: 291, get title() { return "Teen Patti" }, bBetSelect: true, },
            { gameid: 292, get title() { return "Rummy" }, bBetSelect: true, },
            { gameid: 293, get title() { return "Poker" }, bBetSelect: true,bDownload:true  },
        ],

        salonGamesList: [292, 255, 265, 269, 287, 291, 293],

        // 所有游戏的gameid
        allGameIds() {
            let tempList = [];
            for (const item of this.gameMap) {
                tempList.push(item.gameid);
            }
            return tempList;
        },

        allBetSelectIds() {
            let tempList = [];
            for (const item of this.gameMap) {
                if (item.bBetSelect) {
                    tempList.push(item.gameid);
                }
            }
            return tempList;
        },

        allTableSelectIds() {
            let tempList = [];
            for (const item of this.gameMap) {
                if (item.bTableSelect) {
                    tempList.push(item.gameid);
                }
            }
            return tempList;
        },

        // matchRuleConfig: [
        //     { gameid: 265, rule: [[___("累积让其他玩家pass次数"), ___("在Domino游戏中获得最多的让其他玩家pass次数"), ___("每一次pass计入一次成绩，以总pass次数进行排名"), ___("比赛总时长为{1}分钟")], [___("累积胜利次数"), ___("在Domino游戏中获得最多的累积胜利次数"), ___("每一次胜利计入一次成绩，以总胜利次数进行排名"), ___("比赛总时长为{1}分钟")]] },
        //     { gameid: 257, rule: [[___("累积go down牌张数"), ___("在Hand游戏中获得最多的累积go down牌张数"), ___("每一张牌计入一次成绩，以总张数进行排名"), ___("比赛总时长为{1}分钟")], [___("累积获得分数"), ___("在Hand游戏中获得最多的累积分数"), "每一次胜利分数计入成绩，以总分数进行排名", "比赛总时长为{1}分钟"]] },
        //     { gameid: 256, rule: [["累积获得分数", "在Baloot游戏中获得最多的累积分数", "每一小局分数计入成绩，以总分数进行排名", "比赛总时长为{1}分钟"], ["累积比牌获胜次数", "在Baloot游戏中获得最多的累积比牌获胜次数", "每比牌获胜计入一次成绩，以总分数进行排名", "比赛总时长为{1}分钟"]] },
        //     { gameid: 264, rule: [["累积获得分数", "在Estimation游戏中获得最多的累积分数", "每一小局分数计入成绩，以总分数进行排名", "比赛总时长为{1}分钟"]] },
        // ],

        getMatchRule(gameid, duration) {
            let matchRuleConfig = [{ gameid: 265, rule: [[___("累积让其他玩家pass次数"), ___("在Domino游戏中获得最多的让其他玩家pass次数"), ___("每一次pass计入一次成绩，以总pass次数进行排名"), ___("比赛总时长为{1}分钟", duration)], [___("累积胜利次数"), ___("在Domino游戏中获得最多的累积胜利次数"), ___("每一次胜利计入一次成绩，以总胜利次数进行排名"), ___("比赛总时长为{1}分钟", duration)]] },
            { gameid: 257, rule: [[___("累积go down牌张数"), ___("在Hand游戏中获得最多的累积go down牌张数"), ___("每一张牌计入一次成绩，以总张数进行排名"), ___("比赛总时长为{1}分钟", duration)], [___("累积获得分数"), ___("在Hand游戏中获得最多的累积分数"), ___("每一次胜利分数计入成绩，以总分数进行排名"), ___("比赛总时长为{1}分钟", duration)]] },
            { gameid: 256, rule: [[___("累积获得分数"), ___("在Baloot游戏中获得最多的累积分数"), ___("每一小局分数计入成绩，以总分数进行排名"), ___("比赛总时长为{1}分钟", duration)], [___("累积比牌获胜次数"), ___("在Baloot游戏中获得最多的累积比牌获胜次数"), ___("每比牌获胜计入一次成绩，以总分数进行排名"), ___("比赛总时长为{1}分钟", duration)]] },
            { gameid: 264, rule: [[___("累积获得分数"), ___("在Estimation游戏中获得最多的累积分数"), ___("每一小局分数计入成绩，以总分数进行排名"), ___("比赛总时长为{1}分钟", duration)], [___("累积获得分数"), ___("在Estimation游戏中获得最多的累积分数"), ___("每一小局分数计入成绩，以总分数进行排名"), ___("比赛总时长为{1}分钟", duration)]] },
            {
                gameid: 291, rule: [["Cumulative wins", "Get the most cumulative wins in a Teenpatti game", "Each victory counts as a score, and the ranking is based the total number of victories", `The total duration of the game is ${duration} minutes`],
                ["Accumulate the number of pairs of cards obtained", "Get the most passes in a Teenpatti game", "Each pass counts as a score,and the ranking is based the total number of pairs of cards", `The total duration of the game is ${duration} minutes`]]
            },
            ];

            for (const item of matchRuleConfig) {
                if (item.gameid === gameid) {
                    return item.rule;
                }
            }
            return null;
        },

        // 联赛奖励配置
        leagueRewardConfig: [
            { level: 7, get name() { return ___("传奇") }, rewards: [{ type: 1, count: 100000 }, { type: 25, count: 500 }, { type: 43, img: "avatarframe_s_c_1", count: 1, days: 7 }] },
            { level: 6, get name() { return ___("大师") }, rewards: [{ type: 1, count: 50000 }, { type: 25, count: 400 }, { type: 43, img: "avatarframe_s_d_1", count: 1, days: 7 }] },
            { level: 5, get name() { return ___("钻石") }, rewards: [{ type: 1, count: 30000 }, { type: 25, count: 300 }] },
            { level: 4, get name() { return ___("铂金") }, rewards: [{ type: 1, count: 20000 }, { type: 25, count: 200 }] },
            { level: 3, get name() { return ___("黄金") }, rewards: [{ type: 1, count: 10000 }, { type: 25, count: 100 }] },
            { level: 2, get name() { return ___("白银") }, rewards: [{ type: 1, count: 5000 }, { type: 25, count: 50 }] },
            { level: 1, get name() { return ___("青铜") }, rewards: [{ type: 1, count: 1000 }] },
        ],
        getLeagueRewards(level) {
            for (const item of this.leagueRewardConfig) {
                if (item.level == level) {
                    return item.rewards;
                }
            }
        },
        // 联赛段位配置
        rankConfig: [
            { get text() { return ___("青铜") }, stage: 1, level: 1, score: 0, levelStr: "" },
            { get text() { return ___("白银") }, stage: 2, level: 1, score: 1000, levelStr: "" },
            { get text() { return ___("黄金") }, stage: 3, level: 1, score: 10000, levelStr: "" },
            { get text() { return ___("铂金") }, stage: 4, level: 1, score: 20000, levelStr: "" },
            { get text() { return ___("钻石_") }, stage: 5, level: 1, score: 40000, levelStr: "" },
            { get text() { return ___("大师") }, stage: 6, level: 1, score: 60000, levelStr: "" },
            { get text() { return ___("传奇") }, stage: 7, level: 1, score: 100000, levelStr: "", },
        ],
        // VIP最大级别
        max_vip: 20,
        // VIP配置
        vipInfoConfig: [
            { expup: 0, friendadd: 0, freeRank: 1, room: 2, emoj: "1_sz", gift: { img: "gift_cake", count: 1 }, tickets: 1, rewards: [{ type: 25, count: 5 }], view: [0, 2, 4, 5, 6] },
            { expup: 1000, friendadd: 0, freeRank: 1, room: 3, emoj: "1_sz", avatarframe: "avatarframe_v_0", tickets: 1, rewards: [{ type: 25, count: 8 }], view: [0, 2, 4, 5, 6] },
            { expup: 2000, friendadd: 0, freeRank: 1, room: 3, emoj: "1_sz", gift: { img: "gift_hookah", count: 1 }, tickets: 1, rewards: [{ type: 25, count: 10 }], view: [0, 2, 4, 5, 6] },
            { expup: 3000, friendadd: 0, freeRank: 1, room: 3, emoj: "1_sz", gift: { img: "gift_kiss", count: 1 }, tickets: 2, rewards: [{ type: 25, count: 12 }], view: [0, 2, 4, 5, 6] },
            { expup: 5000, friendadd: 0, freeRank: 1, room: 3, emoj: "1_sz", gift: { img: "gift_cake", count: 2 }, tickets: 2, rewards: [{ type: 25, count: 15 }], view: [0, 2, 4, 5, 6] },
            { expup: 10000, friendadd: 150, freeRank: 1, room: 3, emoj: "2_gp", gift: { img: "gift_hookah", count: 2 }, tickets: 3, rewards: [{ type: 25, count: 18 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_205" },
            { expup: 20000, friendadd: 150, freeRank: 1, room: 4, emoj: "2_gp", avatarframe: "avatarframe_v_6", tickets: 3, rewards: [{ type: 25, count: 20 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_206" },
            { expup: 50000, friendadd: 200, freeRank: 1, room: 4, emoj: "3_zd", gift: { img: "gift_kiss", count: 2 }, tickets: 3, rewards: [{ type: 25, count: 25 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_207" },
            { expup: 90000, friendadd: 200, freeRank: 1, room: 4, emoj: "3_zd", gift: { img: "gift_ring", count: 1 }, tickets: 3, rewards: [{ type: 25, count: 30 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_208" },
            { expup: 300000, friendadd: 300, freeRank: 1, room: 5, emoj: "5_st", avatarframe: "avatarframe_v_9", tickets: 4, rewards: [{ type: 25, count: 40 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_209" },
            { expup: 600000, friendadd: 300, freeRank: 1, room: 5, emoj: "5_st", gift: { img: "gift_ring", count: 2 }, tickets: 4, rewards: [{ type: 25, count: 50 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_210" },
            { expup: 1000000, friendadd: 400, freeRank: 1, room: 5, emoj: "6_ax", gift: { img: "gift_car", count: 1 }, tickets: 5, rewards: [{ type: 25, count: 80 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_211" },
            { expup: 1600000, friendadd: 400, freeRank: 1, room: 8, emoj: "4_zj", avatarframe: "avatarframe_v_12", tickets: 5, rewards: [{ type: 25, count: 100 }], view: [0, 2, 4, 5, 6, 7, 8], chatSkin: "chat_212" },
        ],
        // 等级配置
        exp_cfg: [
            [1, 0],
            [2, 70],
            [3, 150],
            [4, 240],
            [5, 340],
            [6, 460],
            [7, 590],
            [8, 730],
            [9, 890],
            [10, 1060],
            [11, 1260],
            [12, 1480],
            [13, 1720],
            [14, 1990],
            [15, 2280],
            [16, 2610],
            [17, 2970],
            [18, 3370],
            [19, 3800],
            [20, 4270],
            [21, 4770],
            [22, 5310],
            [23, 5880],
            [24, 6490],
            [25, 7140],
            [26, 7830],
            [27, 8570],
            [28, 9350],
            [29, 10170],
            [30, 11040],
            [31, 11950],
            [32, 12950],
            [33, 14030],
            [34, 15200],
            [35, 16460],
            [36, 17800],
            [37, 19270],
            [38, 20870],
            [39, 22600],
            [40, 24460],
            [41, 26450],
            [42, 28570],
            [43, 30820],
            [44, 33200],
            [45, 35610],
            [46, 38040],
            [47, 40490],
            [48, 42960],
            [49, 45470],
            [50, 48030],
            [51, 50630],
            [52, 53250],
            [53, 55890],
            [54, 58560],
            [55, 61250],
            [56, 63960],
            [57, 66710],
            [58, 69510],
            [59, 72350],
            [60, 75230],
            [61, 78130],
            [62, 81060],
            [63, 84010],
            [64, 86980],
            [65, 89970],
            [66, 93000],
            [67, 96080],
            [68, 99200],
            [69, 102360],
            [70, 105550],
            [71, 108760],
            [72, 111990],
            [73, 115240],
            [74, 118510],
            [75, 121830],
            [76, 125190],
            [77, 128590],
            [78, 132040],
            [79, 135510],
            [80, 139000],
            [81, 142510],
            [82, 146040],
            [83, 149590],
            [84, 153170],
            [85, 156770],
            [86, 160410],
            [87, 164090],
            [88, 167820],
            [89, 171570],
            [90, 175340],
            [91, 179130],
            [92, 182940],
            [93, 186780],
            [94, 190640],
            [95, 194520],
            [96, 198440],
            [97, 202410],
            [98, 206420],
            [99, 210450],
            [100, 214500],
            [101, 218570],
            [102, 222670],
            [103, 226810],
            [104, 230990],
            [105, 235220],
            [106, 239490],
            [107, 243780],
            [108, 248090],
            [109, 252420],
            [110, 256780],
            [111, 261180],
            [112, 265620],
            [113, 270110],
            [114, 274640],
            [115, 279190],
            [116, 283760],
            [117, 288350],
            [118, 292970],
            [119, 297630],
            [120, 302330],
            [121, Number.MAX_VALUE]
        ],
        max_level: 121,
        totalExp2Level(totalExp) {
            for (let i = this.exp_cfg.length - 1; i >= 0; i--) {
                let levelInfo = this.exp_cfg[i];
                if (totalExp >= levelInfo[1]) {
                    return levelInfo[0];
                }
            }
            return 1;
        },
        getLevelNeedExp(level) {
            level = level || 1;
            level = Math.min(level, this.max_level)
            return this.exp_cfg[level - 1][1];
        },
        getCmpLevelNeedExp(level) {
            level = level || 1;
            let nextLevel = Math.min(level + 1, this.max_level)
            if (nextLevel == this.max_level) { return "∞" }
            return Math.min(this.exp_cfg[nextLevel - 1][1] - this.exp_cfg[level - 1][1],
                this.exp_cfg[this.exp_cfg.length - 1][1] - this.exp_cfg[this.exp_cfg.length - 2][1]);
        },
        getLevelRemainingExp(totalExp) {
            let level = this.totalExp2Level(totalExp);
            let remainingExp = totalExp - this.exp_cfg[level - 1][1];
            return remainingExp;
        },
        getLevelProgress(totalExp) {
            let level = this.totalExp2Level(totalExp);
            let needExp = this.getCmpLevelNeedExp(level);
            let remainingExp = this.getLevelRemainingExp(totalExp);
            return remainingExp / needExp;
        },
        spineNameMap: [
            { level: 0, animtion: "LV_10" },
            { level: 10, animtion: "LV_20" },
            { level: 20, animtion: "LV_30" },
            { level: 30, animtion: "LV_40" },
            { level: 40, animtion: "LV_50" },
            { level: 50, animtion: "LV_60" },
            { level: 60, animtion: "LV_70" },
            { level: 70, animtion: "LV_80" },
            { level: 80, animtion: "LV_90" },
            { level: 90, animtion: "LV_100" },
            { level: 100, animtion: "LV_110" },
            { level: 110, animtion: "LV_120" },
            { level: 120, animtion: "LV_130" },
            { level: 130, animtion: "LV_140" },
            { level: 140, animtion: "LV_150" },
        ],
        getLevelSpineName(level) {
            let animtion = this.spineNameMap[0].animtion;
            for (let i = 0; i < this.spineNameMap.length; i++) {
                const item = this.spineNameMap[i];
                if (level > item.level) {
                    animtion = item.animtion;
                }
            }
            return animtion;
        },
        getRank(rankscore) {
            let tempIndex = 0;
            for (let i = 0; i < this.rankConfig.length; i++) {
                // 判断分数是否超出当前等级上限
                if (rankscore >= this.rankConfig[i].score) {
                    tempIndex = i;
                }
            }
            // 当前配置
            let tempData = this.rankConfig[tempIndex];
            // 下等级的名称
            let nextTempData = this.rankConfig[tempIndex + 1];
            if (nextTempData) {
                tempData.next = nextTempData;
            } else {
                tempData.next = null;
            }
            return tempData;
        },
        getRankByLevel(level) {
            for (const cfg of this.rankConfig) {
                if (cfg.stage == level) {
                    return cfg;
                }
            }
            return null;
        },
        vipConfig: {
            [0]: { text: "" },
            [1]: { get text() { return ___("骑士") } },
            [2]: { get text() { return ___("男爵") } },
        },
        vipExp2Level(vipexp) {
            let level = 0
            for (let i = 0; i < this.vipInfoConfig.length; i++) {
                const cfg = this.vipInfoConfig[i];
                if (vipexp >= cfg.expup) {
                    level = i;
                }
            }
            return level
        },
        getVip(vip) {
            if (vip < 0) {
                return this.vipConfig[0];
            } else if (vip >= 2) {
                return this.vipConfig[2];
            } else {
                return this.vipConfig[vip];
            }
        },
        countryConfig: [
            { id: 0, get name() { return ___("世界") } },
            { id: 1, get name() { return ___("卡塔尔") } },
            { id: 2, get name() { return ___("阿联酋") } },
            { id: 3, get name() { return ___("科威特") } },
            { id: 4, get name() { return ___("巴林岛") } },
            { id: 5, get name() { return ___("沙特阿拉伯") } },
            { id: 6, get name() { return ___("阿曼") } },
            { id: 7, get name() { return ___("黎巴嫩") } },
            { id: 8, get name() { return ___("约旦") } },
            { id: 9, get name() { return ___("伊拉克") } },
            { id: 10, get name() { return ___("利比亚") } },
            { id: 11, get name() { return ___("埃及") } },
            { id: 12, get name() { return ___("突尼斯") } },
            { id: 13, get name() { return ___("吉布提") } },
            { id: 14, get name() { return ___("阿尔及利亚") } },
            { id: 15, get name() { return ___("巴勒斯坦") } },
            { id: 16, get name() { return ___("摩洛哥") } },
            { id: 17, get name() { return ___("毛里塔尼亚") } },
            { id: 18, get name() { return ___("科摩罗") } },
            { id: 19, get name() { return ___("叙利亚") } },
            { id: 20, get name() { return ___("也门") } },
            { id: 21, get name() { return ___("苏丹") } },
            { id: 22, get name() { return ___("索马里") } },
            // { id: 23, get name() { return ___("美国") } },
            // { id: 24, get name() { return ___("中国") } },
        ],
        getCountry(id) {
            return this.countryConfig[id] || this.countryConfig[0];
        },
        colorConfig: {
            "chat_free": cc.color(255, 255, 255),
            "chat_knight": cc.color(247, 199, 50),
            "chat_sir": cc.color(66, 167, 219),
            "chat_spring1": cc.color(231, 60, 154),
            "chat_spring2": cc.color(231, 60, 154),
            "chat_spring3": cc.color(242, 102, 105),
            "chat_spring4": cc.color(208, 60, 60),
            "chat_summer1": cc.color(61, 195, 101),
            "chat_summer2": cc.color(61, 194, 101),
            "chat_summer3": cc.color(62, 196, 101),
            "chat_summer4": cc.color(13, 232, 54),
            "chat_autumn1": cc.color(237, 144, 37),
            "chat_autumn2": cc.color(237, 144, 37),
            "chat_autumn3": cc.color(247, 199, 50),
            "chat_autumn4": cc.color(247, 155, 82),
            "chat_winter1": cc.color(73, 173, 219),
            "chat_winter2": cc.color(73, 173, 219),
            "chat_winter3": cc.color(136, 104, 220),
            "chat_winter4": cc.color(155, 171, 170),
        },
        getChatBoxColor(key) {
            let color = this.colorConfig[key];
            if (!color) color = cc.color(255, 255, 255);
            return color;
        },
        // 颜色转换
        colorMap: {
            ["font_color_0"]: new cc.Color(0, 0, 0),
            ["font_color_1"]: new cc.Color(0, 0, 0),
            ["font_color_2"]: new cc.Color(0, 0, 0),
            ["font_color_3"]: new cc.Color(0, 0, 0),
            ["font_color_4"]: new cc.Color(0, 0, 0),
            ["font_color_5"]: new cc.Color(0, 0, 0),
        },
        // 设置颜色
        getColor(frontskin) {
            return this.colorMap[frontskin || "font_color_0"];
        },
        // 错误码转换
        spcode2String(spcode) {
            if (spcode == 804) {
                cc.vv.AlertView.show(___("金币不足"), () => {
                    cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
                }, () => {
                }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
            }
            let config = [
                { spcode: 625, get errMsg() { return ___("VIP等级不够") } },
                { spcode: 649, get errMsg() { return ___("房间号错误或者游戏已经开始") } },
                { spcode: 651, get errMsg() { return ___("您还不是VIP") } },
                { spcode: 652, get errMsg() { return ___("钻石不足") } },
                { spcode: 814, get errMsg() { return ___("商品不存在") } },
                { spcode: 653, get errMsg() { return ___("今日已不能参加排位赛") } },
                { spcode: 654, get errMsg() { return ___("队友金币不足") } },
                { spcode: 655, get errMsg() { return ___("队友钻石不足") } },
                { spcode: 656, get errMsg() { return ___("队友今日已不能参加排位赛") } },
                { spcode: 657, get errMsg() { return ___("队友已离开") } },
                { spcode: 665, get errMsg() { return ___("好友不是VIP") } },
                // { spcode: 804, get errMsg() { return ___("金币不足") } },
                { spcode: 950, get errMsg() { return ___("道具不存在") } },
                { spcode: 815, get errMsg() { return ___("兑换码已被使用") } },
                { spcode: 816, get errMsg() { return ___("兑换码不存在") } },
                { spcode: 817, get errMsg() { return ___("兑换错误次数太多，请稍后再试") } },
                { spcode: 818, get errMsg() { return ___("使用过于频繁，请稍后再试") } },
                { spcode: 1094, get errMsg() { return ___("找不到该用户") } },
                { spcode: 925, get errMsg() { return ___("房主才可以解散") } },
                { spcode: 659, get errMsg() { return ___("房间号不存在") } },
                { spcode: 660, get errMsg() { return ___("房间已满") } },
                { spcode: 661, get errMsg() { return ___("房间已开始") } },
                { spcode: 662, get errMsg() { return ___("还在游戏中,不能加入其它房间") } },


                { spcode: 649, get errMsg() { return ___("游戏已开始,无法解散") } },
                { spcode: 636, get errMsg() { return ___("商品不存在") } },
                { spcode: 637, get errMsg() { return ___("rp值不足") } },
                { spcode: 974, get errMsg() { return ___("已投票,不能重复投票") } },
                { spcode: 753, get errMsg() { return ___("用户已报名联赛") } },
                { spcode: 9933, get errMsg() { return ___("获取免费类型错误") } },
                { spcode: 9934, get errMsg() { return ___("今日已经领取") } },
                { spcode: 423, get errMsg() { return ___("未找到好友信息") } },
                { spcode: 1096, get errMsg() { return ___("没有可以参加的房间") } },
                { spcode: 1093, get errMsg() { return ___("任务未完成") } },
                { spcode: 1451, get errMsg() { return ___("道具不存在") } },
                { spcode: 1073, get errMsg() { return ___("This username is not available") } },

                { spcode: 638, get errMsg() { return ___("未完成") } },
                { spcode: 945, get errMsg() { return ___("玩家等级不够") } },
                { spcode: 819, get errMsg() { return ___("您被禁言了") } },
                { spcode: 1098, get errMsg() { return ___("玩家已在房间内") } },
                { spcode: 923, get errMsg() { return ___("房间人数已满") } },

                { spcode: 1452, get errMsg() { return ___("已经绑定过邀请码") } },
                { spcode: 1453, get errMsg() { return ___("不能绑定自己的邀请码") } },
                { spcode: 1454, get errMsg() { return ___("不能绑定下级的邀请码") } },
                { spcode: 1455, get errMsg() { return ___("绑定错误") } },

                { spcode: 398, get errMsg() { return ___("已发送过邀请,请稍后再试") } },
                { spcode: 3008, get errMsg() { return ___("无法重复领取沙龙体验卡") } },
                { spcode: 1102, get errMsg() { return ___("已发送过邀请,请10s后再试") } },
                { spcode: 976, get errMsg() { return ___("无法重复领取") } },
                { spcode: 754, get errMsg() { return ___("破产金币已领完") } },


                { spcode: 551, get errMsg() { return ___("绑定手机号不能为空") } },
                { spcode: 552, get errMsg() { return ___("Invalid OTP") } },
                { spcode: 553, get errMsg() { return ___("密码错误") } },
                { spcode: 554, get errMsg() { return ___("绑定手机的账号已经绑定过") } },
                { spcode: 555, get errMsg() { return ___("The phone number has been bound") } },

                { spcode: 333, get errMsg() { return ___("Wrong password!") } },
                { spcode: 955, get errMsg() { return ___("Account does not exist!") } },


                { spcode: 1055, get errMsg() { return ___("Parameters are missing!") } },
                { spcode: 484, get errMsg() { return ___("You are prohibited from adding friends") } },
                { spcode: 490, get errMsg() { return ___("Friends don't exist!") } },
                { spcode: 495, get errMsg() { return ___("添加好友，错误次数过于频繁") } },
                { spcode: 619, get errMsg() { return ___("您的好友数量已达上限") } },
                { spcode: 620, get errMsg() { return ___("好友关系已经存在") } },
                { spcode: 621, get errMsg() { return ___("对方好友数量已达上限") } },
                { spcode: 622, get errMsg() { return ___("对方已经是你的好友了") } },
                { spcode: 623, get errMsg() { return ___("不能加自己为好友") } },
                { spcode: 557, get errMsg() { return ___("Need to bind phone!") } },
                { spcode: 664, get errMsg() { return ___("Your friend is offline!") } },

                { spcode: 535, get errMsg() { return ___("Have abstained!") } },

            ]
            for (const _cfg of config) {
                if (_cfg.spcode == spcode) {
                    return _cfg.errMsg;
                }
            }
            return "";
        },
        // 沙龙菜单配置
        getCreateMenuCfg() {
            let temp = [];
            for (const data of cc.vv.UserManager.gameList) {
                if (this.salonGamesList.indexOf(data.id) >= 0) {
                    for (const item of this.gameMap) {
                        if (data.id == item.gameid) {
                            temp.push(item);
                        }
                    }
                }
            }
            return temp;
        },
        // 游戏名称
        getGameName(gameid) {
            for (const item of this.gameMap) {
                if (item.gameid == gameid) {
                    return item.title;
                }
            }
            return "";
        },
        getGameMapInfo(gameid) {
            for (const item of this.gameMap) {
                if (item.gameid == gameid) {
                    return item;
                }
            }
            return "";
        },
        // 获取没有Pin的游戏
        getUnPinGameIds(pinList) {
            let unPinGameIds = [];
            for (const id of this.allGameIds()) {
                if (pinList.indexOf(id) < 0) {
                    unPinGameIds.push(id);
                }
            }
            return unPinGameIds.filter((gameid) => {
                for (const data of cc.vv.UserManager.gameList) {
                    if (data.id == gameid) return true;
                }
                return false;
            });
        },
        // 获取菜单配置
        getCafeMenuConfig(gameids) {
            let temp = [];
            for (const item of this.gameMap) {
                if (this.salonGamesList.indexOf(item.gameid) >= 0) {
                    temp.push(item);
                }
            }
            return temp;
        },



        // 设置国家纹理
        setExpBuffFrame(sprite, buffer) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `exp_buffer_${buffer}`);
        },
        // 设置国家纹理
        setCountryFrame(sprite, id) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `icon_country_${id}`);
        },
        // 设置头像纹理
        setHeadFrame(sprite, id, callback) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `head_${id}`, callback);
        },
        // 设置排行纹理
        setRankFrame(sprite, id) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `rank_${id}`);
        },
        // 设置排行纹理
        setRankBigFrame(sprite, id) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `icon_league_big_${id}`);
        },
        // 设置VIP纹理
        setVipFrame(sprite, id) {
            id = Math.min(20, id);
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `vip_${id}`);
        },
        // 设置VIP文字纹理
        setVipTextFrame(sprite, id) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `text_vip_${id}`);
        },
        // 设置任务角标
        setTaskTypeFrame(sprite, id) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/texture_usercommon`, `icon_task_type_${id}`);
        },
        // 设置gameicon
        setGameIconFrame(sprite, gameid) {
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/game_info_texture`, `btn_hall_game_${gameid}`);
        },
        // 设置game标题
        setGameTitleFrame(sprite, gameid) {
            let lanConfig = cc.vv.i18nManager.getConfig();
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/game_info_texture`, `text_hall_game_${gameid}_${lanConfig.lang}`);
        },
        // 设置game标题
        setGameCafeFrame(sprite, gameid) {
            // 特殊处理 部分游戏相同的图标
            gameid = [258].indexOf(gameid) >= 0 ? 257 : gameid;
            gameid = [263, 273, 280].indexOf(gameid) >= 0 ? 262 : gameid;
            gameid = [270].indexOf(gameid) >= 0 ? 259 : gameid;
            gameid = [271].indexOf(gameid) >= 0 ? 285 : gameid;
            gameid = [274, 275, 276, 277, 278].indexOf(gameid) >= 0 ? 256 : gameid;
            cc.vv.ResManager.setSpriteFrame(sprite, `BalootClient/BaseRes/textures/game_info_texture`, `icon_cafe_${gameid}`);
        },
        // 设置表情
        setEmoji(skeCpt, key, callback) {
            if (!key) return;
            let emojiType = 0;
            let emojiIndex = 0;
            if (Global.isRealNum(key)) {
                emojiType = 0;
                emojiIndex = key;
            } else {
                let emojiArr = key.split("_");
                emojiType = emojiArr[1];
                emojiIndex = emojiArr[2];
            }
            // 切换ske
            cc.vv.ResManager.setSkeleton(skeCpt, `BalootClient/BaseRes/spines/emoji_${emojiType}/emoji_${emojiType}_${emojiIndex}`, (skeletonCpt) => {
                skeletonCpt.setAnimation(0, `animation`, true);
                skeletonCpt.node.scale = 0.4;
                skeletonCpt.node.y = -155;
                if (callback) callback(skeletonCpt, emojiType);
            });
        },
        // 设置头像框
        setAvatarFrame(skeCpt, avatarSkin) {
            cc.vv.ResManager.setSkeleton(skeCpt, `BalootClient/BaseRes/spines/avatarframe/${avatarSkin}/${avatarSkin}`, (skeletonCpt) => {
                skeletonCpt.setAnimation(0, `animation`, true);
            });
        },
        //app名称
        getAppName(){
            let appName = "Lucky Rummy"
            if(Global.appId == Global.APPID.RummyVIP){
                appName = "RummyVIP"
            }
            return appName
        }
    },

});
