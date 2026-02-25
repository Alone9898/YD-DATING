/**
 * 777小游戏
 */

let Game777Cfg = {
    [1]: { normal: 'theme160_s_104', win_node: 's104' }, //2x
    [2]: { normal: 'theme160_s_103', win_node: 's103' }, //3x
    [3]: { normal: 'theme160_s_102', win_node: 's102' }, //5x
    [4]: { normal: 'theme160_s_105', win_node: 's105' }, //红7
    [5]: { normal: 'theme160_s_106', win_node: 's106' }, //蓝7
    [6]: { normal: 'theme160_s_107', win_node: 's107' }, //3bar
    [7]: { normal: 'theme160_s_108', win_node: 's108' }, //2bar
    [8]: { normal: 'theme160_s_109', win_node: 's109' }, //bar
}

let Game777Mul = {
    [1]: 3117,  //任意*X同类型元素,
    [2]: 25,    //3个红7 
    [3]: 9,     //3个蓝7
    [4]: 7.5,    //任意3个7，
    [5]: 9.4,   //3个3bar
    [6]: 7.5,   //2个2bar
    [7]: 5,     //3个1bar
    [8]: 2.5,   //任意3个bar

}

cc.Class({
    extends: require("LMSlots_PauseUI_Base"),

    properties: {
        stopBtn: cc.Node,
        startBtn: cc.Node,
        title: cc.Node,
        winLabel: cc.Node,
        ruleBtn: cc.Node,
        closeBtn: cc.Node,
        betLabel: cc.Node,

        machine: cc.Node,
        entryBtn: cc.Node,

        dropCoin: cc.Node,

        dropCoinInBtn: cc.Node,
        addCoinInBtn: cc.Node,

        _offset: 800,

        _bet: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {



        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("PBEvent.CLOSE_MINIGAME_777", this.CLOSE_MINIGAME_777, this);

        Global.btnClickEvent(this.startBtn, function () {
            StatisticsMgr.reqReportNow(ReportConfig.MINIGAME_777_SPIN);
            this.onClickStart();
        }, this)

        this.stopBtn.on("click", this.stop777Call, this);
        this.stopBtn.active = false;

        this.machine.x = this.node.parent.x < 0 ? -this._offset : this._offset;

        this.entryBtn.on("click", () => {
            StatisticsMgr.reqReportNow(ReportConfig.MINIGAME_777_OPEN);
            this.node.parent.zIndex = 101;
            this.entryBtn.active = false;
            let endX = this.node.parent.x < 0 ? (-this.entryBtn.width / 2 + this.machine.width / 2) : (this.entryBtn.width / 2 - this.machine.width / 2);
            cc.tween(this.machine)
                .to(0.3, { x: endX }, { easing: "backOut" })
                .start();
        });

        this.closeBtn.on("click", () => {
            StatisticsMgr.reqReportNow(ReportConfig.MINIGAME_777_CLOSE);
            this.node.parent.zIndex = 99;
            cc.tween(this.machine)
                .to(0.3, { x: this.node.parent.x < 0 ? -this._offset : this._offset }, { easing: "backIn" })
                .call(() => {
                    this.entryBtn.active = true;
                })
                .start();
        });

        this.ruleBtn.on("click", () => {
            StatisticsMgr.reqReportNow(ReportConfig.MINIGAME_777_RULE);
            cc.vv.PopupManager.addPopup("games/PokerBase/prefabs/MiniGame_777/MiniGame_777_rule", { opacityIn: true });
        });

        this.winLabel.active = false;
        this.title.active = true;

        this.showInitReel()

        Global.registerEvent("REEL_STOP", this.recvReelStop, this);

        this.node.active = facade.dm.deskInfo.open777 === 1;
    },

    CLOSE_MINIGAME_777() {
        this.node.parent.zIndex = 99;
        cc.tween(this.machine)
            .to(0.3, { x: this.node.parent.x < 0 ? -this._offset : this._offset }, { easing: "backIn" })
            .call(() => {
                this.entryBtn.active = true;
            })
            .start();
    },

    onEnable() {
        cc.vv.NetManager.registerMsg(MsgId.PB_MINIGAME_777, this.onRcvSubGameAction, this);
    },

    onDisable() {
        cc.vv.NetManager.unregisterMsg(MsgId.PB_MINIGAME_777, this.onRcvSubGameAction, false, this);
    },

    start() {
        this.scheduleOnce(() => {
            this.showEnter(facade.dm.deskInfo.conf.entry);
        });
    },

    //avgBet:收集游戏的平均押注，44协议服务端会下发的
    //用来显示中奖估算额度
    showEnter: function (bet) {
        this._bet = bet;
        this.betLabel.getComponent(cc.Label).string = bet;
        this._bSendReq = false
        this._subGameData = null
        this._startRound = 0;
        this.hideAllSubNode();
    },

    //开始游戏
    onClickStart: function () {
        if (this._bSendReq) {
            return
        }

        if (cc.vv.UserManager.coin < this._bet) {
            cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COINS);
            return;
        }

        this._bSendReq = true
        let req = { c: MsgId.PB_MINIGAME_777 };
        req.bet = this._bet;
        cc.vv.NetManager.send(req, true);

        this.startBtn.active = false;

        // //test
        // let msg = {"data":{"rtype":1,"wincoin":3211525,"cardsList":[[3,3,4],[4,4,4],[3,3,3]]},"uid":1728,"c":51,"code":200}
        // this.onRcvSubGameAction(msg)
    },

    onRcvSubGameAction: function (msg) {
        AppLog.log("接收游戏动作数据");

        if (msg.code == 200) {
            this._subGameData = msg;
            //延时一秒开始
            this.scheduleOnce(() => {
                this.startMoveReel()
            })

        }
    },

    showInitReel: function () {
        for (let i = 0; i < 3; i++) {
            let reel = cc.find('spr_machine/node_content/reel' + (i + 1), this.machine)
            reel.getComponent('PBMiniGame777_reel').createItems(Game777Cfg)
        }
    },

    startMoveReel: function () {
        this.hideAllSubNode();
        this.title.active = true;
        this.winLabel.active = false;

        this._stopReelNum = 0
        if (this._subGameData) {
            for (let i = 0; i < 3; i++) {
                let reelResult = [0, 0, 0]
                let roudData = this._subGameData.cards;
                reelResult[1] = roudData[i]
                let reel = cc.find('spr_machine/node_content/reel' + (i + 1), this.machine)
                reel.getComponent('PBMiniGame777_reel').startMove(reelResult)
            }
        }

        this.stopBtn.active = true;
    },

    stop777Call: function () {
        for (let i = 0; i < 3; i++) {
            let reel = cc.find('spr_machine/node_content/reel' + (i + 1), this.machine)
            reel.getComponent('PBMiniGame777_reel').stopMove()
        }

        this.stopBtn.active = false;
    },

    recvReelStop: function () {
        let self = this
        this._stopReelNum += 1
        if (this._stopReelNum == 3) {
            this.stopBtn.active = false;

            if (this._subGameData.mult > 0) {
                this.showResultAnimation(this._subGameData.cards);
            }

            this.scheduleOnce(() => {
                this.showEnd()
                this._bSendReq = false;
            }, 1.5);
        }
    },

    showEnd: function () {
        //设置金币
        let coin = this._subGameData.mult * facade.dm.deskInfo.conf.entry;
        let script = this.dropCoin.getComponent('DropCoins')
        if (coin > 0) {
            this.title.active = false;
            this.winLabel.active = true;
            script.setPlay();

            if (this.entryBtn.active) {
                // this.dropCoinInBtn.active = true;
                this.dropCoinInBtn.getComponent("DropCoins").setPlay();
                this.addCoinInBtn.active = true;
                this.addCoinInBtn.getComponent(cc.Label).string = __("+", Global.formatNumShort(coin, 0));
                cc.tween(this.addCoinInBtn)
                    .by(0.5, { y: 100 })
                    .call(() => {
                        this.addCoinInBtn.active = false;
                        this.addCoinInBtn.y -= 100;
                    })
                    .start();
            }

        }
        let lbl_coin = this.winLabel;
        Global.doRoallNumEff(lbl_coin, 0, coin, 1.5, () => {
            this.startBtn.active = true;
            script.stopPlay();
            if (this.entryBtn.active) {
                this.dropCoinInBtn.getComponent("DropCoins").stopPlay();
                // this.dropCoinInBtn.active = false;
            }
        }, null, 0, true)

        let p = facade.dm.playersDm.getPlayerByUid(this._subGameData.uid);
        if (p) {
            p.coin = this._subGameData.coin;
            Global.dispatchEvent("PBEvent.USER_COIN_CHANGE", { uid: p.uid });
        }
    },

    //显示结果的spine动画
    showResultAnimation(cardlist) {
        this.ShowResultNode(true)
        for (let i = 0; i < cardlist.length; i++) {
            let sname = this.getSpineAnimationName(cardlist[i]);
            let symbol = cc.find('spr_machine/node_content/winmask/Sp_Game777_Symbol' + i + '/' + sname, this.machine)
            symbol.active = true;
            symbol.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);

            cc.tween(symbol).repeat(10, cc.sequence(cc.fadeIn(0.1), cc.delayTime(0.2), cc.fadeOut(0.1), cc.delayTime(0.2))).start();
        }
    },

    ShowResultNode(bShow) {
        let winNode = cc.find('spr_machine/node_content/winmask', this.machine)
        winNode.active = bShow
    },


    //结果显示spine
    getSpineAnimationName(id) {
        let cfg = Game777Cfg;
        for (let i in cfg) {
            let item = cfg[i]
            if (i == id) {
                return item.win_node;
            }
        }
    },

    //隐藏所有子symbol
    hideAllSubNode() {
        this.ShowResultNode(false)
        for (let i = 0; i < 3; i++) {
            let symbolnode = cc.find('spr_machine/node_content/winmask/Sp_Game777_Symbol' + i, this.machine)
            let children = symbolnode.children;
            for (let j = 0; j < children.length; j++) {
                children[j].active = false;
            }
        }
    }
    // update (dt) {},
});
