/**
 * 冰狼配置
 */
let Cfg = {
    //符号配置(必须)
    symbol:{
        //客户端自己扩展
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"animation",zIndex:100},isMask:true},                          //wild
        [2]:{node:"s13",win_node:"w13",zIndex:300,stop_ani:{name:"animation1",zIndex:300},trigger_ani:{name:"animation3",zIndex:300},idle_ani:{name:"animation2",zIndex:300},anti_ani:{name:"animation4",zIndex:300},isMask:true}, //scatter                         //scatter
        [3]:{node:"s15",win_node:"w15",zIndex:200,stop_ani:{name:"animation1",zIndex:200},trigger_ani:{name:"animation3",zIndex:200},idle_ani:{name:"animation2",zIndex:200},isMask:false}, //bonus银珠
        [4]:{node:"s14",win_node:"w14",zIndex:200,stop_ani:{name:"animation1",zIndex:200},trigger_ani:{name:"animation3",zIndex:200},idle_ani:{name:"animation2",zIndex:200},act_ani:{name:"animation4",zIndex:200},isMask:false}, //bonus金珠
        [5]:{node:"s2",win_node:"w2",win_ani:{name:"animation",zIndex:100},isMask:true}, //鲨鱼
        [6]:{node:"s3",win_node:"w3",win_ani:{name:"animation",zIndex:100},isMask:true}, //灯笼鱼
        [7]:{node:"s4",win_node:"w4",win_ani:{name:"animation",zIndex:100},isMask:true},//海龟
        [8]:{node:"s5",win_node:"w5",win_ani:{name:"animation",zIndex:100},isMask:true},//水母
        [9]:{node:"s6",win_node:"w6",win_ani:{name:"animation",zIndex:100},isMask:true},//海星
        [10]:{node:"s7",win_node:"w7",win_ani:{name:"animation",zIndex:100},isMask:true},//贝壳
        [11]:{node:"s8",win_node:"w8",win_ani:{name:"animation",zIndex:100},isMask:true},//A
        [12]:{node:"s9",win_node:"w9",win_ani:{name:"animation",zIndex:100},isMask:true},//K
        [13]:{node:"s10",win_node:"w10",win_ani:{name:"animation",zIndex:100},isMask:true},//J
        [14]:{node:"s11",win_node:"w11",win_ani:{name:"animation",zIndex:100},isMask:true},//Q
        [15]:{node:"s12",win_node:"w12",win_ani:{name:"animation",zIndex:100},isMask:true},//10

        [20]:{node:"", win_node:""}, // 空节点
    },

    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"PowerOfTheKraken_Slots",
        Reels:"PowerOfTheKraken_Reel",
        Symbols:"PowerOfTheKraken_Symbol",
    },
    //行列(必须)
    col:5,
    row:4,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",

    //符号宽高(必须)
    symbolSize:{
        width:134,
        height:100,
    },
    //随机符号(必须)
    randomSymbols:[5,6,7,8,9,10,11,12,13,14,15],

    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang:"kuang",

    //旋转速度(必须)
    speed:3000,

    //列停止间隔时间s
    reelStopInter:0.2,

    //旋转时间s:3s后旋转停止
    auto_stop_time:1,

    //回弹效果
    bounce:true,

    autoModelDelay: 1,

    bounceInfo:{
        distance:30,         //回弹距离
        time:0.1            //回弹时间
    },

    normalBgm:'base_bgm',
    AddAntiTime:2,
    reelStateInfo:[
        {
            id:[2],       //id
            mini:3,     //触发游戏的最小个数
            counts:[1,0,1,0,1],             //每一列最多个数
            antiNode:"scatter_lzjl_",     //加速节点
            path:'games/PowerOfTheKraken/',     //音效路径
            reelStopSound:'reel_stop',             //普通列停止
            symbolStopSound:['scatter_land1','','scatter_land2','','scatter_land3'],         //特殊symbol停止音效
            antSound:'scatter_notify',                //加速音效
            antSpeed:2500,                           //加速度
            type:"free",    // 类型：免费游戏
        },
        {
            id:[3,4],       //id
            mini:6,     //触发游戏的最小个数
            counts:[3,3,3,3,3],             //每一列最多个数
            antiNode:"bonus_lzjl_",     //加速节点
            path:'games/PowerOfTheKraken/',     //音效路径
            reelStopSound:'reel_stop',             //普通列停止
            symbolStopSound:'bonus_land1',         //特殊symbol停止音效
            antSound:'bonus_notify',                //加速音效
            antSpeed:2500,                           //加速度
            type:"bonus",    // 类型：bonus游戏
        },
    ],

    commEffect:{
        path:'games/PowerOfTheKraken/',
        win1:['win1','win1end'],
        win2:['win2','win2end']
    },

    helpItems:["games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item1",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item2",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item3",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item4",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item5",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item6",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item7",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item8",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item9",
        "games/PowerOfTheKraken/prefab/help_node/LMSlots_Help_item10",],

    // dir：1朝右 -1朝左
    fishSymbol:{
        [1]:{node:"fish1", dir:1, width:158, weight:1},
        [2]:{node:"fish2", dir:-1, width:353, weight:1.5},
        [3]:{node:"fish3", dir:-1, width:905, weight:2},
        [4]:{node:"fish4", dir:1, width:470, weight:1.5},
        [5]:{node:"fish5", dir:-1, width:152, weight:1},
    },

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
}

module.exports = Cfg;
