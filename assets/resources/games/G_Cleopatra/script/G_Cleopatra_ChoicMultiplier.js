///免费游戏类型1 选择甲虫界面
cc.Class({
    extends: cc.Component,

    properties: {
        bgs:[cc.SpriteFrame]
    },

    onLoad () {
        for(let i=1;i<4;i++){
            let btncollect = cc.find('btn_jiachong_'+i,this.node)
            Global.btnClickEvent(btncollect,this.onChoiceJiachong,this)
        }
    },

    onEnable(){
        this.showJiachongButton(true);
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    onDisable(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this); 
    },

    init(data){
        this._subGameData = data;
        this.initUI();

        let self = this;
        let btn1 = cc.find('btn_jiachong_1',this.node);
        cc.vv.gameData.checkAutoPlay(btn1,function () {
            self.onChoiceJiachong(btn1.name)
        });
    },

    //初始化界面
    initUI(){
        //修改背景
        let index = this._subGameData.type == 3?0:1;
        this.node.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.bgs[index];
        this.showWinUI(false);
        this.hideJiachong(true);
        for(let i=1;i<4;i++){
            cc.find('sp_mult'+i,this.node).active = false;
        }
    },

    //选中甲虫事件
    onChoiceJiachong(event){
        Global.playHSEffect('pick');
        cc.find('btn_jiachong_1',this.node).stopAllActions()
        let name;
        if(typeof(event) == "string"){
            name = event
        } else {
            name = event.node.name;
        }
        let idx = parseInt(name.substr(name.lastIndexOf('_')+1));
        this.sendEnterFreeeGame(idx);
        this.showJiachongButton(false);
    },
   
    sendEnterFreeeGame(idx){
        let req = {c: MsgId.SLOT_SUBGAME_DATA};
        req.data = {}
        req.data.rtype = this._subGameData.select.rtype
        req.data.idx = idx
        req.gameid = cc.vv.gameData.getGameId()
        cc.vv.NetManager.send(req,true);
    },

    onRcvSubGameAction:function(msg){
        if(msg.code == 200){
            let jiachongnode = cc.find('btn_jiachong_'+msg.data.idx,this.node)
            if(jiachongnode){
                jiachongnode.active = true;
                cc.vv.gameData.playSpine(jiachongnode,'animation2',false,()=>{
                    cc.vv.gameData.playSpine(jiachongnode,'animation3',false,()=>{
                        this.hideJiachong(false);
                        this.showMultiplier(msg.data);
                        this.showWinUI(true);
                    })
                })
            }
        }
    },

    //控制甲壳虫按钮
    showJiachongButton(isshow){
        for(let i=1;i<4;i++){
            let btncollect = cc.find('btn_jiachong_'+i,this.node)
            btncollect.getComponent(cc.Button).interactable = isshow;
        }
    },

    //显示win界面
    showWinUI(isshow){
        cc.find('winimg',this.node).active = isshow;
        cc.find('selectimg',this.node).active = !isshow;
    },

    //隐藏甲虫
    hideJiachong(isshow){
        for(let i=1;i<4;i++){
            let jiachongnode = cc.find('btn_jiachong_'+i,this.node);
            jiachongnode.active = isshow;
            if(isshow){
                cc.vv.gameData.playSpine(jiachongnode,'animation1',true,null);
            }
        }
    },

    //显示倍率
    showMultiplier(data){
        let atlas = cc.vv.gameData.GetAtlasByName("free")
        let mulval = 0;
        let defconf = data.conf;
        let index = 0;
        cc.vv.gameData.removeValue(defconf,data.mult);
        for(let i=1;i<4;i++){
            let multnode = cc.find('sp_mult'+i,this.node);
            multnode.active = true;
            if(i != data.idx){
                multnode.color = cc.color(90,90,90);
                mulval = defconf[index];
                index++;
            }else{
                multnode.color = cc.color(255,255,255);
                mulval = data.mult;
            }
            
            multnode.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('theme186_free_text_muti_'+mulval);
        }
        this.scheduleOnce(()=>{
            this.node.active = false;
            //通知免费开始
            cc.vv.gameData.GetFreeGameScript().startFreeGame(this._subGameData.freeCnt);
        },2);
    },

});
