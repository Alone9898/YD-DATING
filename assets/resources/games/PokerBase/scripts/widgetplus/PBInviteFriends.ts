import { showErrorInfo } from "../../../PokerBase/scripts/PBUtils";
import { PBRoomType } from "../PBCommonData";
import { facade } from "../PBLogic";

const { ccclass, property } = cc._decorator;

/**
 * 好友邀请
 */
@ccclass
export class PBInviteFriends extends cc.Component {
    static PREFAB_PATH = "games/PokerBase/prefabs/InviteFriendsToGame";
    @property(cc.Node)
    listNode: cc.Node = null;
    @property(cc.ToggleContainer)
    tabContainer:cc.ToggleContainer = null;

    _menberListData:any[] = null;
    _randListData:any[] = null;
    _listData: any;
    _roomType: PBRoomType = 1;
    _entryCoin = 0;
    _roomId = 0;
    _tabs:cc.Toggle[] = null;

    private _curGameId: number;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.FRIEND_LIST, this.FRIEND_LIST, this, false);
        netListener.registerMsg(MsgId.CLUB_LIST_USER, this.FRIEND_LIST, this, false);
        netListener.registerMsg(MsgId.GET_RAND_USERS, this.GET_RAND_USERS, this, false);
        netListener.registerMsg(MsgId.INVITATION_RESULT, this.INVITATION_RESULT, this, false);
        netListener.registerMsg(MsgId.INVITE_FRIEND_JOIN_TEAM, this.INVITE_FRIEND_JOIN_TEAM, this, false);

        this._tabs = this.tabContainer.toggleItems;
        this._tabs.forEach((v, i)=>{
            v.node.on("toggle", ()=>{
                this.onTab(i)
            });
        })
    }

    onDestroy() {
        this._menberListData = null;
        this._randListData = null;
        this._listData = null;
    }

    start() {
        this.tabContainer.node.active = this._roomType == PBRoomType.friend;
        this.onTab(0);
    }

    onTab(index:number) {
        if(index == 1) {
            if(this._randListData) {
                this.showData(this._randListData);
            }else {
                let param = {
                    "c": MsgId.GET_RAND_USERS,
                    "limit": 5
                }
                cc.vv.NetManager.send(param, true)
            }
        }else {
            if(this._menberListData) {
                this.showData(this._menberListData);
            }else {
                let param = { c: MsgId.FRIEND_LIST };
                if (this._roomType == PBRoomType.club) {
                    param.c = MsgId.CLUB_LIST_USER;
                    param["cid"] = (cc.vv.UserManager.club && cc.vv.UserManager.club.cid) || 0;
                    param["page"] = 1;
                    param["limit"] = 500;
                }
                cc.vv.NetManager.send(param, true)
            }
        }
    }

    /**
     * 好友列表或者俱乐部列表
     */
    FRIEND_LIST(msg: any) {
        if (msg.code != 200) return;
        this._menberListData = msg.items || msg.members;
        this._listData = this._menberListData;
        this.showData(this._menberListData);
    }

    /**
     * 服务器随机推荐的用户
     */
    GET_RAND_USERS(msg: any) {
        this._randListData = msg.users;
        this.showData(this._randListData);
    }

    showData(list:any[]) {
        this._listData = list;
        for (let i = 0; i < this._listData.length; i++) {
            let uid = this._listData[i].uid;
            if (facade.dm.playersDm.getPlayerByUid(uid)) {
                this._listData.splice(i, 1);
                i--;
            }
        }
        this.listNode.getComponent("ListView").numItems = this._listData.length;
    }

    INVITATION_RESULT(msg: any) {
        cc.vv.PopupManager.removePopup(this.node);
    }
    onPopup(data: any) {
        this._roomType = data.moduleType;
        this._entryCoin = data.entryCoin || 0;
        this._roomId = data.roomId || 0;
        this._curGameId = data.gameid;
    }
    // 刷新Item
    onUpdateItem(item: cc.Node, index: number) {
        let data = this._listData[index];
        // 设置头像
        cc.find("node_head", item).getComponent("HeadCmp").setHead(data.uid, data.usericon || data.avatar);
        cc.find("node_head", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
        cc.find("label_nick", item).getComponent(cc.Label).string = data.playername || data.name;
        // 设置按钮 或者 状态
        cc.find("label_offline", item).active = false;
        cc.find("label_has", item).active = false;
        cc.find("btn_invite", item).active = false;
        if (data.isonline == 0) {
            // 好友离线
            cc.find("label_offline", item).active = true;
        } else if (data.gstatus == 1) {
            // 好友已经加入其他游戏
            cc.find("label_has", item).active = true;
        } else {
            cc.find("btn_invite", item).active = true;
            cc.find("btn_invite", item).getComponent("ButtonGrayCmp").interactable = !data.isInvite;
        }
    }
    // 点击邀请按钮
    onClickItem(event) {
        event.currentTarget.getComponent("ButtonGrayCmp").interactable = false;
        let data = this._listData[event.currentTarget.parent._listId];
        data.isInvite = true;
        let param = {
            c: MsgId.FRIEND_ROOM_INVITE,
            frienduid: data.uid,
            roomtype: this._roomType,
            entry: this._entryCoin || 0,
            deskid: this._roomId || 0,
            gameid: this._curGameId,
        };
        if (this._roomType == PBRoomType.club) {
            param.c = MsgId.CLUB_ROOMT_INVITE;
            param["cid"] = (cc.vv.UserManager.club && cc.vv.UserManager.club.cid) || 0;
        }
        cc.vv.NetManager.send(param, true);
    }

    INVITE_FRIEND_JOIN_TEAM(msg) {
        if (msg.spcode) {
            showErrorInfo(msg.spcode);
        }
    }

}