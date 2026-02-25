/**
 * Rummy player
 */

 import{PBChatMsgType,PBChatMsgVo} from "../../PokerBase/scripts/chat/PBChatData"
 import{CommonStyle} from "../../../../BalootClient/game_common/CommonStyle"
cc.Class({
    extends: require("Table_Player_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.registerEvent("show_auto",this.onEventAutoChange,this)
        Global.registerEvent("PBEvent.USER_COIN_CHANGE",this.onEventCoinChange,this)
        Global.registerEvent("Refush_default_head",this.onEventRefushDefaultHead,this)
        
        this.addEvent();
    },

    start () {

    },

    init:function(p,seatIdx,bDelay){
        if(p){
            this._super(p,seatIdx)
        }
        // else{
        //     cc.log("11")
        // }
        
        
        

        let bShowDeal = false
        let bShowActive = false
        let roundinfo = cc.vv.gameData.getRoundInfo()
        if(roundinfo){
            bShowDeal = (roundinfo.dealseat == p.seatid )?true:false
            bShowActive = (roundinfo.activeSeat == p.seatid)?true:false
        }
        this.showZhuangIcon(bShowDeal)
        if(bDelay){
            bShowActive = false
        }
        if(bShowActive){
            this._doRetimer(roundinfo.delayTime,null,true)
        }
        else{
            this._showRetimer(bShowActive)
        }
        
        
        this._showMyAuto()

        //检查我是否已经观战中，如果是不显示其它玩家真实头像，姓名
        this._checkMyReadyShow()

        this.showReadyState()

        this.showWinner(false)

        this.showWather()
    },
    
    showZhuangIcon:function(bShow){
        let icon = cc.find("icon_d",this.node)
        icon.active = bShow
    },

    showDirLight:function(bShow){
        let node = cc.find("light",this.node)
        if(node){
            node.active = bShow
        }
        
    },

    //是否已经confirm了
    showConfirmedTips:function(bShow){
        let node_confirm = cc.find("rate_max",this.node)
        node_confirm.active = bShow
        if(bShow){
            this._showRetimer(false)
        }
    },

    _showRetimer(bShow,bWithLight=true){
        let node_time = cc.find("head_icon/timer_tip",this.node)
        node_time.active = bShow
        //并且停掉进度动画
        if(this._timerTween) this._timerTween.stop()
        if(this._effTween) this._effTween.stop()
        // let proObj = cc.find("progress",node_time).getComponent(cc.ProgressBar)
        // proObj.node.stopAllActions()
        if(bWithLight){
            this.showDirLight(bShow)
        }
        if(bShow){
            this._showMyAuto()
        }
        // if(this._player){
        //     cc.log(this._player.uid+"倒计时" + bShow)
        // }
        
        
    },

    _doRetimer(nTime,endCall,bWithLight=true){
        //=0表示是自动托管
        let bShow = nTime>0?true:false
        
        this._showRetimer(bShow,bWithLight)
        if(bShow){
            let node_time = cc.find("head_icon/timer_tip",this.node)
            let lbl = cc.find("label",node_time)
            let proObj = cc.find("progress",node_time).getComponent(cc.ProgressBar)
            proObj.progress = 1
            
            this._timerTween = cc.tween(proObj)
            .to(nTime,{progress:0})
            .call(()=>{
                lbl.active = false
                if(endCall){
                    endCall()
                }
                this._timerTween = null
            })
            .start()
            let node_eff = cc.find("effect",node_time)
            node_eff.active = true
            node_eff.angle = 0
            this._effTween = cc.tween(node_eff)
            .by(nTime,{angle:-360})
            .call(()=>{
                this._effTween = null
            })
            .start()
    
            lbl.active = true
            lbl.color = cc.color(15, 255, 0)
            let cp = lbl.getComponent("ReTimer")
            if(!cp){
                cp = lbl.addComponent("ReTimer")
            }
            let self = this
            let perCall = function(val){
                if(cc.vv.UserManager.isMySelf(self._player.uid)){
                    if(val <=3){
                        Global.TableSoundMgr.playEffect("recount")
                    }
                }
                let lbl_color = cc.color(254, 59, 59);
                if(val > 3){
                    lbl_color = cc.color(15, 255, 0);
                }
                lbl.color = lbl_color

                lbl.scale = 0.5
                cc.tween(lbl)
                .to(0.2, { scale: 1 }, { easing: "backOut" })
                .start();
            }
            cp.setReTimer(parseInt(nTime) ,1,null,"%s",perCall)
        }
        
    },

    onEventAutoChange:function(data){
        let val = data.detail
        this._showAutoHead(val)
    },

    _showAutoHead:function(val){
        let auto_head = cc.find("robot",this.node)
        if(auto_head){
            auto_head.active = val
            if(val){
                let spcm = auto_head.getComponent(sp.Skeleton)
                spcm.setAnimation(0,"idle",true)
            }
            
        }
        
    },

    showChat:function(msgVo){
        switch (msgVo.msgType) {
            case PBChatMsgType.text:
                this.showBubbleMsg(msgVo.content);
                break;
            case PBChatMsgType.emotion:
                this.showEmotion(msgVo.content);
                break;
            case PBChatMsgType.fast_word:
                let word = msgVo.getContentText();
                if (word) {
                    this.showBubbleMsg(word);
                }
                break;
            case PBChatMsgType.diy:
                // this.diyChatMsgHandler(msgVo);
                break;
        }
    },

    /**
     * 显示泡泡消息
     */
     async showBubbleMsg(content) {
        let bubbleNode = cc.find("bubble", this.node);
        if (bubbleNode) {
            bubbleNode = cc.instantiate(bubbleNode);
            bubbleNode.parent = this.node;
            bubbleNode.active = true;
            bubbleNode.opacity = 1;
            let bg = bubbleNode.getChildByName("bg");
            let chatSkin = this._player.chatskin;
            bg.getComponent("NetImg").url = chatSkin;
            if (chatSkin && chatSkin.startsWith("chat_vip")) {
                let vipIconNode = bg.getChildByName("vip_icon");
                vipIconNode.active = true;
                if (vipIconNode) {
                    let vipIconCmp = vipIconNode.getComponent("NetImg");
                    vipIconCmp.url = `text_${chatSkin}`;
                }
            }

            bubbleNode.getChildByName("arrow").color = cc.vv["UserConfig"].getChatBoxColor(chatSkin);
            let label = bubbleNode.getChildByName("label").getComponent(cc.Label);
            label.string = content;
            let color = cc.vv.UserConfig.getColor(this._player.frontskin);
            color && (label.node.color = color);

            let width1 = 230;
            let width2 = width1 * 1.6;
            let oneRowHeight = 60;
            label.node.width = width1;
            // 如果高度超过50 说明一行显示不下
            let isChangeWidth = false;
            await new Promise(res => {
                label.scheduleOnce(() => {
                    if (label.node.height > oneRowHeight) {
                        label.node.width = width2;
                        isChangeWidth = true;
                    }
                    res(true);
                })
            })
            await new Promise(res => {
                label.scheduleOnce(() => {
                    bg.width = label.node.width + 50 * 2;
                    bg.height = label.node.height + 80;
                    label.node.x = 0;
                    if (this.getNeedChangeChatBubbleUIIndex().includes(this.uiIndex)) {
                        label.node.y = -bg.height / 2 + 6;
                    } else {
                        label.node.y = bg.height / 2 + 6;
                    }
                    res(true);
                })
            })

            bubbleNode.scale = 0;
            cc.tween(this.node)
                .call(() => {
                    CommonStyle.fastShow(bubbleNode);
                })
                .delay(2)
                .call(() => {
                    CommonStyle.fastHide(bubbleNode, () => {
                        bubbleNode.removeFromParent(true);
                    })
                })
                .start();
        }
    },

    getNeedChangeChatBubbleUIIndex() {
        return [2];
    },

    /**
     * 显示表情
     */
    showEmotion(emotionName) {
        let emotion = cc.find("emotion", this.node).getComponent("PBEmotionPlayer");
        emotion.playAni(emotionName);
        emotion.node.active = true;
    },

    

    getGlobalPos(childName){
        let childNode = null;
        if (childName) {
            childNode = cc.find(childName, this.node);
        }
        let node = childNode || this.node;
        return node.convertToWorldSpaceAR(cc.v2(0, 0));
    },

    //刷新金币
    refushCoin:function(){
        let info = cc.vv.gameData.getPlayByUid(this._player.uid)
        if(info){
            this.showCoin(info.coin)
        }
    },

    onEventCoinChange:function(data){
        let val = data.detail
        if(val){
            if(val.uid == this._player.uid){
                this.refushCoin()
            }
        }
        
    },

    _showMyAuto:function(){
        if(this._player){
            let bMySelf = cc.vv.UserManager.isMySelf(this._player.uid)
            if(bMySelf){
                let myInfo = cc.vv.gameData.getMyInfo()
                this._showAutoHead(myInfo.auto)
                // if(myInfo.auto){
                    let scp = cc.vv.gameData.getScriptGame()
                    if(scp){
                        scp.onAutoChange(myInfo.auto)
                    }
                // }
            }
        }
        
    },

    _checkMyReadyShow:function(){
        let myState = cc.vv.gameData.getMyState()
        let bShow = (myState == 1)?true:false
        this._showDefaultHead(bShow)
    },

    //未坐下，其它人不现实真实头像和姓名和金币
    _showDefaultHead:function(bShow){
        if(this._player){
            if(!cc.vv.UserManager.isMySelf(this._player.uid)){
                let default_head = cc.find("default_icon",this.node)
                default_head.active = bShow
                let real_head = cc.find("head_icon",this.node)
                real_head.active = !bShow
                let showName = "unknow"
                let coinVal = "--"
                if(!bShow){
                    if(this._player){
                        showName = this._player.playername
                        coinVal = this._player.coin
                    }
                }
                Global.setLabelString("lbl_name",this.node,showName)
                Global.setLabelString("node_coin/val",this.node,coinVal)
                
            }
        }
        
        
    },

    onEventRefushDefaultHead:function(){
        this._checkMyReadyShow()
    },

    //显示准备状态
    showReadyState:function(){
        let ready_icon = cc.find("tips_ready_ok",this.node)
        let gameState = cc.vv.gameData.getGameStatus()
        //游戏处于准备阶段且玩家状态
        let bShow = (this._player.state == 2) && (gameState == 1)
        ready_icon.active = bShow


    },

    showWinner:function(bShow){
        let win_flag = cc.find("Winner",this.node)
        if(win_flag){
            win_flag.active = bShow
        }
    },

    showWather(){
        //游戏处于playing阶段
        let gameState = cc.vv.gameData.getGameStatus()
        let bShow = (this._player && this._player.state == 1) && (gameState == 3 ) && !(cc.vv.UserManager.isMySelf(this._player.uid))
        let watcher_head = cc.find("node_watcher_head",this.node)
        watcher_head.active = bShow
        let lbl_name_bg = cc.find("label_bg",this.node)
        if(lbl_name_bg){
            lbl_name_bg.active = !bShow
        }
        
        let lbl_name = cc.find("lbl_name",this.node)
        if(lbl_name){
            lbl_name.active = !bShow
        }
        
        let node_coin = cc.find("node_coin",this.node)
        if(node_coin){
            node_coin.active = !bShow
        }
        
    }




   


    // update (dt) {},
});
