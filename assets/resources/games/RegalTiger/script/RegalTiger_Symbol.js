
cc.Class({
    extends: require('LMSlots_Symbol_Base'),

    properties: {

    },

    //重写idx:符号的序号，即在reel中的序号，0开始
    Init:function(idx,node){
        this._isInit = true;
        this._super(idx,node);
    },

    // //重写显示随机符号
    ShowRandomSymbol:function(){
        let bonusdata = cc.vv.gameData.GetBonusData();
        //断线重连 直接显示断线前符号
        if(this._isInit&&bonusdata&&bonusdata.idxs&&bonusdata.idxs.length>0){
            let idx = this.ChangeRowColToIdx(this._symbolIdx,this._reelIdx);
            if(idx < 0){
                this.ShowById(7)
            }else{
                this.ShowById(bonusdata.cards[idx])
                this.setSymbolNum();
            }
        }else{
            let cfg = cc.vv.gameData.getGameCfg()
            let randIdx = Global.random(1,cfg.randomSymbols.length)
            let randVal = cfg.randomSymbols[randIdx-1]
            this.ShowById(randVal)
        }
        this._isInit = false;
    },

    ChangeRowColToIdx:function(nRow,nCol){
        return 5 * (3 - nRow - 1) + nCol
    },

    //重写显示符号
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
        if(cfg.symbol[id] && cfg.symbol[id].node){
            let symbolnode = cfg.symbol[id].node;
            if(cc.vv.gameData.isBonusGameing()&&id!=12){
                symbolnode = cfg.symbol[id].node2;
            }
            this._showNode = cc.find(symbolnode,this.node)
            this._showNode.active = true
        }
        else{
            console.log("未找到配置id:" + id)
        }
    },

    //设置灰色图标 true false复原
    setGraySymbol(isgray){
        if(this._id == 12)
            return;
        if(this._showNode){
            this._showNode.active = false
        }
        let cfg = cc.vv.gameData.getGameCfg() 
        let symbolnode = isgray?cfg.symbol[this._id].node2:cfg.symbol[this._id].node;
        this._showNode = cc.find(symbolnode,this.node)
        this._showNode.active = true
    },

     //设置_symbolIdx 行序号
     SetSymbolIdx:function(idx){
        this._super(idx);
        this.setSymbolNum();
    },

    //添加数值显示
    setSymbolNum(){
        let multinode = cc.find('num',this.node);
        if(this._id != 12){
            multinode.active = false;
            return; 
        }
        if(this._symbolIdx > 2)
            return;
        let idx = this.ChangeRowColToIdx(this._symbolIdx,this._reelIdx);
        let coindata = cc.vv.gameData.getCoinData(idx+1);
        if(coindata){
            if(coindata.rtype == "MULT"){
                multinode.active = true;
                let lbl = multinode.getComponent(cc.Label);
                let fontname = 'jinbi';
                if(cc.vv.gameData.isGoldCoinHong(coindata.num)){
                    fontname = 'jinbi_h' //红
                }
                lbl.font = cc.vv.gameData.GetFontByName(fontname);
                lbl.string = Global.convertNumToShort(coindata.num,1000,1);
                this._showNode = cc.find('s12',this.node);
                cc.find('s30',this.node).active = false;
                cc.find('s34',this.node).active = false;
                cc.find('s38',this.node).active = false;
                this._showNode.active = true;
            }else{
                multinode.active = false;
                this.showJackpotSymbol(coindata.rtype);
            }
        }
    },

    //重写恢复到保存的状态
    Resume(backup) {

        if (backup){
            cc.find('num',this.node).active = false;
            cc.find('s30',this.node).active = false;
            cc.find('s34',this.node).active = false;
            cc.find('s38',this.node).active = false;
        }


        this._super(backup);
        this.setSymbolNum();
    },
    
    //显示jackpot符号 返回true表示jackpot
    showJackpotSymbol(rtype){
        cc.find('s12',this.node).active = false;
        switch (rtype) {
            case "MINI":this._showNode = cc.find('s30',this.node);break;
            case "MINOR":this._showNode = cc.find('s34',this.node);break;
            case "MAJOR":this._showNode = cc.find('s38',this.node);break;
        }
        this._showNode.active = true;
    },

    //重写播放停止动画(增加缩放动画)
    playStopAnimation(){
        this._super();
        cc.tween(this.node).to(0.2,{scale:1.4},{easing:'backInOut'}).to(0.1,{scale:1}).start();
    },

//同时做放大处理
//cc.tween(this.node).to(0.2,{scale:1.4},{easing:'backInOut'}).to(0.1,{scale:1}).start();
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
                    nodeSp.setAnimation(0,cfg.symbol[id].trigger_ani.name,true)
                }
            }
        }
        return isPlay
    },

    //在顶层播放动画；能覆盖左右两列
    setCoinToTop(isTop){
        if(this._topAniNode){
            let showNode = cc.find(cc.js.formatStr("symbol_top_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);
            if (isTop) {
                let cloneNode = null;
                if(!showNode){
                    cloneNode = cc.instantiate(this.node)
                    let wordPos = this.node.convertToWorldSpaceAR(cc.v2(0.0));
                    cloneNode.parent = this._topAniNode
                    cloneNode.name = cc.js.formatStr("symbol_top_%s_%s",this._symbolIdx,this._reelIdx)
                    cloneNode.position = this._topAniNode.convertToNodeSpaceAR(wordPos)
                    this.node.active = false
                }
                return cloneNode
            }else{
                this.node.active = true
                // if(this._showNode){
                //     this._showNode.active = true;
                // }
                if (showNode) {
                    showNode.removeFromParent()
                    showNode.destroy()
                }
            } 
            return showNode;
        }
    },

    //断线重连初始化coin到top
    reConnectCoinToTop(){
        let cloneNode = cc.instantiate(this.node)
        let wordPos = this.node.convertToWorldSpaceAR(cc.v2(0.0));
        cloneNode.parent = this._topAniNode
        cloneNode.name = cc.js.formatStr("symbol_top_%s_%s",this._symbolIdx,this._reelIdx)
        cloneNode.position = this._topAniNode.convertToNodeSpaceAR(wordPos)
        this.node.active = false
    },

});
