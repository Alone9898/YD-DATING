// 收集页面
cc.Class({
    extends: cc.Component,

    properties: {
        _itemList:[],
        _multsList:[],
        _mapWinCoin:0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._node_map = cc.find("safe_node/node_map", this.node);
        this._node_map.active = false;

        for (let i = 1; i <= 16; i++){
            this._itemList[i] = cc.find("node_items/item" + i, this._node_map);
        }

        this._node_mults = cc.find("node_mults", this._node_map);
        for (let i = 1; i <= 7; i++){
            this._multsList[i] = cc.find("node_mults/mult" + i, this._node_map);
        }

        this._node_road = cc.find("node_road", this._node_map);
        this._choice_board = cc.find("choice_board", this._node_map);
        this._round_board = cc.find("round_board", this._node_map);

        this._btn_back = cc.find("btn_back", this._node_map);

        this._node_start = cc.find("node_start", this._node_map);
        this._node_choose = cc.find("node_choose", this._node_map);
    },

    ReconnectNet(bAdd,data){
        if(this._sendMsg){// 发了51消息，但没返回
            this.enterGame(bAdd,data);
        }
    },

    enterGame(bAdd,data){
        return new Promise(async (success, failed)=> {
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
            Global.SlotsSoundMgr.playBgm("mapbgm");
            this._node_map.active = true;
            this._collectGame = cc.vv.gameData.getCollectGame();

            this._collectionIdxs = this._collectGame.collectionIdxs;
            this._collectionItems = this._collectGame.collectionItems;

            cc.find("fill_the_EN", this._node_map).active = true;
            this._node_mults.active = false;
            this._node_road.active = false;
            this._choice_board.active = false;
            cc.find("spots_EN", this._node_map).active = true;
            this._round_board.active = false;
            cc.find("spots_EN/lbl", this._node_map).getComponent(cc.Label).string = cc.js.formatStr("%s/%s", this._collectGame.collectionIdxs.length, 16);
            this._btn_back.active = false;
            this._node_start.active = false;
            this._node_choose.active = false;

            this._mapWinCoin = 0;


            this.initAllItems(bAdd);
            if(bAdd){
                await this.playAddItem(data.idx, data.type, data.coin);
            }

            if(this._collectGame.state == 2){
                await this.popBonusStart();
                await this.showAllMults();
                await this.popChooseColor();
                this.showCurSelectColor(this._selectId); // 1-蓝 2-红 3-金
                await this.playAllRound();

                await cc.vv.gameData.getPopupScript().playWinPanel(this._mapWinCoin);
                cc.vv.gameData.getPopupScript().playKQpAnim();

                this._collectGame.state = 0;
                cc.vv.gameData.setCollectGame(this._collectGame);

                cc.vv.gameData.getProgressData().totalCnt = 0;
                cc.vv.gameData.getCollectScript().initBar(0);

                await cc.vv.gameData.awaitTime(3.5);

                this.exitGame(success, true);
            } else {
                if(bAdd){
                    cc.vv.gameData.getProgressData().totalCnt = 0;
                    cc.vv.gameData.getCollectScript().initBar(0);
                    await cc.vv.gameData.awaitTime(1);
                    Global.SlotsSoundMgr.stopBgm();
                    this._node_map.active = false;

                    this.exitGame(success, true);
                } else {
                    this._btn_back.active = true;
                    this._btn_back.setScale(0);
                    cc.tween(this._btn_back).to(0.5, {scale:1}).start();
                    await cc.vv.gameData.awaitTime(0.5);
                    this._btn_back.off("click");
                    this._btn_back.getComponent(cc.Button).interactable = true;
                    this._btn_back.on("click", ()=>{
                        Global.SlotsSoundMgr.playEffect("button");
                        this._btn_back.getComponent(cc.Button).interactable = false;
                        this.exitGame(success)
                        cc.vv.gameData.GetBottomScript().ShowBtnsByState("idle");
                        success();
                    })
                }
            }
        })
    },

    async exitGame(func, bWin){
        Global.SlotsSoundMgr.stopBgm();
        this._node_map.active = false;

        if(bWin){
            let totalWin = cc.vv.gameData.GetBottomScript().getCurrentWin();
            let wheelWin= cc.vv.gameData.getWheelWin();
            if(cc.vv.gameData.isFreeGame()){// 判断是否在免费中
                cc.vv.gameData.setFreeWinCoin(totalWin);
                await new Promise((success, failed)=> {
                    cc.vv.gameData.GetSlotsScript().ShowBottomWin(wheelWin+this._mapWinCoin, totalWin, false, success);
                })
            } else {
                await new Promise((success, failed)=>{
                    cc.vv.gameData.AddCoin(this._mapWinCoin);
                    cc.vv.gameData.GetSlotsScript().ShowBottomWin(wheelWin+this._mapWinCoin,wheelWin+this._mapWinCoin,true,success)
                });
            }
        }

        if(func){
            func();
            func = null;
        }
    },

    initAllItems(bAdd){
        let idxs = this._collectGame.collectionIdxs;
        let items = this._collectGame.collectionItems;
        for (let i = 1; i < this._itemList.length; i++){
            this._itemList[i].active = false
            if(!bAdd || (bAdd && i != this._collectGame.idx)){
                if(idxs.includes(i)){
                    this._itemList[i].active = true;

                    cc.find("spr",this._itemList[i]).getComponent("ImgSwitchCmp").setIndex(items[idxs.indexOf(i)].type-1);
                    cc.find("lbl",this._itemList[i]).getComponent(cc.Label).string = Global.formatNumShort(items[idxs.indexOf(i)].coin, 1);
                }
            }
            cc.find("lbl",this._itemList[i]).color = cc.Color.WHITE;
            cc.find("XuanZeJieMian", this._itemList[i]).active = false;
            cc.find("ChengBei_SG", this._itemList[i]).active = false;
        }
    },

    playAddItem(idx,type, coin){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("addspot");
            this._itemList[idx].active = true;
            this._itemList[idx].setScale(0);
            cc.tween(this._itemList[idx]).to(0.5, {scale: 1}).start();
            cc.find("spr",this._itemList[idx]).getComponent("ImgSwitchCmp").setIndex(type-1);
            cc.find("lbl", this._itemList[idx]).getComponent(cc.Label).string = Global.formatNumShort(coin,1);
            // cc.find("lbl",this._itemList[idx]).color = cc.Color.WHITE;
            await cc.vv.gameData.awaitTime(1);
            success();
        });
    },

    showAllMults(){
        return new Promise(async (success, failed)=> {
            this._node_mults.active = true;

            Global.SlotsSoundMgr.playEffect("multNumberIn");
            for (let i = 1; i < this._multsList.length; i++){
                this._multsList[i].active = false;
                cc.find("ChengBei_SG",this._multsList[i]).active = false;
                this._multsList[i].getComponent("ImgSwitchCmp").setIndex(2);
                this._multsList[i].y = this._multsList[i].y + 100;
                cc.tween(this._multsList[i])
                    .delay((i-1)*0.1)
                    .call(()=>{
                        this._multsList[i].active = true;
                    })
                    .to(0.3,{y:this._multsList[i].y - 100}, {easing:"backOut"})
                    .start()
            }

            await cc.vv.gameData.awaitTime(0.1*this._multsList.length + 0.5);
            success()
        })
    },

    showCurSelectColor(idx){
        this._choice_board.active = true;
        cc.find("blue_sk_s", this._choice_board).getComponent("ImgSwitchCmp").setIndex(idx-1)
    },

    showCurRoadMult(idx){
        cc.find("row/mult1/lbl",this._node_road).getComponent("ImgSwitchCmp").setIndex(idx-1);
        cc.find("row/mult2/lbl",this._node_road).getComponent("ImgSwitchCmp").setIndex(idx-1);
        cc.find("col/mult1/lbl",this._node_road).getComponent("ImgSwitchCmp").setIndex(idx-1);
        cc.find("col/mult2/lbl",this._node_road).getComponent("ImgSwitchCmp").setIndex(idx-1);
    },

    playAllRound(){
        return new Promise(async (success, failed)=> {
            let totalWin = cc.vv.gameData.GetBottomScript().getCurrentWin();

            let grayLine = [1,2,3,4,5,6,7,8];  // 1-4row  5-8col
            for (let i = 1; i < 7; i++){
                this.playMult(i);
                await this.popRound(i);
                let roadData = this._mapResult[i-1];
                this._node_road.active = true;
                this.showCurRoadMult(i);
                for (let i = 0; i < 4; i++){
                    let idx = grayLine[Global.random(1,grayLine.length) - 1];
                    this.playShowRoad(idx, idx > 4);
                    await cc.vv.gameData.awaitTime(0.7);
                }

                if(roadData.col){
                    this.playShowRoad(roadData.col, true);
                    await cc.vv.gameData.awaitTime(0.7);
                    this._node_road.active = false;

                    for (let i = 0; i < 4; i++){
                        cc.find("spr",this._itemList[roadData.col + i*4]).getComponent("ImgSwitchCmp").setIndex(3);
                        cc.find("lbl",this._itemList[roadData.col + i*4]).color = new cc.Color(100, 100, 100);
                    }

                    grayLine.splice(grayLine.indexOf(roadData.col+4),1);
                } else if(roadData.row){
                    this.playShowRoad(roadData.row, false);

                    await cc.vv.gameData.awaitTime(0.7);
                    this._node_road.active = false;

                    for (let i = 0; i < 4; i++){
                        cc.find("spr",this._itemList[(roadData.row-1)*4 + i +1]).getComponent("ImgSwitchCmp").setIndex(3);
                        cc.find("lbl",this._itemList[(roadData.row-1)*4 + i +1]).color = new cc.Color(100, 100, 100);
                    }
                    grayLine.splice(grayLine.indexOf(roadData.row),1);
                }

                await cc.vv.gameData.awaitTime(0.5);

                totalWin += roadData.coin;
                cc.vv.gameData.GetBottomScript().SetWin(totalWin);
                Global.SlotsSoundMgr.playEffect("mapwin");
                await cc.vv.gameData.awaitTime(0.5);
            }

            // 第7轮
            this.playMult(7);
            let roadData2 = this._mapResult[6];
            let row = roadData2.row ? roadData2.row : grayLine[1];
            let col = roadData2.col ? roadData2.col : grayLine[1]-4;      //grayLine： 1-4row  5-8col
            let idx = (row-1)*4+col;
            let data = this._collectionItems[this._collectionIdxs.indexOf(idx)];
            if(data.type === this._selectId){ // 2倍赢钱效果
                Global.SlotsSoundMgr.playEffect("toPick");
                let sp1 = cc.find("XuanZeJieMian", this._itemList[idx]);
                let sp2 = cc.find("ChengBei_SG", this._itemList[idx]);
                sp1.active = true;
                sp2.active = true;
                let animN = ["XuanZeJieMian_Lan_Intro2","XuanZeJieMian_Hong_Intro2","XuanZeJieMian_Jin_Intro2"];
                sp1.getComponent(sp.Skeleton).setAnimation(0,animN[data.type-1],false);
                sp2.getComponent(sp.Skeleton).setAnimation(0,"ChengBei_SG",false);
                cc.find("lbl", this._itemList[idx]).getComponent(cc.Label).string = Global.formatNumShort(roadData2.coin, 1);
            }
            await cc.vv.gameData.awaitTime(0.5);
            totalWin += roadData2.coin;
            cc.vv.gameData.GetBottomScript().SetWin(totalWin);
            Global.SlotsSoundMgr.playEffect("mapwin");
            await cc.vv.gameData.awaitTime(0.5);

            await cc.vv.gameData.awaitTime(1);
            success();
        })
    },


    playShowRoad(idx, bCol){
        Global.SlotsSoundMgr.playEffect("lightbar")

        let row = cc.find("row", this._node_road);
        let col = cc.find("col", this._node_road);

        row.active = !bCol;
        col.active = bCol;

        let cIdx = bCol ? idx : (idx-1)*4+1;
        let pos = this._node_road.convertToNodeSpaceAR(this._itemList[cIdx].convertToWorldSpaceAR(cc.v2(0,0)));

        if(bCol){
            col.x = pos.x;
            col.opacity = 0;
            cc.tween(col).to(0.2, {opacity:255}).start()
        } else {
            row.y = pos.y;
            row.opacity = 0;
            cc.tween(row).to(0.2, {opacity:255}).start()
        }
    },

    popBonusStart(){
        return new Promise(async (success, failed)=> {
            this._node_start.active = true;
            this._node_start.setScale(0);
            cc.tween(this._node_start).to(0.5, {scale:1}, {easing:"backOut"}).start()

            let bgGuang = cc.find("TanChuang_Guang", this._node_start).getComponent(sp.Skeleton);
            bgGuang.setAnimation(0,"TanChuang_Guang_Intro", false);
            bgGuang.addAnimation(0,"TanChuang_Guang_Loop", true);

            let btn = cc.find("map_start_btn", this._node_start);
            btn.off("click");
            await cc.vv.gameData.awaitTime(0.5);
            let self = this;
            let clickFunc = async()=> {
                Global.SlotsSoundMgr.playEffect("button");
                btn.getComponent(cc.Button).interactable = false;
                bgGuang.setAnimation(0,"TanChuang_Guang_End", false);
                cc.tween(self._node_start).to(0.5, {scale:0}, {easing:"backIn"}).start()
                await cc.vv.gameData.awaitTime(0.5);
                self._node_start.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.getComponent(cc.Button).interactable = true;
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            })
        });
    },

    popChooseColor(){
        return new Promise(async (success, failed)=> {
            this._node_choose.active = true;
            this._node_choose.setScale(0);
            cc.tween(this._node_choose).to(0.5, {scale:1}, {easing:"backOut"}).start()

            let bgGuang = cc.find("TanChuang_Guang", this._node_start).getComponent(sp.Skeleton);
            bgGuang.setAnimation(0,"TanChuang_Guang_Intro", false);
            bgGuang.addAnimation(0,"TanChuang_Guang_Loop", true);

            let btnList = [];
            btnList[0] = cc.find("Lan", this._node_choose);
            btnList[1] = cc.find("Hong", this._node_choose);
            btnList[2] = cc.find("Jin", this._node_choose);
            btnList.forEach(btn=>{
                let animName = cc.js.formatStr("XuanZeJieMian_%s_Loop", btn.name);
                cc.find("XuanZeJieMian",btn).getComponent(sp.Skeleton).setAnimation(0,animName,true)
            });

            await cc.vv.gameData.awaitTime(0.5);

            let func = async(btn,idx)=>{
                btn.getComponent(cc.Button).interactable = false;
                if(!canClick){
                    return;
                }

                canClick = false;
                Global.SlotsSoundMgr.playEffect("mapick");
                this._sendMsg = true;
                let reqdata = {rtype:4, choiceId:idx+1};
                let msg = await cc.vv.gameData.reqSubGame(reqdata);
                if(msg){
                    this._sendMsg = false;
                }
                if(msg.code === 200 && !msg.spcode && msg.data.rtype == 4){
                    this._collectGame = msg.data.collectGame;
                    this._mapResult = msg.data.result;
                    this._selectId = msg.data.choiceId;
                    this._mapWinCoin = msg.data.winCoin;

                    let animName = cc.js.formatStr("XuanZeJieMian_%s_Intro", btn.name);
                    cc.find("XuanZeJieMian",btn).getComponent(sp.Skeleton).setAnimation(0,animName,false)

                    await cc.vv.gameData.awaitTime(0.5);
                    bgGuang.setAnimation(0,"TanChuang_Guang_End", false);
                    cc.tween(this._node_choose).to(0.5, {scale:0}, {easing:"backIn"}).start()
                    await cc.vv.gameData.awaitTime(0.5);
                    this._node_choose.active = false;

                    success();
                }
            }

            let randomIdx = Math.floor(Math.random() * btnList.length)
            cc.vv.gameData.checkAutoPlay(btnList[randomIdx],  function (){func(btnList[randomIdx],randomIdx)});

            let canClick = true;
            btnList.forEach((btn,idx)=>{
                btn.off("click");
                btn.getComponent(cc.Button).interactable = true;
                btn.on("click", async()=>{
                    btnList[randomIdx].stopAllActions();
                    func(btn,idx)
                })
            })
        })
    },

    playMult(idx){
        if(this._multsList[idx-1]){
            this._multsList[idx-1].getComponent("ImgSwitchCmp").setIndex(0);
        }
        this._multsList[idx].getComponent("ImgSwitchCmp").setIndex(1);
        cc.find("ChengBei_SG", this._multsList[idx]).active = true;
        cc.find("ChengBei_SG", this._multsList[idx]).getComponent(sp.Skeleton).setAnimation(0,"ChengBei_SG",false);
    },

    popRound(idx){
        return new Promise(async (success, failed)=> {
            this._round_board.active = true;
            this._round_board.setScale(0);
            cc.tween(this._round_board).to(0.5, {scale:1}, {easing:"backOut"}).start();

            cc.find("round_1_EN", this._round_board).getComponent("ImgSwitchCmp").setIndex(idx-1);
            cc.find("x_1_EN", this._round_board).getComponent("ImgSwitchCmp").setIndex(idx-1);

            await cc.vv.gameData.awaitTime(1.5);
            cc.tween(this._round_board).to(0.5, {scale:0}, {easing:"backIn"}).start()
            await cc.vv.gameData.awaitTime(0.5);
            this._round_board.active = false;
            success();
        })
    },


    // update (dt) {},
});
