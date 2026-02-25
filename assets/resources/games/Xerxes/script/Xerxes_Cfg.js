/**
 * 配置
 */
let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol:{
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"actionframe",zIndex:300}}, //wild
        [2]:{node:"s2",win_node:"w2",win_ani:{name:"actionframe",zIndex:300},trigger_ani:{name:"actionframe",zIndex:300},stop_ani:{name:"buling",zIndex:100}}, //scatter
        [3]:{node:"s3",win_node:"s3",kuang_node:"kuangFire",
            trigger_ani:{name:"b_chufa",zIndex:300},
            // stop_logoAni:{name:"Scatter_Flip_logo",zIndex:100},stop_numAni:{name:"Scatter_Flip_Num",zIndex:100},
            }, //bonus
        [4]:{node:"s4",win_node:"w4",win_ani:{name:"actionframe",zIndex:300}}, //士兵
        [5]:{node:"s5",win_node:""}, //头盔
        [6]:{node:"s6",win_node:""}, //盾牌
        [7]:{node:"s7",win_node:""}, //葡萄酒
        [8]:{node:"s8",win_node:""}, //A
        [9]:{node:"s9",win_node:""}, //K
        [10]:{node:"s10",win_node:""}, //Q
        [11]:{node:"s11",win_node:""}, //J
        [12]:{node:"s12",win_node:""}, //10

        [301]:{node:"s301",win_node:"s301",stop_ani:{name:"b_up_stop",zIndex:100},trigger_ani:{name:"b_up_tri",zIndex:100}},   // bonus-上升图标
        [302]:{node:"s302",win_node:"s302",stop_ani:{name:"b_extra_stop",zIndex:100},trigger_ani:{name:"b_extra_tri",zIndex:100}},   // bonus-扩散图标
    },


    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"Xerxes_Slots",
        Reels:"Xerxes_Reels",
        Symbols:"Xerxes_Symbol",
    },

    //行列(必须)
    col:5,
    row:3,
    bonusCol:30,
    bonusRow:1,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",
    bonusSymbolPrefab:"Bonus_Symbol",
    //符号宽高(必须)
    symbolSize:{
        //width:129,
        height:116,
    },
    //随机符号(必须)
    randomSymbols:[3,4,5,6,7,8,9,],
    randomBonusSymbols:[4,5,6,7,8,9,],
    bonusCoinMultList:[0.5,1,2,2.5,3,4,6,8,10],//bonus彩金随机滚动是相对押注额的倍率


    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang:"kuang",

    //自动模式，每场的延迟
    autoModelDelay:1,

    //旋转速度(必须)
    speed:1800,

    //列停止间隔时间
    reelStopInter:0.4,
    bonusReelStopInter:0.2,

    //旋转时间s:3s后旋转停止
    auto_stop_time:1.2,

    //回弹效果
    bounceInfo:{
        distance:45,         //回弹距离
        time:0.4             //回弹时间
    },

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

    //帮助界面的子页
    helpItems:["games/Xerxes/prefab/help_node/LMSlots_Help_item1",
        "games/Xerxes/prefab/help_node/LMSlots_Help_item2",
        "games/Xerxes/prefab/help_node/LMSlots_Help_item3",
        "games/Xerxes/prefab/help_node/LMSlots_Help_item4",
        "games/Xerxes/prefab/help_node/LMSlots_Help_item5",
        // "games/Xerxes/prefab/help_node/LMSlots_Help_item6",
    ],

    commEffect:{
        path:'games/Xerxes/',
        win1:['music_Pomi_last_win_1',''], //小赢，2s左右
        win2:['music_Pomi_last_win_2',''], //中赢，5s左右
        // win3:['music_Pomi_last_win_3',''], //中赢，5s左右
        // clickSpin:'filepath',   //点击spine的音效
    },

    //加速动画时间
    AddAntiTime:1.8,

    normalBgm:"music_Pomi_normal_Bg",
    reelStateInfo:[
        {
            id:[2],       //id
            mini:3,     //触发游戏的最小个数
            counts:[1,1,1,1,1],             //每一列最多个数
            antiNode:"node_anti",     //加速节点
            path:'games/Xerxes/',     //音效路径
            reelStopSound:'music_Pomi_Reel_Stop',             //普通列停止
            symbolStopSound:'music_Pomi_Scatter_Down_1',         //特殊symbol停止音效
            antSound:'anticipation',                //加速音效
            antSpeed:2000,                           //加速度
        },
        {
            id:[3],       //id
            mini:1,     //触发游戏的最小个数
            counts:[1,1,1,1,1],             //每一列最多个数
            antiNode:"",     //加速节点
            path:'games/Xerxes/',     //音效路径
            reelStopSound:'music_Pomi_Reel_Stop',             //普通列停止
            symbolStopSound:'music_Pomi_Bonus_down_base',         //特殊symbol停止音效
            antSound:'',                //加速音效
            antSpeed:2000,                           //加速度
        },
    ],
}

module.exports = Cfg;