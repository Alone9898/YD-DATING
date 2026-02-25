/**
 * 新框架帮助界面
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _curShowIdx:0, //当前显示的页
        _items_r:[],
        _items_l:[],
        _loadPrefabs:[],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._laycontent = cc.find("mask_content/lay_content",this.node)
        this._itemWith = this._laycontent.width
        this.InitItems()
        

        let btn_back = cc.find("btn_backgame",this.node)
        Global.btnClickEvent(btn_back,this.OnClickBackGame,this)
        btn_back.active = false

        let btn_left = cc.find("btn_left",btn_back)
        Global.btnClickEvent(btn_left,this.OnClickLeft,this)
        let btn_right = cc.find("btn_right",btn_back)
        Global.btnClickEvent(btn_right,this.OnClickRight,this)

        let lay_bg = cc.find("lay_bg",this.node)
        lay_bg.addComponent(cc.BlockInputEvents)
        lay_bg.opacity = 0

        this.node.y = - cc.winSize.height
    },

    start () {
        
    },

    onDestroy(){
        // for(let i = 0; i < this._loadPrefabs.length; i++){
        //     let deps = cc.loader.getDependsRecursively(this._loadPrefabs[i])
        //     cc.loader.release(deps);
            
        //     // cc.loader.setAutoReleaseRecursively(this._loadPrefabs[i],true)
            
        // }
        // this._loadPrefabs = []
    },

    onEnable(){
        cc.vv.gameData.PauseSlot()
        this.ShowUIAction()
    },

    InitItems:function(){
        let self = this
        this.addIdx = 0
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.helpItems){
            for(let i = 0; i < cfg.helpItems.length; i++){
                let url = cfg.helpItems[i]
                cc.loader.loadRes(url, cc.Prefab,function(err, res){
                    if(!err){
                        self._loadPrefabs.push(res)
                        let node = cc.instantiate(res)
                        node.name = "item" + i
                        let x = self.GetItemX(i)
                        node.parent = self._laycontent
                        node.position = cc.v2(x,0)
                        self._items_r[i]=node
                        self.addIdx++
                    }
                    
                })
            }
        }
    },

    //进入动画
    ShowUIAction:function(){
        let self = this
        cc.vv.gameData.PlayCommAudio("info_page_open")
        this.node.y = - cc.winSize.height
        let layBg = cc.find('lay_bg',this.node)
        layBg.opacity = 0
        

        cc.tween(this.node)
        .to(0.5,{y:0})
        .call(() => {
            let btn_back = cc.find("btn_backgame",self.node)
            btn_back.active = true
        })
        .call(() => {
            cc.tween(layBg)
            .to(0.3,{opacity:150})
            .start()
        })
        .start()
    },

    //返回
    OnClickBackGame:function(){
        let self = this

        cc.vv.gameData.ResumeSlot()

        cc.vv.gameData.PlayCommAudio("info_page_close")
        
        let layBg = cc.find('lay_bg',this.node)
        cc.tween(layBg)
        .to(0.1,{opacity:0})
        .start()

        cc.tween(this.node)
        .to(0.5,{y:-cc.winSize.height})
        .call(()=>{
            self.node.active = false
        })
        .start()
    },

    //left
    OnClickRight:function(){
        if(!this._isLoadFinish()) return
        if(this._bMoveing){
            return
        }
        this._bMoveing = true
        cc.vv.gameData.PlayCommAudio("info_page_scroll")

        if(this._items_r.length == 1){
            //已经是最后一个了，如果还要往左，则第一个移动到右边
            let lNode = this._items_l.shift()
            lNode.position = cc.v2(this.GetItemX(1),0)
            this._items_r.push(lNode)
        }
        
        let item = this._items_r.shift()
        this._items_l.push(item)

        for(let i = 0; i <  this._items_l.length; i++){
            let node = this._items_l[i]
            this._moveNode(node,true)
        }
        for(let i = 0; i < this._items_r.length; i++){
            let node = this._items_r[i]
            this._moveNode(node,true)
        }
        
    },

    //right
    OnClickLeft:function(){
        if(!this._isLoadFinish()) return
        if(this._bMoveing){
            return
        }
        this._bMoveing = true
        cc.vv.gameData.PlayCommAudio("info_page_scroll")

        if(this._items_l.length == 0){
            //已经是最左一个了，如果还要往右，则右边最后一个移动到最左
            let lNode = this._items_r.pop()
            lNode.position = cc.v2(this.GetItemX(-1),0)
            this._items_l.push(lNode)
        }
        
        let item = this._items_l.pop()
        this._items_r.unshift(item)

        for(let i = 0; i <  this._items_l.length; i++){
            let node = this._items_l[i]
            this._moveNode(node,false)
        }
        for(let i = 0; i < this._items_r.length; i++){
            let node = this._items_r[i]
            this._moveNode(node,false)
        }
    },

    //每个item的x坐标
    // i 0开始
    GetItemX:function(i){
        let width = this._itemWith
        return width*(i)
    },

    //是否加载完了
    _isLoadFinish:function(){
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.helpItems){
            return cfg.helpItems.length == this.addIdx
        }
        
        
    },

    _moveNode:function(node,bLeft){
        let self = this
        let dir = 1
        if(bLeft){
            dir = -1
        }
        cc.tween(node)
        .by(0.2,{position:cc.v2(this._itemWith*dir,0)})
        .call(() => {
            self._bMoveing = null
        })
        .start()
    }

    // update (dt) {},
});
