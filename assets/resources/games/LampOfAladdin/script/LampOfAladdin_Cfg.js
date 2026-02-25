  /**
 * 苏轼的情人配置
 */
let Cfg = {
    //符号配置(必须)
    //stop_ani:符号停止的时候播放的动画
    symbol:{
        //客户端自己扩展
        [1]:{node:"s1",win_node:"w1",win_ani:{name:"animation", zIndex:100}}, //中东男
        [2]:{node:"s2",win_node:"w2",win_ani:{name:"animation", zIndex:100}}, //中东女
        [3]:{node:"s5",win_node:"w5",win_ani:{name:"animation", zIndex:100}},  //卷轴
        [4]:{node:"s6",win_node:"w6",win_ani:{name:"animation", zIndex:100}}, //羽毛宝石
        [5]:{node:"s7",win_node:"w7",win_ani:{name:"animation", zIndex:100}}, //小刀
        [6]:{node:"s8",win_node:"w8",win_ani:{name:"animation", zIndex:100}}, //绿色头冠
        [7]:{node:"s3",win_node:"w3",win_ani:{name:"animation", zIndex:100}}, //卡通马
        [8]:{node:"s4",win_node:"w4",win_ani:{name:"animation", zIndex:100}}, //卡通鸡
        [9]:{node:"s9",zIndex:100,win_node:"w9",win_ani:{name:"animation", zIndex:300},stop_ani:{name:"animation1", zIndex:300}}, //scatter 茶壶转盘
        [10]:{node:"s10",win_node:"w10",win_ani:{name:"animation", zIndex:100},stop_ani:{name:"animation1", zIndex:200}}, //大胡子精灵
        [14]:{node:"s14",win_node:"wildchange",win_ani:{name:"animation1", zIndex:100}}, //coinboom另一图片
    },

    //脚本组件(必须)
    scripts:{
        Top:"LMSlots_Top_Base",
        Bottom:"LMSlots_Bottom_Base",
        Slots:"LampOfAladdin_Slots",
        Reels:"LMSlots_Reel_Base",
        Symbols:"LampOfAladdin_Symbol",
    },
    //行列(必须)
    col:5,
    row:3,

    //symbol预制(必须)
    symbolPrefab:"LampOfAladdin_Symbol",
    //符号宽高(必须)
    symbolSize:{
        width:200,
        height:200,
    },

    //随机符号(必须)
    randomSymbols:[1,2,3,4,5,6,7,8],
    scatterId:9,
    wildId:10,
    collectId:1,

    //中奖框体预制的名称，不配就表示不显示框
    //配置在Asset_Base中
    kuang:"LampOfAladdin_kuang",

    //旋转速度(必须)
    speed:3000,

    //列停止间隔时间s
    reelStopInter:0.2,

    //自动模式下的延迟请求下一轮
    autoModelDelay:1,

    //旋转时间s:3s后旋转停止
    auto_stop_time:0.5,

    //加速添加时间
    AddAntiTime:3.0,

    //回弹效果
    bounce:true,
    //回弹配置 必须；如果不要回弹 都配置为0
    bounceInfo:{
        distance:30,         //回弹距离
        time:0.1             //回弹时间
    },

    //列状态配置；必须的配置
    reelStateInfo:[
        {
            id:[9],       //id
            mini:3,     //触发游戏的最小个数
            counts:[1,1,1,1,1],             //每一列最多个数
            antiNode:"node_anti",     //加速节点
            path:'games/LampOfAladdin/',     //音效路径
            reelStopSound:'reel_stop',             //普通列停止
            symbolStopSound:'scatter_landing',         //特殊symbol停止音效
            antSound:'anticipation',                //加速音效
            antSpeed:2500,                           //加速度
        },
        {
            id:[10],       //id
            mini:0,     //触发游戏的最小个数
            counts:[3,3,3,3,3],             //每一列最多个数
            path:'games/LampOfAladdin/',     //音效路径
            reelStopSound:'reel_stop',      //普通列停止
            symbolStopSound:'',         //特殊symbol停止音效
        },
    ],

    normalBgm:'base_bgm',

    commEffect:{
        path:'games/LampOfAladdin/',
        win1:['win1','win1end'], //小赢，2s左右
        win2:['win2','win2end'], //中赢，5s左右
    },

    soundCfg:{
        base_bgm:'base_bgm',                           //背景音乐
        free_bgm:'free_bgm',                           //背景音乐

        // all_anticipation:'all_anticipation',           //飞毯飞过音效
        click:'click',                                 //地图点击音效
        fg_popclose:'fg_popclose',                     //免费游戏结算弹框
        fg_popup:'fg_popup',                          //免费游戏结算弹框关闭

        // jp_popup:'jp_popup',                          //中奖池弹框

        // transition_1: 'transition_1',                //收集进入到最后一个关卡的音效
        transition_2: 'transition_2',                //最终收集免费游戏过场动画1
        transition1: 'transition1',                  //最终收集免费游戏过场动画2
        transition2: 'transition2',                  //PICK游戏过场动画音效

        lock:'lock',                                   //关闭收集
        // popup_out:'popup_out',                         //点击start音效
        reel_notify:'anticipation',                     //列加速音效
        reel_stop:'reel_stop',                         //列停止
        symbol_fly:'symbol_fly',                       //符号飞
        wild_fly:'wild_fly',                           //wild飞
        symbol_scatter:'scatter_landing',               //scatter符号音效
        unlock:'unlock',                               //开启收集条
        // wild_reel:'wild_reel',                         //bonus图标音效
        win1:'win1',
        win1end:'win1end',
        win2:'win2',
        win2end:'win2end',
        win3:'win3',
        win3end:'win3end',
        win4:'win4',
        win4end:'win4end',


        map_close:'map_close',
        map_move:'map_move',
        map_open:'map_open',
        map_popclose:'map_popclose',
        map_popup:'map_popup',
        map_node:'map_node',
        meter_full:'meter_full',             //最后一关音效
        reel_appear:'reel_appear',           //出现神灯WIld
        // reel_hide:'reel_hide',               //隐藏神灯wild

        pick_bgm:'pick_bgm',                                    //pickBonus游戏 背景音乐
        pick_congratulate: 'pick_congratulate',                 //聚宝盆喷射金币音效
        pick_popup: 'pick_popup',                               //结算弹框
        pick_popclose: 'pick_popclose',                         //结算弹框关闭
        jp_congratulate: 'jp_congratulate',                    //奖池欢庆
        lamp_bird:'lamp_bird',                                 //开出七彩鸟
        lamp_click:'lamp_click',                                 //开出七彩鸟
        lamp_disappear:'lamp_disappear',                                 //开出七彩鸟

        wheel_bgm: 'wheel_bgm',                                //转盘bgm
        wheel_popup: 'wheel_popup',                             //转盘bgm
        wheel_popclose: 'wheel_popclose',                       //转盘bgm
    },

    helpItems:[
        "games/LampOfAladdin/prefab/LMSlots_Help_item1",
        "games/LampOfAladdin/prefab/LMSlots_Help_item2",
        "games/LampOfAladdin/prefab/LMSlots_Help_item3",
        "games/LampOfAladdin/prefab/LMSlots_Help_item4",
        "games/LampOfAladdin/prefab/LMSlots_Help_item5",
        "games/LampOfAladdin/prefab/LMSlots_Help_item6",
    ],
    help_prefab:"slots_common/SlotRes/prefab/LMSlots_Help_prefab_2",
    help_prefab_cfg:"LMSlots_Help_Base_2",

    sys_playerRP:"slots_common/SlotRes/prefab/sys_playerRP_2",

      bet_records: "Table_Common/TableRes/prefab/record_bet_pannel",
}

module.exports = Cfg;
