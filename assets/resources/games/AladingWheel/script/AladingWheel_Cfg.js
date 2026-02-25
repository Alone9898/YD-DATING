/**
 * 阿拉丁转盘配置
 */

let Cfg = {
    //游戏主逻辑脚本
    GameScript:"AladingWheel_Game",
    normalBgm:"bg",
    helpItems:["games/AladingWheel/prefab/help_item1"],
    bet_records:"games/AladingWheel/prefab/record_pannel",
    // enterRoomEffect:"enter",
    closeEmotion:true,
    chipscale:0.35,
    Multiples: [
        1, 5, 2, 10, 10, 50, 120, 5, 2, 10, 20, 2,
        1, 5, 2, 10, 10, 2, 40, 5, 2, 10, 30, 2
    ],
    Results: [
        0, 8, 5, 7, 5, 1, 1, 8, 8, 6, 4, 4,
        0, 8, 7, 7, 5, 2, 2, 8, 6, 6, 3, 3
    ],
}
module.exports = Cfg;