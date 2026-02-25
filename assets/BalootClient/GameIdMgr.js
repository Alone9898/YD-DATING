/**
 * 游戏id
 */
let GAME_ID = {
    //slot 空位
    SLOT_COMESOON: 9999,
    SLOT_COMESOON1: 10000,
    SLOT_COMESOON2: 10001,
    SLOT_COMESOON3: 10002,

    
    ANDAR_BAHAR: 11,   // Andar Bahar
    CRASH: 12,     //Crash
    JHANDI_MUNDA: 13, // Jhandi Munda
    HORSE_RACING: 14,  // 赛马
    WINGO_LOTTERY: 15, // Wingo Lottery
    FORTUNE_WHEEL: 16, // Fortune Wheel
    FORTUNE_WHEEL_POKER: 295, // Fortune Wheel
    DRAGON_VS_TIGER: 17, // 龙虎斗
    ROULETTE: 18, // 俄罗斯轮盘36
    BACCARAT: 19, // 百家乐
    SEVEN_UP_DOWN: 20, // 7 Up Down
    BLACK_JACK: 255, // 21点
    C_AVIATOR:22,//Crash换皮:飞行员
    C_AVIATRIX:23,//Crash换皮:女飞行员
    C_CRASHX:24,//Crash换皮:CrashX
    C_CRICKETX:25,//Carash换皮:板球
    C_JETX:26,//Crash换皮：喷气式飞机
    C_ZEPPELIN:27,//Crash换皮：齐柏林飞艇
    S_DICE:28,//单人Dice
    S_LIMBO:29,//单人Limbo
    S_PLINKO:30,//单人PLinko
    S_KENO:31,  //单人Keno
    S_MINES:32, //单人Mines
    S_HILO:33,  //单人Hilo
    S_TOWERS:34,//单人Towers
    DOUBLE_ROLL:35,//多人DoubleRoll
    S_COINS:36, //单人Coins
    S_CRYPTO:37,//单人Crypto
    S_TRIPLE:38,//单人Triple
    S_CAPPADOCIA:39,//单人Cappadocia 气球

    TEENPATTI: 291,    // Teenpatti
    INDIA_RUMMY: 292,  // 印度拉米
    TEXAS_HOLDEM: 293, // 德州扑克
    TURNRECT_ALB:294, //阿拉伯转盘
    ALADINGWHEEL: 21, //  阿拉伯转盘
    //多人游戏类
    POKER_NIU: 2, //牛牛（拼十）
    // DRAGON_VS_TIGER: 5, //龙虎斗
    POKER_HUNDRED: 6, //百人牛牛(四方大战)
    MLLM: 8, //马来拉米
    RED_VS_BLACK: 10, //红黑大战（百人扎金花）
    // POKER_TBNN: 22, //通比牛牛
    YDLM: 250, // YD拉米
    JLM: 252, // 金拉米
    MLMJ: 254, //马来麻将(三人麻将)

    // DZPK: 255, // dzpk
    POKER_BALOOT: 256, // baloot
    POKER_BALOOT_FAST: 289, // baloot
    POKER_HAND: 257, // hand
    POKER_HAND_SAUDI: 258, // hand Saudi
    POKER_HAND_PARTNER: 267, // hand partner
    POKER_HAND_SAUDI_PARTNER: 268, // hand saudi partner
    POKER_HAND_CONCAN: 283, // hand concan
    POKER_TARNEEB: 259, // tarneeb
    POKER_TARNEEB_SYRIAN: 270, // tarneeb Syrian
    POKER_BASRA: 260, // basra
    POKER_BANAKIL: 261, // banakil
    POKER_TRIX: 262,    // Trix
    POKER_TRIXCOMPLEX: 273,     // Trix Complex
    POKER_TRIXPARTNER: 263,  // Trix Complex Partner
    POKER_COMPLEXPARTNER: 280,  // Complex Partner
    POKER_CCCOMPLEX: 281,   // CC Complex
    POKER_CCPARTNER: 282,   // CC Partner
    POKER_KASRA: 284,       // Kasra
    POKER_KASRAPARTNER: 285,    // Kasra Partner
    POKER_RONDA: 286,       // Ronda
    POKER_UNO: 287,         // Uno
    POKER_SAUDIDEAL: 288,   // SaudiDeal
    POKER_ESTIMATION: 264, // Estimation
    POKER_DOMINO: 265, // domino
    POKER_KOUTBO: 266,  // KoutBo
    POKER_BINTALSBEET: 279, // BintAlSbeet
    POKER_LUDOMASTER: 269,  // LudoMaster
    POKER_LUDO_QUICK: 290, // Ludo Quick
    POKER_TARNEEB_400: 272,  // 400
    TEENPATTI: 291,  // 400
    POKER_LEEKHA: 271,  // 400
    POKER_DURAK_2: 274,    // durak 2人
    POKER_DURAK_3: 275,    // durak 3人
    POKER_DURAK_4: 276,    // durak 4人
    POKER_DURAK_5: 277,    // durak 5人
    POKER_DURAK_6: 278,    // durak 6人

    //拉霸类
    SLOT_GDF: 101, // 财神到
    SLOT_AFG: 102, // 非洲丛林
    SLOT_GREAT_BLUE: 103, // 伟大蓝色
    SLOT_DR: 104, // 海豚礁
    SLOT_PD: 105, // 法老宝藏
    SLOT_AZT: 106, // 阿兹台克
    SLOT_JJX: 107, // 奖金熊
    SLOT_SB: 108, // 银弹

    SLOT_TK: 109, // 三国
    SLOT_GDT: 110, // 黄金树
    SLOT_GLF: 111, // 金莲花
    SLOT_GSGL: 112, // 高速公路
    SLOT_TLG: 113, // 封神榜
    SLOT_PAN: 114, // 黑豹
    SLOT_IVAN: 182, // 不朽的国王
    SLOT_YNXJ: 115, // 玉女心经
    SLOT_JLBD: 116, // 极乐宝典

    SLOT_PJL: 117, // 潘金莲
    SLOT_JF: 118, // 日本福气
    SLOT_SHZ: 119, // 水浒传
    FRUIT_SLOT: 120, // 水果机slot
    SLOT_ROBIN: 121, // 罗宾
    SLOT_GLYY: 122, // 拉霸 金莲淫液
    SLOT_FORTUNE_PANDA: 123, // 拉霸 富贵熊猫
    SLOT_SGIRL: 124, // 性感美女
    SLOT_TGSY: 125, // 泰国神游
    SLOT_ZHANWM: 127, // 斩五门

    SLOT_FOOTBALL: 126, // 足球嘉年华
    SLOT_SPARTAN: 128, // 斯巴达
    SLOT_DRAGON5: 238, // DRAGON5
    SLOT_EASTER: 129, // 复活节
    SLOT_RALLY: 130, // 拉力赛
    SLOT_NEWYEAR: 131, // 拜年
    SLOT_WUFUMEN: 132, // 五福门
    SLOT_TRAFFIC_LIGHT: 133, // 红绿灯
    SLOT_GOLDEN_DRAGON: 134, // 金龙赐福
    SLOT_STEAMTOWER: 135, // 蒸汽塔
    SLOT_VICTORY: 136, // 胜利
    SLOT_GARDEN: 137, // 花园
    SLOT_ALADDIN: 138, // 阿拉丁
    SLOT_CAPTAIN: 139, // 船长
    SLOT_BRAVE_LEGEND: 140, // 勇敢传说
    SLOT_HALLOWEEN: 141, // 万圣节
    SLOT_HALLOWEEN_SURPRISE: 142, // 万圣节惊喜
    SLOT_IRELAND_LUCKY: 143, // 爱尔兰运气

    SLOT_YEARBYYEAR: 144, // 年年有余
    SLOT_CHERRY: 145, // 樱桃的爱
    SLOT_CAPTAIN9: 146, // 船长9线
    SLOT_ZCJB: 147, // 招财进宝
    SLOT_ICE_AND_SNOW: 149, // 冰雪世界
    SLOT_INDIA_MYTH: 148, // 印度神话
    SLOT_SEA_WORLD: 150, // 海洋世界
    SLOT_FARM_STORY: 151, // 农场故事
    SLOT_CHEN_PAO_ISLAND: 152, // 珍宝岛
    SLOT_CRAZY_MONEY: 153, // 狂热金钱
    SLOT_STONE_AGE: 154, // 石器时代
    SLOT_SPIRITUAL_GARDEN: 155, // 精灵花园
    SLOT_BLAZING_STAR: 156, // 闪亮之星
    SLOT_COLABOTTLE: 157, // 可乐瓶
    SLOT_PIRATE_SHIP: 158, // 海盗船
    SLOT_MAGICIAN: 159, // 魔法师
    SLOT_OCEAN: 160, // 海洋天堂
    SLOT_LAURA: 161, // 劳拉
    SLOT_SEASON: 162, // 季节问候
    SLOT_ALICE: 163, // 爱丽丝
    SLOT_AFRICAN_SAFARI: 164, // 狂野非洲
    SLOT_SWK: 165, // 孙悟空
    SLOT_MONEY_FROG: 166, // 金钱蛙
    SLOT_JETION: 167, // 吉星
    SLOT_FORTUNE: 168, // 发大财
    SLOT_TOP_GUN: 169, // 壮志凌云
    SLOT_WESTERN_PASTURE: 170, // 西部牧场
    SLOT_HUANG_DI_LAI_LE: 171, // 皇帝来了(老子是皇帝)
    SLOT_SAINTSEIAY: 173, // 圣斗士星矢
    SLOT_GOLDEN_TREE918: 174, // 黄金树918
    SLOT_WOLFER: 175, // 猎狼者
    SLOT_WANGCAI: 180, // 旺财
    SLOT_TERNADO: 181, // 龙卷风
    SLOT_MATSURI: 183, // 飨宴
    SLOT_CIRCUS: 184, // 马戏团
    SLOT_AIRPLANE: 189, // slot 飞机
    SLOT_FAME: 195, // slot 名利场
    SLOT_TGFQ: 193, // slot 泰国风情
    SLOT_TREX: 190, // 霸王龙
    SLOT_YEMEI: 177, // 野妹
    SLOT_WATER: 178, // 海豚
    SLOT_XUEMEI: 179, // 学妹
    SLOT_ORIENT: 185, // 东方快车
    SLOT_MAGICAL_DRAGON: 186, // 神秘之龙
    SLOT_COYOTECASH: 187, // 野狼现金
    SLOT_CLEOPATRA: 188, // 埃及艳后
    SLOT_MOTOCYCLE: 176, // 极限赛车
    SLOT_GREAT_CHINA: 192, // 中华之最
    SLOT_FASHION: 194, // 时尚世界
    SLOT_PAYDIRT: 196, //富矿发现
    SLOT_BIGSHOT: 197, //头面人物S
    SLOT_THE_DISCOVER: 198, // 发现
    SLOT_NEWPANJINLIAN: 199, // 新潘金莲
    SLOT_SPARTA30: 401, // 斯巴达30
    SLOT_NIGHTCLUB: 402, //夜总会
    SLOT_NINJA: 403, //忍者
    SLOT_FRUITSPACE: 404, // 水果天地
    SLOT_GOLF: 406, // 5线高尔夫
    SLOT_CLASSIC: 407, //经典拉霸
    SLOT_CRAZY7: 408, //疯狂7
    SLOT_HZLB: 409, //猴子拉bar
    SLOT_8BALL: 410, //8号球

    SLOT_INFINITY_VENUS: 413, //infinity-venus
    SLOT_CHICKEN: 415, //吃鸡拉霸
    SLOT_GOWV2: 416, //财神到2.0
    SLOT_DRAGON5_HD: 417, //5龙高清
    SLOT_ZHAOYUN: 418, //赵云传
    SLOT_GODOFFIRE: 420, //火神
    SLOT_THEMEPARKBLAST: 422, //theme park blast
    SLOT_QUEENOFSEA: 424, //美人鱼
    SLOT_KINGOFOLYMPUS: 428, //奥林匹斯国王
    SLOT_SMOKINGHOTPICHES: 429, //吸烟狗
    SLOT_GRANDGEMINI: 430, //大双子星
    SLOT_CUPIDISCRUSH: 433, //丘比特
    SLOT_CUPIDCRUSHDELUXE: 434, //丘比特大
    SLOT_FORTUNEWILDDELUXE: 432, //幸运财神
    SLOT_SPLENDID_ISLAND: 469, //灿烂的岛屿
    SLOT_SPLENDIDISLAND_DELUXE: 476, //灿烂的岛屿大
    SLOT_EASTERNRICHES: 482, //东部财富

    //赛马类
    HORSE_MONKEY_TREE: 202, // 霹雳猴（猴子爬树）
    HORSE: 211, // 赛马
    MOTOR_RACE: 236, //赛摩托
    HORSE_RACE: 243, //赛马918

    //转圈类
    ARC_XYZB: 203, // 街机-西游争霸
    ARC_YCLS: 212, // 街机-英超联赛
    FISH_SHRIMP_OYSTER: 204, // 鱼虾蚝
    BIRD_AND_ANIMAL: 208, // 飞禽走兽
    ONLINE_LHDZ: 206, // 在线-龙虎斗（777）
    BCBM: 205, // 奔驰宝马
    BAIJIALE: 201, // 百家乐初级场
    BAIJIALE_MID: 221, // 百家乐中级场
    BAIJIALE_HIGH: 218, // 百家乐高级场
    // HWFISH: 24, // 海王捕鱼
    // FISHJOY_WKNH: 25, // 悟空闹海
    // FISHJOY_JCBY: 26, // 金蟾捕鱼
    // FISHJOY_LKBY: 27, // 李逵捕鱼
    // YQSFISH: 28, // 摇钱树捕鱼
    // FISHSTAR_DSBY: 29, // 大圣捕鱼
    // FISHSTAR_LKPY: 30, // 李逵劈鱼
    // FISHSTAR_BYZX: 31, // 捕鱼之星
    // HWFISH_918: 32, // 海王捕鱼918
    // BIRDSFISH: 33, // 鸟王争霸
    // RAIDENFISH: 34, // 雷电捕鱼
    // SPONGEBOB: 35, // 海绵宝宝
    // FISHSTAR_DSBY_WP: 36, // 大圣捕鱼万炮房
    // FISHSTAR_LKPY_WP: 37, // 李逵劈鱼万炮房
    // FISHSTAR_BYZX_WP: 38, // 捕鱼之星万炮房
    // HWFISH_918_WP: 39, // 海王捕鱼918万炮房
    // INSECTSFISH: 40, // 虫虫捕鱼
    // NEPTUNEFISH: 41, // 渔人码头（海王星）

    // ROULETTE: 209, // 俄罗斯轮盘初级场
    ROULETTE_MID: 219, // 俄罗斯轮盘中级场
    ROULETTE_HIGH: 220, // 俄罗斯轮盘高级场
    ARC_XYZB_LINE: 222, // 西游争霸在线
    BCBM_918: 237, // 奔驰宝马918
    ARC_ZWBS_LINE: 245, // 战无不胜在线
    BIG_SMALL: 246, // 比大小

    ROULETTE_MINI: 223, //轮盘Mini12-918kiss
    ROULET_24: 224, // 轮盘24-918kiss
    ROULET_73: 225, // 轮盘73-918kiss
    ROULET_36: 239, // 轮盘36-918kiss

    LHDZ_918_1: 226, // 龙虎斗1-918kiss
    LHDZ_918_2: 227, // 龙虎斗2-918kiss
    LHDZ_918_3: 228, // 龙虎斗3-918kiss
    SICBO_918: 229, // 豹子王单机版-918kiss
    BACCARAT_918: 230, // 百家乐单机版-918kiss
    THREE_POKER_918: 231, // 三卡扑克单机版-918kiss
    HOLD_EM_918: 232, // 赌场单机版-918kiss
    CASINO_WAR_918: 233, // 赌场战争单机版-918kiss
    BULL_918: 234, // 牛牛单机版-918kiss
    MONKEY_ZWBS_918: 241, // 西游争霸之战无不胜-918kiss

    TWENTYONE777: 210, // 21点
    FRUIT: 213, // 水果机
    LEOPARD: 214, // 豹子王
    HULUJI: 216, // 葫芦鸡
    SLOT_SLWH: 207, // 森林舞会
    SINGLE_PICK: 235, // 单挑
    FQZS_SP: 246, // 飞禽走兽单机
    PHOENIX_SP: 248, // 火飞凤舞
    POKEMON_SP: 249, // 宠物小精灵
    SLWH_918NEW: 251, //森林舞会（918新版）
    GLITZ_INFINITY: 411, //glitz and glamour(infinity)

    //竖版
    REGAL_TIGER: 419, //老虎
    JALAPAND_DELIGHT: 423, //墨西哥帅哥

    DIAMOND_FOREST: 435, //钻石森林
    SPEED_FIRE: 436, //快速开火
    GORGEOUS_CLEOPATRA: 437, //华丽的埃及延后
    ICYWOLF: 479, //野狼
    MAJESTIC_PANDA: 439, //熊猫
    SUSHI_LOVER: 440, //苏式的情人
    THUNDER_MUSTANG: 441, //野马
    FORTUNE_GENIE: 442, //财富精灵
    POWER_DRAGON: 443, //神龙
    HOLIDAY_FRENZY: 444, //圣诞老人

    SLOT_SUNGODDESS: 425, // 太阳女神
    SLOT_BINGOMEOW: 446, // 宾果猫
    SLOT_TREASUREJUNGLE: 447, // 珍宝丛林
    SLOT_PRINCECHARMING: 449, // 青蛙王子
    SLOT_HIGHPOWER: 451, // 大功率
    SLOT_BRILLIANTTREASURES: 465, // 辉煌的宝藏
    SLOT_MAMMOTHGRANDGEMS: 466, // 猛犸象gems
    SLOT_MAMMOTHGRAND: 474, // 猛犸象
    SLOT_SPOOKYHALLOWEEN: 480, // 怪异的万圣节
    SLOT_STONEAGEDTREASURE: 489, // 石器时代
    SLOT_MONSTERCASH: 484, // 怪物现金
    SLOT_DOUBLECHILI: 495, // 俩辣椒
    SLOT_MAYADEORO: 500, // 玛雅
    SLOT_PRINCENEZHA: 507, // 哪吒闹海
    SLOT_PIGGYHEIST: 512, // 小猪大劫案
    SLOT_HOWLINGMOON: 513, // 咆哮的月亮
    SLOT_ALIENBUSTER: 515, // 外星人杀手
    SLOT_SUMO: 519, // 相扑
    SLOT_AMERICANBILLIONAIRE: 523, // 美国大亨
    SLOT_BEAUTYANDTHEBEAST: 525, // 美女与野兽
    SLOT_YEAROFGOLDENPIG: 526, // 金猪报喜
    SLOT_DOUBLENUGGETS: 527, // 双倍矿工
    SLOT_DOUBLETHUNDER: 530, // 双倍神力
    SLOT_BEERFESTIVAL: 532, // 啤酒节
    SLOT_INVINCIBLEGODDESS: 534, // 战争女神
    SLOT_THUMBELINA: 537, // 拇指姑娘
    SLOT_DRAGONDIAMOND: 536, // 巨龙钻石
    SLOT_LEPRECHAUNBLAST: 538, // 妖精爆炸
    SLOT_DOUBLEAGENT: 618, // 间谍
    SLOT_BIGDUEL: 620, // 佐罗
    SLOT_LUCKYCAT: 619, // 招财猫
    SLOT_VAMPIRECOUNT: 636, // 吸血鬼
    SLOT_TAVERNWITCH: 637, // 酒馆女巫
    SLOT_BLADEMASTERTOKUGAWA: 638, // 宫本武藏
    SLOT_SIXTHDAYTHEDEMON: 639, // 织田信长
    SLOT_THEMAGICHANZO: 640, // 服部半藏
    SLOT_MINAMOTONOYOSHITSUNE: 641, // 源义经
    SLOT_GANGSTERGODFATHER: 642, // 黑帮教父
    SLOT_FATHEROFINVENTION: 664, // 发明之父
    SLOT_WESTCOWBOY: 665, // 西部牛仔
    SLOT_RISINGSUNTHEGREATKING: 666, // 德川家康
    SLOT_POLITICALSTRATEGIST: 667, // 丰臣秀吉
    SLOT_MULAN: 668, // 花木兰
    SLOT_GENGHISKHAN: 669, // 成吉思汗
    SLOT_THECENTAUR: 670, // 半人马
    SLOT_CHANGE: 675, // 嫦娥
    SLOT_ALIENMONSTER: 671, // 外星怪物
    SLOT_BASKETBALLKING: 672, // 篮球之王
    SLOT_JAPANESESINGER: 677, // 日本歌姬
    SLOT_NEWKYLIN: 674, // 麒麟
    SLOT_ODYSSEUS: 649, //奥德修斯
    SLOT_PRINCESSPEA: 676, // 豌豆公主
    SLOT_HERA: 673, // 赫拉
    SLOT_APOLLO: 680, // 阿波罗
    SLOT_DIONYSUS: 681, // 狄俄尼索斯
    SLOT_FRIGG: 679, // 弗丽嘉
    SLOT_INDIAN: 678, // 印第安人

    SLOT_SUPER_WICKED_BLAST: 458, //小恶魔
    JUNGLE_KING: 453, // 泰山
    SLOT_RISINGMEDUSA: 459, //美杜莎
    LET_IS_PARTY: 454, // 开派对
    ADVENTURE_IN_SPACE: 455, // 宇航员
    YEAR_OF_THE_RAT: 456, // 鼠年
    SLOT_FORTUNEGONG: 460, // 财富宫
    GOLD_ISLAND_TREASURE: 464, //海盗船
    SLOT_EGYPTIAN_FANTASY: 462, //埃及幻想
    SLOTS_TOWER: 471, //SLOTS塔
    CANDY_MAGIC: 468, // 糖果魔术
    SLOT_FORTUNEWHEELDELUXE: 461, // 命运之豪华邮轮
    HOT_HOT_DRUMS: 467, // 打鼓
    SLOT_CRICUS_CARNIVAL: 463, //马戏嘉年华
    SLOT_RAPID_PLATINUM_PAY: 470, //快速白金支付
    SLOT_BEER_HALL: 452, // 啤酒馆
    SLOT_SPACE_CAT: 472, //太空猫
    SLOT_MOMENT_OF_WONDER: 421, // 奇迹时刻
    SLOT_BONIE_CLYDE: 427, //邦妮和克莱德
    SLOT_LEPRECHAUNCOINS: 473, //妖精的银币
    SLOT_WHEREISSANTACLAUS: 448, //圣诞老人在那里
    MASKED_HERO: 477, //蒙面英雄
    SLOT_PELICAN_QUEST: 478, //鹈鹕的探索
    SLOT_ZOMBLE_NATION: 481, //僵尸国度
    SLOT_ROYALPUPPIES: 450, // 皇家小犬
    SLOT_RISEOFEGYPT: 494, // 埃及崛起
    SLOT_FORTUNETRAINDELUXE: 499, // 豪华财富列车
    SLOT_MIGHTYATLANTIS: 504, // 强大的亚特兰蒂斯
    SLOT_NEVERLANDFANTASY: 510, // 梦幻岛之旅
    SLOT_WEALTHOFPANDA: 514, // 富贵熊猫
    SLOT_MAGICORB: 496, // 魔法球
    SLOT_KANGAROOS: 518, // 袋鼠
    SLOT_FORTUNETREE: 521, // 富贵树
    SLOT_THELIONSJACKPOT: 524, // 狮子大奖
    SLOT_VOLCANOFURY: 528, // 火山的愤怒
    SLOT_CAPTAINJACKPOT: 529, // 航海宝藏
    SLOT_HEROINEMULAN: 531, // 花木兰-换皮前
    SLOT_KINGOFSIBERIAN: 533, // 西伯利亚之王
    SLOT_LEGENDOFOZ: 535, // 奥兹传奇
    SLOT_ULTIMATETIKILINK: 539, // 南岛寻宝
    SLOT_FEANNIESHOW: 540, // 费安妮秀
    SLOT_POWEROFTHEKRAKEN: 541, // 克拉肯之力

    SLOT_ROCKING_DISCO: 475, //摇滚DISCO
    SLOT_MEGA_VAULT_BILLIONAIRE: 483, //大型金库亿万富翁
    LUCKY_BEE: 488, //幸运蜜蜂
    SLOT_PRINCE_CHARMING_DELUXE: 487, // 青蛙王子大
    SLOT_FEAMIN_QUEEN: 490, //花木兰

    SLOT_CANDY_CLASH: 491, // 糖果
    SLOT_THANKSGIVINGPARTY: 508, // 感恩节派对
    SLOT_PENGUINBOUNTY: 509, // 企鹅赏金
    SLOT_ZUES: 601, // 宙斯
    SLOT_ATHENA: 602, // 雅典娜
    SLOT_POSEIDON: 603, // 波塞冬
    SLOT_NMEDUSA: 604, // 新版美杜莎
    SLOT_GODNESS_OF_LOVE: 605, // 爱神
    SLOT_WARSHIP: 606, // 无所畏惧的舰娘
    SLOT_JIANNIANGCHRISTMAS: 607, //古灵精怪的舰娘

    SLOT_LEGENDOFJOANOFARC: 609, // 圣女贞德
    SLOT_LORDCAESAR: 610, // 凯撒
    SLOT_LORDOFTHUNDER: 611, // 雷神索尔
    SLOT_GODDESSOFDEATH: 612, // 死神海拉
    SLOT_ELVESBLESSING: 613, // 光明精灵
    SLOT_ODINSANGER: 614, // 奥丁
    SLOT_THEROUNDTABLEKNIGHTSEXPLORE: 615, //亚瑟
    SLOT_G_CLEOPATRA: 616, // 埃及艳后
    SLOT_THEEVIL: 617, // 撒旦
    SLOT_LOKI: 643, // 洛基
    SLOT_FREY: 644, // 弗雷
    SLOT_ALEXANDER: 645, // 亚历山大
    SLOT_FENRIR: 608, // 芬里尔
    SLOT_SPHINX: 652, // 狮身人面像
    SLOT_CAOCAO: 653, // 曹操
    SLOT_SUNWUKONG: 654, // 孙悟空
    SLOT_JORMRNGANDER: 655, // 约尔孟甘德
    SLOT_SHAKYAMUNI: 682, // 释迦摩尼
    SLOT_GALILEO: 683, // 伽利略
    SLOT_BADER: 684, // 巴德尔
    SLOT_HESTIA: 686, // 赫斯提亚
    SLOT_HEPHAESTUS: 687, // 赫菲斯托斯
    SLOT_ROMANTICPRINCESS: 688, // 浪漫公主
    SLOT_NEWMULAN: 647, // 花木兰-换皮后
    SLOT_YMER: 685, // 伊米尔
    SLOT_GODOFWAR: 689, // 阿瑞斯
    SLOT_LITTLEREDRIDINGHOOD: 690, //小红帽
    SLOT_PRINCE: 691, //波斯王子
    SLOT_ARCHER: 692, //弓箭手
    SLOT_ALIBABA: 693, //阿里巴巴四十大盗
    SLOT_XERXES: 694, //薛西斯
    SLOT_SKYGARDEN: 695, //尼布甲尼撒二世和空中花园
    SLOT_SINBAD: 696, //辛巴达航海冒险
    SLOT_G_CLEOPATRA_a: 697, //埃及艳后
    SLOT_LAMP_OF_ALADDIN_a: 698, //阿拉丁神灯
    SLOT_SPHINX_a: 699, //狮身人面像

    SLOT_RISING_PEGASUS: 492, //成吉思汗
    SLOT_GOLD_RUSH_DELUXE: 493, //黄金矿工
    SLOT_MERMAID_PEARLS: 497, //美人鱼和珍珠
    SLOT_CLOWN: 626, //小丑
    SLOT_THEGODOFFORTUNE: 624, //财神到
    SLOT_INTERSTELLAR: 625, //星际穿越
    SLOT_KING_KONG: 498, // 金刚
    SLOT_POWER_OF_ZEUS: 501, //宙斯的力量
    SLOT_FLOWERY_PIXIE: 502, //绚丽的小精灵
    SLOT_EMPEROR_QIN: 627, //秦始皇
    SLOT_MAGICIAN_NEW: 628, //魔术师
    SLOT_FANTASY_CHOCOLATE_FACTORY: 629, //梦幻巧克力工厂

    SLOT_THE_LION: 621, // 狮子
    SLOT_THE_PANDA: 622, // 熊猫
    SLOT_THE_UNICORN: 623, // 独角兽
    SLOT_LAMP_OF_ALADDIN: 630, // 阿拉丁
    SLOT_THE_MERMAID: 631, // 美人鱼
    SLOT_THE_MINSTREL: 632, // 吟游诗人
    SLOT_THE_FROG_PRINCE: 633, // 青蛙王子
    SLOT_THE_MAMMOTH: 634, // 猛犸象
    SLOT_THE_LEGEND_OF_DRAGON: 635, // 龙的传说
    SLOT_PUSS_THE_MUSKETEER: 426, //猫的火枪手

    SLOT_ROMANTIC_QUEEN: 503, // 浪漫女王
    SLOT_WILD_GORILLA: 505, // 野生大猩猩
    SLOT_WICKED_BELLE: 511, // 邪恶的美女

    SLOT_BIRD_NINE_HEADS: 656, // 九头鸟
    SLOT_MAGIC_FROG: 657, // 魔法青蛙
    SLOT_DWARFS_AND_PRINCESS: 658, // 矮人与公主
    SLOT_LUCKY_SANTA: 659, // 幸运圣诞老人
    SLOT_THE_PHOENIX: 660, // 凤凰
    SLOT_ROBIN_HOOD: 661, // 侠盗罗宾逊
    SLOT_BUNNY_GIRL: 662, // 兔女郎
    SLOT_GOLD_MINER: 663, // 黄金矿工
    SLOT_KYLIN: 516, // 麒麟
    SLOT_THE_LION_GEMS: 517, // 狮子宝石
    SLOT_THE_FOREVER_LOVE: 520, // 真爱永恒

    SLOT_WOLF_LEGEND: 506, //狼之传说

    SLOT_HADES: 646, //冥王哈迪斯
    // SLOT_DEMETER:647,  //德墨忒尔
    SLOT_HERMES: 648, //赫尔墨斯

    SLOT_PROMETHEUS: 650, //普罗米修斯
    SLOT_PESEUS: 651, //帕修斯
};
module.exports = GAME_ID;
