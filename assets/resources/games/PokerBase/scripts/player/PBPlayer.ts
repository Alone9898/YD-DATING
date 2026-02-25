import { workerData } from "worker_threads";
import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import { PBHideHandCard } from "../card/PBHideHandCard";
import { PBEmotionPlayer } from "../chat/PBEmotionPlayer";
import { PBRoomType } from "../PBCommonData";
import { facade } from "../PBLogic";
import { PBClock } from "../widgetplus/PBClock";
import { PBPlayerInfoVo } from "./PBPlayerData";
import { PBToggleVoice } from "./PBToggleVoice";
import { PBUserInfoCmp } from "./PBUserInfoCmp";

const { ccclass, property } = cc._decorator;

/**
 * 玩家控制
 */
@ccclass
export class PBPlayer extends cc.Component {
    _userInfoCmp: PBUserInfoCmp = null;
    uiIndex: number = 0;    // ui的位置
    playerInfoVo: PBPlayerInfoVo;
    hideCardCtrl: PBHideHandCard = null;
    voiceToggle: PBToggleVoice = null;
    dealedCardLen: number = 0; // 当前已经发到了第几张牌
    bidBubbleSpine: sp.Skeleton = null;
    addCoin: cc.Node;       // 加金币
    baodian: sp.Skeleton;   // 爆点动画
    winSpine: sp.Skeleton;  // 胜利动画
    addScore: cc.Node;      // 加积分
    addRp: cc.Node;          // rp值变化
    tips_wating_start: cc.Node; // 等待提示

    _playWinAni: boolean = false;

    _bStandUp: boolean = false; //是否离座

    exNodeList: cc.Node[] = [];


    onLoad() {
        let bid_bubble = cc.find("bid_bubble", this.node);
        if (bid_bubble) {
            this.bidBubbleSpine = bid_bubble.getComponent(sp.Skeleton);
            this.bidBubbleSpine.node.active = false;
        }
        this.addCoin = cc.find("add_coin", this.node);
        if (this.addCoin) {
            this.addCoin["originPos"] = { x: this.addCoin.x, y: this.addCoin.y };
            this.addCoin.active = false;
        }
        this.addScore = cc.find("score_show", this.node);
        if (this.addScore) {
            // this.addScore["originPos"] = { x: this.addScore.x, y: this.addScore.y };
            this.addScore.active = false;
        }
        let baodianNode = cc.find("baodian", this.node);
        if (baodianNode) {
            this.baodian = baodianNode.getComponent(sp.Skeleton);
            this.baodian.node.active = false;
        }
        let winSpineNode = cc.find("win", this.node);
        if (winSpineNode) {
            this.winSpine = cc.find("win", this.node).getComponent(sp.Skeleton);
            this.winSpine.node.active = false;
        }

        this.addRp = cc.find("addRp", this.node);
        if (this.addRp) {
            this.addRp["originPos"] = { x: this.addRp.x, y: this.addRp.y };
            this.addRp.active = false;
        }

        this.tips_wating_start = cc.find("tips_wating_start", this.node);
        this.tips_wating_start && (this.tips_wating_start.active = false);

        this.loadVoiceToggle();
        this.addEvent();
    }

    /**
     * 显示玩家等待显示
     */
    showWatingStartTip(boo = true) {
        if (!this.tips_wating_start) {
            return;
        }

        this.tips_wating_start.active = boo;
    }

    /**
     * 播放分数变化
     */
    playRpChange(score: number) {
        if (!score || !this.addRp || !this.playerInfoVo) {
            return;
        }
        this.playerInfoVo.rpScore += score;
        this._userInfoCmp.updateRp(this.playerInfoVo);
        return;
        this.addRp.stopAllActions();
        this.addRp.active = true;
        this.addRp.scale = 0;
        this.addRp.opacity = 1;
        let originPos = this.addRp["originPos"];
        this.addRp.x = originPos.x;
        this.addRp.y = originPos.y;
        cc.find("label", this.addRp).getComponent(cc.Label).string = "+" + score.toString();
        this.playerInfoVo.rpScore += score;
        cc.tween(this.addRp)
            .to(0.5, { scale: 1, opacity: 0xff }, { easing: "backOut" })
            .call(() => {
                this._userInfoCmp.updateRp(this.playerInfoVo);
            })
            .delay(1)
            .to(0.5, { y: originPos.y + 100, opacity: 0 })
            .start();
    }

