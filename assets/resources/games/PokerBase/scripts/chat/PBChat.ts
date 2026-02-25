import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import DebugPanel from "../DebugPanel";
import { PBCommonProxy } from "../PBCommonProxy";
import { PBEvent } from "../PBEvent";
import { facade } from "../PBLogic";
import { PBChatFastWordCfg, PBChatMsgType, PBChatMsgVo } from "./PBChatData";
import PBChatRecordItem from "./PBChatRecordItem";

const { ccclass, property } = cc._decorator;

export interface IPBChatProxy {
    sendMsg: (type: PBChatMsgType, content: any) => void;
}

let EmotionList = ["emoji_0", "emoji_2", "emoji_3"]; // 表情列表

/**
 * 子游戏通用聊天模块
 */
@ccclass
export class PBChat extends cc.Component {
    static MAX_MSG_LEN: number = 40; // 最大消息条数
    static MAX_MSG_OVER_FLOW_LEN: number = 10; // 

    @property(cc.Button)
    btn_interactive: cc.Button = null;
    @property(cc.Node)
    panel_interactive: cc.Node = null;
    @property(cc.Node)
    panel_chat: cc.Node = null;
    @property(cc.Node)
    touch_close_chat_area: cc.Node = null;
    @property(cc.Node)
    touch_close_interactive_area: cc.Node = null;

    // emotion
    @property(cc.Node)
    panel_emotion: cc.Node = null;
    @property(cc.Node)
    emotionItemTemplate: cc.Node = null;
    @property(cc.ToggleContainer)
    emotionTab: cc.ToggleContainer = null;

    _emotionItems: cc.Node[] = [];
    _currEmotionTabIndex = -1;

    // fast word
    @property(cc.Node)
    panel_fast_word: cc.Node = null;
    @property(cc.ScrollView)
    panel_fast_word_sv: cc.ScrollView = null;

    // record
    @property(cc.Node)
    panel_record: cc.Node = null;
    @property(cc.ScrollView)
    panel_record_sv: cc.ScrollView = null;
    @property(cc.Node)
    record_item_template: cc.Node = null;

    // tab
    @property(cc.ToggleContainer)
    tab: cc.ToggleContainer = null;

    @property(cc.Button)
    btn_chat_switch: cc.Button = null;

    @property(cc.Node)
    redHintNode: cc.Node = null;

