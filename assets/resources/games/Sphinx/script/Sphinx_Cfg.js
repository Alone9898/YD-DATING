
let Cfg = {

    symbol: {
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"animation",zIndex:300}}, // wild
        [2]:{node:"s2",win_node:"w2",stop_ani:{name:"animation1",zIndex:300},idle_ani:{name:"animation2",zIndex:300},trigger_ani:{name:"animation3",zIndex:300}}, // scatter
        [3]:{node:"s3",win_node:"w3",stop_ani:{name:"animation1",zIndex:100},await_ani:{name:"animation2",zIndex:100},
            // idle_node:"w_guang",idle_ani:{name:"animation1",zIndex:100},
            prep_node:"jinbizhuan", prep_ani:{name:"animation",zIndex:100},

            }, // bonus
        [4]:{node:"s4",win_node:"w4",win_ani:{name:"animation",zIndex:300},del_id:1}, // 法老
        [5]:{node:"s5",win_node:"w5",win_ani:{name:"animation",zIndex:300},del_id:2}, // 牛
        [6]:{node:"s6",win_node:"w6",win_ani:{name:"animation",zIndex:300},del_id:3}, // 狗
        [7]:{node:"s7",win_node:"w7",win_ani:{name:"animation",zIndex:300},del_id:4}, // 猫
        [8]:{node:"s8",win_node:"w8",win_ani:{name:"animation",zIndex:300},del_id:5}, // 蛇
        [9]:{node:"s9",win_node:"w9",win_ani:{name:"animation",zIndex:300},del_id:6}, // 鸟
        [10]:{node:"s10",win_node:"w10",win_ani:{name:"animation",zIndex:300},del_id:7}, // A
        [11]:{node:"s11",win_node:"w11",win_ani:{name:"animation",zIndex:300},del_id:8}, // K
        [12]:{node:"s12",win_node:"w12",win_ani:{name:"animation",zIndex:300},del_id:9}, // Q
        [13]:{node:"s13",win_node:"w13",win_ani:{name:"animation",zIndex:300},del_id:10}, // J
        [14]:{node:"s14",win_node:"w14",win_ani:{name:"animation",zIndex:300},del_id:11}, // 10
        [15]:{node:"s15",win_node:"w15",win_ani:{name:"animation",zIndex:300},del_id:12}, // 9

        [301]:{node:"s301",win_node:"w301",stop_ani:{name:"animation1",zIndex:100},await_ani:{name:"animation2",zIndex:100},
            // idle_node:"w_guang",idle_ani:{name:"animation6",zIndex:100},
            prep_node:"caibizhuan", prep_ani:{name:"animation",zIndex:100},
            }, // 特殊bonus图标
    },

    bonus_symbol:{
        free:{node:"w_free",open_ani:{name:"animation%s",zIndex:100},trigger_ani:{name:"animation%s_2",zIndex:100},resume_ani:{name:"animation%s_2",zIndex:100}},
        jackpot:{node:"w_jp",open_ani:{name:"animation",zIndex:100},trigger_ani:{name:"animation_2",zIndex:100},resume_ani:{name:"animation_3",zIndex:100}},
        coin:{node:"w_coin",open_ani:{name:"animation",zIndex:100},show_ani:{name:"animation_2",zIndex:100},resume_ani:{name:"animation_3",zIndex:100}},
        megaCoin:{node:"w_m_coin",open_ani:{name:"animation",zIndex:100},show_ani:{name:"animation_2",zIndex:100},resume_ani:{name:"animation_3",zIndex:100}},
        superCoin:{node:"w_s_coin",open_ani:{name:"animation",zIndex:100},show_ani:{name:"animation_2",zIndex:100},resume_ani:{name:"animation_3",zIndex:100}},
        powerUp:{node:"w_power",open_ani:{name:"animation",zIndex:100},show_ani:{name:"animation_2",zIndex:100},trigger_ani:{name:"animation_2",zIndex:100},resume_ani:{name:"animation_3",zIndex:100}},
    },


    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"Sphinx_Slots",
        Reels:"Sphinx_Reel",
        Symbols:"Sphinx_Symbol",
    },

    //行列(必须)
    col:5,
    row:3,

    //symbol预制(必须)
    symbolPrefab:"LMSlots_Symbol",
    //符号宽高(必须)
    symbolSize:{
        //width:128,
        height:128,
    },

    //随机符号(必须)
    // randomSymbols:[1,4,5,6,7,8,9,10,11,12,13,14,15],

    cardmap:{
        [1]: [13,8,8,4,7,7,14,2,6,6,10,4,5,4,2,5,4,11,10,2,4,11,11,11,4,8,7,7,2,5,4,14,12,12,5,5,12,4,4,9,9,15,6,9,15,6,5,12,12,7,8,15,8,4,4,7,4,4,11,9,6,6,7,10,13,5,13,10,6,6,10,4,4,9,5,14,15,8,14,14,13,13,7,5,5,6,6,15],
        [2]: [7,5,5,10,4,4,11,11,2,4,9,5,4,6,2,13,13,6,6,1,14,14,9,2,6,6,1,4,4,1,4,2,5,6,15,15,15,12,12,12,4,4,5,10,7,11,11,7,7,8,14,14,7,7,14,15,15,8,9,1,8,5,8,9,9,4,1,6,10,10,10,4,4,6,7,13,7,4,8,8,4,5,12,12,13,13,6,5,5,4,5,6,11],
        [3]: [1,11,11,8,8,1,13,2,5,5,14,14,6,7,12,12,2,9,9,15,6,14,14,14,7,2,1,10,7,12,4,2,6,5,5,13,13,8,7,7,12,8,8,15,15,1,15,15,7,10,10,4,11,5,5,6,6,4,4,5,5,7,7,4,13,13,12,5,10,10,4,4,8,9,1,6,11,11,4,5,6,4,9,6,4,6,4,4,9,6,4,4,4],
        [4]: [12,12,5,5,1,9,9,13,13,2,7,1,6,6,10,5,2,6,6,8,5,4,10,10,10,2,8,11,11,7,7,9,9,8,8,2,1,4,4,14,14,4,4,15,15,15,10,6,6,5,5,1,12,12,12,13,5,15,15,13,13,7,14,7,1,4,6,6,8,11,4,4,7,7,11,4,14,14,6,9,4,4,7,6,4,11,8,5,4,4,5,4,5],
        [5]: [7,9,4,13,13,15,15,2,13,13,13,6,14,14,14,8,7,2,1,4,4,6,7,7,10,10,10,2,6,8,14,12,12,5,5,2,4,6,11,11,6,6,7,9,8,8,11,11,11,7,4,6,6,10,5,5,1,4,1,4,4,7,8,5,1,7,15,15,6,6,1,12,12,5,5,9,4,4,12,5,4,4,9,5,9,5,15,4,4,10,8,14,4],
    },

    cardmapFree:{
        [1]: [7,8,8,5,8,6,6,2,5,4,9,8,8,4,2,6,6,8,6,7,7,6,7,7,9,9,6,4,8,5,5,7,5,5,8,7,4,9,4,5,5,7,4,5,5,6,6,4,9,9,4,7,6,4,7,4,9,9,4,4],
        [2]: [8,5,9,7,7,5,5,2,8,8,6,5,6,6,4,2,7,4,7,8,7,8,9,4,1,6,6,5,6,5,5,6,4,9,9,8,8,4,7,9,9,5,7,7,5,5,4,1,4,8,4,1,4,6,4,6,4,6,7,7,4,9,9,1],
        [3]: [4,5,5,7,4,7,2,6,6,8,8,1,7,4,2,6,8,7,5,9,9,4,8,5,4,9,1,6,1,5,7,9,9,4,9,7,7,8,5,6,6,4,6,6,5,5,7,1,7,4,7,8,6,4,5,5,8,9,4,8,9,6,4,4],
        [4]: [4,8,8,5,5,1,6,2,7,7,4,7,7,1,6,2,7,9,6,4,1,4,6,9,4,9,9,7,8,8,4,6,6,9,9,4,5,4,6,8,8,7,5,1,5,5,7,5,6,6,9,8,4,5,5,4,8,4,6,7,9,5,4,7],
        [5]: [8,9,4,7,4,2,9,5,4,6,6,5,2,4,6,8,8,9,9,5,8,8,6,6,4,1,6,6,8,8,9,7,4,9,5,4,1,5,4,6,4,5,8,4,1,7,7,9,7,5,7,7,6,6,9,7,7,4,5,7,5,1,5,4],
    },

    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang:"kuang",

    //自动模式，每场的延迟
    autoModelDelay:1,

    //旋转速度(必须)
    speed:3000,

    //列停止间隔时间s
    reelStopInter:0.2,

    //旋转时间s:3s后旋转停止
    auto_stop_time:1,

    //回弹效果
    bounceInfo:{
        distance:20,         //回弹距离
        time:0.1             //回弹时间
    },

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

    //帮助界面的子页
    helpItems:["games/Sphinx/prefab/help_node/LMSlots_Help_item1",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item2",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item3",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item4",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item5",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item6",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item7",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item8",
        "games/Sphinx/prefab/help_node/LMSlots_Help_item9",
    ],

    commEffect:{
        path:'games/Sphinx/',
        win1:['win1','win1end'], //小赢，2s左右
        win2:['win2','win2end'], //中赢，5s左右
        // clickSpin:'filepath',   //点击spine的音效
    },

    //加速动画时间
    AddAntiTime:1.5,

    normalBgm:"base_bgm",

    reelStateInfo:[
        {
            id:[2],                                 //id
            mini:3,                                 //触发游戏的最小个数
            counts:[1,1,1,1,1],                     //每一列最多个数
            antiNode:"node_anti",                   //加速节点
            path:'games/Sphinx/',     //音效路径
            reelStopSound:'reel_stop',              //普通列停止
            symbolStopSound:['scatter1','scatter2','scatter3','scatter4','scatter5'],         //特殊symbol停止音效
            antSound:['reel_active1','reel_active2','reel_active3'],           //加速音效
            antSpeed:2200,                          //加速度
            type:"free",                            // 类型
        },
        {
            id:[3,301],                               //id
            mini:1,                                 //触发游戏的最小个数
            counts:[1,1,1,1,1],                     //每一列最多个数
            // antiNode:"",                  //加速节点
            path:'games/Sphinx/',     //音效路径
            reelStopSound:'reel_stop',              //普通列停止
            symbolStopSound:['coin_land1','coin_land2','coin_land3','coin_land4','coin_land5'],           //特殊symbol停止音效
            // antSound:'',          //加速音效
            antSpeed:2200,                          //加速度
            type:"bonus",                           // 类型
        },
    ],
}

module.exports = Cfg;
