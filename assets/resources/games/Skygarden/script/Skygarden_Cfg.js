/**
 * @author Cui Guoyang
 * @date 2021/8/30
 * @description
 */

let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol: {
        [1]: {node: "symbol_1", win_node: "animation_1", win_ani: {name: "Wild", zIndex: 300}}, //wild
        //客户端自己扩展
        [2]: {
            node: "symbol_2",
            zIndex:100,
            win_node: "animation_2",
            stop_ani: {name: "Scatter_01", zIndex: 100},
            win_ani: {name: "Scatter_02", zIndex: 300}
        }, //Scatter
        [5]: {
            node: "symbol_4",
            win_node: "animation_4",
            win_ani: {name: "H1", zIndex: 300},
            trigger_ani: {name: "H1_liang", zIndex: 400}
        },
        [4]: {node: "symbol_5", win_node: "animation_5", win_ani: {name: "H2", zIndex: 300}},
        [7]: {node: "symbol_6", win_node: "animation_6", win_ani: {name: "H3", zIndex: 300}},
        [6]: {node: "symbol_7", win_node: "animation_7", win_ani: {name: "H4", zIndex: 300}},
        [8]: {node: "symbol_8", win_node: "animation_8", win_ani: {name: "H5", zIndex: 300}},
        [9]: {node: "symbol_9", win_node: "animation_9", win_ani: {name: "Lsymbol", zIndex: 300}},
        [10]: {node: "symbol_10", win_node: "animation_10", win_ani: {name: "Lsymbol", zIndex: 300}},
        [11]: {node: "symbol_11", win_node: "animation_11", win_ani: {name: "Lsymbol", zIndex: 300}},
        [12]: {node: "symbol_12", win_node: "animation_12", win_ani: {name: "Lsymbol", zIndex: 300}},
        [13]: {node: "symbol_13", win_node: "animation_13", win_ani: {name: "Lsymbol", zIndex: 300}},
        [201]: {
            node: "symbol_201",
            win_node: "animation_3",
            win_ani: {name: "JP_Qiu_D_Bai", zIndex: 300},
            ball_ani: {name: "JP_Qiu_D_Mini", zIndex: 300},
            effect_ani: {name: "Qiu_D_Mini"},
        },
        [202]: {
            node: "symbol_202",
            win_node: "animation_3",
            win_ani: {name: "JP_Qiu_D_Bai", zIndex: 300},
            ball_ani: {name: "JP_Qiu_D_Minor", zIndex: 300},
            effect_ani: {name: "Qiu_D_Minor"},
        },
        [203]: {
            node: "symbol_203",
            win_node: "animation_3",
            win_ani: {name: "JP_Qiu_D_Bai", zIndex: 300},
            ball_ani: {name: "JP_Qiu_D_Major", zIndex: 300},
            effect_ani: {name: "Qiu_D_Major"},
        },
        [204]: {
            node: "symbol_204",
            win_node: "animation_3",
            win_ani: {name: "JP_Qiu_D_Bai", zIndex: 300},
            ball_ani: {name: "JP_Qiu_D_Grand", zIndex: 300},
            effect_ani: {name: "Qiu_D_Grand"},
        },
    },

    //脚本组件(必须)
    scripts: {
        Top: "LMSlots_Top_Base",
        Bottom: "LMSlots_Bottom_Base",
        Slots: "Skygarden_Slots",
        Reels: "Skygarden_Reel",
        Symbols: "Skygarden_Symbol",
    },
    //行列(必须)
    col: 5,
    row: 5,

    //symbol预制(必须)
    symbolPrefab: "symbol",
    //符号宽高(必须)
    symbolSize: {
        width: 114,
        height: 90,
    },
    //随机符号(必须)
    randomSymbols: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],

    // wildID
    wildId: 1,

    // scatter
    scatterId: 2,

    bonusIds: [201, 202, 203, 204],

    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang: "kuang",

    //旋转速度(必须)
    speed: 1500,

    //列停止间隔时间s
    reelStopInter: 0.3,

    //旋转时间s:3s后旋转停止
    auto_stop_time: 1,

    //回弹效果
    bounceInfo: {
        distance: 30,
        time: 0.4
    },

    autoModelDelay: 1,

    AddAntiTime: 1.5,

    reelStateInfo: [
        {
            id: [2],
            mini: 5,
            counts: [1, 1, 1, 1, 1],
            antiNode: "node_anti",
            path: 'games/Skygarden/',
            reelStopSound: 'reelstop',
            symbolStopSound: 'reelsctr',
            antSound: 'reelfast',
            antSpeed: 2000,
        },
    ],


    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

    //帮助界面的预制路径（不设置就使用下面的默认）
    // help_prefab:"slots_common/SlotRes/prefab/LMSlots_Help_prefab",
    //帮助界面的子页
    helpItems: ["games/Skygarden/prefab/help_item_1",
        "games/Skygarden/prefab/help_item_2",
        "games/Skygarden/prefab/help_item_3",
        "games/Skygarden/prefab/help_item_4"
    ],

    commEffect: {
        path: 'games/Skygarden/',
        win1: ['win_a', 'win_end'], //小赢，2s左右
        win2: ['win_b', 'win_end'], //中赢，5s左右
        win3: ['win_c', 'win_end'], //中赢，5s左右
        win4: ['win_d', 'win_end'], //中赢，5s左右
    },

    normalBgm: "ngbgm",
};

module.exports = Cfg;