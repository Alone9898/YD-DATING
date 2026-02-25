/**
 * 埃及艳后配置
 */
let Cfg = {
    //符号配置(必须)
    symbol:{
        //客户端自己扩展

        [1]:{node:"s1",win_node:"w1",win_ani:{name:"animation2",zIndex:100}},                          //wild
        [2]:{node:"s13",win_node:"w13",zIndex:100,stop_ani:{name:"animation2",zIndex:200}, trigger_ani: {name:"animation",zIndex:400}}, //艳后scatter
        [3]:{node:"s14",win_node:"w14"}, //带倍率的wild 分为102 103 104 105 107 110
        [4]:{node:"s2",win_node:"w2",win_ani:{name:"animation",zIndex:100}}, //橙色图标
        [5]:{node:"s3",win_node:"w3",win_ani:{name:"animation",zIndex:100}},  //红色图标
        [6]:{node:"s4",win_node:"w4",win_ani:{name:"animation",zIndex:100}}, //紫色图标
        [7]:{node:"s5",win_node:"w5",win_ani:{name:"animation",zIndex:100}}, //蓝色图标
        [8]:{node:"s6",win_node:"w6",win_ani:{name:"animation",zIndex:100}}, //绿色图标
        [9]:{node:"s7",win_node:"w7",win_ani:{name:"animation",zIndex:100}}, //A
        [10]:{node:"s8",win_node:"w8",win_ani:{name:"animation",zIndex:100}}, //K
        [11]:{node:"s9",win_node:"w9",win_ani:{name:"animation",zIndex:100}}, //Q
        [12]:{node:"s10",win_node:"w10",win_ani:{name:"animation",zIndex:100}}, //J
        [13]:{node:"s11",win_node:"w11",win_ani:{name:"animation",zIndex:100}},  //10
        [14]:{node:"s12",win_node:"w12",stop_ani:{name:"animation_1",zIndex:100}, trigger_ani: {name:"animation_2",zIndex:400}},  //狮身人面兽
        [102]:{node:"s14",win_node:"w14",win_ani:{name:"animation2",zIndex:100}}, //带倍率的wild
        [103]:{node:"s14",win_node:"w14",win_ani:{name:"animation3",zIndex:100}}, //带倍率的wild
        [104]:{node:"s14",win_node:"w14",win_ani:{name:"animation4",zIndex:100}}, //带倍率的wild
        [105]:{node:"s14",win_node:"w14",win_ani:{name:"animation5",zIndex:100}}, //带倍率的wild
        [107]:{node:"s14",win_node:"w14",win_ani:{name:"animation7",zIndex:100}}, //带倍率的wild
        [110]:{node:"s14",win_node:"w14",win_ani:{name:"animation10",zIndex:100}}, //带倍率的wild
    },
    
    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"G_Cleopatra_Bottom",
        Slots:"G_Cleopatra_Slots",
        Reels:"LMSlots_Reel_Base",
        Symbols:"G_Cleopatra_Symbol",
    },
    //行列(必须)
    col:5,
    row:4,

    //scatter定义，用来计算控制免费加速动画
    scatterId:2,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",
    //符号宽高(必须)
    symbolSize:{
        width:119,
        height:81,
    },
    //随机符号(必须)
    randomSymbols:[4,5,6,7,8,9,10,11,12,13],

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

    autoModelDelay: 0.5,
    
    normalBgm:'base_bgm',
    
    soundCfg:{
        base_bgm:'base_bgm',                           //背景音乐
        free_bgm:'free_bgm',
    },

    bounceInfo:{
        distance:20,         //回弹距离
        time:0.1             //回弹时间
    },

    reelStateInfo:[
        {
            id:[2],       //id
            mini:3,     //触发游戏的最小个数
            counts:[1,0,1,0,1],             //每一列最多个数
            antiNode:"node_anti",     //加速节点
            path:'games/G_Cleopatra/',     //音效路径
            reelStopSound:'reel_stop',             //普通列停止
            symbolStopSound:'symbol_scatter',         //特殊symbol停止音效
            antSound:'anticipation1',                //加速音效
            antSpeed:2000,                           //加速度
        },
    ],

//收集游戏配置 pyramid指消耗的金字塔数1
SPINE : { //免费游戏次数
    pyramid : {init : 120, add : 40},   //初始3次是120, 每增加一次叠加40
    num : {min : 3, max : 50, },        //1表示3次,发送1~48, 表示3~50次
    comment : "free game spins"
},
SINGLE : {
    S1 : {
        pyramid : [105,255,480,855,1380],
        value : ["1","2","3","4","5"],
        comment : "sticky wilds"
    },  //sticky wilds:使收集游戏X个WILD随机固定出现在卷轴上，X为1-5，X玩家选择
    S2 : {
        pyramid : [855, 2130, 4380], 
        value : ["2X-5X", "3X-7X", "4X-10X"], 
        comment : "multipler wilds"
    }, //multipler wilds：使收集游戏中出现的wild都携带一个范围内的随机倍数，wild参与的连线奖励会乘以倍数，多个wild在一条连线上奖励相乘
    S3 : {
        pyramid : [105, 255, 480, 855, 1320],
        value : ["1","2","3","4","5"], 
        comment : "random wilds"
    }, //random wilds:每次旋转会随机出现X个wild在卷轴上，X玩家选择，X选择范围1-5
    S4 : {
        pyramid : [105, 150, 195, 240, 420],
        symbolid : [[13], [13, 12], [13, 12, 11], [13, 12, 11, 10], [13, 12, 11, 10, 9]],
        comment : "remove symbols"
    }, //remove symbols:删除卷轴中的X个普通图标，X玩家选择，X选择范围1-5
    S5 : {
        pyramid : [15, 60, 225], 
        value : ["5", "4,5", "3,4,5"],
        reel : [3, 4, 5], comment : "expanding wild",
    }, //expanding wild:使列X上出现的wild会扩张到整列
},

//组合条件消耗金字塔数量
GROUP : {
    G6 : {type_1_1:1155,type_1_2:1380,type_1_3:1710,type_1_4:2130,type_1_5:2730,
        type_2_1:2430,type_2_2:2880,type_2_3:3630,type_2_4:4080,type_2_5:5055,
        type_3_1:6330,type_3_2:6630,type_3_3:8130,type_3_4:9105,type_3_5:10680},
    G7 : {type_1_1:3150,type_1_2:7650,type_1_3:19875,type_1_4:46050,type_1_5:103500,
        type_2_1:6900,type_2_2:22950,type_2_3:61500,type_2_4:157500,type_2_5:345000,
        type_3_1:21225,type_3_2:83250,type_3_3:186750,type_3_4:655500,type_3_5:1552000},
    G8 : {type_1_1:120,type_1_2:210,type_1_3:435,
        type_2_1:300,type_2_2:420,type_2_3:735,
        type_3_1:555,type_3_2:765,type_3_3:1110,
        type_4_1:945,type_4_2:1185,type_4_3:1620,
        type_5_1:1635,type_5_2:1800,type_5_3:2325}
    },

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

commEffect:{
    path:'games/G_Cleopatra/',
    win1:['win1','win1end'],
    win2:['win2','win2end']
},

helpItems:["games/G_Cleopatra/prefab/G_Cleopatra_Help_item1",
    "games/G_Cleopatra/prefab/G_Cleopatra_Help_item2",
    "games/G_Cleopatra/prefab/G_Cleopatra_Help_item3",
    "games/G_Cleopatra/prefab/G_Cleopatra_Help_item4"],

}

module.exports = Cfg;
