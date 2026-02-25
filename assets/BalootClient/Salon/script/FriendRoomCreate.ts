import TurnCmp, { TurnCmpItemData } from "../../game_common/common_cmp/TurnCmp";
import RoomFriendPwd from "./RoomFriendPwd";
import SalonCoinSlider from "./SalonCoinSlider";

let RoomGameIdConfig = {
    handsaudi: 258,
    hand: 257,
    baloot: 256
}
const { ccclass, property } = cc._decorator;

let gameIdConfig = {
    [256]: ["entry", "rewards", "pwd", "auto"],
    [257]: ["entry", "rewards", "pwd", "auto"], //, "seat24"
    [258]: ["entry", "rewards", "pwd", "auto"], //, "seat24"
    [259]: ["entry", "rewards", "pwd", "auto", "tarneeb_score"],
    [265]: ["entry", "rewards", "pwd", "auto"], //, "seat234"
    [264]: ["entry", "rewards", "pwd", "auto"],
    [266]: ["entry", "rewards", "pwd", "auto"], //, "seat46"
    [270]: ["entry", "rewards", "pwd", "auto"],
    [272]: ["entry", "rewards", "pwd", "auto"],
    [269]: ["entry", "rewards", "pwd", "auto","seat24"], // , "ludo_type" ,
    [283]: ["entry", "rewards", "pwd", "auto", "concan_score"],
    [287]: ["entry", "rewards", "pwd", "auto"],
}


@ccclass
export class FriendRoomCreate extends cc.Component {
    @property(SalonCoinSlider)
    filterEntryCoin: SalonCoinSlider = null;
    // @property(TurnCmp)
    // filterRoundTime: TurnCmp = null;
    // @property(TurnCmp)
    // filterScore: TurnCmp = null;
    // @property(cc.ToggleContainer)
    // seatNum234Options: cc.ToggleContainer = null;
    @property(cc.ToggleContainer)
    seatNum24Options: cc.ToggleContainer = null;
    // @property(cc.ToggleContainer)
    // seatNum46Options: cc.ToggleContainer = null;
    // @property(cc.ToggleContainer)
    // shuffleOptions: cc.ToggleContainer = null;
    // @property(cc.ToggleContainer)
    // voiceOptions: cc.ToggleContainer = null;
    // @property(cc.ToggleContainer)
    // privilegeOptions: cc.ToggleContainer = null;

    // @property(cc.ToggleContainer)
    // roundOptions: cc.ToggleContainer = null;
    // @property(cc.ToggleContainer)
    // balootRoundOptions: cc.ToggleContainer = null;
    // @property(cc.ToggleContainer)
    // inviteOptions: cc.ToggleContainer = null;
    @property(cc.ToggleContainer)
    pwdOptions: cc.ToggleContainer = null;
    // 自动开启
    @property(cc.ToggleContainer)
    autoOptions: cc.ToggleContainer = null;
    // // Tarneeb分数
    // @property(cc.ToggleContainer)
    // tarneebScoreOptions: cc.ToggleContainer = null;
    // // concan分数
    // @property(cc.ToggleContainer)
    // concanScoreOptions: cc.ToggleContainer = null;
    // // 飞行棋玩法选择
    // @property(cc.ToggleContainer)
    // ludoTypeOptions: cc.ToggleContainer = null;

    // @property(cc.Node)
    // enterCoinNode: cc.Node = null;
    @property(cc.Node)
    rewardsNode: cc.Node = null;

    @property(cc.Button)
    btnConfirmFriend: cc.Button = null;
    @property(cc.Label)
    confirmLabel: cc.Label = null;
    @property(cc.Button)
    btnVip: cc.Button = null;
    @property(cc.Node)
    maxNode: cc.Node = null;

    @property(cc.Node)
    gameListNode: cc.Node = null;

    // 房间密码相关
    @property(cc.Button)
    pwdBtn: cc.Button = null;
    @property(cc.Label)
    pwdLabel: cc.Label = null;
    @property(cc.Node)
    pwdHit: cc.Node = null;
    @property(cc.Prefab)
    pwdPrefab: cc.Prefab = null;

    @property(cc.Label)
    titLbl: cc.Label = null;

    private roomConfig: any;
    private gameListView: any;
    private createMenuList: any;
    private isAutoJoin: boolean;
    private isPrivate: boolean;

