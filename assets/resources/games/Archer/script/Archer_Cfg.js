/**
 * 皇家小犬配置
 */
let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol:{
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"actionframe",zIndex:300},isMask:true}, //wild
        [2]:{node:"s2",zIndex:100,win_node:"w2",stop_ani:{name:"buling",zIndex:300},trigger_ani:{name:"actionframe",zIndex:300},isMask:true}, //Scatter
        [3]:{node:"s3",win_node:"s3",isMask:false,
            idle_ani:{name:"n_idle",zIndex:300},stop_ani:{name:"n_stop",zIndex:300},trigger_ani:{name:"n_trigger",zIndex:300}}, //bonus
        [301]:{node:"s301",win_node:"s301",isMask:false,
            win_ani:{name:"b_win",zIndex:300},idle_ani:{name:"b_idle",zIndex:300},stop_ani:{name:"b_stop",zIndex:300}},
        [302]:{node:"s302",win_node:"s302",isMask:false,
            win_ani:{name:"b_win",zIndex:300},idle_ani:{name:"b_idle",zIndex:300},stop_ani:{name:"b_stop",zIndex:300},show_ani:{name:"b_show_2",zIndex:300}},
        [303]:{node:"s303",win_node:"s303",isMask:false,
            win_ani:{name:"b_win",zIndex:300},idle_ani:{name:"b_idle",zIndex:300},stop_ani:{name:"b_stop",zIndex:300},show_ani:{name:"b_show_3",zIndex:300}},
        [4]:{node:"s4",win_node:"w4",win_ani:{name:"actionframe",zIndex:300},isMask:true}, //魔法师
        [5]:{node:"s5",win_node:"",isMask:true}, //猫
        [6]:{node:"s6",win_node:"",isMask:true}, //乌鸦
        [7]:{node:"s7",win_node:"",isMask:true}, //青蛙
        [8]:{node:"s8",win_node:"",isMask:true}, //魔法瓶
        [9]:{node:"s9",win_node:"",isMask:true}, //A
        [10]:{node:"s10",win_node:"",isMask:true}, //K
        [11]:{node:"s11",win_node:"",isMask:true}, //Q
        [12]:{node:"s12",win_node:"",isMask:true}, //J
        [13]:{node:"s13",win_node:"",isMask:true}, //10

        [14]:{node:"s0", win_node:""},  //空
    },

    bonusIds:[301,302,303],

    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"Archer_Slots",
        Reels:"Archer_Reel",
        Symbols:"Archer_Symbol",
    },
    //行列(必须)
    col:5,
    row:3,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",
    bigSymbolPrefab:"LMSlots_bigSymbol",

    //符号宽高(必须)
    symbolSize:{
        width:130,
        height:110,
    },
    //随机符号(必须)
    randomSymbols:[1,4,5,6,7,8,9,10,11,12,13],

    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang:"kuang",

    //旋转速度(必须)
    speed:1600,

    //自动模式，每场的延迟
    autoModelDelay:0.5,

    //列停止间隔时间s
    reelStopInter:0.2,

    //旋转时间s:3s后旋转停止
    auto_stop_time:1.2,

    //回弹效果
    bounceInfo:{
        distance:30,         //回弹距离
        time:0.2             //回弹时间
    },
    normalBgm:"music_MagicLady_NormalBG",

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

    //帮助界面的子页
    helpItems:["games/Archer/prefab/help_node/LMSlots_Help_item1",
        "games/Archer/prefab/help_node/LMSlots_Help_item2",
        "games/Archer/prefab/help_node/LMSlots_Help_item3",
        "games/Archer/prefab/help_node/LMSlots_Help_item4",
        "games/Archer/prefab/help_node/LMSlots_Help_item5",
        "games/Archer/prefab/help_node/LMSlots_Help_item6",
        // "games/Archer/prefab/help_node/LMSlots_Help_item7",
    ],

    commEffect:{
        path:'games/Archer/',
        win1:['music_MagicLady_last_win_1',''],
        win2:['music_MagicLady_last_win_2',''],
        // win3:['music_MagicLady_last_win_3','']
    },

    //加速动画时间
    AddAntiTime:1.8,

    reelStateInfo:[
        {
            id:[2],
            mini:3,
            counts:[1,1,1,1,1],
            antiNode:"node_anti",
            path:'games/Archer/',
            reelStopSound:'music_MagicLady_reelstop',
            symbolStopSound:'music_MagicLady_buling',
            antSound:'music_MagicLady_quick_run',
            antSpeed:2200,
            type:"free",
        },
        {
            id:[3],       //id
            mini:1,     //触发游戏的最小个数
            counts:[3,3,3,3,3],             //每一列最多个数
            // antiNode:"",     //加速节点
            path:'games/Archer/',     //音效路径
            reelStopSound:'music_MagicLady_reelstop',             //普通列停止
            symbolStopSound:'music_MagicLady_lightingBuling',         //特殊symbol停止音效
            // antSound:'',                //加速音效
            antSpeed:2000,                           //加速度
            type:"bonus",
        },
    ],

}

module.exports = Cfg;
