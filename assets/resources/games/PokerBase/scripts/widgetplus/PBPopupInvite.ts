import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { CDButtonProxy } from "../../../../../BalootClient/game_common/common_cmp/CDButtonProxy";
import { PBRoomType } from "../PBCommonData";
import { facade } from "../PBLogic";
import { PBInviteFriends } from "./PBInviteFriends";

const { ccclass, property } = cc._decorator;


let invite_in_chat_cnt_limit = 3;
let invite_in_chat_time_limit = 100;

/**
 * 邀请弹窗
 */
@ccclass
export class PBPopupInvite extends cc.Component {
    static PREFAB_PATH = "games/PokerBase/prefabs/popup_invite";
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    panel: cc.Node = null;
    @property(CDButtonProxy)
    btn_close: CDButtonProxy = null;
    @property(CDButtonProxy)
    btn_invite_in_friend: CDButtonProxy = null;
    @property(CDButtonProxy)
    btn_invite_in_chat: CDButtonProxy = null;

    onLoad() {
        this.btn_close.addClickHandler(()=>{
            this.close();
        });
        this.btn_invite_in_friend.addClickHandler(()=>{
            cc.log("邀请好友");
            cc.vv.PopupManager.addPopup(PBInviteFriends.PREFAB_PATH, {
                opacityIn: true,
                onShow: (node) => {
                    let data = {
                        moduleType:facade.dm.tableInfo.roomType,
                        entryCoin:facade.dm.tableInfo.entryCoin || 0,
                        roomId:facade.dm.tableInfo.tableId || 0,
                        gameid:facade.dm.tableInfo.gameId
                    };
                    node.getComponent(PBInviteFriends).onPopup(data);
                }
            });
            this.close();
        });
        
        this.btn_invite_in_chat.addClickHandler(()=>{
            if(this._checkInviteCnt()) {
                cc.log("发送邀请到聊天");
                let param = { 
                    c: MsgId.CHAT_SEND_MSG, 
                    content: `${facade.dm.tableInfo.gameId};${facade.dm.tableInfo.tableId}`, 
                    stype: facade.dm.tableInfo.roomType,
                    deskid:facade.dm.tableInfo.tableId,
                    gameid:facade.dm.tableInfo.gameId
                };
                if(facade.dm.tableInfo.roomType == PBRoomType.club) {
                    param["cid"] = (cc.vv.UserManager.club && cc.vv.UserManager.club.cid) || 0;
                }
                cc.vv.NetManager.send(param);
                this._recordInviteInChat();

                let chat = null;
                let tipStr = "";
                // if(facade.dm.tableInfo.roomType == PBRoomType.club) {
                //     chat = facade.commonProxy.getClubChat();
                //     tipStr = ___("邀请已成功发送至俱乐部聊天，去看看？");
                // }else if(facade.dm.tableInfo.roomType == PBRoomType.friend) {
                if(facade.dm.tableInfo.roomType == PBRoomType.friend) {
                    chat = facade.commonProxy.getPageChat();
                    tipStr = ___("邀请已成功发送至全球聊天，去看看？");
                }
                if(chat) {
                    cc.vv.AlertView.show(
                        tipStr, 
                        ()=>{
                            chat.active = true;
                        }, ()=>{
                        }
                    )
                }else {
                    cc.vv.FloatTip.show(___("邀请已经发送成功"));
                }
            }else {
                cc.vv.AlertView.show(___("这个房间的{1}次分享次数已经使用完成，试试别的邀请吧", invite_in_chat_cnt_limit), ()=>{})
            }
            this.close();
        });

        let btn_invite_friend_label = cc.find("Background/Label", this.btn_invite_in_friend.node).getComponent(cc.Label);
        let btn_invite_in_chat_label = cc.find("layout_tips/label_title", this.btn_invite_in_chat.node).getComponent(cc.Label);        
        if(facade.dm.tableInfo.roomType == PBRoomType.club) {
            btn_invite_friend_label.string = ___("邀请俱乐部成员");
            btn_invite_in_chat_label.string = ___("在俱乐部聊天频道邀请");
        }else {
            btn_invite_friend_label.string = ___("邀请游戏好友");
            btn_invite_in_chat_label.string = ___("在公共聊天频道邀请");
        }

        this._checkBtnInviteInChat();
    }

