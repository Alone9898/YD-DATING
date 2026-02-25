/**
 * 玩家
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _player:null,
        _seatIdx:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.registerEvent("PBEvent.USER_COIN_CHANGE",this.onEventCoinChange,this)
    },

    start () {

    },

    //初始化玩家信息
    init:function(p,seatIdx,bCanClick){
        this._player = p
        this._seatIdx = seatIdx
        
        this.hideFlyScore()
        // cc.find("head_icon/timer_tip",this.node).active = false
        //头像
        let avter_node = cc.find("head_icon",this.node)
        if(avter_node){
            if(p.usericon){
                // avter_node.active = true
                avter_node.getComponent("UserAvatar").updataAvatar({ uid: p.uid, icon: p.usericon, avatarFrame: p.avatarFrame });
                if(this.isRater() || this.isRicher()){
                    avter_node.getComponent("UserAvatar").updateFrame("")
                }
            }
            else{
                // avter_node.active = false
            }
        }
        
       
        //姓名
        Global.setLabelString("lbl_name",this.node,p.playername)
        //金币
        this.showCoin(p.coin)
        

        let node_rate = cc.find("rate_max",this.node)
        if(node_rate){
            node_rate.active = this.isRater()
        }
        
        let node_richer = cc.find("coin_max",this.node)
        if(node_richer){
            node_richer.active = this.isRicher()
        }
        

        if(bCanClick){
            this.addEvent()
        }

    },

    //更新金币
    showCoin:function(val){
        //金币
        let node_coin = cc.find("node_coin",this.node)
        if(node_coin){
            Global.setLabelString("val",node_coin,Global.FormatNumToComma(val.toFixed(2)))
        }
    },

    //获取玩家uid
    getPlayerUid:function(){
        if(this._player){
            return this._player.uid
        }
        else{
            cc.log("玩家尚未初始化")
        }
        
    },

    //飘分
    playFlyScroe:function(val){
        if(val != 0){
            let fly_score = cc.find("fly_score",this.node)
            fly_score.active = true
            fly_score.getComponent("Table_FlyScore").setScore(val)
        }

        if(val > 0){
            this.playWinHit()
        }
        
    },

    hideFlyScore:function(){
        let fly_score = cc.find("fly_score",this.node)
        fly_score.active = false
        let node = cc.find("win_hit",this.node)
        let spcmp = node.getComponent(sp.Skeleton)
        spcmp.setCompleteListener(null)
        node.active = false
    },

    playWinHit:function(){
        let node = cc.find("win_hit",this.node)
        node.active = true
        let spcmp = node.getComponent(sp.Skeleton)
        spcmp.setAnimation(0,"animation",false)
        spcmp.setCompleteListener((tck) => {
            node.active = false
        })
    },

    //是否是大土豪
    isRicher:function(){
         return this._seatIdx == 1
    },

    //是否是神算子
    isRater:function(){
        return this._seatIdx == 2
    },

    getPlayerInfo:function(){
        return this._player
    },


    /**
     * 监听事件
     */
     addEvent() {
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.closeEmotion){ //是否需要关闭发互动道具
            return
        }
        cc.find("head_icon", this.node).off(cc.Node.EventType.TOUCH_END)
        cc.find("head_icon", this.node).on(cc.Node.EventType.TOUCH_END, () => {
            if (cc.vv.UserManager.isMySelf(this._player.uid)) {
                return;
            }
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            let parentObj = cc.find("Canvas")
            let emotion_scp = parentObj.getComponentInChildren("PBInteractiveCtrl")
            if(emotion_scp){
                emotion_scp.openEmotionPanel(this._player.uid);
            }
            else{
                //加载
                let url = "Table_Common/TableRes/prefab/interactive_emotion"
                cc.loader.loadRes(url,cc.Prefab, (err, prefab) => {
                    if (!err) {
                        
                        let old = parentObj.getChildByName('interactive_emotion')
                        if(!old){
                            let node = cc.instantiate(prefab);
                            node.parent = parentObj;
                            node.getComponent("PBInteractiveCtrl").openEmotionPanel(this._player.uid)
                            
                        }
                    }
                })
            }
            
        }, this);
    },

    onEventCoinChange:function(data){
        let val = data.detail
        if(val){
            if(val.uid == this._player.uid){
                if(val.coin != undefined){
                    this.showCoin(val.coin)
                }
                
            }
        }
        
    },

    

    // update (dt) {},
});