    /**
     * 播放分数变化
     */
    playScoreChange(score: number, defindWin = false, isWin = false) {
        if (!this.addScore || !score) {
            return;
        }
        if (!defindWin) {
            isWin = score > 0;
        }
        this.addScore.active = true;
        this.addScore.scale = 0;
        let icon = cc.find("icon", this.addScore);
        let label = cc.find("add_score", this.addScore);
        if (isWin) {
            icon.getComponent("ImgSwitchCmpTS").setIndex(0);
            label.scale = 1;
            label.getComponent("LabelSwitchCmp").setIndex(0);
            label.getComponent(cc.Label).string = (score > 0 ? "+" : "") + Global.formatNumShort(score, 0);
        } else {
            icon.getComponent("ImgSwitchCmpTS").setIndex(1);
            label.scale = 0.8;
            label.getComponent("LabelSwitchCmp").setIndex(1);
            label.getComponent(cc.Label).string = (score > 0 ? "+" : "") + Global.formatNumShort(score, 0);
        }
        cc.tween(this.addScore)
            .to(0.3, { scale: 1 }, { easing: "backOut" })
            .delay(2)
            .call(() => {
                this.addScore.active = false;
            })
            .start();
    }

    hideAddScore() {
        if (this.addScore) {
            this.addScore.active = false;
        }
    }
    /**
     * 播放金币变化动画
     */
    playCoinChange(coin: number, playWinAni = false, bChangeCoin = true) {
        if (!this.baodian || !this.addCoin || !coin) {
            return;
        }
        this.addCoin.stopAllActions();
        this._playWinAni = playWinAni;
        this.baodian.node.active = false;

        // 改用创建节点 添加的用一层级方式
        let tempBaodian = cc.instantiate(this.baodian.node);
        let tempBaodian_pos = facade.panel.convertToNodeSpaceAR(this.baodian.node.convertToWorldSpaceAR(cc.v3(0, 0)));
        tempBaodian.parent = facade.panel;
        tempBaodian.active = true;
        tempBaodian.position = tempBaodian_pos;
        tempBaodian.zIndex = 300;
        tempBaodian.getComponent(sp.Skeleton).setAnimation(0, "baodian", false);
        if (bChangeCoin) {
            if (coin > 0) {
                let from = this.playerInfoVo.coin - coin;
                let to = this.playerInfoVo.coin;
                if (!Global.isYDApp() && facade.dm.tableInfo.roomType !== PBRoomType.friend && facade.dm.tableInfo.roomType !== PBRoomType.match) {
                    from = this.playerInfoVo.winCoinShow - coin;
                    to = this.playerInfoVo.winCoinShow;
                }
                this._userInfoCmp.addCoin(from, to);
            }
        }
        this.addCoin.active = false;
        this.addCoin.opacity = 0;

        let originPos = this.addCoin["originPos"];
        this.addCoin.x = originPos.x;
        this.addCoin.y = originPos.y;
        // 改用创建节点 添加的用一层级方式
        let tempAddCoinNode = cc.instantiate(this.addCoin);
        let worldPos = facade.panel.convertToNodeSpaceAR(this.addCoin.convertToWorldSpaceAR(cc.v3(originPos.x, originPos.y)));
        tempAddCoinNode.parent = facade.panel;
        tempAddCoinNode.position = worldPos;
        tempAddCoinNode.zIndex = 300;
        tempAddCoinNode.active = true;
        if (coin > 0) {
            tempAddCoinNode.getComponent("LabelSwitchCmp").setIndex(0);
            tempAddCoinNode.getComponent(cc.Label).string = "+" + Global.FormatNumToComma(coin);
        } else {
            tempAddCoinNode.getComponent("LabelSwitchCmp").setIndex(1);
            tempAddCoinNode.getComponent(cc.Label).string = Global.FormatNumToComma(coin);
        }
        cc.tween(tempAddCoinNode)
            .parallel(
                cc.tween().to(0.3, { opacity: 255 }),
                cc.tween().by(1, { y: 100 })
            )
            .call(() => {
                if (this._playWinAni) {
                    this.playerWinAni();
                }
            })
            .to(0.5, { opacity: 0 })
            .call(() => {
                // tempAddCoinNode.y -= 100;
                tempAddCoinNode.destroy();
                tempBaodian.destroy();
                // this.baodian.node.active = false;
            })
            .start();
    }

    /**
     * 播放胜利动画
     */
    playerWinAni() {
        this.winSpine.node.active = false;
        // 改用创建节点 添加的用一层级方式
        let tempNode = cc.instantiate(this.winSpine.node);
        let worldPos = facade.panel.convertToNodeSpaceAR(this.winSpine.node.convertToWorldSpaceAR(cc.v3(0, 0)));
        tempNode.parent = facade.panel;
        tempNode.active = true;
        tempNode.position = worldPos;
        tempNode.zIndex = 150;
        let skeCpt = tempNode.getComponent(sp.Skeleton);
        skeCpt.setAnimation(0, "winner", false);
        skeCpt.setCompleteListener(() => {
            skeCpt.setCompleteListener(null);
            tempNode.destroy();
        });
        this._playWinAni = false;
    }

