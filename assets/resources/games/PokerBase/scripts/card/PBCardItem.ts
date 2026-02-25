import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import { PBCardSuitType, PBCardVo } from "./PBCardData";

const { ccclass, property } = cc._decorator;

/**
 * 一张牌
 */
@ccclass
export class PBCardItem extends cc.Component {
    holder: cc.Node = null;              // 内容持有节点
    iconVal: NetImg = null;             // 牌字
    iconSuitSmall: NetImg = null;       // 花色-小
    iconSuitBig: NetImg = null;         // 花色-大
    special_suit: NetImg = null;        // 特殊花色
    bg_front: cc.Node = null;           // 背景-白
    mask: cc.Node = null;               // 遮罩-选择中
    mask_selected: cc.Node = null;      // 遮罩-已经选择
    fullCard: NetImg = null;            // 完整的牌 如果有完整的牌资源则 不需要 iconVal iconSuitSmall iconSuitBig
    group_falg: cc.Node = null;          // 牌组标记
    effect_pos: cc.Node = null;          // 有效坐标
    cardBack: NetImg = null;            // 牌背面

    isLoaded: boolean = false;
    selected: boolean = false;
    cardVo: PBCardVo = null;
    selectSpace: number = 40;
    holderY: number = 0;
    _skin = "poker_face_0";

    private _touchOffsetX = 0;
    public get touchOffsetX() {
        return this._touchOffsetX;
    }
    public set touchOffsetX(value) {
        this._touchOffsetX = value;
    }

    private _touchOffsetY = 0;
    public get touchOffsetY() {
        return this._touchOffsetY;
    }
    public set touchOffsetY(value) {
        this._touchOffsetY = value;
    }


    onLoad() {
        this.initView();
        this.refreshView();
    }

    /**
     * 初始化ui
     */
    initView() {
        this.holder = this.node.getChildByName("holder");
        this.holderY = this.holder.y;
        this.bg_front = this.holder.getChildByName("bg_front");
        let iconValNode = this.holder.getChildByName("icon_number");
        this.iconVal = iconValNode && iconValNode.getComponent(NetImg);
        let iconSuitSmallNode = this.holder.getChildByName("icon_suit_small");
        this.iconSuitSmall = iconSuitSmallNode && iconSuitSmallNode.getComponent(NetImg);
        let iconSuitBigNode = this.holder.getChildByName("icon_suit_big");
        this.iconSuitBig = iconSuitBigNode && iconSuitBigNode.getComponent(NetImg);
        let specialSuitNode = this.holder.getChildByName("special_suit");
        this.special_suit = specialSuitNode && specialSuitNode.getComponent(NetImg);
        this.mask = this.holder.getChildByName("mask");
        this.mask_selected = this.holder.getChildByName("mask_selected");
        let fullCardNode = this.holder.getChildByName("full_card")
        this.fullCard = fullCardNode && fullCardNode.getComponent(NetImg);
        this.group_falg = this.holder.getChildByName("group_falg");
        this.effect_pos = this.node.getChildByName("effect_pos");
        let card_back = this.node.getChildByName("card_back");
        this.cardBack = card_back && card_back.getComponent(NetImg);
        // this.cardBack && (this.cardBack.node.active = false);
        this.isLoaded = true;
    }

    /**
     * 显示遮罩
     * @param boo 
     */
    showMask(boo: boolean) {
        if (!this.isLoaded) {
            return;
        }
        this.mask.active = boo;
    }

    /**
     * 是否显示牌背
     * @param boo 
     */
    showCardBack(boo: boolean) {
        let card_back = this.node.getChildByName("card_back");
        if (card_back) {
            card_back.active = boo;
        }
    }

    bind(cardVal: number) {
        this.cardVo = this.genCardVo(cardVal);
        this.refreshView();
    }

    genCardVo(cardVal: number) {
        return new PBCardVo().initByRawValue(cardVal);
    }

