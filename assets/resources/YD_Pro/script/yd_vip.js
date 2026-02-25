
cc.Class({
    extends: cc.Component,

    properties: {
        index:{
            set(value){
                this._index = this.calcIndex(value)
                this.updateView();
            },
            get(){
                return this._index;
            }
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.FixDesignScale_V(this.node);

        this.panel = cc.find("ui", this.node);
        this._timeDownW = cc.find("vip_info/btn2", this.panel).getComponent("TimeDownCpt");
        this._timeDownW.setTimeFormatStr("hh:mm:ss");
        this._timeDownW.setCallback(this.sendGetVipInfo.bind(this));
        this._timeDownM = cc.find("vip_info/btn3", this.panel).getComponent("TimeDownCpt");
        this._timeDownM.setTimeFormatStr("hh:mm:ss");
        this._timeDownM.setCallback(this.sendGetVipInfo.bind(this));

        // this.node_info = cc.find("vip_info/layout", this.panel);
        let btn_left = cc.find("btn_left", this.panel)
        btn_left.active = false
        Global.btnClickEvent(btn_left, ()=>{
            this.index--;
        })
        let btn_right = cc.find("btn_right", this.panel)
        btn_right.active = false
        Global.btnClickEvent(btn_right, ()=>{
            this.index++;
        })

        // Global.btnClickEvent(cc.find("vip_info/btn1", this.panel), ()=>{
        //     this.clickRewards(this.btnInfos);
        // }, this);
        Global.btnClickEvent(cc.find("vip_info/btn2", this.panel), ()=>{
            this.clickRewards(this.btnInfow);
        }, this);
        Global.btnClickEvent(cc.find("vip_info/btn3", this.panel), ()=>{
            this.clickRewards(this.btnInfom);
        }, this);
        Global.btnClickEvent(cc.find("vip_info/btn4", this.panel), ()=>{
            this.clickRewards(this.btnInfol);
        }, this);
        Global.btnClickEvent(cc.find("btn_tip", this.panel), ()=> {
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_vip_help");
        }, this);
        Global.btnClickEvent(cc.find("btn_buy", this.panel), ()=>{
            // cc.vv.PopupManager.removePopup(this.node);
            // cc.vv.GameManager.jumpTo(5);
            if(Global.isIOSAndroidReview()){
                //前往充值
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            } else {
                cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                    onShow: (node) => {
                        node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                    }
                })
            }
        }, this);


        // Global.btnClickEvent(cc.find("btn", this.node), ()=>{  // --测试按钮
        //     cc.vv.NetManager.send({ c: 356, id:17});
        // }, this);

        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_GET_VIP_INFO, this.REQ_GET_VIP_INFO, this);
        netListener.registerMsg(MsgId.REQ_OPEN_GIFT, this.REQ_OPEN_GIFT, this);
    },

    start () {
        this.sendGetVipInfo()

    },

    sendGetVipInfo(){
        cc.vv.NetManager.send({ c: MsgId.REQ_GET_VIP_INFO,});
    },

    // onEnable() {
        
    // },

    REQ_GET_VIP_INFO(msg){
        if(msg.code == 200){

            this.max_vip = cc.vv.UserConfig.max_vip + 1;

            this.vipData = msg.data;
            this.wend = msg.wend;
            this.wstatus = msg.wstatus //周领取状态
            this.mstatus = msg.mstatus //月领取状态
            this.mend = msg.mend;
            this.index = this.index>=0 ? this.index : cc.vv.UserManager.svip;

            cc.find("btn_left", this.panel).active = true
            cc.find("btn_right", this.panel).active = true
        }
    },

    REQ_OPEN_GIFT(msg){
        if(msg.code == 200 && msg.spcode == 0){
            let rewards = msg.rewards;
            Global.RewardFly(rewards, this.clickItem.convertToWorldSpaceAR(cc.v2(0,0)));

            cc.vv.NetManager.send({ c: MsgId.REQ_GET_VIP_INFO});
        }
    },


    calcIndex(value) {
        let max = this.max_vip;
        if (value < 0) {
            value += (Math.floor(Math.abs(value / max)) + 1) * max
        }
        return value % max;
    },

    updateView(){
        let curVipLevel = this.index;
        let selfVipLevel = cc.vv.UserManager.svip;
        curVipLevel = Math.max(curVipLevel, 0);
        curVipLevel = Math.min(curVipLevel, this.max_vip);
        let config = this.vipData[curVipLevel];
        let nexconfig = this.vipData[curVipLevel+1];

        if(nexconfig){
            cc.find("layout/icon", this.panel).x = -330;
            cc.find("layout/icon2", this.panel).active = true;
            cc.vv.UserConfig.setVipFrame(cc.find("layout/icon", this.panel).getComponent(cc.Sprite), config.lv);
            cc.vv.UserConfig.setVipFrame(cc.find("layout/icon2", this.panel).getComponent(cc.Sprite), nexconfig.lv);

            let curExp = Math.min(cc.vv.UserManager.svipexp, nexconfig.exp);
            cc.find("layout/progress", this.panel).active = true;
            cc.find("layout/progress", this.panel).getComponent(cc.ProgressBar).progress = curExp/nexconfig.exp;
            cc.find("layout/progress/label", this.panel).getComponent(cc.Label).string = "Current deposit:" + Global.FormatNumToComma(curExp) ;

            cc.find("layout/des/New Label", this.panel).active = true;
            cc.find("layout/des/lbl", this.panel).active = true;
            cc.find("layout/des/lbl", this.panel).getComponent(cc.Label).string = Global.FormatNumToComma(nexconfig.exp);
        } else {    // 到了最后一级
            cc.find("layout/icon", this.panel).x = 0;
            cc.find("layout/icon2", this.panel).active = false;
            cc.vv.UserConfig.setVipFrame(cc.find("layout/icon", this.panel).getComponent(cc.Sprite), config.lv);
            cc.find("layout/progress", this.panel).active = false;
            cc.find("layout/des/New Label", this.panel).active = false;
            cc.find("layout/des/lbl", this.panel).active = false;
        }

        let wEndTime = cc.find("vip_info/btn2/endT", this.panel);
        let mEndTime = cc.find("vip_info/btn3/endT", this.panel);

        let curTime = Math.floor(new Date().getTime()/1000);
        if(this.wend-curTime > 24*60*60){
            this._timeDownW.label.string = Global.getTimeStr(this.wend);
            this._timeDownW.label.node.x = 0;
            cc.find("daojishi", wEndTime).active = false;
        } else {
            this._timeDownW.timelife = this.wend-curTime;
            this._timeDownW.label.node.x = 16.5;
            cc.find("daojishi", wEndTime).active = true;
        }
        if(this.mend-curTime > 24*60*60){
            this._timeDownM.label.string = Global.getTimeStr(this.mend);
            this._timeDownM.label.node.x = 0;
            cc.find("daojishi", mEndTime).active = false;
        } else {
            this._timeDownM.timelife = this.mend-curTime;
            this._timeDownM.label.node.x = 16.5;
            cc.find("daojishi", mEndTime).active = true;
        }

        wEndTime.active = false;
        mEndTime.active = false;
        let wStatus = config.status_bonusw
        let mStatus = config.status_bonusm
        if(curVipLevel == selfVipLevel ){
            if(config.bonusw.length > 0 && curTime < this.wend && this.wstatus != 1){
                wEndTime.active = true;
            }
            if(config.bonusm.length > 0 && curTime < this.mend && this.mstatus != 1){
                mEndTime.active = true;
            }
            wStatus = this.wstatus
            mStatus = this.mstatus
        }

        this.showBtnState(cc.find("vip_info/btn2", this.panel), wStatus, config.bonusw);
        this.showBtnState(cc.find("vip_info/btn3", this.panel), mStatus, config.bonusm);
        this.showBtnState(cc.find("vip_info/btn4", this.panel), config.status_bonusl, config.bonusl);

        this.btnInfos = {info:config.bonuss, status:config.status_bonuss, type: 1};
        this.btnInfow = {info:config.bonusw, status:wStatus, type: 2};
        this.btnInfom = {info:config.bonusm, status:mStatus, type: 3};
        this.btnInfol = {info:config.bonusl, status:config.status_bonusl, type: 4};

        this.showBtnRedHit();
    },

    showBtnState(btn, status, info){
        cc.find("weilinqu", btn).active = status === 1; //  0:no ,1:待领取, 2:已领取
        cc.find("red", btn).active = status === 1;
        // cc.find("jinli_icon01", btn).active = status !== 2;
        // cc.find("jinli_icon02", btn).active = status == 2;

        Global.showSpriteGray(cc.find("jinli_icon01", btn),status == 2)
        
        cc.find("icon_ok_3", btn).active = status === 2;
        cc.find("lock", btn).active = cc.vv.UserManager.svip < this.index;
        cc.find("coin", btn).active = false;
        cc.find("claim",btn).active = status === 1
        for (const reward of info) {
            if (reward.type === 1) {
                cc.find("coin", btn).active = true
                cc.find("coin/lbl", btn).getComponent(cc.Label).string = Global.FormatNumToComma(reward.count);
            }
        }
    },

    clickRewards(data){
        if(data.status == 0){
            cc.vv.FloatTip.show("Claim when there is a red dot shows");
        } else if(data.status == 1){

            this.clickItem = cc.find("vip_info/btn"+data.type, this.panel)

            cc.vv.NetManager.send({ c: MsgId.REQ_OPEN_GIFT, type:data.type, vip:this.index});//type-1:签到 2:weeklybonus 3:monthlybonus 4:levelbonus

        } else if(data.status == 2){

        }

        // Global.RewardFly(info,fromWorldPos )
    },

    showBtnRedHit(){
        let curVipLevel = this.index;
        let selfVipLevel = cc.vv.UserManager.svip;
        let red_left = cc.find("btn_left/RedHitAnim",this.panel);
        let red_right = cc.find("btn_right/RedHitAnim",this.panel);
        red_left.active = false;
        red_right.active = false;
        for (let i = 0; i < curVipLevel; i++){
            if(this.vipData[i].status_bonusl === 1 || this.vipData[i].status_bonusm === 1 || this.vipData[i].status_bonuss === 1 || this.vipData[i].status_bonusw === 1){
                red_left.active = true;
                break;
            }
        }
        for (let i = curVipLevel+1; i <= selfVipLevel; i++){
            if(this.vipData[i].status_bonusl === 1 || this.vipData[i].status_bonusm === 1 || this.vipData[i].status_bonuss === 1 || this.vipData[i].status_bonusw === 1){
                red_right.active = true;
                break;
            }
        }
    },

    // update (dt) {},
});
