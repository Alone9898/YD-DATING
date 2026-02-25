/**
 * 网络缓存模块
 */
cc.Class({
    extends: require("NetCacheMgr"),

    properties: {
       
    },

    /**
     * overwrite
     */
    _initPopListMsg:function(){
        this._popList = []

        //支付下单
        this._popList.push(MsgId.PURCHASE_GET_ORDER)
        if(!Global.isYDApp()){
            //shop-兑换金币
            this._popList.push(MsgId.DIAMOND_TO_COIN)
        }
        //shop-购买皮肤
        this._popList.push(MsgId.REQ_BUY_SKIN_SHOP_ITEM)
        //leauge-创建房间
        this._popList.push(MsgId.FRIEND_ROOM_CREATE)
        //leauge-quickstart
        this._popList.push(MsgId.VIP_FAST_JOIN)
        //更新个人信息
        this._popList.push(MsgId.UPDATE_USER_INFO)
        //gamelist
        this._popList.push(MsgId.GAME_ENTER_MATCH)
        //vip登陆奖励领取
        this._popList.push(MsgId.EVENT_VIP_SIGN_REWARD)
        //登陆奖励领取
        this._popList.push(MsgId.EVENT_SIGN_REWARD)
        //领取在线奖励
        this._popList.push(MsgId.EVENT_ONLINE_WHEEL_RESULT)
        //领取任务奖励
        this._popList.push(MsgId.EVENT_TASK_REWARD)
        //主线任务-全部领取
        this._popList.push(MsgId.EVENT_TASK_MAIN_REWARD)
        //social-sendmsg
        this._popList.push(MsgId.CHAT_SEND_MSG)
        //social-join
        this._popList.push(MsgId.FRIEND_ROOM_JOIN)
        //送礼物
        this._popList.push(MsgId.USER_GIFT_SEND)
    },


    /**
     * overwrite：是否在游戏中
     */
    isPlayingGame:function(){
        return cc.vv.gameData?true:false
    },

    
});
