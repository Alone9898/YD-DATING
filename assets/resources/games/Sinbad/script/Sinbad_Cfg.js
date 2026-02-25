/**
 * 配置
 */
let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol:{
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"Wild_Loop",zIndex:300},isMask:true}, //wild
        [2]:{node:"s2",win_node:"w2",win_ani:{name:"Scatter_Loop",zIndex:300},trigger_ani:{name:"Scatter_Loop",zIndex:300},stop_ani:{name:"Scatter_Intro",zIndex:100},isMask:true}, //scatter(指南针)
        [3]:{node:"s3",win_node:"w3",stop_ani:{name:"Bonus",zIndex:300},isMask:false}, //bonus(钱币)
        [4]:{node:"s4",win_node:"w4",win_ani:{name:"H1",zIndex:300},isMask:true}, //海盗
        [5]:{node:"s5",win_node:"w5",win_ani:{name:"H2",zIndex:300},isMask:true}, //猴子
        [6]:{node:"s6",win_node:"w6",win_ani:{name:"H3",zIndex:300},isMask:true}, //鹦鹉
        [7]:{node:"s7",win_node:"w7",win_ani:{name:"H4",zIndex:300},isMask:true}, //地图
        [8]:{node:"s8",win_node:"w8",win_ani:{name:"H5",zIndex:300},isMask:true}, //锚
        [9]:{node:"s9",win_node:"",isMask:true}, //A
        [10]:{node:"s10",win_node:"",isMask:true}, //K
        [11]:{node:"s11",win_node:"",isMask:true}, //Q
        [12]:{node:"s12",win_node:"",isMask:true}, //J
        [13]:{node:"s13",win_node:"",isMask:true}, //10
        [14]:{node:"s14",win_node:"",isMask:true}, //9
    },


    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"Sinbad_Slots",
        Reels:"Sinbad_Reels",
        Symbols:"Sinbad_Symbol",
    },

    //行列(必须)
    col:5,
    row:3,
    bonusCol:15,
    bonusRow:1,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",
    //符号宽高(必须)
    symbolSize:{
        //width:112,
        height:102,
    },
    //随机符号(必须)
    randomSymbols:[1,3,4,5,6,7,8,9,10,11,12,13,14],
    randomBonusSymbols:[1,4,5,6,7,8,9,10,11,12,13,14],
    // cardmap:{
    //     [1]: [13,8,8,4,7,7,14,2,6,6,10,4,5,4,2,5,4,11,10,2,4,11,11,11,4,8,7,7,2,5,4,14,12,12,5,5,12,4,4,9,9,15,6,9,15,6,5,12,12,7,8,15,8,4,4,7,4,4,11,9,6,6,7,10,13,5,13,10,6,6,10,4,4,9,5,14,15,8,14,14,13,13,7,5,5,6,6,15],
    //     [2]: [7,5,5,10,4,4,11,11,2,4,9,5,4,6,2,13,13,6,6,1,14,14,9,2,6,6,1,4,4,1,4,2,5,6,15,15,15,12,12,12,4,4,5,10,7,11,11,7,7,8,14,14,7,7,14,15,15,8,9,1,8,5,8,9,9,4,1,6,10,10,10,4,4,6,7,13,7,4,8,8,4,5,12,12,13,13,6,5,5,4,5,6,11],
    //     [3]: [1,11,11,8,8,1,13,2,5,5,14,14,6,7,12,12,2,9,9,15,6,14,14,14,7,2,1,10,7,12,4,2,6,5,5,13,13,8,7,7,12,8,8,15,15,1,15,15,7,10,10,4,11,5,5,6,6,4,4,5,5,7,7,4,13,13,12,5,10,10,4,4,8,9,1,6,11,11,4,5,6,4,9,6,4,6,4,4,9,6,4,4,4],
    //     [4]: [12,12,5,5,1,9,9,13,13,2,7,1,6,6,10,5,2,6,6,8,5,4,10,10,10,2,8,11,11,7,7,9,9,8,8,2,1,4,4,14,14,4,4,15,15,15,10,6,6,5,5,1,12,12,12,13,5,15,15,13,13,7,14,7,1,4,6,6,8,11,4,4,7,7,11,4,14,14,6,9,4,4,7,6,4,11,8,5,4,4,5,4,5],
    //     [5]: [7,9,4,13,13,15,15,2,13,13,13,6,14,14,14,8,7,2,1,4,4,6,7,7,10,10,10,2,6,8,14,12,12,5,5,2,4,6,11,11,6,6,7,9,8,8,11,11,11,7,4,6,6,10,5,5,1,4,1,4,4,7,8,5,1,7,15,15,6,6,1,12,12,5,5,9,4,4,12,5,4,4,9,5,9,5,15,4,4,10,8,14,4],
    // },

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
    helpItems:["games/Sinbad/prefab/help_node/LMSlots_Help_item1",
        "games/Sinbad/prefab/help_node/LMSlots_Help_item2",
    ],

    commEffect:{
        path:'games/Sinbad/',
        win1:['win_a','win_end'], //小赢，2s左右
        win2:['win_b','win_end'], //中赢，5s左右
        // win3:['win_c','win_end'], //中赢，5s左右
        // win4:['win_d','win_end'], //中赢，5s左右
        // clickSpin:'filepath',   //点击spine的音效
    },

    //加速动画时间
    AddAntiTime:1.8,

    normalBgm:"ngbgm",
    reelStateInfo:[
        {
            id:[2],       //id
            mini:3,     //触发游戏的最小个数
            counts:[1,1,1,1,1],             //每一列最多个数
            antiNode:"node_anti",     //加速节点
            path:'games/Sinbad/',     //音效路径
            reelStopSound:'reelstop',             //普通列停止
            symbolStopSound:'reelsctr',         //特殊symbol停止音效
            antSound:'reelfast',                //加速音效
            antSpeed:2000,                           //加速度
        },
        // {
        //     id:[3],       //id
        //     mini:1,     //触发游戏的最小个数
        //     counts:[1,1,1,1,1],             //每一列最多个数
        //     antiNode:"",     //加速节点
        //     path:'games/Sinbad/',     //音效路径
        //     reelStopSound:'reelstop',             //普通列停止
        //     symbolStopSound:'reelcoin',         //特殊symbol停止音效
        //     antSound:'',                //加速音效
        //     antSpeed:2000,                           //加速度
        // },
    ],
}

module.exports = Cfg;