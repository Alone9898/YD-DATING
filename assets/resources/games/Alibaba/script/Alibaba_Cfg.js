/**
 * @author Cui Guoyang
 * @date 2021/9/24
 * @description
 */

let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol: {
        [1]: {node: "symbol_1", win_node: "animation_1"}, //wild
        //客户端自己扩展
        [2]: {
            node: "symbol_2",
            zIndex:100,
            win_node: "animation_2",
            stop_ani: {name: "Scatter_01", zIndex: 100},
            win_ani: {name: "Scatter_02", zIndex: 300}
        }, //Scatter
        [3]: {node: "symbol_3"}, //bonus
        [4]: {node: "symbol_4", win_node: "animation_4", win_ani: {name: "H1", zIndex: 300}},
        [5]: {node: "symbol_5", win_node: "animation_5", win_ani: {name: "H2", zIndex: 300}},
        [6]: {node: "symbol_6", win_node: "animation_6", win_ani: {name: "H3", zIndex: 300}},
        [7]: {node: "symbol_7", win_node: "animation_7", win_ani: {name: "H4", zIndex: 300}},
        [8]: {node: "symbol_8", win_node: "animation_8", win_ani: {name: "H5", zIndex: 300}},
        [9]: {node: "symbol_9"},
        [10]: {node: "symbol_10"},
        [11]: {node: "symbol_11"},
        [12]: {node: "symbol_12"},
        [13]: {node: "symbol_13"},
    },

    mapCfg: [
        {car_rotation: 0, direction:1},
        {car_rotation: 0, direction:1, detail: 0},
        {car_rotation: -39, direction:1},
        {car_rotation: -39, direction:1},
        {car_rotation: -39, direction:1},
        {car_rotation: -39, direction:1},
        {car_rotation: 0, direction:-1, detail: 1},
        {car_rotation: 23, direction:-1},
        {car_rotation: 23, direction:-1},
        {car_rotation: 23, direction:-1},
        {car_rotation: 23, direction:-1},
        {car_rotation: 23, direction:-1},
        {car_rotation: 0, direction:1, detail: 2},
        {car_rotation: -34.5, direction:1},
        {car_rotation: -34.5, direction:1},
        {car_rotation: -34.5, direction:1},
        {car_rotation: -34.5, direction:1},
        {car_rotation: -34.5, direction:1},
        {car_rotation: -34.5, direction:1},
        {car_rotation: 0, direction:1, detail: 3},
    ],

    bigPoint: [2, 7, 13, 20],

    //脚本组件(必须)
    scripts: {
        Top: "LMSlots_Top_Base",
        Bottom: "LMSlots_Bottom_Base",
        Slots: "Alibaba_Slots",
        Reels: "Alibaba_Reel",
        Symbols: "Alibaba_Symbol",
    },
    //行列(必须)
    col: 5,
    row: 3,

    //symbol预制(必须)
    symbolPrefab: "symbol",
    //符号宽高(必须)
    symbolSize: {
        width: 128,
        height: 114,
    },
    //随机符号(必须)
    randomSymbols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    bonusRandomSymbols: [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],

    // wildID
    wildId: 1,

    // scatter
    scatterId: 2,

    bonusId: 3,

    collectSymbolId: 3,
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

    reelStateInfo:[
        {
            id:[2],
            mini:3,
            counts:[1, 1, 1, 1, 1],
            antiNode:"node_anti",
            path:'games/Alibaba/',
            reelStopSound:'reelstop',
            symbolStopSound:'',
            antSound:'reelfast',
            antSpeed:2000,
        },
    ],

    //帮助界面的预制路径（不设置就使用下面的默认）
    // help_prefab:"slots_common/SlotRes/prefab/LMSlots_Help_prefab",
    //帮助界面的子页
    helpItems:["games/Alibaba/prefab/help_item_1",
        "games/Alibaba/prefab/help_item_2"
    ],

    commEffect:{
        path:'games/Alibaba/',
        win1:['win_a','win_end'], //小赢，2s左右
        win2:['win_b','win_end'], //中赢，5s左右
        // win3:['win_c','win_end'], //中赢，5s左右
        // win4:['win_d','win_end'], //中赢，5s左右
    },

    bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",

    normalBgm:"ngbgm",
};

module.exports = Cfg;