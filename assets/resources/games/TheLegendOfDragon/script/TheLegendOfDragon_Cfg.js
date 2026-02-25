/**
 * 神龙配置
 */
let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol:{
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"animation",zIndex:100}}, //wild
        [2]:{node:"s2",win_node:"w2",win_ani:{name:"animation",zIndex:100}}, //红龙
        [3]:{node:"s3",win_node:"w3",win_ani:{name:"animation",zIndex:100}}, //粉龙
        [4]:{node:"s4",win_node:"w4",win_ani:{name:"animation",zIndex:100}}, //紫龙
        [5]:{node:"s5",win_node:"w5",win_ani:{name:"animation",zIndex:100}}, //蓝龙
        [6]:{node:"s6",win_node:"w6",win_ani:{name:"animation",zIndex:100}}, //绿龙
        [7]:{node:"s7"}, //A
        [8]:{node:"s8"}, //K
        [9]:{node:"s9"}, //Q
        [10]:{node:"s10"}, //J
        [11]:{node:"s11",win_node:"w11",win_ani:{name:"animation",zIndex:200},stop_ani:{name:"animation",zIndex:200},trigger_ani:{name:"animation1",zIndex:300}}, //scatter
        [12]:{node:"s12",win_node:"w12",win_ani:{name:"animation",zIndex:200}}, //龙珠
        [13]:{node:"s13",win_node:"w13",win_ani:{name:"animation",zIndex:200}}, //SpinFree+1
        [14]:{node:"s14",win_node:"w14",win_ani:{name:"animation",zIndex:200}}, //Multipler
    },

    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"TheLegendOfDragon_Slots",
        Reels:"LMSlots_Reel_Base",
        Symbols:"TheLegendOfDragon_Symbol",
    },
    //行列(必须)
    col:5,
    row:4,

    //symbol预制(必须)
    symbolPrefab:"TheLegendOfDragon_Symbol",
    //符号宽高(必须)
    symbolSize:{
        width:126,
        height:100,
    },

    //随机符号(必须)
    randomSymbols:[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10],

    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang:"TheLegendOfDragon_Kuang",

    //旋转速度(必须)
    speed:3000,

    //列停止间隔时间s
    reelStopInter:0.2,

    //旋转时间s:3s后旋转停止
    auto_stop_time:1,

    normalBgm:'base/base_bgm',

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
    
    //帮助界面
    helpItems:["games/TheLegendOfDragon/prefab/help/HelpPage1",
        "games/TheLegendOfDragon/prefab/help/HelpPage2",
        "games/TheLegendOfDragon/prefab/help/HelpPage3",
        "games/TheLegendOfDragon/prefab/help/HelpPage4",
        "games/TheLegendOfDragon/prefab/help/HelpPage5",
        "games/TheLegendOfDragon/prefab/help/HelpPage6",
        "games/TheLegendOfDragon/prefab/help/HelpPage7",
        "games/TheLegendOfDragon/prefab/help/HelpPage8",
    ],

    //通用音效配置
    commEffect:{
        path:'games/TheLegendOfDragon/',
        win1:['win1','win1end'], //小赢，2s左右
        win2:['win2','win2end'], //中赢，5s左右
        // win3:['win3','win3end'], //大赢，5s左右
    },

    //自动模式，每场的延迟
    autoModelDelay:0.8,

    //回弹效果
    bounce:true,
    bounceInfo:{
        distance:30,         //回弹距离
        time:0.1             //回弹时间
    },

    //加速动画时间
    AddAntiTime:1.5,

    //加速配置
    reelStateInfo:[
        {  
            id:[11],                //id
            mini:3,                 //触发游戏的最小个数
            counts:[1,0,1,0,1],     //每一列最多个数
            antiNode:"node_anti",           //加速节点
            path:'games/TheLegendOfDragon/',      //音效路径
            reelStopSound:'reel_stop',      //普通列停止
            symbolStopSound:'symbol_scatter',   //特殊symbol停止音效
            antSound:'reel_notify',         //加速音效
            antSpeed:2000,                  //加速度
        }
    ],
}

module.exports = Cfg;