    /**
     * 播放叫分动画
    */
    async playBidBubble(aniName: string) {
        if (!this.bidBubbleSpine || !aniName) {
            return;
        }
        let spineAniName = `eff_${aniName}_`;
        this.bidBubbleSpine.node.active = true;
        if (this.uiIndex == 1) {
            spineAniName += "y";
            this.bidBubbleSpine.setAnimation(0, spineAniName, false);
        } else {
            spineAniName += "z";
            this.bidBubbleSpine.setAnimation(0, spineAniName, false);
        }
        this.bidBubbleSpine.setCompleteListener(() => {
            this.bidBubbleSpine.setCompleteListener(null);
            this.bidBubbleSpine.node.active = false;
        });
    }

    /**
     * 隐藏叫分动画
     */
    hideBidBubble() {
        if (this.bidBubbleSpine) {
            this.bidBubbleSpine.node.active = false;
        }
    }

    /**
     * 加载语聊组件
     */
    loadVoiceToggle() {
        if (!Global.isYDApp()) {
            this.voiceToggle = cc.find("toggle_voice", this.node).getComponent(PBToggleVoice);
            this.voiceToggle.forceInit();
            // 总开关 由服务器控制
            this.voiceToggle.node.active = cc.vv.UserManager.voice > 0;
            // if ([291, 293].indexOf(facade.dm.getGameId()) < 0) {
            // } else {
            //     this.voiceToggle.node.active = false;
            // }
        }
        else {
            cc.find("toggle_voice", this.node).active = false
        }

    }

    /**
     * 监听事件
     */
    addEvent() {
        cc.find("user_info_node/head_icon", this.node).on(cc.Node.EventType.TOUCH_END, () => {
            if (this.playerInfoVo == facade.dm.playersDm.selfInfo) {
                return;
            }
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            facade.interactiveEmotionCtrl.openEmotionPanel(this.playerInfoVo.uid);
        }, this);
    }

    onDestroy() {
        this.playerInfoVo = null;
        this.hideCardCtrl = null;
    }

    show() {
        if (this.playerInfoVo) {
            this.node.active = true;
            this._userInfoCmp.show(this.playerInfoVo);
            if (this.voiceToggle) {
                this.voiceToggle.init(this.playerInfoVo.uid);
                this.voiceToggle.updateView();
            }

        } else {
            this.node.active = false;
            this._userInfoCmp.showReadyTip(false);
        }
        for (const node of this.exNodeList) {
            node.active = this.node.active;
        }
    }

    async drawCards(nodes: cc.Node[]) {
        this.dealARoundCard(nodes);
    }

    /**
     * 用于发牌动画CardStack调用
     * @param node 
     */
    async dealARoundCard(nodes: cc.Node[]) {
        if (!this.playerInfoVo) {
            return;
        }
        this.dealedCardLen += nodes.length;
        let engle = -this.playerInfoVo.position * 90;
        let hideCards: cc.Node[] = [];
        for (let i = 0; i < nodes.length; i++) {
            hideCards.push(this.hideCardCtrl.addACard());
        }

        for (let i = 0; i < nodes.length; i++) {
            let c = nodes[i];
            let hideCard = hideCards[i];
            let endPos = hideCard.convertToWorldSpaceAR(cc.v2(0, 0));
            endPos = c.parent.convertToNodeSpaceAR(endPos);
            cc.tween(c)
                .delay(0.02)
                .to(0.3, { x: endPos.x, y: endPos.y, scale: 1, angle: engle })
                .call(() => {
                    c.destroy();
                    hideCard.active = true;
                    cc.tween(hideCard)
                        .to(0.2, { scale: 1 }, { easing: "backOut" })
                        .start();
                })
                .start();
        }
        await facade.delayTime(0.1);
    }

    /**
     * 显示倒计时
     * @param time 
     */
    showTimer(time: number = 8, changelight = true) {
        this.userInfoCmp.startTimeTip(time);
        changelight && facade.lightCtrl && facade.lightCtrl.lightToPosition(this.uiIndex);
    }

