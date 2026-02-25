/*
**捕鱼消息定义
*/
var FishMsgId = require('MsgIdDef')

FishMsgId.FISH_MATCH_SESS = 2401;   //匹配房间
FishMsgId.FISH_PLAYER_JOIN = 1003;  //[广播]玩家进入
FishMsgId.FISH_EXIT = 40;           //离开房间
FishMsgId.FISH_PLAYER_EXIT = 1016;  //[广播]有人离开
FishMsgId.FISH_FIRE = 2402;         //玩家发射
FishMsgId.FISH_CATCH = 2403;        //玩家捕获
FishMsgId.FISH_ION_END = 2404;      //离子炮结束
FishMsgId.FISH_BOOM = 2405;         //炸弹
FishMsgId.FISH_LUCK_DRAW = 2406;    //抽奖

FishMsgId.FISH_ADD_FISH = 102405;     //[广播]增加鱼
FishMsgId.FISH_SWITCH_SCENE = 102406; //[广播]切换场景
FishMsgId.FISH_FISH_TIDE = 102407;    //[广播]鱼潮
FishMsgId.FISH_ROOM_STATE = 102408;   //[广播]房间状态
FishMsgId.FISH_FISH_PROG  = 102409;   //[广播]鱼的击杀进度
FishMsgId.FISH_EVENT  = 102410;       //[广播]特定事件通知
