/**
 * Andar Bahar
 */
let STATUS_TIME = {
    FREE:5,
    BET:15,
    RESULT:10
}
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        _joker: null,
        _cardpool: null,
        _lblJoker: null,
        _lblAndar: null,
        _lblBahar: null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._joker = cc.find("card_joker", this.node)
        this._lblJoker = cc.find("top_layer/layer/node_trend/stat/lbl_joker", this.node)
        this._lblAndar = cc.find("top_layer/layer/node_trend/stat/lbl_andar", this.node)
        this._lblBahar = cc.find("top_layer/layer/node_trend/stat/lbl_bahar", this.node)
        cc.vv.NetManager.registerMsg(MsgId.PULL_BETTING_STATUE,this.onRcvBettingStatu,this)  //进入押注阶段
        this._cardpool = new cc.NodePool()
    },

    onDestroy() {
        this._cardpool.clear()
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_BETTING_STATUE,this.onRcvBettingStatu,false,this) //进入押注阶段
    },

    StartGame() {
        this._super()

        if (cc.vv.gameData.getGameStatus() > 1) {
            let roundInfo = cc.vv.gameData.getRoundInfo()
            this.setJoker(roundInfo.joker, false)
        }
    },

    getCardStr(cardVal) {
        let val = cardVal & 0x0f
        if (val<=10) {
            return val+""
        } else if (val==11) {
            return "J"
        } else if (val==12) {
            return "Q"
        } else if (val==13) {
            return "K"
        } else if (val==14) {
            return "A"
        }
        return "Joker"
    },

    setJoker(cardVal, ani=true) {
        if (cardVal > 0) {
            this._joker.active = true
            if (ani) {
                this._showCard(this._joker, cardVal)
            } else {
                this._joker.getComponent("Poker").show16Poker(cardVal)
            }
            this._lblJoker.getComponent(cc.Label).string = this.getCardStr(cardVal)
        } else {
            this._joker.active = false
            this._lblJoker.getComponent(cc.Label).string = ""
        }
        let andar = 0
        let bahar = 0
        let records = cc.vv.gameData.getGameRecords()
        for (let i=0; i<records.length; i++) {
            let item = records[i]
            if (item.card&0x0f == cardVal&0x0f) {
                if (item.res == 1) {
                    andar += 1
                } else {
                    bahar += 1
                }
            }
        }
        let andarPercent = 50
        if (andar + bahar > 0) {
            andarPercent = Math.round(Math.round(100.0*andar/(andar+bahar)))
        }
        this._lblAndar.getComponent(cc.Label).string = andarPercent+"%"
        this._lblBahar.getComponent(cc.Label).string = (100-andarPercent)+"%"
    },

    showIdleStatu:function(){
        let self = this
        this._super()
        let nRemind = cc.vv.gameData.getStatusTime()

        this._clearAreaWin()
        //隐藏joker
        this.setJoker(0)
    },

    

    async showResultStatu(){
        this._super()
        
        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //保存记录:看这个是否可以公用
            let result = resultMsg.result
            let records = cc.vv.gameData.getGameRecords()
            records.push({card:result.joker, res:result.res})
            if (records.length > 100) {  //最大100个
                for (let i=0; i<5; i++) {
                    records.shift()
                }
            }
            //有结果，播放结果
            this._showWaitResult(false)
            //轮流翻牌
            let startX = -420
            let spaceX = 40
            if (result.andercards.length > 21) {
                spaceX = 36
            }
            let resultNode = cc.find("top_layer/layer/node_result", this.node)
            let andarNode = cc.find("andar", resultNode)
            let baharNode = cc.find("bahar", resultNode)
            let cardTemp = cc.find("card_temp", resultNode)
            let size = result.andercards.length + result.baharcards.length
            for (let i=0; i<size; i++) {
                let cardNode = this._cardpool.get()
                if (!cardNode) {
                    cardNode = cc.instantiate(cardTemp)
                }
                cardNode.active = true
                let idx = 0
                let cardVal = 0
                if (i%2==0) {
                    idx = i/2
                    cardVal = result.andercards[idx]
                    andarNode.addChild(cardNode)
                } else {
                    idx = (i-1)/2
                    cardVal = result.baharcards[idx]
                    baharNode.addChild(cardNode)
                }
                cardNode.position = cc.v2(startX + idx * spaceX, -4)
                await this._showCard(cardNode, cardVal)
                await cc.vv.gameData.awaitTime(0.4)
            }
            Global.TableSoundMgr.playEffect("result")
            let winFlag = null
            if (result.res == 1) { //andar
                winFlag = cc.find("andar_sel",resultNode)
            } else {
                winFlag = cc.find("bahar_sel",resultNode)
            }
            winFlag.active = true
            Global.blinkAction(winFlag,0.2,0.2,3)
            //方位赢表现
            await this._showAreanWin(resultMsg.result.winplace)
            //各自飞金币
            await this._flyWinCoin()
            //隐藏押注额

        }
        else{
            //没结果，显示等待
            this._showWaitResult(true)
        }
        
    },

    onRcvBettingStatu(msg) {
        if(msg.code == 200){
            this.setJoker(msg.joker, true)
        }
    },

    //显示牌结果
    _showCard:function(cardNode, cardVal){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            let poker = cardNode.getComponent("Poker")
            poker.showPokerBg()
            poker.doTurnAction(cardVal,endCall,0.1,0.3)
            Global.TableSoundMgr.playEffect("flipcard")
        })
    },

    
    //方位赢动画
    _showAreanWin:function(winplace){
        return new Promise((res, rej) => {
            let endCall = function(){
                res()
            }
            let area_scp = this._getBetAreaScript()
            for (let i=0; i<winplace.length; i++) {
                let area_node = area_scp.getBetAreaNode(winplace[i])
                if(area_node){
                    let winFlag = cc.find("sel",area_node)
                    winFlag.active = true
                    if (i==0) {
                        Global.blinkAction(winFlag,0.2,0.2,3,endCall)
                    } else {
                        Global.blinkAction(winFlag,0.2,0.2,3)
                    }
                }
            }
        })
    },

    //清理赢的表现
    _clearAreaWin:function(){
        let area_scp = this._getBetAreaScript()
        for(let i= 0; i < area_scp.AreaList.length; i++){
            let item= area_scp.AreaList[i]
            let winFlag = cc.find("sel",item.node)
            winFlag.active = false
        }
        let resultNode = cc.find("top_layer/layer/node_result", this.node)

        cc.find("andar_sel", resultNode).active = false
        cc.find("bahar_sel", resultNode).active = false

        let andarNode = cc.find("andar", resultNode)
        let baharNode = cc.find("bahar", resultNode)
        for (let i= andarNode.children.length-1; i>=0; i--) {
            this._cardpool.put(andarNode.children[i])
        }
        for (let i= baharNode.children.length-1; i>=0; i--) {
            this._cardpool.put(baharNode.children[i])
        }
    },

    //飞赢的金币
    _flyWinCoin:function(){
        return new Promise((res, rej) => {
            let resultMsg = cc.vv.gameData.getResultMsg()
            let winIdxs = resultMsg.result.winplace
            let area_scp = this._getBetAreaScript()
            let win_arens = []
            for (let i=0; i<winIdxs.length; i++) {
                win_arens.push(area_scp.getBetAreaNode(winIdxs[i]))
            }

            //输的方位金币飞到赢的方位消失
            let losechips = []
            for(let i = 0; i < area_scp.AreaList.length; i++){
                let item = area_scp.AreaList[i]
                if(winIdxs.indexOf(item.idx) < 0){
                    let itemchips = area_scp.getAreaChips(item.idx)
                    for(let j = 0; j < itemchips.length; j++){
                        losechips.push(itemchips[j])
                    }
                }
            }

            for(let i = 0; i < losechips.length; i++){
                let win_aren = win_arens[Global.random(0, win_arens.length-1)]
                let chipCon = cc.find("chip_container",win_aren)
                let item = losechips[i]
                let xPos = Global.random(-chipCon.width/2,chipCon.width/2)
                let yPos = Global.random(-chipCon.height/2,chipCon.height/2)

                let toOffSet = cc.v2(xPos,yPos)
                area_scp.moveChip(item.chipNode,item.chipNode,win_aren,null,false,toOffSet)

            }
            
            losechips = null
            this.scheduleOnce(()=>{
                this._flyTableChips(resultMsg)
                
                this.doShowResultFinish()
                this.updateGameRecord()
                res()
                //最后清理所有的
                //area_scp.clearTableBet()
            },1)
            
        })
        
    },

    //更新游戏记录
    updateGameRecord:function(){
        let record_node = cc.find("top_layer/layer/node_trend",this.node)
        record_node.getComponent("AndarBahar_Trend").showRecord(true)
    },    
 
    // update (dt) {},
});
