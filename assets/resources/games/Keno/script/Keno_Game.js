/**
 * Keno 游戏逻辑
 */
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        _selnum:[],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this._super()
        this._initBalls()
        this._initMyBalls()

        let btn_random = cc.find("node_game/node_mid/btn_random",this.node)
        Global.btnClickEvent(btn_random,this.onClickRandomSelect,this)
        let btn_clear = cc.find("node_game/node_mid/btn_clear",this.node)
        Global.btnClickEvent(btn_clear,this.onClickClearSelect,this)
    },

    // start () {

    // },

    // update (dt) {},

    //单人玩法就没有什么阶段，每次都显示成初始化的状态即可。
    //点击按钮就得一次结果
    showGameByStatus:function(st,doStatusChange){
        this.initShow()
    },

    initShow(){
        this._bCanBet=true,
        this._selnum=[]
        this._initBalls()
        this._initMyBalls()
    },

    //显示游戏结果
    showGameResult(msg){
        let self = this
        
        //播放中奖
        let sels = msg.nums
        let nWin = msg.wincoin
        this._hitNum = 0
        let isHit = function(val){
            let res = false
            for(let i = 0; i < sels.length; i++){
                if(val == sels[i]){
                    res = true
                    self._hitNum++
                    break
                }
            }
            return res
        }
        let res = msg.result
        for(let i = 0; i < res.lottery_nums.length; i++){
            let val = res.lottery_nums[i]
            cc.tween(this.node)
            .delay(i*0.3)
            .call(()=>{
                
                let bHit = isHit(val)
                self._setBall(val,bHit?2:1)
                if(bHit){
                    Global.TableSoundMgr.playEffect("keno_hit_num")
                }
                //更新我中了几个球
                self._setMyHitNum(self._hitNum)

                if(i == res.lottery_nums.length-1){
                    self._bFinishRound = true
                    Global.TableSoundMgr.playEffect("keno_result")
                    //gameover
                    let op_node = cc.find("node_game/node_op",this.node)
                    let bAuto = op_node.getComponent("Keno_OP").getAutoModel()
                    if(bAuto){
                        self.scheduleOnce(()=>{
                            self._clearLasResult()
                        },0.7)

                        self.scheduleOnce(()=>{
                            op_node.getComponent("Keno_OP").canNextRound(true)
                        },1)
                    }
                    else{
                        //可以进行下一轮下注
                        self.setCanBet(true)
                    }
                    //飘飞
                    self.flyWin(nWin)
                    
                }
            })
            .start()
        }
    },

    flyWin(val){
        if(val>0){
            let bottomscp =  cc.vv.gameData.getBottomScript()
            let fly_score = cc.find("fly_score",bottomscp.node)
            fly_score.active = true
            fly_score.getComponent("Table_FlyScore").setScore(val)
            // Global.TableSoundMgr.playEffect("keno_draw_num")
        }
        cc.vv.gameData.refushMyCoin()

    },

    onSelectBall(sender){
        if(!this._bCanBet) return
        if(this._selnum.length>=10){
            Global.TableSoundMgr.playEffect("keno_disabled_num")
            return
        }
        if(this._bFinishRound){
            this._selnum = []
            this._initBalls()
            this._initMyBalls()
            this._bFinishRound = null
        }
        let name = sender.node.name
        let idx = name.substr(4,name.length-1)
        let bSel = this._isSelectBall(idx)
        if(bSel){
            return
        }
        this._setBall(idx)
        this._selnum.push(idx)
        this._updateMyBalls()
        Global.TableSoundMgr.playEffect("keno_select_num")
    },

    //清理上一句的结果
    _clearLasResult(){
        if(this._bFinishRound){
            
            this._initBalls()
            this._initMyBalls()
            this._bFinishRound = null
        }
    },

    //随机10个数
    onClickRandomSelect(){
        Global.TableSoundMgr.playEffect("keno_select_num")
        this._selnum = []
        this._initBalls()
        
        let arr = Global.randomArray(10,1,36)
        for(let i= 0; i < arr.length; i++){
            this._setBall(arr[i])
            this._selnum.push(arr[i])
        }
        this._updateMyBalls()
    },

    //清理当前选择
    onClickClearSelect(){
        this._selnum = []
        this._initMyBalls()
        this._initBalls()
    },

    getMySelects(){
        return this._selnum
    },

    _initBalls(){
        let at = cc.vv.gameData.getAtlas(0)
        let norSpr = at.getSpriteFrame("ball_nor")
        let lays = cc.find("node_game/node_top/lay",this.node)
        for(let i = 0; i < 36; i++){
            if(this._isSelectBall(i+1)){
                this._setBall(i+1)
            }
            else{
                let item = cc.find("item"+(i+1),lays)
                cc.find("icon",item).getComponent(cc.Sprite).spriteFrame = norSpr
                cc.find("num",item).color = cc.Color.WHITE
                item.on("click",this.onSelectBall,this)
            }
            
        }
    },

    _initMyBalls(){
        // let lays = cc.find("node_game/node_top/my_balls/lay",this.node)
        // for(let i = 0; i < 10; i++){
        //     let item = cc.find("item"+(i+1),lays)
        //     item.active = false
        // }
        this._updateMyBalls()
    },

    //设置球的状态
    //op:0 初始化状态 1 开奖未中 2 开奖中了
    _setBall(idx,op=0){
        let at = cc.vv.gameData.getAtlas(0)
        let spSel
        let tColor
        if(op == 1){
            spSel = at.getSpriteFrame("ball_unhit")
           
        }
        else if(op == 2){
            spSel = at.getSpriteFrame("ball_hit")
            
        }
        else{
            spSel = at.getSpriteFrame("ball_sel")
            tColor=cc.Color.BLACK
        }
        
        let item = cc.find("node_game/node_top/lay/item"+(idx),this.node)
        cc.find("icon",item).getComponent(cc.Sprite).spriteFrame = spSel
        if(tColor){
            cc.find("num",item).color = tColor
        }
        
    },

    //判断是否已经选球
    _isSelectBall(idx){
        let res = false
        for(let i = 0; i < this._selnum.length; i++){
            if(idx == this._selnum[i]){
                res = true
                break
            }
        }
        return res
    },

    _updateMyBalls(){
        let at = cc.vv.gameData.getAtlas(0)
        let norSpr = at.getSpriteFrame("trend_item")
        let nLen = this._selnum.length
        let cfg = cc.vv.gameData.getMulCfg(nLen)
        let lays = cc.find("node_game/node_top/my_balls/lay",this.node)
        for(let i = 0; i < 10; i++){
            let item = cc.find("item"+(i+1),lays)
            if(cfg && cc.js.isNumber(cfg[i]) == true){
                item.active = true
                cc.find("mul",item).getComponent(cc.Label).string = Global.SavePoints(cfg[i])  + "x"
                cc.find("ball/icon",item).getComponent(cc.Sprite).spriteFrame = norSpr
                cc.find("ball/num",item).getComponent(cc.Label).string = i+1
            }
            else{
                item.active = false
            }
            
        }
    },

    _setMyHitNum(val){
        
        let lays = cc.find("node_game/node_top/my_balls/lay",this.node)
        let item = cc.find("item"+(val),lays)
        if(item){
            let at = cc.vv.gameData.getAtlas(0)
            let hitSpr = at.getSpriteFrame("trend_item_hit")
            cc.find("ball/icon",item).getComponent(cc.Sprite).spriteFrame = hitSpr
        }
        
    },

    //是否可以押注
    setCanBet(val){
        this._bCanBet = val
        let opVal = val?255:155
        let node_game = cc.find("node_game",this.node)

        let mid_node = cc.find("node_mid",node_game)
        mid_node.opacity = opVal
        cc.find("btn_random",mid_node).getComponent(cc.Button).interactable = val
        cc.find("btn_clear",mid_node).getComponent(cc.Button).interactable = val

        //下注按钮
        let btn_bet = cc.find("node_op/btn_bet",node_game)
        btn_bet.opacity = opVal
        btn_bet.getComponent(cc.Button).interactable = val

        let node_bet = cc.find("node_op/bet",node_game)
        node_bet.getComponent(cc.Button).interactable = val

        let btn_add = cc.find("btn_add",node_bet)
        btn_add.opacity = opVal
        btn_add.getComponent(cc.Button).interactable = val
        let btn_max = cc.find("btn_max",node_bet)
        btn_max.opacity = opVal
        btn_max.getComponent(cc.Button).interactable = val
        let btn_minus = cc.find("btn_minus",node_bet)
        btn_minus.opacity = opVal
        btn_minus.getComponent(cc.Button).interactable = val
        let btn_min = cc.find("btn_min",node_bet)
        btn_min.opacity = opVal
        btn_min.getComponent(cc.Button).interactable = val
    },


    isCanBet:function(){
        return this._bCanBet
    },

    // _showSelectTips(bShow){
    //     cc.find("node_game/tip",this.node).active = bShow
    // }



});