    refreshView() {
        if (!this.isLoaded) {
            return;
        }
        if (!this.cardVo) {
            return;
        }
        this.cardBack && (this.cardBack.node.active = false)
        if (this.fullCard) {
            if (this.cardVo.value > 10 && this.cardVo.value < 14 || this.cardVo.suit == PBCardSuitType.king) {
                this.fullCard.url = this.cardVo.raw + this.skin;
            } else {
                this.fullCard.url = this.cardVo.raw + "";
            }
        } else {
            if (this.cardVo.suit == PBCardSuitType.king) {
                this.iconVal && (this.iconVal.node.active = false);
                this.iconSuitSmall && (this.iconSuitSmall.node.active = false);
                this.iconSuitBig && (this.iconSuitBig.node.active = false);
                if (this.special_suit) {
                    this.special_suit.node.active = true;
                    this.special_suit.url = `${this.cardVo.raw}${this.skin}`;
                }
            } else {
                if (this.iconVal) {
                    this.iconVal.node.active = true;
                    this.iconVal.url = (this.cardVo.isRed() ? "num_red_" : "num_black_") + (this.cardVo.value === 1 ? 14 : this.cardVo.value);
                }
                if (this.iconSuitSmall) {
                    this.iconSuitSmall.node.active = true;
                    this.iconSuitSmall.url = `suit_small_${this.cardVo.suit}`;
                }

                if (cc.vv && cc.vv.gameData && [255, 291, 293].indexOf(cc.vv.gameData.getGameId()) >= 0) {  // 21点
                    this.special_suit && (this.special_suit.node.active = false);
                    if (this.iconSuitBig) {
                        this.iconSuitBig.node.active = true;
                        this.iconSuitBig.url = `suit_big_${this.cardVo.suit}`;
                    }
                } else {
                    if (this.cardVo.value > 10 && this.cardVo.value < 14) {
                        this.iconSuitBig && (this.iconSuitBig.node.active = false);
                        if (this.special_suit) {
                            this.special_suit.node.active = true;
                            this.special_suit.url = `${this.cardVo.raw}${this.skin}`;
                        }
                    } else {
                        this.special_suit && (this.special_suit.node.active = false);
                        if (this.iconSuitBig) {
                            this.iconSuitBig.node.active = true;
                            this.iconSuitBig.url = `suit_big_${this.cardVo.suit}`;
                        }
                    }
                }

            }
        }
    }

    /**
     * 设置选择状态
     * @param boo 
     * @param space 
     */
    setSelect(boo: boolean, ani = true, updateSelectData = true) {
        if (updateSelectData) {
            this.selected = boo;
            this.mask_selected && (this.mask_selected.active = boo);
        }
        let selectTw = this.holder["selectTw"];
        let unSelectTw = this.holder["unSelectTw"];
        if (boo) {
            if (ani) {
                unSelectTw && unSelectTw.stop();
                selectTw = cc.tween(this.holder)
                    .to(0.2, { y: this.holderY + this.selectSpace }, { easing: "quartOut" })
                    .call(() => {
                        this.holder["selectTw"] = null;
                    })
                    .start();
                this.holder["selectTw"] = selectTw;
            } else {
                if (!selectTw) {
                    this.holder.y = this.holderY + this.selectSpace;
                }
            }
        } else {
            selectTw && selectTw.stop();
            if (ani) {
                unSelectTw = cc.tween(this.holder)
                    .to(0.2, { y: this.holderY }, { easing: "quartOut" })
                    .call(() => {
                        this.holder["unSelectTw"] = null;
                    })
                    .start();
                this.holder["unSelectTw"] = unSelectTw;
            } else {
                if (!unSelectTw) {
                    this.holder.y = this.holderY;
                }
            }
        }
    }

    /**
     * 显示组标记
     */
    showGroupFlag(boo: boolean, id = 0) {
        if (!this.group_falg) {
            return;
        }
        if (boo) {
            this.group_falg.active = true;
            this.group_falg.getComponent(ImgSwitchCmpTS).setIndex(id % 2);
        } else {
            this.group_falg.active = false;
        }
    }

    /**
     * 有效坐标点
     */
    showEffectPos(boo: boolean) {
        if (!this.effect_pos) {
            return;
        }
        this.effect_pos.active = boo;
    }

    /**
     * 作用点全局坐标
     */
    getEffectPosGlobalPos() {
        return this.effect_pos.convertToWorldSpaceAR(cc.v2(0, 0));
    }

    get skin() {
        return this._skin;
    }
    set skin(skin: string) {
        if (!skin) {
            return;
        }
        if (skin == "poker_face_000") {
            skin = "poker_face_0";
        }
        if (this._skin != skin) {
            this._skin = skin;
            if (this.isLoaded) {
                this.refreshView();
            }
        }
    }

    /**
     * 切换到按下状态
     */
    toTouchState(boo = true, scale = 1.2, aniTime = 0.2) {
        if (this.node["disableAutoOut"]) {
            aniTime += 0.35;
        }
        let touchStateTw = this.holder["touchStateTw"];
        let untouchStateTw = this.holder["untouchStateTw"];
        if (boo) {
            untouchStateTw && untouchStateTw.stop();
            // if(this.holder.scaleX == 1 || this.holder.scaleY == 1) {
            touchStateTw = cc.tween(this.holder)
                .to(aniTime, { scaleX: scale, scaleY: scale }, { easing: "quartOut" })
                .call(() => {
                    this.holder["touchStateTw"] = null;
                })
                .start();
            this.holder["touchStateTw"] = touchStateTw;
            // }
        } else {
            touchStateTw && touchStateTw.stop();
            // if(this.holder.scaleX != 1 || this.holder.scaleY != 1) {
            untouchStateTw = cc.tween(this.holder)
                .to(aniTime, { scaleX: 1, scaleY: 1 }, { easing: "quartOut" })
                .call(() => {
                    this.holder["untouchStateTw"] = null;
                })
                .start();
            this.holder["untouchStateTw"] = untouchStateTw;
            // }
        }

    }
}