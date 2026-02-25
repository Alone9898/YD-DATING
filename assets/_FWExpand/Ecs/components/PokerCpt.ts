import { PBCardItem } from "../../../resources/games/PokerBase/scripts/card/PBCardItem";
import PokerLayoutCpt from "./PokerLayoutCpt";

const { ccclass, property } = cc._decorator;


// 方 0x0102, 0x0103, 0x0104, 0x0105, 0x0106, 0x0107, 0x0108, 0x0109, 0x010A, 0x010B, 0x010C, 0x010D, 0x010E, 
// 梅 0x0202, 0x0203, 0x0204, 0x0205, 0x0206, 0x0207, 0x0208, 0x0209, 0x020A, 0x020B, 0x020C, 0x020D, 0x020E,
// 红 0x0302, 0x0303, 0x0304, 0x0305, 0x0306, 0x0307, 0x0308, 0x0309, 0x030A, 0x030B, 0x030C, 0x030D, 0x030E,
// 黑 0x0402, 0x0403, 0x0404, 0x0405, 0x0406, 0x0407, 0x0408, 0x0409, 0x040A, 0x040B, 0x040C, 0x040D, 0x040E

/*
{
	0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,
	0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,
	0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D,
	0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D
}
*/

export enum POKER_EVENT {
	NEW = "POKER_EVENT_NEW",
	CLICK = "POKER_EVENT_CLICK",
	DRAG_START = "POKER_EVENT_DRAG_START",
	DRAG_MOVE = "POKER_EVENT_DRAG_MOVE",
	DRAG_CANCEL = "POKER_EVENT_DRAG_CANCEL",
}

@ccclass
export default class PokerCpt extends cc.Component {
	@property
	key: string = '';


	private cardCpt: PBCardItem;
	// @property(cc.SpriteAtlas)
	// pokerAtlas: cc.SpriteAtlas = null;

	// @property(cc.Node)
	fortNode: cc.Node = null;

	// @property(cc.Node)
	backNode: cc.Node = null;

	// @property(cc.Sprite)
	// cardBg: cc.Sprite = null;
	// @property(cc.Sprite)
	// cardLight: cc.Sprite = null;
	// @property(cc.Sprite)
	// cardStar: cc.Sprite = null;
	// @property(cc.Sprite)
	cardDark: cc.Node = null;
	// @property(cc.Sprite)
	// cardValue: cc.Sprite = null;
	// @property(cc.Sprite)
	// cardJoker: cc.Sprite = null;
	// @property(cc.Sprite)
	// cardVarietyBig: cc.Sprite = null;
	// @property(cc.Sprite)
	// cardVarietySmall: cc.Sprite = null;

	@property(cc.AudioSource)
	flySound: cc.AudioSource = null;
	@property(cc.AudioSource)
	flipSound: cc.AudioSource = null;

	// 牌所属牌组
	layout: PokerLayoutCpt = null;
	//仅仅用来显示十六进制数据
	@property({
		// type: cc.String,
		readonly: true,
	})
	uintStr: string = '0x030E';
	@property(cc.Integer)
	_uint = 0;


	@property(cc.String)
	get uint() {
		return this._uint;
	}
	set uint(value: any) {
		this._uint = value;
		this.cardCpt.bind(value);
		this.cardCpt.showCardBack(value == 0);
	}
	// 牌值
	get value() {
		return this.cardCpt.cardVo.value;
	}
	// 花色
	get variety() {
		return this.cardCpt.cardVo.suit;
	}

	@property(cc.Boolean)
	_isLight = false;
	@property(cc.Boolean)
	get isLight() {
		return this._isLight;
	}
	set isLight(value) {
		this._isLight = value;
		let lightNode = cc.find("light", this.node);
		if (lightNode) lightNode.active = value;
	}
	//是否是正面状态
	@property(cc.Boolean)
	_isFront = false;
	@property(cc.Boolean)
	get isFront() {
		return this._isFront;
	}
	set isFront(value) {
		this._isFront = value;
		this.backNode.active = !value;
		// this.cardCpt.showCardBack(!value);
	}

