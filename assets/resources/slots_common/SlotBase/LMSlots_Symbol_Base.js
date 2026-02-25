/**
 * 符号控制
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _symbolIdx:-1, //所在reel的行号
        _reelIdx:-1,    //所在列序号
        _id:null,   //显示的符号
        _data:null, //额外数据
        _showNode:null, //显示的节点
        _topAniNode:null,

        _isKuang:false,
        _state:"",
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    //idx:符号的序号，即在reel中的序号，0开始
    Init:function(idx,node){
        this._topAniNode = node
        this.SetSymbolIdx(idx);

        this.ShowRandomSymbol()
    },

    //显示随机符号
    ShowRandomSymbol:function(){
        let randVal
        let randomcfg = this.GetRandomCfg()
        if(randomcfg){
            let reelrandomCfg = randomcfg[this._reelIdx+1]
            if(reelrandomCfg){
                //gamedata中记录了当前列随机到符号表的序号了，只需要一个个往下随机就好
                let randIdx = cc.vv.gameData.GetReelRandomIdx(this._reelIdx)
                if(!cc.js.isNumber(randIdx)){
                    //如果没有就随机一个开始值，如果每次都从0开始，就每次进去游戏都是那几个图标
                    randIdx = Global.random(1,reelrandomCfg.length)-1
                } 
                randVal = reelrandomCfg[randIdx]
                if(!randVal){ //如果取到最后了就从头开始取
                    randIdx = 0
                    randVal = reelrandomCfg[randIdx]
                }
                
                cc.vv.gameData.SetReelRandomIdx(this._reelIdx,++randIdx)
            }
        }
        else{//兼容旧的配置数据
            let cfg = cc.vv.gameData.getGameCfg()
            let randIdx = Global.random(1,cfg.randomSymbols.length)
            randVal = cfg.randomSymbols[randIdx-1]
        }
        this.ShowById(randVal)
        
    },

    /**
     * 获取随机的符号表，可重写次函数根据需要配置免费游戏的符号表
     * 
     */
    GetRandomCfg:function(){
        let cfg = cc.vv.gameData.getGameCfg()
        let isFree = cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() !== cc.vv.gameData.GetFreeTime()
        if(isFree > 0 && cfg.cardmapfree) {
            return cfg.cardmapfree
        }
        return cfg.cardmap
    },

    //显示symbole
    //id:物品id
    //data:额外传递的数据
    ShowById:function(id,data){
        this._id = id
        this._data = data
        this._state = "normal";
        
        if(this._showNode){
            this._showNode.active = false
        }
        let cfg = cc.vv.gameData.getGameCfg()
        let itemCfg = cfg.symbol[id]
        if(itemCfg && itemCfg.node){
            this._showNode = cc.find(itemCfg.node,this.node)
            this._showNode.active = true

            if(itemCfg.zIndex){
                this.node.zIndex = itemCfg.zIndex
            }
        }
        else{
            console.log("未找到配置id:" + id)
        }
    },


    GetShowId:function(){
        return this._id
    },

    GetData:function(){
        return this._data
    },


    // //显示中奖框
    // bShow :true/false
    ShowKuang:function(bShow = true){
        this._isKuang = bShow;
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.kuang){
            let assetScp = cc.vv.gameData.GetAssetScript()
            let parentObj = this.GetKuangShowParent()
            if(assetScp && parentObj){
                let old = parentObj.getChildByName("kuang"+this._symbolIdx+'_'+this._reelIdx) //此symbol的框
                if(bShow){
                    if(!old || !cc.isValid(old,true)){
                        let kuangPrefab = assetScp.GetPrefabByName(cfg.kuang)
                        if(kuangPrefab){
                            old = cc.instantiate(kuangPrefab)
                            old.name = "kuang" + this._symbolIdx + '_'+ this._reelIdx
                            old.parent = parentObj
                        }
                    }
                    let symbolWordPos = this.node.convertToWorldSpaceAR(cc.v2(0,0))
                    let nodePos = parentObj.convertToNodeSpaceAR(symbolWordPos)
                    old.position = nodePos
                    old.active = true
                    if(cfg.symbol[this._id].win_ani){
                        old.zIndex = cfg.symbol[this._id].win_ani.zIndex - this._symbolIdx  + this._reelIdx*10 + 10;
                    }
                }
                else{
                    if(old){
                        old.active = false
                    }
                }
            }
        }
    },

    //设置_symbolIdx 行序号
    SetSymbolIdx:function(idx){
        this._symbolIdx = idx;
        let zVal = 50 - idx;
        if(this._id){
            let cfg = cc.vv.gameData.getGameCfg()
            let itemCfg = cfg.symbol[this._id]
            if(itemCfg && itemCfg.zIndex){
                zVal = itemCfg.zIndex
            }
        }
        
        this.node.zIndex = zVal
    },

    //获取symbol的列序号：0开始
    GetSymbolReelIdx:function(){
        return this._reelIdx;
    },
    //设置行号
    SetSymbolReelIdx:function(val){
        this._reelIdx = val
    },

    //设置框体的父节点
    //根据层级可能需要重写
    GetKuangShowParent:function(){ 
        return this._topAniNode
    },

    //显示正常的结果图标
    ShowNormal:function(){
        this.ShowById(this._id,this._data)
        this.setAnimationToTop(false)
    },

    //开始旋转时刻
    StartMove:function(){
        this.setAnimationToTop(false)
        this.ShowKuang(false)
        this.stopWinTweenAction()
        this.node.zIndex = 50 - this._symbolIdx  + this._reelIdx*10;
    },

    //开始回弹动作之前
    StopMoveBefore(){
    },

    //停止最低点之后
    StopMoveDeep(){
    },

    //停止回弹之后
    StopMoveEnd(){
    },

     //赢钱动画
    playWinAnimation(){
        if(this._showNode){
            this._showNode.active = false
        }
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node){
            this._state = "win";
            if(this._showNode){
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            topShowNode.active = true
            if(cfg.symbol[id].win_ani && cfg.symbol[id].win_ani.name != ""){
                aniNode.zIndex = cfg.symbol[id].win_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].win_ani.name,true)
                }
            }
        }
        else{
            //如果没有中奖动画，先显示出来
            //TODO：后续补充一个没有spin动画的显示效果
            this._showNode.active = true
            this.playWinTweenAction()
        }
    },

    //停止动画
    playStopAnimation(){
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].stop_ani){
            this._state = "stop";
            if(this._showNode){
                this._showNode.active = false
            }
            this._showNode = cc.find(cfg.symbol[id].win_node,this.node)
            this._showNode.active = true
            
            if(cfg.symbol[id].stop_ani.name != ""){
                this.node.zIndex = cfg.symbol[id].stop_ani.zIndex - this._symbolIdx  + this._reelIdx*10;
                let nodeSp = this._showNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].stop_ani.name,false)
                }
            }
        }
    },

     //待机动画
    playidleAnimation(){
        let isPlay = false
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].idle_ani){
            this._state = "idle";
            if(this._showNode){
                this._showNode.active = false
            }
            this._showNode = cc.find(cfg.symbol[id].win_node,this.node)
            this._showNode.active = true
            if(cfg.symbol[id].idle_ani.name != ""){
                this.node.zIndex = cfg.symbol[id].idle_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                isPlay = true
                let nodeSp = this._showNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].idle_ani.name,true)
                }
            }
        }
        return isPlay
    },

    //触发动画
    //触发了才播放的。比如已经3个scatter已经触发了免费。这个和中奖的还不一样
    playTriggerAnimation(){
        let isPlay = false
        let id = this._id
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.symbol[id] && cfg.symbol[id].win_node && cfg.symbol[id].trigger_ani){
            this._state = "trigger";
            if(this._showNode){
                this._showNode.active = false
            }
            let aniNode = this.setAnimationToTop(true)
            aniNode.active = true
            let topShowNode = cc.find(cfg.symbol[id].win_node,aniNode)
            topShowNode.active = true
            if(cfg.symbol[id].trigger_ani.name != ""){
                aniNode.zIndex = cfg.symbol[id].trigger_ani.zIndex - this._symbolIdx + this._reelIdx*10;
                isPlay = true
                let nodeSp = topShowNode.getComponent(sp.Skeleton)
                if(nodeSp){
                    nodeSp.setAnimation(0,cfg.symbol[id].trigger_ani.name,false)
                }
            }
        }
        return isPlay
    },

    //在顶层播放动画；能覆盖左右两列
    setAnimationToTop(isTop){
        if(this._topAniNode){
            if (isTop) {
                let cloneNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);
                
                //如果有同一帧又创建了，需要判断卷轴是否有效
                if (!cloneNode) {
                    cloneNode = cc.instantiate(this.node)
                }

                let wordPos = this.node.convertToWorldSpaceAR(cc.v2(0.0));
                cloneNode.parent = this._topAniNode
                cloneNode.name = cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx)
                cloneNode.position = this._topAniNode.convertToNodeSpaceAR(wordPos)
                this.node.active = false
                return cloneNode
            }else{
                let showNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);
                if (showNode) {
                    //需要重复利用的话，隐藏就好
                    showNode.removeFromParent()
                    showNode.destroy()
                }
                this.node.active = true
                if(this._showNode){
                    this._showNode.active = true
                }
            } 
        }
        return this.node
    },

    //备份当前状态
    Backup() {
        let backup = {};
        backup.symbolIdx = this._symbolIdx;
        backup.id = this._id;
        if (this._data) {
            backup.data = Global.copy(this._data);
        }
        backup.isKuang = this._isKuang;
        backup.state = this._state;
        return backup
    },

    //恢复到保存的状态
    Resume(backup) {
        if (!backup) return;
        this._symbolIdx = backup.symbolIdx;
        this._id = backup.id;
        this._data = Global.copy(backup.data);
        this.ShowKuang(backup.isKuang);
        this.ShowNormal();
        let state = backup.state;
        if (state == "win") {
            this.playWinAnimation();
        } else if (state == "stop") {
            this.playStopAnimation();
        } else if (state == "idle") {
            this.playidleAnimation();
        } else if (state == "trigger") {
            this.playTriggerAnimation();
        }
        
    },

    //播放win效果但又没有spin动画。自己写一个tween的action
    //先填写个默认的。
    playWinTweenAction(){
        this._showNode.stopAllActions()
        //记录原始缩放
        let nScale = this._showNode.scale
        this._showNodeOrgScale = nScale

        cc.tween(this._showNode)
        .repeatForever(cc.tween()
            .to(0.35,{scale:nScale+0.2})
            .to(0.35,{scale:nScale})
            .delay(1)
        )
        .start()
    },
    //停止tween类型的action动画
    stopWinTweenAction(){
        if(this._showNode){
            this._showNode.active = true
            this._showNode.stopAllActions()
            //恢复
            if(this._showNodeOrgScale){
                this._showNode.scale = this._showNodeOrgScale
                this._showNodeOrgScale = null
            }
            
            this._showNode.opacity = 255
        }
    }

    // update (dt) {},
});
