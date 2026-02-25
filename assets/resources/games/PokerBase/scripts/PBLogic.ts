import { PromiseLock } from "../../../../BalootClient/game_common/PromiseLock";
import World from "../../../../_FWExpand/Ecs/World";
import RoomSettlementCpt from "../module/Settlement/RoomSettlementCpt";
import { PBAutoHost } from "./autohost/PBAutoHost";
import { PBBgCtrl } from "./bg/PBBgCtrl";
import { PBChat } from "./chat/PBChat";
import { PBChatMsgType, PBChatMsgVo } from "./chat/PBChatData";
import { PBInteractiveCtrl } from "./interactive_emoticons/PBInteractiveCtrl";
import { PBLightCtrl } from "./operate/PBLightCtrl";
import { PBOperate } from "./operate/PBOperate";
import { PBFlowState, PBRoomType } from "./PBCommonData";
import { PBCommonProxy } from "./PBCommonProxy";
import { PBEvent } from "./PBEvent";
import { PBGameData } from "./PBGameData";
import { PBLayerMgr } from "./PBLayerMgr";
import { PBRule } from "./PBRule";
import { PBSkinMgr } from "./PBSkinMgr";
import { PBVoiceCtrl } from "./PBVoiceCtrl";
import { PBPlayerInfoVo, PBUserInfoVo } from "./player/PBPlayerData";
import { PBPlayersCtrl } from "./player/PBPlayersCtrl";
import { PBSoundCtrl } from "./sound/PBSoundCtrl";
import { PBClock } from "./widgetplus/PBClock";
import { PBCountdown } from "./widgetplus/PBCountdown";
import { PBFingerTip } from "./widgetplus/PBFingerTip";
import { PBMenu } from "./widgetplus/PBMenu";
import { PBPopupDismiss } from "./widgetplus/PBPopupDismiss";
import { PBViewerList } from "./widgetplus/PBViewerList";

const { ccclass, property } = cc._decorator;

export let facade: PBLogic = null;

@ccclass
export default class PBLogic extends World {
    panel: cc.Node; // 内容节点
    dm: PBGameData;     // 数据控制器

    // # 通用控制器 #
    soundMgr: PBSoundCtrl;   // 音效管理器
    voiceCtrl: PBVoiceCtrl;  // 实时语音控制器
    bgCtrl: PBBgCtrl;        // 背景控制器
    playersCtrl: PBPlayersCtrl; // 玩家控制器
    autoHost: PBAutoHost;    // 托管控制器
    menu: PBMenu;            // 菜单控制器
    skinMgr: PBSkinMgr;      // 皮肤控制器
    chat: PBChat;            // 聊天控制器
    clock: PBClock;          // 倒计时
    interactiveEmotionCtrl: PBInteractiveCtrl;  // 表情控制器
    operate: PBOperate;      // 通用按钮操作
    commonProxy: PBCommonProxy;
    lightCtrl: PBLightCtrl;  // 追光灯组件
    countdown: PBCountdown; // 倒计时
    rule: PBRule;       // 帮助
    layerMgr: PBLayerMgr; // 层管理器
    viewerList: PBViewerList;   // 观战玩家列表
    fingerTip: PBFingerTip; // 出牌手指提示

    tips_coin_recharge: cc.Node; // 充值提示
    url_rule: string;  //规则预制的路径
    selfBetCoin: any;  //自己在本局内下注的钱
    settlementCpt: RoomSettlementCpt;  //通用的获取RP,EXP,League提示

    async onLoad() {
        super.onLoad();
        Global.autoAdaptDevices(false);
        this.beforeInit();
        // 等待所有异步加载结束,进行enterTable的调用
        this.init();
        this.loadCtrlAsync();
        this.afterInit();
        // 开启服务器数据接受
        // await this.delay(3);
        // this.dm.msgHandler.run();
        // cc.vv.NetManager.send({ c: 4 });
    }

    start() {
        this.dm.msgHandler.run();
        this.enterTable();
        this.enterTableLater();
    }

    /**
     * 加载数据控制器
     */
    loadDm() {
        return cc.vv.gameData;
    }

