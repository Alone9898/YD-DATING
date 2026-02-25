
cc.Class({
    extends: cc.Component,

    properties: {
        fish:cc.Node,
        _blankT:0,
        _curWeight:0,
        _nextDir:1,
        _lastLine:1,    // 上一条鱼在的位置
        _startMove:false,
        _pickIdx:0,
        _curShowCoin:0,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        for (let i = 0; i < this.fish.childrenCount; i++) {
        //     Global.btnClickEvent(this.fish.children[i], this.OnClickFish, this);
            this.fish.children[i].active = false;
        }
        this.bitrhPos1 = [];
        this.bitrhPos2 = [];
        for (let i = 1; i <= 4; i++) {  // 1~4在左边， 5~8在右边
            this.bitrhPos1.push(cc.find("birthPoint/pos"+i, this.node).convertToWorldSpaceAR(cc.v2(0,0)));
        }
        for (let i = 5; i <= 8; i++) {  // 1~4在左边， 5~8在右边
            this.bitrhPos2.push(cc.find("birthPoint/pos"+i, this.node).convertToWorldSpaceAR(cc.v2(0,0)));
        }

        this._bgSp = cc.find("314_bgty", this.node).getComponent(sp.Skeleton);
        this._zzSp = cc.find("314_zhenzhu", this.node).getComponent(sp.Skeleton);
        this._curShowCoin = 0;
        this._winCoinLbl = cc.find("314_zhenzhu/ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:all/ATTACHED_NODE:body2/ATTACHED_NODE:label1/wincoin", this.node).getComponent(cc.Label);
        this._winCoinLbl.string = "";

        this._resWin = cc.find("win", this.node);
        this._resWin.active = false;

        this.node.active = false;
        this.fish.active = false;
    },

    start () {

    },

    playHideAnim(){

    },

    createAFish(){
        let cfg = cc.vv.gameData.getGameCfg();
        let fishSymbol = cfg.fishSymbol;

        let self = this;
        let typeList = [1,2,3,4,5];
        let getFishType = function(){
            let random = Global.random(1,typeList.length);
            if(fishSymbol[random].weight + self._curWeight >= 4){
                typeList.splice(random-1,1);
                return getFishType();
            } else {
                return typeList[random-1];
            }
        }
        let fish = cc.instantiate(this.fish);
        fish.active = true;
        fish.parent = this.node;
        fish.hasClick = false;
        fish.name = "fishCopy";
        for (let i = 0; i < fish.childrenCount; i++) {
            Global.btnClickEvent(fish.children[i], this.OnClickFish, this);
        }
        let showF = fishSymbol[getFishType()];
        cc.find(showF.node, fish).active = true;
        fish.scaleX = showF.dir*this._nextDir*(-1);
        this._curWeight += showF.weight;
        let postList = this._nextDir == 1 ? Global.copy(this.bitrhPos2) : Global.copy(this.bitrhPos1);
        postList.splice(this._lastLine-1, 1);
        let random2 = Global.random(1,postList.length);
        let sPos = this.node.convertToNodeSpaceAR(postList[random2-1]);
        this._lastLine = random2;

        let ePos;
        if(this._nextDir == -1){
            ePos = cc.v2((sPos.x-showF.width)*(-1), sPos.y);
        } else {
            ePos = cc.v2((sPos.x+showF.width)*(-1), sPos.y);
        }

        fish.position = cc.v2(sPos.x+this._nextDir*200, sPos.y);
        cc.tween(fish)
            .to(4, {position:ePos})
            .call(()=>{
                fish.destroy()
                this._curWeight -= showF.weight;
            })
            .start()

        this._nextDir = this._nextDir*(-1);
    },

    async OnClickFish(event){
        console.log("=========",event)
        let node = event.node;
        if(node.hasClick){
            return;
        }
        node.hasClick = true;
        node.parent.stopAllActions();
        let fSp = node.getChildByName("spine").getComponent(sp.Skeleton);
        let curIdx = this._pickIdx;
        this._pickIdx += 1;
        let curCoin = this._winCoinList[curIdx];
        let moveDelayT = 0;
        if(curIdx == this._winCoinList.length-1){
            // Global.SlotsSoundMgr.playEffect("fish_pick2");
            Global.SlotsSoundMgr.playEffect("voice_op");
            fSp.setAnimation(0,"animation3", false);
            moveDelayT += 1.7
        } else {
            Global.SlotsSoundMgr.playEffect("fish_pick1");
            fSp.setAnimation(0,"animation2", false);
        }
        fSp.setCompleteListener(()=>{
            fSp.destroy();
        })
        let fishIdx = Number(node.name.substring("fish".length));
        let fishSymbol = cc.vv.gameData.getGameCfg().fishSymbol[fishIdx];
        let winNode = cc.instantiate(this._resWin);
        winNode.active = true;
        winNode.parent = this.node;
        winNode.position = this.node.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(fishSymbol.weight,0)) /*event.target.getLocation()*/);
        cc.find("314_fish_light", winNode).getComponent(sp.Skeleton).setAnimation(0,"animation"+fishIdx,false);
        let lizi = cc.find("314_lizi_tuowei", winNode);
        lizi.getComponent(cc.ParticleSystem).resetSystem();
        let winCoin = cc.find("wincoin", winNode);
        winCoin.getComponent(cc.Label).string = Global.formatNumShort(curCoin,0);
        winCoin.scale = 0.2;
        let endPos = winNode.convertToNodeSpaceAR(this._winCoinLbl.node.convertToWorldSpaceAR(cc.v2(0,0)));
        cc.tween(lizi)
            .delay(0.3+moveDelayT)
            .to(0.5,{position:endPos})
            .start()
        cc.tween(winCoin)
            .to(0.3, {scale:1}, {easing:"backOut"})
            .delay(moveDelayT)
            .to(0.5,{position:endPos})
            .start()

        await cc.vv.gameData.awaitTime(0.3+moveDelayT);
        Global.SlotsSoundMgr.playEffect("fish_collect");
        await cc.vv.gameData.awaitTime(0.5);
        winNode.destroy();
        this._curWeight -= fishSymbol.weight;

        let entry = this._zzSp.setAnimation(0,"animation2_2",false);
        this._zzSp.setTrackCompleteListener(entry, ()=>{
            this._zzSp.setTrackCompleteListener(entry,null);
            this._zzSp.setAnimation(0,"animation2_1",false);
        })
        this._curShowCoin += curCoin;
        this._winCoinLbl.string = Global.formatNumShort(this._curShowCoin,0);

        if(curIdx == this._winCoinList.length-1){
            this._startMove = false;
            this.node.children.forEach((c)=>{
                if(c.name == "fishCopy"  && c !== node.parent){
                    c.destroy()
                }
            });

            await cc.vv.gameData.awaitTime(0.8);
            Global.SlotsSoundMgr.playEffect("transition_op_respin");
            this._zzSp.setAnimation(0,"animation2_3",false);
            cc.tween(this._bgSp.node)
                .to(0.5,{opacity:0})
                .start()
            let endPos = this.node.convertToNodeSpaceAR(this._triPos);
            let e2 = cc.v2(endPos.x, endPos.y+300);
            cc.tween(this._zzSp.node)
                .to(0.6,{position:e2})
                .start()

            await cc.vv.gameData.awaitTime(1.5);
            // this.node.active = false;
            if(this._callBack){
                this._callBack();
                this._callBack = null;
            }
        }
    },

    triOceanGame(data, triPos){
        return new Promise(async (success, failed) => {
            this._winCoinList = data.coins;
            this._winCoin = data.coin;
            this._pickIdx = 0;
            this._startMove = false;
            this._nextDir = Math.random()>0.5?1:-1;
            this._curShowCoin = 0;
            this._winCoinLbl.string = "";
            this._triPos = triPos;

            Global.SlotsSoundMgr.playEffect("op_start");
            this.node.active = true;
            this._bgSp.active = true;
            this._bgSp.node.opacity = 255;
            this._zzSp.node.position = cc.v2(0,0);
            Global.SlotsSoundMgr.playEffect("transition_respin_op");
            this._zzSp.setAnimation(0,"animation1_1", false);
            this._zzSp.addAnimation(0,"animation1_2", false);
            this._zzSp.addAnimation(0,"animation1_3", false);
            this._zzSp.addAnimation(0,"animation2_1", true);

            await cc.vv.gameData.awaitTime(4);
            this._startMove = true;

            this._callBack = success;
        });
    },



    update (dt) {
        if(this._startMove){
            if(this._blankT < 2){
                this._blankT += dt;
            } else {
                if(this._curWeight < 3 ){
                    this._blankT = 0;
                    this.createAFish();
                }
            }
        }
    },
});
