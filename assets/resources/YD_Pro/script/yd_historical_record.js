
const LIST = require("List")
cc.Class({
    extends: cc.Component,

    properties: {
        pageView: cc.PageView,
        pageNode: cc.Node,

        listviewTable:LIST,
        listviewBet:LIST,

        _curPage:1,
        _gameid:null,
        _serverdata:[],
        gameItemList:[],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        cc.vv.NetManager.registerMsg(MsgId.GAME_BET_RECORDS, this.OnRcvRecords, this);

        Global.btnClickEvent(cc.find("tog_type/toggle1",this.node),this.onClickToggle1,this);
        Global.btnClickEvent(cc.find("tog_type/toggle2",this.node),this.onClickToggle2,this);
        Global.btnClickEvent(cc.find("tog_type/toggle3",this.node),this.onClickToggle3,this);
    },

    start () {

    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_BET_RECORDS, this.OnRcvRecords,false, this);
    },

    //从外部打开
    init(data){
        if(data){
            if(data.page){
                this._curPage = data.page;
                this._showPage()
            }
            if(data.gameid){
                this._gameid = data.gameid;

                let item = cc.vv.UserConfig.getGameMapInfo(this._gameid)
                if(item){
                    this._curPage = item.bBetSelect ? 2 : 1;
                } else {
                    this._curPage = 3;
                }
                this._showPage()
            }
        } else {
            this._curPage = 1;
            this._showPage()
        }
    },

    //下注记录
    sendBetRecordsReq:function(gameid){
        let req = {c:MsgId.GAME_BET_RECORDS}
        req.gameid = gameid
        req.limit = 35
        cc.vv.NetManager.sendAndCache(req)
    },

    OnRcvRecords:function(msg) {
        if (msg.code == 200) {
            this._gameid = msg.gameid;
            this._serverdata = msg.records;
            this._showRecordsList()
        }
    },

    _showRecordsList:function(){
        if(this._curPage == 1){
            this.listviewTable.numItems = this._serverdata.length
        } else {
            this.listviewBet.numItems = this._serverdata.length
        }
    },

    onClickToggle1(){
        if(this._curPage != 1){
            this._curPage = 1;
            this._gameid = null;
            this._showPage()
        }
    },

    onClickToggle2(){
        if(this._curPage != 2) {
            this._curPage = 2;
            this._gameid = null;
            this._showPage()
        }
    },

    onClickToggle3(){
        if(this._curPage != 3) {
            this._curPage = 3;
            this._gameid = null;
            this._showPage()
        }
    },

    _showPage(){
        cc.find("tog_type/toggle1",this.node).getComponent(cc.Toggle).isChecked = this._curPage == 1;
        cc.find("tog_type/toggle2",this.node).getComponent(cc.Toggle).isChecked = this._curPage == 2;
        cc.find("tog_type/toggle3",this.node).getComponent(cc.Toggle).isChecked = this._curPage == 3;

        let gameList = [];
        if(this._curPage == 1){
            let temp = cc.vv.UserConfig.allTableSelectIds();
            for(let i=0; i < temp.length; i++){
                if(cc.vv.UserManager.isGameOpen(temp[i])){
                    gameList.push(temp[i])
                }
            }
        } else if(this._curPage == 2){
            let temp = cc.vv.UserConfig.allBetSelectIds();
            for(let i=0; i < temp.length; i++){
                if(cc.vv.UserManager.isGameOpen(temp[i])){
                    gameList.push(temp[i])
                }
            }
        } else if(this._curPage == 3){
            for (const item of cc.vv.UserManager.slotsList) {
                if(item.id == 691){
                    continue
                }
                gameList.push(item.id);
            }
        }


        this.gameItemList = [];
        this.pageView.removeAllPages();

        // 数据分页
        let pageData = [];
        while (gameList.length > 0) {
            pageData.push(gameList.splice(0, 10));
        }
        // 生成所有游戏记录的入口
        for (const item of pageData) {
            let onePageNode = cc.instantiate(this.pageNode);
            onePageNode.active = true;
            cc.find("item", onePageNode).active = false;

            let beGo = false;
            for(let i = 0; i < 10; i++){
                let itemNode = cc.instantiate(cc.find("item", onePageNode));
                itemNode.parent = onePageNode;
                itemNode.active = true;
                cc.find("select", itemNode).active = false;
                cc.find("select", itemNode).width = this._curPage == 3 ? 174 : 194;
                cc.find("bg", itemNode).width = this._curPage == 3 ? 144 : 166;
                if(item[i]){
                    if(this._curPage == 1 || this._curPage == 2){
                        cc.find("icon", itemNode).active = true;
                        cc.find("spine", itemNode).active = false;
                        cc.vv.ResManager.setSpriteFrame(cc.find("icon", itemNode).getComponent(cc.Sprite), `BalootClient/GameIcon/${item[i]}`, null, null);
                    } else if(this._curPage == 3){
                        cc.find("icon", itemNode).active = false;
                        cc.find("spine", itemNode).active = true;
                        let cfg = cc.vv.GameItemCfg[item[i]];
                        let skeletonCpt = cc.find("spine", itemNode).getComponent(sp.Skeleton);
                        cc.vv.ResManager.setSkeleton(skeletonCpt,`BalootClient/Slots/icon/${cfg.action}/spine`,(skeletonCpt) => {
                            skeletonCpt.setAnimation(0, "animation2", true)
                        })
                    }

                    itemNode.on("click", this.onClickGameItem.bind(this, item[i]), this);
                    itemNode["gameid"] = item[i];

                    this.gameItemList.push(itemNode);
                    if(this._gameid == item[i]){
                        itemNode.emit("click");
                        beGo = true;
                    }
                } else {
                    cc.find("icon", itemNode).active = false;
                    cc.find("spine", itemNode).active = false;
                }
            }

            this.pageView.addPage(onePageNode);
            if(beGo){
                this.pageView.scrollToPage(this.pageView.getPages().length-1)
            }
        }

        cc.find("list_table", this.node).active = this._curPage == 1
        cc.find("list_bet", this.node).active = this._curPage == 2 || this._curPage == 3;


        if(!this._gameid){
            this._gameid = this.gameItemList[0]["gameid"];
            this.gameItemList[0].emit("click");
        }
    },

    onClickGameItem(gameid) {
        this.sendBetRecordsReq(gameid);

        // 切换显示
        for (const item of this.gameItemList) {
            cc.find("select", item).active = gameid == item["gameid"];
        }
    },

    onRenderListBet:function(item, idx){
        let itemdata = this._serverdata[idx]
        if(itemdata){
            item.active = true
            item.getComponent("Table_Record_Bet_Item").init(itemdata)
        }
        else{
            item.active = false
        }
    },

    onRenderListTable:function(item, idx){
        let itemdata = this._serverdata[idx]
        if(itemdata){
            item.active = true
            item.getComponent("yd_Record_Item").setGameId(this._gameid)
            item.getComponent("yd_Record_Item").init(itemdata)
        }
        else{
            item.active = false
        }
    },















    // update (dt) {},
});