    // input
    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Button)
    sendBtn: cc.Button = null;
    @property(cc.Label)
    labelInputCharCnt: cc.Label = null;



    _currIndex: number = -1;
    _data = {
        initEmotion: false,
        initFastWord: false,
        initRecord: false
    }
    _recordItems: cc.Node[] = [];
    _cacheMsg: PBChatMsgVo[] = null;
    lastSendTime: Date = null;    // 上一次发送消息的时间
    _proxy: IPBChatProxy = null;
    _emotionSkin = ["emoji_0"];

    onLoad() {
        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent("EVENT_GAME_CHAT_SWITCH", () => {
            // 标记进入邀请模式
            this.onChatSwitchBtn();
            let tabbarCpt = this.node.getComponentInChildren("Tabbar")
            if (tabbarCpt) {
                tabbarCpt.setPage(1);
                let friendViewCmp = this.node.getComponentInChildren("SocialFriendViewCmp");
                friendViewCmp.isInviteModel = true;
                let inviteUids = this.getTablePlayerIds();
                friendViewCmp.inviteUids = inviteUids;
                friendViewCmp.updateView();
            }
        }, this);
        eventListener.registerEvent("EVENT_GAME_INVITE_SWITCH", () => {
            // 标记进入邀请模式
            this.onChatSwitchBtn();
            let tabbarCpt = this.node.getComponentInChildren("Tabbar")
            if (tabbarCpt) {
                tabbarCpt.setPage(2);
                let pageChatView = this.node.getComponentInChildren("PageChatView");
                this.scheduleOnce(() => {
                    if (pageChatView) pageChatView.req();
                })
            }
        }, this);

        this.btn_interactive.node.on("click", () => {
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            this.openInteractive();
        }, this);
        this.btn_chat_switch.node.on("click", () => {
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            this.onChatSwitchBtn();
        }, this);
        this.touch_close_chat_area.on(cc.Node.EventType.TOUCH_END, () => {
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            this.closeChat();
        }, this);
        this.touch_close_interactive_area.on(cc.Node.EventType.TOUCH_END, () => {
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            this.closeInteractive();
        }, this);

        this.tab.toggleItems.forEach((v, i) => {
            v.node.on("toggle", () => {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                this.onTab(i)
            });
        });

        this.emotionTab.toggleItems.forEach((v, i) => {
            v.node.on("toggle", () => {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                this.onEmotionTab(i)
            });
        });

        this.sendBtn.node.on("click", () => {
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            this.sendBtn.interactable = false;
            let txt = this.editBox.string.trim();
            if (txt == "#9you#000917#") {
                // 打开调试面板
                cc.vv.PopupManager.addPopup(DebugPanel.PREFAB_PATH);
                this.editBox.string = "";
                this.closeInteractive();
            } else {
                // 正常发消息
                txt = cc.vv["FilterWordConfig"].filter(txt || "")
                if (txt) {
                    this.sendMsg(PBChatMsgType.text, txt);
                    this.editBox.string = "";
                    this._updateInputCntLabel(0);
                    this.closeInteractive();
                } else {
                    this.sendBtn.interactable = true;
                }
            }
        }, this);

        // this.editBox.node.on("text-changed", () => {
        //     this._updateInputCntLabel(this.editBox.string.length);
        // }, this);

        this.editBox.node.on("text-changed", this.onEditBoxChange, this)


        this.emotionItemTemplate.active = false;
        this.record_item_template.active = false;
        this.panel_chat.x = -this.panel_chat.width;
        this.redHintNode.active = true;
    }

    init(proxy: IPBChatProxy) {
        this._proxy = proxy;
        this.scheduleOnce(() => {
            // 位置更新
            for (const keyCpt of cc.director.getScene().getComponentsInChildren("KeyCpt")) {
                if (keyCpt.key == "chat_btn") {
                    this.btn_interactive.node.y = this.btn_interactive.node.parent.convertToNodeSpaceAR(keyCpt.node.convertToWorldSpaceAR(cc.v2(0, 0))).y;// keyCpt.node.position.y;
                } else if (keyCpt.key == "social_btn") {
                    this.btn_chat_switch.node.y = this.btn_chat_switch.node.parent.convertToNodeSpaceAR(keyCpt.node.convertToWorldSpaceAR(cc.v2(0, 0))).y;// keyCpt.node.position.y;
                }
            }
        })
    }

    //是否显示世界聊天
    showWorldChat(bShow){
        let chat_node = cc.find("chat_node",this.node)
        chat_node.active = bShow
    }

    _updateInputCntLabel(cnt = 0) {
        this.labelInputCharCnt.string = `${cnt}/${this.editBox.maxLength}`;
    }

    onEditBoxChange(editbox, customEventData) {
        if (Global.isYDApp()) {
            let str = editbox.string.trim();
            // 只保留印度文,数字和英文
            let strList = str.split("");
            let newStr = [];
            for (let i = 0; i < strList.length; i++) {
                const ucode = strList[i].charCodeAt(0);
                if ((ucode > 127 && ucode < 0x0900) || ucode > 0x097F) {
                    continue;
                }
                newStr.push(strList[i]);
            }
            str = newStr.join("");
            this.editBox.string = str;
        }
        this._updateInputCntLabel(this.editBox.string.length);
    }

    sendMsg(type: PBChatMsgType, content: any, needCheckCD = true) {
        if (!this._isSeated()) {
            cc.vv.FloatTip.show(___("您还没有坐下不能发送"));
            return;
        }
        if (!needCheckCD || this.checkFrequency()) {
            if (this._proxy) {
                needCheckCD && (this.lastSendTime = new Date());
                this._proxy.sendMsg(type, content);
            }
        } else {
            cc.vv.FloatTip.show(___("聊天消息需要间隔{1}秒", 5));
        }
    }

    onTab(idx: number) {
        console.log("#toggle#:", idx);

        this._currIndex = idx;
        this.panel_emotion.active = idx == 0;
        this.panel_fast_word.active = idx == 1;
        this.panel_record.active = idx == 2;
        switch (idx) {
            case 0:
                this._showEmotionPanel();
                break;
            case 1:
                this._showFastWord();
                break;
            case 2:
                this._showRecord();
                break;
        }
    }

    openInteractive() {
        this.sendBtn.interactable = true;
        this.touch_close_interactive_area.active = true;
        CommonStyle.fastShow(this.panel_interactive);
        this.onTab(this._currIndex == -1 ? 0 : this._currIndex);

        Global.dispatchEvent(PBEvent.CLOSE_MINIGAME_777);
    }

    onChatSwitchBtn() {
        let tw = this.panel_chat["tw"];
        tw && tw.stop();
        if (this.panel_chat["isOpen"]) {
            this.touch_close_chat_area.active = false;

            this.panel_chat["isOpen"] = false;
            cc.find("arrow", this.btn_chat_switch.node).scale = 1;
            cc.tween(this.panel_chat)
                .to(0.2, { x: -this.panel_chat.width })
                .call(() => {
                    let contentNode = cc.find("chat_node/panel/content", this.node)
                    if (contentNode) contentNode.active = false;
                    this.redHintNode.active = true;
                })
                .start();
        } else {
            let friendViewCmp = this.node.getComponentInChildren("SocialFriendViewCmp");
            if (friendViewCmp) {
                friendViewCmp.isInviteModel = false;
                friendViewCmp.updateView();
            }
            let contentNode = cc.find("chat_node/panel/content", this.node)
            if (contentNode) contentNode.active = true;
            this.redHintNode.active = false;
            this.touch_close_chat_area.active = true;
            this.panel_chat["isOpen"] = true;
            cc.find("arrow", this.btn_chat_switch.node).scale = -1;
            cc.tween(this.panel_chat)
                .to(0.2, { x: 0 })
                .start();

            Global.dispatchEvent(PBEvent.CLOSE_MINIGAME_777);
        }
    }

    closeChat() {
        this.touch_close_chat_area.active = false;
        if (this.panel_chat["isOpen"]) {
            let tw = this.panel_chat["tw"];
            tw && tw.stop();
            this.panel_chat["isOpen"] = false;
            cc.find("arrow", this.btn_chat_switch.node).scale = 1;
            cc.tween(this.panel_chat)
                .to(0.2, { x: -this.panel_chat.width })
                .start();
        }
    }

    closeInteractive() {
        this.touch_close_interactive_area.active = false;
        CommonStyle.fastHide(this.panel_interactive);
    }

    _showEmotionPanel() {
        this.panel_emotion.opacity = 1;
        cc.tween(this.panel_emotion).to(0.1, { opacity: 0xff }).start();
        if (this._data.initEmotion) {
            return;
        }
        this._data.initEmotion = true;
        for (let i = 2; i <= 3; i++) {
            if (Global.isYDApp()) {
                cc.find(`toggle${i}`, this.emotionTab.node).active = false
                this.emotionTab.node.getComponent(cc.Layout).updateLayout()
            }
            else {
                cc.find(`toggle${i}/icon_lock`, this.emotionTab.node).active = !this._emotionSkin.includes(EmotionList[i - 1]);
            }

        }
        this._showCurrEmotion(0);
    }

    onEmotionTab(idx: number) {
        console.log("#toggle#:", idx);

        this._showCurrEmotion(idx);
    }


    /**
     * 显示当前表情类型
     */
    _showCurrEmotion(idx = 0) {
        this._currEmotionTabIndex = idx;
        let emotionType = EmotionList[idx] || "emoji_0";
        let container = cc.find("scrollview/view/content", this.panel_emotion);
        container.removeAllChildren();
        for (let j = 0; j < 6; j++) {
            let item = cc.instantiate(this.emotionItemTemplate);
            item.active = true;
            item.parent = container;
            item["id"] = j + 1;
            item["icon"] = cc.find("icon", item).getComponent(NetImg);
            let emotionName = `${emotionType}_${item["id"]}`;
            item["emotionName"] = emotionName;
            item["icon"].url = emotionName;
            item.on(cc.Node.EventType.TOUCH_END, () => {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                if (this._emotionSkin.includes(emotionType)) {
                    if (!this._isSeated()) {
                        cc.vv.FloatTip.show(___("您还没有坐下不能发送"));
                    } else {
                        this.sendMsg(PBChatMsgType.emotion, item["emotionName"]);
                    }
                } else {
                    cc.vv.FloatTip.show(___("您还未获得此表情"));
                }
                this.closeInteractive();
            })
            this._emotionItems.push(item);
        }
    }

    _checkHasEmotion() {
        let currEmotionType = EmotionList[this._currEmotionTabIndex];
        return this.emotionSkin.includes(currEmotionType);
    }

    _showFastWord() {
        this.panel_fast_word.opacity = 0x1;
        cc.tween(this.panel_fast_word).to(0.1, { opacity: 0xff }).start();
        if (this._data.initFastWord) {
            return;
        }
        this._data.initFastWord = true;
        let container = this.panel_fast_word_sv.content;
        let emotionTemplate = cc.find("fast_word_item_template", this.panel_fast_word);
        PBChatFastWordCfg.forEach((v, key) => {
            let item = cc.instantiate(emotionTemplate);
            item.active = true;
            item.parent = container;
            item.x = 0;
            item["id"] = key;
            let label = cc.find("label", item).getComponent(cc.Label);
            label.string = v.words;
            item.on(cc.Node.EventType.TOUCH_END, () => {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                if (!this._isSeated()) {
                    cc.vv.FloatTip.show(___("您还没有坐下不能发送"));
                } else {
                    this.sendMsg(PBChatMsgType.fast_word, key);
                }
                this.closeInteractive();
            })
        });
    }

    _showRecord() {
        if (!this._cacheMsg && this._recordItems.length < 1) {
            this._cacheMsg = this.revoverChatMsg();
        }
        if (this._cacheMsg) {
            this._cacheMsg.forEach(vo => {
                this._addARecord(vo);
            })
            this._cacheMsg = null;
        }
        this.panel_record_sv.scrollToBottom(0.2);
    }

    _addARecord(chatMsgVo: PBChatMsgVo) {
        let item = cc.instantiate(this.record_item_template);
        item.active = true;
        item.parent = this.panel_record_sv.content;
        item.x = 0;
        item.addComponent(PBChatRecordItem).bind(chatMsgVo);
        this._recordItems.push(item);
        let max = PBChat.MAX_MSG_LEN + PBChat.MAX_MSG_OVER_FLOW_LEN;
        // 超过最大记录数量后删除最早的记录
        if (this._recordItems.length > max) {
            let items = this._recordItems.splice(0, this._recordItems.length - max);
            items.forEach(item => {
                item.destroy();
            })
        }
    }

    onMsg(vo: PBChatMsgVo) {
        if (!this._cacheMsg) {
            this._cacheMsg = [];
        }
        this._cacheMsg.push(vo);
        if (vo.msgType == PBChatMsgType.fast_word) {
            let soundName = PBChatFastWordCfg.get(vo.content).sound;
            soundName += ((vo.gender == 1) ? "_male" : "_female");
            // soundName += ((cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR)?"_ar":"_en");
            soundName += "_ar";
            if (Global.isYDApp()) {
                //印度的没有英文的，就不播放了
            }
            else {
                if (facade) {
                    facade.soundMgr.playBaseEffect(soundName);
                }
                else {
                    window.facade.soundMgr.playBaseEffect(soundName);
                }
            }


        }
        if (this.panel_interactive.active && this._currIndex == 2) {
            this._showRecord();
        }
    }

    /**
     * 检测发言时间间隔 间隔小于5秒返回false
     */
    checkFrequency(): boolean {
        if (!this.lastSendTime) {
            return true;
        }
        let diff = new Date().getTime() - this.lastSendTime.getTime();
        if (diff < 5 * 1000) {
            return false;
        } else {
            return true;
        }
    }

    get emotionSkin() {
        return this._emotionSkin;
    }

    set emotionSkin(skin: string[]) {
        this._emotionSkin = skin;
        this._data.initEmotion = false;
    }

    /**
     * 保存聊天消息
     */
    saveChatMsg() {
        try {
            let data = {
                tableId: this.getGameTableid(),
                msgList: []
            }
            if (this._recordItems) {
                for (let i = 0; i < this._recordItems.length; i++) {
                    let item = this._recordItems[i];
                    if (!cc.isValid(item)) {
                        continue;
                    }
                    let cmp = item.getComponent(PBChatRecordItem);
                    if (cmp && cc.isValid(cmp) && cmp.vo) {
                        data.msgList.push(cmp.vo.rawStr);
                    }
                }
            }
            if (this._cacheMsg) {
                this._cacheMsg.forEach(v => {
                    data.msgList.push(v.rawStr);
                })
            }
            Global.saveLocal("DATA_CHAT_MSG", JSON.stringify(data));
        } catch (error) {
            cc.log("保存聊天消息出错");
        }
    }

    /**
     * 恢复聊天消息
     */
    revoverChatMsg() {
        let msgList: PBChatMsgVo[] = [];
        try {
            let dataStr = Global.getLocal("DATA_CHAT_MSG", "");
            if (dataStr) {
                let data = JSON.parse(dataStr);
                if (data.tableId == facade.dm.tableInfo.tableId) {
                    for (let i = 0; i < data.msgList.length; i++) {
                        let vo = new PBChatMsgVo().parse(data.msgList[i]);
                        msgList.push(vo);
                    }
                }
            }
        } catch (error) {
            cc.log("保存聊天消息出错");
        }
        return msgList;
    }

    /**
     * 是否坐下
     * @returns 
     */
    _isSeated() {
        if (facade && facade.dm) {
            return facade.dm.playersDm.selfAbsInfo.isSeated
        }
        else {
            return true
        }

    }

    getTablePlayerIds() {
        if (facade && facade.dm) {
            return facade.commonProxy.getAllPlayerIdsInTable()
        }
        else {
            return cc.vv.gameData.getAllPlayerIdsInTable()
        }

    }

    getGameTableid() {
        if (facade && facade.dm) {
            return facade.dm.tableInfo.tableId
        }
        else {
            return cc.vv.gameData.getTableId()
        }

    }
}