
cc.Class({
    extends: require('LMSlots_Symbol_Base'),

    properties: {
       
    },

    //重写显示符号
    ShowById:function(id,data){
        let collectfree = cc.vv.gameData.getCollectFree();
        if(collectfree&&collectfree.multiplerWilds){
            if(id == 1){
                 //获取id(将id为1wild转化)
                id = 100+collectfree.multiplerWilds;
            }
        }
        
        this._super(id,data);
        if(id > 100){
            this.setSymbolMulti(collectfree.multiplerWilds);
        }
    },

    //播放进入免费动画
    playScatterAnimation(isplay){
        if(this._id != 2){
            return
        }
        let cfg = cc.vv.gameData.getGameCfg();
        let wnode = cc.find(cfg.symbol[this._id].win_node,this.node);
        if(isplay){
            wnode.active = true;
            wnode.getComponent(sp.Skeleton).setAnimation(0,"animation",true);
        }else{
            wnode.active = false;
        }
    },
    
    //scatter符号停止时需要显示在上层
    scatterSymbolStop(){
        if(this._id == 2){
            this.node.zIndex = 100;
        }
    },


    //关闭动画节点
    resetScatterShow(){
        let cfg = cc.vv.gameData.getGameCfg();
        let wnode = cc.find(cfg.symbol[this._id].win_node,this.node);
        if(wnode){
            wnode.active = false;
        }
        //同时隐藏num
        this.hideCollectNum();
        //
        this.hideSymbolMulti();
    },

    //显示收集数值
    showCollectNum(num){
        let numnode = cc.find('flyparticle',this.node);
        cc.vv.gameData.playSpine(numnode,'animation'+num,false);
    },

    //移动时关闭收集数值
    hideCollectNum(){
        let numnode = cc.find('flyparticle',this.node);
        numnode.active = false;
    },

    //添加符号倍率
    setSymbolMulti(multi){
        let multinode = cc.find('multi',this.node);
        multinode.active = true;
        let atlas = cc.vv.gameData.GetAtlasByName("symbol");
        multinode.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('theme186_s_X'+multi);
    },

    //隐藏符号倍率
    hideSymbolMulti(){
        let multinode = cc.find('multi',this.node);
        if(multinode.active){
            multinode.active = false;
        }
    },

    //人面狮身动画播放 显示金币
    playLionAni(num){
        if(this._id != 14)return;
        let cfg = cc.vv.gameData.getGameCfg()
        if(this._showNode){
            this._showNode.active = false
        }
        this._showNode= cc.find(cfg.symbol[this._id].win_node,this.node);
        this._showNode.active = true;
        this._showNode.getComponent(sp.Skeleton).setAnimation(0,"animation2",false);
        cc.tween(this.node)
            .call(()=>{
                let lab = cc.find('lab',this._showNode)
                lab.active = true
                lab.getComponent(cc.Label).string = Global.formatNumShort(num);
            })
            .start()
    },
    //显示节点
    showNode(){
        if(this._showNode){
            //AppLog.log('###显示节点:'+this._id)
            this._showNode.active = true
        }else{
            //AppLog.log('###节点不存在显示:'+this._id)
            let cfg = cc.vv.gameData.getGameCfg()
            let topShowNode = cc.find(cfg.symbol[this._id].node,this.node)
            topShowNode.active = true
        }
    },

});