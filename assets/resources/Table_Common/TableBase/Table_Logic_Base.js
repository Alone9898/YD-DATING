/**
 * 桌游的逻辑入口
 */
import { PBChatMsgType, PBChatMsgVo } from "../../games/PokerBase/scripts/chat/PBChatData"
cc.Class({
    extends: cc.Component,

    properties: {
        atlas: [cc.SpriteAtlas],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Global.autoAdaptDevices(false);
        this.panel = cc.find("safe_node", this.node)
        if (this.atlas.length > 0) {
            cc.vv.gameData.setAtlas(this.atlas)
        }
        this.InitCommComponent()
        

        this.dm = cc.vv.gameData;
        window.facade = this; // 方便其他模块访问和浏览器调试
        facade = this;


        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_CHAT_MSG, this.OnRcvChatMsg, this);//收到聊天
        Global.registerEvent(EventId.UPATE_COINS, this.updateCoin, this);   //
    },

    onDestroy() {
        window.facade = null;
        facade = null;

        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_CHAT_MSG, this.OnRcvChatMsg, false, this);
    },

    InitCommComponent: function () {
        let safe_node = cc.find("safe_node", this.node)
        let cfg = cc.vv.gameData.getGameCfg()
        let gamescp = "Table_Game_Base"
        if (cfg) {
            gamescp = cfg.GameScript
        }
        let script_game = safe_node.addComponent(gamescp)
        script_game.Init()

        let defSoundCmp = "Table_Sound"
        this.node.addComponent(defSoundCmp)

        cc.vv.gameData.setScriptGame(script_game)
        if (!cfg.closeEmotion) {
            this.interactiveEmotionCtrl = this.loadInterActiveEmotionsCtrl();
            //兼容pokerbase的音效播放
            this.soundMgr = this.loadSoundCtrl();
        }

    },

    startGame() {
        let script_game = cc.vv.gameData.getScriptGame()
        if (script_game) {
            script_game.StartGame()
        }
    },

    start() {
        this.startGame()
        // 动态加载UI ()
        this.loadUI();
    },

    loadUI() {
        if (Global.isYDApp()) return;
        // 加载右上角菜单
        this.loadMenu();
        // 加载房间信息
        if (!Global.isYDApp() && this.dm.deskInfo.conf.roomtype != 6) {
            this.loadGameName(-2);
            this.loadDeskId(-1);
            this.loadRightBtnUI();
        }
    },

    async loadRightBtnUI() {
        if (Global.isYDApp()) return;
        // 段位排名入口
        let promiseList = [];
        // 聊天入口
        if ([294, 295].indexOf(this.dm.deskInfo.gameid) < 0) {
            promiseList.push(cc.vv.ResManager.loadPrefab("games/PokerBase/module/Chat/BtnChat"));
        }
        // 段位排名入口
        if ([294, 295].indexOf(this.dm.deskInfo.gameid) < 0) {
            if (this.dm.deskInfo.conf.roomtype != 6) {
                promiseList.push(cc.vv.ResManager.loadPrefab("games/PokerBase/module/League/BtnGameLeague"));
            }
        }
        let offset = cc.v3(0, 0);
        if ([292].indexOf(this.dm.deskInfo.gameid) >= 0) {
            offset = cc.v3(0, -500);
        }
        let prefabList = await Promise.all(promiseList);
        let nodeList = [];
        for (const prefab of prefabList) {
            let node = cc.instantiate(prefab);
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
    },
    async loadMenu() {
        let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/module/Menu/RoomMenu");
        let menuNode = cc.instantiate(prefab);
        menuNode.parent = this.panel;
        if (this.dm.deskInfo.conf.roomtype != 6) {
            // 金猪加载
            let piggyPrefab = await cc.vv.ResManager.loadPrefab("BalootClient/PiggyBank/prefabs/PiggyBankBtn");
            let piggyNode = cc.instantiate(piggyPrefab);
            piggyNode.parent = menuNode;
            piggyNode.zIndex = -1;
            // 钱不够预制体加载
            let noCoinPrefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/tips_coin_recharge");
            let noCoinNode = cc.instantiate(noCoinPrefab);
            noCoinNode.parent = menuNode;
            noCoinNode.zIndex = -1;
            let right_top_pos = cc.v3(cc.winSize.width / 2, cc.winSize.height / 2 - this.panel.getComponent(cc.Widget).top);
            if ([269, 290, 292, 293, 294].indexOf(this.dm.deskInfo.gameid) >= 0) {
                piggyNode.position = right_top_pos.add(cc.v3(-320, -80));
                noCoinNode.position = right_top_pos.add(cc.v3(-470, -80));
            } else {
                piggyNode.position = right_top_pos.add(cc.v3(-100, -220 - 140));
                noCoinNode.position = right_top_pos.add(cc.v3(-100, -220 - 140 * 2));
            }
        }
    },
    async loadDeskId(zIndex) {
        let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/module/RoomId/room_id");
        let node = cc.instantiate(prefab);
        cc.find("top_left_layout", this.panel).addChild(node, zIndex);
        cc.find("label", node).getComponent(cc.Label).string = this.dm.deskInfo.deskid;
    },
    async loadGameName(zIndex) {
        let scoreBoard = cc.find("top_left_layout/score_board", this.panel);
        if (!scoreBoard) {
            let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/module/RoomTitle/room_title");
            let node = cc.instantiate(prefab);
            cc.find("top_left_layout", this.panel).addChild(node, zIndex);
            cc.find("label", node).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(this.dm.deskInfo.gameid);
        }
    },

    /**
     * 发送让服务器转发的消息
     */
    sendRetransmissionMsg(type, content) {
        let selfInfo = cc.vv.gameData.getMyInfo();
        let chatMsg = new PBChatMsgVo();
        chatMsg.uid = selfInfo.uid;
        chatMsg.nick = selfInfo.playername;
        chatMsg.gender = cc.vv.UserManager["sex"] || 0;
        chatMsg.icon = selfInfo.icon || selfInfo.usericon;
        chatMsg.avatar = selfInfo.avatarFrame;
        chatMsg.chatSkin = selfInfo.chatSkin;
        chatMsg.fontSkin = "";
        let fontSkin = cc.vv.UserManager["frontskin"];
        if (!fontSkin || fontSkin == "0") {
            fontSkin = "font_color_4";
        }
        chatMsg.fontSkin = fontSkin

        chatMsg.msgType = type;
        chatMsg.sendTime = new Date().getTime();
        chatMsg.content = content;
        chatMsg.fcoin = selfInfo.coin;
        let req = { c: 25705 }
        req.msg = chatMsg.getMsg()
        cc.vv.NetManager.send(req);
    },

    OnRcvChatMsg: function (msg) {
        if (msg.code == 200) {

            // let bMySelf = cc.vv.UserManager.isMySelf(msg.uid)
            // let playInfo = cc.vv.gameData.getPlayByUid(msg.uid)
            // if(!playInfo && !bMySelf) return

            let msgVo = new PBChatMsgVo().parse(msg.msg);
            if (msgVo.msgType == PBChatMsgType.diy) {
                this.diyChatMsgHandler(msgVo);
            }
            else {
                let scp_game = cc.vv.gameData.getScriptGame()
                if (scp_game) {
                    scp_game.showPlayChat(msg.uid, msgVo)
                }
            }

            if (msgVo.msgType != PBChatMsgType.diy) {
                this.chat && this.chat.onMsg(msgVo);
            }

        }
    },

    /**
     * diy 聊天消息处理
    */
    diyChatMsgHandler(msgVo) {
        try {
            let content = JSON.parse(msgVo.content);

            if (content.cmd == "interactive_emotion") {

                //目标用户找不到的话，就不播
                let bExitToUser = cc.vv.gameData.getPlayByUid(content.toUid)
                if (!bExitToUser) {
                    console.log("####互动表情，目标用户未找到：", content.toUid);
                    return
                }
                if (this.interactiveEmotionCtrl) {
                    this.interactiveEmotionCtrl.playerEmotion(content.emotionId, content.fromUid, content.toUid);
                }
                else {
                    this.loadInterActiveEmotionsCtrl()
                }

                // 扣金币
                if (msgVo.fcoin) {
                    let p = cc.vv.gameData.getPlayByUid(msgVo.uid)//this.dm.playersDm.getPlayerByUid(msgVo.uid);
                    if (!p) {
                        //是否是自己
                        if (cc.vv.UserManager.isMySelf(msgVo.uid)) {
                            p = cc.vv.gameData.getMyInfo()
                        }
                    }
                    if (p) {
                        p.coin = msgVo.fcoin;
                        Global.dispatchEvent("PBEvent.USER_COIN_CHANGE", { uid: p.uid, coin: msgVo.fcoin });
                    }
                }
            }
        } catch (error) {
            console.log("#err#diy消息错误", msgVo);
        }
    },

    /**
     * 加载互动表情
     */
    loadInterActiveEmotionsCtrl() {
        let cfg = cc.vv.gameData.getGameCfg()
        if (cfg.closeEmotion) return
        let self = this
        let emotionNode = cc.find("interactive_emotion", this.panel);
        if (emotionNode) {
            return emotionNode.getComponent("PBInteractiveCtrl");
        } else {
            //加载
            let url = "Table_Common/TableRes/prefab/interactive_emotion"
            cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
                if (!err) {
                    let parentObj = cc.find("Canvas")
                    let old = parentObj.getChildByName('interactive_emotion')
                    if (!old) {
                        let node = cc.instantiate(prefab);
                        node.parent = parentObj;
                        self.interactiveEmotionCtrl = node.getComponent("PBInteractiveCtrl")

                    }
                    else {
                        self.interactiveEmotionCtrl = old.getComponent("PBInteractiveCtrl")
                    }
                }
            })
        }
    },

    updateCoin() {
        cc.vv.gameData.setMyCoin(cc.vv.UserManager.coin);
        Global.dispatchEvent("PBEvent.USER_COIN_CHANGE", { uid: cc.vv.UserManager.uid, coin: cc.vv.UserManager.coin });
    },

    /**
     * 音效播放组件
     */
    loadSoundCtrl() {
        return this.panel.addComponent("PBSoundCtrl");
    }



});