    // // 积分
    // get score() {
    //     return (this.filterScore.getCurrSelectData() as TurnCmpItemData) ? (this.filterScore.getCurrSelectData() as TurnCmpItemData).value : 0;
    // }
    // 最小携带
    get entry() {
        return this.filterEntryCoin.getCurrSelectData();
    }
    // // 操作时间
    // get turntime() {
    //     return (this.filterRoundTime.getCurrSelectData() as TurnCmpItemData).value;
    // }
    // // 回合选着
    // get round() {
    //     if (this.gameid == 256) {
    //         return this.balootRoundOptions.toggleItems[0].isChecked ? 1 : 5;
    //     } else {
    //         return this.roundOptions.toggleItems[0].isChecked ? 1 : 5;
    //     }
    // }
    // // 是不是私人房
    // get privilege() {
    //     return this.privilegeOptions.toggleItems[0].isChecked ? 2 : 1;
    // }
    // // 是否开启语言
    // get voice() {
    //     return this.voiceOptions.toggleItems[0].isChecked ? 1 : 2;
    // }
    // // 洗牌顺序
    // get shuffle() {
    //     return this.shuffleOptions.toggleItems[0].isChecked ? 1 : 2;
    // }
    // // 是否在大厅显示牌桌
    // get invite() {
    //     return this.inviteOptions.toggleItems[0].isChecked ? 1 : 0;
    // }
    get pwd() {
        return this.pwdLabel.string;
    }
    set pwd(value) {
        this.pwdLabel.string = value;
        this.pwdHit.active = value.length <= 0;
    }
    // 洗牌顺序
    get autoStart() {
        return this.autoOptions.toggleItems[0].isChecked ? 1 : 0;
    }
    // get tarneebScore() {
    //     if (this.gameid == 259) {
    //         let score = 31;
    //         for (const toggle of this.tarneebScoreOptions.toggleItems) {
    //             if (toggle.isChecked) {
    //                 let index = this.tarneebScoreOptions.toggleItems.indexOf(toggle);
    //                 score = [31, 41, 61][index];
    //             }
    //         }
    //         return score;
    //     } else if (this.gameid == 269) {
    //         let type = 1;
    //         for (const toggle of this.ludoTypeOptions.toggleItems) {
    //             if (toggle.isChecked) {
    //                 let index = this.ludoTypeOptions.toggleItems.indexOf(toggle);
    //                 type = [1, 2, 3][index];
    //             }
    //         }
    //         return type;
    //     }
    //     return undefined;
    // }
    // get minScore() {
    //     if (this.gameid == 283) {
    //         let score = 51;
    //         for (const toggle of this.concanScoreOptions.toggleItems) {
    //             if (toggle.isChecked) {
    //                 let index = this.concanScoreOptions.toggleItems.indexOf(toggle);
    //                 score = [51, 71][index];
    //             }
    //         }
    //         return score;
    //     }
    //     return undefined;
    // }


    // 座位数
    get seatNum() {
        let seatNum = undefined;
        let _tempConfig = gameIdConfig[this.gameid] || ["entry", "pwd", "auto"];//, "rewards"
        // if (_tempConfig.indexOf("seat234") >= 0) {
        //     for (const toggle of this.seatNum234Options.toggleItems) {
        //         if (toggle.isChecked) {
        //             let index = this.seatNum234Options.toggleItems.indexOf(toggle);
        //             seatNum = [2, 3, 4][index];
        //         }
        //     }
        // }
        if (_tempConfig.indexOf("seat24") >= 0) {
            for (const toggle of this.seatNum24Options.toggleItems) {
                if (toggle.isChecked) {
                    let index = this.seatNum24Options.toggleItems.indexOf(toggle);
                    seatNum = [2, 4][index];
                }
            }
        }
        // if (_tempConfig.indexOf("seat46") >= 0) {
        //     for (const toggle of this.seatNum234Options.toggleItems) {
        //         if (toggle.isChecked) {
        //             let index = this.seatNum234Options.toggleItems.indexOf(toggle);
        //             seatNum = [4, 6][index];
        //         }
        //     }
        // }
        return seatNum;
    }

