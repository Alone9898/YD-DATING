/**
 * 老虎配置
 */
let Cfg = {
    //符号配置(必须)
    symbol:{
        //客户端自己扩展
        [1]:{node:"s1",node2:"gs1",win_node:"w1",win_ani:{name:"animation",zIndex:100}},                          //老虎
        [2]:{node:"s11",node2:"gs11",win_node:"w2",stop_ani:{name:"animation1",zIndex:200}, trigger_ani: {name:"animation2",zIndex:300}}, //八卦
        [3]:{node:"s2",node2:"gs2",win_node:"w3",win_ani:{name:"animation",zIndex:100}}, //房
        [4]:{node:"s3",node2:"gs3",win_node:"w4",win_ani:{name:"animation",zIndex:100}}, //船
        [5]:{node:"s5",node2:"gs5",win_node:"w5",win_ani:{name:"animation",zIndex:100}}, //伞
        [6]:{node:"s4",node2:"gs4",win_node:"w6",win_ani:{name:"animation",zIndex:100}}, //花
        [7]:{node:"s6",node2:"gs6",win_node:""},    //A
        [8]:{node:"s7",node2:"gs7",win_node:""},    //K
        [9]:{node:"s8",node2:"gs8",win_node:""},     //Q
        [10]:{node:"s9",node2:"gs9",win_node:""},    //J
        [11]:{node:"s10",node2:"gs10",win_node:""},  //10
        [12]:{node:"s12",win_node:"w12",stop_ani:{name:"animation1",zIndex:100}},  //金币
        
    },
    
    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"RegalTiger_Bottom",
        Slots:"RegalTiger_Slots",
        Reels:"RegalTiger_Reel",
        Symbols:"RegalTiger_Symbol",
    },
    //行列(必须)
    col:5,
    row:3,

    //scatter定义，用来计算控制免费加速动画
    scatterId:2,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",

    //符号宽高(必须)
    symbolSize:{
        width:150,
        height:125,
    },
    //随机符号(必须)
    randomSymbols:[3,4,5,6,7,8,9,10,11],

    //旋转速度(必须)
    speed:2000,

    //列停止间隔时间s
    reelStopInter:0.3,

    //旋转时间s:3s后旋转停止
    auto_stop_time:1,

    //回弹效果
    bounce:true,

    autoModelDelay: 0.5,
    
    //normalBgm:'base_bgm',

    bounceInfo:{
        distance:60,         //回弹距离
        time:0.3             //回弹时间
    },

    normalBgm:'base_bgm',
    AddAntiTime:1,
    reelStateInfo:[
        {
            id:[2],       //id
            mini:3,     //触发游戏的最小个数
            counts:[1,1,1,1,1],             //每一列最多个数
            antiNode:"node_anti",     //加速节点
            path:'games/RegalTiger/',     //音效路径
            reelStopSound:'reel_stop',             //普通列停止
            symbolStopSound:'scatterSmart_stop_1',         //特殊symbol停止音效
            antSound:'anticipation',                //加速音效
            antSpeed:2500,                           //加速度
        },
        {
            id:[1201,1202,1203,1204,1205,1206,1207,1208,1209,1210],       //id
            mini:6,     //触发游戏的最小个数
            counts:[3,3,3,3,3,6],             //每一列最多个数
            path:'games/RegalTiger/',     //音效路径
            reelStopSound:'reel_stop',             //普通列停止
            symbolStopSound:'symbol_coin_land',         //特殊symbol停止音效
        },
    ],

    commEffect:{
        path:'games/RegalTiger/',
        win1:['win1','win1end'],
        win2:['win2','win2end']
    },

    helpItems:["games/RegalTiger/prefab/RegalTiger_Help_item1",
    "games/RegalTiger/prefab/RegalTiger_Help_item2",
    "games/RegalTiger/prefab/RegalTiger_Help_item3"],

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

}

module.exports = Cfg;