    /**
     * 检测同意桌子邀请次数是否超过3次
     */
    _checkInviteCnt() {
        let ret = true;
        try {
            let dataStr = Global.getLocal("DATA_INVITE_IN_CHAT", "");
            if(dataStr) {
                let data = JSON.parse(dataStr);
                for(let i=0; i<data.cntInfo.length; i++) {
                    let info = data.cntInfo[i];
                    if(info.tableId == facade.dm.tableInfo.tableId  && info.cnt >= invite_in_chat_cnt_limit) {
                        ret = false;
                        break;
                    }
                }
            }
        } catch (error) {
            cc.log(error);
        }
        return ret;
    }

    /**
     * 检测是否可以发发送到聊天
     */
    _checkBtnInviteInChat() {
        try {
            let dataStr = Global.getLocal("DATA_INVITE_IN_CHAT", "");
            if(dataStr) {
                let data = JSON.parse(dataStr);
                let btnGray = this.btn_invite_in_chat.node.getComponent("ButtonGrayCmp");
                let label_tip = cc.find("layout_tips/label_tip", this.btn_invite_in_chat.node).getComponent(cc.Label);        
                let canInvite = true;
                if(data) {
                    let diffTime = Math.floor((new Date().getTime() - data.time)/1000);
                    if(diffTime < invite_in_chat_time_limit) {
                        canInvite = false;
                        this._startTipTick(invite_in_chat_time_limit-diffTime);
                    }
                }
                label_tip.node.active = !canInvite;
                btnGray.interactable = canInvite;
            }
        } catch (error) {
            cc.log(error);
        }
    }

    _startTipTick(time:number) {
        let label_tip = cc.find("layout_tips/label_tip", this.btn_invite_in_chat.node).getComponent(cc.Label);
        if(label_tip) {
            label_tip.getComponent(cc.Label).string = ___("{1}秒后可分享", time);
        }
        this.scheduleOnce(()=>{
            time--;
            if(time>0) {
                this._startTipTick(time);
            }else {
                label_tip.node.active = false;
                let btnGray = this.btn_invite_in_chat.node.getComponent("ButtonGrayCmp");
                btnGray.interactable = true;
            }
        }, 1);
    }

    _recordInviteInChat() {
        try {
            let savePram = {
                cntInfo:[], 
                time:new Date().getTime()
            }
            let dataStr = Global.getLocal("DATA_INVITE_IN_CHAT", "");
            let isNewTableId = true;
            if(dataStr) {
                let data = JSON.parse(dataStr);
                if(data.cntInfo) {
                    savePram.cntInfo = data.cntInfo;
                    for(let i=0; i<savePram.cntInfo.length; i++) {
                        let info = savePram.cntInfo[i];
                        if(info.tableId == facade.dm.tableInfo.tableId) {
                            info.cnt += 1;
                            isNewTableId = false;
                            break;
                        }
                    }
                }
            }
            if(isNewTableId) {
                savePram.cntInfo.push({tableId:facade.dm.tableInfo.tableId, cnt:1});
                // 超过6个桌子id的分享删除之前桌子分享记录以免数据过大
                let limitTableIdCnt = 6;
                if(savePram.cntInfo.length > limitTableIdCnt) {
                    savePram.cntInfo.splice(0, savePram.cntInfo.length-limitTableIdCnt);
                }
            }
            Global.saveLocal("DATA_INVITE_IN_CHAT", JSON.stringify(savePram));
        } catch (error) {
            cc.log(error);
            Global.saveLocal("DATA_INVITE_IN_CHAT", JSON.stringify({}));
        }
    }

    start() {
        this.open();
    }

    onDestroy() {
        this._removeEventListener();
    }

    _addEventListener() {
        this.btn_close.node.on("click", () => {
            this.close();
        }, this);
    }

    _removeEventListener() {
    }

    close() {
        CommonStyle.fastHide(this.node, () => {
            cc.vv.PopupManager.removePopup(this.node);
        })
    }

    async open() {
        this.bg.active = true;
        CommonStyle.fastShow(this.panel);
    }
}