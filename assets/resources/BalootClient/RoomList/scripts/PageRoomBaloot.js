cc.Class({
    extends: require("BaseRoomCpt"),

    properties: {
        seatNodeList: [cc.Node],

        // 是不是房主
        _noHost: false,
        noHost: {
            set(value) {
                this._noHost = value;
                if (this.updateView) this.updateView();
            },
            get() {
                return this._noHost;
            }
        }
    },

    onOpen(parm) {
        parm = parm || {};
        // 进入匹配
        this.netListener.registerMsg(MsgId.ONLINE_START_MATCH_ROOM, this.ONLINE_START_MATCH_ROOM, this, false);
        // 邀请结果
        this.netListener.registerMsg(MsgId.INVITATION_RESULT, this.INVITATION_RESULT, this, false);
        // 人员变动
        this.netListener.registerMsg(MsgId.QUIT_TEAM, this.QUIT_TEAM, this, false);
        // 修改配置结果
        // this.netListener.registerMsg(MsgId.TEAM_CHANGE_ENTER, this.TEAM_CHANGE_ENTER, this, false);
        cc.vv.NetManager.send({ c: MsgId.ONLINE_ENTER_LONLINE, gameid: this.gameid }, true);
        // 更新friendInfo
        this.friendInfo = parm.friendInfo;
        if (parm.friendInfo) {
            this.noHost = true;
        } else {
            this.noHost = false;
        }
        // 更新队伍界面
        this.updateSeatView();
    },

    onClose() {
        this.netListener.clear();
        cc.vv.NetManager.send({ c: MsgId.FRIEND_ROOM_LEAVE, gameid: this.gameid, roomtype: 2 }, true);
    },

    onClickRoomItem(cfg) {
        if (this.isLoading) return;
        if (this.noHost) return;
        // 判断金币是否满足最小携带
        if (cc.vv.UserManager.coin < cfg.entry) {
            cc.vv.AlertView.showTips(___("您的金币不足"), () => {
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            })
            return;
        }
        let frienduid = 0;
        if (this.friendInfo) {
            frienduid = this.friendInfo.uid;
        }
        this.isLoading = true;
        StatisticsMgr.reqReport(ReportConfig.ONLINE_START_GAME,null, this.gameid);
        // 发送加入房间请求
        cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, frienduid: frienduid, ssid: cfg.ssid }, true);
    },
    // 有人加入队伍
    INVITATION_RESULT(msg) {
        this.friendInfo = msg.friend || msg;
        this.updateSeatView();
    },
    // 有人退出退伍
    QUIT_TEAM(msg) {
        // 自己一定会变成房主
        this.noHost = false;
        // 清空队友信息
        this.friendInfo = null;
        this.updateSeatView();
        this.updateView();
    },

    // 点击邀请按钮
    onClickInvite() {
        // 打开邀请界面
        Global.dispatchEvent("INVITE_FRIEND_MATCH_GAME", {
            moduleType: 1,
            entryCoin: this.entry,
            gameid: this.gameid
        });
    },

    updateSeatView() {
        // 组装自己的信息
        let selfInfo = {
            usericon: cc.vv.UserManager.userIcon,
            playername: cc.vv.UserManager.nickName,
            uid: cc.vv.UserManager.uid,
            avatarframe: cc.vv.UserManager.avatarframe,
        };
        let seatInfoList = [selfInfo, this.friendInfo];
        // 第一个座位上 是自己的信息 第二个座位 是队友
        for (let i = 0; i < this.seatNodeList.length; i++) {
            let seatNode = this.seatNodeList[i];
            let info = seatInfoList[i];
            if (!info) {
                cc.find("nouser", seatNode).active = true;
                cc.find("user", seatNode).active = false;
            } else {
                cc.find("nouser", seatNode).active = false;
                cc.find("user", seatNode).active = true;
                // 设置数据
                cc.find("user/name", seatNode).getComponent(cc.Label).string = info.playername;
                cc.find("user/id", seatNode).getComponent(cc.Label).string = __("ID", ":", info.uid);
                cc.find("user/UserHead", seatNode).getComponent("HeadCmp").setHead(info.uid, info.usericon);
                cc.find("user/UserHead", seatNode).getComponent("HeadCmp").setAvatarFrame(info.avatarframe);
            }
        }
    },

});
