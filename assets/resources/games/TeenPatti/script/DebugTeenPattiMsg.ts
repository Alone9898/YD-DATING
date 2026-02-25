// 模拟游戏发包,用来调试游戏
const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugTeenPattiMsg extends cc.Component {

    CMD_MAP: Map<string, Function>;

    onLoad() {
        this.CMD_MAP = new Map();
        this.CMD_MAP.set("game_start", this.game_start.bind(this));
        this.CMD_MAP.set("game_over", this.game_over.bind(this));
        this.CMD_MAP.set("game_trun_to", this.game_trun_to.bind(this));
        this.CMD_MAP.set("game_seek_self", this.game_seek_self.bind(this));
        this.CMD_MAP.set("game_seek_other", this.game_seek_other.bind(this));
        this.CMD_MAP.set("game_bet_self", this.game_bet_self.bind(this));
        this.CMD_MAP.set("game_bet_other", this.game_bet_other.bind(this));
        this.CMD_MAP.set("game_be_ask_compare", this.game_be_ask_compare.bind(this));
        this.CMD_MAP.set("game_ask_compare", this.game_ask_compare.bind(this));
        this.CMD_MAP.set("game_pack_other", this.game_pack_other.bind(this));
        this.CMD_MAP.set("game_pack_self", this.game_pack_self.bind(this));
        this.CMD_MAP.set("game_pack_compare", this.game_pack_compare.bind(this));
        this.CMD_MAP.set("game_chat", this.game_chat.bind(this));

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
                39,
                75,
            ],
            "dealerUid": 2,
            "discardUids": [2, 3, 4, 1],
            "potCoin": 5000,
            "c": 126003,
            "code": 200,
        });

        this.scheduleOnce(() => {
            cc.vv.NetManager.dispatchNetMsg({
                "activeState": 7,
                "uid": 1,
                "delayTime": 10,
                "nextUid": 4,
                "nextState": 1,
                "dealerUid": 11511,
                "c": 126307,
                "code": 200,
            });
        }, 3);

    }

    game_trun_to() {
        let msg = {
            "activeState": 7,
            "uid": 2,
            "delayTime": 10,
            "nextUid": 4,
            "nextState": 1,
            "dealerUid": 11511,
            "c": 126307,
            "code": 200,
        }
        cc.vv.NetManager.dispatchNetMsg(msg);
    }

    game_over() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126005,
            "uid": 1,
            "rtype": 0,  // 结算类型 1.发起比牌结算, 2.封顶自动结算, 3.剩下一个人结算
            "allCards": [
                { "uid": 1, "cards": [38, 39, 75], "cardType": "1", coin: 100 },
                { "uid": 2, "cards": [38, 39, 75], "cardType": "1", coin: 100 },
                { "uid": 3, "cards": [38, 39, 75], "cardType": "1", coin: 100 },
                { "uid": 4, "cards": [38, 39, 75], "cardType": "1", coin: 100 },
            ],  // 展示剩下人的牌
            "winners": [1, 2],  // 最后赢的人的uid，有可能是多个人
            "code": 200,
        });
    }
    // 看牌
    game_seek_self() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126302,
            "uid": 1,
            "coin": 10000,
            "betList": [500, 1000],
            "cards": [38, 39, 75],  // 自己可以看到牌内容, 其他玩家牌值为0
            "cardType": 3,
            "can_show": 0, // show按钮是否可用 0: 不可用
            "can_side_show": 0,   // side show 按钮是否可用 0: 不可用
            "code": 200,
        });
    }
    // 看牌
    game_seek_other() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126302,
            "uid": 2,
            "coin": 10000,
            "betList": [500, 1000],
            "cards": [38, 39, 75],  // 自己可以看到牌内容, 其他玩家牌值为0
            "can_show": 1, // show按钮是否可用 0: 不可用
            "can_side_show": 0,   // side show 按钮是否可用 0: 不可用
            "code": 200,
        });
    }
    game_bet_self() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126301,
            "uid": 1,
            "coin": 10000,
            "blind": 0,  // 是否盲注
            "potCoin": 1000, // 池子里面的钱
            "code": 200,
        });
    }
    game_bet_other() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126301,
            "uid": 2,
            "coin": 10000,
            "blind": 0,  // 是否盲注
            "potCoin": 1000, // 池子里面的钱
            "code": 200,
        });
    }

    game_ask_compare() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126303,
            "ans_uid": 2,
            "ask_uid": 1,  // 请求的人
            "coin": 10000,
            "isOver": 1,  // 是否结束
            "potCoin": 5000, // 池子里面的钱
            "code": 200,
        });
    }

    // 被邀请比牌
    game_be_ask_compare() {
        cc.vv.NetManager.dispatchNetMsg({
            "c": 126303,
            "ans_uid": 1,
            "coin": 10000,
            "ask_uid": 2,  // 请求的人
            "isOver": 1,  // 是否结束
            "potCoin": 5000, // 池子里面的钱
            "delayTime": 10,
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

    game_chat() {
        cc.vv.NetManager.dispatchNetMsg({
            "uid": 3,
            "c": 100202,
            "code": 200,
            "msg": "{\"uid\":3,\"nick\":\"123\",\"gender\":1,\"icon\":\"10\",\"avatar\":\"avatarframe_1000\",\"chatSkin\":\"chat_000\",\"fontSkin\":\"font_color_4\",\"msgType\":3,\"sendTime\":1665474866656,\"content\":3,\"fcoin\":376644}",
            "seatid": 3
        })
    }


}
