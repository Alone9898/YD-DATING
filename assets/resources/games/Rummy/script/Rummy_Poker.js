/**
 * Rummy 牌
 */
 let Rummy_Tools = require("Rummy_Tools")
cc.Class({
    extends: require("Poker"),

    properties: {
        bCanTouch:true,
        _duiIdx:null,
        _isShowBack:true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super()
        if(this.bCanTouch){
            this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
        }
        
        // this.node.on("position-changed",this.onPostionChange,this)
    },

    start () {
        this._super()
        this._start_y = this.node.position.y
        this._orgZindex = this.node.zIndex
    },

    onPostionChange:function(val){
        this._start_y = val
    },

    

    setPokerDui:function(ctrl,duiIdx){
        this._ctrl = ctrl
        this._duiIdx = duiIdx
    },

    getPokerDui:function(){
        return this._duiIdx
    },

    show16Poker:function(card16Idx,wild){
        this._isShowBack = false
        this._orgPos = this.node.position
        this._super(card16Idx)
        this._showWildIcon(wild)
    },

    showPokerBg:function(val){
        this._super(val)
        let node_wild = cc.find("icon_jack",this.node)
        node_wild.active = false
        this._isShowBack = true
    },

    _showWildIcon:function(wild){
        let node_wild = cc.find("icon_jack",this.node)
        let pValue = this.getPokerIndex()
        

        node_wild.active = (Rummy_Tools.getPokerVal(pValue) ==  Rummy_Tools.getPokerVal(wild))
       
    },

    onClickCard:function(){
        this._isSelect = !this._isSelect
        
        this.node.y = this._isSelect?this._start_y+25:this._start_y

        //选牌状态需要切换
        Global.dispatchEvent("poker_select_change")
        Global.TableSoundMgr.playEffect("click")
    },

    setSelected:function(val){
        this._super(val)

    },

    // //最近draw的牌
    // setLastDrawFlag:function(val){
    //     this._lastDraw = val
    // },
    // getLastDrawFlag:function(){
    //     return this._lastDraw
    // },


    _onTouchStart:function(touchEvent){
        this._orgPos = this.node.position
        this._orgZindex = this.node.zIndex
        this._slibIdx = this.node.getSiblingIndex()
        
        let myState = cc.vv.gameData.getMyState()
        if(myState == 7 || myState == 6){
            
            return
        }
        if(this._isShowBack) return
        

        this._lastPos = touchEvent.getLocation();
        this._bMove = false
    },

    _onTouchMove:function(touchEvent){
        let myState = cc.vv.gameData.getMyState()
        if(myState == 7 || myState == 6){
            
            return
        }
        if(this._isShowBack) return
        if(this._isMoveing(touchEvent)){
            this._bMove = true
            this.node.zIndex = 100
            
            
        }
        
        let deal = touchEvent.getDelta()


        this.node.x += deal.x
        this.node.y += deal.y
    },

    _onTouchEnd:function(touchEvent){
        let myState = cc.vv.gameData.getMyState()
        if(myState == 7 || myState == 6){
            
            return
        }
        if(this._isShowBack) return
       if(this._bMove){
            let node_ctrl = cc.find("Canvas/safe_node/node_lay")
            if(!this._withinTarget(node_ctrl,touchEvent)){
                let bActive = cc.vv.gameData.isMyActive()
                if(cc.vv.gameData.getMyState() == 4 && bActive){
                    //是否是show
                    let node_show = cc.find("Canvas/safe_node/node_table/node_poker/show_card/card")
                    if(this._withinTarget(node_show,touchEvent)){
                        cc.log('show')
                        let tips = "You will end the game by tapping Show"
                        let self = this
                        let sureCall = function(){
                            self._ctrl.doShow({dui:self._duiIdx,card:self.getPokerIndex(),obj:self.node})
                        }
                        let cancelCall = function(){
                            self.node.position = self._orgPos
                            self.node.zIndex = self._orgZindex
                            self.node.setSiblingIndex(self._slibIdx)
                        }
                        this.showConfirm(1,tips,sureCall,cancelCall)

                        
                    }
                    else{
                        //是否是出牌
                        cc.log("send")
                        this._ctrl.doDiscard({dui:this._duiIdx,card:this.getPokerIndex(),obj:this.node})
                    }
                }
                else{
                    //归位，不在操作环节
                    this.node.position = this._orgPos
                    this.node.zIndex = this._orgZindex
                    this.node.setSiblingIndex(this._slibIdx)
                }
                
                
            }
            else{
                //理牌任何时候都可以
                
                let bInsert = false
                let hand_ctrl = cc.find("Canvas/safe_node/node_lay").getComponent("Rummy_HandCtrl")
                let all_cards = hand_ctrl.getAllActiveCards()
                for(let i = 0; i < all_cards.length; i++){
                    let item = all_cards[i]
                    for(let j = 0; j < item.length; j++){
                        if(item[j] != this.node){
                            if(this._withinTarget(item[j],touchEvent)){
                                //是否插牌
                                bInsert = true
                                cc.log("insert")
                                let toPoker = item[j].getComponent("Rummy_Poker")
                                this._ctrl.doInsertGroup({dui:this._duiIdx,card:this.getPokerIndex(),obj:this.node},{dui:toPoker.getPokerDui(),card:toPoker.getPokerIndex(),obj:item[j]})
                                return
    
                            }
                        }
                    }
                    
                }
                
                //是否是分组
                if(!bInsert){
                    cc.log("newGroup")
                    this._ctrl.doNewGroup({dui:this._duiIdx,card:this.getPokerIndex(),obj:this.node})
                }
            }
            
            
            
       }
       else{
            this.node.position = this._orgPos
            this.node.zIndex = this._orgZindex
            this.node.setSiblingIndex(this._slibIdx)
            //选中
            this.onClickCard()
       }
        
        
    },

    _onTouchCancel:function(){
        this.node.position = this._orgPos
        this.node.zIndex = this._orgZindex
        this.node.setSiblingIndex(this._slibIdx)
    },

    _withinTarget(target,touchEvent){
        if(cc.isValid(target)){
            let rect = target.getBoundingBox()
            let localtion = touchEvent.getLocation()
            let point = target.parent.convertToNodeSpaceAR(localtion)
            return rect.contains(point)
        }
        
    },

    _isMoveing:function(touchEvent){
        let localtion = touchEvent.getLocation()
        if(localtion.sub(this._lastPos).mag()>20){
            return true
        }
        return false
    },

    showConfirm:function(type,tips,sureCall,cancelCall){
        // let url = "games/Rummy/prefab/tips"
        // cc.loader.loadRes(url,cc.Prefab,(err,data)=>{
        //     let par = cc.find("Canvas")
        //     let old = par.getChildByName("settle_ui")
        //     if(!old){
        //         old = cc.instantiate(data)
        //         old.parent = par
        //         old.getComponent("Rummy_Tips").setInfo(type,tips,sureCall,cancelCall)

                
        //     }
        // })

        let gamescp = cc.vv.gameData.getScriptGame()
        if(gamescp){
            gamescp.showConfirm(type,tips,sureCall,cancelCall)
        }
    },


    // update (dt) {},
});
