/**
 * 地图
 */

cc.Class({
    extends: cc.Component,

    properties: {
        yb_grey:cc.SpriteFrame,
        yb_light:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._entermap = false;

        this._lay_bg = cc.find('lay_bg',this.node);
        this._lay_bg.active = false;

        this._node_mask = cc.find('node_mask',this.node)
        this._map = cc.find('map',this._node_mask);
        // this._map.scale = Math.min(cc.find("Canvas").width/cc.find("Canvas").getComponent(cc.Canvas).designResolution.width,
        //     cc.find("Canvas").height/cc.find("Canvas").getComponent(cc.Canvas).designResolution.height);
        this._moveUser = cc.find('user_sp', this._map);

        let btnBack = cc.find('map/btn_back',this._node_mask)
        Global.btnClickEvent(btnBack,this.onClickBack,this)

        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;
    },

    showMapDetail:function(){
        let engData = cc.vv.gameData.getCollectData();
        let curMapId = engData.idx
        let yuanbaolight = cc.find('yuanbaolight',this._map)
        yuanbaolight.active = false;

        for(let i = 1; i <= 19; i++){
            let item = cc.find('s_'+i,this._map)
            if(item){       
                if(cc.vv.gameData.isBigGate(i)){
                    let item_spine = item.getChildByName("spine");
                    if(i > curMapId){
                        item_spine.active = false;
                    }
                    else {
                        if(i == curMapId && !this._bTrigger){
                            this._moveUser.position = item.position;
                            this._moveUser.getComponent(sp.Skeleton).setAnimation(0, "animation2", true);

                            item_spine.active = true;
                            item_spine.getComponent(sp.Skeleton).setAnimation(0,'animation' + i + '_1', true);
                        }
                    }
                }else{
                    if(i < curMapId){
                        //点亮
                        // Global.SlotsSoundMgr.playEffect(this._soundCfg.map_node);
                        item.getComponent(cc.Sprite).spriteFrame = this.yb_light
                    }
                    else if(i == curMapId){
                        //播放动画
                        if(!this._bTrigger){
                            this._moveUser.position = item.position;
                            this._moveUser.getComponent(sp.Skeleton).setAnimation(0, "animation2", true);

                            //点亮显示小关卡
                            this.showSmallGateLight(item,yuanbaolight);
                            item.getComponent(cc.Sprite).spriteFrame = this.yb_light
                        }
                        // Global.SlotsSoundMgr.playEffect(this._soundCfg.map_move);
                    }
                    else{
                        //灰色
                        item.getComponent(cc.Sprite).spriteFrame = this.yb_grey
                    }
                }
            }  
        }


        if (this._bTrigger) {
            this._moveUser.position = cc.find('s_'+(curMapId - 1),this._map).position;
            //移动
            cc.tween(this._moveUser)
                .to(0.5, {position:cc.find('s_'+curMapId,this._map).position})
                .start();

            //特效
            let spineMoveUser = this._moveUser.getComponent(sp.Skeleton);
            spineMoveUser.setAnimation(0, "animation", false);
            spineMoveUser.setCompleteListener(()=>{
                spineMoveUser.setAnimation(0, "animation2", true);
                spineMoveUser.setCompleteListener(null);

                this.pathMoveFinish(curMapId,yuanbaolight, curMapId);
                this.delayShowExistMap();
            });

            if (cc.vv.gameData.isBigGate(curMapId)) {
                if (curMapId == 19) {//最后一关=
                    Global.SlotsSoundMgr.playEffect(this._soundCfg.meter_full);
                    // Global.SlotsSoundMgr.playEffect(this._soundCfg.transition_1);
                }
                else {
                    Global.SlotsSoundMgr.playEffect(this._soundCfg.map_node);
                }
            }
            else {
                Global.SlotsSoundMgr.playEffect(this._soundCfg.map_move);
            }
        }
    },

    delayShowExistMap:function(){
        if(this._bTrigger){
            this.scheduleOnce(()=>{
                this.existMap(this.showSubGame(this));
            },2)
        }
    },

    // 断网重连
    ReconnectNet:function(bTrigger){
        // this.enterMap(bTrigger)
    },


    //进入
    enterMap:function(bTrigger){
        if(this._entermap) return;

        this._entermap = true;
        cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBtnsByState("moveing_1");
        
        this._bTrigger = bTrigger
        // Global.SlotsSoundMgr.playEffect(this._soundCfg.map_open);

        this.node.active = true;
        this._node_mask.active = true
        this._lay_bg.active = true;
        this._map.y = 2000;

        Global.SlotsSoundMgr.playEffect(this._soundCfg.map_open);
        cc.tween(this._map)
            .to(0.3, {y:0})
            .call(()=>{
                //显示地图内容
                this.showMapDetail()

                //返回按钮放大效果处理
                let btnBack = cc.find('map/btn_back',this._node_mask)
                btnBack.active = !this._bTrigger
                btnBack.scale = 0;
                if (btnBack.active) {
                    cc.tween(btnBack)
                        .delay(0.1)
                        .to(0.2,{scale:1.3})
                        .to(0.2,{scale:1})
                        .start()
                }
            })
            .start();
    },

    //退出
    existMap:function(endCall){
        Global.SlotsSoundMgr.playEffect(this._soundCfg.map_close);
        cc.tween(this._map)
        .to(0.3,{position:cc.v2(0,2000)})
        .call(() => {
            this._lay_bg.active = false;
            this._node_mask.active = false;
            this.node.active = false;

            this._entermap = false;

            if (endCall) endCall();
        })
        .start()
    },

    onClickBack:function(){
        Global.SlotsSoundMgr.playEffect(this._soundCfg.click);

        //返回按钮放大效果处理
        let btnBack = cc.find('map/btn_back',this._node_mask)
        btnBack.getComponent(cc.Button).enabled = false;

        cc.tween(btnBack)
            .to(0.1,{scale:1.3})
            .to(0.2,{scale:0})
            .call(()=>{
                btnBack.getComponent(cc.Button).enabled = true;
                this.existMap(()=>{
                    cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBtnsByState("idle");
                })
            })
            .start()
    },

    //显示移动完成动作
    pathMoveFinish(mapid,ybnode, id){
        let item = cc.find('s_'+mapid,this._map)
        if(cc.vv.gameData.isBigGate(mapid)){
            //开启大关卡
            this.openBigGate(item, id);
        }else{
            //开启小关卡
            this.openSmallGate(item,ybnode);
        }
    },

    //直接打开显示当前小关卡
    showSmallGateLight(itemnode,yuanbaonode){
        yuanbaonode.position = yuanbaonode.parent.convertToNodeSpaceAR(itemnode.convertToWorldSpaceAR(cc.v2(0,0)));
        yuanbaonode.active = true;
        //开始播放动作
        let ybsp = yuanbaonode.getComponent(sp.Skeleton)
        ybsp.setAnimation(0,'animation1_1',true)
    },

    //开启大关卡
    openBigGate(itemnode, id){
        let item_spine = itemnode.getChildByName("spine");
        let ybsp = item_spine.getComponent(sp.Skeleton)
        ybsp.setAnimation(0,'animation' + id,false)
        ybsp.setCompleteListener(() => {
            ybsp.setAnimation(0,"animation" + id + "_1", true);
            ybsp.setCompleteListener(null)
        })
    },

    //开启小关卡
    openSmallGate(itemnode,yuanbaonode){
        itemnode.getComponent(cc.Sprite).spriteFrame = this.yb_light;
        yuanbaonode.position = yuanbaonode.parent.convertToNodeSpaceAR(itemnode.convertToWorldSpaceAR(cc.v2(0,0)));
        yuanbaonode.active = true;

        //开始播放动作
        let ybsp = yuanbaonode.getComponent(sp.Skeleton)
        ybsp.setAnimation(0,'animation1',false)
        ybsp.setCompleteListener(() => {
            ybsp.setAnimation(0,"animation1_1",true)
            ybsp.setCompleteListener(null)
        })
    },

    showSubGame:function(self){
        let engData = cc.vv.gameData.getCollectData();
        if(!engData) return;

        let opengame = engData.open;
        AppLog.log("显示子游戏:"+opengame);
        if(opengame == 2){
            //中免费
             let freeGame = cc.find('Canvas/safe_node/node_energy_free_game')
             freeGame.active = true;

            SlotsFacade.energyFreeGame.enterFreeGame(engData);
        }
        else if(opengame == 1){
            //中777
            cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBtnsByState("moveing_1")
             let mapGame = cc.find('Canvas/safe_node/LMSlots_Subgame777');
             mapGame.active = true
             mapGame.getComponent('LMSlots_Subgame777').showEnter(engData.bet);
        }

        cc.vv.gameData.clearCollectData();
    }
});