    /**
     * 场景销毁时清理资源
     */
    onDestroy() {
        window.facade = null;
        facade = null;
        this.dm.msgHandler && this.dm.msgHandler.clear();
        this.dm = null;
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    /**
     * 初始化之前处理
     */
    beforeInit() {
        // let bgNodeCpt = this.getCpt(PBBgCtrl);
        // if (bgNodeCpt) bgNodeCpt.node.zIndex = 999999;
        cc.vv.AudioManager.stopBgm();
        window.facade = this; // 方便其他模块访问和浏览器调试
        facade = this;
        this.panel = this.node.getChildByName("safe_node");
        this.dm = this.loadDm();
        this.dm.msgHandler.gameCtrl = this;
    }

    /**
     * 初始化之后处理
     */
    afterInit() {
        Global.saveLocal("SAVE_FROM_SUBGAME_ID", this.dm.tableInfo.gameId);
        Global.saveLocal("SAVE_FROM_SUBGAME_ROOM_TYPE", this.dm.tableInfo.roomType);
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        this.scheduleOnce(() => {
            this.soundMgr.playBgm();
        }, 1);
        if (this.bgCtrl) {
            this.bgCtrl.changeSkin(cc.vv.UserManager.tableskin || "table_free");
        }
        //@ts-ignore
        // 运行广播
        cc.vv.BroadcastManager && (cc.vv.BroadcastManager.run());
        // 初始化没钱提示
        this.tips_coin_recharge = cc.find("tips_coin_recharge", this.panel);
        this.tips_coin_recharge && (this.tips_coin_recharge.active = false);
    }

    /**
     * 游戏进入后台
     */
    onGameHide() {
        cc.log("# game hide#");
        // 保存聊天记录
        this.chat && this.chat.saveChatMsg();
    }

    /**
     * 游戏由后台返回
     */
    onGameShow() {
        cc.log("# game show#");
    }

    // 初始化
    init() {
        this.loadCtrl();
        this.addEventListener();
    }

    /**
     * 监听通用事件
     */
    addEventListener() {
        Global.registerEvent("USER_INFO_CHANGE", this.changeSkin, this);
        let btn_skin = this.panel.getChildByName("btn_skin")
        if (btn_skin) {
            btn_skin.on("click", () => {
                this.commonProxy.openShop();
            }, this);
        }
    }

    // 加载化控制器
    loadCtrl() {
        this.soundMgr = this.loadSoundCtrl();
        this.layerMgr = this.loadLayerMgr();
        this.bgCtrl = this.loadBgCtrl();
        this.playersCtrl = this.loadPlayersCtrl();
        this.skinMgr = this.loadSkinMgr();
        if (Global.isYDApp()) {
            this.loadChat();
        } else {
            this.settlementCpt = this.panel.addComponent(RoomSettlementCpt);
        }
        this.autoHost = this.loadAutoHost();
        this.voiceCtrl = this.loadVoiceCtrl();
        this.clock = this.loadClock();
        this.interactiveEmotionCtrl = this.loadInterActiveEmotionsCtrl();
        this.operate = this.loadOperate();
        this.commonProxy = this.panel.addComponent(PBCommonProxy);
        this.lightCtrl = this.loadLightCtrl();
        this.countdown = this.loadCountdown();
        this.rule = this.loadRule();
        this.viewerList = this.loadViewerList();
        this.fingerTip = this.loadFingerTip();



    }

    async loadCtrlAsync() {
        if (Global.isYDApp()) return;
        // 创建承诺任务列表
        let promiseList: Promise<void>[] = [];
        // 通过用UI加载
        promiseList.push(this.loadMenu());
        promiseList.push(this.loadGameName(-2));
        promiseList.push(this.loadDeskId(-1));
        promiseList.push(this.loadChargeUI());
        promiseList.push(this.loadRightBtnUI());
        // 异步启动所有委托任务,等待所有任务完成,再进行下一步
        await Promise.all(promiseList);
    }

    async loadRightBtnUI() {
        if (Global.isYDApp()) return;
        if (Global.isSingle()) return;
        let promiseList: Promise<cc.Prefab>[] = [];
        // 背包按钮
        if ([255, 291, 292, 293, 294, 295].indexOf(this.dm.deskInfo.gameid) < 0) {
            promiseList.push(cc.vv.ResManager.loadPrefab("games/PokerBase/module/SkinShop/BtnGameSkin"));
        }
        // 聊天入口
        if ([294, 295].indexOf(this.dm.deskInfo.gameid) < 0) {
            promiseList.push(cc.vv.ResManager.loadPrefab("games/PokerBase/module/Chat/BtnChat"));
        }
        // 段位排名入口
        if ([294, 295].indexOf(this.dm.deskInfo.gameid) < 0) {
            if (this.dm.deskInfo.conf.roomtype != PBRoomType.match) {
                promiseList.push(cc.vv.ResManager.loadPrefab("games/PokerBase/module/League/BtnGameLeague"));
            }
        }
        let offset = cc.v3(0, 0);
        if ([291, 255].indexOf(this.dm.deskInfo.gameid) >= 0) {
            offset = cc.v3(0, -100);
        } else if ([266].indexOf(this.dm.deskInfo.gameid) >= 0) {
            offset = cc.v3(0, -180);
        } else if ([293].indexOf(this.dm.deskInfo.gameid) >= 0) {
            offset = cc.v3(0, -420);
        }
        let prefabList = await Promise.all(promiseList);
        let nodeList = [];
        for (const prefab of prefabList) {
            let node: cc.Node = cc.instantiate(prefab);
            node.parent = this.panel;
            node.zIndex = 100;
            nodeList.push(node);
        }
        let startPos = cc.v3(468, -166).add(offset);
        let padding = 120;
        for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i];
            node.position = startPos.add(cc.v3(0, -padding * i))
        }
        this.loadChat();
    }
    async loadMenu() {
        if (Global.isYDApp()) return;
        // 加载右上角菜单
        let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/module/Menu/RoomMenu");
        let menuNode: cc.Node = cc.instantiate(prefab);
        menuNode.parent = this.panel;
        menuNode.zIndex = 10;
        cc.find("yd_float_service", menuNode).active = !Global.isSingle();
    }
    async loadChargeUI() {
        if (Global.isYDApp()) return;
        if (Global.isSingle()) return;
        if (this.dm.deskInfo.conf.roomtype == PBRoomType.match) return;
        let prefabList = await Promise.all([
            cc.vv.ResManager.loadPrefab("BalootClient/PiggyBank/prefabs/PiggyBankBtn"),
            cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/tips_coin_recharge")
        ]);
        // 金猪加载
        let piggyNode = cc.instantiate(prefabList[0]);
        piggyNode.parent = this.panel;
        piggyNode.zIndex = 5;
        // 钱不够预制体加载
        let noCoinNode = cc.instantiate(prefabList[1]);
        noCoinNode.parent = this.panel;
        noCoinNode.zIndex = 5;
        let right_top_pos = cc.v3(cc.winSize.width / 2, cc.winSize.height / 2 - this.panel.getComponent(cc.Widget).top);
        if ([269, 290, 292, 293, 294].indexOf(this.dm.deskInfo.gameid) >= 0) {
            piggyNode.position = right_top_pos.add(cc.v3(-320, -80));
            noCoinNode.position = right_top_pos.add(cc.v3(-470, -80));
        } else {
            piggyNode.position = right_top_pos.add(cc.v3(-100, -220 - 140));
            noCoinNode.position = right_top_pos.add(cc.v3(-100, -220 - 140 * 2));
        }
        // noCoinNode.getComponent("PBTipsCoinRecharge").show();
    }

    async loadDeskId(zIndex) {
        if (Global.isYDApp()) return;
        if (this.dm.deskInfo.conf.roomtype == PBRoomType.match) return;
        let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/module/RoomId/room_id");
        let node: cc.Node = cc.instantiate(prefab);
        cc.find("top_left_layout", this.panel).addChild(node, zIndex);
        cc.find("label", node).getComponent(cc.Label).string = this.dm.deskInfo.deskid;
    }
    async loadGameName(zIndex) {
        if (Global.isYDApp()) return;
        if (this.dm.deskInfo.conf.roomtype == PBRoomType.match) return;
        let scoreBoard = cc.find("top_left_layout/score_board", this.panel);
        if (!scoreBoard || (this.dm.deskInfo.gameid == 279 && this.dm.deskInfo.conf.roomtype == PBRoomType.normal)) {
            let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/module/RoomTitle/room_title");
            let node = cc.instantiate(prefab);
            cc.find("top_left_layout", this.panel).addChild(node, zIndex);
            cc.find("label", node).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(this.dm.deskInfo.gameid);
        }
    }
    /**
     * 聊天组件
     */
    async loadChat() {
        if (Global.isSingle()) return;
        if (Global.isIOSAndroidReview()) return;
        let chatNode = cc.find("chat", this.panel);
        if (!chatNode) {
            let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/chat");
            if (!!prefab) {
                chatNode = cc.instantiate(prefab)
                chatNode.name = "chat"
                chatNode.parent = this.panel
                chatNode.zIndex = 1100;
            }
        }
        if (!!chatNode) {
            this.chat = chatNode.getComponent(PBChat);
            this.chat && this.chat.init({
                sendMsg: (type: PBChatMsgType, content: any) => {
                    this.sendRetransmissionMsg(type, content);
                }
            });
            if(this.chat && Global.isYDApp()){
                this.chat.showWorldChat(false)
            }
            
            this.skinMgr.updateEmotionSkin();
        }
    }
    // ############## 加载控制器-start #################
    loadFingerTip() {
        let fingerNode = cc.find("finger_tip", this.panel);
        if (fingerNode) {
            return fingerNode.getComponent(PBFingerTip);
        }
        return null;
    }

    loadLayerMgr() {
        let cmp = this.panel.getComponent(PBLayerMgr);
        if (!cmp) {
            cmp = this.panel.addComponent(PBLayerMgr);
        }
        return cmp;
    }

    loadViewerList() {
        let node = cc.find("viewer_list", this.panel);
        if (node) {
            return node.getComponent(PBViewerList);
        } else {
            return null;
        }
    }

    loadRule() {
        let node_rule = cc.find("game_rule", this.panel)
        if (node_rule) {
            return node_rule.getComponent(PBRule);
        }
    }


    loadMathPlayer() {

    }

    /**
     * 加载倒计时
     */
    loadCountdown() {
        let node = cc.find("countdown", this.panel);
        if (node) {
            return node.getComponent(PBCountdown);
        } else {
            return null;
        }
    }

    /**
     * 加载追光灯组件
     */
    loadLightCtrl() {
        let lightNode = cc.find("light_ctrl", this.panel);
        if (lightNode) {
            return lightNode.getComponent(PBLightCtrl);
        } else {
            return null;
        }
    }

    /**
     * 音效播放组件
     */
    loadSoundCtrl() {
        return this.panel.addComponent(PBSoundCtrl);
    }

    /**
     * 背景控制组件
     */
    loadBgCtrl() {
        return cc.find("bg_node", this.panel).getComponent(PBBgCtrl);
    }

    /**
     * 玩家控制组件
     */
    loadPlayersCtrl() {
        return this.panel.addComponent(PBPlayersCtrl);
    }

    /**
     * 皮肤管理组件
     */
    loadSkinMgr() {
        let cmp = this.panel.getComponent(PBSkinMgr);
        return cmp;
    }



    /**
     * 发送让服务器转发的消息
     */
    sendRetransmissionMsg(type: PBChatMsgType, content: any) {
        let selfInfo = this.dm.playersDm.selfInfo;
        let chatMsg = new PBChatMsgVo();
        chatMsg.uid = selfInfo.uid;
        chatMsg.nick = selfInfo.uinfo.uname;
        chatMsg.gender = cc.vv.UserManager["sex"] || 0;
        chatMsg.icon = selfInfo.uinfo.icon;
        chatMsg.avatar = selfInfo.avatarFrame;
        chatMsg.chatSkin = selfInfo.chatSkin;
        chatMsg.fontSkin = this.skinMgr.fontSkin;
        chatMsg.msgType = type;
        chatMsg.sendTime = new Date().getTime();
        chatMsg.content = content;
        chatMsg.fcoin = selfInfo.coin;
        this.dm.msgWriter.sendChatMsg(chatMsg.getMsg());
    }

    /**
     * 自动托管组件
     */
    loadAutoHost() {
        let autoHostNode = cc.find("auto_host", this.panel);
        if (autoHostNode) {

            autoHostNode.zIndex = 500;

            return autoHostNode.getComponent(PBAutoHost);
        } else {
            return null;
        }
    }

    /**
     * 语音聊天组件
     */
    loadVoiceCtrl() {
        if (!Global.isYDApp()) {
            return this.panel.addComponent(PBVoiceCtrl);
        }

    }

    /**
     * 倒计时组件
     */
    loadClock() {
        let clockNode = cc.find("clock", this.panel);
        if (clockNode) {
            return clockNode.getComponent(PBClock);
        } else {
            return null;
        }
    }

    /**
     * 加载互动表情
     */
    loadInterActiveEmotionsCtrl() {
        let emotionNode = cc.find("interactive_emotion", this.panel);
        if (emotionNode) {
            emotionNode.zIndex = 1000;
            return emotionNode.getComponent(PBInteractiveCtrl);
        } else {
            return null;
        }
    }

    /**
     * 通用按钮操作
     */
    loadOperate() {
        let operateNode = cc.find("operate", this.panel);
        if (operateNode) {
            return operateNode.getComponent(PBOperate);
        } else {
            return null;
        }
    }

    // ############## 加载控制器-end #################

    /**
     * 重连和进入场景后调用
     */
    enterTable() {

    }

    // 重连和进入场景后调用(非重新)
    enterTableLater() {
        let bgNodeCpt = this.getCpt(PBBgCtrl);
        if (bgNodeCpt) bgNodeCpt.node.zIndex = -10;
        // 更新所有语聊组件
        if (this.voiceCtrl) {
            this.scheduleOnce(() => {
                this.voiceCtrl.updateAll();
            })
        }

    }

    /**
     * 处理皮肤改变
     */
    changeSkin() {
        this.skinMgr.updateSkin();
    }

    /**
     * 收到聊天消息
     */
    async onChatMsg(msgVo: PBChatMsgVo) {
        let uvo = this.dm.playersDm.getPlayerByUid(msgVo.uid);
        if (!uvo) {
            return;
        }
        if (!this.playersCtrl) { //阿拉丁中没有这个桌上玩家的组件
            return
        }
        let player = this.playersCtrl.getPlayerByPosition(uvo.position);
        switch (msgVo.msgType) {
            case PBChatMsgType.text:
                player.showBubbleMsg(msgVo.content);
                break;
            case PBChatMsgType.emotion:
                player.showEmotion(msgVo.content);
                break;
            case PBChatMsgType.fast_word:
                let word = msgVo.getContentText();
                if (word) {
                    player.showBubbleMsg(word);
                }
                break;
            case PBChatMsgType.diy:
                this.diyChatMsgHandler(msgVo);
                break;
        }
        if (msgVo.msgType != PBChatMsgType.diy) {
            this.chat && this.chat.onMsg(msgVo);
        }
    }

    /**
     * diy 聊天消息处理
    */
    diyChatMsgHandler(msgVo: PBChatMsgVo) {
        try {
            let content = JSON.parse(msgVo.content);
            if (content.cmd == "change_avatar") {
                if (msgVo.uid != this.dm.playersDm.selfAbsInfo.uid) {
                    let player = this.playersCtrl.getPlayerByUid(msgVo.uid);
                    if (player) {
                        player.playerInfoVo.avatarFrame = msgVo.avatar;
                        player.userInfoCmp.userAvatar.updateFrame(msgVo.avatar);
                    }
                }
            } else if (content.cmd == "change_chat_skin") {
                if (msgVo.uid != this.dm.playersDm.selfAbsInfo.uid) {
                    let player = this.playersCtrl.getPlayerByUid(msgVo.uid);
                    if (player) {
                        player.playerInfoVo.chatSkin = msgVo.chatSkin;
                        player.userInfoCmp.userAvatar.updateFrame(msgVo.avatar);
                    }
                }
            } else if (content.cmd == "interactive_emotion") {
                this.interactiveEmotionCtrl.playerEmotion(content.emotionId, content.fromUid, content.toUid);
                if (msgVo.fcoin) {
                    let p = this.dm.playersDm.getPlayerByUid(msgVo.uid);
                    if (p) {
                        p.coin = msgVo.fcoin;
                        if (facade.dm.deskInfo.conf.roomtype != PBRoomType.match) {
                            Global.dispatchEvent(PBEvent.USER_COIN_CHANGE, { uid: p.uid });
                        }
                    }
                }
            }
        } catch (error) {
            console.log("#err#diy消息错误", msgVo);
        }
    }

    /**
     * 托管状态改变
     */
    autoHostChange(dic: any) {
        if (!this.autoHost || !dic || !this.dm || !this.dm.playersDm) {
            return;
        }
        let pvo = this.dm.playersDm.getPlayerByUid(dic.uid);
        if (!pvo) {
            return;
        }
        pvo.autoHost = dic.auto == 1;
        if (pvo == this.dm.playersDm.selfInfo) {
            if (pvo.autoHost) {
                this.autoHost.show();
            } else {
                this.autoHost.hide();
            }
        }
    }

    /**
     * 在游戏内重连重置资源
     */
    reconnectInGameReset() {
        this.dm.msgHandler.clearMsgQueue();
        // this.cleanRound();
        this.dm.reset();
    }

    openRule() {
        if (this.rule) {
            this.rule.open();
        }
        else {
            this.loadPrefab(this.url_rule, (data) => {
                if (!cc.find("game_rule", this.panel)) {
                    let node = cc.instantiate(data)
                    node.parent = this.panel
                    node.name = "game_rule"
                    node.zIndex = 1001;
                    this.rule = node.getComponent(PBRule);
                    this.rule.open();
                }

            })
        }
    }

    /**
     * 玩家准备
     */
    playerReady(dic: any) {
        let p = this.dm.playersDm.getPlayerByUid(dic.uid);
        if (p) {
            this.playersCtrl.ready(p.position);
            if (p.uid == this.dm.playersDm.selfAbsInfo.uid) {
                this.operate && this.operate.showReady(false);
            }
        }

        if (this.dm.playersDm.isSelf(dic.uid)) { // 自己准备，隐藏匹配动画
            this._showMathUIAni(false);
        }
    }

    /**
     * 观战玩家主动坐下
     * @param dic 
     */
    onSitDown(dic: any) {
        if (dic.uid === cc.vv.UserManager.uid) {
            cc.vv.NetManager.reconnect();
        } else {
            this.dm.playersDm.sitdown(dic.uid, dic.seatid);
            this.playersCtrl.onSitDown(dic.uid);
            this.playersCtrl.showViewerWatingStartTips();
        }
    }

    /**
     * 观战玩家进入
     * @param dic 
     */
    onEnterViewer(dic: any) {
        // todo
    }

    /**
     * 有玩家进入房间
    */
    async otherPlayerEnter(dic: any) {
        if (dic.deskinfo && dic.deskinfo.users) {
            let users: any[] = dic.deskinfo.users;
            for (let i = 0; i < users.length; i++) {
                let uinfo = users[i];
                let p = this.dm.playersDm.getPlayerByUid(uinfo.uid);
                if (!p) {
                    let uvo = this.dm.parseAPlayer(uinfo);
                    this.dm.playersDm.seat(uvo);
                    this.playersCtrl.seat(uvo);
                }
            }
        } else if (dic.user) {
            let uinfo = dic.user;
            let p = this.dm.playersDm.getPlayerByUid(uinfo.uid);
            if (!p) {
                let uvo = this.dm.parseAPlayer(uinfo);
                this.dm.playersDm.seat(uvo);
                this.playersCtrl.seat(uvo);
            }
        }
        if (this.dm.tableInfo.needSelfReady()) {
            this.operate && this.operate.showInvite(!this.dm.playersDm.seatIsFull());
        }
        this.dm.msgHandler.resumeCmd();
    }

    /**
     * 退出房间
     */
    exitTable() {
        this.gotoHall();
    }

    removeViewer(uid: any) {
        let index = this.dm.playersDm.viewerList.findIndex((info: PBPlayerInfoVo) => {
            if (info.uid === uid) {
                return info;
            }
            return null;
        });
        if (index >= 0) {
            this.dm.playersDm.viewerList.splice(index, 1);
        }
    }

    /**
     * 玩家退出房间
     */
    playerExit(dic: any, showReady: boolean = true) {
        let uid = dic.uid;
        let spcode = dic.spcode;
        let p = this.dm.playersDm.getPlayerByUid(uid);
        if (p) {
            // 用户离线，或者用户金币不足
            if (spcode == 804 || spcode == 1097) {
                if (p == this.dm.playersDm.selfInfo) {
                    if (Global.isYDApp()) {
                        cc.vv.AlertView.showTips(___("Cash balance is lower than the room minimum balance!"),
                            () => {
                                facade.gotoHall();
                            }
                        );
                    }
                    else {
                        Global.saveLocal("SUBGAME_GOLD_SHORTAGE", 1);
                        facade.gotoHall();
                    }

                } else {
                    this.dm.playersDm.removeAUser(p.uid);
                    this.playersCtrl.standUp(p.position);
                    if (this.dm.tableInfo.roomType == PBRoomType.friend && showReady) {
                        this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                    }
                }
            } else if (spcode === 975) {
                if (p == this.dm.playersDm.selfInfo) {
                    cc.vv.AlertView.showTips(___("超时未准备"),
                        () => {
                            facade.gotoHall();
                        }
                    );
                } else {
                    this.dm.playersDm.removeAUser(p.uid);
                    this.playersCtrl.standUp(p.position);
                    if (this.dm.tableInfo.roomType == PBRoomType.friend && showReady) {
                        this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                    }
                }
            } else if (spcode === 536) {
                // !!!!!竞标赛被淘汰, 这里只是阻碍不做处理, 竞标赛会有独有的淘汰协议
                if (p == this.dm.playersDm.selfInfo) {
                    // facade.gotoHall();
                } else {
                    this.dm.playersDm.removeAUser(p.uid);
                    this.playersCtrl.standUp(p.position);
                    if (this.dm.tableInfo.roomType == PBRoomType.friend && showReady) {
                        this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                    }
                }
            } else if (spcode === 1103) {
                if (p == this.dm.playersDm.selfInfo) {
                    cc.vv.AlertView.show(___("Automatically exit room without operation in rule time"),
                        null, null, false, null, null, null, null,
                        2,
                        () => {
                            facade.gotoHall();
                        }
                    );
                } else {
                    this.dm.playersDm.removeAUser(p.uid);
                    this.playersCtrl.standUp(p.position);
                    if (this.dm.tableInfo.roomType == PBRoomType.friend && showReady) {
                        this.operate.showInvite(!this.dm.playersDm.seatIsFull());
                    }
                }
            } else {
                this.dm.playersDm.removeAUser(p.uid);
                this.playersCtrl.standUp(p.position);
                if (this.dm.tableInfo.roomType == PBRoomType.friend) {
                    if (Global.isYDApp()) {
                    } else {
                        this.operate.showInvite(!this.dm.playersDm.seatIsFull() && showReady);
                    }
                }
            }
        }
    }

    reset() {

    }

    /**
     * 返回大厅
     */
    gotoHall() {
        // 判断是不是H5版本
        if (cc.vv.LoginData) {
            window["toBack"] && window["toBack"]();
            return;
        }
        cc.vv.gameData = null;
        this.reset();
        if (Global.isSingle()) {
            PromiseLock.resetLock();
            cc.director.preloadScene(Global.SCENE_NAME.HALL, (err, data) => {
                cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL, (err, data) => { });
            });
            return;
        }
        PromiseLock.resetLock();
        // 停止大阶段 定时器

        let infoChangeCpt = cc.director.getScene().getComponentInChildren("PBSettlementInfoChange");
        if (infoChangeCpt) {
            infoChangeCpt.clear();
        }
        // cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD, null, Global.APP_ORIENTATION);
        cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/SceneTranslate", {
            noMask: true,
            noCloseHit: true,
            onShow: (node) => {
                node.getComponent("SceneTranslate").toHall();
            }
        })
    }

    /**
     * 房间解散
     */
    roomDismiss() {
        if (this.dm.tableStatus.isDismiss) {
            cc.vv.AlertView.show(___("房间已经解散"), () => {
                this.gotoHall();
            });
            return;
        }
        if (this.dm.tableStatus.flowState == PBFlowState.total_settlement) {
            this.dm.tableStatus.isDismiss = true;
            Global.dispatchEvent("EVENT_ROOM_DISMISS");
        }
        //房间解散
        cc.vv.AlertView.show(___("房间已经解散"), () => {
            this.gotoHall();
        })
    }

    /**
     * 玩家发起解散
     */
    playerApplyDismiss(dismissData: any) {
        let popup = cc.vv.PopupManager.getPopupByName(PBPopupDismiss.POPUP_NAME);
        if (popup) {
            popup.getComponent(PBPopupDismiss).onPopup(dismissData);
        } else {
            cc.vv.PopupManager.addPopup(PBPopupDismiss.PREFAB_PATH, {
                onShow: (node: cc.Node) => {
                    node.getComponent(PBPopupDismiss).onPopup(dismissData);
                }
            })
        }
    }

    dismissCancel() {
        let popup = cc.vv.PopupManager.getPopupByName(PBPopupDismiss.POPUP_NAME);
        if (popup) {
            cc.vv.PopupManager.removePopup(popup);
        }

    }

    /**
     * 玩家选择(同意/解散房间)
     */
    playerReplyDismiss(dic: any) {
        cc.log(dic);
        Global.dispatchEvent("EVNT_PLAYER_REPLY_DISMISS", dic);
        this.scheduleOnce(() => {
            this.dm.msgHandler.resumeCmd();
        }, 0.3);
    }

    /**
     * 开始倒计时
     */
    countdownStart(dic: any) {
        if (this.countdown) {
            let time = (dic && dic.delayTime) || 5;
            if (time) {
                cc.log("count down show");
                this.countdown.show(time);
            }
        }
        if (this.operate) {
            this.operate.showReady(false);
            this.operate.showInvite(false);
        }
        this.dm.tableStatus.flowState = PBFlowState.countdown;
    }

    /**
     * 停止倒计时
     */
    countdownStop(dic: any) {
        if (this.countdown) {
            this.countdown.hide();
        }
    }

    // match动画
    _showMathUIAni(bShow, setTime?) {
        // let bFriendRoom = this.dm.tableInfo.roomType == PBRoomType.friend
        // if (bFriendRoom) {
        //     bShow = false
        // }

        let node = cc.find("node_match", this.panel)
        if (node) {
            node.active = bShow && setTime

            if (bShow && setTime) {
                let scp = cc.find("node_matching", node).getComponent("Table_Matching")
                if (scp) {
                    scp.show(setTime)
                }
            }
        }
    };

    /**
     * 更新玩家信息
     * @param dic 
     */
    onUpdatePlayerInfo(dic: any) {
        let player = this.dm.playersDm.getPlayerByUid(dic.uid);
        if (!player) {
            return;
        }
        player.chatSkin = dic.chatskin;
        player.coin = dic.coin;
        player.avatarFrame = dic.avatarframe;
        player.uinfo.uname = dic.playername;
        // player.svip = dic.svip;
        player.uinfo.icon = dic.usericon;
        player.currLevel = dic.level ? dic.level : player.currLevel;
        let pbplayer = this.playersCtrl.getPlayerByUid(dic.uid);
        pbplayer.userInfoCmp.show(player);
    }

    /**
     * 开局后减去玩家金币
     */
    minusEntryCoin() {
        let entryCoin = this.dm.tableInfo.entryCoin;
        if (!entryCoin) {
            return;
        }
        let playersVos = this.dm.playersDm.getPlayesInfo();
        playersVos.forEach(pvo => {
            if (pvo) {
                pvo.coin -= entryCoin;
                if (pvo.coin < 0) {
                    pvo.coin = 0;
                }
            }
        });
        Global.dispatchEvent(PBEvent.USER_COIN_CHANGE, { uid: -1 });
    }

    /**
     * 显示金币充值提示
     */
    showCoinChargeTip(boo = true) {
        let tips_coin_recharge = this.tips_coin_recharge;
        if (!tips_coin_recharge) {
            return;
        }
        if (boo) {
            if (!tips_coin_recharge.active) {
                tips_coin_recharge.active = true;
                let spine = tips_coin_recharge.getChildByName("spine").getComponent(sp.Skeleton);
                spine.setAnimation(0, "animation", true);
            }
            cc.vv.FloatTip.show(___("You are about to run out of gold coins!"));
        } else {
            tips_coin_recharge.active = false;
        }
    }

    /**
     * 显示手指提示
     */
    showFingerTip(boo: boolean) {
        if (!this.fingerTip) {
            return;
        }
        let playerInfo = this.dm.playersDm.selfAbsInfo;
        if (boo) {
            try {
                let lsKey = `FingerTipTimes${facade.dm.tableInfo.gameId}`;
                let times = parseInt(cc.sys.localStorage.getItem(lsKey) || 0);
                if (times < 5) {
                    this.playersCtrl.getPlayerByUid(playerInfo.uid).userInfoCmp.setWarningCallback(() => {
                        let refPos = this.getFingerRefPos();
                        this.fingerTip.show(refPos);
                        times++;
                        cc.sys.localStorage.setItem(lsKey, times);
                    });
                }
            } catch (error) {
                cc.log(error);
            }
        }
        this.fingerTip.hide();
    }

    /**
     * 获取手指提示显示的位置或者参考节点
     * 子游戏可更具需要重载此函数
     */
    getFingerRefPos() {
        if (this["handCardCtrl"] && this["handCardCtrl"]["getLastCanOutCard"]) {
            return this["handCardCtrl"]["getLastCanOutCard"]();
        }
        return null;
    }

    /**
     * 延时
     */
    delayTime(time: number) {
        return new Promise((res) => {
            this.scheduleOnce(() => {
                res(true);
            }, time);
        });
    }

    loadPrefab(url: string, resultcall: any) {
        cc.loader.loadRes(url, cc.Prefab, (err, data) => {
            if (!err) {
                resultcall(data)
            }
            else {
                cc.log("加载预制出错" + url)
            }
        })
    }

    confirmBtnClick() {

    }
}
