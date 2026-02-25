/**
 * Fortuen Wheel配置
 */

 let Cfg = {
    //游戏主逻辑脚本
    GameScript:"FortuneWheel_Game",
    normalBgm:"bgm",
    helpItems:["games/Fortunewheel/prefab/help_item1"],
    enterRoomEffect:"enter_room",
    bet_records:"games/Fortunewheel/prefab/record_pannel",

    ResultMap: {
      [1]: {symbol:1, mult:2},
      [2]: {symbol:3, mult:10},
      [3]: {symbol:5, mult:2},
      [4]: {symbol:2, mult:8},
      [5]: {symbol:4, mult:2},
      [6]: {symbol:1, mult:5},
      [7]: {symbol:3, mult:2},
      [8]: {symbol:5, mult:50},
      [9]: {symbol:2, mult:2},
      [10]: {symbol:4, mult:20},
    }
 }
 module.exports = Cfg;