
cc.Class({
    extends: cc.Component,

    properties: {
        list: require('List'),

        lblRecived:cc.Label,
        lblUnclaimed:cc.Label,
        collectAllBtn:cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.netListener = this.node.addComponent("NetListenerCmp");

        Global.btnClickEvent(cc.find("tog_bet/toggle1",this.node),this.onClickToggle1,this);
        Global.btnClickEvent(cc.find("tog_bet/toggle2",this.node),this.onClickToggle2,this);
        Global.btnClickEvent(cc.find("tog_bet/toggle3",this.node),this.onClickToggle3,this);
        Global.btnClickEvent(cc.find("tog_bet/toggle4",this.node),this.onClickToggle4,this);

        Global.btnClickEvent(cc.find("btn_rule",this.node),this.onClickRule,this);

    },

    onEnable() {
        this.netListener.registerMsg(MsgId.EVENT_RETURN_WATER_CONFIG, this.EVENT_RETURN_WATER_CONFIG, this);  // 获取主线任务
        this.netListener.registerMsg(MsgId.EVENT_RETURN_WATER_REWARD, this.EVENT_RETURN_WATER_REWARD, this);  // 领取奖励

        this.sentReturnConfig();
    },

    // type 1-今日 2-昨日 3-近7天 4-近30天
    sentReturnConfig(type){
        type = type || 2;
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_RETURN_WATER_CONFIG , rtype:type});
    },

    EVENT_RETURN_WATER_CONFIG(msg) {
        if (msg.code != 200) return;
        this.localData = msg.list
        this._rtype = msg.rtype;
        this.recived = msg.recived; // 已领取
        this.unclaimed = msg.unclaimed; // 未领取

        this.updateView();
    },
    // 领取
    // 结果
    EVENT_RETURN_WATER_REWARD(msg) {
        if (msg.code != 200) return;
        if (msg.spcode == 210){
            cc.vv.FloatTip.show("illegal_parameter");
            return;
        } else if(msg.spcode == 756){
            cc.vv.FloatTip.show("The record has expired");
            return;
        } else if(msg.spcode == 935){
            cc.vv.FloatTip.show("Award Received");
            return;
        }

        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_RETURN_WATER_CONFIG });

        if (this._curItem) {
            if(msg.rewards) {
                Global.RewardFly(msg.rewards, this._curItem.convertToWorldSpaceAR(cc.v2(0, 0)));
            }
            // for (const reward of msg.rewards) {
            //     if (reward.type === 1) {
            //         Global.RewardFly(msg.rewards, this._curItem.convertToWorldSpaceAR(cc.v2(0, 0)));
            //         break;
            //     }
            // }
        }
        this.updateView();
    },
    // 更新界面
    updateView() {

        cc.find("tog_bet/toggle1",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 1;
        cc.find("tog_bet/toggle2",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 2;
        cc.find("tog_bet/toggle3",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 3;
        cc.find("tog_bet/toggle4",this.node).getComponent(cc.Toggle).isChecked = this._rtype == 4;


        this.lblRecived.string = Global.FormatNumToComma(this.recived);
        this.lblUnclaimed.string = Global.FormatNumToComma(this.unclaimed);


        this.list.numItems = this.localData.length;
        // 更新一键领取按钮
        let canCollectItem = [];
        for (const _item of this.localData) {
            if (_item.state == 1) {
                canCollectItem.push(_item);
            }
        }
        this.collectAllBtn.interactable = canCollectItem.length > 0;
        this.collectAllBtn.node.active = canCollectItem.length > 0;


    },
    // 更新Item
    //-- 1:待领取, 2:已领取, 3:过期作废, 4:只能看还不能领取
    onUpdateItem: function (item, idx) {
        let data = this.localData[idx];

        cc.find("db1", item).active = idx%2;
        cc.find("name", item).getComponent(cc.Label).string = cc.vv.GameItemCfg[data.gameid].gamename;
        cc.find("bet", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.bet);
        cc.find("rate", item).getComponent(cc.Label).string = data.rate*100 + "%";
        cc.find("return", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.backcoin);

        let staVal = data.state
        cc.find("btn_get", item).active = staVal == 1;
        cc.find("state", item).active = staVal != 1;
        let btn_text = ""
        let text_color 
        if(staVal == 2){
            btn_text = "Received"
            text_color = new cc.Color().fromHEX("#ffde00")
        }
        else if(staVal == 3){
            btn_text = "Expired"
            text_color = new cc.Color().fromHEX("#ff5353")
        }
        else if (staVal == 4){
            let dif = Math.floor((data.atime*1000 - new Date().getTime())/1000)
            btn_text = Global.formatSec(dif,null,true) 
            text_color = new cc.Color().fromHEX("#cfba1c")
            
        }
        if(btn_text){
            cc.find("state", item).getComponent(cc.Label).string = btn_text;
        }
        if(text_color){
            cc.find("state", item).color = text_color;
        }
        
        
        let retimerCmp = cc.find("state", item).getComponent("ReTimer")
        if(staVal == 4){
            if(!retimerCmp){
                retimerCmp = cc.find("state", item).addComponent("ReTimer")
            }
            retimerCmp.enabled = true
            let dif = Math.floor((data.atime*1000 - new Date().getTime())/1000)
            retimerCmp.setReTimer(dif,1)
        }
        else{
            if(retimerCmp) retimerCmp.enabled = false
        }
        
    },
    // 点击领取
    onClickItem(event) {
        this._curItem = event.currentTarget;
        let data = this.localData[event.currentTarget.parent._listId];
        cc.vv.NetManager.send({ c: MsgId.EVENT_RETURN_WATER_REWARD, rid: data.id, isall: 0 });
        // StatisticsMgr.reqReport(ReportConfig.EVENT_REWARD_GET, data.taskid);
    },
    // 一键领取
    onClickCollectAll() {
        this._curItem = this.collectAllBtn.node;
        this.collectAllBtn.interactable = false;
        cc.vv.NetManager.send({ c: MsgId.EVENT_RETURN_WATER_REWARD, isall: 1 });
    },

    onClickToggle1(){
        this._rtype = 1;
        this.sentReturnConfig(1);
    },
    onClickToggle2(){
        this._rtype = 2;
        this.sentReturnConfig(2);
    },
    onClickToggle3(){
        this._rtype = 3;
        this.sentReturnConfig(3);
    },
    onClickToggle4(){
        this._rtype = 4;
        this.sentReturnConfig(4);
    },

    onClickRule(){
        let url = "YD_Pro/prefab/yd_rebate_rule"
        cc.vv.PopupManager.addPopup(url)
    }

    // update (dt) {},
});
