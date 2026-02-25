import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import UserAvatar from "../../../../../BalootClient/game_common/common_cmp/UserAvatar";
import { SyncReqest } from "../../../../../BalootClient/game_common/net/WSReqest";
import { PBChatMsgType } from "../chat/PBChatData";
import { PBPostCmd } from "../net/PBMsgCmd";
import { PBRoomType } from "../PBCommonData";
import { PBEvent } from "../PBEvent";
import { facade } from "../PBLogic";
import { showErrorInfo } from "../PBUtils";
import { InteractiveEmotionCfg } from "./PBInteractiveCtrl";

const { ccclass, property } = cc._decorator;

/**
 * 互动表情
 */
@ccclass
export class PBInteractiveEmotionPanel extends cc.Component {
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Node)
    block_node: cc.Node = null;
    @property(cc.Button)
    btn_profire: cc.Button = null;
    @property(cc.Node)
    item_template: cc.Node = null;
    @property(cc.Node)
    emotion_container: cc.Node = null;

    uid: number = 0;
    _emotions: cc.Node[] = null;
    _timesEmotions: cc.Node[] = null;
    _timesEmotionData: Map<number, number> = null; // 可使用次数表情数据

    onLoad() {
        this.panel.active = false;
    }

    protected start(): void {
        if (this.block_node) {
            this.block_node.on(cc.Node.EventType.TOUCH_END, () => {
                this.close();
            }, this);
        }

        this._emotions = [];
        this._timesEmotions = [];
        let configIdArr = Array.from(InteractiveEmotionCfg.keys());

        let hideGlobalGift = Global.isSingle() || Global.isYDApp();
        if (hideGlobalGift) {
            configIdArr = configIdArr.filter(id => { return Number(id) <= 12; });
        }
        // let propCount = hideGlobalGift ? 12 : 18;
        cc.find("panel/bg", this.node).height = hideGlobalGift ? 540 : 700;
        cc.find("panel/bg", this.node).y += hideGlobalGift ? 80 : 0;

        for (let _id of configIdArr) {
            let id = Number(_id);
            let itemCfg = InteractiveEmotionCfg.get(`${id}`);
            if (!itemCfg) {
                continue;
            }
            let node = cc.instantiate(this.item_template);
            node.active = true;
            node.parent = this.emotion_container;
            let icon = cc.find("icon", node).getComponent(NetImg);
            icon.url = itemCfg.icon;
            let coin = cc.find("coin", node);
            let vip = cc.find("vip", node);
            let diamond = cc.find("diamond", node);
            let times = cc.find("times", node);
            times.active = false;
            if (itemCfg.coin) {
                coin.active = true;
                vip.active = false;
                diamond.active = false;
                let nPrice = this.getItemPrice(id)
                if (nPrice == null) { //没有服务端的价格就用客户端配置
                    nPrice = itemCfg.coin
                }
                if (nPrice > 0) {
                    cc.find("icon_gold", coin).active = true;
                    cc.find("label", coin).x = 17;
                    cc.find("label", coin).getComponent(cc.Label).string = "" + Global.formatNumShort(nPrice);
                } else {
                    cc.find("icon_gold", coin).active = false;
                    cc.find("label", coin).x = 0;
                    cc.find("label", coin).getComponent(cc.Label).string = ___("free");
                }
            } else if (itemCfg.isVipEmoj) {
                coin.active = false;
                vip.active = true;
                diamond.active = false;
                vip.getComponent(ImgSwitchCmpTS).showSpriteByName(`vip${itemCfg.vipLevel}`);
                // vip.getChildByName("lock_mask").active = facade.dm.playersDm.selfAbsInfo.svip <= itemCfg.vipLevel;
                vip.getChildByName("lock_mask").active = cc.vv.UserManager.svip <= itemCfg.vipLevel;
            } else if (itemCfg.diamond) {
                coin.active = false;
                vip.active = false;
                diamond.active = true;
                cc.find("label", diamond).getComponent(cc.Label).string = "" + itemCfg.diamond;
            }
            let cd = cc.find("cd", node);
            cd.active = false;
            let cdProgress = cc.find("progress", cd).getComponent(cc.ProgressBar);
            cdProgress.progress = 1;

            node["id"] = id;
            node["cd"] = cd;
            node["cdProgress"] = cdProgress;

            node.on(cc.Node.EventType.TOUCH_END, () => {
                if (node["cd"].active) {
                    return;
                }
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                this.close();
                this.sendEmotion(node["id"]);
            }, this);
            this._emotions.push(node);
            itemCfg.canTimes && this._timesEmotions.push(node);

        }

        if (Global.isYDApp() && CC_BUILD) {
            this.btn_profire.node.active = false;
        }
        this.btn_profire.node.on("click", () => {
            this.close();
            cc.vv.PopupManager.addPopup("BalootClient/UserInfo/PopupPersonalInfo", {
                opacityIn: true,
                onShow: (node) => {
                    let cpt = node.getComponent("PersonalInfo");
                    if (cpt) {
                        cpt.init(this.uid);
                    }
                }
            })
        }, this);
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.PERSIONAL_INFO, this.PERSIONAL_INFO, this);
        netListener.registerMsg(PBPostCmd.QUERY_TIMES_EMOTION_INFO, this.QUERY_TIMES_EMOTION_INFO, this);

        this._reqCharmInfo();
    }

    _reqCharmInfo() {
        if (facade.dm.playersDm && facade.dm.playersDm.selfAbsInfo) {
            cc.vv.NetManager.send({
                c: PBPostCmd.QUERY_TIMES_EMOTION_INFO,
                uid: facade.dm.playersDm && facade.dm.playersDm.selfAbsInfo.uid
            }, true);
        }
    }

    QUERY_TIMES_EMOTION_INFO(msg: any) {
        if (msg.code != 200 || !msg.data) {
            cc.log("次数道具数据出错", msg);
            return;
        }
        this._timesEmotionData = new Map();
        msg.data.forEach(element => {
            this._timesEmotionData.set(element.id, element.times);
        });
    }

    PERSIONAL_INFO(msg: any) {
        if (msg.code != 200) {
            return;
        }
        cc.log(msg);
        try {
            let p = this.getPlayerInfo(msg.playerInfo.uid)//facade.dm.playersDm.getPlayerByUid(msg.playerInfo.uid);
            if (p) {
                p.statisticsWinPlayCnt = msg.stat.online.total;
                p.statisticsWinRate = msg.stat.online.win_rate;
                p.uinfo.gender = msg.playerInfo.sex;
            }

            if (this.panel.active) {
                this._showUserInfo();
            }
        } catch (error) {
            cc.log(error);
        }
    }

    _reqPlayerInfo() {
        let p = this.getPlayerInfo(this.uid)//facade.dm.playersDm.getPlayerByUid(this.uid);
        if (!p || p.statisticsWinPlayCnt > 0) {
            return;
        }
        let param = { c: MsgId.PERSIONAL_INFO, otheruid: this.uid };
        // @ts-ignore
        let cacheObj = cc.vv.NetManager.getCacheObj(param);
        if (cacheObj && cacheObj.msg) {
            let msg = cacheObj.msg;
            p.uinfo.gender = msg.playerInfo.sex;
            p.statisticsWinPlayCnt = msg.stat.online.total;
            p.statisticsWinRate = msg.stat.online.win_rate;
            if (this.panel.active) {
                this._showUserInfo();
            }
        } else {
            // @ts-ignore
            cc.vv.NetManager.cache(param);
        }
    }

    /**
     * 发送表情
     */
    async sendEmotion(id: number) {
        let itemCfg = InteractiveEmotionCfg.get(`${id}`);
        let selfInfo = this.getMyInfo();
        if (!selfInfo.isSeated && !itemCfg.hasCharm) {
            cc.vv.FloatTip.show(___("您还没有坐下不能发送"));
            return;
        }
        if (itemCfg.isVipEmoj && selfInfo.svip <= itemCfg.vipLevel) {
            cc.vv.FloatTip.show(___("VIP等级不够"));
            return;
        }
        if (itemCfg.diamond) {
            let charmTimes = this._timesEmotionData && this._timesEmotionData.get(id);
            if (!charmTimes && cc.vv.UserManager.getDiamond() < itemCfg.diamond) {
                cc.vv.FloatTip.show(___("您的钻石不足"));
                return;
            }
        }
        if (itemCfg.coin) {
            let coinTimes = this._timesEmotionData && this._timesEmotionData.get(id);
            let nPrice = this.getItemPrice(id)
            if (nPrice == null) { //没有服务端的价格就用客户端配置
                nPrice = itemCfg.coin
            }

            if (!coinTimes && cc.vv.UserManager.coin < nPrice) {
                cc.vv.FloatTip.show(___("您的金币不足"));
                return;
            }

            // if(this.getDeskMinCoin() <  nPrice ){
            //     cc.vv.FloatTip.show(___("coins cannot be lower than the minimum room access"))
            //     return
            // }
        }

        let postParam = {
            c: PBPostCmd.USER_INTERACTIVE,
            uid: selfInfo.uid,
            id: id,
            min_coin: this.getDeskMinCoin(),
            frienduid: this.uid
        }
        let ret: any = await new SyncReqest().post(postParam);

        //sync超时了，不处理会出错
        if (!ret) return

        if (ret.spcode) {
            showErrorInfo(ret.spcode);
            return;
        }
        if (itemCfg.coin) {
            let coinTimes = this._timesEmotionData && this._timesEmotionData.get(id);
            if (coinTimes && coinTimes > 0) {
                this._timesEmotionData.set(id, coinTimes - 1);
            } else {
                selfInfo.coin = ret.coin;
                let roomType = this.getRoomType()
                if (roomType != PBRoomType.match) {
                    Global.dispatchEvent(PBEvent.USER_COIN_CHANGE, { uid: selfInfo.uid });
                }
            }
        } else if (itemCfg.hasCharm) {
            let charmTimes = this._timesEmotionData && this._timesEmotionData.get(id);
            if (charmTimes && charmTimes > 0) {
                this._timesEmotionData.set(id, charmTimes - 1);
            } else {
                //@ts-ignore
                cc.vv.UserManager.setDiamond(ret.diamond);
            }
        }

        if (itemCfg.hasCharm) {
            return;
        }

        let item = this._emotions[id - 1];
        item["lastSendTime"] = new Date().getTime();
        let param = {
            cmd: "interactive_emotion",
            emotionId: id,
            fromUid: selfInfo.uid,
            toUid: this.uid,
        };
        this.sendChatMsg(PBChatMsgType.diy, param)

    }

    /**
     * 显示用户信息
     */
    _showUserInfo() {
        let uinfo_node = cc.find("uinfo", this.panel);
        let p = this.getPlayerInfo(this.uid);// facade.dm.playersDm.getPlayerByUid(this.uid);
        if (!p) {
            this.close();
            return;
        }
        // 头像
        let avatar = cc.find("head_icon", uinfo_node).getComponent(UserAvatar);
        avatar.updataAvatar({ uid: p.uid, icon: (p.uinfo && p.uinfo.icon), avatarFrame: p.avatarFrame });
        // id
        let id = cc.find("id/label", uinfo_node).getComponent(cc.Label);
        let idStr = ___("ID");
        id.string = __(idStr, ":", p.uid);
        // 性别、名字
        let genderIcon = cc.find("name/gender_icon", uinfo_node).getComponent(ImgSwitchCmpTS);
        genderIcon.setIndex(p.uinfo.gender == 1 ? 1 : 0);
        let nameLable = cc.find("name/label", uinfo_node).getComponent(cc.Label);
        nameLable.string = p.uinfo.uname;
        // 金币
        let coinNode = cc.find("coin", uinfo_node);
        if (this.getTableInfo().roomType == PBRoomType.friend) {
            let coin = cc.find("coin/label", uinfo_node).getComponent(cc.Label);
            coin.string = `${Global.convertNumToShort(p.coin)}`;
        } else {
            coinNode.active = false;
        }
        if (Global.isYDApp() && CC_BUILD) {
            cc.find("id", uinfo_node).active = false;
            cc.find("name", uinfo_node).active = true;
            cc.find("name", uinfo_node).position = cc.v3(-280, 32)
            coinNode.active = false;
            genderIcon.node.active = false;
            nameLable.node.x = 0;
            nameLable.node.color = new cc.Color(255, 255, 255, 255);
            nameLable.fontSize = 40
        }
        // 局数
        let playCnt = cc.find("play_cnt/label", uinfo_node).getComponent(cc.Label);
        playCnt.string = `${p.statisticsWinPlayCnt}`;
        // 胜率
        let winRate = cc.find("win_rate/label", uinfo_node).getComponent(cc.Label);
        winRate.string = `${p.statisticsWinRate}%`;
    }

    /**
     * 更新表情cd状态
     */
    _updateEmojiCDState() {
        let currTime = new Date().getTime();
        if (!this._emotions) {
            return;
        }
        this._emotions.forEach(node => {
            let cdTime = InteractiveEmotionCfg.get(`${node["id"]}`).cd;
            let lastSendTime = node["lastSendTime"];
            if (lastSendTime && currTime - lastSendTime < cdTime * 1000) {
                let needCD = cdTime - (currTime - lastSendTime) / 1000;
                node["cd"].active = true;

                let progressBar = node["cdProgress"] as cc.ProgressBar;
                if (progressBar.node["tw"]) {
                    progressBar.node["tw"].stop();
                }
                progressBar.progress = needCD / cdTime;
                let tw = cc.tween(progressBar)
                    .to(needCD, { progress: 0 })
                    .call(() => {
                        node["cd"].active = false;
                    })
                    .start();
                progressBar.node["tw"] = tw;
            } else {
                node["cd"].active = false;
            }
        });
    }

    /**
     * 更新魅力值道具状态
     */
    _updateCharmEmotion() {
        if (!this._timesEmotionData) {
            this._reqCharmInfo();
            return;
        }
        if (!this._timesEmotions) {
            return;
        }
        this._timesEmotions.forEach(node => {
            let id = node["id"];
            let itemCfg = InteractiveEmotionCfg.get(`${id}`);
            cc.log(id, this._timesEmotionData);
            let cnt = this._timesEmotionData.get(id);
            let coin = cc.find("coin", node);
            let vip = cc.find("vip", node);
            let diamond = cc.find("diamond", node);
            let times = cc.find("times", node);
            if (cnt) {
                coin.active = false;
                vip.active = false;
                diamond.active = false;
                times.active = true;
                cc.find("label", times).getComponent(cc.Label).string = `X${cnt}`;
            } else {
                coin.active = false;
                vip.active = false;
                times.active = false;
                if (itemCfg.coin) {
                    coin.active = true;
                    let nPrice = this.getItemPrice(id)
                    if (nPrice == null) { //没有服务端的价格就用客户端配置
                        nPrice = itemCfg.coin
                    }
                    if (nPrice > 0) {
                        cc.find("icon_gold", coin).active = true;
                        cc.find("label", coin).x = 17;
                        cc.find("label", coin).getComponent(cc.Label).string = "" + Global.formatNumShort(nPrice);
                    } else {
                        cc.find("icon_gold", coin).active = false;
                        cc.find("label", coin).x = 0;
                        cc.find("label", coin).getComponent(cc.Label).string = ___("free");
                    }
                } else if (itemCfg.hasCharm) {
                    diamond.active = true;
                    cc.find("label", diamond).getComponent(cc.Label).string = "" + itemCfg.diamond;
                }
            }
        });
    }

    open(uid: number, globalPos: cc.Vec2) {
        this.uid = uid;
        this._showUserInfo();
        this._updateEmojiCDState();
        this._updateCharmEmotion();
        // this.panel.setPosition(this.panel.parent.convertToNodeSpaceAR(globalPos));
        CommonStyle.fastShow(this.panel);
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.close();
        }, 5);

        this._reqPlayerInfo();
    }

    close() {
        if (this.panel) {
            CommonStyle.fastHide(this.panel);
        }
    }

    //获取玩家信息
    getPlayerInfo(uid) {
        return facade.dm.playersDm.getPlayerByUid(uid)
    }

    getTableInfo() {
        return facade.dm.tableInfo
    }

    getMyInfo() {
        return facade.dm.playersDm.selfAbsInfo
    }

    sendChatMsg(type, param) {
        facade.sendRetransmissionMsg(type, JSON.stringify(param));
    }

    getItemPrice(id) {
        let nVal = null
        let list = cc.vv.UserManager.emotionProplist
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (id == list[i].id) {
                    nVal = list[i].coin
                    break;
                }
            }
        }
        return nVal
    }

    //获取房间最小准入
    getDeskMinCoin() {
        return cc.vv.gameData.deskInfo.conf.mincoin
    }

    getRoomType() {
        return cc.vv.gameData.deskInfo.conf.roomtype
    }
}