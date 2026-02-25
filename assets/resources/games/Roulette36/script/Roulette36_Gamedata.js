/**
 * 俄罗斯轮盘36数据结构
 */

cc.Class({
    extends: require("Table_GameData_Base"),

    properties: {
        
    },

    init:function(deskInfo,gameId){
        // if (this._deskInfo) {
        //     return;
        // }
        if(!this._deskInfo){
            this.RegisterMsg()
        }
        //兼容arabohero写法
        this.deskInfo = deskInfo
        
        this._deskInfo = deskInfo
        this._deskInfo = this._localFormatRound(this._deskInfo)
        this._gameId = gameId

        //断线重连
        let bReconnect = (deskInfo.deskFlag == 1 || deskInfo.isReconnect)
        if(bReconnect){
            this.setResultMsg(null)
            this.setShowResultFinish(true)
            
            let web_yd = cc.director.getScene().getChildByName("yd_charge")
            if(web_yd){
                
                cc.game.addPersistRootNode(web_yd)
                // web_yd.removeFromParent(false)
            }
            if(cc.vv.BroadcastManager){
                cc.vv.BroadcastManager.stop()
            }
            let cfgData = cc.vv.GameDataCfg.getGameData(this.getGameId())
            cc.director.loadScene(cfgData.gameScene,(err,target)=>{
                if(web_yd){
                    web_yd.parent = target
                   
                }

                if(cc.vv.BroadcastManager){
                    cc.vv.BroadcastManager.run()
                }
                
            })
            
            // if(this._script_game){
            //     this._script_game.StartGame()
            // }
        }
        
        // this.RegisterMsg()

    },

    //格式化押注详情
    _localFormatRound:function(info){
        let bets = []
        let chips = []
        let myBets = []
        let list_chip = info.chips
        for(let i = 0; i < 156; i++){
            bets.push(0)
            myBets.push(0)
            let chipsItem = []
            for(let j = 0; j < list_chip.length; j++){
                chipsItem.push(0)
            }
            chips.push(chipsItem)
        }
        //
        for(let i = 0 ; i < info.round.bets.length; i++){
            let item = info.round.bets[i]
            let idx = item.i - 1
            bets[idx] = item.c //总额

            //
            let detail = this.formatVal2Chiplist(item.c)
            chips[idx] = detail
        }

        for(let i = 0; i < info.user.round.bets.length; i++){
            let item = info.user.round.bets[i]
            let idx = item.i - 1
            myBets[idx] = item.c
        }

        info.round.bets = bets
        info.round.chips = chips
        info.user.round.bets = myBets

        return info
        
    },

    //显示球对应的颜色:1黑 2红
    _getBallColor:function(ball){
        let colorType = 1 //黑
        let cfg = this.getGameCfg()
        let colorItem = cfg.Places[150] //红
        for(let i = 0; i < colorItem.length; i++){
            if(ball == colorItem[i]){
                colorType = 2
                break
            }
        }
        return colorType
    },

    //详细结果的轮盘角度
    getPanAngle:function(val){
        let angle = 0
        let cfg = this.getGameCfg()
        for(let i = 0; i < cfg.lunpanRotation.length; i++){
            let item = cfg.lunpanRotation[i]
            if(val == item){
                angle = 14+i*9.73
                break
            }
        }
        return angle
    },

    //获取区域配置
    getArenCfg:function(idx){
        let cfg = this.getGameCfg()
        return cfg.Places[idx-1]
    },

    //发送押注请求
    sendBetReq:function(val){
        let listval = []
        let countVal = this.countChipsTotalVal(val)
        for(let i = 0; i < countVal.length; i++){
            
            if(countVal[i] > 0){
                let item = {}
                item.i = i+1
                item.c = countVal[i]
                listval.push(item)
            }
        }

        //记录投注记录
        if(!this._lastbets) this._lastbets = []
        if(this._lastbets) this._lastbets.push(Global.copy(val))

        let req  ={c:MsgId.TABLE_BET_REQ}
        req.ibets = listval
        cc.vv.NetManager.send(req)
    },

    onRcvMyDoBet:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                cc.vv.FloatTip.show("spcode:"+msg.spcode)
                
                
                return
            }

            if(msg.bets){
                for(let i = 0 ; i < msg.bets.length; i++){
                    let item = msg.bets[i]
                    let idx = item.i - 1
                    this._deskInfo.round.bets[idx] = item.c //总额
        
                    //
                    let detail = this.formatVal2Chiplist(item.c)
                    this._deskInfo.round.chips[idx] = detail
                }
            }
            
            

        }
    },

    //将简单押注信息，格式化成筹码详情
    _formatChipDetail:function(ibets){
        let chips = []
        for(let i = 0; i < 156; i++){
            
            let chipsItem = []
            for(let j = 0; j < this.getBetChipList().length; j++){
                chipsItem.push(0)
            }
            chips.push(chipsItem)
        }
        for(let i = 0 ; i < ibets.length; i++){
            let item = ibets[i]
            let idx = item.i - 1

            //
            let detail = this.formatVal2Chiplist(item.c)
            chips[idx] = detail
        }
        return chips
    },

    //其它玩家下注推送
    onRcvOtherDoBet:function(msg){
        if(msg.code == 200){
            
            //uid为0表示是玩家列表中来的，有uid的，是桌上玩家的
            msg.chips = this._formatChipDetail(msg.ibets)

            if(cc.isValid(this._script_game)){
                this._script_game.playOtherBet(msg)
            }
            else{
                //直接更新总的

            }
            
        }
    },







    resetAreaRoundBet:function(){
        let chips_detail = this._deskInfo.round.chips
        let total_detail = this._deskInfo.round.bets
        for(let i = 0; i < total_detail.length; i++){
            total_detail[i] = 0
        }
        if(chips_detail){
            for(let i= 0; i < chips_detail.length; i++){
                let area_detail = chips_detail[i]
                for(let j = 0; j < area_detail.length; j++){
                    area_detail[j] = 0
                }
            }
        }
        
    },

    getTotalBetCount:function(){
        let nTotal = 0
        let roundInfo = this.getAreaInfo()
        for(let i = 0; i < roundInfo.bets.length; i++){
            nTotal += roundInfo.bets[i]
        }
        return nTotal
    },

    
});
