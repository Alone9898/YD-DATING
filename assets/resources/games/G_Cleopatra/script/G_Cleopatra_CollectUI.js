//2020-12-3 修改需求金币的计算
//realOtherPyramid(组合实际使用金币) = freeCnt(实际选择免费总次数)   BASENUM (算分基础免费次数3次)  otherPyramid(组合算分基础免费次数为3次时组合的初始金币)
//local realOtherPyramid = math.floor(otherPyramid * freeCnt / COLLECTCFG.BASENUM)

//pyramid (整体组合需要消耗的金字塔) = spinPyramid：免费次数需要消耗的金币 + realOtherPyramid组合实际需要消耗的金币
//local pyramid = spinPyramid + realOtherPyramid
cc.Class({
    extends: cc.Component,

    properties: {
        items:[cc.Node],
    },
    
    onLoad () {
        this._spineCfg = cc.vv.gameData.getGameCfg().SPINE;
        this._singleCfg = cc.vv.gameData.getGameCfg().SINGLE;
        this._groupCfg = cc.vv.gameData.getGameCfg().GROUP;

        this.items.forEach(element => {
            Global.btnClickEvent(element,this.onChoiceEvent,this)
            let btn_help = cc.find('choicebg/btn_help',element);
            Global.btnClickEvent(btn_help,this.onItemHelpEvent,this)

            let btn_subtract = cc.find('choicebg/btn_subtract',element);
            Global.btnClickEvent(btn_subtract,this.onSubtractEvent,this)

            let btn_add = cc.find('choicebg/btn_add',element);
            Global.btnClickEvent(btn_add,this.onAddEvent,this)

            let btn_subtract2 = cc.find('choicebg/btn_subtract2',element);
            Global.btnClickEvent(btn_subtract2,this.onSubtract2Event,this)

            let btn_add2 = cc.find('choicebg/btn_add2',element);
            Global.btnClickEvent(btn_add2,this.onAdd2Event,this)
        });

        //free game spins加减按钮
        let btn_freesubtract = cc.find('center/freegamespins/btn_subtract',this.node);
        Global.btnClickEvent(btn_freesubtract,this.onFreeSpinsSubtractEvent,this)

        let btn_freeadd = cc.find('center/freegamespins/btn_add',this.node);
        Global.btnClickEvent(btn_freeadd,this.onFreeSpinsAddEvent,this)

        let collecthelop = cc.find('btn_close',this.node);
        Global.btnClickEvent(collecthelop,this.onCloseUI,this)

        let buildplay = cc.find('btn_buildplay',this.node);
        Global.btnClickEvent(buildplay,this.onBuildPlayEvent,this)

        this._lblTotalCost = cc.find('btn_buildplay/totalcost',this.node).getComponent(cc.Label);
    },

    onEnable(){
        //初始化值
        this._freeSpinsValue = this._spineCfg.num.min;
        this._defaultCost = this._spineCfg.pyramid.init;
        this._otherCost = 0;
        this._itemIndex = 0; 
        
        //金字塔收集总数
        this._pyramidCount =cc.vv.gameData.getPyramidNum();
        let collectcoin = cc.find('bg_collectcoin/lbl_collectcoin',this.node);
        collectcoin.getComponent(cc.Label).string = Global.FormatNumToComma(this._pyramidCount);

        this.updateFreeGameSpins();
        this.updateTotalCost();
        this.hideAllItems();

    },

    onCloseUI(){
        Global.playHSEffect('btn_click');
        Global.showAlertAction(this.node,false,0.1,0,()=>{
            this.node.active = false;
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("idle");
        })
    },

    //发送开始收集游戏
    sendStartCollectGame(){
        let req = {c: MsgId.SLOT_SUBGAME_DATA};
        req.data = {}
        req.data.other = {}
        req.data.rtype = 5;
        req.data.spin = {num:this._freeSpinsValue-2} //1代表3次
        req.data.other = this.getSendTypeIndex();
        req.gameid = cc.vv.gameData.getGameId()
        cc.vv.NetManager.send(req,true);
        Global.playHSEffect('btn_click');
    },

    //开始游戏
    onBuildPlayEvent(btn){
        Global.playHSEffect('btn_click');
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.showAlertAction(this.node,false,0.1,0,()=>{
            this.node.active = false;
            cc.vv.gameData._collectFreeState = true;
            
            this.sendStartCollectGame();
        })
    },

    //隐藏所有item
    hideAllItems(){
        this.items.forEach(element => {
            cc.find('choicebg',element).active = false;
        });
    },

    //选中item事件
    onChoiceEvent(item){
        this._curpos = 0;
        this._curpos2 = 0;
        this._itemIndex = parseInt(item.node.name.replace('item',''));
            
        this.updateConfiguration(item.node);
        Global.playHSEffect('choose1');
        cc.find('choicebg',item.node).active = true;
        this.items.forEach(element => {
            if(item.node != element){
                cc.find('choicebg',element).active = false;
            }
        });
    },

    //修改item点击初始化配置
    updateConfiguration(itemnode){
        //let index = parseInt(itemnode.name.replace('item',''));
        let getcfg = this.getCfgbyIndex(this._itemIndex);
        let addcost = 0;
        if(getcfg){
            for(let i=0;i<getcfg.length;i++){
                if(getcfg[i].reel){
                    let pos = i==0?this._curpos:this._curpos2;
                    cc.find('choicebg/reels/number',itemnode).getComponent(cc.Label).string = getcfg[i].value[pos];
                    if(pos == 0){
                        cc.find('choicebg/reels/reel',itemnode).active = true;
                        cc.find('choicebg/reels/reels',itemnode).active = false;
                    }else{
                        cc.find('choicebg/reels/reel',itemnode).active = false;
                        cc.find('choicebg/reels/reels',itemnode).active = true;
                    }
                    addcost += getcfg[i].pyramid[pos];
                }
                else if(getcfg[i].symbolid){
                    //10,J,Q,K,A图片
                    let pos = i==0?this._curpos:this._curpos2;
                    let symbollist = getcfg[i].symbolid[pos];
                    for(let i=0;i<5;i++){
                        if(i<symbollist.length){
                            cc.find('choicebg/symbols/symbol'+i,itemnode).active = true;
                        }else{
                            cc.find('choicebg/symbols/symbol'+i,itemnode).active = false;
                        }
                    }
                    addcost += getcfg[i].pyramid[pos];
                }else{
                    if(i == 0){
                        cc.find('choicebg/curtimes',itemnode).getComponent(cc.Label).string = getcfg[i].value[this._curpos];
                        addcost += getcfg[i].pyramid[this._curpos];
                        
                    }else{
                        cc.find('choicebg/curtimes2',itemnode).getComponent(cc.Label).string = getcfg[i].value[this._curpos2];
                        addcost += getcfg[i].pyramid[this._curpos2];
                    }
                }

                //更新加减按钮
                this.updateSubandAddBtn(itemnode,getcfg[i].pyramid.length-1,i)
            }
            if(this._itemIndex == 7||this._itemIndex == 8 || this._itemIndex == 9){
                addcost = this.getPyramidCount(this._itemIndex,this._curpos+1,this._curpos2+1);
            }
            //更新单个item cost
            cc.find('choicebg/totaltimes',itemnode).getComponent(cc.Label).string = this.getFreeGameSpinsAddCost(addcost);
        }
        //更新总cost
        this._otherCost = addcost;
        this.updateTotalCost();
    },

    //free game spins 减按钮事件
    onFreeSpinsSubtractEvent(btn){
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.playHSEffect('btn_click');
        this._freeSpinsValue--;
        this.updateFreeGameSpins();
        this.updateTotalCost();
    },

    //free game spins 加按钮事件
    onFreeSpinsAddEvent(btn){
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.playHSEffect('btn_click');
        this._freeSpinsValue++;
        this.updateFreeGameSpins();
        this.updateTotalCost();
    },

    //free game spins 改变时需要同时改变索引7 8 9的消耗
    freeSpinsChangeMulCost(){
        let curcost = this.getFreeGameSpinsAddCost(this._otherCost);
        let totaltimes = cc.find(cc.js.formatStr('center/item%s/choicebg/totaltimes',this._itemIndex),this.node);
        if(totaltimes){
            totaltimes.getComponent(cc.Label).string = Global.FormatNumToComma(curcost);
        }
    },

    //更新free game spins
    updateFreeGameSpins(){
        let addnode = cc.find('center/freegamespins/btn_add',this.node);
        let subtract = cc.find('center/freegamespins/btn_subtract',this.node);
        if(this._freeSpinsValue == this._spineCfg.num.max){
            addnode.getComponent(cc.Button).interactable = false;
        }else{
            addnode.getComponent(cc.Button).interactable = true;
        }
        if(this._freeSpinsValue == this._spineCfg.num.min){
            subtract.getComponent(cc.Button).interactable = false;
        }else{
            subtract.getComponent(cc.Button).interactable = true;
        }

        this._defaultCost = this.getFreeGameSpinsAddCost(this._spineCfg.pyramid.init);
        cc.find('center/freegamespins/totaltimes',this.node).getComponent(cc.Label).string = Global.FormatNumToComma(this._defaultCost);
        cc.find('center/freegamespins/curtimes',this.node).getComponent(cc.Label).string = Global.FormatNumToComma(this._freeSpinsValue);

        this.freeSpinsChangeMulCost();
    },

    //获取free game spins改变增加的金字塔数量消耗
    getFreeGameSpinsAddCost(curvalue){
        return Math.floor(curvalue * this._freeSpinsValue / this._spineCfg.num.min);
    },

    //更新加减按钮
    updateSubandAddBtn(itemnode,maxpos,subindex){
        if(subindex == 1){
            if(this._curpos2 == 0){
                cc.find('choicebg/btn_subtract2',itemnode).getComponent(cc.Button).interactable = false;
            }else{
                cc.find('choicebg/btn_subtract2',itemnode).getComponent(cc.Button).interactable = true;
            }
            if(this._curpos2 == maxpos){
                cc.find('choicebg/btn_add2',itemnode).getComponent(cc.Button).interactable = false;
            }else{
                cc.find('choicebg/btn_add2',itemnode).getComponent(cc.Button).interactable = true;
            }
        }else{
            if(this._curpos == 0){
                cc.find('choicebg/btn_subtract',itemnode).getComponent(cc.Button).interactable = false;
            }else{
                cc.find('choicebg/btn_subtract',itemnode).getComponent(cc.Button).interactable = true;
            }
            if(this._curpos == maxpos){
                cc.find('choicebg/btn_add',itemnode).getComponent(cc.Button).interactable = false;
            }else{
                cc.find('choicebg/btn_add',itemnode).getComponent(cc.Button).interactable = true;
            }
        }
    },

    //获取配置
    getCfgbyIndex(index){
        switch (index) {
            case 2:return [this._singleCfg.S1];
            case 3:return [this._singleCfg.S2];
            case 4:return [this._singleCfg.S3];
            case 5:return [this._singleCfg.S4];
            case 6:return [this._singleCfg.S5];
            case 7:return [this._singleCfg.S2,this._singleCfg.S4];
            case 8:return [this._singleCfg.S2,this._singleCfg.S3];
            case 9:return [this._singleCfg.S1,this._singleCfg.S5];
        }
        return undefined;
    },

    //获取发送类型 及idx _curpos服务器从1开始
    getSendTypeIndex(){
        switch (this._itemIndex) {
            case 2:return [{type:1,idx:this._curpos+1}];
            case 3:return [{type:2,idx:this._curpos+1}];
            case 4:return [{type:3,idx:this._curpos+1}];
            case 5:return [{type:4,idx:this._curpos+1}];
            case 6:return [{type:5,idx:this._curpos+1}];
            case 7:return [{type:2,idx:this._curpos+1},{type:4,idx:this._curpos2+1}];
            case 8:return [{type:2,idx:this._curpos+1},{type:3,idx:this._curpos2+1}];
            case 9:return [{type:1,idx:this._curpos+1},{type:5,idx:this._curpos2+1}];
        }
        return [];
    },

    //只有组合类型item7 item8 item9从此处获取消耗金字塔数量
    getPyramidCount(index,pos1,pos2){
        switch (index) {
            case 7:return this.getGroupPyramid(this._groupCfg.G6,pos1,pos2);
            case 8:return this.getGroupPyramid(this._groupCfg.G7,pos1,pos2);
            case 9:return this.getGroupPyramid(this._groupCfg.G8,pos1,pos2);
        }
        return 0;
    },

    //获取组合消耗的金字塔数量
    getGroupPyramid(group,pos1,pos2){
        switch (pos1) {
            case 1:{
                switch (pos2) {
                    case 1:return group.type_1_1;
                    case 2:return group.type_1_2;
                    case 3:return group.type_1_3;
                    case 4:return group.type_1_4;
                    case 5:return group.type_1_5;
                }
            }break;
            case 2:{
                switch (pos2) {
                    case 1:return group.type_2_1;
                    case 2:return group.type_2_2;
                    case 3:return group.type_2_3;
                    case 4:return group.type_2_4;
                    case 5:return group.type_2_5;
                }
            }break;
            case 3:{
                switch (pos2) {
                    case 1:return group.type_3_1;
                    case 2:return group.type_3_2;
                    case 3:return group.type_3_3;
                    case 4:return group.type_3_4;
                    case 5:return group.type_3_5;
                }
            }break;
            case 4:{
                switch (pos2) {
                    case 1:return group.type_4_1;
                    case 2:return group.type_4_2;
                    case 3:return group.type_4_3;
                    case 4:return group.type_4_4;
                    case 5:return group.type_4_5;
                }
            }break;
            case 5:{
                switch (pos2) {
                    case 1:return group.type_5_1;
                    case 2:return group.type_5_2;
                    case 3:return group.type_5_3;
                    case 4:return group.type_5_4;
                    case 5:return group.type_5_5;
                }
            }break;
        }
        return 0;
    },

    //item帮助事件
    onItemHelpEvent(item){
        Global.playHSEffect('btn_click');
    },

    //减少事件
    onSubtractEvent(btn){
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.playHSEffect('btn_click');
        this._curpos--;
        this.updateConfiguration(btn.node.parent.parent);
    },

    //增加事件
    onAddEvent(btn){
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.playHSEffect('btn_click');
        this._curpos++;
        this.updateConfiguration(btn.node.parent.parent);
    },

    //第二个减少事件
    onSubtract2Event(btn){
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.playHSEffect('btn_click');
        this._curpos2--;
        this.updateConfiguration(btn.node.parent.parent);
    },

    //第二个增加事件
    onAdd2Event(btn){
        if(!btn.node.getComponent(cc.Button).interactable)
            return;
        Global.playHSEffect('btn_click');
        this._curpos2++;
        this.updateConfiguration(btn.node.parent.parent);
    },

    //更新总花费
    updateTotalCost(){
        let totalcost = this._defaultCost+this.getFreeGameSpinsAddCost(this._otherCost);
        this._lblTotalCost.string = Global.FormatNumToComma(totalcost);

        if(totalcost > this._pyramidCount){
            cc.find('btn_buildplay',this.node).getComponent(cc.Button).interactable = false;
        }else{
            cc.find('btn_buildplay',this.node).getComponent(cc.Button).interactable = true;
        }
    },
});
