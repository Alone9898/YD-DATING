/**
 * Luckyspin
 */
 let isShare = false;
cc.Class({
    extends: cc.Component,

    properties: {
        spr_full:cc.SpriteFrame,
        spr_empty:cc.SpriteFrame,
        light_1:cc.SpriteFrame,
        light_2:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // let netListener = this.node.addComponent("NetListenerCmp");
        cc.vv.NetManager.registerMsg(MsgId.EVENT_FB_SHARE_CONFIG, this.EVENT_FB_SHARE_CONFIG, this);
        cc.vv.NetManager.registerMsg(MsgId.EVENT_FB_SHARE_SUCCESS, this.EVENT_FB_SHARE_SUCCESS, this);

        let shareBtn = cc.find("btn_share",this.node)
        Global.btnClickEvent(shareBtn,this.onClickShare,this)

        let btnSpin_free = cc.find("mid_free/btn_spin",this.node)
        Global.btnClickEvent(btnSpin_free,this.onClickFreeSpin,this)

        let btnSpin_refer = cc.find("mid_refer/btn_spin",this.node)
        Global.btnClickEvent(btnSpin_refer,this.onClickReferSpin,this)

        let recordBtn = cc.find("btn_record",this.node)
        Global.btnClickEvent(recordBtn,this.onClickRecord,this)

        let ruleBtn = cc.find("btn_rule",this.node)
        Global.btnClickEvent(ruleBtn,this.onClickRule,this)

        Global.registerEvent("EVENT_REFUSH_REFFERTIME",this.updateRefferTimes,this)
        Global.registerEvent("EVENT_REFUSH_FREETIME",this.updateFreeTimes,this)
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.EVENT_FB_SHARE_CONFIG, this.EVENT_FB_SHARE_CONFIG,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.EVENT_FB_SHARE_SUCCESS, this.EVENT_FB_SHARE_SUCCESS,false, this);
    },

    start () {
        cc.vv.NetManager.send({c:MsgId.EVENT_FB_SHARE_CONFIG})
        this.showLightAni(cc.find("mid_free/lun_bg",this.node))
        this.showLightAni(cc.find("mid_refer/lun_bg",this.node))
    },

    // 请求服务器配置返回
    EVENT_FB_SHARE_CONFIG(msg) {
        if (msg.code != 200) return;
        this._serverdata = msg;
        this.updateView();
    },

    EVENT_FB_SHARE_SUCCESS(msg){
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode == 1) {
            cc.vv.FloatTip.show(___("今日已分享"));
            return;
        }
        // 更新数据
        this._serverdata.shared = 1;
        this._serverdata.shareCnt = msg.shareCnt;
        this.updateView()
    },

    updateView:function(){
        //free奖励列表
        this._setLunpanReward(1,this._serverdata.conf)
        //spin按钮状态
        let bCanSpin = isShare
        if(this._serverdata.dftimes){ //有每日的免费次数
            bCanSpin = true
        }
        let btnSpin_free = cc.find("mid_free/btn_spin",this.node)
        btnSpin_free.getComponent(cc.Button).interactable = bCanSpin
        cc.find("RedHitAnim",btnSpin_free).active = bCanSpin
        
        if(!bCanSpin && this._serverdata.lefttime){
            // let curTime = Math.floor(new Date().getTime()/1000);
            let nRmind = this._serverdata.lefttime
            cc.find("Background/Label",btnSpin_free).addComponent("ReTimer").setReTimer(nRmind,1)

        }
        else{
            Global.setLabelString("Background/Label",btnSpin_free,"FREE SPIN")
        }
        
        //refer
        this._setLunpanReward(2,this._serverdata.conf2)
        let btnSpin_refer = cc.find("mid_refer/btn_spin",this.node)
        btnSpin_refer.getComponent(cc.Button).interactable = this._serverdata.times
        let showBtnStr = "REFER SPIN"
        if(this._serverdata.times){
            showBtnStr = cc.js.formatStr("REFER SPIN(%s)",this._serverdata.times)
        }
        Global.setLabelString("Background/Label",btnSpin_refer,showBtnStr)
        cc.find("RedHitAnim",btnSpin_refer).active = (this._serverdata.times)?true:false

        //人数
        for(let i = 0; i < 5; i++){
            let obj = cc.find("mid_refer/spr_txt/lay/pro_"+(i+1),this.node)
            if(i < this._serverdata.sun){
                obj.getComponent(cc.Sprite).spriteFrame = this.spr_full
            }
            else{
                obj.getComponent(cc.Sprite).spriteFrame = this.spr_empty
            }
        }

        cc.find("btn_share/RedHitAnim",this.node).active = (this._serverdata.shared == 0)
    },

    _setLunpanReward:function(lunType,cfg){
        let lunObj
        if(lunType == 1){
            lunObj = cc.find("mid_free",this.node)
        }
        else{
            lunObj = cc.find("mid_refer",this.node)
        }
        for(let i = 0; i < 6; i++){
            let reward = cfg[i][0]
            let item = cc.find("lun_bg/lun_fg/item"+(i+1),lunObj)
            Global.setLabelString("val",item,reward.count)
        }
    },


    onClickShare:function(){
        if(!this._serverdata){
            return
        }
        // let link = cc.vv.UserManager.sharelink
        if (Global.isNative()) {
            // ___("快上线,加入我的房间{1},全民都在玩的Poker Hero!", facade.dm.tableInfo.tableId), gameName
            let appName = cc.vv.UserConfig.getAppName()
            let shareStr = cc.js.formatStr("%s #%s# %s", "Come and play with me!", appName, cc.vv.UserManager.sharelink)
            cc.vv.FBMgr.WhatsappShare(shareStr, (data) => {
                // // 通知服务器 分享成功
                // cc.vv.NetManager.send({ c: MsgId.EVENT_FB_SHARE_SUCCESS });
            });
            if(!this._serverdata.shared){
                isShare = true;
                this.updateView();
                // 通知服务器 分享成功
                cc.vv.NetManager.send({ c: MsgId.EVENT_FB_SHARE_SUCCESS });
            }
            
            
        } else if (CC_DEBUG) {
            if(!this._serverdata.shared){
                isShare = true;
                this.updateView();
            }
            cc.vv.NetManager.send({ c: MsgId.EVENT_FB_SHARE_SUCCESS });
        }

        cc.find("btn_share/RedHitAnim",this.node).active = false
    },

    onClickFreeSpin:function(){
        let self = this
        // this._serverdata.shared = 0
        this._serverdata.dftimes = 0
        isShare = null
        this.updateView();

        cc.vv.PopupManager.addPopup("BalootClient/PopLuckySpin/FreeSpinView",{
            noCloseHit: true,
            noTouchClose: true,
            onShow: (node) => {
                node.getComponent("popspinview").setData(0,self._serverdata.conf)
            }
        })
    },

    onClickReferSpin:function(){
        let self = this
        cc.vv.PopupManager.addPopup("BalootClient/PopLuckySpin/RefferSpinView",{
            noCloseHit: true,
            noTouchClose: true,
            onShow: (node) => {
                node.getComponent("popspinview").setData(2,self._serverdata.conf2)
            }
        })
    },

    updateRefferTimes:function(data){
        let val = data.detail
        this._serverdata.times = val
        this.updateView()
    },

    updateFreeTimes:function(){
        this._serverdata.dftimes = 0
        this.updateView()
    },

    onClickRecord:function(){
        cc.vv.PopupManager.addPopup("BalootClient/PopLuckySpin/yd_luckyspin_records")
    },

    onClickRule:function(){
        cc.vv.PopupManager.addPopup("BalootClient/PopLuckySpin/yd_luckyspin_rule")
    },

    showLightAni:function(parNode){
        for(let i= 0;i <12; i++){
            let obj = cc.find("lt"+(i+1),parNode)
            if(obj){
                cc.tween(obj).repeatForever(
                    cc.tween()
                    .call(()=>{
                        let sp = this.light_1
                        if(i%2==0){
                            sp = this.light_2
                        }
                        obj.getComponent(cc.Sprite).spriteFrame = sp
                    })
                    .delay(0.5)
                    .call(()=>{
                        let sp = this.light_1
                        if(i%2==1){
                            sp = this.light_2
                        }
                        obj.getComponent(cc.Sprite).spriteFrame = sp
                    })
                    .delay(0.5)
                )
                .start()
            }
        }
    }

    // update (dt) {},
});
