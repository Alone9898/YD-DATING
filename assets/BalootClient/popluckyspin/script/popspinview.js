/**
 * 弹出的spin
 */

cc.Class({
    extends: cc.Component,

    properties: {
        light_1:cc.SpriteFrame,
        light_2:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.EVENT_FB_SHARE_REWARD, this.EVENT_FB_SHARE_REWARD, this);
        this.turnNode = cc.find("lun_bg/lun_fg",this.node)
        let btn = cc.find("btn_close",this.node)
        btn.on("click",this.onClickClose,this)
        let nextspin = cc.find("btn_spin",this.node)
        if(nextspin){
            nextspin.on("click",this.onClickNextSpin,this)
        }
        

        
    },

    start () {
        // this.showRute()
    },

    //设置轮盘数据
    setData:function(nType,data){
        this._nType = nType
        this._spinData = data

        this._setLunpanReward(data)
        this.sendClickReward()
        this.showLightAni()

    },

    sendClickReward:function(){
        cc.vv.NetManager.send({ c: MsgId.EVENT_FB_SHARE_REWARD ,cat:this._nType});
    },

    // 进行转盘结果返回
    EVENT_FB_SHARE_REWARD(msg) {
        if (msg.code != 200) return;
        this.refer_times = msg.times

        // 确定转盘最后会停在的角度
        let offsetAngle = (msg.idx - 1) * 60;
        this.turnNode.rotation = this.turnNode.rotation % 360;
        cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'wheel_spin', true);
        cc.tween(this.turnNode)
            .to(5, { angle: (360 * 8) + offsetAngle }, { easing: 'quadInOut' })
            .call(() => {
                cc.vv.AudioManager.playEff("BalootClient/BaseRes/", 'wheel_result', true);
                this.showWinAni(true)
                // 奖励
                Global.RewardFly(msg.rewards, cc.find(cc.js.formatStr("item%s/icon",msg.idx),this.turnNode).convertToWorldSpaceAR(cc.v2(0, 0)));
            })
            .delay(0.8)
            .call(() => {
                this.showWinAni(false)
                this.showClose(true)
                this.showNextSpin(true)
            }).start();
            if(this._nType == 2){
                Global.dispatchEvent("EVENT_REFUSH_REFFERTIME",this.refer_times)
            }
            else{
                Global.dispatchEvent("EVENT_REFUSH_FREETIME")
            }
            
    },

    showClose:function(bShow){
        let btn = cc.find("btn_close",this.node)
        btn.active = bShow
    },

    showNextSpin:function(bShow){
        let nextspin = cc.find("btn_spin",this.node)
        if(nextspin){
            if(bShow){
                if(this.refer_times){
                    let showBtnStr = cc.js.formatStr("SPIN(%s)",this.refer_times)
        
                    Global.setLabelString("Background/Label",nextspin,showBtnStr)
                }
                else{
                    bShow = false
                }
            }
            
            nextspin.active = bShow
        }
    },

    showWinAni:function(bShow){
        let win = cc.find("win",this.turnNode)
        if(win){
            win.active = bShow
            win.stopAllActions()
            Global.blinkAction(win,0.1,0.1,4)
        }
    },

        


    _setLunpanReward:function(cfg){
        let lunObj = this.node
        
        for(let i = 0; i < 6; i++){
            let reward = cfg[i][0]
            let item = cc.find("lun_bg/lun_fg/item"+(i+1),lunObj)
            Global.setLabelString("val",item,reward.count)
        }
    },

    onClickClose:function(){
        cc.vv.PopupManager.removePopup(this.node)
    },

    onClickNextSpin:function(){
        this.showNextSpin(false)
        this.sendClickReward()
        
    },

    showLightAni:function(){
        for(let i= 0;i <12; i++){
            let obj = cc.find("lt"+(i+1),this.turnNode)
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
                    .delay(0.1)
                )
                .start()
            }
        }
    }



    // update (dt) {},
});
