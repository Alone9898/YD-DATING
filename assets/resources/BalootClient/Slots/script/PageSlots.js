

let GAME_ID = require("GameIdMgr");
// let itemsListCfg = require("GameItemCfg");
const List = require('List');
cc.Class({
    extends: cc.Component,

    properties: {
        listview: List,
        // slotsItem: cc.Prefab,
        // slotsItem_long: cc.Prefab,
        _listData: null,//list的数据
        _lastoffsetY: 0,
        _beginoffsetY: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Global.registerEvent("GAME_LIST_UPDATE",this.GAME_LIST_UPDATE,this)

        // this.listview.node.on('scrolling',this.onScrollingEvent,this)
        // this.listview.node.on('scroll-began',this.onScrollBegan,this)

        // Global.registerEvent("enter_game", this.onEnterGame, this);

        //
        // let btn_cash_go = cc.find("slot_lists/btn_ad",this.node)
        // btn_cash_go.on("click",this.onClickGoCashHero,this)

        this.loadSlotHallTop()
    },

    start() {
        // this._bCanRefush = false

        this.ShowSlots()

        // this.scheduleOnce(()=>{
        //     this._bCanRefush = true
        //     this.scrollToRecordGame();
        // }, 0.1);
    },

    onClickGoCashHero: function () {
    },

    //加载头部
    loadSlotHallTop: function () {
        let self = this
        let loadCall = function (loadData) {
            if (cc.isValid(self.node)) {
                let node = cc.instantiate(loadData)
                node.active = true
                node.parent = self.node

                let scp = self.node.getComponent("PageHall_Ani")
                if (scp) {
                    scp.node_top = node
                }
            }
        }
        let url = "BalootClient/Hall/UserinfoBar"
        this._loadPrefab(url, loadCall)
    },

    // onEnable(){

    //     //是否设置了需要滚动的游戏
    //     let gameId = cc.vv.UserManager.getGoSpinGame()
    //     if(gameId){
    //         this.scheduleOnce(()=>{
    //             this._bCanRefush = true
    //             cc.vv.UserManager.setGoSpinGame(null)
    //             this.scrollToGame(gameId)
    //         }, 0.1);
    //     }
    // },


    // //移动到记录的位置
    // scrollToRecordGame() {
    //     let off = cc.vv.UserManager.getHallOffset();
    //     if(off) {
    //         let lst = cc.find('slot_lists',this.node);
    //         lst.getComponent(cc.ScrollView).scrollToOffset(cc.v2(0,off.y), 0);

    //     }
    //     this.listview.updateAll();
    // },

    // //移动到某个游戏的位置
    // scrollToGame(gameId){
    //     if(this._listData){
    //         let curIdx = -1
    //         for(let i = 0; i < this._listData.length; i++){
    //             let item = this._listData[i]
    //             for (let j=0; j<item.length; j++) {
    //                 if (item[j].id == gameId) {
    //                     curIdx = i
    //                     break
    //                 }
    //             }
    //             if(curIdx >= 0){
    //                 break
    //             }
    //         }
    //         //所在行
    //         if(curIdx > -1){
    //             let nRow = curIdx
    //             //24 是行之间的间隔
    //             let offSet = cc.v2(0,nRow*(24+400))
    //             let lst = cc.find('slot_lists',this.node);
    //             lst.getComponent(cc.ScrollView).scrollToOffset(offSet, 1);
    //         }

    //     }
    // },

    // showTopSlots:function(itemData){
    //     if(itemData){
    //         let btn_ad = cc.find("slot_lists/btn_ad",this.node);
    //         btn_ad.active = false;

    //         let slotsItem = cc.instantiate(this.slotsItem);
    //         slotsItem.parent = btn_ad.parent;
    //         slotsItem.position = cc.v2(btn_ad.position.x,btn_ad.y );
    //         slotsItem.scale = 0.95
    //         let cp = slotsItem.getComponent("SlotsItem")
    //         cp.setUnlockList(this)
    //         cp.SetData(itemData,999,this._listData.length,false,true,true,)
    //     }
    // },


    getGameCfg: function (id) {
        let cfg = [
            { id: 541, vip: -1, ord: 1,tag:2},//克拉肯之力
            { id: 635, vip: -1, ord: 2},//神龙
            { id: 419, vip: -1, ord: 3},//老虎
            { id: 698, vip: -1, ord: 4 },//阿拉丁神灯
            { id: 696, vip: -1, ord: 5 },//辛巴达航海冒险
            { id: 695, vip: -1, ord: 6 },//尼布甲尼撒二世和空中花园
            { id: 691, vip: -1, ord: 7 },//波斯王子
            { id: 699, vip: -1, ord: 8 },//狮身人面像
            { id: 692, vip: -1, ord: 9 },//弓箭手
            { id: 693, vip: -1, ord: 10 },//阿里巴巴四十大盗
            { id: 697, vip: -1, ord: 11 },//埃及艳后
            { id: 694, vip: -1, ord: 12 },//薛西斯
        ]

        for (let i = 0; i < cfg.length; i++) {
            if (id == cfg[i].id) {
                return cfg[i]
            }
        }
    },
    //显示slots列表
    ShowSlots: function () {

        let self = this
        let _listData = cc.vv.UserManager.slotsList;
        _listData.sort((a, b) => {
            let aCfg = self.getGameCfg(a.id)
            let bCfg = self.getGameCfg(b.id)
            return aCfg.ord - bCfg.ord
        })


        let gameList = [];
        let preleader = false
        for (let j = 0; j < _listData.length; ++j) {
            let cfg = this.getGameCfg(_listData[j].id)
            if (cfg) {
                if(cfg.id == 691){
                    continue
                }
                if (cfg.leader) {
                    //首领单独插一条
                    let group = []
                    group.push(_listData[j])
                    gameList.push(group)
                    preleader = true
                } else {
                    //非首领两个游戏一条
                    if (!preleader && gameList.length > 0 && gameList[gameList.length - 1].length < 2) {
                        let group = gameList[gameList.length - 1]
                        group.push(_listData[j])
                    } else {
                        let group = []
                        group.push(_listData[j])
                        gameList.push(group)
                    }
                    preleader = false
                }
            }
        }

        this._listData = gameList;
        this.listview.numItems = this._listData.length > 0 ? this._listData.length : 0;

    },

    _getUnlockSlots: function () {
        let datas = []
        let src = cc.vv.UserManager.slotsList
        for (let i = 0; i < src.length; i++) {
            let cfg = this.getGameCfg(src[i].id)
            if (cfg.vip >= cc.vv.UserManager.svip) {
                //lock
            }
            else {
                datas.push({ id: src[i].id })
            }
        }
        return datas
    },

    OnListVRender(item, idx) {
        // if(this._bCanRefush){
        let itemData = this._listData[idx];
        let slot1 = cc.find("layout/slots_item1", item)
        let slot2 = cc.find("layout/slots_item2", item)
        if (itemData.length == 1) {
            slot1.active = true
            slot2.active = false
            this.ShowItemInfo(slot1, itemData[0], idx);
        }
        else {
            slot1.active = true
            slot2.active = true
            this.ShowItemInfo(slot1, itemData[0], idx);
            this.ShowItemInfo(slot2, itemData[1], idx);
        }

        let bottomTip = cc.find("bottom_tip", item)
        if (bottomTip) {
            bottomTip.active = (idx == this._listData.length - 1)
        }

    },

    ShowItemInfo: function (item, itemData, kIdx) {
        if (itemData && item) {
            let cp = item.getComponent("SlotsItem")
            cp.setUnlockList(this)
            let cfg = this.getGameCfg(itemData.id)
            cp.setLockVip(cfg.vip)
            // if (itemData.id == GAME_ID.SLOT_LAMP_OF_ALADDIN_a) {
            //     cp.SetData(itemData, 999, this._listData.length, false, true, true,)
            // }
            // else {
                cp.SetData(itemData, kIdx, this._listData.length)
            // }


            // item.active = true;
            // let ad = cc.find('AD_top',item)
            // if(ad){
            //     ad.active = false
            // }
            //
            // if(itemData[0].id == GAME_ID.SLOT_COMESOON+1){
            //     //是广告条
            //     if(ad){
            //         ad.active = true
            //         for(let i =0; i < item.children.length; i++){
            //             if(item.children[i].name != "AD_top"){
            //                 item.children[i].active = false
            //             }
            //         }
            //     }
            //     else{
            //         //动态加载
            //
            //         let loadCall = function(loadData){
            //             if(cc.isValid(item)){
            //                 for(let i =0; i < item.children.length; i++){
            //                     if(item.children[i].name != "AD_top"){
            //                         item.children[i].active = false
            //                     }
            //                 }
            //
            //                 let node = cc.instantiate(loadData)
            //                 node.active = true
            //                 node.name = 'AD_top'
            //                 node.parent = item
            //
            //             }
            //         }
            //         let url = "CashHero/prefab/pageslot/AD_top"
            //         this._loadPrefab(url,loadCall)
            //
            //     }
            //
            //
            //     return
            // }
            // let leader = false
            // let bFav
            // if(kIdx == 4){
            //     for(let i = 0; i < itemData.length; i++){
            //         let gamedatas = itemData[i]
            //         if(gamedatas){
            //             if(cc.vv.UserManager.isFavourGame(gamedatas.id)){
            //                 bFav = true
            //             }
            //         }
            //
            //     }
            // }
            // let item1 = item.getChildByName("slots_item1")
            // let item1Slidx = item1.getSiblingIndex()
            // let item2 = item.getChildByName("slots_item2")
            // if (itemData.length == 2) { //普通2个
            //     item1.x = -232
            //     item1.active = true
            //     item1.getComponent("CH_PageSlotsItem").SetData(itemData[0],kIdx,this._listData.length,bFav)
            //     if(bFav && itemData[1].id == GAME_ID.SLOT_COMESOON){
            //         item2.active = false
            //     }
            //     else{
            //         item2.active = true
            //         item2.getComponent("CH_PageSlotsItem").SetData(itemData[1],kIdx,this._listData.length,bFav)
            //     }
            //
            // } else if (itemData.length == 1) {  //首领
            //     if ( cc.vv.HerocardManager.isLeader(itemData[0].id)) {
            //         leader = true
            //         item1.x = 0
            //         item1.active = true
            //         item1.getComponent("CH_PageSlotsItem").SetData(itemData[0],kIdx,this._listData.length)
            //         item2.active = false
            //     } else {    //普通1个，右边显示comeing soon
            //         item1.x = -232
            //         item1.active = true
            //         item1.getComponent("CH_PageSlotsItem").SetData(itemData[0],kIdx,this._listData.length)
            //         item2.active = true
            //         item2.getComponent("CH_PageSlotsItem").SetData({id:GAME_ID.SLOT_COMESOON},kIdx,this._listData.length)
            //     }
            // } else {
            //     item.active = false
            // }
            //
            // //显示分割线
            // let topline = cc.find('top_line',item)
            // if(topline){
            //     topline.active = (kIdx == 0)
            // }
            // let leaderline = cc.find('leader_line',item)
            // if(leaderline){
            //     leaderline.active = leader
            // }
            // let bottomTip = cc.find("bottom_tip",item)
            // if(bottomTip){
            //     bottomTip.active = (kIdx == this._listData.length-1)
            // }
            //
            // //喜爱游戏的表现
            // let fav_bg = cc.find('sp_fav_bg',item)
            // let fav_title = cc.find('spine_fav',item)
            // if(bFav){
            //
            //     if(fav_title){
            //         fav_title.active = true
            //     }
            //     else{
            //         //异步加载
            //         let loadCall = function(loadData){
            //             if(cc.isValid(item)){
            //                 let node = cc.instantiate(loadData)
            //                 node.active = true
            //                 node.name = 'spine_fav'
            //                 node.parent = item
            //
            //             }
            //         }
            //         let url = "CashHero/prefab/pageslot/spine_fav"
            //         this._loadPrefab(url,loadCall)
            //     }
            //
            //     if(fav_bg){
            //         fav_bg.active = true
            //     }
            //     else{
            //         //异步加载
            //         let loadCall = function(loadData){
            //             if(cc.isValid(item)){
            //                 let node = cc.instantiate(loadData)
            //                 node.active = true
            //                 node.name = 'sp_fav_bg'
            //                 node.parent = item
            //                 node.setSiblingIndex(item1Slidx-1)
            //             }
            //         }
            //         let url = "CashHero/prefab/pageslot/sp_fav_bg"
            //         this._loadPrefab(url,loadCall)
            //     }
            //
            //     for(let i = 0; i < itemData.length; i++){
            //
            //         let iteminner = cc.find('slots_item'+(i+1),item)
            //         cc.find('mid_content/jp_grand',iteminner).active = false
            //
            //     }
            //
            // }
            // else{
            //     if(fav_title){
            //         fav_title.active = false
            //     }
            //
            //     if(fav_bg){
            //         fav_bg.active = false
            //     }
            //
            // }
        }
        else {

        }

    },

    // GetSlots:function(){
    //     let list = cc.vv.UserManager.slotsList;
    //
    //     // let list = {2:[
    //     //         {"ord":326,"status":1,"jp":[5,11,53,191],"level":0,"id":691,"tag":0},
    //     //         {"ord":342,"status":1,"jp":[9,20,211,2156],"level":0,"id":692,"tag":0},
    //     //         {"ord":354,"status":1,"jp":[11,30,108,922],"level":0,"id":693,"tag":0},
    //     //         {"ord":346,"status":1,"jp":[10,53,512,2000],"level":0,"id":694,"tag":0},
    //     //         {"ord":344,"status":1,"jp":[5,22,94,512],"level":0,"id":695,"tag":0},
    //     //         {"ord":356,"status":1,"jp":[5,10,15,20,33,47,107,140,192,275,508],"level":0,"id":696,"tag":0},
    //     //     ]}
    //
    //     let k = 2 //slot类型
    //     let gameList = [];
    //     // let preleader = false
    //     for (let j = 0; j < list[k].length; ++j) {
    //         if (itemsListCfg[list[k][j].id]) {
    //             gameList.push(list[k][j]);
    //         }
    //     }
    //     //         if ( cc.vv.HerocardManager.isLeader(list[k][j].id)){
    //     //            //首领单独插一条
    //     //             let group = []
    //     //             group.push(list[k][j])
    //     //             gameList.push(group)
    //     //             preleader = true
    //     //         } else {
    //     //             //非首领两个游戏一条
    //     //             if (!preleader && gameList.length > 0 && gameList[gameList.length-1].length < 2) {
    //     //                 let group = gameList[gameList.length-1]
    //     //                 group.push(list[k][j])
    //     //             } else {
    //     //                 let group = []
    //     //                 group.push(list[k][j])
    //     //                 gameList.push(group)
    //     //             }
    //     //             preleader = false
    //     //         }
    //     //     }
    //     // }
    //     // //在5，6的位置插入广告条
    //     // let adGroup = []
    //     // adGroup.push({id:GAME_ID.SLOT_COMESOON+1})
    //     // adGroup.push({id:GAME_ID.SLOT_COMESOON+1})
    //     // gameList.splice(2,0,adGroup)
    //     //
    //     // //如果有喜爱添加到9，10的位置
    //     // let favList = cc.vv.UserManager.getFavourList()
    //     // if(favList && favList.length>0){
    //     //     let group = []
    //     //     for(let i = 0; i < 2; i++){
    //     //         let favId = favList[i]
    //     //         if(favId){
    //     //             let game = cc.vv.UserManager.getGameListById(favId)
    //     //             if(game){
    //     //                 group.push(game)
    //     //             }
    //     //             else{
    //     //                 group.push({id:GAME_ID.SLOT_COMESOON})
    //     //             }
    //     //
    //     //         }
    //     //         else{
    //     //             //不足2个
    //     //             group.push({id:GAME_ID.SLOT_COMESOON})
    //     //         }
    //     //
    //     //
    //     //     }
    //     //     if(group.length > 0){
    //     //         gameList.splice(4,0,group)
    //     //     }
    //     //
    //     // }
    //
    //
    //     return gameList
    // },

    // onEventScrollGame:function(data){
    //     let val = data.detail
    //     this.scrollToGame(val)
    // },

    _loadPrefab: function (url, callbacks) {
        cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
            if (!err) {
                callbacks(prefab)
            }
            else {
                AppLog.err('未找到资源:' + url)
            }
        });
    },

    // onScrollingEvent:function(){
    //     let curOff = this.listview.node.getComponent(cc.ScrollView).getScrollOffset().y
    //     if(curOff> this._maxOffsetY){
    //         curOff = this._maxOffsetY
    //     }
    //     if(curOff<0){
    //         curOff=0
    //     }
    //     let difY = curOff-this._lastoffsetY
    //     if(difY>0){
    //         if(this._movedir == -1){
    //             //换方向了

    //             this._beginoffsetY = this._lastoffsetY
    //         }
    //         this._movedir = 1
    //         if(Math.abs(curOff - this._beginoffsetY)>30 ){
    //             //上
    //             cc.log("up")
    //             Global.dispatchEvent(EventId.HALL_SLOT_SCROLL,{dir:1})
    //             this._beginoffsetY = curOff
    //         }

    //     }
    //     else if(difY < 0){
    //         if(this._movedir == 1){
    //             //换方向了

    //             this._beginoffsetY = this._lastoffsetY
    //         }
    //         this._movedir = -1
    //         if(Math.abs(curOff - this._beginoffsetY)>30){
    //             //下
    //             cc.log("down")
    //             Global.dispatchEvent(EventId.HALL_SLOT_SCROLL,{dir:-1})
    //             this._beginoffsetY = curOff
    //         }

    //     }
    //     this._lastoffsetY = curOff
    // },

    // onScrollBegan:function(){
    //     this._beginoffsetY = this.listview.node.getComponent(cc.ScrollView).getScrollOffset().y
    //     this._maxOffsetY = this.listview.node.getComponent(cc.ScrollView).getMaxScrollOffset().y
    //     if(this._beginoffsetY> this._maxOffsetY){
    //         this._beginoffsetY = this._maxOffsetY
    //     }
    //     this._lastoffsetY = this._beginoffsetY
    //     this._movedir = null
    // },

    // //记录列表位置
    // setCurScroff:function(){
    //     let lst = cc.find('slot_lists',this.node);
    //     let off = lst.getComponent(cc.ScrollView).getScrollOffset();
    //     cc.vv.UserManager.setHallOffset(off);
    // },

    onEnterGame(data) {
        let gameId = data.detail;

        // this.setCurScroff()

        //删除下载列表中的
        cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._delCheckNeedDown(gameId)

        cc.vv.GameManager.EnterGame(gameId)
    },

    //游戏列表更新
    GAME_LIST_UPDATE:function(){
        this.ShowSlots()
    }

    // update (dt) {},
});