    /**
     * 显示泡泡消息
     */
    async showBubbleMsg(content: string) {
        let bubblePrefab = cc.find("bubble", this.node);
        if (bubblePrefab) {
            let worldPos = facade.panel.convertToNodeSpaceAR(bubblePrefab.convertToWorldSpaceAR(cc.v3(0, 0)));
            let bubbleNode = cc.instantiate(bubblePrefab);
            // 设置位置
            bubbleNode.position = worldPos;
            bubbleNode.parent = facade.panel;
            bubbleNode.active = true;
            bubbleNode.zIndex = 300;
            bubbleNode.opacity = 1;
            let bg = bubbleNode.getChildByName("bg");
            let chatSkin = this.playerInfoVo.chatSkin;
            bg.getComponent(NetImg).url = chatSkin;
            if (chatSkin && chatSkin.startsWith("chat_vip")) {
                let vipIconNode = bg.getChildByName("vip_icon");
                vipIconNode.active = true;
                if (vipIconNode) {
                    let vipIconCmp = vipIconNode.getComponent(NetImg);
                    vipIconCmp.url = `text_${chatSkin}`;
                }
            }
            bubbleNode.getChildByName("arrow").color = cc.vv["UserConfig"].getChatBoxColor(this.playerInfoVo.chatSkin);
            let label = bubbleNode.getChildByName("label").getComponent(cc.Label);
            label.string = content;
            let color = cc.vv.UserConfig.getColor(facade.skinMgr.fontSkin);
            color && (label.node.color = color);

            let width1 = 230;
            let width2 = width1 * 1.6;
            let oneRowHeight = 60;
            label.node.width = width1;
            // 如果高度超过50 说明一行显示不下
            let isChangeWidth = false;
            label.scheduleOnce(() => {
                if (label.node.height > oneRowHeight) {
                    label.node.width = width2;
                    isChangeWidth = true;
                }
                bg.width = label.node.width + 50 * 2;
                bg.height = label.node.height + 80;
                label.node.x = 0;
                if (this.getNeedChangeChatBubbleUIIndex().includes(this.uiIndex)) {
                    label.node.y = -bg.height / 2 + 6;
                } else {
                    label.node.y = bg.height / 2 + 6;
                }
                bubbleNode.scale = 0;
                cc.tween(this.node)
                    .call(() => {
                        CommonStyle.fastShow(bubbleNode);
                    })
                    .delay(2)
                    .call(() => {
                        CommonStyle.fastHide(bubbleNode, () => {
                            bubbleNode.removeFromParent(true);
                        })
                    })
                    .start();
            })
        }
    }

    getNeedChangeChatBubbleUIIndex() {
        return [2];
    }

    getNeedChangeInteractiveUIIndex() {
        return [3];
    }

    /**
     * 显示表情
     */
    showEmotion(emotionName: string) {
        let emotionPrefab = cc.find("emotion", this.node);
        let worldPos = facade.panel.convertToNodeSpaceAR(emotionPrefab.convertToWorldSpaceAR(cc.v3(0, 0)))
        let bubbleNode = cc.instantiate(emotionPrefab);
        // 设置位置
        bubbleNode.position = worldPos;
        bubbleNode.parent = facade.panel;
        bubbleNode.active = true;
        bubbleNode.zIndex = 300;
        let emotion = bubbleNode.getComponent(PBEmotionPlayer);
        emotion.playAni(emotionName);
    }

    /**
     * 显示倒计时
     * @param clock 
     * @param time 
     */
    showClock(clock: PBClock, time: number = 15) {
        let pos = this.node.getChildByName("clock_pos").convertToWorldSpaceAR(cc.v2(0, 0));
        clock.show(time, pos);
    }

    /**
     * 获取玩家子节点的全局坐标
     */
    getGlobalPos(childName: string = null) {
        let childNode = null;
        if (childName) {
            childNode = cc.find(childName, this.node);
        }
        let node = childNode || this.node;
        return node.convertToWorldSpaceAR(cc.v2(0, 0));
    }

    public get userInfoCmp(): PBUserInfoCmp {
        return this._userInfoCmp;
    }
    public set userInfoCmp(value: PBUserInfoCmp) {
        this._userInfoCmp = value;
    }

    onVoiceChanged(flag: number) {
        // this.voiceToggle.toggle.isChecked = flag === 2;
        // if (flag === 2) {
        //     if (this.playerInfoVo.uid !== cc.vv.UserManager.uid) {
        //         this.voiceToggle.hide();
        //     }
        // } else {
        //     this.voiceToggle.show();
        // }
    }

    //设置是否离座
    setPlayerStandup(val: boolean) {
        this._bStandUp = val
    }
    //获取是否离座
    getPlayerStandup() {
        return this._bStandUp
    }

    //离座表现
    left(){
        this.node.active = false;
        this._userInfoCmp.showReadyTip(false);

        for (const node of this.exNodeList) {
            node.active = this.node.active;
        }
    }
}