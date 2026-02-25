import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import { facade } from "../PBLogic";
import { PBInteractiveEmotionPanel } from "./PBInteractiveEmotionPanel";

const { ccclass, property } = cc._decorator;

/**
 * 表情配置
 */
export let InteractiveEmotionCfg = new Map([
    ["1", { icon: "icon_1", canTimes: true, diamond: 0, coin: 1000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_1", flyTime: 1, angle: -360 * 2 }, endAni: { node: "normal_1", animation: "1_rtx", }, sound: "interactive/ani_slipper" }], // 拖鞋
    ["2", { icon: "icon_2", canTimes: true, diamond: 0, coin: 1000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_2", flyTime: 0.7, angle: 0 }, endAni: { node: "normal_1", animation: "4_sh", }, sound: "interactive/ani_rose" }], // 啤酒
    ["3", { icon: "icon_3", canTimes: true, diamond: 0, coin: 1000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_3", flyTime: 0.6, angle: -360 }, endAni: { node: "normal_1", animation: "3_rll", }, sound: "interactive/ani_durian" }], // 榴莲
    ["4", { icon: "icon_4", canTimes: true, diamond: 0, coin: 2000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_4", flyTime: 1, angle: -360 * 2 }, endAni: { node: "normal_1", animation: "5_rjd", }, sound: "interactive/ani_egg" }], // 鸡蛋
    ["5", { icon: "icon_5", canTimes: true, diamond: 0, coin: 2000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_5", flyTime: 0.8, angle: 0 }, endAni: { node: "normal_1", animation: "7_KISS", }, sound: "interactive/ani_kiss" }], // kiss
    ["6", { icon: "icon_6", canTimes: true, diamond: 0, coin: 2000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_6", flyTime: 0.15, cnt: 7, angle: 0 }, endAni: { node: "normal_1", animation: "6_sq", }, sound: "interactive/ani_money" }], // 纸币
    ["7", { icon: "icon_7", canTimes: false, diamond: 0, coin: 0, isVipEmoj: true, vipLevel: 0, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_7", flyTime: 0.5, angle: 0 }, endAni: { node: "normal_2", animation: "1_sz", }, sound: "interactive/ani_brush" }], // 墙刷
    ["8", { icon: "icon_8", canTimes: false, diamond: 0, coin: 0, isVipEmoj: true, vipLevel: 5, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_8", flyTime: 1, angle: 0 }, endAni: { node: "normal_2", animation: "2_gp", }, sound: "interactive/ani_rose" }], // 酒杯
    ["9", { icon: "icon_9", canTimes: false, diamond: 0, coin: 0, isVipEmoj: true, vipLevel: 7, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_9", flyTime: 0.8, angle: -360 * 2 }, endAni: { node: "normal_2", animation: "3_zd", }, sound: "interactive/ani_bomb" }], // 炸弹
    ["10", { icon: "icon_10", canTimes: false, diamond: 0, coin: 0, isVipEmoj: true, vipLevel: 9, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_10", flyTime: 0.6, angle: 0 }, endAni: { node: "normal_2", animation: "5_st", }, sound: "interactive/ani_labber", needChangeDirection: true }], // 水桶
    ["11", { icon: "icon_11", canTimes: false, diamond: 0, coin: 0, isVipEmoj: true, vipLevel: 11, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_11", flyTime: 0.6, angle: 0 }, endAni: { node: "normal_2", animation: "6_ax", }, sound: "interactive/ani_love" }], // 爱心
    ["12", { icon: "icon_12", canTimes: false, diamond: 0, coin: 0, isVipEmoj: true, vipLevel: 12, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_12", flyTime: 0.2, cnt: 3, angle: 0 }, endAni: { node: "normal_2", animation: "4_zj", }, sound: "interactive/ani_gold" }], // 金砖
    ["16", { icon: "icon_16", canTimes: true, hasCharm: 1, diamond: 0, coin: 25000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_16", flyTime: 0.7, angle: 0 }, endAni: { node: "vip_dianxin", animation: "chuxian" }, sound: "interactive/gaodian" }], // 点心
    ["17", { icon: "icon_17", canTimes: true, hasCharm: 1, diamond: 0, coin: 30000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_17", flyTime: 0.7, angle: 0 }, endAni: { node: "vip_shuiyan", animation: "animation", }, sound: "interactive/shuiyan" }], // 水烟
    ["18", { icon: "icon_18", canTimes: true, hasCharm: 1, diamond: 0, coin: 50000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_18", flyTime: 0.7, angle: 0 }, endAni: { node: "vip_hongcha", animation: "ruchang", }, sound: "interactive/hongcha" }], // 红茶
    ["14", { icon: "icon_14", canTimes: true, hasCharm: 1, diamond: 0, coin: 100000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_14", flyTime: 0.7, angle: 0 }, endAni: { node: "kiss", animation: "feiwen", scale: 0.5 }, sound: "interactive/gift_kiss" }], // kiss
    ["15", { icon: "icon_15", canTimes: true, hasCharm: 1, diamond: 0, coin: 250000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_15", flyTime: 0.7, angle: 0 }, endAni: { node: "ring", animation: "shouzhuo", scale: 0.5 }, sound: "interactive/gift_ring" }], // ring
    ["13", { icon: "icon_13", canTimes: true, hasCharm: 1, diamond: 0, coin: 500000, isVipEmoj: false, cd: 15, flyAni: { node: "fly", type: "img", icon: "icon_13", flyTime: 0.7, angle: 0 }, endAni: { node: "card", animation: "animation", scale: 0.5 }, sound: "interactive/gift_car" }], // 车
])

/**
 * 互动表情控制
 */
@ccclass
export class PBInteractiveCtrl extends cc.Component {
    @property(cc.Node)
    emotion_item: cc.Node = null;
    @property(PBInteractiveEmotionPanel)
    emotionPanel: PBInteractiveEmotionPanel = null;

    /**
     * 播放表情动画
     */
    playerEmotion(emotionId: number, fromUid: number, toUid: number) {
        //如果找不到目标用户，就不播放
        let endPlayer = this.getPlayer(toUid);
        if (!endPlayer) return

        let startGlobalPos = this.getPlayerPos(fromUid, "interactive_emotion_pos");
        let node = cc.instantiate(this.emotion_item);
        node.active = true;
        node.parent = this.node;
        node.setPosition(this.node.convertToNodeSpaceAR(startGlobalPos));
        let endPos = this.getPlayerPos(toUid, "interactive_emotion_pos");//facade.playersCtrl.getPlayerByUid(toUid).getGlobalPos("interactive_emotion_pos");
        endPos = node.convertToNodeSpaceAR(endPos);

        let itemCfg = InteractiveEmotionCfg.get(`${emotionId}`);
        let flyNode = node.getChildByName(itemCfg.flyAni.node);
        flyNode.active = true;
        flyNode.getComponent(NetImg).url = itemCfg.flyAni.icon;


        // cc.log(endPlayer.getNeedChangeInteractiveUIIndex(), endPlayer.uiIndex);

        this.playEmotionSound(itemCfg.sound)

        cc.tween(flyNode)
            .to(itemCfg.flyAni.flyTime, { x: endPos.x, y: endPos.y, angle: itemCfg.flyAni.angle }, { easing: "quadIn" })
            .call(() => {
                flyNode.active = false;
                let spine = node.getChildByName(itemCfg.endAni.node).getComponent(sp.Skeleton);
                spine.node.active = true;
                if (itemCfg.endAni.scale) {
                    spine.node.scale = itemCfg.endAni.scale;
                }
                spine.node.setPosition(endPos);
                spine.setAnimation(0, itemCfg.endAni.animation, false);
                if (itemCfg.needChangeDirection && endPlayer.getNeedChangeInteractiveUIIndex && endPlayer.getNeedChangeInteractiveUIIndex().includes(endPlayer.uiIndex)) {
                    spine.node.scaleX = -1;
                }
                spine.setCompleteListener(() => {
                    spine.setCompleteListener(null);
                    node.removeFromParent();
                })
            })
            .start();
        if (itemCfg.flyAni.cnt) {
            for (let i = 0; i < itemCfg.flyAni.cnt - 1; i++) {
                let fn = cc.instantiate(flyNode);
                fn.parent = flyNode.parent;
                fn.active = true;
                fn.x = fn.y = 0;
                cc.tween(fn)
                    .delay(itemCfg.flyAni.flyTime * (i + 1))
                    .to(itemCfg.flyAni.flyTime, { x: endPos.x, y: endPos.y, angle: itemCfg.flyAni.angle }, { easing: "quadIn" })
                    .call(() => {
                        fn.active = false;
                    })
                    .start();
            }
        }
    }

    /**
     * 打开互动表情弹窗
     */
    openEmotionPanel(uid: number) {
        if (!this.emotionPanel) {
            return;
        }
        let startPos = this.getPlayerPos(uid, "interactive_panel_pos");
        this.emotionPanel.open(uid, startPos);
    }

    /**
     * 获取玩家节点位置
     * @param uid 
     * @param posKey 
     * @returns 
     */
    getPlayerPos(uid, posKey) {
        return this.getPlayer(uid).getGlobalPos(posKey)
    }

    getPlayer(uid) {
        return facade.playersCtrl.getPlayerByUid(uid)
    }

    playEmotionSound(url) {
        facade.soundMgr.playBaseEffect(url);
    }
}