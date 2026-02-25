cc.Class({
    extends: require("BaseRoomCpt"),

    properties: {
        toggleContainer: cc.ToggleContainer,
    },

    onOpen() {
        // 进入匹配监听
        this.netListener.registerMsg(MsgId.GAME_ENTER_MATCH, this.GAME_ENTER_MATCH, this, false);
        cc.vv.NetManager.send({ c: MsgId.ONLINE_ENTER_LONLINE, gameid: this.gameid }, true);
    },

    onClose() {
        this.netListener.clear();
    },
    onClickRoomItem(cfg) {
        if (this.isLoading) return;
        // 判断金币是否满足最小携带
        if (cc.vv.UserManager.coin < cfg.entry) {
            cc.vv.AlertView.showTips(___("您的金币不足"), () => {
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            })
            return;
        }
        let frienduid = 0;
        for (const toggle of this.toggleContainer.toggleItems) {
            if (toggle.isChecked) {
                let index = this.toggleContainer.toggleItems.indexOf(toggle);
                frienduid = [0, 100][index];
            }
        }
        this.isLoading = true;
        StatisticsMgr.reqReport(ReportConfig.ONLINE_START_GAME,null, this.gameid);
        // 发生加入房间请求
        cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, frienduid: frienduid, ssid: cfg.ssid }, true);
    },
    // 进入排位赛界面
    onClickRank() {
        Global.dispatchEvent("HALL_OPEN_LEAGUE");
    },


});