	// 牌是否被选中
	isSelect: Boolean = false;
	private _canSelect = false;
	set canSelect(value) {
		this._canSelect = value;
		// 开启事件监听
		if (value) {
			this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
			this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
			this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
			this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
		} else {
			this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
			this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
			this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
			this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
		}
	}
	get canSelect() {
		return this._canSelect;
	}
	onTouchStart(event: cc.Event.EventTouch) {
	}
	onTouchMove(event: cc.Event.EventTouch) {
		if (event.getLocation().sub(event.getStartLocation()).magSqr() > 64) {
			Global.dispatchEvent(POKER_EVENT.DRAG_MOVE, event);
		} else {
			Global.dispatchEvent(POKER_EVENT.DRAG_CANCEL, event);
		}
	}
	onTouchEnd(event: cc.Event.EventTouch) {
		// 判断
		if (event.getLocation().sub(event.getStartLocation()).magSqr() < 64) {
			// 点击结束
			this.isSelect = !this.isSelect;
			Global.dispatchEvent(POKER_EVENT.CLICK, event);
		} else {
			// 拖拽结束
			Global.dispatchEvent(POKER_EVENT.DRAG_CANCEL, event);
		}
	}
	// 牌的颜色
	private _color: cc.Color = cc.Color.WHITE;
	set color(value) {
		this._color = value;
		if (value) {
			this.node.getChildByName("card_back").color = value;
		} else {
			this.node.getChildByName("card_back").color = cc.Color.WHITE;
		}
	}
	get color() {
		return this._color;
	}


	private _isShowStar: boolean;
	set isShowStar(value) {
		this._isShowStar = value;
		// if (this.cardStar) {
		// 	this.cardStar.node.active = value;
		// }
	}
	get isShowStar() {
		return this._isShowStar;
	}
	@property(cc.Boolean)
	private _dark: boolean = false;
	@property(cc.Boolean)
	set dark(value) {
		this._dark = value;
		if (this.cardDark) {
			this.cardDark.active = value;
		}
	}
	get dark() {
		return this._dark;
	}

	private _special: boolean = false;
	set special(value) {
		this._special = value;
		// if (value) {
		// 	this.cardBg.spriteFrame = this.pokerAtlas.getSpriteFrame('card_front_bg_2');
		// } else {
		// 	this.cardBg.spriteFrame = this.pokerAtlas.getSpriteFrame('card_front_bg');
		// }
	}
	get special() {
		return this._special;
	}

	private _isJoker: boolean = false;
	set isJoker(value) {
		this._isJoker = value;
		// if (value) {
		// 	this.cardBg.spriteFrame = this.pokerAtlas.getSpriteFrame('card_front_bg_joker');
		// } else {
		// 	this.cardBg.spriteFrame = this.pokerAtlas.getSpriteFrame('card_front_bg');
		// }
	}
	get isJoker() {
		return this._isJoker;
	}


	private _flip: boolean;
	public get flip(): boolean {
		return this._flip;
	}
	public set flip(v: boolean) {
		this._flip = v;
		this.fortNode.stopAllActions();
		this.backNode.stopAllActions();
		if (v) {
			this._isFront = !this._isFront;
			let flipNode1;
			let flipNode2;
			if (this._isFront) {
				flipNode1 = this.backNode;
				flipNode2 = this.fortNode;
			} else {
				flipNode1 = this.fortNode;
				flipNode2 = this.backNode;
			}
			flipNode1.active = true;
			flipNode1.scaleX = 1;
			flipNode2.active = true;
			flipNode2.scaleX = 0;
			cc.tween(flipNode1)
				.to(0.08, { scaleX: 0 })
				.then(cc.tween(flipNode2).to(0.08, { scaleX: 1 }))
				.call(() => {
					this.flip = false;
					this.isFront = this._isFront;
				}).start()
		} else {
			this.fortNode.scaleX = 1;
			this.fortNode.scaleY = 1;
			this.backNode.scaleX = 1;
			this.backNode.scaleY = 1;
			this.isFront = this._isFront;
		}
	}

	// 归属于哪一个组合
	groupId = -1;

	onLoad() {
		this.fortNode = cc.find("holder", this.node);
		this.backNode = cc.find("card_back", this.node);
		this.cardDark = cc.find("card_drak", this.node);
	}

	init() {
		this.cardCpt = this.getComponent(PBCardItem);
		this.dark = false;
		this.isFront = false;
	}

	playFlipSound() {
		if (this.flipSound) {
			this.flipSound.play();
		}
	}

	playFlySound() {
		if (this.flySound) {
			this.flySound.play();
		}
	}
}
