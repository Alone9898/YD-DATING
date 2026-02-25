cc.Class({
    extends: cc.Component,

    properties: {
        _hided: false,
        _winCoin: 0,
        _bigwinScript: null
    },

    onLoad () {
        Global.onClick("layout/btn_share", this.node, this.onClickShare, this)
        Global.onClick("layout/btn_bind", this.node, this.onClickBind, this)
        Global.onClick("layout/btn_notify", this.node, this.onClickNotify, this)
        Global.registerEvent(EventId.FB_BIND_SUCCESS, this.OnEventFbBindSuccess, this);
    },

    onDestroy() {
        cc.vv.NetManager.unregisterMsg(MsgId.DOUBLE_WIN_COINS, this.onRcvDoubleWinCoins, false, this)
    },

    show(winCoin, bigwinScript) {
        this._winCoin = winCoin
        this._bigwinScript = bigwinScript
        //玩家未达到5级
        if (cc.vv.UserManager.level < 5) {
            return false
        }
        //玩家关闭
        let notify = Global.getLocal('doublecoins_notify')
        if (notify == "0") {
            return false
        }
        //已显示过
        if (cc.vv.Data.doublecoins_show) {
            return false
        }
        //苹果审核
        if (Global.isIOSReview()) {
            return false
        }
        //不在游戏内
        if (!cc.vv.gameData) {
            return false
        }
        //华为渠道不显示
        if(Global.appId == Global.APPID.SouthAmerica || Global.appId == Global.APPID.HuaweiDRM){
            return false
        }
        cc.vv.Data.doublecoins_show = true

        cc.vv.NetManager.registerMsg(MsgId.DOUBLE_WIN_COINS, this.onRcvDoubleWinCoins, this)
        cc.vv.NetManager.send({c: MsgId.DOUBLE_WIN_COINS, rtype: 1, winCoin:this._winCoin})

        return true
    },

    hide() {
        this._hided = true
        this.node.runAction(cc.fadeOut(0.2))
    },

    //发送获取奖励的消息
    sendGetCoin() {
        cc.vv.NetManager.send({c: MsgId.DOUBLE_WIN_COINS,
            rtype: 2,
            winCoin:this._winCoin,
            gameid: cc.vv.gameData.getGameId(),
        })
    },

    onClickShare(event){
        event.node.getComponent(cc.Button).interactable = false
        if (this._hided) return
        if (!Global.isNative()) {
            //this._bigwinScript.setAutoClose(false)
            //this.scheduleOnce(()=>{
            //    this.sendGetCoin()
            //}, 1)
            //return
        }

        this._bigwinScript.setAutoClose(false)

        let imgUrl = 'https://global.rummyslot.com/fb/index4.html'
        let content = "Hey! Hey! Hey!\nI've got a Jackpot in Cash Hero-Casino Slots!\nWhat are you waiting for?"
        cc.vv.FBMgr.fbShareWeb(imgUrl, null,content, (data)=>{
            if (data.result == "1") {
                this.sendGetCoin()
            }
        });
    },

    onClickBind(event){
        event.node.getComponent(cc.Button).interactable = false
        if (this._hided) return
        if (!Global.isNative()) return

        this._bigwinScript.setAutoClose(false)
        cc.vv.PlatformApiMgr.fbLogin((cbData)=>{
            let result = parseInt(cbData.result)
            if (result == 1) {
                let req = {c:MsgId.REQ_BIND_FACEBOOK}
                req.accesstoken = cbData.token
                req.user = cbData.uid
                req.type = Global.LoginType.FB
                req.bigwin = 1
                cc.vv.NetManager.send(req)
            } else {
                cc.vv.FloatTip.show("FB Account Bind Failed!");
            }
        });
    },

    showCoinAnimation(y) {
        let coinBg = cc.find("coin_bg", this.node)
        coinBg.stopAllActions()
        coinBg.y = y
        coinBg.runAction(cc.repeatForever(cc.sequence(cc.moveTo(1, 0, y+20), cc.moveTo(1, 0, y))))
    },

    onRcvDoubleWinCoins(msg) {
        if (msg.code == 200) {
            if (msg.rtype == 2) {
                cc.find("layout", this.node).active = false
                if (msg.spcode == 0) {
                    cc.vv.gameData.AddCoin(msg.winCoin, true)
                    this._bigwinScript.showDoubleCoin()
                    this.showCoinAnimation(314)
                }
            } else if (msg.rtype == 1 && msg.spcode == 0) {
                this.node.active = true
                this._hided = false
                cc.find("layout/btn_notify/check", this.node).active = true
                let binded = cc.vv.UserManager.isBindFb()
                binded = true  //由于绑定会涉及重新登录返回大厅，因此暂时只显示分享
                cc.find("layout/btn_share", this.node).active = binded
                cc.find("layout/btn_bind", this.node).active = !binded
                this.showCoinAnimation(64)
                this.node.opacity = 0
                this.node.runAction(cc.sequence(cc.delayTime(2), cc.fadeIn(0.25)))
            }
        } else {
            this._bigwinScript.setAutoClose(true)
        }
    },

    OnEventFbBindSuccess(data){
        this.sendGetCoin()
    },

    onClickNotify(){
        if (this._hided) return
        Global.playComEff("ch_btn_click")
        let check = cc.find("layout/btn_notify/check", this.node)
        check.active = !check.active
        if (check.active) {
            Global.saveLocal('doublecoins_notify', "1")
        } else {
            Global.saveLocal('doublecoins_notify', "0")
        }
    },

});
