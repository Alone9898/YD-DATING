/**
 *  底部操作区域
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.vv.gameData.setBottomScript(this)
        this.showMyInfo()

        Global.btnClickEvent(cc.find("btn_shop",this.node),this.onClickShop,this)

        //rebet
        let btn_rebet = cc.find("node_rebet/btn_rebet",this.node)
        if(btn_rebet){
            Global.btnClickEvent(btn_rebet,this.onClickRebet,this)
        }

        //rebetx2
        let btn_rebet2 = cc.find("node_rebet/btn_rebet2",this.node)
        if(btn_rebet){
            Global.btnClickEvent(btn_rebet2,this.onClickRebet2,this)
        }
        
    },

    start () {

    },

    showMyInfo:function(){
        let myInfo = cc.vv.gameData.getMyInfo()
        let node = cc.find("my",this.node)
        let itemData = {coin:myInfo.coin,playername:cc.vv.UserManager.nickName,uid:cc.vv.UserManager.uid}
        itemData.usericon =  cc.vv.UserManager.userIcon
        itemData.avatarFrame = cc.vv.UserManager.avatarframe
        node.getComponent("Table_Player_Base").init(itemData)
    },

    showCoin:function(){
        let node = cc.find("my",this.node)
        let val = cc.vv.gameData.getMyCoin()
        node.getComponent("Table_Player_Base").showCoin(val)
    },

    //检查是否显示rebet
    checkShowRebet:function(){
        let lastbets = cc.vv.gameData.getLastbet()
        let bFirstbet = cc.vv.gameData.getIsFirstBet()
        let nStatus = cc.vv.gameData.getGameStatus()

        

        this._showRebetNode((lastbets?true:false) && bFirstbet && (nStatus==2))
    },

    

    _showRebetNode:function(bShow){
        let btn_rebet = cc.find("node_rebet",this.node)
        if(btn_rebet){
            btn_rebet.active = bShow
        }
        
    },

    //返回我自己信息节点
    getMyNode:function(){
        return cc.find("my",this.node)
    },

    //返回我自己信息节点
    getMyNodeHead:function(){
        return cc.find("my/head_icon",this.node)
    },

    onClickShop:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        StatisticsMgr.reqReport(ReportConfig.SG_BTN_SHOP);
        if(Global.isIOSAndroidReview()){
            cc.vv.PopupManager.addPopup("YD_Pro/Review/yd_more_coins");
        } else {
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                }
            })
        }

    },

    //点击rebet
    onClickRebet:function(){
        this._doRebet(1) 
    },

    onClickRebet2:function(){
        this._doRebet(2)
    },

    _doRebet:function(nMul){
        Global.TableSoundMgr.playCommonEff("com_click")
        this._showRebetNode(false)
        let lastbets = Global.copy(cc.vv.gameData.getLastbet()) 
        let bFirstbet = cc.vv.gameData.getIsFirstBet()
        if(lastbets && bFirstbet){
            cc.vv.gameData.setIsFirstBet(false)
            cc.vv.gameData.clearLastBet()
            let lastTotal = this.getLastTotal(lastbets) * nMul
            let bEncough = cc.vv.gameData.isCoinEncough(lastTotal)
            if(bEncough){
                let betAreas = cc.vv.gameData.getScriptGame()._getBetAreaScript()
                if(betAreas){
                    let nChipCont = 0
                    for(let i = 0; i < lastbets.length; i++){
                        let itemBet = lastbets[i] //每一次投注记录
                        for(let j = 0; j < itemBet.length; j++){
                            let toAreaIdx = j+1
                            let area_bets = itemBet[j] //一个方位的筹码列表
                            for(let n = 0; n < area_bets.length; n++){
                                let chipcnt = area_bets[n]*nMul //档位n上下注的筹码数量
                                if(chipcnt>0){
                                    let betVal = cc.vv.gameData.getChipValByIdx(n)//档位n对应的筹码值
                                    for(let k = 0; k < chipcnt; k++){
                                        nChipCont +=1
                                        betAreas._actionBet(betVal,toAreaIdx,nChipCont>25)
                                    }
                                }
                                
                            }   
                            
                        }
                        
                    }
                }
            }
            else{
                //不够rebet
                //金币不足
                cc.vv.gameData.showChargeTips()
            }
        }
    },

    getLastTotal:function(lastbets){
        let nTotal = 0
        let betAreas = cc.vv.gameData.getScriptGame()._getBetAreaScript()
        if(betAreas){
            for(let i = 0; i < lastbets.length; i++){
                let itemBet = lastbets[i] //每一次投注记录
                for(let j = 0; j < itemBet.length; j++){
                    let toAreaIdx = j+1
                    let area_bets = itemBet[j] //一个方位的筹码列表
                    for(let n = 0; n < area_bets.length; n++){
                        let chipcnt = area_bets[n] //档位n上下注的筹码数量
                        if(chipcnt>0){
                            let betVal = cc.vv.gameData.getChipValByIdx(n)//档位n对应的筹码值
                            for(let k = 0; k < chipcnt; k++){
                                // betAreas._actionBet(betVal,toAreaIdx)
                                nTotal += betVal
                            }
                        }
                        
                    }   
                    
                }
                
            }
        }
        return nTotal
    }

    // update (dt) {},
});
