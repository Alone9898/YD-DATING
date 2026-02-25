// 模拟游戏发包,用来调试游戏
const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugDelphiMsg extends cc.Component {

    CMD_MAP: Map<string, Function>;

    onLoad() {
        this.CMD_MAP = new Map();
        this.CMD_MAP.set("game_start", this.game_start.bind(this));
        this.CMD_MAP.set("game_over", this.game_over.bind(this));
        this.CMD_MAP.set("game_trun_to", this.game_trun_to.bind(this));
        this.CMD_MAP.set("game_trun_to_self", this.game_trun_to_self.bind(this));

        this.CMD_MAP.set("game_public_card_1", this.game_public_card_1.bind(this));
        this.CMD_MAP.set("game_public_card_2", this.game_public_card_2.bind(this));
        this.CMD_MAP.set("game_public_card_3", this.game_public_card_3.bind(this));

        this.CMD_MAP.set("game_bet_self", this.game_bet_self.bind(this));
        this.CMD_MAP.set("game_bet_other", this.game_bet_other.bind(this));

        this.CMD_MAP.set("game_pack_other", this.game_pack_other.bind(this));
        this.CMD_MAP.set("game_pack_self", this.game_pack_self.bind(this));
        this.CMD_MAP.set("game_pack_compare", this.game_pack_compare.bind(this));
        this.CMD_MAP.set("game_chat_text", this.game_chat_text.bind(this));
        this.CMD_MAP.set("game_chat_emoji", this.game_chat_emoji.bind(this));

        this.CMD_MAP.set("REQ_KNOCKOUT_COUNT", this.REQ_KNOCKOUT_COUNT.bind(this));
        this.CMD_MAP.set("REQ_KNOCKOUT_OVER", this.REQ_KNOCKOUT_OVER.bind(this));

        cc.vv.EventManager.on("DEBUG_GAME_CMD", this.onDebugCmd, this);
    }

    onDebugCmd(cmd) {
        let func = this.CMD_MAP.get(cmd);
        if (func) func();
    }

    game_start() {
        cc.vv.NetManager.dispatchNetMsg({
            "activeState": 7,
            "cards": [
                38,
                39
            ],
            "dealerUid": 2,
            "discardUids": [2, 3, 4, 5, 6, 7, 8, 1],
            // "potCoin": 5000,

            "sBlind": 1, // 小盲uid
            "sBlindCoin": 500,  // 小盲下注
            "bBlind": 2,  // 大盲uid
            "bBlindCoin": 1000,  // 大盲下注
            "pots": [  // 当前金币池列表，第一个为主池
                { "coin": 1000, "uids": [], "main": 1 }, // main 是否是主池  
            ],
            "c": 126003,
            "code": 200,
        });

        this.scheduleOnce(() => {
            cc.vv.NetManager.dispatchNetMsg({
                "activeState": 7,
                "uid": 1,
                "delayTime": 10,
                "nextUid": 3,
                "nextState": 1,
                "currBet": 1000,
                "userBet": 0,
                "dealerUid": 11511,
                "c": 126307,
                "code": 200,
            });
        }, 2);

    }

    game_trun_to() {
        let msg = {
            "activeState": 7,
            "uid": 1,
            "delayTime": 10,
            "nextUid": 1,
            "nextState": 1,
            "dealerUid": 11511,
            "currBet": 10000,
            "userBet": 1000,
            "c": 126307,
            "code": 200,
        }
        cc.vv.NetManager.dispatchNetMsg(msg);
    }

    game_trun_to_self() {
        let msg = {
            "activeState": 7,
            "uid": 1,
            "delayTime": 10,
            "nextUid": 4,
            "nextState": 1,
            "dealerUid": 11511,
            "currBet": 2000,
            "userBet": 2000,
            "c": 126307,
            "code": 200,
        }
        cc.vv.NetManager.dispatchNetMsg(msg);
    }

    game_over() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126005,
            "uid": 1,
            "rtype": 1,  // 结算类型 1.发起比牌结算, 2.封顶自动结算, 3.剩下一个人结算
            "showCards": [41, 42, 74, 78, 73],
            "allCards": [
                { "uid": 7, "cards": [38, 39], "bestCards": [41, 42, 74, 38, 39], "cardType": "10" },
                { "uid": 6, "cards": [38, 39], "bestCards": [41, 42, 78, 38, 39], "cardType": "9" },
                { "uid": 5, "cards": [38, 39], "bestCards": [41, 42, 73, 38, 39], "cardType": "8" },
                { "uid": 4, "cards": [38, 39], "bestCards": [41, 42, 74, 38, 39], "cardType": "7" },
                { "uid": 3, "cards": [38, 39], "bestCards": [41, 42, 74, 38, 39], "cardType": "6" },
                { "uid": 2, "cards": [38, 39], "bestCards": [41, 42, 74, 38, 39], "cardType": "5" },
                { "uid": 1, "cards": [38, 39], "bestCards": [41, 42, 74, 38, 39], "cardType": "4" },
            ],  // 展示剩下人的牌
            "winners": [1, 2],  // 最后赢的人的uid，有可能是多个人
            "pots": [
                { "coin": -0.5, "uids": [3], "win_uids": [1, 3, 6], "main": 1 },   // main是否是主池
                { "coin": 1.5, "uids": [1], "win_uids": [1, 3, 6], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [1, 3, 6], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [6, 7], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [6, 7], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [5], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [4], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [7, 8], "main": 0 },   // main是否是主池
                { "coin": 2.5, "uids": [1], "win_uids": [7, 8], "main": 0 },   // main是否是主池
            ],
            "win_config": [
                [1, 2, 3], [4, 5], [8, 9], [7], [6]
            ],
            fcoins: [],
            "code": 200,
        });
    }
    // 看牌
    game_public_card_1() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126309,
            "code": 200,
            "cards": [38, 39, 75],  // 公共牌
            "delayTime": 10, // 延迟时间
            "stage": 1, // 第几次发牌 1， 2， 3,
            "tip": {  // 可能没有ssssssss
                "ctype": 8,  // 牌型sss
                "isAny": false,  // 是否是任意牌
                "need": [], // 去掉的牌
                "suit": 1,  // 某个花色，如果没有，说明是任意花色
                "cards": [38, 39, 45], // 组成的牌
            }
        });
    }
    // 看牌
    game_public_card_2() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126309,
            "code": 200,
            "cards": [76],  // 公共牌
            "delayTime": 10, // 延迟时间
            "stage": 2, // 第几次发牌 1， 2， 3,
            "tip": {  // 可能没有
                "ctype": 6,  // 牌型
                "isAny": false,  // 是否是任意牌
                "need": [], // 去掉的牌
                "suit": 1,  // 某个花色，如果没有，说明是任意花色
                "cards": [38, 39], // 组成的牌
            }
        });
    }
    // 看牌
    game_public_card_3() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126309,
            "code": 200,
            "cards": [78],  // 公共牌
            "delayTime": 10, // 延迟时间
            "stage": 3, // 第几次发牌 1， 2， 3,
        });
    }
    game_bet_self() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126301,
            "uid": 1,
            "coin": 10000,
            "blind": 0,  // 是否盲注
            "potCoin": 1000, // 池子里面的钱
            "userBet": 500,
            "pots": [{ "coin": 1000, "uids": [], "main": 1 }], // main 是否是主池 
            "isClose": 1,
            "code": 200,
        });
    }
    game_bet_other() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126301,
            "uid": 2,
            "coin": 10000,
            "userBet": 500,
            "blind": 0,  // 是否盲注
            "pots": [
                { "coin": 1000, "uids": [], "main": 1 },
                { "coin": 2000, "uids": [], "main": 0 }
            ], // main 是否是主池 
            "isClose": 1,
            "potCoin": 1000, // 池子里面的钱
            "code": 200,
        });
    }
    // 自己弃牌
    game_pack_self() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126306,
            "uid": 1,
            "can_show": 0, // show按钮是否可用 0: 不可用
            "can_side_show": 0,   // side show 按钮是否可用 0: 不可用
            "code": 200,
        });
    }
    // 2号弃牌
    game_pack_other() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126306,
            "uid": 2,
            "can_show": 0, // show按钮是否可用 0: 不可用
            "can_side_show": 0,   // side show 按钮是否可用 0: 不可用
            "code": 200,
        });
    }
    // 比牌结果
    game_pack_compare() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126304,
            "code": 200,
            "coin": 10000,
            "rtype": 1,  // 0是拒绝，1是统一
            "lcards": [0, 0, 0],  // 发起方的牌
            "lcardType": 2,  // 牌型
            "rcards": [38, 39, 75],  // 被发起方的牌
            "rcardType": 3,  // 牌型
            "uid": 2,     //被邀请的人
            "ask_uid": 1,  // 请求的人
            "ans_uid": 2,  // 请求的人

            "win_uid": 1,  // 赢的人
            "lost_uid": 2,  // 输的人
            "can_show": 1, // show按钮是否可用 0: 不可用
            "can_side_show": 1,   // side show 按钮是否可用 0: 不可用
        });
    }
    // 文本聊天
    game_chat_text() {
        for (let i = 1; i <= 9; i++) {
            cc.vv.NetManager.dispatchNetMsg({
                "uid": i,
                "c": 100202,
                "code": 200,
                "msg": `{\"uid\":${i},\"nick\":\"123\",\"gender\":1,\"icon\":\"10\",\"avatar\":\"avatarframe_1000\",\"chatSkin\":\"chat_000\",\"fontSkin\":\"font_color_4\",\"msgType\":3,\"sendTime\":1665474866656,\"content\":3,\"fcoin\":376644}`,
                "seatid": 1
            })
        }
    }
    // 表情聊天
    game_chat_emoji() {
        for (let i = 1; i <= 9; i++) {
            cc.vv.NetManager.dispatchNetMsg({
                "uid": i,
                "c": 100202,
                "code": 200,
                "msg": `{\"uid\":${i},\"nick\":\"123\",\"gender\":1,\"icon\":\"7\",\"avatar\":\"avatarframe_1002\",\"chatSkin\":\"chat_000\",\"fontSkin\":\"font_color_0\",\"msgType\":2,\"sendTime\":1667206561408,\"content\":\"emoji_0_3\",\"fcoin\":9102071}`,
                "seatid": 1
            })
        }
    }
    // 比赛换桌

    // 比赛结算
    REQ_KNOCKOUT_COUNT() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 1088,
            "code": 200,
        })
    }
    // 比赛结束
    REQ_KNOCKOUT_OVER() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 1089,
            "code": 200,
            players: [{
                uid: 1,
                rewards: [{ type: 1, count: 100000 }]
            }]
        })
    }

}
