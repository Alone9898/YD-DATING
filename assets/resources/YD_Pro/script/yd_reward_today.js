cc.Class({
    extends: cc.Component,

    properties: {
        listView: require('List'),
        _canClickCnt: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_OPEN_GIFT, this.REQ_OPEN_GIFT, this);
        netListener.registerMsg(MsgId.EVENT_RETURN_WATER_REWARD, this.EVENT_RETURN_WATER_REWARD, this);  // 领取奖励


    },

    start() {

    },

    updateView() {
        let data = cc.vv.UserManager.todayrewards;

        let list = [];
        let self = this;
        this._canClickCnt = 0;
        for (let key in data) {
            if (data[key] > 0) {
                let res = {};
                res.key = key;
                res.coin = data[key];
                if (key == "week") {
                    res.pngIdx = 0;
                    res.title = "Weekly Bonus";
                    res.claimFunc = function () {
                        self.sendVipReq(2)
                    }
                } else if (key == "month") {
                    res.pngIdx = 1;
                    res.title = "Monthly Bonus";
                    res.claimFunc = function () {
                        self.sendVipReq(3)
                    }
                } else if (key == "upgrade") {
                    res.pngIdx = 2;
                    res.title = "Level Up Bonus";
                    res.claimFunc = function () {
                        self.sendVipReq(4)
                    }
                } else if (key == "rakeback") {
                    res.pngIdx = 3;
                    res.title = "Rakeback Bonus";
                    res.claimFunc = function () {
                        self.sendRakeBack()
                    }
                }
                list.push(res);
            }
        }
        this.localData = list;
        this._canClickCnt = list.length;
        this.listView.numItems = list.length;
    },

    //type-1:签到 2:weeklybonus 3:monthlybonus 4:levelbonus
    sendVipReq(type) {
        cc.vv.NetManager.send({c: MsgId.REQ_OPEN_GIFT, type: type, vip: cc.vv.UserManager.svip});
    },

    sendRakeBack() {
        cc.vv.NetManager.send({c: MsgId.EVENT_RETURN_WATER_REWARD, isall: 1});
    },

    // 更新Item
    onUpdateItem(item, idx) {
        let data = this.localData[idx];
        cc.find("bg", item).getComponent("ImgSwitchCmp").setIndex(data.pngIdx);
        cc.find("icon", item).getComponent("ImgSwitchCmp").setIndex(data.pngIdx);
        cc.find("title", item).getComponent("ImgSwitchCmp").setIndex(data.pngIdx);
        Global.setLabelString("coin", item, Global.FormatNumToComma(data.coin));

        let btn_claim = cc.find("btn_claim", item);
        Global.btnClickEvent(btn_claim, () => {
            this.clickItem = btn_claim;
            btn_claim.getComponent(cc.Button).interactable = false;
            cc.vv.UserManager.todayrewards[data.key] = 0;
            data.claimFunc();
        }, this);

        let Sprite = cc.find("Sprite", item);
    },

    REQ_OPEN_GIFT(msg) {
        if (msg.code == 200 && msg.spcode == 0) {
            let rewards = msg.rewards;
            Global.RewardFly(rewards, this.clickItem.convertToWorldSpaceAR(cc.v2(0, 0)));

            this._canClickCnt -= 1;
            if(this._canClickCnt <= 0){
                this.close();
            }
        }
    },

    EVENT_RETURN_WATER_REWARD(msg) {
        if (msg.code != 200) return;

        if (msg.rewards) {
            Global.RewardFly(msg.rewards, this.clickItem.convertToWorldSpaceAR(cc.v2(0, 0)));
        }

        this._canClickCnt -= 1;
        if(this._canClickCnt <= 0){
            this.close();
        }

    },

    close() {
        cc.vv.PopupManager.removePopup(this.node)
    }

    // update (dt) {},
});
