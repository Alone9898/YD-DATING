/**
 * 游戏内悬浮系统
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _btns:null,
        _btne:null,
        _node_bingo:null,
        _node_explore:null,
        _node_growup:null,
        _node_heropack:null,
        _node_heroexp:null,
        _bExpandFlag:null,//默认展开
        _openFloat:[]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //适配子游戏分辨率
        Global.FixDesignScale_V(this.node)

        this._btns = cc.find('btn_s',this.node)
        Global.btnClickEvent(this._btns, this.onClickShou, this);
        this._btne = cc.find('btn_e',this.node)
        Global.btnClickEvent(this._btne, this.onClickExpand, this);

        let bOpenCard = cc.vv.UserManager.isOpen(Global.SYS_OPEN.HERO_CARD)
        this._node_growup = cc.find("content/LMSlotsSys_road",this.node)
        this._node_growup.active = !bOpenCard


        this._node_bingo = cc.find("content/bingo_float",this.node)
        let bingoInfo = cc.vv.gameData.getDeskInfo().bingoInfo
        this._node_bingo.active = (bOpenCard && bingoInfo)?true:false
        this._node_explore = cc.find("content/explore_float",this.node)
        let exploreInfo = cc.vv.gameData.getDeskInfo().journeyInfo
        this._node_explore.active = (bOpenCard && exploreInfo)?true:false
        
        

        this._node_heropack = cc.find("content/card_heropack_float",this.node)
        this._node_heropack.active = bOpenCard
        //this._openFloat.push(this._node_heropack)

        this._node_heroexp = cc.find("content/heroexp_float",this.node)
        let herounlock = cc.vv.HerocardManager.isCardUnlock(cc.vv.gameData.getDeskInfo().spCardId)
        this._node_heroexp.active = bOpenCard && herounlock

        Global.registerEvent("HEROCARD_UPDATED",this.onCardUpate,this)
        Global.registerEvent(EventId.PULL_LV_UP,this.onEventExpLevelup,this)
        Global.registerEvent(EventId.REFUSH_SYS_FLOAT,this.onEventRefushSysFloat,this)
    },

    start () {
        let content = cc.find('content',this.node)
        content.getComponent(cc.Layout).updateLayout()
        //浮窗位置
        let box = this.node.getBoundingBox()
        let height = Math.min(840, cc.winSize.height*0.5)
        this.node.position = cc.v2((cc.winSize.width-box.width)/2, height-cc.winSize.height/2+content.height/4)

        this._updateItemOrder(true)
        //卡牌未开放前都是默认收起
        let bOpenCard = cc.vv.UserManager.isOpen(Global.SYS_OPEN.EXPLORATION)
        this._showFlotState(bOpenCard)
        
        
    },

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        // this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    onClickShou:function(){
        Global.playComEff("ch_btn_click");
        
       
        this._showFlotState(false)
        
        
    },

    onClickExpand:function(){
        Global.playComEff("ch_btn_click");
        this._showFlotState(true)
    },

    //bExpand:true展开，false收起来
    _showFlotState:function(bExpand){
        if(this._bExpandFlag == bExpand) return
        //最上面的显示
        for(let i = 1; i < this._openFloat.length; i++){
            let item = this._openFloat[i]
            item.active = bExpand
        }

        this._bExpandFlag = bExpand
        this._updatePosition()
    },

    // getTotalShowItem:function(){
    //     let nExp = this._node_heroexp.active?1:0
    //     return this._openFloat.length + nExp
    // },

    _updatePosition:function(){
        let content = cc.find('content',this.node)
        content.getComponent(cc.Layout).updateLayout()
        this.node.height = content.height
        //按钮位置
        this._btne.y = -content.height - this._btne.height/2 + 5
        this._btns.y = -content.height - this._btns.height/2 + 5
        this._btne.active = !this._bExpandFlag
        this._btns.active = this._bExpandFlag
    },

    // list(){
    //     let list = [];
    //     list.push({node:cardUp,norIdx:1,bUp:bopen&unlock});
    //     list.push({node:bongo,norIdx:3,bUp:bopen});
    //     list.push({node:card,norIdx:2,bUp:full})
    //     list.sort((a,b)=>{
    //         if(b.bUp == a.bUp){
    //             return a.norIdx-b.norIdx;
    //         }
    //         return b.bUp-a.bUp
    //     })
    // },

    /**
     * 卡牌升级图标：卡片未解锁，不显示
     * bingo未解锁：放最后面，bingo满了显示到最上面
     * 卡包图标（100次那个）：收集满了拍最前面
     * 如果没有其他特性情况：默认顺序 卡牌升级》卡包》bingo
     * @param {*} bInit 
     */
    _updateItemOrder:function(bInit){
        if(bInit){
            this._openFloat =  []
        }
        let bBingoOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.BINGO)
        let bOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.HERO_CARD)
        let bExploreOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.EXPLORATION)

        //成长之路完成后，才出现卡牌功能
        this._node_heropack.active = bOpen && (bInit || this._bExpandFlag)
        this._node_growup.active = !bOpen
        
        
            let herounlock = cc.vv.HerocardManager.isCardUnlock(cc.vv.gameData.getDeskInfo().spCardId)
            //经验的入口需要解锁了才显示
            this._node_heroexp.active = bOpen /*&& herounlock*/

            //bingo信息
            let _bingoInfo = cc.vv.gameData.getDeskInfo().bingoInfo
            //卡包信息
            let _heroPackInfo = cc.vv.gameData.getDeskInfo().spinInfo
            //骑士探索信息
            let _exploreInfo = cc.vv.gameData.getDeskInfo().journeyInfo
            //首次到达50级时候会出现没有这个字段情况
            if (!_heroPackInfo) {
                _heroPackInfo = new Object
                _heroPackInfo.spinCnt = 0
                _heroPackInfo.maxCnt = 100
            }

            let _floatArr = []; // node-节点  norLv-默认排序  bUp-是否放到前面
            if(bInit){
                if(this._node_heropack.active){
                    _floatArr.push({node:this._node_heropack, norLv:2, bUp:_heroPackInfo.spinCnt == _heroPackInfo.maxCnt});  // 卡包
                }
                if(this._node_bingo.active){
                    _floatArr.push({node:this._node_bingo, norLv:3, bUp:bBingoOpen && _bingoInfo.percent >= 100});  // bingo
                }
                if(this._node_explore.active){
                    _floatArr.push({node:this._node_explore, norLv:3, bUp:bExploreOpen && _exploreInfo.percent >= 100});   // 骑士的探索
                }
                if(this._node_growup.active){
                    _floatArr.push({node:this._node_growup,norLv:1,bUp:false})
                }
                if(this._node_heroexp.active){
                    _floatArr.push({node:this._node_heroexp, norLv:1, bUp:false});   // 卡牌万能经验
                }

                _floatArr.sort((a,b)=>{
                    if(b.bUp == a.bUp){
                        return a.norLv-b.norLv;
                    }
                    return b.bUp-a.bUp
                })
            }

            

            for (let i = 0; i < _floatArr.length; i++) {
                _floatArr[i].node.setSiblingIndex(i+1)
                this._openFloat.push(_floatArr[i].node)
            }
        
    },

    onEventExpLevelup:function(){
        let curLv = cc.vv.UserManager.getCurLv()
        if(curLv==Global.SYS_OPEN.HERO_CARD){
            //升到35级，解锁卡牌。需要先执行玩成长之路的表现才刷新item显示
            let bDone = cc.vv.NewGuide._isDoneGuide(85)
            if(!bDone){//还没做过
                return
            }
        }
        this._updateItemOrder()
    },

    onCardUpate:function(){
        this._updateItemOrder()
    },

    onEventRefushSysFloat:function(){
        this._updateItemOrder()
    },

    _onTouchMove:function(event){
        let deal = event.getDelta()
        this.node.x += deal.x
        this.node.y += deal.y
        let nWinWidth = cc.winSize.width
        let nWinHeight = cc.winSize.height

        if(this.node.x + this.node.width/4 > nWinWidth/2)  this.node.x = nWinWidth/2 - this.node.width/4
        if(this.node.x - this.node.width/4 < -nWinWidth/2) this.node.x = -nWinWidth/2 + this.node.width/4
        if(this.node.y  > (nWinHeight/2-100)) this.node.y = (nWinHeight/2 -100)
        if(this.node.y - (this.node.height) < -(nWinHeight/2-100)) this.node.y = this.node.height - (nWinHeight/2-100)
    }
    // update (dt) {},
});
