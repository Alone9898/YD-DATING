// 签到奖励
cc.Class({
    extends: cc.Component,
    properties: {
        contentNode: cc.Node,
        // normalSp: cc.SpriteFrame,
        // collectSp: cc.SpriteFrame,
        _sign: false,
    },
    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.EVENT_VIP_SIGN_CONFIG, this.EVENT_VIP_SIGN_CONFIG, this)
        netListener.registerMsg(MsgId.EVENT_VIP_SIGN_REWARD, this.EVENT_VIP_SIGN_REWARD, this)
        for (let i = 0; i < this.contentNode.children.length; i++) {
            const item = this.contentNode.children[i];
            item.on("click", this.onClickItem, this)
        }
        this._sg = cc.find("bg/sg", this.node)
        this._sg.active = false
    },
    onEnable() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_VIP_SIGN_CONFIG });
    },
    // 签到奖励配置
    async EVENT_VIP_SIGN_CONFIG(msg) {
        if (msg.code != 200) return;
        this.localData = msg;
        // 更新界面
        this.updateView();
    },

    // 签到结果
    EVENT_VIP_SIGN_REWARD(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        if(msg.curSignCount == 7){
            cc.vv.UserManager.vipsign = 2
        }
        // 修改本地数据
        this.localData.signFlag = 1;
        // 更新界面
        this.updateView()
        // 提示领取成功
        let jiangli = cc.find("bg/jiangli", this.node)
        jiangli.active = true
        let ske = jiangli.getComponent(sp.Skeleton)
        ske.setAnimation(0, "animation", false)
        ske.setCompleteListener(()=>{
            cc.vv.PopupManager.removeTop()
        })
        Global.RewardFly(msg.rewards, jiangli.convertToWorldSpaceAR(cc.v2(0, 0)));
    },
    updateView() {
        for (let i = 0; i < this.contentNode.children.length; i++) {
            const item = this.contentNode.children[i];
            this.onUpdateItem(item, i);
        }
    },
    // 更新Item
    onUpdateItem: function (item, idx) {
        let data = this.localData.signData[idx]
        // Global.setLabelString("lbl_val", item, data.prize[0].count)
        // 状态修改
        cc.find("light", item).active = false;
        cc.find("today", item).active = data.day == this.localData.signCount;
        //是否vip限制
        let node_lock = cc.find("node_vip_lock",item)
        if(node_lock){
            node_lock.active = (data.svip>0 && data.svip > cc.vv.UserManager.svip)
            let spvip = cc.find("vip",node_lock).getComponent(cc.Sprite)
            cc.vv.UserConfig.setVipFrame(spvip,data.svip)
           
        }
        
        if (data.day == this.localData.signCount) {
            cc.find("light", item).active = this.localData.signFlag == 0;
            cc.find("icon_ok", item).active = this.localData.signFlag == 1;

            let str = this.localData.signFlag == 1 ? data.prize[0].count : "Claim";
            Global.setLabelString("lbl_val", item, str);

            if (this.localData.signFlag == 0) {
                this._sg.active = true
                this._sg.position = this._sg.parent.convertToNodeSpaceAR(item.convertToWorldSpaceAR(cc.v2(4,4)))
                let ske = this._sg.getComponent(sp.Skeleton)
                if (idx==6) {
                    ske.setAnimation(0, "animation2", true);
                } else {
                    ske.setAnimation(0, "animation", true);
                }
            }
        } else {
            cc.find("icon_ok", item).active = data.day < this.localData.signCount;

            let str = data.day < this.localData.signCount ? data.prize[0].count : "Claim";
            Global.setLabelString("lbl_val", item, str);
        }
    },
    onClickItem(event) {
        if (!this.localData) return;
        let index = this.contentNode.children.indexOf(event.node);
        let data = this.localData.signData[index]
        if (data.day == this.localData.signCount && this.localData.signFlag == 0) {
            //是否满足VIP需求
            if(data.svip >0 && data.svip > cc.vv.UserManager.svip){
                cc.vv.AlertView.show("Upgrade to VIP"+data.svip+" for more bonuses",()=>{
                    //前往充值
                    cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
                },()=>{
                    //取消
                },null,null,null,null,"Deposit")
                return
            }
            // 发送领取请求
            cc.vv.NetManager.send({ c: MsgId.EVENT_VIP_SIGN_REWARD });
            StatisticsMgr.reqReport(ReportConfig.SIGN_VIP_REWARD_GET);
            cc.vv.RedHitManager.setKeyVal('sign',0)
        }
    }
});
