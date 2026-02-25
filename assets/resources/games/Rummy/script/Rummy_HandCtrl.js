/**
 * 
 * 手牌控制
 */
let Rummy_Tools = require("Rummy_Tools")
cc.Class({
    extends: cc.Component,

    properties: {
        node_poker:cc.Node,
        node_cardType:cc.Node,
        _Hand_Num:13, 
        _all_duis:[],
        _card_pool:null,
        _type_pool:null,
        _allActiveCards:[],
        _allActiveType:[],
        _nextdui_pos_x:0,
        _nextdui_pos_y:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._card_pool = new cc.NodePool()
        this._type_pool = new cc.NodePool()
    },

    start () {

    },


    getAllActiveCards:function(){
        return this._allActiveCards
    },

    //显示手牌
    showHandCards:function(bAni){
        let total_pt = 0
        let row_max = 980
        let card_width = 160
        let card_scale = 1
        let cardW = 80
        let spaceW = 130
        
        let rowInfo = []

        let row_w = 0
        let startIdx=0
        let hands = cc.vv.gameData.getMyHand()
        for(let i = 0; i < hands.length; i++){
            let nNum = hands[i].length
            row_w += nNum*cardW
            row_w += spaceW
            //如果加下一堆超了就需要换一行了
            let nextW =0
            if(hands[i+1]){
                nextW = hands[i+1].length*cardW
            }
            if((row_w + nextW>row_max) && (i != (hands.length-1)) && rowInfo.length < 1){
                //第一行放满了
                let item = {}
                item.endIdx = i
                item.startIdx = startIdx
                item.width = row_w
                rowInfo.push(item)
                row_w = 0
                startIdx = i+1
                continue
            }

            if(i == hands.length-1){//所有堆都放完
                let item = {}
                item.endIdx = i
                item.startIdx = startIdx
                item.width = row_w
                rowInfo.push(item)
            }
            
            
            
        }

        let nCount = 0
        for(let i = 0; i< rowInfo.length; i++ ){
            let info = rowInfo[i]
            let yPos = i == 0?125:-125
            //一行需要居中显示,先算出左边空多少
            let left = (row_max-(info.width - spaceW))/2
            for(let j = info.startIdx; j<= info.endIdx; j++){
                let duicards = hands[j]
                let duiBeginPos
                let duiEndPos
                // let nodeCard_w
                let aniTime = 0.2
                this._allActiveCards[j]=[]
                for(let k = 0; k < duicards.length; k++){
                    let obj = cc.find("hand_card"+nCount,this.node)
                    if(!obj){
                        obj = this._createrPoker(duicards[k])
                    }
                    else{
                        obj.getComponent("Rummy_Poker").onPostionChange(yPos)
                    }
                    nCount +=1
                    
                   obj.getComponent("Rummy_Poker").setPokerDui(this,j)
                    obj.parent = this.node
                    this._allActiveCards[j].push(obj)
                    if(bAni){
                        cc.tween(obj)
                        .to(aniTime,{x:left + cardW,y:yPos},{easing:"quadOut"})
                        .start()
                    }
                    else{
                        obj.y = yPos
                        obj.x = left + cardW
                    }
                    if(k == 0) duiBeginPos = left + cardW
                    if(k == duicards.length-1) duiEndPos = left + cardW
                    left = left + cardW //left右移
                }

                let myState = cc.vv.gameData.getMyState()
                if(myState != 8){
                    //显示牌型
                    let node_type
                    if(this._type_pool.size()>0){
                        node_type = this._type_pool.get()
                    }
                    else{
                        node_type = cc.instantiate(this.node_cardType)
                    }
                    let item_pt = node_type.getComponent("Rummy_CardType").showCardType(duicards)
                    node_type.parent = this.node
                    total_pt += item_pt

                    node_type.width = duiEndPos - duiBeginPos + card_width*card_scale + 2
                    node_type.x = 6 + duiBeginPos + node_type.width/2 - cardW*card_scale

                    node_type.y = yPos- 107 + node_type.height/2
                    node_type.active = true
                    this._allActiveType.push(node_type)
                    if(bAni){
                        node_type.opacity = 0
                        cc.tween(node_type)
                        .delay(aniTime)
                        .call(()=>{
                            node_type.opacity = 255
                        })
                        .start()
                    }
                    else{
                        node_type.opacity = 255
                    }
                }
                
                //  node_type.zIndex = 100

                //一堆结束后需要判断是否添加堆间隔
                if(j != info.endIdx){
                    left = left + spaceW
                }
            }
            if(i == rowInfo.length-1){
                this._nextdui_pos_x = left
                this._nextdui_pos_y = yPos
                cc.log("x:"+this._nextdui_pos_x)
            }
            
        }

        this.showTotalPoint(total_pt)
        Global.dispatchEvent("poker_select_change")
        
    },
    
    showTotalPoint:function(val){
        let show = val
        if(val>80){
            show = 80
        }
        let lbl_score = cc.find("Canvas/safe_node/node_table/node_point/val")
        lbl_score.getComponent(cc.Label).string = show
    },

    //清理手牌
    clearHands:function(){
        this._recircleNode()
        if(this._sendTween1) {
            this._sendTween1.stop()
             this._sendTween1 = null
            }
        if(this._sendTween2){
            this._sendTween2.stop()
            this._sendTween2 = null
        } 
        this.node.removeAllChildren()
    },

    getNextDuiPos:function(){
        return {x:this._nextdui_pos_x,y:this._nextdui_pos_y}
    },

    //发牌
    showSendCard:function(cards,endCall){
        let self = this
        let allcard = []
        for(let i = 0; i < this._Hand_Num; i++){
            let item = this._createrPoker(null,true)
            item.name = "hand_card"+i
            item.parent = this.node
            item.y = 200
            item.x = 120 + i*70
            item.active = true
            cc.tween(item)
            .delay(0.08*i)
            .call(()=>{
                Global.TableSoundMgr.playEffect("sendcard")
            })
            .to(0.08,{y:0,x:120 + i*70})
            .start()
            allcard.push(item)
        }

        //发完牌就翻牌
        let tempCard = []
        for(let i = 0; i < cards.length; i++){
            for(let j = 0; j < cards[i].length; j++){
                tempCard.push(cards[i][j])
            }
        }
        this._sendTween1 = cc.tween(this.node)
        .delay(0.5)
        .call(()=>{
            this._sendTween1 = null
            for(let i = 0; i <allcard.length; i++){
                let item = allcard[i]
                let val = tempCard[i]
                let endCall = function(pokerItem){
                    //检查一下wild
                    let wildVal = cc.vv.gameData.getRoundWild()
                    pokerItem.getComponent("Rummy_Poker")._showWildIcon(wildVal)
                }
                item.getComponent("Poker").doTurnAction(val,endCall,0.2,0.3)
            }

            this._sendTween2 = cc.tween(this.node)
            .delay(0.5)
            .call(()=>{
                //发牌到丢弃堆
                this._sendTween2 = null
                let tartNode = cc.vv.gameData.getScriptGame()._getShowCardNode()
                let disNode = cc.vv.gameData.getScriptGame()._getDisCardNode()
                let uncheckNode = cc.vv.gameData.getScriptGame()._getUncheckNode()
                let card = this._createrPoker()
                card.parent = this.node
                card.position = this.node.convertToNodeSpaceAR(tartNode.convertToWorldSpaceAR(cc.v2(0,0)))
                let disPos = this.node.convertToNodeSpaceAR(disNode.convertToWorldSpaceAR(cc.v2(0,0)))
                let unPos = this.node.convertToNodeSpaceAR(uncheckNode.convertToWorldSpaceAR(cc.v2(0,0)))
                cc.tween(card)
                .to(0.2,{position:disPos})
                .call(()=>{
                    let dis_cards = cc.vv.gameData.getCurShowDiscard()
                    let turnEndCall = function(pokerItem){
                        //检查一下wild
                        let wildVal = cc.vv.gameData.getRoundWild()
                        pokerItem.getComponent("Rummy_Poker")._showWildIcon(wildVal)
                    }
                    card.getComponent("Poker").doTurnAction(dis_cards,turnEndCall,0.2,0.3)
                })
                .delay(0.2)
                .call(()=>{
                    //发牌到牌堆
                    let uncheck = this._createrPoker()
                    uncheck.parent = this.node
                    uncheck.position = this.node.convertToNodeSpaceAR(tartNode.convertToWorldSpaceAR(cc.v2(0,0)))
                    cc.tween(uncheck)
                    .to(0.2,{position:unPos})
                    .call(()=>{
                        cc.vv.gameData.getScriptGame().showWild()
                        if(endCall){
                            endCall()
                        }
                    })
                    .removeSelf()
                    .start()
                })
                .removeSelf()
                .start()

                // for(let i = 0; i < allcard.length; i++){
                //     this._card_pool.put(allcard[i])
                // }
                this.showHandCards(true)
                Global.TableSoundMgr.playEffect("Sort")
            })
            .start()
        })
        .start()

        // //按花色排序，并且分堆
        // let results = Rummy_Tools.sortCardColor(tempCard)


    },

    // //花色排序
    // sortCardColor:function(datas){
    //     for(let i = 0 ; i < datas.length; i++){
    //         let color_val = 
    //     }
    // },

    showCardType:function(){

    },


    _createrPoker:function(data,bWithPool){
        let node 
        if(bWithPool){
            if(this._card_pool.size()>0){
                node = this._card_pool.get()
            }
            else{
                node = cc.instantiate(this.node_poker)
            }
        }
        else{
            node = cc.instantiate(this.node_poker)
        }
        
        node.active = true
        let scp = node.getComponent("Rummy_Poker")
        scp.setSelected(false)
        if(data){
            //设置牌值
            let wild = cc.vv.gameData.getRoundWild()
            scp.show16Poker(data,wild)
        }
        else{
            //显示牌背
            scp.showPokerBg(0)
        }
        return node
    },

    //新的分组
    doNewGroup:function(data){
        let hands = cc.vv.gameData.getMyHand()
        let duiIdx = data.dui
        let val = data.card
        let obj = data.obj
        let duiGroup = hands[duiIdx]
        //从原来组中删除
        let idx = this._getObjIdx(duiIdx,obj)//duiGroup.indexOf(val)
        if(idx>=0){
            duiGroup.splice(idx,1)
        }
        if(duiGroup.length == 0){
            //这个组空了，需要移除
            hands.splice(duiIdx,1)
        }

        if(hands.length<6){
            //可以新增一组
            hands.push([val])
            
        }
        else{
            //添加到最后一组
            hands[hands.length-1].push(val)
        }
        
        cc.vv.gameData.sendGroupCard(hands)
        //重新刷新手牌
        this._recircleNode()
        this.showHandCards()


    },

    //插入牌组
    //todata:目标牌组信息
    doInsertGroup:function(data,todata){
        let hands = cc.vv.gameData.getMyHand()
        let duiIdx = data.dui
        let val = data.card
        let fromObj = data.obj
        let toDuidIdx = todata.dui
        let toVal = todata.card
        let toObj = todata.obj
        let fromIdx = this._getObjIdx(duiIdx,fromObj)
        let toIdx = this._getObjIdx(toDuidIdx,toObj)
        if(duiIdx == toDuidIdx){
            //同组移动位置.调整顺序到todata的后方
            cc.log(hands[duiIdx])
            let duiGroup = hands[duiIdx]
            if(toIdx>fromIdx){
                //先插入,再删除
                cc.log("移动到后方"+val)
                duiGroup.splice(toIdx+1,0,val)
                duiGroup.splice(fromIdx,1)
            }
            if(toIdx<fromIdx){
                 //先删除,zai插入
                 cc.log("移动到前方"+val)
                duiGroup.splice(fromIdx,1)
                duiGroup.splice(toIdx+1,0,val)
            }
            hands[duiIdx] = duiGroup
            cc.log(hands[duiIdx])
            cc.vv.gameData.updateHand(duiIdx,hands[duiIdx])

        }
        else{
            //不同组,删除移动出来的，新增移动进去的
            let toDui = hands[toDuidIdx]
            toDui.splice(toIdx+1,0,val)

            let fromDui = hands[duiIdx]
            fromDui.splice(fromIdx,1)
            if(fromDui.length == 0){
                //这个组空了，需要移除
                hands.splice(duiIdx,1)
            }
    
            


        }
        cc.vv.gameData.sendGroupCard(hands)
        //重新刷新手牌
        this._recircleNode()
        this.showHandCards()

    },

    //出牌
    doDiscard:function(data,bSyncServer=true,outCall){
        let hands = cc.vv.gameData.getMyHand()
        let duiIdx = data.dui
        let val = data.card
        let obj = data.obj
        //从手牌中删除
        let idx = this._getObjIdx(duiIdx,obj)

        let fromDui = hands[duiIdx]
        fromDui.splice(idx,1)

        if(fromDui.length == 0){
            //这个组空了，需要移除
            hands.splice(duiIdx,1)
        }

        
        //牌飞到弃牌堆
        let self = this
        let toNode = cc.find("Canvas/safe_node/node_table/node_poker/dirscard_check_card")
        let endCall = function(){
            if(bSyncServer){
                //通知服务器
                cc.vv.gameData.sendReqDiscard(val,hands)
            }
            self._recircleNode()
            self.showHandCards()
            if(outCall){
                outCall()
            }

            Global.TableSoundMgr.playEffect("dealcard")
        }
        this.flyCardToNode(obj,toNode,0.2,endCall)
        
        
        


    },

    //show牌
    doShow:function(data){
        let hands = cc.vv.gameData.getMyHand()
        let duiIdx = data.dui
        let val = data.card
        let obj = data.obj

        
        //从手牌中删除
        let idx = this._getObjIdx(duiIdx,obj)

        let fromDui = hands[duiIdx]
        fromDui.splice(idx,1)
        if(fromDui.length == 0){
            //这个组空了，需要移除
            hands.splice(duiIdx,1)
        }

        
        //牌飞到show堆
        let self = this
        let toNode = cc.find("Canvas/safe_node/node_table/node_poker/show_card")
        let endCall = function(){
            //通知服务器
            cc.vv.gameData.sendShowResult(val,hands)
            self._recircleNode()
            self.showHandCards()
            Global.TableSoundMgr.playEffect("showcard")
        }
        this.flyCardToNode(obj,toNode,0.2,endCall)
    },

    _getObjIdx:function(dui,obj){
        let toIdx
        let handsObj = this._allActiveCards[dui]
        for(let i = 0; i < handsObj.length; i++){
            if(obj == handsObj[i]){
                toIdx = i
                break
            }
           
        }
        return toIdx
    },

    _delObjIdx:function(dui,idx){
        let handsObj = this._allActiveCards[dui]
        let dels = handsObj.splice(idx,1)
        this._card_pool.put(dels[0])
    },
    
    _getLastObj:function(){
        let lastDui = this._allActiveCards[this._allActiveCards.length-1]
        return lastDui[lastDui.length-1]
    },

    // clearLastDrawFlag:function(){
    //     for(let i = 0; i < this._allActiveCards.length; i++){
    //         let dui = this._allActiveCards[i]
    //         for(let j = 0;j < dui.length; j++){
    //             dui[j].getComponent("Rummy_Poker").setLastDrawFlag(false)
    //         }
    //     }
    // },

    getCardByVal:function(val){
        for(let i = this._allActiveCards.length - 1; i >= 0; i--){
            let dui = this._allActiveCards[i]
            for(let j = dui.length - 1;j >= 0; j--){
               let temp = dui[j].getComponent("Rummy_Poker").getPokerIndex()
               if(temp == val){
                return dui[j]
               }
            }
        }
    },

    // //最近摸的牌可能已经插入到其它堆里了
    // getCardWithLastDraw:function(){
    //     for(let i = 0; i < this._allActiveCards.length; i++){
    //         let dui = this._allActiveCards[i]
    //         for(let j = 0;j < dui.length; j++){
    //             let val = dui[j].getComponent("Rummy_Poker").getLastDrawFlag()
    //             if(val){
    //                 return dui[j]
    //             }
    //         }
    //     }
    // },


    _recircleNode:function(){
        for(let i = 0; i < this._allActiveCards.length; i++){
            for(let j = 0; j < this._allActiveCards[i].length; j++){
                this._card_pool.put(this._allActiveCards[i][j])
            }
            
        }
        this._allActiveCards = []
        for(let i = 0; i < this._allActiveType.length; i++){
            this._type_pool.put(this._allActiveType[i])
        }
        this._allActiveType = []


    },

    flyCardToNode:function(obj,toNode,nDur,endCall){
        cc.tween(obj)
        .to(nDur,{position:this.node.convertToNodeSpaceAR(toNode.convertToWorldSpaceAR(cc.v2(0,0)))})
        .call(()=>{
            if(endCall){
                endCall()
            }
            
        })
        .delay(1.5)
        .call(()=>{
            this._card_pool.put(obj)
        })
        .start()
    },

    //获取选中的所有卡牌
    getAllSelectPokers:function(){
        let data = []
        for(let i = 0; i < this._allActiveCards.length; i++){
            let duis = this._allActiveCards[i]
            for(let j = 0; j < duis.length; j++){
                let poker = duis[j]
                if(poker.getComponent("Rummy_Poker").isSelect()){
                    data.push(poker)
                }
                
            }
        }
        return data
    },

 

    // update (dt) {},
});
