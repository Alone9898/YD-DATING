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
        this._node_head = cc.find('spr_head',this.node)
        this._node_mask = cc.find('node_mask',this.node)
        this._head_pos = cc.find('head_pos',this.node)

        let btnBack = cc.find('spr_mid/spr_foot/btn_back',this._node_mask)
        Global.btnClickEvent(btnBack,this.onClickBack,this)
    },

    start () {

    },

    showMapDetail:function(){
        let self = this
        cc.log('显示地图详细');
        let engData = cc.vv.gameData.getEnergyData()
        let curMapId = engData.map_idx
        for(let i = 0; i <= 20; i++){
            let item = cc.find('spr_mid/s_'+i,this._node_mask)
            if(item){
                let oldAni = item.getChildByName('showAni')
                if(oldAni){
                    oldAni.active = false
                }
                if(cc.vv.gameData.isBigGate(i)){
                    if(i == curMapId){
                        //播放动画
                        let path = 'games/RegalTiger/spine/map/buildingEffect/spine'
                        let aniName = 'animation'+i
                        this.playSelectAni(item,path,aniName)
                        Global.SlotsSoundMgr.playEffect('map_move');
                    }
                }
                else{
                    
                    if(i < curMapId){
                        //点亮
                        item.getComponent(cc.Sprite).spriteFrame = this.yb_light
                    }
                    else if(i == curMapId){
                        //播放动画
                        let path = 'games/RegalTiger/spine/map/yuanbaoEffect/spine'
                        let aniName = 'animation2'
                        this.playSelectAni(item,path,aniName)
                        item.getComponent(cc.Sprite).spriteFrame = this.yb_light
                        Global.SlotsSoundMgr.playEffect('map_move');
                    }
                    else{
                        //灰色
                        item.getComponent(cc.Sprite).spriteFrame = this.yb_grey
                    }
                }
            }
            
            
        }

        //线路
        let node_lx = cc.find('spr_mid/node_lx',this._node_mask)
        node_lx.active = curMapId > 1

        if(curMapId>1){
            let mapindex = curMapId - 1;
            let lxAni = cc.js.formatStr('animation%s_%s',mapindex,mapindex)
            if(this._bTrigger){
                lxAni = cc.js.formatStr('animation%s',mapindex);
            }
            
            node_lx.getComponent(sp.Skeleton).setAnimation(0,lxAni,false)
            if(this._bTrigger){
                this.scheduleOnce(()=>{
                    this.existMap(this.showSubGame);
                },2)
            }
        }else{
            if(this._bTrigger){
                this.scheduleOnce(()=>{
                    this.existMap(this.showSubGame);
                },1)
            }
        }
       
    },

    async enterMapGame(){
        return new Promise((success)=>{
            this._mapPromis = success;
        })
    },

    //进入
    enterMap:function(bTrigger){
        let self = this
        this._bTrigger = bTrigger
        cc.log('进入地图');
        this._node_head.position = cc.v2(0,800)
        let endPos = this._head_pos.position
        this._node_head.active = true
        //back game 按钮放大一下
        let sprMid = cc.find('spr_mid',self._node_mask)
        let btnBack = cc.find('spr_foot/btn_back',sprMid)
        btnBack.active = !self._bTrigger
        cc.tween(this._node_head)
        .to(0.3,{position:cc.v2(endPos.x,endPos.y)})
        .call(() => {
            Global.SlotsSoundMgr.playEffect('map_open');
            self._node_mask.active = true
            sprMid.active = true
            sprMid.position = cc.v2(0,953) //510
            cc.tween(sprMid)
            .to(0.3,{position:cc.v2(0,0)})
            .call(() => {
                self.showMapDetail()
                if(btnBack.active){
                    cc.tween(btnBack)
                    .to(0.2,{scale:1.3})
                    .to(0.2,{scale:1})
                    .call(() => {
                        
                    }).start()
                }
            }).start()
        }).start()
    },

    //退出
    existMap:function(endCall){
        let self = this
        let sprMid = cc.find('spr_mid',self._node_mask)
        cc.tween(sprMid)
        .to(0.3,{position:cc.v2(0,953)})
        .call(() => {
            Global.SlotsSoundMgr.playEffect('map_close');
            self._node_mask.active = false
            cc.tween(self._node_head)
            .to(0.3,{position:cc.v2(0,800)})
            .call(() => {
                if(endCall){
                    endCall()
                }
                self.node.active = false
                
            })
            .start()
        })
        .start()
    },

    onClickBack:function(){
        Global.SlotsSoundMgr.playEffect('btn_click');
        this.existMap(()=>{
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("idle")
        })
    },

    playSelectAni:function(node,spinPath,aniName){
        let selectNode = node.getChildByName('showAni')
        if(!selectNode){
            selectNode = new cc.Node();
            selectNode.addComponent(sp.Skeleton);
            selectNode.name = 'showAni';
            selectNode.parent = node
            selectNode.zIndex = -1
        }
        cc.loader.loadRes(spinPath,sp.SkeletonData,(err,data) => {
            if(!err){
                selectNode.active = true
                let ske = selectNode.getComponent(sp.Skeleton)
                ske.skeletonData = data
                ske.premultipliedAlpha = false
                ske.setAnimation(0,aniName,true)
            }
            
        })
        
    },

    showSubGame:function(){
        let energydata = cc.vv.gameData.getEnergyData()
        AppLog.log("显示子游戏:"+energydata.next_game);
        if(energydata.next_game == 2){
            //中免费
            cc.vv.gameData.GetUIMgr().showEnergyFreeStartUI();
        }
        else if(energydata.next_game == 1){
            //中777
            let mapGame = cc.find('Canvas/safe_node/LMSlots_Subgame777')
            mapGame.getComponent('LMSlots_Subgame777').showEnter(energydata.avgbet);
        }
        if(energydata.next_game > 0){
            cc.find('Canvas/safe_node/node_energy').getComponent('RegalTiger_Energy').energyGameOver();
        }
    }
});
