import { PBFlowState } from "./PBCommonData";
import { facade } from "./PBLogic";

const { ccclass, property } = cc._decorator;

/**
 * 通用代理类管理一些 大厅等模块功能的处理
 */

@ccclass
export class PBCommonProxy extends cc.Component {
    _shop: cc.Node = null;
    onLoad() {

    }

    protected start(): void {
        this._initEventListener();
        this.scheduleOnce(() => {
            this._preLoadShop();
        })

    }

    /**
     * 初始化事件监听
     */
    _initEventListener() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("EVENT_GLOBAL_CHAT_JOIN_TABLE", this.EVENT_GLOBAL_CHAT_JOIN_TABLE, this);
        eventListener.registerEvent("EVENT_FLOW_STATE_CHANGE", this.EVENT_FLOW_STATE_CHANGE, this);
    }

    ////////////////////////// 商城处理 ////////////////////////////////
    async _preLoadShop() {
        // cc.loader.loadRes("BalootClient/SkinShop/SkinShop", cc.Prefab, (err, prefab)=>{
        //     if(!err) {
        //         let node = cc.instantiate(prefab);
        //         node.parent = cc.find("Canvas");
        //         node.active = false;
        //         this._shop = node;
        //     }
        // })
    }
    /**
     * 打开商城
     */
    openShop() {
        // if(this._shop) {
        //     this._shop.active = true;
        // }

        cc.vv.PopupManager.addPopup("BalootClient/SkinShop/SkinShop", {
            opacityIn: true,
            onShow: (node) => {
                // node.getComponent("SkinShop").closeStorePage();
            }
        })
    }

    /**
     * 打开金币不足充值弹窗
     */
    openCoinCharge() {
        if (Global.isYDApp()) {
            cc.vv.AlertView.show(___("金币不足"), () => {
                //游戏内
                //cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: 1 });
            }, () => {
            }, false, () => { }, ___("提示"), ___("取消"), ___("Charge"))
        }
        else {
            cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COINS);
        }

    }


    ////////////////////////// 和大厅全局聊天相关交互 ////////////////////////////////
    /**
     * 获取聊天节点
     */
    getPageChat() {
        let node = cc.find("Canvas/safe_node/PageChat");
        return node;
    }

    /**
     * 获取俱乐部聊天节点
     */
    //  getClubChat() {
    //     let node = cc.find("Canvas/safe_node/ClubChat");
    //     if(node && !node["isAddListener"]) {
    //         node["isAddListener"] = true;
    //         cc.find("CloseBtn", node).on("click", ()=>{
    //             node.active = false;
    //         })
    //     }
    //     return node;
    // }

    /**
     * 玩家在聊天中点击加入房间
     */
    EVENT_GLOBAL_CHAT_JOIN_TABLE(evt: any) {
        let pageChage = this.getPageChat();
        // let clubChat = this.getClubChat();
        if (pageChage || cc) {
            let tableId = evt.detail;
            if (tableId == facade.dm.tableInfo.tableId) {
                pageChage && (pageChage.active = false);
                // clubChat && (clubChat.active = false);
            } else {
                cc.vv.FloatTip.show(___("您已经在您的房间里了"));
            }
            cc.log(evt.detail);
        }
    }

    /**
     * 游戏流程改变
     */
    EVENT_FLOW_STATE_CHANGE(evt: any) {
        let state = evt.detail;
        if (state != PBFlowState.init && state != PBFlowState.ready) {
            let chat = this.getPageChat();
            if (chat) {
                chat.active = false;
            }
            // chat = this.getClubChat();
            // if(chat) {
            //     chat.active = false;
            // }
        }
    }

    /**
     * 检查玩家是否在游戏内
     */
    checkPlayerInTable(uid: number) {
        if (!uid || !facade) {
            return;
        }
        return facade.dm.playersDm.checkPlayerInTable(uid);
    }

    /**
     * 获取所有在房间内玩家的uid
     */
    getAllPlayerIdsInTable() {
        if (!facade) {
            return;
        }
        return facade.dm.playersDm.getAllPlayerIdsInTable();
    }
}