    private gameid: number;
    onLoad() {
        this.gameListView = this.gameListNode.getComponent("ListView");
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.FRIEND_ROOM_CREATE, this.FRIEND_ROOM_CREATE, this, false);
        this.btnConfirmFriend.node.on("click", this.onClickConfim, this);
        this.filterEntryCoin.setSelectCallback((data, index) => {
            if (this.roomConfig && this.roomConfig.reward && this.roomConfig.reward.length > 0) {
                if (this.roomConfig.reward[index].length == 2) {
                    if (this.roomConfig.reward[index][0] == this.roomConfig.reward[index][1]) {
                        cc.find("content/value", this.rewardsNode).getComponent(cc.Label).string = this.roomConfig.reward[index][0];
                    } else {
                        cc.find("content/value", this.rewardsNode).getComponent(cc.Label).string = this.roomConfig.reward[index][0] + "-" + this.roomConfig.reward[index][1];
                    }
                } else {
                    cc.find("content/value", this.rewardsNode).getComponent(cc.Label).string = this.roomConfig.reward[index];
                }
            }
        });
        this.pwdBtn.node.on("click", this.onSetPwd, this);
        this.pwd = "";
        this.btnVip.node.on("click", () => {
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 2 });
        }, this);
    }
    onInit(gameid, isAutoJoin = false, isPrivate = false) {
        if (gameid == 10000 || gameid == 9999) {
            this.gameid = cc.vv.UserConfig.salonGamesList[0];
        } else {
            this.gameid = gameid;
        }
        this.isAutoJoin = isAutoJoin;
        this.isPrivate = isPrivate;
        this.createMenuList = cc.vv.UserConfig.getCreateMenuCfg();
        this.gameListView.numItems = this.createMenuList.length;
        // 默认选择
        let selectId = 0;
        for (let i = 0; i < this.createMenuList.length; i++) {
            const element = this.createMenuList[i];
            if (element.gameid == this.gameid) {
                selectId = i;
            }
        }
        this.gameListView.selectedId = selectId;
        // 默认不用密码
        this.pwdOptions.toggleItems[1].isChecked = true;
        // 设置开房进度
        this.updateCreateState();
        this.titLbl.string = isPrivate ? "Create Private Room" : "Create Public Room";
    }
    // 更新界面
    updateView() {
        let roomCfg = null;
        for (const _item of cc.vv.UserManager.gameList) {
            if (_item.id == this.gameid) {
                roomCfg = _item.room;
            }
        }
        this.roomConfig = roomCfg;
        if (roomCfg) {
            // 入场费
            if (roomCfg.entry && roomCfg.entry.length > 0) {
                // let _config = [];
                // for (const _entry of roomCfg.entry) {
                //     _config.push({ title: _entry, value: _entry })
                // }
                this.filterEntryCoin.setDataList(roomCfg.entry);
            }
            // // 底分配置
            // if (roomCfg.score && roomCfg.score.length > 0) {
            //     let _config = [];
            //     for (const _score of roomCfg.score) {
            //         _config.push({ title: _score, value: _score })
            //     }
            //     this.filterScore.setDataList(_config);
            // }
        }
        // // 操作时间配置
        // if (this.gameid == 256 || this.gameid == 265) {
        //     this.filterRoundTime.setDataList([
        //         { title: "8S", value: 8 },
        //         { title: "15S", value: 15 },
        //         { title: "20S", value: 20 },
        //         { title: "30S", value: 30 },
        //     ]);
        // } else {
        //     this.filterRoundTime.setDataList([
        //         { title: "15S", value: 15 },
        //         { title: "20S", value: 20 },
        //         { title: "30S", value: 30 },
        //     ]);
        // }
        let nodeMap = [
            { name: "entry", node: this.filterEntryCoin.node.parent },// 盲注
            // { name: "score", node: this.filterScore.node },// 底分
            // { name: "time", node: this.filterRoundTime.node },// 操作时间
            // { name: "seat234", node: this.seatNum234Options.node.parent },// 座位数234
            { name: "seat24", node: this.seatNum24Options.node.parent },// 座位数24
            // { name: "seat46", node: this.seatNum46Options.node.parent },// 座位数46
            // { name: "shuffle", node: this.shuffleOptions.node.parent },// 顺序
            // { name: "voice", node: this.voiceOptions.node.parent },// 语音
            // { name: "privilege", node: this.privilegeOptions.node.parent },// 是否私人
            // { name: "round", node: this.roundOptions.node.parent },// 回合
            // { name: "balootRound", node: this.balootRoundOptions.node.parent },// Baloot回合
            // { name: "limit", node: this.enterCoinNode },// 最少携带
            { name: "rewards", node: this.rewardsNode },// 奖励
            // { name: "invite", node: this.inviteOptions.node.parent },// 是否邀请
            { name: "pwd", node: this.pwdOptions.node.parent },// 是否邀请
            { name: "auto", node: this.autoOptions.node.parent },
            // { name: "tarneeb_score", node: this.tarneebScoreOptions.node.parent },
            // { name: "concan_score", node: this.concanScoreOptions.node.parent },
            // { name: "ludo_type", node: this.ludoTypeOptions.node.parent },
        ]
        for (const item of nodeMap) {
            let temp = gameIdConfig[this.gameid] || ["entry", "pwd", "auto"];//, "rewards"
            if(item.name == "entry"){
                let titStr = "Boot value";
                if(this.gameid == 292){
                    titStr = "Point value";
                } else if(this.gameid == 255){
                    titStr = "Min Bet";
                }
                Global.setLabelString("title", item.node, titStr);
            }

            if (item.name == "pwd") {
                item.node.active = this.isPrivate;
            } else {
                item.node.active = temp.indexOf(item.name) >= 0;
            }
        }
    }
    // 更新开房状态
    updateCreateState() {
        let limitRoomCnt = cc.vv.UserManager.viproomcnt[cc.vv.UserManager.svip];
        let maxRoomCnt = cc.vv.UserManager.viproomcnt[cc.vv.UserManager.viproomcnt.length - 1];
        if (cc.vv.UserManager.roomcnt >= maxRoomCnt) {
            // this.btnConfirmFriend.node.active = false;
            // this.btnVip.node.active = true;
            this.maxNode.active = true;
            this.btnConfirmFriend.node.active = false;
            this.btnVip.node.active = false;
        } else if (cc.vv.UserManager.roomcnt >= limitRoomCnt) {
            this.maxNode.active = false;
            this.btnConfirmFriend.node.active = false;
            this.btnVip.node.active = true;
            // this.btnVip.node.getComponentInChildren(cc.Label).string = ___("需要提升VIP")
        } else {
            this.maxNode.active = false;
            this.btnConfirmFriend.node.active = true;
            this.btnVip.node.active = false;
            this.confirmLabel.string = "Create Now"//___("确定({1}/{2})", cc.vv.UserManager.roomcnt, limitRoomCnt);
        }
    }
    // 刷新列表Item
    onUpdateMenuItem(item: cc.Node, index: number) {
        let data = this.createMenuList[index];
        cc.vv.UserConfig.setGameCafeFrame(cc.find("icon", item).getComponent(cc.Sprite), data.gameid);
        cc.find("name", item).getComponent(cc.Label).string = data.title;
    }
    // 选择游戏类型
    onSelectMenuItem(item: cc.Node, index: number, lastIndex: number) {
        let data = this.createMenuList[index];
        this.gameid = data.gameid;
        this.updateView();
        // 通知主界面切换菜单
        Global.dispatchEvent("EVENT_FRIEND_CREATE_ROOM", this.gameid)
    }
    // 创建好友房间结果
    FRIEND_ROOM_CREATE(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode) {
            this.btnConfirmFriend.getComponent("ButtonGrayCmp").interactable = true;
            if (msg.spcode == 662) {
                cc.vv.FloatTip.show(___("还在游戏中,不能加入其它房间"));
            }
            if (msg.spcode == 752) {
                cc.vv.FloatTip.show(___("创建失败,已达到最大创建房间数"));
            }
            return;
        }
        // 判断是否需要直接进入游戏
        if (this.isAutoJoin) {
            cc.vv.NetManager.send({ c: MsgId.FRIEND_ROOM_JOIN, deskid: msg.deskinfo.deskid, gameid: msg.deskinfo.gameid }, true);
        }
        cc.vv.PopupManager.removePopup(this.node);
    }
    // 创建房间
    onClickConfim() {
        if (this.isPrivate && this.pwd.length <= 0) {
            cc.vv.FloatTip.show(___("创建密码房间,需要输入密码"));
            return;
        }
        // 判断底注是否满足要求
        // if (cc.vv.UserManager.coin < this.entry) {
        //     cc.vv.AlertView.showTips(___("金币不足"), () => {
        //         cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
        //     });
        //     return;
        // }
        if (this.pwd.length > 0) {
            // 创建好友房间
            cc.vv.NetManager.send({
                c: MsgId.FRIEND_ROOM_CREATE,
                gameid: this.gameid,
                entry: this.entry,
                pwd: this.pwd,
                autoStart: this.autoStart,
                // maxScore: this.tarneebScore,
                // minScore: this.minScore,
                maxSeat: this.seatNum,
            }, true);
        } else {
            cc.vv.NetManager.send({
                c: MsgId.FRIEND_ROOM_CREATE,
                gameid: this.gameid,
                entry: this.entry,
                autoStart: this.autoStart,
                // maxScore: this.tarneebScore,
                // minScore: this.minScore,
                maxSeat: this.seatNum,
            }, true);
        }

        this.btnConfirmFriend.getComponent("ButtonGrayCmp").interactable = false;
    }
    // 点击选着是否开启密码
    onSelectUsePwd(toggle: cc.Toggle) {
        // this.pwdLabel.node.parent.active = this.pwdOptions.toggleItems[0].isChecked;
    }
    // 设置密码
    onSetPwd() {
        cc.vv.PopupManager.addPopup(this.pwdPrefab, {
            opacityIn: true,
            onShow: (node) => {
                let pwdCpt = node.getComponent(RoomFriendPwd);
                pwdCpt.setPwd(this.pwd);
                pwdCpt.setCallback((pwd, closeFunc) => {
                    this.pwd = pwd.length >= 4 ? pwd : "";
                    closeFunc();
                });
            }
        });
    }
}