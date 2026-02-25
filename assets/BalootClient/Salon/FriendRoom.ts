import LeftMenuCpt from "../../_FWExpand/UI/LeftMenuCpt";
import CafeMenuSetting from "./script/CafeMenuSetting";
import { FriendRoomCreate } from "./script/FriendRoomCreate";
import FriendRoomItem from "./script/FriendRoomItem";

const { ccclass, property } = cc._decorator;
/**
 * 匹配控制
 */
@ccclass
export class FriendRoom extends cc.Component {

    @property(LeftMenuCpt)
    leftMenuCpt: LeftMenuCpt = null;

    @property(cc.Node)
    oprNode: cc.Node = null;
    // @property(cc.Button)
    // btn_refresh: cc.Button = null;
    @property(cc.Button)
    btn_create_public: cc.Button = null;
    @property(cc.Button)
    btn_create_private: cc.Button = null;
    @property(cc.Button)
    btn_join: cc.Button = null;
    @property(cc.Button)
    btn_inputRoomid: cc.Button = null;
    @property(cc.Button)
    btn_income: cc.Button = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Node)
    noDataNode: cc.Node = null;
    @property(cc.Prefab)
    createPrefab: cc.Prefab = null;
    @property(cc.Node)
    menuListNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    textureAtlas: cc.SpriteAtlas = null;
    @property(cc.Button)
    menuSetBtn: cc.Button = null;
    @property(cc.Prefab)
    gameSelectPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    incomePrefab: cc.Prefab = null;

    private menuListView: any;
    private listData;
    private allData;
    private menuDataList: { gameid: number; salonImg: string; title: string; }[];
    private roomListView: any;
    private selectGameIds: number[];
    private fixGameIds: number[];
    private incomeData: any;
    private loading: boolean;
    private netListener: any;
    private eventListener: any;
    private shopInfo: any;
    private _waitgameId:any;
    

    private _collectNode: cc.Node = null;
    get gameid() {
        if (this.menuDataList.length <= 0) {
            return -1;
        }
        let selectId = this.menuListView.selectedId || 0;
        return this.menuDataList[selectId] && this.menuDataList[selectId].gameid;
    }
    set gameid(value) {
        // 设置菜单的选中
        for (let i = 0; i < this.menuDataList.length; i++) {
            const menuData: any = this.menuDataList[i];
            if (menuData.gameid == value) {
                this.menuListView.selectedId = i;
                break;
            }
        }
    }

    onLoad() {
        this.leftMenuCpt.setCallback((isShow) => {
            if (isShow) {
                StatisticsMgr.reqReport(ReportConfig.SALONG_MENU_SWITCH_OPEN);
            } else {
                StatisticsMgr.reqReport(ReportConfig.SALONG_MENU_SWITCH_CLOSE);
            }
        })
        this.menuListView = this.menuListNode.getComponent("ListView");
        this.roomListView = this.scrollView.getComponent("ListView")
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");
        // 创建公开房间
        this.btn_create_public.node.on("click", this.onCreateRoom.bind(this, false, false), this);
        // 创建密码房
        this.btn_create_private.node.on("click", this.onCreateRoom.bind(this, false, true), this);
        // 刷新按钮
        this.btn_inputRoomid.node.on("click", this.onClickInputRoomId, this);
        // 快速开始
        this.btn_join.node.on("click", this.onQuickStart, this);
        // 点击收益
        // this.btn_income.node.on("click", this.onClickInCome, this);
        // 配置菜单
        this.menuSetBtn.node.on("click", this.onMenuSet, this);
        // 体验沙龙按钮
        // cc.find("hint_node/btn_free", this.oprNode).on("click", this.onClickTestSalon, this);

        cc.find("income_node/btn_collect", this.oprNode).on("click", this.onClickCollectSalon, this);

        this.noDataNode.active = false;

        Global.registerEvent("checkSubFinish", this.downloadingFinish, this);

        //提审显示
        this.checkReviewShow()
    }
    protected onDestroy(): void {
        cc.vv.NetManager.send({ c: MsgId.EXIT_MODULE, gameid: this.gameid }, true);
    }

    protected onEnable(): void {
        // 固定显示的
        this.fixGameIds = [];
        // 被选中的
        let selectGameIds = cc.vv.UserManager.fgamelist;
        // 组合成所有选中的
        let tempList = this.fixGameIds.concat(selectGameIds);
        // 请求房间列表
        this.netListener.registerMsg(MsgId.VIP_ROOM_LIST, this.VIP_ROOM_LIST, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_JOIN, this.FRIEND_ROOM_JOIN, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_CREATE, this.FRIEND_ROOM_CREATE, this, false);
        // this.netListener.registerMsg(MsgId.VIP_FAST_JOIN, this.VIP_FAST_JOIN, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_DISSOLVE, this.FRIEND_ROOM_DISSOLVE, this, false);
        this.netListener.registerMsg(MsgId.SALON_GET_TEST, this.SALON_GET_TEST, this, false);
        this.netListener.registerMsg(MsgId.SALON_GET_INCOME, this.SALON_GET_INCOME, this, false);
        this.netListener.registerMsg(MsgId.REQ_BUY_SKIN_SHOP_ITEM, this.REQ_BUY_SKIN_SHOP_ITEM, this);
        // 创建房间成功够 菜单进变换
        // this.eventListener.registerEvent("EVENT_FRIEND_CREATE_ROOM", (event) => {
        //     this.gameid = event.detail;
        // }, this)
        // 加入房间事件
        this.eventListener.registerEvent("EVENT_FRIEND_JOIN_ROOM", (event) => {
            if(!this.checkEnterVip()){ //是否到达准入条件
                return
            }
            
            let data = event.detail;
            let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(data.gameid)
            let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(data.gameid)
            if(cc.sys.isBrowser ||  bNew || bInnerGame){
                if (this.loading) return;
                this.loading = true;
                // 请求加入房间
                cc.vv.NetManager.send({
                    c: MsgId.FRIEND_ROOM_JOIN,
                    deskid: data.deskid,
                    gameid: data.gameid,
                }, true);
            }
            else{
                //提示更新
                let tips = cc.js.formatStr('You need to download the latest resources of 【%s】 first',cc.vv.UserConfig.getGameName(data.gameid))
                cc.vv.AlertView.show(tips,()=>{
                    this._waitgameId = data.gameid
                    cc.vv.SubGameUpdateNode.emit("check_subgame", data.gameid);
                    cc.vv.FloatTip.show("start download")
                },()=>{

                })
            }
            
        }, this)

        this.eventListener.registerEvent("USER_INFO_CHANGE", () => {
            this.updateOprView();
        }, this);

        // 更新菜单
        this.updateMenuView(tempList, 10000);
        this.unschedule(this.sendReq);
        this.schedule(this.sendReq, 10);
        // 请求数据
        this.sendReq();
    }
    protected onDisable(): void {
        this.unschedule(this.sendReq);
        this.eventListener.clear()
        this.netListener.clear()
    }

    start() {
    }

    // 获取VIP房间列表
    VIP_ROOM_LIST(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        // // 组装散桌
        // let commonList = [];
        // for (let i = 0; i < msg.data.length; i += 2) {
        //     const temp = msg.data[i];
        //     const temp2 = msg.data[i + 1];
        //     temp.next = temp2;
        //     commonList.push(temp);
        // }
        this.allData = msg.super//.concat(commonList);

        // 加入自己沙龙信息
        let limitRoomCnt = cc.vv.UserManager.viproomcnt[cc.vv.UserManager.svip];
        let rooms = [];
        // let vipNeedConfig = [-1, 0, 1, 6, 9, 12, 12, 12];
        for (let i = 0; i < 8; i++) {
            if (msg.selfrooms[i]) {
                rooms.push({ vip: this.getRoomOpenVip(i+1), status: 1, data: msg.selfrooms[i] }); //激活已开启的房间
            } else {
                // 判断房间是否激活
                if (i < limitRoomCnt) {
                    rooms.push({ vip: this.getRoomOpenVip(i+1), status: 2, data: null });  //激活未开启
                } else {
                    rooms.push({ vip: this.getRoomOpenVip(i+1), status: 0, data: null });  //未激活
                }
            }
        }
        this.allData.unshift({
            isSelf: true,
            rooms: rooms,
        });
        this.incomeData = msg.income;
        this.shopInfo = msg.shop;

        this.updateListData();
        this.updateView();
    }

    updateListData(){
        let gameid = this.gameid;
        this.listData = [];
        if(gameid == 10000){
            this.listData = Global.copy(this.allData);
        } else if(gameid == 9999) {
            this.listData = [this.allData[0]];
        } else {
            this.allData.forEach(pD=>{
                if(pD.isSelf){
                    this.listData.push(pD)
                } else {
                    let d2 = pD.filter(rD=>{return rD.gameid == gameid});
                    if(d2.length > 0){
                        this.listData.push(d2)
                    }
                }
            })
        }
    }

    getRoomOpenVip(roomIdx){
        let val
        let roomvip = cc.vv.UserManager.viproomcnt
        for(let i = 0; i <roomvip.length; i++){
            if(roomIdx <= roomvip[i]){
                val = i
                break;
            }
        }
        return val
    }

    // 房间创建成功
    FRIEND_ROOM_CREATE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        // 判断创建的房间gameid 是否在菜单被选中
        // if (this.selectGameIds.indexOf(msg.deskinfo.gameid) < 0) {
        //     // 通知服务器更新菜单
        //     this.selectGameIds.push(msg.deskinfo.gameid)
        //     cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, fgamelist: this.selectGameIds });
        //     this.updateMenuView(this.selectGameIds, msg.deskinfo.gameid);
        // } else {
        //     this.gameid = msg.deskinfo.gameid;
        // }
        cc.vv.FloatTip.show(___("创建房间成功"));
        // 请求更新列表
        this.sendReq();
    }
    // 快速开始结果
    // VIP_FAST_JOIN(msg) {
    //     if (msg.code != 200) return;
    //     if (msg.spcode && msg.spcode > 0) {
    //         cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
    //         return;
    //     }
    // }
    // 加入房间结果
    FRIEND_ROOM_JOIN(msg) {
        this.loading = false;
    }
    // 解散房间结果
    FRIEND_ROOM_DISSOLVE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        this.sendReq();
    }
    // 领取沙龙体验卡结果
    SALON_GET_TEST(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // 提示领取成功
        cc.vv.FloatTip.show(___("领取成功"));
    }
    // 领取沙龙收益结果
    SALON_GET_INCOME(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        if(this._collectNode){
            Global.RewardFly(msg.rewards,this._collectNode.convertToWorldSpaceAR(cc.v2(0, 0)))
        } else {
            // 飞金币
            Global.RewardFly(msg.rewards, cc.find("income_node/btn_collect", this.oprNode).convertToWorldSpaceAR(cc.v2(0, 0)));
        }
        this.sendReq();
    }
    // 购买结果
    REQ_BUY_SKIN_SHOP_ITEM(msg) {
        this.loading = false;
        if (msg.code != 200) return;
        if (msg.spcode == 2) {
            cc.vv.FloatTip.show(___("金币不足"));
            return;
        }
        this.sendReq();
    }
    // 更新界面
    updateView() {
        this.noDataNode.active = this.listData.length <= 0;
        this.roomListView.numItems = this.listData.length;
        this.updateOprView();
    }
    // 更新操作界面
    updateOprView() {
        // 更新创建按钮文字
        // let limitRoomCnt = cc.vv.UserManager.viproomcnt[cc.vv.UserManager.svip];
        // cc.find("btn_create_public/Label", this.oprNode).getComponent(cc.Label).string = ___("公开房 {1}/{2}", cc.vv.UserManager.roomcnt, limitRoomCnt);
        // cc.find("btn_create_private/Label", this.oprNode).getComponent(cc.Label).string = ___("私人房 {1}/{2}", cc.vv.UserManager.roomcnt, limitRoomCnt);
        // cc.find("btn_create_public/Label", this.oprNode).getComponent(cc.Label).string = ___("公开房");
        // cc.find("btn_create_private/Label", this.oprNode).getComponent(cc.Label).string = ___("密码房");
        // let roomLabel = cc.find("room/value", this.oprNode).getComponent(cc.Label);
        // roomLabel.string = cc.vv.UserManager.roomcnt + "/" + limitRoomCnt;
        // 判断是否拥有道具
        // if (!!cc.vv.UserManager.salonskin) {
        //     cc.find("income_node", this.oprNode).active = true;
        //     cc.find("hint_node", this.oprNode).active = false;

        //     cc.find("income_node/income/value", this.oprNode).getComponent(cc.Label).string = Global.formatNumber(this.incomeData.coin, { threshold: 10000 });
        //     // 处于体检卡阶段
        //     if (cc.vv.UserManager.salontesttime && cc.vv.UserManager.salontesttime > new Date().getTime() / 1000) {
        //         cc.find("income_node/time_info", this.oprNode).active = true;
        //         cc.find("income_node/time_info/value", this.oprNode).getComponent(cc.Label).string = Global.formatTime("yyyy/MM/dd", cc.vv.UserManager.salontesttime || 0);
        //     } else {
        //         cc.find("income_node/time_info", this.oprNode).active = false;
        //     }
        // } else {
        //     cc.find("income_node", this.oprNode).active = false;
        //     cc.find("hint_node", this.oprNode).active = true;
        //     if (cc.vv.UserManager.salontesttime && cc.vv.UserManager.salontesttime > 0) {
        //         // 过期
        //         cc.find("hint_node/btn_free", this.oprNode).active = false;
        //         cc.find("hint_node/btn_buy", this.oprNode).active = true;
        //         cc.find("hint_node/layout/add", this.oprNode).active = false;
        //         cc.find("hint_node/layout/room", this.oprNode).active = false;
        //     } else {
        //         // 没有领取过沙龙体验卡
        //         cc.find("hint_node/btn_free", this.oprNode).active = true;
        //         cc.find("hint_node/btn_buy", this.oprNode).active = false;
        //         cc.find("hint_node/layout/add", this.oprNode).active = true;
        //         cc.find("hint_node/layout/room", this.oprNode).active = true;
        //     }
        // }
    }
    // 刷新列表Item
    onUpdateItem(item: cc.Node, index: number) {
        let data = this.listData[index];

        item.height = data.isSelf ? 590 : 540;
        cc.find("bg", item).height = data.isSelf ? 555 : 505;
        // 刷新房间
        let contentNode = cc.find("content", item);
        for (let i = 0; i < contentNode.childrenCount; i++) {
            let node = contentNode.children[i];
            cc.find("desk", node).active = false;
            cc.find("lock", node).active = false;
            cc.find("add", node).active = false;
            if(data.isSelf){
                let tempData = data.rooms[i];
                if (tempData.status == 1) {
                    // 已经开启的房间
                    cc.find("desk", node).active = true;
                    cc.find("desk", node).getComponent(FriendRoomItem).updateView(tempData.data);
                } else if (tempData.status == 2) {
                    cc.find("add", node).active = true;
                    // 未开启的房间
                } else if (tempData.status == 0) {
                    cc.find("lock", node).active = true;
                    cc.find("lock/vipneed", node).getComponent(cc.Label).string = "VIP" + (tempData.vip == 0 ? "" : tempData.vip);
                }
            } else {
                let itemData = data[i];
                if (!!itemData) {
                    cc.find("desk", node).active = true;
                    cc.find("desk", node).getComponent(FriendRoomItem).updateView(itemData);
                } else {
                }
            }
        }

        cc.find("income_self",item).active = data.isSelf;
        cc.find("income_other",item).active = !data.isSelf;
        if(data.isSelf){
            // 刷新收益
            cc.find("income_self/coin/value", item).getComponent(cc.Label).string = Global.formatNumber(this.incomeData.coin, { threshold: 10000 });
            // 显示头像
            cc.find("income_self/node_head", item).getComponent("HeadCmp").setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon);
            cc.find("income_self/node_head", item).getComponent("HeadCmp").setAvatarFrame(cc.vv.UserManager.avatarframe);
        } else {
            // 设置房主信息
            let userInfo = data[0] && data[0].onwer_info;
            cc.find("income_other/node_head", item).getComponent("HeadCmp").setHead(userInfo.uid, userInfo.avatar || userInfo.usericon);
            cc.find("income_other/node_head", item).getComponent("HeadCmp").setAvatarFrame(userInfo.avatarframe);
            cc.find("income_other/name", item).getComponent(cc.Label).string = userInfo.playername;
        }

        cc.find("btn_rule",item).active = data.isSelf;


        // // 散桌
        // cc.find("cafe", item).active = false;
        // // cc.find("desk", item).active = false;
        // cc.find("salon", item).active = false;
        // if (data.isSelf) {
        //     cc.find("salon", item).active = true;
        //     // 判断是否开启沙龙道具
        //     // cc.find("salon/hint", item).active = false;
        //     cc.find("salon/income", item).active = false;
        //     cc.find("salon/content", item).active = false;
        //     if (!!cc.vv.UserManager.salonskin) {
        //         // 已经开启
        //         cc.find("salon/income", item).active = true;
        //         cc.find("salon/content", item).active = true;
        //         // 刷新收益
        //         cc.find("salon/income/coin/value", item).getComponent(cc.Label).string = Global.formatNumber(this.incomeData.coin, { threshold: 10000 });
        //         // 显示头像
        //         cc.find("salon/income/node_head", item).getComponent("HeadCmp").setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon);
        //         cc.find("salon/income/node_head", item).getComponent("HeadCmp").setAvatarFrame(cc.vv.UserManager.avatarframe);
        //         // 刷新房间
        //         let contentNode = cc.find("salon/content", item);
        //         for (let i = contentNode.childrenCount; i < 8; i++) {
        //             let node = cc.instantiate(contentNode.children[0]);
        //             node.parent = contentNode;
        //         }
        //         for (let i = 0; i < contentNode.childrenCount; i++) {
        //             let node = contentNode.children[i];
        //             cc.find("desk", node).active = false;
        //             cc.find("lock", node).active = false;
        //             cc.find("add", node).active = false;
        //             let tempData = data.rooms[i];
        //             if (tempData.status == 1) {
        //                 // 已经开启的房间
        //                 cc.find("desk", node).active = true;
        //                 cc.find("desk", node).getComponent(FriendRoomItem).updateView(tempData.data);
        //             } else if (tempData.status == 2) {
        //                 cc.find("add", node).active = true;
        //                 // 未开启的房间
        //             } else if (tempData.status == 0) {
        //                 cc.find("lock", node).active = true;
        //                 cc.find("lock/vipneed", node).getComponent(cc.Label).string = "VIP" + (tempData.vip == 0 ? "" : tempData.vip);
        //             }
        //         }
        //     } else {
        //         // 没有开启
        //         // cc.find("salon/hint", item).active = true;
        //         // cc.find("salon/hint/btn_play/layout/value", item).getComponent(cc.Label).string = Global.formatNumber(this.shopInfo.coin, { threshold: 10000 });
        //     }
        // }
        // else if (data instanceof Array) {
        //     // 沙龙数据
        //     cc.find("cafe", item).active = true;
        //     let cafeContentNode = cc.find("cafe/content", item);
        //     for (let i = 0; i < cafeContentNode.children.length; i++) {
        //         const itemNode = cafeContentNode.children[i];
        //         let itemData = data[i];
        //         if (!!itemData) {
        //             itemNode.active = true;
        //             itemNode.getComponent(FriendRoomItem).updateView(itemData);
        //         } else {
        //             itemNode.active = false;
        //         }
        //     }
        //     // 设置房主信息
        //     let userInfo = data[0] && data[0].onwer_info;
        //     cc.find("cafe/bg/node_head", item).getComponent("HeadCmp").setHead(userInfo.uid, userInfo.avatar || userInfo.usericon);
        //     cc.find("cafe/bg/node_head", item).getComponent("HeadCmp").setAvatarFrame(userInfo.avatarframe);
        //     cc.find("cafe/bg/name", item).getComponent(cc.Label).string = userInfo.playername;
        //     if (userInfo.uid == cc.vv.UserManager.uid) {
        //         cc.find("cafe/info", item).active = true;
        //         cc.find("cafe/bg", item).height = 575;
        //         item.height = 575;
        //         cc.find("cafe/info/round/value", item).getComponent(cc.Label).string = Global.FormatNumToComma(Math.floor(this.incomeData.round));
        //         cc.find("cafe/info/income/value", item).getComponent(cc.Label).string = Global.FormatNumToComma(Math.floor(this.incomeData.coin));
        //     } else {
        //         cc.find("cafe/info", item).active = false;
        //         cc.find("cafe/bg", item).height = 505;
        //         item.height = 505;
        //     }
        // } else {
        //     // // 散桌
        //     // cc.find("desk", item).active = true;
        //     // let deskNode = cc.find("desk", item);
        //     // let dataList = [data].concat(data.next);
        //     // for (let i = 0; i < deskNode.children.length; i++) {
        //     //     const itemNode = deskNode.children[i];
        //     //     let itemData = dataList[i];
        //     //     if (!!itemData) {
        //     //         itemNode.active = true;
        //     //         itemNode.getComponent(FriendRoomItem).updateView(itemData);
        //     //     } else {
        //     //         itemNode.active = false;
        //     //     }
        //     // }
        //     // item.height = 400;
        // }
    }
    // 点击创建房间
    onCreateRoom(isAutoJoin = false, isPrivate = false) {
        if(!this.checkEnterVip()){ //是否到达准入条件
            return
        }


        cc.vv.PopupManager.addPopup(this.createPrefab, {
            opacityIn: true,
            onShow: (node: cc.Node) => {
                let cpt = node.getComponent(FriendRoomCreate);
                if (cpt) {
                    cpt.onInit(this.gameid, isAutoJoin, isPrivate);
                    if (isPrivate) {
                        StatisticsMgr.reqReport(ReportConfig.SALONG_CREATE_PRIVATE);
                    } else {
                        StatisticsMgr.reqReport(ReportConfig.SALONG_CREATE_PUBLIC);
                    }
                }
            }
        });
    }
    // 点击快速开始
    onQuickStart() {
        if(!this.checkEnterVip()){ //是否到达准入条件
            return
        }

        let gameid = this.gameid;
        if (gameid == 10000 || gameid == 9999) {

            if(this.allData.length > 0){
                let selfRInfo = this.allData[0].rooms.find((rD) => {
                    return rD.data && rD.data.gameid && (rD.data.maxSeat > rD.data.users.length)
                });

                if(selfRInfo){
                    gameid = selfRInfo.data.gameid;
                } else {
                    for (let i = 1; i < this.allData.length; i++) {
                        let rInfo = this.allData[i].find((rD) => {
                            return rD.maxSeat > rD.users.length;
                        });
                        if(rInfo){
                            gameid = rInfo.gameid;
                            break;
                        }
                    }
                }
            }
            // gameid = undefined;
        } else {
            // 自己和别人都没有这种gameid的房间，找一个自己的其他gameid的房间
            let selfRInfo = this.allData[0].rooms.find((rD) => {
                return rD.data && rD.data.gameid == gameid && (rD.data.maxSeat > rD.data.users.length)
            });
            let otherRInfo;
            for (let i = 1; i < this.allData.length; i++) {
                let rInfo = this.allData[i].find((rD) => {
                    return rD.gameid == gameid && (rD.maxSeat > rD.users.length);
                });
                if(rInfo){
                    otherRInfo = rInfo;
                    break;
                }
            }

            if(!selfRInfo && !otherRInfo){
                let selfRInfo2 = this.allData[0].rooms.find((rD) => {
                    return rD.data && rD.data.gameid && (rD.data.maxSeat > rD.data.users.length)
                });
                if(selfRInfo2){
                    gameid = selfRInfo2.data.gameid;
                }
            }
        }

        if(!gameid || gameid == 10000 || gameid == 9999){
            cc.vv.FloatTip.show(___("没有可以参加的房间"), true);
            return
        }
        let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameid)
        let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(gameid)
        if(cc.sys.isBrowser || bNew || bInnerGame){
            cc.vv.NetManager.send({ c: MsgId.VIP_FAST_JOIN, gameid: gameid});
        }
        else{
            //提示更新
            if(gameid){
                let tips = cc.js.formatStr('You need to download the latest resources of 【%s】 first',cc.vv.UserConfig.getGameName(gameid))
                cc.vv.AlertView.show(tips,()=>{
                    this._waitgameId = gameid
                    cc.vv.SubGameUpdateNode.emit("check_subgame", gameid);
                    cc.vv.FloatTip.show("start download")
                },()=>{

                })
            }
        }
    }
    // 点击收益
    onClickInCome() {
        // 判断是否购买了沙龙道具
        if (!!cc.vv.UserManager.salonskin) {
            cc.vv.PopupManager.addPopup(this.incomePrefab, { opacityIn: true });
        } else {
            // 跳转商城
            cc.vv.FloatTip.show(___("需要购买沙龙道具"));
            cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 4 });
        }
    }
    // 体验沙龙按钮
    onClickTestSalon() {
        cc.vv.NetManager.send({ c: MsgId.SALON_GET_TEST });
    }
    // 搜集沙龙奖励
    onClickCollectSalon(event) {
        // 判断是否有收益
        if (this.incomeData.coin > 0) {
            this._collectNode = event.target
            cc.vv.NetManager.send({ c: MsgId.SALON_GET_INCOME });
        } else {
            // 提示
            cc.vv.FloatTip.show(___("Invite friends to join the room to get rewards"));
        }
    }

    onClickItemAddRoom(event) {
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        this.onCreateRoom();
    }
    onClickItemLock(event) {
        // 去充值VIP
        cc.vv.FloatTip.show(___("需要提升VIP"));
        cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 2 });
    }
    onClickBuySalon(event) {
        // cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 4 });
        cc.vv.NetManager.send({ c: MsgId.REQ_BUY_SKIN_SHOP_ITEM, id: this.shopInfo.id });
    }

    // 刷新列表Item
    onUpdateMenuItem(item: cc.Node, index: number) {
        let data = this.menuDataList[index];
        cc.vv.UserConfig.setGameCafeFrame(cc.find("icon", item).getComponent(cc.Sprite), data.gameid);
        cc.find("name", item).getComponent(cc.Label).string = data.title;

        cc.find("headNode", item).active = data.gameid == 9999
        cc.find("headNode", item).getComponentInChildren("HeadCmp").setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon);
        cc.find("headNode", item).getComponentInChildren("HeadCmp").setAvatarFrame(cc.vv.UserManager.avatarframe);
        if (data.gameid == 10000) {
        } else if (data.gameid == 9999) {
            item.getComponentInChildren("RedHitCmp").key = "fall";
            item.getComponentInChildren("RedHitCmp").updateView();
        } else {
            item.getComponentInChildren("RedHitCmp").key = "f" + data.gameid;
            item.getComponentInChildren("RedHitCmp").updateView();
        }

    }
    // 选择游戏类型
    onSelectMenuItem(item: cc.Node, index: number, lastIndex: number) {
        let data = this.menuDataList[index];
        this.gameid = data.gameid;
        StatisticsMgr.reqReport(ReportConfig.SALONG_SELECT_GAME_TAB, data.gameid);

        this.updateListData();
        this.updateView();
        // this.sendReq();
    }
    // 设置游戏类型
    onMenuSet() {
        cc.vv.PopupManager.addPopup(this.gameSelectPrefab, {
            noTouchClose: true,
            onShow: (node: cc.Node) => {
                // 所有游戏 出去pin之外的 提供给玩家选择
                let unPinGameIds = cc.vv.UserConfig.getUnPinGameIds(this.fixGameIds);
                node.getComponent(CafeMenuSetting).onInit(unPinGameIds, this.selectGameIds);
            },
            onClose: (node: cc.Node) => {
                // 更新菜单
                let tempGameIds = node.getComponent(CafeMenuSetting).getSelectGameIds();
                // 通知服务器更新菜单
                cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, fgamelist: tempGameIds });
                // 组合成菜单配置进行更新
                let selectGameIds = this.fixGameIds.concat(tempGameIds);
                // 更新菜单
                this.updateMenuView(selectGameIds);
                this.sendReq();
            }
        });
    }
    // 更新菜单
    updateMenuView(gameids, curGameId = -1) {
        // 缓存
        this.selectGameIds = gameids;
        // 过滤已开放游戏
        this.selectGameIds = this.selectGameIds.filter((gameid) => {
            for (const data of cc.vv.UserManager.gameList) {
                if (data.id == gameid) return true;
            }
            return false;
        });
        // 更新数据
        this.menuDataList = cc.vv.UserConfig.getCafeMenuConfig(this.selectGameIds);
        this.menuDataList.unshift({ gameid: 9999, salonImg: "icon_cafe_9999", get title() { return cc.vv.UserManager.nickName } },)
        this.menuDataList.unshift({ gameid: 10000, salonImg: "icon_cafe_10000", get title() { return ___("ALL") } },)
        // 更新列表显示
        this.menuListView.numItems = this.menuDataList.length;
        let lastGameid = -1;
        let defaultGameid = -1;
        for (const item of this.menuDataList) {
            if (item.gameid == this.gameid) {
                lastGameid = item.gameid;
            }
            if (item.gameid == curGameId) {
                defaultGameid = item.gameid;
            }
        }
        if (defaultGameid > 0) {
            this.gameid = defaultGameid;
        } else if (lastGameid < 0) {
            this.gameid = this.menuDataList[0].gameid;
        }
    }
    // 发送请求
    sendReq() {
        // if (this.gameid == 10000) {
            cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_ROOM_LIST })
        // } else if (this.gameid == 9999) {
        //     cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_ROOM_LIST, sort: 3 })
        // } else {
        //     cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_ROOM_LIST, gameid: this.gameid })
        // }
    }

    downloadingFinish(data){
        if(cc.isValid(this.node)){
            let gameid = data.detail
            if(this._waitgameId && gameid == this._waitgameId){
                
                //下载完成表现
                cc.vv.FloatTip.show('Download Success!')

                this._waitgameId = null
            }
        }
    }
    

    checkEnterVip(){
        let needVip = cc.vv.UserManager.getSalonVip()
        if(needVip > cc.vv.UserManager.svip){
            //调往充值
            let tipsmsg = cc.js.formatStr("Upgrade your VIP level to VIP%s to enjoy the Salon", needVip)
            cc.vv.AlertView.show(___(tipsmsg), () => {
                Global.dispatchEvent("OpenCharge")
            }, () => {

            }, false, null, null, null, "Upgrade Now");
            return false //不可以进入
        }
        else{
            return true
        }
    }

    onClickInputRoomId(){
        if(!this.checkEnterVip()){ //是否到达准入条件
            return
        }
        cc.vv.PopupManager.addPopup("BalootClient/salon/RoomFriendJoin", {
            opacityIn: true,
        });
    }

    checkReviewShow(){
        let objTitle = cc.find("panel/biaoti",this.node)
        objTitle.active = !Global.isIOSAndroidReview()

        let leftMenu = cc.find("LeftMenu",this.node)
        leftMenu.active = !Global.isIOSAndroidReview()

    }


}